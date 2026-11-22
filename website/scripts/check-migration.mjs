import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {load} from 'cheerio';
const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const json = async file => JSON.parse(await readFile(path.join(website, file), 'utf8'));
const manifest = await json('migration-manifest.json');
const published = await json('legacy-anchors.json');
const foundation = await json('foundation-anchors.json');
let anchors = 0;
for (const page of manifest.pages) {
  const html = await readFile(path.join(website, 'build', page.from, 'index.html'), 'utf8');
  const $ = load(html);
  if ($('meta[http-equiv="refresh"]').length) throw new Error(`Published path became a redirect stub: ${page.from}`);
  const expected = published.pages.find(item => item.path === page.from).anchors;
  for (const anchor of expected) {
    const matches = $('[id]').toArray().filter(node => $(node).attr('id') === anchor);
    if (matches.length !== 1) throw new Error(`${page.from}#${anchor}: found ${matches.length} targets`);
    anchors++;
  }
}
let localAnchors = 0;
for (const alias of manifest.aliases) {
  const bridge = await readFile(path.join(website, 'build', alias.from, 'index.html'), 'utf8');
  if (!bridge.includes('location.search+location.hash') || !bridge.includes(JSON.stringify(alias.to))) throw new Error(`Alias loses query/fragment: ${alias.from}`);
  const target = load(await readFile(path.join(website, 'build', alias.to, 'index.html'), 'utf8'));
  const old = foundation.pages.find(page => page.path === alias.from);
  for (const anchor of old.anchors) {
    if (target('[id]').toArray().filter(node => target(node).attr('id') === anchor).length !== 1) throw new Error(`Local anchor lost: ${alias.from}#${anchor}`);
    localAnchors++;
  }
}
async function pages(dir) {const result = []; for (const entry of await readdir(dir, {withFileTypes: true})) {const file = path.join(dir, entry.name); if (entry.isDirectory()) result.push(...await pages(file)); else if (file.endsWith('.html')) result.push(file);} return result;}
for (const file of await pages(path.join(website, 'build'))) {
  const $ = load(await readFile(file, 'utf8')); const text = $('body').text().replaceAll('settings.preview', 'settings.<technical-key>');
  if (/\bpreview\b|\bunreleased\b|preparing for hyperion|not yet publish|will be qualified/i.test(text)) throw new Error(`Unreleased copy: ${path.relative(website, file)}`);
}
const spec = await json('static/reference/hyperion-source.openapi.json');
const inventory = await json('reference-inventory.json');
if (Object.keys(spec.paths).length !== inventory.sourceFiles) throw new Error('Core route inventory does not match source export');
for (const record of inventory.routes) for (const method of record.methods) if (!spec.paths[record.route]?.[method.toLowerCase()]) throw new Error(`Missing method ${method} ${record.route}`);
console.log(`Preserved ${manifest.pages.length} published paths and ${anchors} anchors; ${manifest.aliases.length} local aliases and ${localAnchors} local anchors. Release-copy and ${inventory.routes.length}-route coverage checks passed.`);
