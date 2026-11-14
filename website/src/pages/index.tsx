import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Arrow from '../components/Arrow';

const tasks = [
  {title: 'Query blockchain data', text: 'Make your first request. Filter actions, page through history and understand the response.', to: '/dev/howtouse/', id: 'for-developers'},
  {title: 'Run Hyperion', text: 'Install, configure your chain and verify indexing, storage and API coverage.', to: '/providers/get-started/', id: 'for-providers'},
  {title: 'Build a plugin', text: 'Choose an extension boundary and connect protocol, contract and storage components.', to: '/extend/overview/', id: 'official-plugins'},
  {title: 'Upgrade to 4.5', text: 'Review the changes, preserve existing history and plan a controlled upgrade.', to: '/providers/update/', id: 'upgrade'},
];
const curl = `# Set HYPERION_URL to your provider's base URL
curl --fail-with-body --get "$HYPERION_URL/v2/history/get_actions" \\
  --data-urlencode "filter=eosio.token:transfer" \\
  --data-urlencode "block_num=100000-100100" \\
  --data-urlencode "limit=10"`;
const js = `const base = new URL('https://your-provider.example');
const url = new URL('/v2/history/get_actions', base);
url.search = new URLSearchParams({
  filter: 'eosio.token:transfer',
  block_num: '100000-100100', limit: '10',
}).toString();
const response = await fetch(url, {
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok) throw new Error(await response.text());
console.log(await response.json());`;

export default function Home() {
  return <Layout title="Documentation" description="Query Antelope blockchain history, operate Hyperion and build integrations with release-aware guides and source-derived references.">
    <main id="main-content" className="docs-home" data-pagefind-body data-pagefind-filter="release:4.5">
      <span id="homepage"/><span id="hyperion-history-api"/><span id="official-documentation"/>
      <section className="home-opening">
        <h1>Work with Hyperion.</h1>
        <p>History and state APIs for Antelope chains.<br/>Start with a request, a deployment, or a plugin.</p>
      </section>
      <div className="home-workspace">
        <nav className="task-list" aria-label="Choose a task">
          {tasks.map(task => <Link className="task-row" to={task.to} key={task.to} id={task.id}>
            <div><h2>{task.title}</h2><p>{task.text}</p></div><Arrow/>
          </Link>)}
        </nav>
        <section className="first-request" aria-labelledby="first-request-title" id="api-reference">
          <h2 id="first-request-title">A first history query</h2>
          <p>A bounded block range keeps the request specific.</p>
          <Tabs groupId="request-language" aria-label="Example language">
            <TabItem value="curl" label="cURL" default><CodeBlock language="bash">{curl}</CodeBlock></TabItem>
            <TabItem value="javascript" label="JavaScript"><CodeBlock language="javascript">{js}</CodeBlock></TabItem>
          </Tabs>
          <p className="request-caption">Illustrative range. Results depend on your provider's indexed coverage.</p>
          <Link className="text-action" to="/reference/generated/get-actions/">Read the endpoint reference <Arrow/></Link>
          <p className="version-note">API routes <code>v1</code> and <code>v2</code> are independent of the Hyperion product release.</p>
        </section>
      </div>
      <section className="release-row"><h2>Hyperion 4.5</h2><p>Explore protocol providers, exact sequence handling and source-aware history queries. Find the configuration and upgrade steps for your installation.</p><Link to="/releases/4.5/">Explore the changes <Arrow/></Link></section>
      <section className="home-foundation"><h2>Understand the system.</h2><div className="foundation-copy">
        {['1-overview', 'improved-data-structure', '2-architecture', '21-elasticsearch-cluster', '22-hyperion-indexer', '23-hyperion-api', '24-rabbitmq', '25-redis', '26-leap-state-history', '27-hyperion-stream-client-optional', '28-hyperion-plugins-optional'].map(id => <span className="legacy-anchor" key={id} id={id}/>)}
        <p>Hyperion reads chain data through SHiP and processes it through workers and RabbitMQ. Elasticsearch stores history, MongoDB supports configured state features, and Redis provides caching and coordination.</p><Link className="text-action" to="/start/overview/">How Hyperion works <Arrow/></Link></div></section>
    </main>
  </Layout>;
}
