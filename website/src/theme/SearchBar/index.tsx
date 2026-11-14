import React, {useEffect, useRef, useState} from 'react';
import {useHistory} from '@docusaurus/router';

type SearchResult = {id: string; url: string; meta: {title?: string}; excerpt: string};
type Pagefind = {search: (query: string) => Promise<{results: {id: string; data: () => Promise<SearchResult>}[]}>};
declare global {interface Window {hyperionLoadSearch?: () => Promise<Pagefind>;}}
let searchModule: Promise<Pagefind> | undefined;
const plain = (value: string) => value.replace(/<[^>]*>/g, '').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&amp;', '&');

export default function SearchBar() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const show = () => {if (!dialog.current?.open) {dialog.current?.showModal(); setOpen(true); input.current?.focus();}};
  const close = () => {dialog.current?.close(); setOpen(false); trigger.current?.focus();};
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {event.preventDefault(); show();}
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (!query.trim()) {setResults([]); setState('idle'); return;}
    setState('loading');
    const timer = setTimeout(async () => {
      try {
        if (!window.hyperionLoadSearch) throw new Error('Search loader is unavailable');
        searchModule ??= window.hyperionLoadSearch();
        const search = await searchModule;
        const response = await search.search(query.trim());
        const data = await Promise.all(response.results.slice(0, 8).map(item => item.data()));
        if (!cancelled) {setResults(data); setState('ready');}
      } catch {if (!cancelled) {searchModule = undefined; setState('error');}}
    }, 160);
    return () => {cancelled = true; clearTimeout(timer);};
  }, [query]);
  return <>
    <button className="docs-search-trigger" ref={trigger} onClick={show} aria-haspopup="dialog" aria-expanded={open} aria-label="Search documentation"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span>Search docs</span><kbd>Ctrl K</kbd></button>
    <dialog className="docs-search-dialog" ref={dialog} aria-labelledby="search-title" onKeyDown={event => {if (event.key === 'Escape') {event.preventDefault(); close();}}} onCancel={() => {setOpen(false);}} onClose={() => setOpen(false)} onClick={event => {if (event.target === dialog.current) close();}}>
      <div className="search-dialog-head"><h2 id="search-title">Search documentation</h2><button onClick={close} className="search-close" aria-label="Close search">Esc</button></div>
      <label className="search-input-label" htmlFor="docs-search-input">Guide, endpoint, configuration key, or error</label>
      <input ref={input} id="docs-search-input" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try get_actions or connections.json" autoComplete="off"/>
      <div className="search-status" role="status" aria-live="polite">{state === 'idle' ? 'Search Hyperion 4.5 guides, endpoints and configuration.' : state === 'loading' ? 'Searching…' : state === 'error' ? 'Search is unavailable. Browse the section navigation or try again.' : results.length ? `${results.length} results` : `No results for “${query}”. Try an endpoint name or a shorter phrase.`}</div>
      {state === 'ready' && <ul className="search-results">{results.map(result => <li key={result.id}><a href={result.url} onClick={event => {event.preventDefault(); close(); history.push(result.url);}}><strong>{result.meta.title || result.url}</strong><p>{plain(result.excerpt)}</p><span>{result.url}</span></a></li>)}</ul>}
    </dialog>
  </>;
}
