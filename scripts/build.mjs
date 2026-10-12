import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
const output = new URL('../dist/',import.meta.url);
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const file of ['index.html','styles.css','redesign.css','premium.css','app.js','routes.js']) await copyFile(new URL(`../${file}`,import.meta.url),new URL(file,output));
await cp(new URL('../assets/',import.meta.url),new URL('assets/',output),{recursive:true});
console.log('Static site built in dist/');
