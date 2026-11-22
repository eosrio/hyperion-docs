const fs = require('node:fs/promises');
const path = require('node:path');
const manifest = require('../migration-manifest.json');

module.exports = function legacyRedirects() {
  return {
    name: 'hyperion-legacy-redirects',
    async postBuild({outDir}) {
      for (const page of manifest.aliases || []) {
        if (page.from === page.to) continue;
        if (!/^\/next\/[a-zA-Z0-9/_.-]*\/$/.test(page.from) || !/^\/[a-zA-Z0-9/_.-]*\/$/.test(page.to)) throw new Error(`Invalid redirect: ${page.from}`);
        await fs.access(path.join(outDir, page.to.slice(1), 'index.html'));
        const dir = path.join(outDir, page.from.slice(1));
        await fs.mkdir(dir, {recursive: true});
        const target = JSON.stringify(page.to);
        await fs.writeFile(path.join(dir, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Documentation moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${page.to}"><meta http-equiv="refresh" content="0;url=${page.to}"></head><body><p>This guide moved to <a href="${page.to}">${page.to}</a>.</p><script>location.replace(${target}+location.search+location.hash)</script></body></html>`);
      }
    },
  };
};
