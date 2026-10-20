// Jee OS frontend server. Supabase is the state backend; this server only serves the app and source seed.
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000,DIR=__dirname;
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Method Not Allowed')}
 const u=new URL(req.url,'http://127.0.0.1:'+PORT),pathname=u.pathname==='/'?'/index.html':u.pathname;
 if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(req.method==='HEAD'?'':JSON.stringify({ok:true,app:'Jee OS',port:PORT}))}
 const file=path.resolve(DIR,pathname.replace(/^\/+/,''));
 if(file!==DIR&&!file.startsWith(DIR+path.sep)){res.writeHead(403);return res.end('Forbidden')}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found')}
 const ext=path.extname(file).toLowerCase(),type=MIME[ext]||'application/octet-stream',data=fs.readFileSync(file);
 res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','Content-Length':data.length});return res.end(req.method==='HEAD'?'':data)
}catch(e){res.writeHead(500);res.end('Server error')}});
server.on('error',e=>{if(e.code==='EADDRINUSE')console.error('Port '+PORT+' is busy. Close the other app using it.');else console.error(e)});
server.listen(PORT,'127.0.0.1',()=>console.log('Jee OS running at http://localhost:'+PORT));
