import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import reference from './reference-inventory.json';
const routes = (family: string) => reference.routes.filter(route => route.family === family).map(route => route.doc.replace(/\.md$/, ''));
const sidebars: SidebarsConfig = {
  handbook: [
    {type: 'category', label: 'Start here', collapsed: false, items: ['start/overview', 'start/first-query']},
    {type: 'category', label: 'Build with Hyperion', collapsed: false, items: ['build/query-actions', 'build/streaming']},
    {type: 'category', label: 'Run Hyperion', collapsed: false, items: ['operate/overview', {type: 'category', label: 'Install', collapsed: true, items: ['providers/install/manual_install', 'providers/install/auto_install', 'providers/install/wsl2', 'providers/install/docker', 'providers/install/lxd']}, 'operate/configure-chain', 'operate/verify-indexing', 'providers/update', 'providers/operations/index_management', 'providers/repair', 'providers/explorer', 'providers/setup/qry_connection', {type: 'category', label: 'Troubleshoot', collapsed: true, items: ['providers/help/indexer', 'providers/help/elasticsearch', 'providers/help/kibana', 'providers/help/rabbit']}]},
    {type: 'category', label: 'Extend Hyperion', collapsed: false, items: ['extend/overview', 'extend/protocols', 'extend/projections']},
    {type: 'category', label: 'Reference', collapsed: false, items: ['reference/overview', 'api/v2', 'api/v1', ...['v2-history', 'v2-state', 'v2-stats', 'v2', 'v1-history', 'v1-trace', 'v1-chain'].map(family => ({type: 'category' as const, label: family, collapsed: true, items: routes(family)})), 'reference/generated/configuration', 'reference/generated/connections', 'reference/cli', 'dev/endpoint']},
    {type: 'category', label: 'Releases & upgrades', collapsed: false, items: ['releases/4.5', 'releases/compatibility']},
  ],
};
export default sidebars;
