// npm run stamp — puts a fresh VERSION into sw.js after any app file changed,
// so phones download the new version. `npm test` fails until this has been run.
import {writeFileSync} from 'node:fs';
import {SW_PATH,readSw,swFiles,swVersion,hashFiles} from './sw-version.mjs';

const sw=readSw(),old=swVersion(sw),next=hashFiles(swFiles(sw));
if(old===next){console.log(`sw.js is up to date: ${next}`);}
else{
  writeFileSync(SW_PATH,sw.replace(`const VERSION="${old}";`,`const VERSION="${next}";`));
  console.log(`sw.js version ${old} → ${next}`);
}
