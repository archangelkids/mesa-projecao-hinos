'use strict';
let state={blank:true,live:null,size:48,test:false,margin:5};
const text=document.getElementById('text'),meta=document.getElementById('meta'),stage=document.querySelector('main');
const pix=document.createElement('aside');pix.id='pix';pix.innerHTML='<img alt="QR Code Pix"><strong>Contribua via Pix</strong>';document.body.append(pix);
const border=document.createElement('div');border.id='testBorder';border.style.cssText='position:fixed;pointer-events:none;border:3px solid #d6e7ab;display:none';document.body.append(border);
function render(){const margin=Number(state.margin)||5,ps=Number(state.pix?.size)||18,pixOn=!!(state.pix?.show&&state.pix?.data&&!state.test);stage.style.padding=margin+'vh '+margin+'vw';text.style.width=pixOn?`calc(100% - ${ps+8}vw)`:'100%';text.style.marginLeft=pixOn&&state.pix.position!=='top-right'?'-'+Math.round((ps+8)/2)+'vw':'0';if(pixOn){const extra=Math.max(0,ps-10);stage.style.paddingRight=Math.max(margin,extra)+'vw';if(state.pix.position==='top-right'){stage.style.paddingTop=Math.max(margin,extra/2)+'vh'}}border.style.inset=margin+'vh '+margin+'vw';border.style.display=state.test?'block':'none';document.getElementById('hint').hidden=state.blank||!state.live||state.test;pix.hidden=!pixOn;pix.style.display=pix.hidden?'none':'flex';pix.style.width=ps+'vw';pix.style.right='4vw';pix.style.bottom=state.pix?.position==='top-right'?'auto':'7vh';pix.style.top=state.pix?.position==='top-right'?'7vh':'auto';if(!pix.hidden)pix.querySelector('img').src=state.pix.data;
const dual=document.getElementById('dual');
function renderLive(){
  const live=state.live;
  const raw=live?.text||'';
  const isDual=!state.test&&!state.blank&&live&&(/(?:^|\n)HOMENS:\s*/i.test(raw)||/DUPLO/i.test(live.label||''));
  if(isDual){
    const parts=raw.split(/\n\s*MULHERES:\s*/i); const male=(live.male||parts[0].replace(/^.*?HOMENS:\s*/is,'')).trim(); const female=(live.female||parts[1]||'').trim();
    text.hidden=true; dual.hidden=false; dual.querySelector('.male .body').textContent=male; dual.querySelector('.female .body').textContent=female;
  } else { dual.hidden=true; text.hidden=false; text.textContent=state.test?'TESTE DE PROJEÇÃO\nA igreja canta em uma só voz.\nÁ É Í Ó Ú · 1234567890\nConfira a borda e a leitura no fundo da igreja.':state.blank||!state.live?'':state.live.text; }
}
renderLive();
meta.textContent=state.test?'Margem: '+margin+'% · Ajuste na mesa de controle':state.blank||!state.live?'':state.live.book+' · '+state.live.number+' · '+state.live.title+' · '+state.live.label;
meta.style.bottom=Math.max(1,margin/3)+'vh';meta.style.left=margin+'vw';meta.style.right=margin+'vw';let size=state.size*(innerWidth/1280);text.style.fontSize=size+'px';while(size>8&&(text.scrollHeight>innerHeight*(1-margin*2/100)-10||text.scrollWidth>innerWidth*(1-margin*2/100))){size--;text.style.fontSize=size+'px'}}
async function fullscreen(){try{await document.documentElement.requestFullscreen()}catch(e){const hint=document.getElementById('hint');hint.hidden=false;hint.style.animation='none';hint.textContent='Pressione F11 nesta janela para tela cheia.'}}
window.addEventListener('message',e=>{if(e.source!==opener)return;if(e.data?.type==='hinos-state'){state=e.data;render()}if(e.data?.type==='hinos-fullscreen')fullscreen()});window.addEventListener('resize',render);document.getElementById('full').onclick=fullscreen;
document.addEventListener('keydown',e=>{if(e.key==='F11')return;if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen();return}e.preventDefault();if(opener&&!opener.closed)opener.postMessage({type:'hinos-key',key:e.key},'*')});
if(opener)opener.postMessage({type:'hinos-ready'},'*');setInterval(()=>{if(!opener||opener.closed){state.blank=true;state.test=false;render()}},1000);render();
