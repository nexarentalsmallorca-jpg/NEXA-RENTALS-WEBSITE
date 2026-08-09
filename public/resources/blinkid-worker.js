/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const K = Symbol("Comlink.proxy"), ce = Symbol("Comlink.endpoint"), le = Symbol("Comlink.releaseProxy"), k = Symbol("Comlink.finalizer"), P = Symbol("Comlink.thrown"), G = (r) => typeof r == "object" && r !== null || typeof r == "function", ue = {
  canHandle: (r) => G(r) && r[K],
  serialize(r) {
    const { port1: e, port2: t } = new MessageChannel();
    return U(r, e), [t, [t]];
  },
  deserialize(r) {
    return r.start(), fe(r);
  }
}, de = {
  canHandle: (r) => G(r) && P in r,
  serialize({ value: r }) {
    let e;
    return r instanceof Error ? e = {
      isError: !0,
      value: {
        message: r.message,
        name: r.name,
        stack: r.stack
      }
    } : e = { isError: !1, value: r }, [e, []];
  },
  deserialize(r) {
    throw r.isError ? Object.assign(new Error(r.value.message), r.value) : r.value;
  }
}, Y = /* @__PURE__ */ new Map([
  ["proxy", ue],
  ["throw", de]
]);
function he(r, e) {
  for (const t of r)
    if (e === t || t === "*" || t instanceof RegExp && t.test(e))
      return !0;
  return !1;
}
function U(r, e = globalThis, t = ["*"]) {
  e.addEventListener("message", function n(o) {
    if (!o || !o.data)
      return;
    if (!he(t, o.origin)) {
      console.warn(`Invalid origin '${o.origin}' for comlink proxy`);
      return;
    }
    const { id: a, type: s, path: i } = Object.assign({ path: [] }, o.data), l = (o.data.argumentList || []).map(y);
    let c;
    try {
      const u = i.slice(0, -1).reduce((h, f) => h[f], r), m = i.reduce((h, f) => h[f], r);
      switch (s) {
        case "GET":
          c = m;
          break;
        case "SET":
          u[i.slice(-1)[0]] = y(o.data.value), c = !0;
          break;
        case "APPLY":
          c = m.apply(u, l);
          break;
        case "CONSTRUCT":
          {
            const h = new m(...l);
            c = O(h);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: h, port2: f } = new MessageChannel();
            U(r, f), c = Z(h, [h]);
          }
          break;
        case "RELEASE":
          c = void 0;
          break;
        default:
          return;
      }
    } catch (u) {
      c = { value: u, [P]: 0 };
    }
    Promise.resolve(c).catch((u) => ({ value: u, [P]: 0 })).then((u) => {
      const [m, h] = v(u);
      e.postMessage(Object.assign(Object.assign({}, m), { id: a }), h), s === "RELEASE" && (e.removeEventListener("message", n), X(e), k in r && typeof r[k] == "function" && r[k]());
    }).catch((u) => {
      const [m, h] = v({
        value: new TypeError("Unserializable return value"),
        [P]: 0
      });
      e.postMessage(Object.assign(Object.assign({}, m), { id: a }), h);
    });
  }), e.start && e.start();
}
function me(r) {
  return r.constructor.name === "MessagePort";
}
function X(r) {
  me(r) && r.close();
}
function fe(r, e) {
  const t = /* @__PURE__ */ new Map();
  return r.addEventListener("message", function(o) {
    const { data: a } = o;
    if (!a || !a.id)
      return;
    const s = t.get(a.id);
    if (s)
      try {
        s(a);
      } finally {
        t.delete(a.id);
      }
  }), L(r, t, [], e);
}
function E(r) {
  if (r)
    throw new Error("Proxy has been released and is not useable");
}
function J(r) {
  return b(r, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    X(r);
  });
}
const S = /* @__PURE__ */ new WeakMap(), R = "FinalizationRegistry" in globalThis && new FinalizationRegistry((r) => {
  const e = (S.get(r) || 0) - 1;
  S.set(r, e), e === 0 && J(r);
});
function ge(r, e) {
  const t = (S.get(e) || 0) + 1;
  S.set(e, t), R && R.register(r, e, r);
}
function pe(r) {
  R && R.unregister(r);
}
function L(r, e, t = [], n = function() {
}) {
  let o = !1;
  const a = new Proxy(n, {
    get(s, i) {
      if (E(o), i === le)
        return () => {
          pe(a), J(r), e.clear(), o = !0;
        };
      if (i === "then") {
        if (t.length === 0)
          return { then: () => a };
        const l = b(r, e, {
          type: "GET",
          path: t.map((c) => c.toString())
        }).then(y);
        return l.then.bind(l);
      }
      return L(r, e, [...t, i]);
    },
    set(s, i, l) {
      E(o);
      const [c, u] = v(l);
      return b(r, e, {
        type: "SET",
        path: [...t, i].map((m) => m.toString()),
        value: c
      }, u).then(y);
    },
    apply(s, i, l) {
      E(o);
      const c = t[t.length - 1];
      if (c === ce)
        return b(r, e, {
          type: "ENDPOINT"
        }).then(y);
      if (c === "bind")
        return L(r, e, t.slice(0, -1));
      const [u, m] = B(l);
      return b(r, e, {
        type: "APPLY",
        path: t.map((h) => h.toString()),
        argumentList: u
      }, m).then(y);
    },
    construct(s, i) {
      E(o);
      const [l, c] = B(i);
      return b(r, e, {
        type: "CONSTRUCT",
        path: t.map((u) => u.toString()),
        argumentList: l
      }, c).then(y);
    }
  });
  return ge(a, r), a;
}
function we(r) {
  return Array.prototype.concat.apply([], r);
}
function B(r) {
  const e = r.map(v);
  return [e.map((t) => t[0]), we(e.map((t) => t[1]))];
}
const Q = /* @__PURE__ */ new WeakMap();
function Z(r, e) {
  return Q.set(r, e), r;
}
function O(r) {
  return Object.assign(r, { [K]: !0 });
}
function v(r) {
  for (const [e, t] of Y)
    if (t.canHandle(r)) {
      const [n, o] = t.serialize(r);
      return [
        {
          type: "HANDLER",
          name: e,
          value: n
        },
        o
      ];
    }
  return [
    {
      type: "RAW",
      value: r
    },
    Q.get(r) || []
  ];
}
function y(r) {
  switch (r.type) {
    case "HANDLER":
      return Y.get(r.name).deserialize(r.value);
    case "RAW":
      return r.value;
  }
}
function b(r, e, t, n) {
  return new Promise((o) => {
    const a = ye();
    e.set(a, o), r.start && r.start(), r.postMessage(Object.assign({ id: a }, t), n);
  });
}
function ye() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const be = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 3, 1, 0, 1, 10, 14, 1, 12, 0, 65, 0, 65, 0, 65, 0, 252, 10, 0, 0, 11])), Ee = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 2, 8, 1, 1, 97, 1, 98, 3, 127, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 5, 1, 1, 97, 3, 1])), ke = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 7, 1, 5, 0, 208, 112, 26, 11])), Pe = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 12, 1, 10, 0, 67, 0, 0, 0, 0, 252, 0, 26, 11])), Se = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 8, 1, 6, 0, 65, 0, 192, 26, 11])), Re = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), ve = () => (async (r) => {
  try {
    return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(r);
  } catch {
    return !1;
  }
})(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
function Te() {
  const r = navigator.userAgent.toLowerCase();
  return r.includes("safari") && !r.includes("chrome");
}
async function Ie() {
  if (!await ve())
    return !1;
  if (!("importScripts" in self))
    throw Error("Not implemented");
  return Te() ? !1 : "Worker" in self;
}
async function Ne() {
  const r = [
    Ee(),
    ke(),
    be(),
    Pe(),
    Se(),
    Re()
  ];
  if (!(await Promise.all(r)).every(Boolean))
    throw new Error("Browser doesn't meet minimum requirements!");
  return await Ie() ? "simd-threads" : "simd";
}
const Le = { simd: { full: 4633969, lightweight: 4605555 }, "simd-threads": { full: 4679816, lightweight: 4647889 } }, Oe = { simd: { full: 12778825, lightweight: 11143606 }, "simd-threads": { full: 12778825, lightweight: 11143606 } }, Ue = {
  wasm: Le,
  data: Oe
};
function w(...r) {
  const e = r.filter((t) => t).join("/").replace(/([^:]\/)\/+/g, "$1");
  try {
    new URL(e, "http://example.com");
  } catch {
    throw new Error(`Invalid URL: ${e}`);
  }
  return e;
}
async function $(r, e) {
  const { url: t, fileType: n, variant: o, buildType: a, progressCallback: s } = r, i = await fetch(t);
  if (!s)
    return i.arrayBuffer();
  const l = i.headers.get("Content-Length"), c = l ? parseInt(l, 10) : e({ fileType: n, variant: o, buildType: a });
  if (isNaN(c) || c <= 0)
    throw new Error(`Invalid content length for ${n} file: ${c}`);
  let u = 0;
  const m = new TransformStream({
    transform(f, g) {
      u += f.length;
      const p = Math.min(Math.round(u / c * 100), 100);
      s({
        loaded: u,
        contentLength: c,
        progress: p,
        finished: !1
      }), g.enqueue(f);
    },
    flush() {
      s({
        loaded: u,
        contentLength: c,
        progress: 100,
        finished: !0
      });
    }
  });
  return new Response(i.body?.pipeThrough(m), i).arrayBuffer();
}
const z = "application/javascript", Ae = (r, e = {}) => {
  const t = {
    skipSameOrigin: !0,
    useBlob: !0,
    ...e
  };
  return t.skipSameOrigin && new URL(r).origin === self.location.origin ? Promise.resolve(r) : new Promise((n, o) => void fetch(r).then((a) => a.text()).then((a) => {
    new URL(r).href.split("/").pop();
    let i = "";
    if (t.useBlob) {
      const l = new Blob([a], { type: z });
      i = URL.createObjectURL(l);
    } else
      i = `data:${z},` + encodeURIComponent(a);
    n(i);
  }).catch(o));
};
function Me(r, e) {
  const t = e[r.fileType][r.variant];
  if (typeof t == "number")
    return t;
  if (r.buildType === void 0)
    throw new Error("buildType is required when size manifest entry is build-aware");
  return t[r.buildType];
}
function xe() {
  const r = self.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(r);
}
function Fe(r) {
  return {
    licenseId: r.licenseId,
    licensee: r.licensee,
    applicationIds: r.applicationIds,
    packageName: r.packageName,
    platform: "Browser",
    sdkName: r.sdkName,
    sdkVersion: r.sdkVersion
  };
}
async function W(r, e = "https://baltazar.microblink.com/api/v2/status/check") {
  if (!e || typeof e != "string")
    throw new Error("Invalid baltazarUrl: must be a non-empty string");
  try {
    new URL(e);
  } catch {
    throw new Error(`Invalid baltazarUrl format: ${e}`);
  }
  try {
    const t = await fetch(e, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-cache",
      body: JSON.stringify(Fe(r))
    });
    if (!t.ok)
      throw new Error(`Server returned error: ${t.status} ${t.statusText}`);
    return await t.text();
  } catch (t) {
    throw console.error("Server permission request failed:", t), t;
  }
}
function V(r) {
  return Math.ceil(r * 1024 * 1024 / 64 / 1024);
}
class I extends Error {
  code;
  url;
  constructor(e, t, n) {
    super(`Proxy URL validation failed for "${n}": ${t}`), this.code = e, this.url = n, this.name = "ProxyUrlValidationError";
  }
}
function _e(r) {
  const e = r.unlockResult === "requires-server-permission", { allowPingProxy: t, allowBaltazarProxy: n, hasPing: o } = r;
  if (!t && !n)
    throw new Error("Microblink proxy URL is set but your license doesn't permit proxy usage. Check your license.");
  if (!e && !o)
    throw new Error("Microblink proxy URL is set but your license doesn't permit proxy usage. Check your license.");
  if (!e && o && n && !t || e && !o && !n && t)
    throw new Error("Microblink proxy URL is set but your license doesn't permit proxy usage. Check your license.");
}
function Ce(r) {
  let e;
  try {
    e = new URL(r);
  } catch {
    throw new I("INVALID_PROXY_URL", `Failed to create URL instance for provided Microblink proxy URL "${r}". Expected format: https://your-proxy.com or https://your-proxy.com/`, r);
  }
  if (e.protocol !== "https:")
    throw new I("HTTPS_REQUIRED", `Proxy URL validation failed for "${r}": HTTPS protocol must be used. Expected format: https://your-proxy.com or https://your-proxy.com/`, r);
  const t = e.origin;
  try {
    const n = new URL(`${e.pathname}${e.pathname.endsWith("/") ? "" : "/"}api/v2/status/check`, t).toString();
    return {
      ping: t + e.pathname.replace(/\/$/, ""),
      baltazar: n
    };
  } catch {
    throw new I("INVALID_PROXY_URL", "Failed to build baltazar service URL", r);
  }
}
function De(r, e) {
  const t = !!r, n = e.unlockResult === "requires-server-permission";
  return {
    pingProxyEnabled: t && e.allowPingProxy && e.hasPing,
    baltazarProxyEnabled: n && t && e.allowBaltazarProxy
  };
}
class Be extends Error {
  code = "SERVER_PERMISSION_ERROR";
  constructor(e) {
    super(e), this.name = "ServerPermissionError";
  }
}
class $e extends Error {
  code = "LICENSE_ERROR";
  constructor(e) {
    super(e), this.name = "LicenseError";
  }
}
function ze({ workerScope: r, getSessionNumber: e, onError: t }) {
  const n = r ?? self, o = e ?? (() => 0);
  let a = !1;
  const s = (c, u) => {
    if (!a) {
      a = !0;
      try {
        t({
          origin: c,
          error: u,
          sessionNumber: o()
        });
      } finally {
        a = !1;
      }
    }
  }, i = (c) => {
    const u = c;
    s("worker.onerror", u.error ?? u.message ?? "Unknown worker error");
  }, l = (c) => {
    s("worker.unhandledrejection", c.reason ?? "Unhandled worker rejection");
  };
  return n.addEventListener("error", i), n.addEventListener("unhandledrejection", l), () => {
    n.removeEventListener("error", i), n.removeEventListener("unhandledrejection", l);
  };
}
const We = "api/v1/versions", j = "/api/v1/versions", ee = "/microblink/blinkid-ota", Ve = "ota-resources", je = "ota-resources.json", T = 2e4, qe = {
  embedder_engine: "serialized-embedder-database.bin",
  template_engine: "template-database.zzip",
  document_knowledge_engine: "knowledge-database.zzip"
};
function He(r) {
  const e = r.trim().replace(/\/+$/, "");
  return e.endsWith(j) ? e.slice(0, -j.length).replace(/\/+$/, "") : e;
}
async function Ke({
  resourcesLocation: r,
  fetchFn: e = fetch,
  timeoutMilis: t = T
}) {
  const n = r.trim().replace(/\/+$/, "");
  if (!n)
    throw new Error("BlinkID OTA resources location is empty");
  const o = w(
    n,
    je
  ), a = await e(o, {
    signal: A(t)
  });
  if (!a.ok)
    throw new Error(
      `Failed to resolve BlinkID OTA resources manifest: ${a.status} ${a.statusText}`
    );
  const s = await a.json();
  if (!Array.isArray(s.resources) || s.resources.length === 0)
    throw new Error("BlinkID OTA resources manifest is missing resources");
  return s.resources.map(
    (i, l) => Qe(i, l, n)
  );
}
function Ge(r, e) {
  const t = new Map(
    e.map((n) => [n.filename, n])
  );
  return r.map((n) => {
    const o = t.get(
      n.filename
    );
    return !o || nr(o.version, n.version) <= 0 ? n : {
      ...o,
      fallbackUrl: n.url
    };
  });
}
async function Ye({
  resourceProviderUrl: r,
  genericVersion: e,
  fetchFn: t = fetch,
  timeoutMilis: n = T
}) {
  const o = He(r), a = new URL(
    We,
    o.endsWith("/") ? o : `${o}/`
  );
  a.searchParams.set("generic_version", e);
  const s = await t(a.toString(), {
    signal: A(n)
  });
  if (!s.ok)
    throw new Error(
      `Failed to resolve BlinkID OTA resources: ${s.status} ${s.statusText}`
    );
  const i = await s.json();
  return [
    N(i.embedder_engine, "embedder_engine"),
    N(i.template_engine, "template_engine"),
    N(
      i.document_knowledge_engine,
      "document_knowledge_engine"
    )
  ];
}
async function Xe({
  module: r,
  resources: e,
  directory: t = ee,
  fetchFn: n = fetch,
  fallbackOnError: o = !1,
  timeoutMilis: a = T
}) {
  return or(r, t), await Promise.all(
    e.map(async (s) => {
      const i = await Je({
        resource: s,
        fetchFn: n,
        fallbackOnError: o,
        timeoutMilis: a
      }), l = new Uint8Array(i);
      ir(r, t, s.filename, l), ar(
        r,
        `${t}/${s.filename}`,
        l.byteLength
      );
    })
  ), t;
}
function A(r = T) {
  const e = new AbortController();
  return setTimeout(() => {
    e.abort(new Error("Ota resource download failed"));
  }, r), e.signal;
}
async function Je({
  resource: r,
  fetchFn: e,
  fallbackOnError: t,
  timeoutMilis: n
}) {
  try {
    return await q(
      r.filename,
      r.url,
      e,
      n
    );
  } catch (o) {
    if (!t || !r.fallbackUrl)
      throw o;
    return console.warn(
      `BlinkID OTA provider resource ${r.filename} was not loaded. Falling back to the hosted resource.`,
      o
    ), q(
      r.filename,
      r.fallbackUrl,
      e,
      n
    );
  }
}
async function q(r, e, t, n) {
  const o = await t(e, {
    signal: A(n)
  });
  if (!o.ok)
    throw new Error(
      `Failed to download BlinkID OTA resource ${r}: ${o.status} ${o.statusText}`
    );
  const a = await o.arrayBuffer();
  if (a.byteLength === 0)
    throw new Error(
      `Failed to download BlinkID OTA resource ${r}: empty response body`
    );
  return a;
}
function N(r, e) {
  const t = rr(r, e);
  return {
    filename: qe[e],
    version: tr(r, e),
    url: t
  };
}
function Qe(r, e, t) {
  const n = sr(r?.filename);
  if (!n)
    throw new Error(
      `BlinkID OTA resources manifest entry ${e} is missing filename`
    );
  const o = r?.version?.trim();
  if (!o)
    throw new Error(
      `BlinkID OTA resources manifest entry ${e} is missing version`
    );
  return {
    filename: n,
    version: o,
    url: Ze(t, n, r?.url)
  };
}
function Ze(r, e, t) {
  const n = t?.trim();
  return n ? er(n) ? n : w(r, n) : w(r, e);
}
function er(r) {
  try {
    return new URL(r), !0;
  } catch {
    return !1;
  }
}
function rr(r, e) {
  const t = r?.db_download_link;
  if (!t)
    throw new Error(
      `BlinkID OTA response is missing ${e}.db_download_link`
    );
  return t;
}
function tr(r, e) {
  const t = r?.latest_version?.trim();
  if (!t)
    throw new Error(`BlinkID OTA response is missing ${e}.latest_version`);
  return t;
}
function nr(r, e) {
  const t = H(r), n = H(e);
  for (let o = 0; o < t.length; o++) {
    const a = t[o] - n[o];
    if (a !== 0)
      return a;
  }
  return 0;
}
function H(r) {
  const e = /^(\d+)\.(\d+)\.(\d+)$/.exec(r);
  if (!e)
    throw new Error(`Invalid BlinkID OTA resource version: ${r}`);
  return [Number(e[1]), Number(e[2]), Number(e[3])];
}
function sr(r) {
  const e = r?.split(/[\\/]/).filter(Boolean).at(-1)?.trim();
  if (!(!e || e === "." || e === ".."))
    return e;
}
function or(r, e) {
  if (typeof r.FS?.mkdirTree == "function") {
    r.FS.mkdirTree(e);
    return;
  }
  if (!r.FS_createPath)
    throw new Error(
      "Loaded BlinkID Wasm module does not expose Emscripten filesystem path creation"
    );
  const t = e.split("/").filter(Boolean);
  let n = "/";
  for (const o of t) {
    try {
      r.FS_createPath(n, o, !0, !0);
    } catch {
    }
    n = n === "/" ? `/${o}` : `${n}/${o}`;
  }
}
function ir(r, e, t, n) {
  if (typeof r.FS?.writeFile == "function") {
    r.FS.writeFile(`${e}/${t}`, n);
    return;
  }
  if (!r.FS_createDataFile)
    throw new Error(
      "Loaded BlinkID Wasm module does not expose Emscripten filesystem file creation"
    );
  try {
    r.FS_unlink?.(`${e}/${t}`);
  } catch {
  }
  r.FS_createDataFile(e, t, n, !0, !0, !0);
}
function ar(r, e, t) {
  if (!r.FS?.readFile)
    return;
  const n = r.FS.readFile(e);
  if (n.byteLength !== t)
    throw new Error(
      `BlinkID OTA MEMFS write verification failed for ${e}: expected ${t} bytes, got ${n.byteLength}`
    );
}
function cr(r, e) {
  return {
    ...e,
    redactBarcode: e.redactBarcode ?? r.redactBarcode,
    redactMrz: e.redactMrz ?? r.redactMrz,
    fields: e.fields ?? r.fields,
    mode: e.mode ?? r.mode
  };
}
const re = "FrameTransferError", lr = "https://blinkid-ota.microblink.com";
function ur(r) {
  const e = r?.resourcesLocation?.trim(), t = r?.otaResourceProviderUrl?.trim(), n = t || lr;
  return {
    checkForUpdates: r?.checkForUpdates ?? !0,
    otaResourceProviderUrl: n,
    ...e ? { resourcesLocation: e } : {},
    strict: r?.strict ?? !1
  };
}
const dr = {
  fields: [],
  mode: "full-result",
  redactBarcode: !1,
  redactMrz: !1
}, hr = (r, e) => {
  const t = e instanceof Error && e.message ? `: ${e.message}` : "", n = new Error(
    `${r}${t}`,
    e instanceof Error ? { cause: e } : void 0
  );
  return n.name = re, n;
};
class mr {
  /**
   * The Wasm module.
   */
  #e;
  /**
   * Active scanning session created by this worker.
   */
  #t;
  /**
   * The progress status callback.
   */
  progressStatusCallback;
  /**
   * Whether the demo overlay is shown.
   */
  #i = !0;
  /**
   * Whether the production overlay is shown.
   */
  #a = !0;
  /**
   * The current session number.
   */
  #r = 0;
  /**
   * Sanitized proxy URLs for Microblink services.
   */
  #n;
  #o;
  #s;
  constructor() {
    this.#s = ze({
      getSessionNumber: () => this.#r,
      onError: ({ error: e, sessionNumber: t }) => {
        this.#e && (this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: t,
          data: {
            errorType: "Crash",
            errorMessage: e instanceof Error ? e.message : String(e),
            stackTrace: e instanceof Error ? e.stack : void 0
          }
        }), this.sendPinglets());
      }
    });
  }
  /**
   * This method loads the Wasm module.
   */
  async #c({
    resourceUrl: e,
    wasmVariant: t,
    featureVariant: n,
    initialMemory: o
  }) {
    if (this.#e) {
      console.log("Wasm already loaded");
      return;
    }
    const a = "BlinkIdModule", s = w(
      e,
      n,
      t
    ), i = w(s, `${a}.js`), l = w(s, `${a}.wasm`), c = w(s, `${a}.data`), u = await Ae(i), h = (await import(
      /* @vite-ignore */
      u
    )).default;
    o || (o = xe() ? 700 : 200);
    const f = new WebAssembly.Memory({
      initial: V(o),
      maximum: V(2048),
      shared: t === "simd-threads"
    });
    let g, p, M = 0;
    const te = 32, x = () => {
      if (!this.progressStatusCallback || !g || !p)
        return;
      const d = g.finished && p.finished, _ = g.loaded + p.loaded, C = g.contentLength + p.contentLength, ae = d ? 100 : Math.min(Math.round(_ / C * 100), 100), D = performance.now();
      D - M < te || (M = D, this.progressStatusCallback({
        loaded: _,
        contentLength: C,
        progress: ae,
        finished: d
      }));
    }, ne = (d) => {
      g = d, x();
    }, se = (d) => {
      p = d, x();
    }, F = (d) => Me({ ...d, buildType: n }, Ue), [oe, ie] = await Promise.all([
      $(
        {
          url: l,
          fileType: "wasm",
          variant: t,
          buildType: n,
          progressCallback: ne
        },
        F
      ),
      $(
        {
          url: c,
          fileType: "data",
          variant: t,
          buildType: n,
          progressCallback: se
        },
        F
      )
    ]);
    if (this.progressStatusCallback && g && p) {
      const d = g.contentLength + p.contentLength;
      this.progressStatusCallback({
        loaded: d,
        contentLength: d,
        progress: 100,
        finished: !0
      });
    }
    if (this.#e = await h({
      locateFile: (d) => `${s}/${d}`,
      onAbort: (d) => {
        this.#e && (this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: this.#r,
          data: {
            errorType: "Crash",
            errorMessage: d instanceof Error ? d.message : String(d),
            stackTrace: d instanceof Error ? d.stack : void 0
          }
        }), this.sendPinglets());
      },
      printErr: (d) => {
        if (console.error(d), /\babort(ed)?\b/i.test(d)) {
          if (!this.#e)
            return;
          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "Crash",
              errorMessage: String(d),
              stackTrace: void 0
            }
          }), this.sendPinglets();
        }
      },
      // pthreads build breaks without this:
      // "Failed to execute 'createObjectURL' on 'URL': Overload resolution failed."
      // Emscripten 6.x's native `-sCROSS_ORIGIN` was evaluated as a replacement
      // for this userspace cross-origin worker workaround but rejected: it is
      // incompatible with our `-sDYNAMIC_EXECUTION=0` (no-eval) CSP hardening.
      mainScriptUrlOrBlob: u,
      wasmBinary: oe,
      getPreloadedPackage() {
        return ie;
      },
      wasmMemory: f,
      noExitRuntime: !0
    }), !this.#e)
      throw new Error("Failed to load Wasm module");
  }
  async #l(e, t) {
    const n = ur(e);
    if (!this.#e)
      throw new Error("Wasm module not loaded");
    const o = n.resourcesLocation ?? w(t, Ve), a = await Ke({
      resourcesLocation: o,
      timeoutMilis: e?.timeoutMilis
    });
    let s = a;
    if (n.checkForUpdates)
      try {
        const i = await this.#u(
          n.otaResourceProviderUrl,
          e?.timeoutMilis
        );
        s = Ge(
          a,
          i
        );
      } catch (i) {
        if (n.strict)
          throw i;
        console.warn(
          "BlinkID OTA provider resources were not loaded. Using hosted resources.",
          i
        );
      }
    await Xe({
      module: this.#e,
      resources: s,
      directory: ee,
      fallbackOnError: !n.strict,
      timeoutMilis: e?.timeoutMilis
    });
  }
  async #u(e, t) {
    const n = this.#e.getRecognizerVersion().trim();
    if (!n)
      throw new Error(
        "Loaded BlinkID Wasm module returned an empty recognizer version"
      );
    return Ye({
      resourceProviderUrl: e,
      genericVersion: n,
      timeoutMilis: t
    });
  }
  reportPinglet(e) {
    if (!this.#e)
      throw new Error("Cannot report pinglet: Wasm module not loaded");
    try {
      this.#e.queuePinglet(
        JSON.stringify(e.data),
        e.schemaName,
        e.schemaVersion,
        e.sessionNumber ?? this.#r
      );
    } catch (t) {
      console.warn("Failed to queue pinglet:", t, e);
    }
  }
  sendPinglets() {
    if (!this.#e)
      throw new Error("Cannot send pinglets: Wasm module not loaded");
    try {
      this.#e.sendPinglets();
    } catch (e) {
      console.warn("Failed to send pinglets:", e);
    }
  }
  /**
   * This method initializes everything.
   */
  async initBlinkId(e, t) {
    const n = new URL(
      "resources/",
      e.resourcesLocation
    ).toString();
    this.progressStatusCallback = t, this.#o = e.userId;
    const o = e.wasmVariant ?? await Ne(), a = e.useLightweightBuild ? "lightweight" : "full";
    if (await this.#c({
      resourceUrl: n,
      wasmVariant: o,
      featureVariant: a,
      initialMemory: e.initialMemory
    }), !this.#e)
      throw new Error("Wasm module not loaded");
    await this.#l(e.otaResources, n);
    const s = this.#e.initializeWithLicenseKey(
      e.licenseKey,
      e.userId,
      !1
    );
    if (this.reportPinglet({
      schemaName: "ping.sdk.init.start",
      schemaVersion: "2.0.0",
      sessionNumber: 0,
      data: {
        packageName: self.location.hostname,
        platform: "Emscripten",
        // TODO: update this after pinglets schema is updated
        platformDetails: `${a}-${o === "simd" ? "advanced" : "advanced-threads"}`,
        product: "BlinkID",
        userId: this.#o,
        ...De(
          e.microblinkProxyUrl,
          s
        )
      }
    }), s.licenseError)
      throw new $e(
        "License unlock error: " + s.licenseError
      );
    if (e.microblinkProxyUrl && (_e(s), this.#n = Ce(e.microblinkProxyUrl), s.allowPingProxy && s.hasPing && (this.#e.setPingProxyUrl(this.#n.ping), console.debug(`Using ping proxy URL: ${this.#n.ping}`))), s.unlockResult === "requires-server-permission") {
      const l = this.#n?.baltazar && s.allowBaltazarProxy ? this.#n?.baltazar : void 0;
      l && console.debug(`Using Baltazar proxy URL: ${l}`);
      const c = l ? await W(s, l) : await W(s), u = this.#e.submitServerPermission(
        c
      );
      if (u?.error)
        throw new Be(
          "Server unlock error: " + u.error
        );
    }
    try {
      console.debug(`BlinkID SDK ${s.sdkVersion} unlocked`), this.#i = s.showDemoOverlay, this.#a = s.showProductionOverlay, this.#e.initializeSdk(e.userId);
    } catch (i) {
      throw console.warn("Failed to initialize BlinkID SDK:", i), this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: 0,
        data: {
          errorType: "Crash",
          errorMessage: i instanceof Error ? i.message : String(i),
          stackTrace: i instanceof Error ? i.stack : void 0
        }
      }), this.sendPinglets(), i;
    }
  }
  /**
   * This method creates a BlinkID scanning session.
   *
   * @param sessionSettings - The options for the session.
   * @returns The session.
   */
  createScanningSession(e, t) {
    if (!this.#e)
      throw new Error("Wasm module not loaded");
    try {
      const n = this.#e.createScanningSession(
        e ?? {},
        this.#o
      );
      return this.#r++, this.sendPinglets(), this.#d(
        n,
        t?.redactionSettingsResolver
      );
    } catch (n) {
      throw this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: this.#r,
        data: {
          errorType: "Crash",
          errorMessage: n instanceof Error ? n.message : String(n),
          stackTrace: n instanceof Error ? n.stack : void 0
        }
      }), this.sendPinglets(), n;
    }
  }
  getDefaultRedactionSettings(e) {
    if (!this.#e)
      throw new Error("Wasm module not loaded");
    try {
      return this.#e.getDefaultRedactionSettings(e);
    } catch (t) {
      throw console.warn("Failed to get default redaction settings:", t), this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: this.#r,
        data: {
          errorType: "NonFatal",
          errorMessage: t instanceof Error ? t.message : String(t)
        }
      }), this.sendPinglets(), new Error("Failed to get default redaction settings", {
        cause: t
      });
    }
  }
  /**
   * This method creates a proxy session.
   *
   * @param session - The session.
   * @returns The proxy session.
   */
  #d(e, t) {
    this.#t = e;
    let n = null, o = null;
    return O({
      getResult: async () => {
        try {
          if (!t || !n)
            return e.getResult();
          const i = await t(
            n,
            O((l) => Promise.resolve(
              this.getDefaultRedactionSettings({
                country: l.country,
                region: l.region,
                documentType: l.documentType,
                countryName: "",
                isoAlpha2CountryCode: "",
                isoAlpha3CountryCode: "",
                isoNumericCountryCode: ""
              })
            ))
          );
          return i ? e.getResult(
            cr(
              dr,
              i
            )
          ) : e.getResult();
        } catch (s) {
          throw this.#e && (this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: s instanceof Error ? s.message : String(s),
              stackTrace: s instanceof Error ? s.stack : void 0
            }
          }), this.sendPinglets()), s;
        }
      },
      process: (s) => {
        try {
          const i = e.process(s);
          if ("error" in i)
            this.#e && (this.reportPinglet({
              schemaName: "ping.error",
              schemaVersion: "1.0.0",
              sessionNumber: this.#r,
              data: {
                errorType: "NonFatal",
                errorMessage: String(i.error),
                stackTrace: void 0
              }
            }), this.sendPinglets());
          else {
            const c = i.inputImageAnalysisResult;
            (c.processingStatus === "detection-failed" || c.processingStatus === "stability-test-failed") && (n = null, o = null), c.documentClassInfo?.documentType && (n = c.documentClassInfo), c.documentRotation !== "not-available" && (o = c.documentRotation), n && n.documentType?.rawValue !== c.documentClassInfo?.documentType?.rawValue && (c.documentClassInfo = n), o && o !== c.documentRotation && (c.documentRotation = o);
          }
          let l;
          try {
            l = Z(
              {
                ...i,
                arrayBuffer: s.data.buffer
              },
              [s.data.buffer]
            );
          } catch (c) {
            const u = hr(
              "Failed to transfer frame from worker",
              c
            );
            throw this.#e && (this.reportPinglet({
              schemaName: "ping.error",
              schemaVersion: "1.0.0",
              sessionNumber: this.#r,
              data: {
                errorType: "Crash",
                errorMessage: u.message,
                stackTrace: u.stack
              }
            }), this.sendPinglets()), u;
          }
          return l;
        } catch (i) {
          throw i instanceof Error && i.name === re || !this.#e || (this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: i instanceof Error ? i.message : String(i),
              stackTrace: i instanceof Error ? i.stack : void 0
            }
          }), this.sendPinglets()), i;
        }
      },
      getScanningStatus: () => {
        try {
          return e.getScanningStatus();
        } catch (s) {
          throw this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: s instanceof Error ? s.message : String(s),
              stackTrace: s instanceof Error ? s.stack : void 0
            }
          }), this.sendPinglets(), s;
        }
      },
      ping: (s) => {
        this.reportPinglet({
          ...s,
          sessionNumber: s.sessionNumber ?? this.#r
        });
      },
      sendPinglets: () => this.sendPinglets(),
      getSettings: () => e.getSettings(),
      getResolvedSessionSettings: () => e.getResolvedSessionSettings(),
      getSessionId: () => e.getSessionId(),
      getSessionNumber: () => e.getSessionNumber(),
      resolveCurrentStep: () => {
        try {
          console.debug("BlinkIdWorker: resolveCurrentStep"), e.resolveCurrentStep();
        } catch (s) {
          throw this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: s instanceof Error ? s.message : String(s),
              stackTrace: s instanceof Error ? s.stack : void 0
            }
          }), this.sendPinglets(), s;
        }
      },
      reset: () => {
        try {
          e.reset(), n = null, o = null;
        } catch (s) {
          throw this.#e && (this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: s instanceof Error ? s.message : String(s),
              stackTrace: s instanceof Error ? s.stack : void 0
            }
          }), this.sendPinglets()), s;
        }
      },
      delete: () => {
        e.isDeleted() || e.delete(), this.#t === e && (this.#t = void 0);
      },
      deleteLater: () => {
        e.isDeleted() || e.deleteLater(), this.#t === e && (this.#t = void 0);
      },
      isDeleted: () => e.isDeleted(),
      isAliasOf: (s) => e.isAliasOf(s),
      showDemoOverlay: () => this.#i,
      showProductionOverlay: () => this.#a
    });
  }
  /**
   * This method is called when the worker is terminated.
   */
  [k]() {
  }
  /**
   * Terminates the workers and the Wasm runtime.
   */
  async terminate() {
    if (self.setTimeout(() => self.close, 5e3), this.#t)
      try {
        this.#t.isDeleted() || (console.debug("Deleting BlinkId session during terminate"), this.#t.delete());
      } catch (n) {
        if (console.warn(
          "Failed to delete BlinkId session during terminate:",
          n
        ), !this.#e)
          return;
        this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: this.#r,
          data: {
            errorType: "NonFatal",
            errorMessage: n instanceof Error ? n.message : String(n),
            stackTrace: n instanceof Error ? n.stack : void 0
          }
        }), this.sendPinglets();
      } finally {
        this.#t = void 0;
      }
    if (!this.#e) {
      this.#s?.(), this.#s = void 0, console.warn(
        "No Wasm module loaded during worker termination. Skipping cleanup."
      ), self.close();
      return;
    }
    this.#e.terminateSdk(), await new Promise((n) => setTimeout(n, 0)), this.sendPinglets();
    const t = Date.now();
    for (; this.#e.arePingRequestsInProgress() && Date.now() - t < 5e3; )
      await new Promise((n) => setTimeout(n, 100));
    this.#e = void 0, this.#s?.(), this.#s = void 0, console.debug("BlinkIdWorker terminated 🔴"), self.close();
  }
}
const fr = new mr();
U(fr);
