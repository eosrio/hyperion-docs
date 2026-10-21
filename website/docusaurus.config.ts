import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';
import {lightCodeTheme, darkCodeTheme} from './prism-themes';
import legacyAnchors from './plugins/legacy-anchors';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const anchorContract = createHash('sha256').update(legacyAnchors.toString() + ['migration-manifest.json', 'legacy-anchors.json', 'foundation-anchors.json'].map(file => readFileSync(file, 'utf8')).join('')).digest('hex');

const config: Config = {
  title: 'Hyperion documentation',
  tagline: 'History and state APIs for Antelope chains',
  url: 'https://hyperion.docs.eosrio.io',
  baseUrl: '/',
  favicon: 'img/hyperion-mark.svg',
  organizationName: 'eosrio',
  projectName: 'hyperion-docs',
  trailingSlash: true,
  scripts: [{src: '/search-loader.js', defer: true}],
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  i18n: {defaultLocale: 'en', locales: ['en']},
  presets: [['classic', {
    docs: {
      routeBasePath: '/',
      sidebarPath: './sidebars.ts',
      rehypePlugins: [[legacyAnchors, {contract: anchorContract}]],
      editUrl: 'https://github.com/eosrio/hyperion-docs/edit/master/website/',
      versions: {current: {label: '4.5', path: '', banner: 'none'}},
      showLastUpdateTime: false,
    },
    blog: false,
    theme: {customCss: './src/css/custom.css'},
    sitemap: {},
  } satisfies Options]],
  plugins: ['./plugins/legacy-redirects.cjs'],
  themeConfig: {
    image: 'img/hyperion-mark.svg',
    colorMode: {defaultMode: 'dark', respectPrefersColorScheme: false},
    navbar: {
      title: 'HYPERION',
      logo: {alt: 'Hyperion documentation', src: 'img/hyperion-mark.svg', width: 30, height: 44},
      items: [
        {to: '/start/overview/', label: 'Start', position: 'left'},
        {to: '/build/query-actions/', label: 'Build', position: 'left'},
        {to: '/providers/get-started/', label: 'Operate', position: 'left'},
        {to: '/extend/overview/', label: 'Extend', position: 'left'},
        {to: '/reference/overview/', label: 'Reference', position: 'left'},
        {to: '/releases/4.5/', label: 'Releases', position: 'left'},
        {type: 'dropdown', label: '4.5', position: 'right', className: 'release-switch', items: [
          {to: '/start/overview/', label: '4.5 documentation'},
          {to: '/providers/update/', label: 'Upgrade to 4.5'},
          {to: '/releases/4.5/', label: 'Release notes'},
        ]},
        {type: 'search', position: 'right'},
        {href: 'https://github.com/eosrio/hyperion-docs', label: 'GitHub', position: 'right'},
      ],
    },
    docs: {sidebar: {hideable: true, autoCollapseCategories: false}},
    footer: {style: 'dark', links: [
      {label: 'Hyperion on GitHub', href: 'https://github.com/eosrio/hyperion-history-api'},
      {label: 'Documentation source', href: 'https://github.com/eosrio/hyperion-docs'},
      {label: 'by Rio Blocks', href: 'https://rioblocks.io/'},
    ], copyright: 'Hyperion documentation · 4.5'},
    prism: {theme: lightCodeTheme, darkTheme: darkCodeTheme, additionalLanguages: ['bash', 'json', 'powershell']},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 3},
  } satisfies ThemeConfig,
};
export default config;
