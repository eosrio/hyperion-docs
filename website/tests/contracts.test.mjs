import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFile(path.join(website, file), 'utf8');

test('source snapshot preserves required account and transaction parameters', async () => {
  const spec = JSON.parse(await read('static/reference/hyperion-source.openapi.json'));
  assert.equal(spec['x-hyperion-source'].commit, 'e1818923065d648a38009572d76badeab0684af1');
  assert.equal(spec['x-hyperion-source'].runtimeRegistrationVerified, false);
  const account = spec.paths['/v2/state/get_account'].get.parameters;
  assert.equal(account.find(parameter => parameter.name === 'account').required, true);
  const transaction = spec.paths['/v2/history/get_transaction'].get;
  assert.equal(transaction.parameters.find(parameter => parameter.name === 'id').required, true);
  assert.ok(transaction.parameters.some(parameter => parameter.name === 'block_hint'));
  assert.ok(!transaction.responses['200'].content, 'missing source response must remain unspecified');
  assert.ok(!spec.paths['/v2/history/get_transfers'], 'historical phantom route must not become a generated core endpoint');
  assert.ok(spec.paths['/v2/state/get_key_accounts'].get);
  assert.ok(spec.paths['/v2/state/get_key_accounts'].post);
  assert.ok(spec.paths['/v1/trace_api/get_block'].post);
  assert.ok(spec.paths['/v2/stats/get_api_usage'].get);
  assert.ok(spec.paths['/v1/chain/get_account'].post.requestBody.content['application/json'].schema.anyOf.some(schema => schema.type === 'string'));
  assert.ok(spec.components.schemas.AccountName);
});

test('migration inventory covers the 24 incumbent pages and records outstanding cutover work', async () => {
  const manifest = JSON.parse(await read('migration-manifest.json'));
  assert.equal(manifest.pages.length, 24);
  assert.equal(new Set(manifest.pages.map(page => page.from)).size, 24);
  assert.equal(manifest.publicationReady, false);
  for (const page of manifest.pages) {
    const original = page.from === '/' ? 'index.md' : `${page.from.slice(1, -1)}.md`;
    await assert.doesNotReject(readFile(path.join(website, '../docs', original)));
  }
  assert.equal(manifest.contentMigrationComplete, true);
  for (const page of manifest.pages) {
    assert.equal(page.status, 'migrated');
    assert.equal(page.to, page.from, 'published paths are canonical pages, not redirect stubs');
    if (page.doc) await assert.doesNotReject(read(`docs/${page.doc}`));
  }
  assert.equal(manifest.aliases.length, 15);
});

test('JSON examples remain parseable and source values are not labeled runtime defaults', async () => {
  async function walk(dir) {
    const result = [];
    for (const entry of await readdir(dir, {withFileTypes: true})) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) result.push(...await walk(file));
      else if (/\.mdx?$/.test(file)) result.push(file);
    }
    return result;
  }
  for (const file of await walk(path.join(website, 'docs'))) {
    const content = await readFile(file, 'utf8');
    for (const block of content.matchAll(/```json[^\n]*\n([\s\S]*?)```/g)) assert.doesNotThrow(() => JSON.parse(block[1]), file);
  }
  const configuration = await read('docs/reference/generated/configuration.md');
  assert.match(configuration, /Reference values are not effective defaults/);
  assert.match(configuration, /config\/chains/);
});
