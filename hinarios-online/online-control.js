'use strict';
(function(){
  const WORKER='https://mesa-projecao-controle.alef-barbosa.workers.dev';
  const params=new URLSearchParams(location.search),roomParam=(params.get('room')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8),isControl=params.get('control')==='1';
  let socket=null,room=roomParam;
  function connect(code){room=String(code||'').toUpperCase();if(!/^[A-Z0-9]{4,8}$/.test(room))return notify('Informe um código de sala com 4 a 8 caracteres.');if(socket)socket.close();socket=new WebSocket(WORKER+'/room/'+room);socket.onopen=()=>{notify('Sala online conectada: '+room);send({type:'state-request'})};socket.onmessage=e=>{try{const msg=JSON.parse(e.data);if(msg.type==='command'&&window.handleOnlineCommand)window.handleOnlineCommand(msg)}catch(_){}};socket.onerror=()=>notify('Não foi possível conectar à sala online.');socket.onclose=()=>{socket=null}};
  function send(message){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(message))}
  window.onlineControlSend=send;
  window.handleOnlineCommand=msg=>{const c=msg.command;if(c==='next')$('next')?.click();else if(c==='previous')$('previous')?.click();else if(c==='black')$('black')?.click();else if(c==='end')$('end')?.click();else if(c==='select'&&msg.book&&msg.number){book=msg.book;hymn=effective(base[book].hymns.find(h=>h.number===Number(msg.number)));part=0;renderHymn();renderResults()}};
  const panel=document.createElement('section');panel.className='onlinePanel';panel.innerHTML='<h2>Controle online</h2><p class="muted">Use o mesmo código no computador e no celular.</p><div class="onlineFields"><input id="onlineRoom" maxlength="8" placeholder="Código da sala"><button id="onlineConnect" class="primary">Conectar</button></div><p id="onlineStatus" class="muted">Desconectado</p><div id="onlineButtons"></div>';
  function mount(){const host=document.querySelector('.livePanel')||document.querySelector('.content');if(!host)return;host.prepend(panel);$('onlineRoom').value=room; $('onlineConnect').onclick=()=>connect($('onlineRoom').value); if(room)connect(room); if(isControl){document.body.classList.add('onlineControlMode');$('onlineButtons').innerHTML='<button data-c="previous">← Anterior</button><button data-c="next">Próximo →</button><button data-c="black">Tela preta</button><button data-c="end">Encerrar</button>';document.querySelectorAll('#onlineButtons [data-c]').forEach(b=>b.onclick=()=>send({type:'command',command:b.dataset.c}));}}
  const oldSync=window.sync;window.sync=function(){if(oldSync)oldSync();send({type:'state',state:typeof state==='function'?state():null})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else setTimeout(mount,0);
})();
