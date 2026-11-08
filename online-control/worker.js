export class ControlRoom {
  constructor(state) { this.state = state; this.sessions = new Set(); }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/room' && request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept(); this.sessions.add(server);
      server.addEventListener('close', () => this.sessions.delete(server));
      server.addEventListener('message', event => { for (const peer of this.sessions) if (peer !== server) peer.send(event.data); });
      server.send(JSON.stringify({type:'room-ready'}));
      return new Response(null, {status:101, webSocket:client});
    }
    return new Response('Sala online ativa', {headers:{'content-type':'text/plain;charset=UTF-8'}});
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const room = (url.pathname.match(/^\/room\/([A-Z0-9]{4,8})\/?$/i)||[])[1];
    if (room) {
      const id = env.ROOM.idFromName(room.toUpperCase());
      return env.ROOM.get(id).fetch(new Request(request, {url:url.origin+'/room', headers:request.headers}));
    }
    return new Response('Controle online da mesa de projeção');
  }
};
