export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.searchParams.get('path');
  const key = context.env.YOUVERSION_KEY;
  if (!key) return new Response(JSON.stringify({error:'YOUVERSION_KEY não configurada no Cloudflare Pages'}), {status:500, headers:{'content-type':'application/json'}});
  if (!path || !path.startsWith('/v1/')) return new Response(JSON.stringify({error:'Caminho inválido'}), {status:400, headers:{'content-type':'application/json'}});
  const upstream = await fetch('https://api.youversion.com' + path, {headers:{'x-yvp-app-key':key, accept:'application/json'}});
  const body = await upstream.text();
  return new Response(body, {status:upstream.status, headers:{'content-type':upstream.headers.get('content-type') || 'application/json', 'cache-control':'no-store'}});
}
