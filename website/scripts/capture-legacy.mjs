import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'migration-manifest.json'), 'utf8'));
const pages = [];
for (let start = 0; start < manifest.pages.length; start += 4) {
  const batch = await Promise.all(manifest.pages.slice(start, start + 4).map(async page => {
    const url = 'https://hyperion.docs.eosrio.io' + page.from;
    const response = await fetch(url, {signal: AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    const html = await response.text();
    const article = html.match(/<article\b[^>]*class="[^"]*md-content__inner[^\"]*"[^>]*>([\s\S]*?)<\/article>/)?.[1];
    if (!article) throw new Error(`Missing MkDocs article: ${url}`);
    const anchors = [...article.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
    const headings = [...article.matchAll(/<h([1-6])\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(match => ({level: Number(match[1]), id: match[2], text: match[3].replace(/<a\b[^>]*class="headerlink"[^>]*>[\s\S]*?<\/a>/g, '').replace(/<[^>]*>/g, '').replaceAll('&amp;', '&')}));
    return {path: page.from, anchors: [...new Set(anchors)], headings, sha256: createHash('sha256').update(article).digest('hex')};
  }));
  pages.push(...batch);
}
const snapshot = {baseline: manifest.baseline, capturedAt: new Date().toISOString(), origin: 'https://hyperion.docs.eosrio.io', pages};
await writeFile(path.join(root, 'legacy-anchors.json'), JSON.stringify(snapshot, null, 2) + '\n');
console.log(`Captured ${pages.length} live pages and ${pages.reduce((sum, page) => sum + page.anchors.length, 0)} original content anchors.`);
