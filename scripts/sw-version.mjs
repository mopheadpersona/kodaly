// Reads the file list from sw.js and hashes those files. Shared by `npm run stamp` and the tests.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const ROOT=fileURLToPath(new URL('..',import.meta.url));
export const SW_PATH=ROOT+'sw.js';

export const readSw=()=>readFileSync(SW_PATH,'utf8');
export const swFiles=sw=>JSON.parse(sw.match(/const FILES=(\[[\s\S]*?\]);/)[1]);
export const swVersion=sw=>sw.match(/const VERSION="([0-9a-f]+)";/)[1];
// "./" is the page itself, index.html on disk.
export const diskPath=f=>ROOT+(f==='./'?'index.html':f);

export function hashFiles(files){
  const h=createHash('sha256');
  for(const f of files){h.update(f+'\0');h.update(readFileSync(diskPath(f)));h.update('\0');}
  return h.digest('hex').slice(0,12);
}
