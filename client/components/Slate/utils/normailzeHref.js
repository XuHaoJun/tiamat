import URL from 'url';
import isUrl from 'is-url';

function sameOriginReplace(href) {
  const url = URL.parse(href);
  if (typeof window !== 'undefined') {
    const hostname = url.hostname
      ? url
        .hostname
        .replace('127.0.0.1', 'localhost')
      : '';
    const port = url.port
      ? url.port
      : '';
    const host = `${hostname}:${port}`;
    const location = window.location;
    const windowHost = `${location
      .hostname
      .replace('127.0.0.1', 'localhost')}:${location
      .port}`;
    if (host === windowHost) {
      const path = url.path
        ? url.path
        : '';
      const hash = url.hash
        ? url.hash
        : '';
      const finalHref = `${path}${hash}`;
      return finalHref;
    }
  }
  return href;
}

export default function normalizeHref(href) {
  console.log('normalizeHref', href);
  if (isUrl(href)) {
    console.log('sameOriginReplace', sameOriginReplace(href));
    return sameOriginReplace(href);
  }
  return href;
}
