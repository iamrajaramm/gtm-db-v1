export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const sheetId = url.searchParams.get("sheetId") || "1tbVAnNt54H7-A-g_Q9MonQp3fDMLdN1C58VhHdHGIKE";
  const gid = url.searchParams.get("gid") || "1884273215";
  const bust = url.searchParams.get("_t") || Date.now().toString();

  const target = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=tsv&gid=${encodeURIComponent(gid)}&_t=${encodeURIComponent(bust)}`;

  try {
    const upstream = await fetch(target, {
      headers: {
        "User-Agent": "CampaignReportProxy/1.0",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      cf: {
        cacheTtl: 0,
        cacheEverything: false
      }
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
      }
    });
  } catch (err) {
    return new Response(`Proxy error: ${err.message}`,
      {
        status: 502,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400"
    }
  });
}
