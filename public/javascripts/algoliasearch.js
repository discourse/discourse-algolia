/* eslint-disable */
/*! algoliasearch.umd.js | 4.14.2 | © Algolia, inc. | https://github.com/algolia/algoliasearch-client-javascript */

!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = e())
    : "function" == typeof define && define.amd
      ? define(e)
      : ((t = t || self).algoliasearch = e());
})(this, function () {
  "use strict";
  function t(t, e, r) {
    return (
      e in t
        ? Object.defineProperty(t, e, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (t[e] = r),
      t
    );
  }
  function e(t, e) {
    var r = Object.keys(t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(t);
      e &&
        (n = n.filter(function (e) {
          return Object.getOwnPropertyDescriptor(t, e).enumerable;
        })),
        r.push.apply(r, n);
    }
    return r;
  }
  function r(r) {
    for (var n = 1; n < arguments.length; n++) {
      var a = null != arguments[n] ? arguments[n] : {};
      n % 2
        ? e(Object(a), !0).forEach(function (e) {
            t(r, e, a[e]);
          })
        : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(a))
          : e(Object(a)).forEach(function (t) {
              Object.defineProperty(
                r,
                t,
                Object.getOwnPropertyDescriptor(a, t)
              );
            });
    }
    return r;
  }
  function n(t, e) {
    if (null == t) return {};
    var r,
      n,
      a = (function (t, e) {
        if (null == t) return {};
        var r,
          n,
          a = {},
          o = Object.keys(t);
        for (n = 0; n < o.length; n++)
          (r = o[n]), e.indexOf(r) >= 0 || (a[r] = t[r]);
        return a;
      })(t, e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(t);
      for (n = 0; n < o.length; n++)
        (r = o[n]),
          e.indexOf(r) >= 0 ||
            (Object.prototype.propertyIsEnumerable.call(t, r) && (a[r] = t[r]));
    }
    return a;
  }
  function a(t, e) {
    return (
      (function (t) {
        if (Array.isArray(t)) return t;
      })(t) ||
      (function (t, e) {
        if (
          !(
            Symbol.iterator in Object(t) ||
            "[object Arguments]" === Object.prototype.toString.call(t)
          )
        )
          return;
        var r = [],
          n = !0,
          a = !1,
          o = void 0;
        try {
          for (
            var i, u = t[Symbol.iterator]();
            !(n = (i = u.next()).done) &&
            (r.push(i.value), !e || r.length !== e);
            n = !0
          );
        } catch (t) {
          (a = !0), (o = t);
        } finally {
          try {
            n || null == u.return || u.return();
          } finally {
            if (a) throw o;
          }
        }
        return r;
      })(t, e) ||
      (function () {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance"
        );
      })()
    );
  }
  function o(t) {
    return (
      (function (t) {
        if (Array.isArray(t)) {
          for (var e = 0, r = new Array(t.length); e < t.length; e++)
            r[e] = t[e];
          return r;
        }
      })(t) ||
      (function (t) {
        if (
          Symbol.iterator in Object(t) ||
          "[object Arguments]" === Object.prototype.toString.call(t)
        )
          return Array.from(t);
      })(t) ||
      (function () {
        throw new TypeError("Invalid attempt to spread non-iterable instance");
      })()
    );
  }
  function i(t) {
    var e,
      r = "algoliasearch-client-js-".concat(t.key),
      n = function () {
        return void 0 === e && (e = t.localStorage || window.localStorage), e;
      },
      o = function () {
        return JSON.parse(n().getItem(r) || "{}");
      };
    return {
      get: function (t, e) {
        var r =
          arguments.length > 2 && void 0 !== arguments[2]
            ? arguments[2]
            : {
                miss: function () {
                  return Promise.resolve();
                },
              };
        return Promise.resolve()
          .then(function () {
            var r = JSON.stringify(t),
              n = o()[r];
            return Promise.all([n || e(), void 0 !== n]);
          })
          .then(function (t) {
            var e = a(t, 2),
              n = e[0],
              o = e[1];
            return Promise.all([n, o || r.miss(n)]);
          })
          .then(function (t) {
            return a(t, 1)[0];
          });
      },
      set: function (t, e) {
        return Promise.resolve().then(function () {
          var a = o();
          return (
            (a[JSON.stringify(t)] = e), n().setItem(r, JSON.stringify(a)), e
          );
        });
      },
      delete: function (t) {
        return Promise.resolve().then(function () {
          var e = o();
          delete e[JSON.stringify(t)], n().setItem(r, JSON.stringify(e));
        });
      },
      clear: function () {
        return Promise.resolve().then(function () {
          n().removeItem(r);
        });
      },
    };
  }
  function u(t) {
    var e = o(t.caches),
      r = e.shift();
    return void 0 === r
      ? {
          get: function (t, e) {
            var r =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : {
                      miss: function () {
                        return Promise.resolve();
                      },
                    },
              n = e();
            return n
              .then(function (t) {
                return Promise.all([t, r.miss(t)]);
              })
              .then(function (t) {
                return a(t, 1)[0];
              });
          },
          set: function (t, e) {
            return Promise.resolve(e);
          },
          delete: function (t) {
            return Promise.resolve();
          },
          clear: function () {
            return Promise.resolve();
          },
        }
      : {
          get: function (t, n) {
            var a =
              arguments.length > 2 && void 0 !== arguments[2]
                ? arguments[2]
                : {
                    miss: function () {
                      return Promise.resolve();
                    },
                  };
            return r.get(t, n, a).catch(function () {
              return u({ caches: e }).get(t, n, a);
            });
          },
          set: function (t, n) {
            return r.set(t, n).catch(function () {
              return u({ caches: e }).set(t, n);
            });
          },
          delete: function (t) {
            return r.delete(t).catch(function () {
              return u({ caches: e }).delete(t);
            });
          },
          clear: function () {
            return r.clear().catch(function () {
              return u({ caches: e }).clear();
            });
          },
        };
  }
  function s() {
    var t =
        arguments.length > 0 && void 0 !== arguments[0]
          ? arguments[0]
          : { serializable: !0 },
      e = {};
    return {
      get: function (r, n) {
        var a =
            arguments.length > 2 && void 0 !== arguments[2]
              ? arguments[2]
              : {
                  miss: function () {
                    return Promise.resolve();
                  },
                },
          o = JSON.stringify(r);
        if (o in e)
          return Promise.resolve(t.serializable ? JSON.parse(e[o]) : e[o]);
        var i = n(),
          u =
            (a && a.miss) ||
            function () {
              return Promise.resolve();
            };
        return i
          .then(function (t) {
            return u(t);
          })
          .then(function () {
            return i;
          });
      },
      set: function (r, n) {
        return (
          (e[JSON.stringify(r)] = t.serializable ? JSON.stringify(n) : n),
          Promise.resolve(n)
        );
      },
      delete: function (t) {
        return delete e[JSON.stringify(t)], Promise.resolve();
      },
      clear: function () {
        return (e = {}), Promise.resolve();
      },
    };
  }
  function c(t, e, r) {
    var n = { "x-algolia-api-key": r, "x-algolia-application-id": e };
    return {
      headers: function () {
        return t === m.WithinHeaders ? n : {};
      },
      queryParameters: function () {
        return t === m.WithinQueryParameters ? n : {};
      },
    };
  }
  function f(t) {
    var e = 0;
    return t(function r() {
      return (
        e++,
        new Promise(function (n) {
          setTimeout(
            function () {
              n(t(r));
            },
            Math.min(100 * e, 1e3)
          );
        })
      );
    });
  }
  function d(t) {
    var e =
      arguments.length > 1 && void 0 !== arguments[1]
        ? arguments[1]
        : function (t, e) {
            return Promise.resolve();
          };
    return Object.assign(t, {
      wait: function (r) {
        return d(
          t
            .then(function (t) {
              return Promise.all([e(t, r), t]);
            })
            .then(function (t) {
              return t[1];
            })
        );
      },
    });
  }
  function l(t) {
    for (var e = t.length - 1; e > 0; e--) {
      var r = Math.floor(Math.random() * (e + 1)),
        n = t[e];
      (t[e] = t[r]), (t[r] = n);
    }
    return t;
  }
  function p(t, e) {
    return e
      ? (Object.keys(e).forEach(function (r) {
          t[r] = e[r](t);
        }),
        t)
      : t;
  }
  function h(t) {
    for (
      var e = arguments.length, r = new Array(e > 1 ? e - 1 : 0), n = 1;
      n < e;
      n++
    )
      r[n - 1] = arguments[n];
    var a = 0;
    return t.replace(/%s/g, function () {
      return encodeURIComponent(r[a++]);
    });
  }
  var m = { WithinQueryParameters: 0, WithinHeaders: 1 };
  function y(t, e) {
    var r = t || {},
      n = r.data || {};
    return (
      Object.keys(r).forEach(function (t) {
        -1 ===
          [
            "timeout",
            "headers",
            "queryParameters",
            "data",
            "cacheable",
          ].indexOf(t) && (n[t] = r[t]);
      }),
      {
        data: Object.entries(n).length > 0 ? n : void 0,
        timeout: r.timeout || e,
        headers: r.headers || {},
        queryParameters: r.queryParameters || {},
        cacheable: r.cacheable,
      }
    );
  }
  var g = { Read: 1, Write: 2, Any: 3 },
    v = 1,
    b = 2,
    P = 3;
  function w(t) {
    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : v;
    return r(r({}, t), {}, { status: e, lastUpdate: Date.now() });
  }
  function O(t) {
    return "string" == typeof t
      ? { protocol: "https", url: t, accept: g.Any }
      : {
          protocol: t.protocol || "https",
          url: t.url,
          accept: t.accept || g.Any,
        };
  }
  var I = "DELETE",
    x = "GET",
    j = "POST",
    D = "PUT";
  function q(t, e) {
    return Promise.all(
      e.map(function (e) {
        return t.get(e, function () {
          return Promise.resolve(w(e));
        });
      })
    ).then(function (t) {
      var r = t.filter(function (t) {
          return (function (t) {
            return t.status === v || Date.now() - t.lastUpdate > 12e4;
          })(t);
        }),
        n = t.filter(function (t) {
          return (function (t) {
            return t.status === P && Date.now() - t.lastUpdate <= 12e4;
          })(t);
        }),
        a = [].concat(o(r), o(n));
      return {
        getTimeout: function (t, e) {
          return (0 === n.length && 0 === t ? 1 : n.length + 3 + t) * e;
        },
        statelessHosts:
          a.length > 0
            ? a.map(function (t) {
                return O(t);
              })
            : e,
      };
    });
  }
  function S(t, e, n, a) {
    var i = [],
      u = (function (t, e) {
        if (t.method === x || (void 0 === t.data && void 0 === e.data)) return;
        var n = Array.isArray(t.data) ? t.data : r(r({}, t.data), e.data);
        return JSON.stringify(n);
      })(n, a),
      s = (function (t, e) {
        var n = r(r({}, t.headers), e.headers),
          a = {};
        return (
          Object.keys(n).forEach(function (t) {
            var e = n[t];
            a[t.toLowerCase()] = e;
          }),
          a
        );
      })(t, a),
      c = n.method,
      f = n.method !== x ? {} : r(r({}, n.data), a.data),
      d = r(
        r(r({ "x-algolia-agent": t.userAgent.value }, t.queryParameters), f),
        a.queryParameters
      ),
      l = 0,
      p = function e(r, o) {
        var f = r.pop();
        if (void 0 === f)
          throw {
            name: "RetryError",
            message:
              "Unreachable hosts - your application id may be incorrect. If the error persists, contact support@algolia.com.",
            transporterStackTrace: R(i),
          };
        var p = {
            data: u,
            headers: s,
            method: c,
            url: N(f, n.path, d),
            connectTimeout: o(l, t.timeouts.connect),
            responseTimeout: o(l, a.timeout),
          },
          h = function (t) {
            var e = {
              request: p,
              response: t,
              host: f,
              triesLeft: r.length,
            };
            return i.push(e), e;
          },
          m = {
            onSuccess: function (t) {
              return (function (t) {
                try {
                  return JSON.parse(t.content);
                } catch (e) {
                  throw (function (t, e) {
                    return {
                      name: "DeserializationError",
                      message: t,
                      response: e,
                    };
                  })(e.message, t);
                }
              })(t);
            },
            onRetry: function (n) {
              var a = h(n);
              return (
                n.isTimedOut && l++,
                Promise.all([
                  t.logger.info("Retryable failure", A(a)),
                  t.hostsCache.set(f, w(f, n.isTimedOut ? P : b)),
                ]).then(function () {
                  return e(r, o);
                })
              );
            },
            onFail: function (t) {
              throw (
                (h(t),
                (function (t, e) {
                  var r = t.content,
                    n = t.status,
                    a = r;
                  try {
                    a = JSON.parse(r).message;
                  } catch (t) {}
                  return (function (t, e, r) {
                    return {
                      name: "ApiError",
                      message: t,
                      status: e,
                      transporterStackTrace: r,
                    };
                  })(a, n, e);
                })(t, R(i)))
              );
            },
          };
        return t.requester.send(p).then(function (t) {
          return (function (t, e) {
            return (function (t) {
              var e = t.status;
              return (
                t.isTimedOut ||
                (function (t) {
                  var e = t.isTimedOut,
                    r = t.status;
                  return !e && 0 == ~~r;
                })(t) ||
                (2 != ~~(e / 100) && 4 != ~~(e / 100))
              );
            })(t)
              ? e.onRetry(t)
              : 2 == ~~(t.status / 100)
                ? e.onSuccess(t)
                : e.onFail(t);
          })(t, m);
        });
      };
    return q(t.hostsCache, e).then(function (t) {
      return p(o(t.statelessHosts).reverse(), t.getTimeout);
    });
  }
  function k(t) {
    var e = t.hostsCache,
      r = t.logger,
      n = t.requester,
      o = t.requestsCache,
      i = t.responsesCache,
      u = t.timeouts,
      s = t.userAgent,
      c = t.hosts,
      f = t.queryParameters,
      d = {
        hostsCache: e,
        logger: r,
        requester: n,
        requestsCache: o,
        responsesCache: i,
        timeouts: u,
        userAgent: s,
        headers: t.headers,
        queryParameters: f,
        hosts: c.map(function (t) {
          return O(t);
        }),
        read: function (t, e) {
          var r = y(e, d.timeouts.read),
            n = function () {
              return S(
                d,
                d.hosts.filter(function (t) {
                  return 0 != (t.accept & g.Read);
                }),
                t,
                r
              );
            };
          if (!0 !== (void 0 !== r.cacheable ? r.cacheable : t.cacheable))
            return n();
          var o = {
            request: t,
            mappedRequestOptions: r,
            transporter: {
              queryParameters: d.queryParameters,
              headers: d.headers,
            },
          };
          return d.responsesCache.get(
            o,
            function () {
              return d.requestsCache.get(o, function () {
                return d.requestsCache
                  .set(o, n())
                  .then(
                    function (t) {
                      return Promise.all([d.requestsCache.delete(o), t]);
                    },
                    function (t) {
                      return Promise.all([
                        d.requestsCache.delete(o),
                        Promise.reject(t),
                      ]);
                    }
                  )
                  .then(function (t) {
                    var e = a(t, 2);
                    e[0];
                    return e[1];
                  });
              });
            },
            {
              miss: function (t) {
                return d.responsesCache.set(o, t);
              },
            }
          );
        },
        write: function (t, e) {
          return S(
            d,
            d.hosts.filter(function (t) {
              return 0 != (t.accept & g.Write);
            }),
            t,
            y(e, d.timeouts.write)
          );
        },
      };
    return d;
  }
  function T(t) {
    var e = {
      value: "Algolia for JavaScript (".concat(t, ")"),
      add: function (t) {
        var r = "; "
          .concat(t.segment)
          .concat(void 0 !== t.version ? " (".concat(t.version, ")") : "");
        return (
          -1 === e.value.indexOf(r) && (e.value = "".concat(e.value).concat(r)),
          e
        );
      },
    };
    return e;
  }
  function N(t, e, r) {
    var n = E(r),
      a = ""
        .concat(t.protocol, "://")
        .concat(t.url, "/")
        .concat("/" === e.charAt(0) ? e.substr(1) : e);
    return n.length && (a += "?".concat(n)), a;
  }
  function E(t) {
    return Object.keys(t)
      .map(function (e) {
        return h(
          "%s=%s",
          e,
          ((r = t[e]),
          "[object Object]" === Object.prototype.toString.call(r) ||
          "[object Array]" === Object.prototype.toString.call(r)
            ? JSON.stringify(t[e])
            : t[e])
        );
        var r;
      })
      .join("&");
  }
  function R(t) {
    return t.map(function (t) {
      return A(t);
    });
  }
  function A(t) {
    var e = t.request.headers["x-algolia-api-key"]
      ? { "x-algolia-api-key": "*****" }
      : {};
    return r(
      r({}, t),
      {},
      {
        request: r(
          r({}, t.request),
          {},
          { headers: r(r({}, t.request.headers), e) }
        ),
      }
    );
  }
  var C = function (t) {
      return function (e, r) {
        return t.transporter.write(
          { method: j, path: "2/abtests", data: e },
          r
        );
      };
    },
    U = function (t) {
      return function (e, r) {
        return t.transporter.write(
          { method: I, path: h("2/abtests/%s", e) },
          r
        );
      };
    },
    z = function (t) {
      return function (e, r) {
        return t.transporter.read({ method: x, path: h("2/abtests/%s", e) }, r);
      };
    },
    J = function (t) {
      return function (e) {
        return t.transporter.read({ method: x, path: "2/abtests" }, e);
      };
    },
    F = function (t) {
      return function (e, r) {
        return t.transporter.write(
          { method: j, path: h("2/abtests/%s/stop", e) },
          r
        );
      };
    },
    H = function (t) {
      return function (e) {
        return t.transporter.read(
          { method: x, path: "1/strategies/personalization" },
          e
        );
      };
    },
    M = function (t) {
      return function (e, r) {
        return t.transporter.write(
          { method: j, path: "1/strategies/personalization", data: e },
          r
        );
      };
    };
  function K(t) {
    return (function e(r) {
      return t.request(r).then(function (n) {
        if ((void 0 !== t.batch && t.batch(n.hits), !t.shouldStop(n)))
          return n.cursor
            ? e({ cursor: n.cursor })
            : e({ page: (r.page || 0) + 1 });
      });
    })({});
  }
  var W = function (t) {
      return function (e, a) {
        var o = a || {},
          i = o.queryParameters,
          u = n(o, ["queryParameters"]),
          s = r({ acl: e }, void 0 !== i ? { queryParameters: i } : {});
        return d(
          t.transporter.write({ method: j, path: "1/keys", data: s }, u),
          function (e, r) {
            return f(function (n) {
              return tt(t)(e.key, r).catch(function (t) {
                if (404 !== t.status) throw t;
                return n();
              });
            });
          }
        );
      };
    },
    B = function (t) {
      return function (e, r, n) {
        var a = y(n);
        return (
          (a.queryParameters["X-Algolia-User-ID"] = e),
          t.transporter.write(
            { method: j, path: "1/clusters/mapping", data: { cluster: r } },
            a
          )
        );
      };
    },
    Q = function (t) {
      return function (e, r, n) {
        return t.transporter.write(
          {
            method: j,
            path: "1/clusters/mapping/batch",
            data: { users: e, cluster: r },
          },
          n
        );
      };
    },
    G = function (t) {
      return function (e, r) {
        return d(
          t.transporter.write(
            {
              method: j,
              path: h("/1/dictionaries/%s/batch", e),
              data: {
                clearExistingDictionaryEntries: !0,
                requests: { action: "addEntry", body: [] },
              },
            },
            r
          ),
          function (e, r) {
            return jt(t)(e.taskID, r);
          }
        );
      };
    },
    L = function (t) {
      return function (e, r, n) {
        return d(
          t.transporter.write(
            {
              method: j,
              path: h("1/indexes/%s/operation", e),
              data: { operation: "copy", destination: r },
            },
            n
          ),
          function (r, n) {
            return ut(t)(e, { methods: { waitTask: de } }).waitTask(
              r.taskID,
              n
            );
          }
        );
      };
    },
    V = function (t) {
      return function (e, n, a) {
        return L(t)(e, n, r(r({}, a), {}, { scope: [pe.Rules] }));
      };
    },
    _ = function (t) {
      return function (e, n, a) {
        return L(t)(e, n, r(r({}, a), {}, { scope: [pe.Settings] }));
      };
    },
    X = function (t) {
      return function (e, n, a) {
        return L(t)(e, n, r(r({}, a), {}, { scope: [pe.Synonyms] }));
      };
    },
    Y = function (t) {
      return function (e, r) {
        return e.method === x
          ? t.transporter.read(e, r)
          : t.transporter.write(e, r);
      };
    },
    Z = function (t) {
      return function (e, r) {
        return d(
          t.transporter.write({ method: I, path: h("1/keys/%s", e) }, r),
          function (r, n) {
            return f(function (r) {
              return tt(t)(e, n)
                .then(r)
                .catch(function (t) {
                  if (404 !== t.status) throw t;
                });
            });
          }
        );
      };
    },
    $ = function (t) {
      return function (e, r, n) {
        var a = r.map(function (t) {
          return { action: "deleteEntry", body: { objectID: t } };
        });
        return d(
          t.transporter.write(
            {
              method: j,
              path: h("/1/dictionaries/%s/batch", e),
              data: { clearExistingDictionaryEntries: !1, requests: a },
            },
            n
          ),
          function (e, r) {
            return jt(t)(e.taskID, r);
          }
        );
      };
    },
    tt = function (t) {
      return function (e, r) {
        return t.transporter.read({ method: x, path: h("1/keys/%s", e) }, r);
      };
    },
    et = function (t) {
      return function (e, r) {
        return t.transporter.read(
          { method: x, path: h("1/task/%s", e.toString()) },
          r
        );
      };
    },
    rt = function (t) {
      return function (e) {
        return t.transporter.read(
          { method: x, path: "/1/dictionaries/*/settings" },
          e
        );
      };
    },
    nt = function (t) {
      return function (e) {
        return t.transporter.read({ method: x, path: "1/logs" }, e);
      };
    },
    at = function (t) {
      return function (e) {
        return t.transporter.read(
          { method: x, path: "1/clusters/mapping/top" },
          e
        );
      };
    },
    ot = function (t) {
      return function (e, r) {
        return t.transporter.read(
          { method: x, path: h("1/clusters/mapping/%s", e) },
          r
        );
      };
    },
    it = function (t) {
      return function (e) {
        var r = e || {},
          a = r.retrieveMappings,
          o = n(r, ["retrieveMappings"]);
        return (
          !0 === a && (o.getClusters = !0),
          t.transporter.read(
            { method: x, path: "1/clusters/mapping/pending" },
            o
          )
        );
      };
    },
    ut = function (t) {
      return function (e) {
        var r =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          n = { transporter: t.transporter, appId: t.appId, indexName: e };
        return p(n, r.methods);
      };
    },
    st = function (t) {
      return function (e) {
        return t.transporter.read({ method: x, path: "1/keys" }, e);
      };
    },
    ct = function (t) {
      return function (e) {
        return t.transporter.read({ method: x, path: "1/clusters" }, e);
      };
    },
    ft = function (t) {
      return function (e) {
        return t.transporter.read({ method: x, path: "1/indexes" }, e);
      };
    },
    dt = function (t) {
      return function (e) {
        return t.transporter.read({ method: x, path: "1/clusters/mapping" }, e);
      };
    },
    lt = function (t) {
      return function (e, r, n) {
        return d(
          t.transporter.write(
            {
              method: j,
              path: h("1/indexes/%s/operation", e),
              data: { operation: "move", destination: r },
            },
            n
          ),
          function (r, n) {
            return ut(t)(e, { methods: { waitTask: de } }).waitTask(
              r.taskID,
              n
            );
          }
        );
      };
    },
    pt = function (t) {
      return function (e, r) {
        return d(
          t.transporter.write(
            { method: j, path: "1/indexes/*/batch", data: { requests: e } },
            r
          ),
          function (e, r) {
            return Promise.all(
              Object.keys(e.taskID).map(function (n) {
                return ut(t)(n, { methods: { waitTask: de } }).waitTask(
                  e.taskID[n],
                  r
                );
              })
            );
          }
        );
      };
    },
    ht = function (t) {
      return function (e, r) {
        return t.transporter.read(
          { method: j, path: "1/indexes/*/objects", data: { requests: e } },
          r
        );
      };
    },
    mt = function (t) {
      return function (e, n) {
        var a = e.map(function (t) {
          return r(r({}, t), {}, { params: E(t.params || {}) });
        });
        return t.transporter.read(
          {
            method: j,
            path: "1/indexes/*/queries",
            data: { requests: a },
            cacheable: !0,
          },
          n
        );
      };
    },
    yt = function (t) {
      return function (e, a) {
        return Promise.all(
          e.map(function (e) {
            var o = e.params,
              i = o.facetName,
              u = o.facetQuery,
              s = n(o, ["facetName", "facetQuery"]);
            return ut(t)(e.indexName, {
              methods: { searchForFacetValues: ue },
            }).searchForFacetValues(i, u, r(r({}, a), s));
          })
        );
      };
    },
    gt = function (t) {
      return function (e, r) {
        var n = y(r);
        return (
          (n.queryParameters["X-Algolia-User-ID"] = e),
          t.transporter.write({ method: I, path: "1/clusters/mapping" }, n)
        );
      };
    },
    vt = function (t) {
      return function (e, r, n) {
        var a = r.map(function (t) {
          return { action: "addEntry", body: t };
        });
        return d(
          t.transporter.write(
            {
              method: j,
              path: h("/1/dictionaries/%s/batch", e),
              data: { clearExistingDictionaryEntries: !0, requests: a },
            },
            n
          ),
          function (e, r) {
            return jt(t)(e.taskID, r);
          }
        );
      };
    },
    bt = function (t) {
      return function (e, r) {
        return d(
          t.transporter.write(
            { method: j, path: h("1/keys/%s/restore", e) },
            r
          ),
          function (r, n) {
            return f(function (r) {
              return tt(t)(e, n).catch(function (t) {
                if (404 !== t.status) throw t;
                return r();
              });
            });
          }
        );
      };
    },
    Pt = function (t) {
      return function (e, r, n) {
        var a = r.map(function (t) {
          return { action: "addEntry", body: t };
        });
        return d(
          t.transporter.write(
            {
              method: j,
              path: h("/1/dictionaries/%s/batch", e),
              data: { clearExistingDictionaryEntries: !1, requests: a },
            },
            n
          ),
          function (e, r) {
            return jt(t)(e.taskID, r);
          }
        );
      };
    },
    wt = function (t) {
      return function (e, r, n) {
        return t.transporter.read(
          {
            method: j,
            path: h("/1/dictionaries/%s/search", e),
            data: { query: r },
            cacheable: !0,
          },
          n
        );
      };
    },
    Ot = function (t) {
      return function (e, r) {
        return t.transporter.read(
          {
            method: j,
            path: "1/clusters/mapping/search",
            data: { query: e },
          },
          r
        );
      };
    },
    It = function (t) {
      return function (e, r) {
        return d(
          t.transporter.write(
            { method: D, path: "/1/dictionaries/*/settings", data: e },
            r
          ),
          function (e, r) {
            return jt(t)(e.taskID, r);
          }
        );
      };
    },
    xt = function (t) {
      return function (e, r) {
        var a = Object.assign({}, r),
          o = r || {},
          i = o.queryParameters,
          u = n(o, ["queryParameters"]),
          s = i ? { queryParameters: i } : {},
          c = [
            "acl",
            "indexes",
            "referers",
            "restrictSources",
            "queryParameters",
            "description",
            "maxQueriesPerIPPerHour",
            "maxHitsPerQuery",
          ];
        return d(
          t.transporter.write(
            { method: D, path: h("1/keys/%s", e), data: s },
            u
          ),
          function (r, n) {
            return f(function (r) {
              return tt(t)(e, n).then(function (t) {
                return (function (t) {
                  return Object.keys(a)
                    .filter(function (t) {
                      return -1 !== c.indexOf(t);
                    })
                    .every(function (e) {
                      return t[e] === a[e];
                    });
                })(t)
                  ? Promise.resolve()
                  : r();
              });
            });
          }
        );
      };
    },
    jt = function (t) {
      return function (e, r) {
        return f(function (n) {
          return et(t)(e, r).then(function (t) {
            return "published" !== t.status ? n() : void 0;
          });
        });
      };
    },
    Dt = function (t) {
      return function (e, r) {
        return d(
          t.transporter.write(
            {
              method: j,
              path: h("1/indexes/%s/batch", t.indexName),
              data: { requests: e },
            },
            r
          ),
          function (e, r) {
            return de(t)(e.taskID, r);
          }
        );
      };
    },
    qt = function (t) {
      return function (e) {
        return K(
          r(
            r(
              {
                shouldStop: function (t) {
                  return void 0 === t.cursor;
                },
              },
              e
            ),
            {},
            {
              request: function (r) {
                return t.transporter.read(
                  {
                    method: j,
                    path: h("1/indexes/%s/browse", t.indexName),
                    data: r,
                  },
                  e
                );
              },
            }
          )
        );
      };
    },
    St = function (t) {
      return function (e) {
        var n = r({ hitsPerPage: 1e3 }, e);
        return K(
          r(
            r(
              {
                shouldStop: function (t) {
                  return t.hits.length < n.hitsPerPage;
                },
              },
              n
            ),
            {},
            {
              request: function (e) {
                return se(t)("", r(r({}, n), e)).then(function (t) {
                  return r(
                    r({}, t),
                    {},
                    {
                      hits: t.hits.map(function (t) {
                        return delete t._highlightResult, t;
                      }),
                    }
                  );
                });
              },
            }
          )
        );
      };
    },
    kt = function (t) {
      return function (e) {
        var n = r({ hitsPerPage: 1e3 }, e);
        return K(
          r(
            r(
              {
                shouldStop: function (t) {
                  return t.hits.length < n.hitsPerPage;
                },
              },
              n
            ),
            {},
            {
              request: function (e) {
                return ce(t)("", r(r({}, n), e)).then(function (t) {
                  return r(
                    r({}, t),
                    {},
                    {
                      hits: t.hits.map(function (t) {
                        return delete t._highlightResult, t;
                      }),
                    }
                  );
                });
              },
            }
          )
        );
      };
    },
    Tt = function (t) {
      return function (e, r, a) {
        var o = a || {},
          i = o.batchSize,
          u = n(o, ["batchSize"]),
          s = { taskIDs: [], objectIDs: [] };
        return d(
          (function n() {
            var a,
              o =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : 0,
              c = [];
            for (
              a = o;
              a < e.length && (c.push(e[a]), c.length !== (i || 1e3));
              a++
            );
            return 0 === c.length
              ? Promise.resolve(s)
              : Dt(t)(
                  c.map(function (t) {
                    return { action: r, body: t };
                  }),
                  u
                ).then(function (t) {
                  return (
                    (s.objectIDs = s.objectIDs.concat(t.objectIDs)),
                    s.taskIDs.push(t.taskID),
                    a++,
                    n(a)
                  );
                });
          })(),
          function (e, r) {
            return Promise.all(
              e.taskIDs.map(function (e) {
                return de(t)(e, r);
              })
            );
          }
        );
      };
    },
    Nt = function (t) {
      return function (e) {
        return d(
          t.transporter.write(
            { method: j, path: h("1/indexes/%s/clear", t.indexName) },
            e
          ),
          function (e, r) {
            return de(t)(e.taskID, r);
          }
        );
      };
    },
    Et = function (t) {
      return function (e) {
        var r = e || {},
          a = r.forwardToReplicas,
          o = y(n(r, ["forwardToReplicas"]));
        return (
          a && (o.queryParameters.forwardToReplicas = 1),
          d(
            t.transporter.write(
              {
                method: j,
                path: h("1/indexes/%s/rules/clear", t.indexName),
              },
              o
            ),
            function (e, r) {
              return de(t)(e.taskID, r);
            }
          )
        );
      };
    },
    Rt = function (t) {
      return function (e) {
        var r = e || {},
          a = r.forwardToReplicas,
          o = y(n(r, ["forwardToReplicas"]));
        return (
          a && (o.queryParameters.forwardToReplicas = 1),
          d(
            t.transporter.write(
              {
                method: j,
                path: h("1/indexes/%s/synonyms/clear", t.indexName),
              },
              o
            ),
            function (e, r) {
              return de(t)(e.taskID, r);
            }
          )
        );
      };
    },
    At = function (t) {
      return function (e, r) {
        return d(
          t.transporter.write(
            {
              method: j,
              path: h("1/indexes/%s/deleteByQuery", t.indexName),
              data: e,
            },
            r
          ),
          function (e, r) {
            return de(t)(e.taskID, r);
          }
        );
      };
    },
    Ct = function (t) {
      return function (e) {
        return d(
          t.transporter.write(
            { method: I, path: h("1/indexes/%s", t.indexName) },
            e
          ),
          function (e, r) {
            return de(t)(e.taskID, r);
          }
        );
      };
    },
    Ut = function (t) {
      return function (e, r) {
        return d(
          zt(t)([e], r).then(function (t) {
            return { taskID: t.taskIDs[0] };
          }),
          function (e, r) {
            return de(t)(e.taskID, r);
          }
        );
      };
    },
    zt = function (t) {
      return function (e, r) {
        var n = e.map(function (t) {
          return { objectID: t };
        });
        return Tt(t)(n, le.DeleteObject, r);
      };
    },
    Jt = function (t) {
      return function (e, r) {
        var a = r || {},
          o = a.forwardToReplicas,
          i = y(n(a, ["forwardToReplicas"]));
        return (
          o && (i.queryParameters.forwardToReplicas = 1),
          d(
            t.transporter.write(
              {
                method: I,
                path: h("1/indexes/%s/rules/%s", t.indexName, e),
              },
              i
            ),
            function (e, r) {
              return de(t)(e.taskID, r);
            }
          )
        );
      };
    },
    Ft = function (t) {
      return function (e, r) {
        var a = r || {},
          o = a.forwardToReplicas,
          i = y(n(a, ["forwardToReplicas"]));
        return (
          o && (i.queryParameters.forwardToReplicas = 1),
          d(
            t.transporter.write(
              {
                method: I,
                path: h("1/indexes/%s/synonyms/%s", t.indexName, e),
              },
              i
            ),
            function (e, r) {
              return de(t)(e.taskID, r);
            }
          )
        );
      };
    },
    Ht = function (t) {
      return function (e) {
        return Lt(t)(e)
          .then(function () {
            return !0;
          })
          .catch(function (t) {
            if (404 !== t.status) throw t;
            return !1;
          });
      };
    },
    Mt = function (t) {
      return function (e, r, n) {
        return t.transporter.read(
          {
            method: j,
            path: h("1/answers/%s/prediction", t.indexName),
            data: { query: e, queryLanguages: r },
            cacheable: !0,
          },
          n
        );
      };
    },
    Kt = function (t) {
      return function (e, o) {
        var i = o || {},
          u = i.query,
          s = i.paginate,
          c = n(i, ["query", "paginate"]),
          f = 0;
        return (function n() {
          return ie(t)(u || "", r(r({}, c), {}, { page: f })).then(
            function (t) {
              for (var r = 0, o = Object.entries(t.hits); r < o.length; r++) {
                var i = a(o[r], 2),
                  u = i[0],
                  c = i[1];
                if (e(c))
                  return { object: c, position: parseInt(u, 10), page: f };
              }
              if ((f++, !1 === s || f >= t.nbPages))
                throw {
                  name: "ObjectNotFoundError",
                  message: "Object not found.",
                };
              return n();
            }
          );
        })();
      };
    },
    Wt = function (t) {
      return function (e, r) {
        return t.transporter.read(
          { method: x, path: h("1/indexes/%s/%s", t.indexName, e) },
          r
        );
      };
    },
    Bt = function () {
      return function (t, e) {
        for (var r = 0, n = Object.entries(t.hits); r < n.length; r++) {
          var o = a(n[r], 2),
            i = o[0];
          if (o[1].objectID === e) return parseInt(i, 10);
        }
        return -1;
      };
    },
    Qt = function (t) {
      return function (e, a) {
        var o = a || {},
          i = o.attributesToRetrieve,
          u = n(o, ["attributesToRetrieve"]),
          s = e.map(function (e) {
            return r(
              { indexName: t.indexName, objectID: e },
              i ? { attributesToRetrieve: i } : {}
            );
          });
        return t.transporter.read(
          { method: j, path: "1/indexes/*/objects", data: { requests: s } },
          u
        );
      };
    },
    Gt = function (t) {
      return function (e, r) {
        return t.transporter.read(
          { method: x, path: h("1/indexes/%s/rules/%s", t.indexName, e) },
          r
        );
      };
    },
    Lt = function (t) {
      return function (e) {
        return t.transporter.read(
          {
            method: x,
            path: h("1/indexes/%s/settings", t.indexName),
            data: { getVersion: 2 },
          },
          e
        );
      };
    },
    Vt = function (t) {
      return function (e, r) {
        return t.transporter.read(
          {
            method: x,
            path: h("1/indexes/%s/synonyms/%s", t.indexName, e),
          },
          r
        );
      };
    },
    _t = function (t) {
      return function (e, r) {
        return d(
          Xt(t)([e], r).then(function (t) {
            return { objectID: t.objectIDs[0], taskID: t.taskIDs[0] };
          }),
          function (e, r) {
            return de(t)(e.taskID, r);
          }
        );
      };
    },
    Xt = function (t) {
      return function (e, r) {
        var a = r || {},
          o = a.createIfNotExists,
          i = n(a, ["createIfNotExists"]),
          u = o ? le.PartialUpdateObject : le.PartialUpdateObjectNoCreate;
        return Tt(t)(e, u, i);
      };
    },
    Yt = function (t) {
      return function (e, i) {
        var u = i || {},
          s = u.safe,
          c = u.autoGenerateObjectIDIfNotExist,
          f = u.batchSize,
          l = n(u, ["safe", "autoGenerateObjectIDIfNotExist", "batchSize"]),
          p = function (e, r, n, a) {
            return d(
              t.transporter.write(
                {
                  method: j,
                  path: h("1/indexes/%s/operation", e),
                  data: { operation: n, destination: r },
                },
                a
              ),
              function (e, r) {
                return de(t)(e.taskID, r);
              }
            );
          },
          m = Math.random().toString(36).substring(7),
          y = "".concat(t.indexName, "_tmp_").concat(m),
          g = ee({
            appId: t.appId,
            transporter: t.transporter,
            indexName: y,
          }),
          v = [],
          b = p(
            t.indexName,
            y,
            "copy",
            r(r({}, l), {}, { scope: ["settings", "synonyms", "rules"] })
          );
        return (
          v.push(b),
          d(
            (s ? b.wait(l) : b)
              .then(function () {
                var t = g(
                  e,
                  r(
                    r({}, l),
                    {},
                    { autoGenerateObjectIDIfNotExist: c, batchSize: f }
                  )
                );
                return v.push(t), s ? t.wait(l) : t;
              })
              .then(function () {
                var e = p(y, t.indexName, "move", l);
                return v.push(e), s ? e.wait(l) : e;
              })
              .then(function () {
                return Promise.all(v);
              })
              .then(function (t) {
                var e = a(t, 3),
                  r = e[0],
                  n = e[1],
                  i = e[2];
                return {
                  objectIDs: n.objectIDs,
                  taskIDs: [r.taskID].concat(o(n.taskIDs), [i.taskID]),
                };
              }),
            function (t, e) {
              return Promise.all(
                v.map(function (t) {
                  return t.wait(e);
                })
              );
            }
          )
        );
      };
    },
    Zt = function (t) {
      return function (e, n) {
        return ne(t)(e, r(r({}, n), {}, { clearExistingRules: !0 }));
      };
    },
    $t = function (t) {
      return function (e, n) {
        return oe(t)(e, r(r({}, n), {}, { clearExistingSynonyms: !0 }));
      };
    },
    te = function (t) {
      return function (e, r) {
        return d(
          ee(t)([e], r).then(function (t) {
            return { objectID: t.objectIDs[0], taskID: t.taskIDs[0] };
          }),
          function (e, r) {
            return de(t)(e.taskID, r);
          }
        );
      };
    },
    ee = function (t) {
      return function (e, r) {
        var a = r || {},
          o = a.autoGenerateObjectIDIfNotExist,
          i = n(a, ["autoGenerateObjectIDIfNotExist"]),
          u = o ? le.AddObject : le.UpdateObject;
        if (u === le.UpdateObject) {
          var s = !0,
            c = !1,
            f = void 0;
          try {
            for (
              var l, p = e[Symbol.iterator]();
              !(s = (l = p.next()).done);
              s = !0
            ) {
              if (void 0 === l.value.objectID)
                return d(
                  Promise.reject({
                    name: "MissingObjectIDError",
                    message:
                      "All objects must have an unique objectID (like a primary key) to be valid. Algolia is also able to generate objectIDs automatically but *it's not recommended*. To do it, use the `{'autoGenerateObjectIDIfNotExist': true}` option.",
                  })
                );
            }
          } catch (t) {
            (c = !0), (f = t);
          } finally {
            try {
              s || null == p.return || p.return();
            } finally {
              if (c) throw f;
            }
          }
        }
        return Tt(t)(e, u, i);
      };
    },
    re = function (t) {
      return function (e, r) {
        return ne(t)([e], r);
      };
    },
    ne = function (t) {
      return function (e, r) {
        var a = r || {},
          o = a.forwardToReplicas,
          i = a.clearExistingRules,
          u = y(n(a, ["forwardToReplicas", "clearExistingRules"]));
        return (
          o && (u.queryParameters.forwardToReplicas = 1),
          i && (u.queryParameters.clearExistingRules = 1),
          d(
            t.transporter.write(
              {
                method: j,
                path: h("1/indexes/%s/rules/batch", t.indexName),
                data: e,
              },
              u
            ),
            function (e, r) {
              return de(t)(e.taskID, r);
            }
          )
        );
      };
    },
    ae = function (t) {
      return function (e, r) {
        return oe(t)([e], r);
      };
    },
    oe = function (t) {
      return function (e, r) {
        var a = r || {},
          o = a.forwardToReplicas,
          i = a.clearExistingSynonyms,
          u = a.replaceExistingSynonyms,
          s = y(
            n(a, [
              "forwardToReplicas",
              "clearExistingSynonyms",
              "replaceExistingSynonyms",
            ])
          );
        return (
          o && (s.queryParameters.forwardToReplicas = 1),
          (u || i) && (s.queryParameters.replaceExistingSynonyms = 1),
          d(
            t.transporter.write(
              {
                method: j,
                path: h("1/indexes/%s/synonyms/batch", t.indexName),
                data: e,
              },
              s
            ),
            function (e, r) {
              return de(t)(e.taskID, r);
            }
          )
        );
      };
    },
    ie = function (t) {
      return function (e, r) {
        return t.transporter.read(
          {
            method: j,
            path: h("1/indexes/%s/query", t.indexName),
            data: { query: e },
            cacheable: !0,
          },
          r
        );
      };
    },
    ue = function (t) {
      return function (e, r, n) {
        return t.transporter.read(
          {
            method: j,
            path: h("1/indexes/%s/facets/%s/query", t.indexName, e),
            data: { facetQuery: r },
            cacheable: !0,
          },
          n
        );
      };
    },
    se = function (t) {
      return function (e, r) {
        return t.transporter.read(
          {
            method: j,
            path: h("1/indexes/%s/rules/search", t.indexName),
            data: { query: e },
          },
          r
        );
      };
    },
    ce = function (t) {
      return function (e, r) {
        return t.transporter.read(
          {
            method: j,
            path: h("1/indexes/%s/synonyms/search", t.indexName),
            data: { query: e },
          },
          r
        );
      };
    },
    fe = function (t) {
      return function (e, r) {
        var a = r || {},
          o = a.forwardToReplicas,
          i = y(n(a, ["forwardToReplicas"]));
        return (
          o && (i.queryParameters.forwardToReplicas = 1),
          d(
            t.transporter.write(
              {
                method: D,
                path: h("1/indexes/%s/settings", t.indexName),
                data: e,
              },
              i
            ),
            function (e, r) {
              return de(t)(e.taskID, r);
            }
          )
        );
      };
    },
    de = function (t) {
      return function (e, r) {
        return f(function (n) {
          return (function (t) {
            return function (e, r) {
              return t.transporter.read(
                {
                  method: x,
                  path: h("1/indexes/%s/task/%s", t.indexName, e.toString()),
                },
                r
              );
            };
          })(t)(e, r).then(function (t) {
            return "published" !== t.status ? n() : void 0;
          });
        });
      };
    },
    le = {
      AddObject: "addObject",
      UpdateObject: "updateObject",
      PartialUpdateObject: "partialUpdateObject",
      PartialUpdateObjectNoCreate: "partialUpdateObjectNoCreate",
      DeleteObject: "deleteObject",
      DeleteIndex: "delete",
      ClearIndex: "clear",
    },
    pe = { Settings: "settings", Synonyms: "synonyms", Rules: "rules" },
    he = 1,
    me = 2,
    ye = 3;
  function ge(t, e, n) {
    var a,
      o = {
        appId: t,
        apiKey: e,
        timeouts: { connect: 1, read: 2, write: 30 },
        requester: {
          send: function (t) {
            return new Promise(function (e) {
              var r = new XMLHttpRequest();
              r.open(t.method, t.url, !0),
                Object.keys(t.headers).forEach(function (e) {
                  return r.setRequestHeader(e, t.headers[e]);
                });
              var n,
                a = function (t, n) {
                  return setTimeout(function () {
                    r.abort(), e({ status: 0, content: n, isTimedOut: !0 });
                  }, 1e3 * t);
                },
                o = a(t.connectTimeout, "Connection timeout");
              (r.onreadystatechange = function () {
                r.readyState > r.OPENED &&
                  void 0 === n &&
                  (clearTimeout(o),
                  (n = a(t.responseTimeout, "Socket timeout")));
              }),
                (r.onerror = function () {
                  0 === r.status &&
                    (clearTimeout(o),
                    clearTimeout(n),
                    e({
                      content: r.responseText || "Network request failed",
                      status: r.status,
                      isTimedOut: !1,
                    }));
                }),
                (r.onload = function () {
                  clearTimeout(o),
                    clearTimeout(n),
                    e({
                      content: r.responseText,
                      status: r.status,
                      isTimedOut: !1,
                    });
                }),
                r.send(t.data);
            });
          },
        },
        logger:
          ((a = ye),
          {
            debug: function (t, e) {
              return he >= a && console.debug(t, e), Promise.resolve();
            },
            info: function (t, e) {
              return me >= a && console.info(t, e), Promise.resolve();
            },
            error: function (t, e) {
              return console.error(t, e), Promise.resolve();
            },
          }),
        responsesCache: s(),
        requestsCache: s({ serializable: !1 }),
        hostsCache: u({
          caches: [i({ key: "".concat("4.14.2", "-").concat(t) }), s()],
        }),
        userAgent: T("4.14.2").add({ segment: "Browser" }),
      },
      f = r(r({}, o), n),
      d = function () {
        return function (t) {
          return (function (t) {
            var e = t.region || "us",
              n = c(m.WithinHeaders, t.appId, t.apiKey),
              a = k(
                r(
                  r(
                    {
                      hosts: [
                        {
                          url: "personalization.".concat(e, ".algolia.com"),
                        },
                      ],
                    },
                    t
                  ),
                  {},
                  {
                    headers: r(
                      r(r({}, n.headers()), {
                        "content-type": "application/json",
                      }),
                      t.headers
                    ),
                    queryParameters: r(
                      r({}, n.queryParameters()),
                      t.queryParameters
                    ),
                  }
                )
              );
            return p({ appId: t.appId, transporter: a }, t.methods);
          })(
            r(
              r(r({}, o), t),
              {},
              {
                methods: {
                  getPersonalizationStrategy: H,
                  setPersonalizationStrategy: M,
                },
              }
            )
          );
        };
      };
    return (function (t) {
      var e = t.appId,
        n = c(
          void 0 !== t.authMode ? t.authMode : m.WithinHeaders,
          e,
          t.apiKey
        ),
        a = k(
          r(
            r(
              {
                hosts: [
                  { url: "".concat(e, "-dsn.algolia.net"), accept: g.Read },
                  { url: "".concat(e, ".algolia.net"), accept: g.Write },
                ].concat(
                  l([
                    { url: "".concat(e, "-1.algolianet.com") },
                    { url: "".concat(e, "-2.algolianet.com") },
                    { url: "".concat(e, "-3.algolianet.com") },
                  ])
                ),
              },
              t
            ),
            {},
            {
              headers: r(
                r(r({}, n.headers()), {
                  "content-type": "application/x-www-form-urlencoded",
                }),
                t.headers
              ),
              queryParameters: r(r({}, n.queryParameters()), t.queryParameters),
            }
          )
        );
      return p(
        {
          transporter: a,
          appId: e,
          addAlgoliaAgent: function (t, e) {
            a.userAgent.add({ segment: t, version: e });
          },
          clearCache: function () {
            return Promise.all([
              a.requestsCache.clear(),
              a.responsesCache.clear(),
            ]).then(function () {});
          },
        },
        t.methods
      );
    })(
      r(
        r({}, f),
        {},
        {
          methods: {
            search: mt,
            searchForFacetValues: yt,
            multipleBatch: pt,
            multipleGetObjects: ht,
            multipleQueries: mt,
            copyIndex: L,
            copySettings: _,
            copySynonyms: X,
            copyRules: V,
            moveIndex: lt,
            listIndices: ft,
            getLogs: nt,
            listClusters: ct,
            multipleSearchForFacetValues: yt,
            getApiKey: tt,
            addApiKey: W,
            listApiKeys: st,
            updateApiKey: xt,
            deleteApiKey: Z,
            restoreApiKey: bt,
            assignUserID: B,
            assignUserIDs: Q,
            getUserID: ot,
            searchUserIDs: Ot,
            listUserIDs: dt,
            getTopUserIDs: at,
            removeUserID: gt,
            hasPendingMappings: it,
            clearDictionaryEntries: G,
            deleteDictionaryEntries: $,
            getDictionarySettings: rt,
            getAppTask: et,
            replaceDictionaryEntries: vt,
            saveDictionaryEntries: Pt,
            searchDictionaryEntries: wt,
            setDictionarySettings: It,
            waitAppTask: jt,
            customRequest: Y,
            initIndex: function (t) {
              return function (e) {
                return ut(t)(e, {
                  methods: {
                    batch: Dt,
                    delete: Ct,
                    findAnswers: Mt,
                    getObject: Wt,
                    getObjects: Qt,
                    saveObject: te,
                    saveObjects: ee,
                    search: ie,
                    searchForFacetValues: ue,
                    waitTask: de,
                    setSettings: fe,
                    getSettings: Lt,
                    partialUpdateObject: _t,
                    partialUpdateObjects: Xt,
                    deleteObject: Ut,
                    deleteObjects: zt,
                    deleteBy: At,
                    clearObjects: Nt,
                    browseObjects: qt,
                    getObjectPosition: Bt,
                    findObject: Kt,
                    exists: Ht,
                    saveSynonym: ae,
                    saveSynonyms: oe,
                    getSynonym: Vt,
                    searchSynonyms: ce,
                    browseSynonyms: kt,
                    deleteSynonym: Ft,
                    clearSynonyms: Rt,
                    replaceAllObjects: Yt,
                    replaceAllSynonyms: $t,
                    searchRules: se,
                    getRule: Gt,
                    deleteRule: Jt,
                    saveRule: re,
                    saveRules: ne,
                    replaceAllRules: Zt,
                    browseRules: St,
                    clearRules: Et,
                  },
                });
              };
            },
            initAnalytics: function () {
              return function (t) {
                return (function (t) {
                  var e = t.region || "us",
                    n = c(m.WithinHeaders, t.appId, t.apiKey),
                    a = k(
                      r(
                        r(
                          {
                            hosts: [
                              {
                                url: "analytics.".concat(e, ".algolia.com"),
                              },
                            ],
                          },
                          t
                        ),
                        {},
                        {
                          headers: r(
                            r(r({}, n.headers()), {
                              "content-type": "application/json",
                            }),
                            t.headers
                          ),
                          queryParameters: r(
                            r({}, n.queryParameters()),
                            t.queryParameters
                          ),
                        }
                      )
                    );
                  return p({ appId: t.appId, transporter: a }, t.methods);
                })(
                  r(
                    r(r({}, o), t),
                    {},
                    {
                      methods: {
                        addABTest: C,
                        getABTest: z,
                        getABTests: J,
                        stopABTest: F,
                        deleteABTest: U,
                      },
                    }
                  )
                );
              };
            },
            initPersonalization: d,
            initRecommendation: function () {
              return function (t) {
                return (
                  f.logger.info(
                    "The `initRecommendation` method is deprecated. Use `initPersonalization` instead."
                  ),
                  d()(t)
                );
              };
            },
          },
        }
      )
    );
  }
  return (ge.version = "4.14.2"), ge;
});
window.algoliasearch = this.algoliasearch;
