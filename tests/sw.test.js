import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {ROOT,readSw,swFiles,swVersion,hashFiles,diskPath} from '../scripts/sw-version.mjs';

const sw=readSw(),files=swFiles(sw);
const read=f=>readFileSync(ROOT+f,'utf8');
const local=u=>!/^(https?:|data:|#|mailto:)/.test(u);

test('every file the service worker caches exists',()=>{
  for(const f of files)assert.ok(existsSync(diskPath(f)),f);
});

test('the service worker version matches the files (run `npm run stamp` if not)',()=>{
  assert.equal(swVersion(sw),hashFiles(files),'App files changed: run `npm run stamp`, then commit sw.js too.');
});

// Everything the page can load must be cached, or it will be missing offline.
test('the page and its files load nothing that is not cached',()=>{
  const need=new Set();
  const html=read('index.html');
  for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g))if(local(m[1]))need.add(m[1]);
  for(const f of readdirSync(ROOT+'src'))for(const m of read('src/'+f).matchAll(/from '\.\/([^']+)'/g))need.add('src/'+m[1]);
  for(const m of read('fonts/fonts.css').matchAll(/url\(([^)]+)\)/g))need.add('fonts/'+m[1]);
  for(const i of JSON.parse(read('manifest.webmanifest')).icons)need.add(i.src);
  for(const f of need)assert.ok(files.includes(f),`${f} is used but not in FILES in sw.js`);
});

test('the app registers the service worker',()=>{
  assert.match(read('src/app.js'),/serviceWorker\.register\('sw\.js'\)/);
});
