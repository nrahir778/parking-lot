/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "57633a617d974a17f29907a7971a1a8e"
  }, {
    "url": "pwa-512x512.png",
    "revision": "bbe096ca5e5b3ac849a2fb1873d3832d"
  }, {
    "url": "pwa-192x192.png",
    "revision": "eecd6a2442c2f311b47e702a19b8ace9"
  }, {
    "url": "index.html",
    "revision": "15f382d51d03c98808a6f806db730e6c"
  }, {
    "url": "icon.svg",
    "revision": "9ae4437497eb94ec0bbd67724e2615e3"
  }, {
    "url": "favicon.png",
    "revision": "b41cda2f7ea7181ad081b1d6cfe277d8"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "f7906e3befa10706dbb6494ee42795f5"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/index-DvY0hlx_.js",
    "revision": null
  }, {
    "url": "assets/index-B3zBmyAk.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "f7906e3befa10706dbb6494ee42795f5"
  }, {
    "url": "favicon.png",
    "revision": "b41cda2f7ea7181ad081b1d6cfe277d8"
  }, {
    "url": "icon.svg",
    "revision": "9ae4437497eb94ec0bbd67724e2615e3"
  }, {
    "url": "pwa-192x192.png",
    "revision": "eecd6a2442c2f311b47e702a19b8ace9"
  }, {
    "url": "pwa-512x512.png",
    "revision": "bbe096ca5e5b3ac849a2fb1873d3832d"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "57633a617d974a17f29907a7971a1a8e"
  }, {
    "url": "manifest.webmanifest",
    "revision": "162f8ec3d7bdbfd7e4a2a297fd0fd8f5"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
