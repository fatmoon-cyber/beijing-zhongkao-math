export function clamp(n, a = 0, b = 1) {
  if (!Number.isFinite(n)) return a;
  return Math.min(b, Math.max(a, n));
}

export function makeRng(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    get state() {
      return state;
    },
  };
}

export function nextRand(pet) {
  pet.rngState = (pet.rngState + 0x6D2B79F5) >>> 0;
  let t = pet.rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function end(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  if (/[。！？…」]$/.test(t)) return t;
  return `${t}。`;
}

export function tidy(s) {
  return String(s || "")
    .replace(/undefined|NaN|\bnull\b/g, "")
    .replace(/[ \t]+/g, "")
    .replace(/。{2,}/g, "。")
    .replace(/，{2,}/g, "，")
    .replace(/。，/g, "。")
    .replace(/，。/g, "。")
    .replace(/^[，。、]+/, "")
    .trim();
}

export function para(parts) {
  return tidy(parts.filter(Boolean).map((p) => end(p)).join(""));
}

export function pickOne(pet, group, list) {
  const items = list
    .map((item, i) => {
      if (typeof item === "string") return { id: `${group}#${i}`, w: 1, text: item };
      return {
        id: item.id || `${group}#${i}`,
        w: item.w || 1,
        when: item.when,
        text: item.text,
        patch: item.patch || null,
        notes: item.notes || null,
      };
    })
    .filter((it) => {
      if (it.when == null) return true;
      return typeof it.when === "function" ? !!it.when() : !!it.when;
    });
  const pool = items.length
    ? items
    : [{ id: `${group}#fb`, w: 1, text: "它把耳朵转了转。", patch: null, notes: null }];
  const recent = pet.recentIds || [];
  const fresh = pool.filter((it) => !recent.includes(it.id));
  let chosen;
  if (fresh.length) {
    const use = fresh;
    let r = nextRand(pet) * use.reduce((sum, it) => sum + it.w, 0);
    chosen = use[0];
    for (const it of use) {
      r -= it.w;
      if (r <= 0) {
        chosen = it;
        break;
      }
    }
  } else {
    let bestAt = Infinity;
    chosen = pool[0];
    for (const it of pool) {
      const at = recent.lastIndexOf(it.id);
      if (at < bestAt) {
        bestAt = at;
        chosen = it;
      }
    }
  }
  const text = typeof chosen.text === "function" ? chosen.text() : chosen.text;
  pet.recentIds = [...recent, chosen.id].slice(-64);
  return { ...chosen, text };
}

export function mergePatch(...patches) {
  const out = {};
  for (const p of patches) {
    if (!p) continue;
    if (p.objects) out.objects = { ...(out.objects || {}), ...p.objects };
    for (const k of Object.keys(p)) {
      if (k !== "objects" && k !== "notes") out[k] = p[k];
    }
  }
  return out;
}

export function mergeNotes(...notes) {
  const out = {};
  for (const n of notes) {
    if (!n) continue;
    for (const [k, v] of Object.entries(n)) {
      if (typeof v === "number" && typeof out[k] === "number") out[k] += v;
      else out[k] = v;
    }
  }
  return out;
}
