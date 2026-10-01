import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.argv.includes('--dist') ? 'dist' : '.');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
createServer(async(req,res)=>{
  try {
    let path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path.startsWith('/quiet-route/')) path = path.slice('/quiet-route'.length);
    const file = resolve(root,'.'+(path.endsWith('/')?path+'index.html':path));
    if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    const data = await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'}).end(data);
  }catch{res.writeHead(404).end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173/quiet-route/'));
