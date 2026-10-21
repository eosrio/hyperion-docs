import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceArg = process.argv.indexOf('--source');
const source = sourceArg >= 0 ? process.argv[sourceArg + 1] : process.env.HYPERION_SOURCE_ROOT;
if (!source) throw new Error('Pass --source <Hyperion checkout>. Builds use the committed exports.');
const commit = 'e1818923065d648a38009572d76badeab0684af1';
const repository = 'https://github.com/eosrio/hyperion-history-api';
const hashes = {};
const read = file => {
  const text = execFileSync('git', ['-C', source, 'show', `${commit}:${file}`], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
  hashes[file] = createHash('sha256').update(text).digest('hex'); return text;
};
const parse = (file, text) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
function collect(node, predicate, output = []) {if (predicate(node)) output.push(node); ts.forEachChild(node, child => {collect(child, predicate, output);}); return output;}
const helperText = read('src/api/helpers/functions.ts');
const helperAst = parse('helpers.ts', helperText);
const helpers = ['extendQueryStringSchema', 'extendResponseSchema'].map(name => collect(helperAst, node => ts.isFunctionDeclaration(node) && node.name?.text === name)[0].getText(helperAst).replace(/^export\s+/, '')).join('\n');
function evaluate(expression, globals = {}, declarations = new Map(), resolving = new Set()) {
  const code = ts.transpileModule(`(() => {${helpers}\nreturn (${expression});})()`, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None}}).outputText;
  for (let attempt = 0; attempt < 20; attempt++) {
    try {return JSON.parse(JSON.stringify(new vm.Script(code).runInNewContext(globals, {timeout: 1000})));}
    catch (error) {
      const name = error.message.match(/^(\w+) is not defined$/)?.[1];
      if (!name || !declarations.has(name) || resolving.has(name)) throw error;
      globals[name] = evaluate(declarations.get(name), globals, declarations, new Set([...resolving, name]));
    }
  }
  throw new Error('Schema dependency resolution exceeded its bound');
}
const esc = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('{', '&#123;').replaceAll('}', '&#125;');
const globals = {};
const actionAst = parse('actions.ts', read('src/api/routes/v2-history/get_actions/index.ts'));
const actionSchema = collect(actionAst, node => ts.isVariableDeclaration(node) && node.name.getText(actionAst) === 'getActionResponseSchema')[0];
globals.getActionResponseSchema = evaluate(actionSchema.initializer.getText(actionAst));
const shared = {};
const sharedFunction = collect(helperAst, node => ts.isFunctionDeclaration(node) && node.name?.text === 'addSharedSchemas')[0];
for (const call of collect(sharedFunction, node => ts.isCallExpression(node) && node.expression.getText(helperAst) === 'fastify.addSchema')) {
  const schema = evaluate(call.arguments[0].getText(helperAst)); shared[schema.$id] = schema;
}
function portable(value) {
  if (Array.isArray(value)) return value.map(portable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== '$id').map(([key, item]) => [key, key === '$ref' && typeof item === 'string' && /^[A-Za-z]+#$/.test(item) ? `#/components/schemas/${item.slice(0, -1)}` : portable(item)]));
}
const files = execFileSync('git', ['-C', source, 'ls-tree', '-r', '--name-only', commit, 'src/api/routes'], {encoding: 'utf8'}).trim().split('\n').filter(file => file.endsWith('/index.ts')).sort();
const records = []; const paths = {};
const slugOverrides = {'/v2/history/get_actions': 'get-actions', '/v2/state/get_account': 'get-account', '/v2/history/get_transaction': 'get-transaction'};
const prefixes = {'v2': '/v2', 'v2-history': '/v2/history', 'v2-state': '/v2/state', 'v2-stats': '/v2/stats', 'v1-history': '/v1/history', 'v1-trace': '/v1/trace_api', 'v1-chain': '/v1/chain'};
for (const file of files) {
  const ast = parse(file, read(file));
  const declarations = new Map(collect(ast, ts.isVariableDeclaration).filter(node => node.initializer).map(node => [node.name.getText(ast), node.initializer.getText(ast)]));
  const [family, name] = file.slice('src/api/routes/'.length).split('/');
  if (!prefixes[family]) throw new Error(`Unknown registered route family ${family}`);
  const route = `${prefixes[family]}/${name}`;
  const calls = collect(ast, node => ts.isCallExpression(node) && ['addApiRoute', 'addChainApiRoute'].includes(node.expression.getText(ast)));
  if (!calls.length) throw new Error(`Unaccounted route source: ${file}`);
  for (const call of calls) {
    let definitions;
    if (call.expression.getText(ast) === 'addChainApiRoute') {
      const description = evaluate(call.arguments[2].getText(ast), {...globals}, declarations);
      const properties = call.arguments[3] ? evaluate(call.arguments[3].getText(ast), {...globals}, declarations) : undefined;
      const required = call.arguments[4] ? evaluate(call.arguments[4].getText(ast), {...globals}, declarations) : undefined;
      const object = {type: 'object', properties, required};
      definitions = ['GET', 'POST'].map(method => ({method, schema: {description, summary: description, tags: ['chain'], [method === 'GET' ? 'querystring' : 'body']: properties ? method === 'GET' ? object : {anyOf: [object, {type: 'string'}]} : {}}, proxied: true}));
    } else {
      const methods = evaluate(call.arguments[1].getText(ast));
      const schema = evaluate(call.arguments[4].getText(ast), {...globals}, declarations);
      definitions = (Array.isArray(methods) ? methods : [methods]).map(method => ({method, schema, proxied: family === 'v1-chain'}));
    }
    for (const {method, schema, proxied} of definitions) {
      const operation = {operationId: `${method.toLowerCase()}_${family.replaceAll('-', '_')}_${name}`, summary: schema.summary || name, description: schema.description, tags: schema.tags || [family], parameters: Object.entries(schema.querystring?.properties || {}).map(([name, field]) => ({name, in: 'query', required: schema.querystring.required?.includes(name) || false, description: field.description, schema: portable(Object.fromEntries(Object.entries(field).filter(([key]) => key !== 'description')))})), responses: schema.response ? Object.fromEntries(Object.entries(schema.response).map(([status, body]) => [status, {description: 'Declared response', content: {'application/json': {schema: portable(body)}}}])) : {'200': {description: 'Response shape is not declared here; inspect the provider response and runtime API specification.'}}, 'x-source-file': file, 'x-upstream-chain-api': proxied};
      if (schema.body) operation.requestBody = {required: true, content: {'application/json': {schema: portable(schema.body)}}};
      paths[route] ??= {}; paths[route][method.toLowerCase()] = operation;
    }
  }
  records.push({route, family, methods: Object.keys(paths[route]).map(method => method.toUpperCase()), doc: `reference/generated/${slugOverrides[route] || `${family}-${name.replaceAll('_', '-')}`}.md`, source: file, upstream: family === 'v1-chain'});
}
read('src/api/routes.ts'); read('src/interfaces/hyperionConfig.ts');
const notes = {
  '/v2/history/get_actions': 'Use bounded historical ranges. Keep sequence values as decimal strings rather than JavaScript Number. Generic indexed-field filters combine with AND. Archive hydration restores returned payloads; it does not make missing payload fields searchable. See [action filtering and pagination](/build/query-actions/).',
  '/v2/history/get_transaction': 'Supply the required transaction `id`. `block_hint` narrows the search. A source-coverage failure is different from an empty result; handle non-success HTTP responses before parsing a transaction.',
  '/v2/state/get_account': 'The `account` parameter is required. This account aggregate can include data from different configured services; inspect provider capabilities and each response section.',
};
const generated = path.join(website, 'docs/reference/generated'); await mkdir(generated, {recursive: true});
for (const record of records) {
  const title = record.route.replace(/^\//, '').replaceAll('/', ' / ');
  const sections = Object.entries(paths[record.route]).map(([method, operation]) => {
    const params = operation.parameters.map(parameter => `| \`${parameter.name}\` | ${esc(parameter.schema.type || parameter.schema.$ref?.split('/').at(-1) || 'source-defined')} | ${parameter.required ? 'Yes' : 'No'} | ${esc(parameter.description || '')}${parameter.schema.enum ? ` Values: ${parameter.schema.enum.map(value => `\`${esc(value)}\``).join(', ')}.` : ''}${parameter.schema.default !== undefined ? ` Default: \`${esc(JSON.stringify(parameter.schema.default))}\`.` : ''} |`).join('\n');
    const responses = Object.entries(operation.responses).map(([status, body]) => `### HTTP ${status}\n\n${body.content ? `Declared JSON schema:\n\n\`\`\`json\n${JSON.stringify(body.content['application/json'].schema, null, 2)}\n\`\`\`` : body.description}`).join('\n\n');
    return `## ${method.toUpperCase()}\n\n${esc(operation.description || operation.summary)}\n\n${params ? `### Query parameters\n\n| Name | Type | Required | Description |\n|---|---|---|---|\n${params}` : 'No query parameters are declared for this method.'}\n\n${operation.requestBody ? `### Request body\n\n\`\`\`json\n${JSON.stringify(operation.requestBody.content['application/json'].schema, null, 2)}\n\`\`\`` : ''}\n\n${responses}`;
  }).join('\n\n');
  await writeFile(path.join(website, 'docs', record.doc), `---\ntitle: ${title}\nsidebar_label: ${record.route.split('/').at(-1)}\n---\n\n# ${title}\n\n${record.methods.map(method => `\`${method} ${record.route}\``).join(' · ')}\n\n${record.upstream ? 'This route forwards requests to the configured chain RPC. Its data and availability follow that node, rather than Hyperion indexed-history coverage.\n\n' : ''}${notes[record.route] || 'Availability and returned data depend on the provider\'s enabled services, retained range and permissions.'}\n\n${sections}\n\n## Errors and provider capabilities\n\nCheck HTTP status before parsing JSON. Validation errors, unavailable dependencies, query failures and missing source coverage are distinct outcomes. The running provider\'s [OpenAPI interface](/reference/overview/#provider-api-specification) includes its installed plugins and configuration.\n\n## Source\n\n[Route definition](${repository}/blob/${commit}/${record.source}) at \`${commit}\`. SHA-256: \`${hashes[record.source]}\`. [Download the core source OpenAPI](/reference/hyperion-source.openapi.json). Generated from the 4.5 source.\n`);
}
function flatten(value, prefix = '') {return Object.entries(value).flatMap(([key, item]) => {const name = prefix ? `${prefix}.${key}` : key; return item && typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length ? flatten(item, name) : [[name, item]];});}
for (const [filename, title, slug] of [['config.ref.json', 'Chain configuration reference', '/providers/setup/chain/'], ['connections.ref.json', 'Connections configuration reference', '/providers/setup/connections/']]) {
  const file = `references/${filename}`; const reference = JSON.parse(read(file));
  const sections = Object.entries(reference).map(([section, value]) => `## ${section}\n\n| Key | Reference value type | Reference value |\n|---|---|---|\n${(value && typeof value === 'object' ? flatten(value, section) : [[section, value]]).map(([key, item]) => `| \`${key}\` | ${item === null ? 'null' : Array.isArray(item) ? 'array' : typeof item} | \`${esc(JSON.stringify(item))}\` |`).join('\n')}`).join('\n\n');
  const output = filename === 'config.ref.json' ? 'configuration.md' : 'connections.md';
  const guide = filename === 'config.ref.json' ? 'Your chain file is `config/chains/<chain>.config.json`. Additional runtime options, including protocol selection and archive hydration, are described in [configure a chain](/providers/setup/hyperion_configuration/).' : 'Connection credentials and chain endpoints live in `config/connections.json`. The `chains` map is populated by `./hyp-config chains new`. SHiP failover accepts a URL, an array of URLs, or labeled URL objects. Use the exact AMQP virtual-host name configured in RabbitMQ.';
  await writeFile(path.join(generated, output), `---\ntitle: ${title}\nslug: ${slug}\n---\n\n# ${title}\n\n${guide}\n\n:::note Reference values are not effective defaults\nThese are values in the 4.5 creation template. Operator-specific credentials, endpoints and enabled capabilities must be configured for your installation. Validation and optional runtime fields are defined in the owning source.\n:::\n\n${sections}\n\n## Source\n\n[\`${file}\`](${repository}/blob/${commit}/${file}) at \`${commit}\`. SHA-256: \`${hashes[file]}\`. Generated from the 4.5 source; update the exporter rather than editing these tables.\n`);
}
const packageData = JSON.parse(read('package.json'));
const spec = {openapi: '3.1.0', info: {title: 'Hyperion 4.5 core API', version: '4.5'}, 'x-hyperion-source': {repository, branch: 'release/4.5', commit, sourcePackageVersion: packageData.version, kind: 'all TypeScript core route declarations', runtimeRegistrationVerified: false, pluginRoutesIncluded: false, files: hashes}, components: {schemas: portable(shared)}, paths};
await mkdir(path.join(website, 'static/reference'), {recursive: true});
await writeFile(path.join(website, 'static/reference/hyperion-source.openapi.json'), JSON.stringify(spec, null, 2) + '\n');
await writeFile(path.join(website, 'reference-inventory.json'), JSON.stringify({commit, sourceFiles: files.length, routes: records, registration: {file: 'src/api/routes.ts', nodeDiscovery: '/v1/node/get_supported_apis', upstreamWildcard: '/v1/chain/*', excludedJavaScriptArtifacts: ['v2-history/export_actions/index.js', 'v1-chain/get_scheduled_transaction/index.js']}}, null, 2) + '\n');
console.log(`Generated ${records.length} core route pages, ${Object.values(paths).reduce((count, methods) => count + Object.keys(methods).length, 0)} methods and both configuration references from ${commit.slice(0, 8)}.`);
