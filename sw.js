// Service worker: keeps every file of the app in a cache, so it opens and plays offline.
// VERSION is a hash of the files below. `npm run stamp` updates it; `npm test` fails while it is stale.
// A new VERSION makes the browser download a fresh, complete copy; it is used from the next launch.
const VERSION="92e2619e3470";
const FILES=[
  "./",
  "manifest.webmanifest",
  "styles.css",
  "src/app.js",
  "src/rhythm.js",
  "src/grading.js",
  "src/notation.js",
  "src/i18n.js",
  "fonts/fonts.css",
  "fonts/unbounded-latin.woff2",
  "fonts/unbounded-cyrillic.woff2",
  "fonts/golos-text-latin.woff2",
  "fonts/golos-text-cyrillic.woff2",
  "fonts/ibm-plex-mono-400-latin.woff2",
  "fonts/ibm-plex-mono-400-cyrillic.woff2",
  "fonts/ibm-plex-mono-500-latin.woff2",
  "fonts/ibm-plex-mono-500-cyrillic.woff2",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png"
];
const CACHE="tatiti-"+VERSION;

self.addEventListener("install",e=>{
  // cache:'reload' skips the browser's HTTP cache (GitHub Pages lets it keep files for 10 minutes),
  // so a new version never mixes in stale files.
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith("tatiti-")&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url),scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    // The app itself: always the cached page, whatever the query string.
    const isApp=req.mode==="navigate"&&(url.pathname===scope.pathname||url.pathname===scope.pathname+"index.html");
    const hit=isApp?await cache.match("./"):await cache.match(req,{ignoreSearch:true});
    return hit||fetch(req);
  })());
});
