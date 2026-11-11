/**
 * Read values passed in the URL fragment (e.g. /tools/word-counter#text=hello),
 * used by the LifeKit browser extension to pre-fill tools.
 *
 * The fragment (everything after #) is never sent to the server, so prefilled
 * text stays on the device. The fragment is removed after reading so the
 * content doesn't linger in the address bar or browser history entry.
 */
const MAX_LENGTH = 200_000;

// React may run state initialisers twice in development, so keep the last read briefly.
let cache: { path: string; at: number; params: URLSearchParams } | null = null;

export function consumeHashParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  const path = window.location.pathname;
  if (window.location.hash.length < 2) {
    if (cache && cache.path === path && Date.now() - cache.at < 2000) return cache.params;
    return new URLSearchParams();
  }
  const params = new URLSearchParams(window.location.hash.slice(1));
  cache = { path, at: Date.now(), params };
  window.history.replaceState(window.history.state, '', path + window.location.search);
  return params;
}

export function readParam(params: URLSearchParams, key: string): string | null {
  const v = params.get(key);
  return v === null ? null : v.slice(0, MAX_LENGTH);
}
