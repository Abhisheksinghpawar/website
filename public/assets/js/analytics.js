// Firebase Analytics (GA4). Loaded on every page; the web config below is public by design.
(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyAu35v2KvYao8rgk0zLqmpLWWyipiLMYqI",
    authDomain: "abhisheksinghpawar-70ac7.firebaseapp.com",
    databaseURL: "https://abhisheksinghpawar-70ac7.firebaseio.com",
    projectId: "abhisheksinghpawar-70ac7",
    storageBucket: "abhisheksinghpawar-70ac7.appspot.com",
    messagingSenderId: "483538358530",
    appId: "1:483538358530:web:11ce9ac09a6798a744b21b",
    measurementId: "G-MWB9YEZPBK"
  };
  function load(src, done) {
    var s = document.createElement("script");
    s.src = src; s.async = true; s.onload = done;
    document.head.appendChild(s);
  }
  function start() {
    load("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js", function () {
      load("https://www.gstatic.com/firebasejs/8.8.0/firebase-analytics.js", function () {
        try {
          if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
          firebase.analytics();
        } catch (e) { /* analytics must never break the page */ }
      });
    });
  }
  // Keep analytics off the critical path: start once the page has loaded and the browser is idle.
  function whenIdle() { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(start, { timeout: 3000 }); }
  if (document.readyState === "complete") whenIdle(); else addEventListener("load", whenIdle);
})();
