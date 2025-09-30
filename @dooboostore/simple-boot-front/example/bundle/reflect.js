// Serve reflect-metadata polyfill from node_modules if present, otherwise use CDN fallback
(function(){
  var s = document.createElement('script');
  s.src = '../../node_modules/reflect-metadata/Reflect.js';
  s.onerror = function(){
    var cdn = document.createElement('script');
    cdn.src = 'https://unpkg.com/reflect-metadata@0.2.2/Reflect.js';
    document.head.appendChild(cdn);
  };
  document.head.appendChild(s);
})();


