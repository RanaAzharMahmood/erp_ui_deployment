/**
 * Browser-compatible polyfill for Node.js url module
 * Provides url.parse and url.format functionality using browser URL API
 */

interface UrlObject {
  protocol?: string | null;
  slashes?: boolean | null;
  auth?: string | null;
  host?: string | null;
  port?: string | null;
  hostname?: string | null;
  hash?: string | null;
  search?: string | null;
  query?: any;
  pathname?: string | null;
  path?: string | null;
  href?: string | null;
}

export function parse(urlStr: string, parseQueryString?: boolean): UrlObject {
  try {
    // Check if it's an absolute URL (starts with http://, https://, etc.)
    const isAbsolute = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(urlStr);
    
    let url: URL;
    let protocol: string | null = null;
    let host: string | null = null;
    let hostname: string | null = null;
    let port: string | null = null;
    
    if (isAbsolute) {
      // Absolute URL - parse as-is
      url = new URL(urlStr);
      protocol = url.protocol || null;
      host = url.host || null;
      hostname = url.hostname || null;
      port = url.port || null;
    } else {
      // Relative URL - use temporary base but don't include protocol/host in result
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      url = new URL(urlStr, base);
      // Don't set protocol/host for relative URLs
    }
    
    let query: any = parseQueryString ? {} : '';
    if (parseQueryString) {
      url.searchParams.forEach((value, key) => {
        if (query[key]) {
          // Handle multiple values
          if (Array.isArray(query[key])) {
            query[key].push(value);
          } else {
            query[key] = [query[key], value];
          }
        } else {
          query[key] = value;
        }
      });
    } else {
      query = url.search.substring(1);
    }

    return {
      protocol: protocol,
      slashes: protocol ? true : null,
      auth: null,
      host: host,
      port: port,
      hostname: hostname,
      hash: url.hash || null,
      search: url.search || null,
      query: query,
      pathname: url.pathname || null,
      path: url.pathname + url.search || null,
      href: isAbsolute ? url.href : null,
    };
  } catch (e) {
    // Fallback for malformed URLs
    return {
      protocol: null,
      slashes: null,
      auth: null,
      host: null,
      port: null,
      hostname: null,
      hash: null,
      search: null,
      query: parseQueryString ? {} : '',
      pathname: urlStr,
      path: urlStr,
      href: urlStr,
    };
  }
}

export function format(urlObj: UrlObject): string {
  try {
    const pathname = urlObj.pathname || '/';
    
    // Build query string
    let search = '';
    if (urlObj.query) {
      if (typeof urlObj.query === 'string') {
        search = urlObj.query ? `?${urlObj.query}` : '';
      } else {
        const params = new URLSearchParams();
        Object.keys(urlObj.query).forEach((key) => {
          const value = urlObj.query[key];
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        });
        const queryString = params.toString();
        search = queryString ? `?${queryString}` : '';
      }
    }
    
    // Use search from urlObj if provided and query wasn't set
    if (urlObj.search && !search) {
      search = urlObj.search;
    }
    
    const fullPath = pathname + search + (urlObj.hash || '');
    
    // Always return relative path (the basePath will be prepended by the API caller)
    // Only return full URL if protocol and host are explicitly provided
    if (urlObj.protocol && (urlObj.host || urlObj.hostname)) {
      const protocol = urlObj.protocol;
      const host = urlObj.host || urlObj.hostname || '';
      return `${protocol}//${host}${fullPath}`;
    }
    
    // Return relative path
    return fullPath;
  } catch (e) {
    // Fallback - return pathname or path
    return urlObj.pathname || urlObj.path || '';
  }
}

