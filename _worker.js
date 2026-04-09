export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle /api/sheet proxy
    if (url.pathname === '/api/sheet') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400'
          }
        });
      }

      const sheetId = url.searchParams.get('sheetId');
      const gid = url.searchParams.get('gid');
      const bust = url.searchParams.get('_t') || Date.now().toString();

      if (!sheetId || !gid) {
        return new Response('Missing sheetId or gid parameter', {
          status: 400,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

      const target = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=tsv&gid=${encodeURIComponent(gid)}&_t=${encodeURIComponent(bust)}`;

      try {
        const upstream = await fetch(target, {
          headers: {
            'User-Agent': 'GTMBDashboardProxy/1.0',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cf: { cacheTtl: 0, cacheEverything: false }
        });

        const body = await upstream.text();
        return new Response(body, {
          status: upstream.status,
          headers: {
            'Content-Type': 'text/tab-separated-values; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        });
      } catch (err) {
        return new Response(`Proxy error: ${err.message}`, {
          status: 502,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    }

    // Everything else — serve static assets
    return env.ASSETS.fetch(request);
  }
};
