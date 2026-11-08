const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),url=require('url'),QRCode=require('./vendor/node_modules/qrcode');
const root=__dirname, port=Number(process.env.HINOS_PORT||8787), token=crypto.randomBytes(4).toString('hex');
let state={live:null,blank:true,size:48,pix:null,program:[]}, queue=[],pixQueue=0;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
function send(res,status,data,type='application/json'){res.writeHead(status,{'Content-Type':type,'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'});if(Buffer.isBuffer(data))return res.end(data);res.end(typeof data==='string'?data:JSON.stringify(data))}
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',x=>s+=x);req.on('end',()=>{try{resolve(s?JSON.parse(s):{})}catch(e){reject(e)}})})}
const server=http.createServer(async(req,res)=>{const u=url.parse(req.url,true),p=u.pathname;
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
 if(p==='/api/info')return send(res,200,{token,control:'/controle.html?token='+token});
 if(p==='/api/qr.svg'&&req.method==='GET'){const ip=Object.values(os.networkInterfaces()).flat().find(x=>x&&x.family==='IPv4'&&!x.internal)?.address||'127.0.0.1';const target='http://'+ip+':'+(server.address()?.port||port)+'/controle.html?token='+token;try{const svg=await QRCode.toString(target,{type:'svg',margin:1});return send(res,200,svg,'image/svg+xml')}catch(e){return send(res,500,'QR unavailable','text/plain')}}
 if(p==='/api/state'&&req.method==='GET')return u.query.token===token?send(res,200,state):send(res,403,{error:'pairing'});
 if(p==='/api/state'&&req.method==='POST'){try{const x=await body(req);if(x.token!==token)return send(res,403,{error:'pairing'});delete x.pix;state=x;return send(res,200,{ok:true})}catch(e){return send(res,400,{error:'invalid state'})}}
 if(p==='/api/commands'&&req.method==='GET'){if(u.query.token!==token)return send(res,403,{error:'pairing'});const out=queue.splice(0);return send(res,200,out)}
 if(p==='/api/pix'&&req.method==='POST'){try{const x=await body(req);if(x.token!==token)return send(res,403,{error:'pairing'});pixQueue++;return send(res,200,{ok:true})}catch(e){return send(res,400,{error:'invalid command'})}}
 if(p==='/api/pix'&&req.method==='GET'){if(u.query.token!==token)return send(res,403,{error:'pairing'});const n=pixQueue;pixQueue=0;return send(res,200,{count:n})}
 if(p==='/api/command'&&req.method==='POST'){try{const x=await body(req);if(x.token!==token||!['next','previous','black','end','project','select','pix'].includes(x.command))return send(res,403,{error:'pairing'});queue.push(x);return send(res,200,{ok:true})}catch(e){return send(res,400,{error:'invalid command'})}}
 let file=p==='/'?'/index.html':p;file=path.normalize(path.join(root,file));if(!file.startsWith(root))return send(res,403,'Forbidden','text/plain');fs.readFile(file,(e,data)=>e?send(res,404,'Not found','text/plain'):send(res,200,data,types[path.extname(file)]||'application/octet-stream'));
});
function announce(activePort){fs.writeFileSync(path.join(root,'servidor.port'),String(activePort));const nets=Object.values(os.networkInterfaces()).flat().filter(x=>x&&x.family==='IPv4'&&!x.internal).map(x=>x.address);console.log('Mesa: http://localhost:'+activePort+'/');console.log('Controle: http://localhost:'+activePort+'/controle.html?token='+token);for(const ip of nets)console.log('Celular: http://'+ip+':'+activePort+'/controle.html?token='+token);console.log('Código de pareamento: '+token)}
function listenOn(candidate){server.once('error',e=>{if(e.code==='EADDRINUSE'&&candidate<port+10)return listenOn(candidate+1);console.error(e.message);process.exitCode=1});server.listen(candidate,'0.0.0.0',()=>announce(candidate))}
listenOn(port);
