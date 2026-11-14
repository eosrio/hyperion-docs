import {readdir, readFile, stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const build = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../build');
async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file));
    else if (entry.name.endsWith('.html')) result.push(file);
  }
  return result;
}
const files = await walk(build);
const documents = new Map(await Promise.all(files.map(async file => [file, await readFile(file, 'utf8')])));
const failures = [];
let checked = 0;
for (const [file, html] of documents) {
  const base = new URL('/' + path.relative(build, file).replaceAll('\\', '/'), 'https://docs.local');
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (!href || /^(https?:|mailto:|tel:|javascript:|data:)/.test(href)) continue;
    const url = new URL(href, base);
    let target = path.join(build, decodeURIComponent(url.pathname));
    if (existsSync(target)) {
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
      else if (url.pathname.endsWith('/')) {failures.push(`${path.relative(build, file)} -> ${href} (file URL has a trailing slash)`); continue;}
    }
    if (!existsSync(target)) {failures.push(`${path.relative(build, file)} -> ${href} (missing path)`); continue;}
    const hash = decodeURIComponent(url.hash.slice(1));
    if (hash && documents.has(target) && !documents.get(target).includes(`id="${hash}"`)) failures.push(`${path.relative(build, file)} -> ${href} (missing anchor)`);
    checked++;
  }
}
if (failures.length) {console.error(failures.join('\n')); process.exitCode = 1;}
else console.log(`Checked ${checked} internal links across ${files.length} HTML files, including static legacy bridges.`);
