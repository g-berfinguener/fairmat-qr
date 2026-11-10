// FAIRmat QR Codes: static version for GitHub Pages. Everything runs in the browser.
(function () {
  "use strict";

  const NAVY = "#16204A";
  const INK = "#4256A6";
  const ACCENTS = ["#273A81", "#4F82C3", "#BF8A2E", "#038D6A"];
  const COLORS = [
    { id: "blue", name: "Blue", hex: "#4256A6" },
    { id: "green", name: "Oasis", hex: "#008A67" },
    { id: "gold", name: "CAMELS", hex: "#BF8A36" },
    { id: "navy", name: "Navy", hex: "#16204A" },
  ];
  const TEAM = (window.FAIRMAT_LOGOS || []).map((l, i) => ({ id: "team" + i, name: l.name, src: "logos/" + l.file }));

  const $ = (id) => document.getElementById(id);
  const state = { link: "", logo: TEAM.length ? TEAM[0].id : "none", color: "blue", local: null, dataUrls: {}, svg: "", ok: false };

  // ---------- QR drawing: connected bubbles ----------
  const utf8 = (s) => unescape(encodeURIComponent(s));
  function buildSvg(text, color, logoUrl) {
    let qr = qrcode(0, "H"); qr.addData(utf8(text || " ")); qr.make();
    if ((qr.getModuleCount() - 17) / 4 < 5) { qr = qrcode(5, "H"); qr.addData(utf8(text || " ")); qr.make(); }
    const n = qr.getModuleCount(), Q = 4, m = 10, size = (n + 2 * Q) * m, R = m / 2;
    let patch = 0;
    if (logoUrl) { patch = Math.round(n * 0.26); if (patch % 2 === 0) patch += 1; }
    const p0 = Math.floor((n - patch) / 2), p1 = p0 + patch;
    const inFinder = (r, c) => (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
    const inPatch = (r, c) => patch && r >= p0 && r < p1 && c >= p0 && c < p1;
    const on = (r, c) => r >= 0 && c >= 0 && r < n && c < n && !inFinder(r, c) && !inPatch(r, c) && qr.isDark(r, c);
    const X = (c) => (c + Q) * m + m / 2, Y = (r) => (r + Q) * m + m / 2;
    const NB = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    const lone = (r, c) => on(r, c) && !NB.some(([a, b]) => on(r + a, c + b));
    let dark = "", white = "", accents = "", k = 0;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!on(r, c)) continue;
      if (lone(r, c)) { accents += `<circle cx="${X(c)}" cy="${Y(r)}" r="${R * 0.98}" fill="${ACCENTS[(k++) % ACCENTS.length]}"/>`; continue; }
      dark += `<circle cx="${X(c)}" cy="${Y(r)}" r="${R}"/>`;
      if (on(r, c + 1)) dark += `<rect x="${X(c)}" y="${Y(r) - R}" width="${m}" height="${m}"/>`;
      if (on(r + 1, c)) dark += `<rect x="${X(c) - R}" y="${Y(r)}" width="${m}" height="${m}"/>`;
    }
    for (let r = -1; r < n; r++) for (let c = -1; c < n; c++) {
      const cells = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
      const d = cells.map(([y, x]) => on(y, x) && !lone(y, x));
      const cnt = d.filter(Boolean).length;
      const diag = (d[0] && d[3] && !d[1] && !d[2]) || (d[1] && d[2] && !d[0] && !d[3]);
      if (cnt >= 3 || diag) {
        dark += `<rect x="${X(c)}" y="${Y(r)}" width="${m}" height="${m}"/>`;
        cells.forEach(([y, x], i) => { if (!d[i]) white += `<circle cx="${X(x)}" cy="${Y(y)}" r="${R}"/>`; });
      }
    }
    const finder = (r, c) => {
      const x = (c + Q) * m, y = (r + Q) * m;
      return `<rect x="${x + m / 2}" y="${y + m / 2}" width="${6 * m}" height="${6 * m}" rx="${2.1 * m}" fill="none" stroke="${color}" stroke-width="${m}"/>` +
        `<rect x="${x + 2 * m}" y="${y + 2 * m}" width="${3 * m}" height="${3 * m}" rx="${1.1 * m}" fill="${NAVY}"/>`;
    };
    let logo = "";
    if (logoUrl) {
      const px = (p0 + Q) * m, ps = patch * m, pad = ps * 0.12;
      logo = `<rect x="${px + 2}" y="${px + 2}" width="${ps - 4}" height="${ps - 4}" rx="${ps * 0.22}" fill="#FFFFFF"/>` +
        `<image href="${logoUrl}" x="${px + pad}" y="${px + pad}" width="${ps - 2 * pad}" height="${ps - 2 * pad}" preserveAspectRatio="xMidYMid meet"/>`;
    }
    return { n, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="QR code">` +
      `<rect width="${size}" height="${size}" fill="#FFFFFF"/><g fill="${INK}">${dark}</g><g fill="#FFFFFF">${white}</g>${accents}` +
      `${finder(0, 0)}${finder(0, n - 7)}${finder(n - 7, 0)}${logo}</svg>` };
  }

  function svgToCanvas(svg, px) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => { const cv = document.createElement("canvas"); cv.width = cv.height = px;
        const cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, px, px); cx.drawImage(img, 0, 0, px, px); res(cv); };
      img.onerror = rej;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }

  // ---------- logos ----------
  const readAsDataUrl = (blob) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
  async function toDataUrl(src) {
    const r = await fetch(src); if (!r.ok) throw new Error("not found");
    return readAsDataUrl(await r.blob());
  }
  async function rasterize(file, max = 800) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      let w = img.naturalWidth || max, h = img.naturalHeight || max; const k = max / Math.max(w, h);
      w *= k; h *= k;
      const cv = document.createElement("canvas"); cv.width = Math.round(w); cv.height = Math.round(h);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      return cv.toDataURL("image/png");
    } finally { URL.revokeObjectURL(url); }
  }
  function currentLogoUrl() {
    if (state.logo === "none") return null;
    if (state.logo === "local") return state.local ? state.local.url : null;
    return state.dataUrls[state.logo] || null;
  }

  // ---------- render ----------
  let seqN = 0;
  function setStatus(kind, text) { $("status").className = "status " + kind; $("statusText").textContent = text; }
  async function render() {
    const seq = ++seqN;
    const color = COLORS.find((c) => c.id === state.color).hex;
    const { svg, n } = buildSvg(state.link, color, currentLogoUrl());
    state.svg = svg; $("card").innerHTML = svg;
    $("meta").textContent = `${n} × ${n} modules`;
    setStatus("wait", "Checking that it scans…");
    state.ok = false; $("dlPng").disabled = $("dlSvg").disabled = true;
    try {
      let passes = 0;
      for (const px of [480, 640, 880]) {
        const cv = await svgToCanvas(svg, px);
        if (seq !== seqN) return;
        const d = cv.getContext("2d").getImageData(0, 0, px, px);
        const res = jsQR(d.data, px, px, { inversionAttempts: "dontInvert" });
        if (res && (res.data === state.link || res.data === utf8(state.link))) passes++;
      }
      state.ok = passes >= 2;
      if (!state.link.trim()) setStatus("warn", "Paste a link to start.");
      else if (state.ok) setStatus("ok", "Scans correctly");
      else setStatus("warn", "Doesn't scan reliably. Shorten the link or choose No logo.");
      $("dlPng").disabled = $("dlSvg").disabled = !state.ok;
    } catch (e) { if (seq === seqN) setStatus("warn", "Couldn't check this code. Try again after the logo loads."); }
  }

  // ---------- controls ----------
  function chip(id, name, thumb) {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", String(state.logo === id));
    const t = document.createElement("span"); t.className = "thumb" + (thumb ? "" : " none");
    if (thumb) { const im = document.createElement("img"); im.src = thumb; im.alt = ""; t.appendChild(im); } else t.textContent = "None";
    const l = document.createElement("span"); l.textContent = name;
    b.append(t, l);
    b.addEventListener("click", () => { state.logo = id; drawChips(); render(); });
    return b;
  }
  function drawChips() {
    const box = $("logos"); box.textContent = "";
    TEAM.forEach((t) => box.append(chip(t.id, t.name, t.src)));
    box.append(chip("none", "No logo", null));
    if (state.local) box.append(chip("local", state.local.name, state.local.url));
  }
  function drawSwatches() {
    const box = $("swatches"); box.textContent = "";
    COLORS.forEach((c) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "sw"; b.setAttribute("aria-pressed", String(state.color === c.id));
      const i = document.createElement("i"); i.style.background = c.hex; const s = document.createElement("span"); s.textContent = c.name;
      b.append(i, s); b.addEventListener("click", () => { state.color = c.id; drawSwatches(); render(); }); box.append(b);
    });
  }

  const link = $("link"); let linkTimer;
  link.addEventListener("input", () => { clearTimeout(linkTimer); linkTimer = setTimeout(() => { state.link = link.value.trim(); hintLink(); render(); }, 180); });
  function hintLink() {
    $("linkHint").textContent = state.link && !/^https?:\/\//i.test(state.link)
      ? "This doesn't start with https://, so phones may treat it as plain text." : "Shorter links give simpler codes that scan faster.";
  }
  $("addLogo").addEventListener("click", () => { $("addBox").hidden = false; $("addMsg").textContent = ""; $("logoFile").focus(); });
  $("cancelAdd").addEventListener("click", () => { $("addBox").hidden = true; });
  $("useOnce").addEventListener("click", async () => {
    const f = $("logoFile").files[0];
    const msg = $("addMsg"); msg.className = "msg err";
    if (!f) { msg.textContent = "Choose a logo file first."; return; }
    try {
      state.local = { name: f.name.replace(/\.[^.]+$/, "").slice(0, 40), url: await rasterize(f) };
      state.logo = "local"; $("addBox").hidden = true; $("logoFile").value = ""; drawChips(); render();
    } catch (e) { msg.textContent = "That file couldn't be read as an image. Try an SVG or PNG."; }
  });

  function fileName(ext) {
    let host = "link"; try { host = new URL(state.link).hostname.replace(/^www\./, ""); } catch (e) { /* keep default */ }
    const t = TEAM.find((x) => x.id === state.logo);
    const logo = state.logo === "none" ? "nologo" : t ? t.name : "logo";
    return `qr-${host}-${logo}.${ext}`.replace(/[^a-z0-9.\-]+/gi, "-").toLowerCase();
  }
  function saveBlob(blob, name) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function save(kind) {
    const msg = $("dlMsg"); msg.className = "msg"; msg.textContent = "";
    if (!state.ok) { msg.className = "msg err"; msg.textContent = "This code didn't pass the scan check, so it can't be downloaded."; return; }
    try {
      if (kind === "png") { const cv = await svgToCanvas(state.svg, 1200); cv.toBlob((b) => saveBlob(b, fileName("png")), "image/png"); }
      else saveBlob(new Blob([state.svg], { type: "image/svg+xml" }), fileName("svg"));
    } catch (e) { msg.className = "msg err"; msg.textContent = "The download didn't start. Try again."; }
  }
  $("dlPng").addEventListener("click", () => save("png"));
  $("dlSvg").addEventListener("click", () => save("svg"));

  // ---------- start ----------
  (async () => {
    state.link = link.value.trim(); drawChips(); drawSwatches();
    for (const t of TEAM) { try { state.dataUrls[t.id] = await toDataUrl(t.src); } catch (e) { /* missing file: chip still shows */ } }
    render();
  })();
})();
