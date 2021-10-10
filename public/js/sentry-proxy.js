if ("Proxy" in window) {
    var handler = {
      get: function(_, key) {
        return new Proxy(function(cb) {
          if (key === "flush" || key === "close") return Promise.resolve();
          if (typeof cb === "function") return cb(window.Sentry);
          return window.Sentry;
        }, handler);
      },
    };
    window.Sentry = new Proxy({}, handler);
  }