import {readFileSync} from 'node:fs';
import path from 'node:path';

// Insert aliases into the compiled MDX tree so SSR and client navigation share
// the same anchors. Never patch the generated HTML after React compilation.
export default function legacyAnchors() {
  const root = path.resolve(process.cwd());
  const manifest = JSON.parse(readFileSync(path.join(root, 'migration-manifest.json'), 'utf8'));
  const inventory = JSON.parse(readFileSync(path.join(root, 'legacy-anchors.json'), 'utf8'));
  const foundation = JSON.parse(readFileSync(path.join(root, 'foundation-anchors.json'), 'utf8'));
  return (tree: any, file: any) => {
    const filename = path.relative(path.join(root, 'docs'), file.path || file.history?.[0] || '').replaceAll('\\', '/');
    const page = manifest.pages.find((item: any) => item.doc === filename);
    const current = foundation.pages.find((item: any) => item.doc === filename.replace(/\.mdx?$/, ''));
    const published = page && inventory.pages.find((item: any) => item.path === page.from);
    if (!published && !current) return;
    const original = {anchors: [...new Set([...(published?.anchors || []), ...(current?.anchors || [])])], headings: [...(published?.headings || []), ...(current?.headings || [])]};
    const present = new Set<string>();
    const headings: {node: any; parent: any; text: string; id: string}[] = [];
    const text = (node: any): string => node.value || (node.children || []).map(text).join('');
    function walk(node: any, parent?: any) {
      // Docusaurus' document-title renderer drops the h1 slug. Give an old h1
      // its own alias instead of assuming the intermediate tree ID will ship.
      if (node.properties?.id && node.tagName !== 'h1') present.add(String(node.properties.id));
      if (/^h[1-6]$/.test(node.tagName)) headings.push({node, parent, text: text(node), id: node.properties?.id});
      for (const child of node.children || []) walk(child, node);
    }
    walk(tree);
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\b\d+\b/g, '').trim();
    let previous = headings[0];
    for (const id of original.anchors) {
      const old = original.headings.find((heading: any) => heading.id === id);
      const forced = page?.anchorTargets?.[id];
      const target = headings.find(heading => heading.id === forced)
        || headings.find(heading => normalize(heading.text) === normalize(old?.text || id))
        || (old?.level <= 2 ? headings[0] : previous)
        || headings[0];
      if (old && target) previous = target;
      if (present.has(id)) continue;
      const alias = {type: 'element', tagName: 'span', properties: {id, className: ['legacy-anchor'], 'aria-hidden': 'true'}, children: []};
      if (target?.parent) target.parent.children.splice(target.parent.children.indexOf(target.node), 0, alias);
      else tree.children.unshift(alias);
      present.add(id);
    }
  };
}
