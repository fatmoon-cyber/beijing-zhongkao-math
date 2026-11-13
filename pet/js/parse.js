const BLOCKED_NAMES = new Set([
  "一声", "两声", "一下", "坐下", "过来", "我", "你", "它", "什么", "这个", "那个", "这里", "那里",
]);

function detectTone(text) {
  if (/！{2,}|!!|坏狗|讨厌|马上给我|不许叫/.test(text)) return "sharp";
  if (/对不起|抱歉|轻轻|小声|晚安|乖/.test(text)) return "soft";
  if (/[？?]|吗$|呢$/.test(text)) return "question";
  if (/[！!]/.test(text)) return "bright";
  if (text.length > 28) return "soft";
  return "flat";
}

function extractName(text) {
  const m = text.match(/^(?:从现在起)?(?:你就叫|你叫|叫它|叫做|名字叫|名叫|取名为|取名|起名|名字是|你的名字是|就叫)([\u4e00-\u9fa5A-Za-z]{1,8})$/);
  if (!m) return null;
  const name = m[1].replace(/[吧啊呀了呢哦]$/g, "");
  if (!name || BLOCKED_NAMES.has(name)) return null;
  return name;
}

function whichTrick(text) {
  if (/趴下|躺下/.test(text)) return "down";
  if (/装死|打滚|翻滚/.test(text)) return "rollover";
  if (/握手|抬爪/.test(text)) return "paw";
  if (/转圈|转个圈|转一圈/.test(text)) return "spin";
  if (/别动|站住|停留|不许动/.test(text)) return "stay";
  if (/坐下|坐好|坐一下/.test(text)) return "sit";
  if (/叫一声|汪一下|汪一/.test(text)) return "speak";
  if (text === "说话" || text === "说话啊" || text === "说话吧") return "speak";
  return null;
}

function whichTarget(text) {
  if (/肚皮|肚子|软肚/.test(text)) return "belly";
  if (/耳/.test(text)) return "ears";
  if (/下巴/.test(text)) return "chin";
  if (/爪|脚|肉垫/.test(text)) return "paws";
  if (/头|脑/.test(text)) return "head";
  if (/背/.test(text)) return "back";
  if (/胸/.test(text)) return "chest";
  return "back";
}

const RULES = [
  { kind: "home", re: /回家|回去|回屋/ },
  { kind: "bath", re: /洗澡|洗个澡/ },
  { kind: "brush", re: /梳毛|梳一下|刷一刷|梳梳/ },
  { kind: "water", re: /喝水|给水|加水|水碗/ },
  { kind: "tease", re: /逗它|逗你|不给|举高/ },
  { kind: "apology", re: /对不起|抱歉|我错了|刚才凶/ },
  { kind: "praise", re: /真棒|好狗|好孩子|真乖|好乖|谢谢/ },
  { kind: "scold", re: /坏狗|讨厌|吵死|别叫|不许叫|太吵/ },
  { kind: "sleep", re: /晚安|睡觉|去睡|该睡/ },
  { kind: "ignore", re: /自己玩|我去做事|别管我|你自己待|我先忙|我要工作/ },
  { kind: "hold", re: /抱一下|抱抱|抱起|搂一/ },
  { kind: "wait", re: /什么都不做|发呆|等一会|等一下|等待|过一会|歇一会/ },
  { kind: "look", re: /看看它|看它一眼|观察它|盯着它|瞧它|看看$/ },
  { kind: "stroll", re: /慢慢走|慢点走|溜达/ },
  { kind: "run", re: /快跑|跑起来|奔跑|冲一下/ },
  { kind: "sniff", re: /嗅一嗅|让它闻|去闻闻|闻一闻/ },
  { kind: "walk", re: /出门|散步|遛狗|去公园|走走|遛弯|我们出去|想出去|出去吧|出去玩/ },
  { kind: "play", re: /扔球|抛球|丢球|玩球|把球|再扔|扔出|扔一次|拔河|绳子玩具/ },
  { kind: "feed", re: /零食|肉干|喂狗|狗粮|开饭|吃饭|骨头|喂一点|喂它|喂你|给点吃|给我吃|^喂$/ },
  { kind: "drop", re: /放下|松开|球给我|交出来|松口|给我/ },
  { kind: "trick", re: /坐下|趴下|躺下|握手|抬爪|转圈|转个圈|转一圈|装死|打滚|叫一声|汪一下|别动|站住|停留|不许动|说话/ },
  { kind: "offer", re: /伸手|闻闻手|给我闻/ },
  { kind: "touch", re: /摸摸|摸一摸|摸它|撸|揉|拍拍|挠|亲亲|刮刮|抚摸|肚皮|肚子|耳朵|下巴|摸头|摸背/ },
  { kind: "call", re: /过来|到这儿|到这里|来这里|这里来|来呀|过来呀/ },
];

function collect(text) {
  const hits = [];
  for (const rule of RULES) {
    const m = rule.re.exec(text);
    if (!m) continue;
    if (rule.kind === "trick") {
      const trick = whichTrick(text.slice(m.index));
      const whole = whichTrick(text);
      if (!whole && !trick) continue;
      if ((whole === "speak" || trick === "speak") && text.length > 6) continue;
    }
    hits.push({ kind: rule.kind, index: m.index, len: m[0].length });
  }
  hits.sort((a, b) => a.index - b.index || b.len - a.len);
  const kept = [];
  for (const hit of hits) {
    const overlap = kept.some((k) => hit.index < k.index + k.len && hit.index + hit.len > k.index);
    if (overlap) continue;
    kept.push(hit);
  }
  const feed = kept.find((h) => h.kind === "feed");
  if (feed && kept.some((h) => h.kind === "drop")) {
    return [feed, ...kept.filter((h) => h !== feed && h.kind !== "drop")];
  }
  return kept;
}

function specialize(hit, text, tone) {
  const kind = hit.kind;
  const out = { kind, tone, target: null, trick: null, object: null };
  if (kind === "trick") {
    out.trick = whichTrick(text) || "sit";
  }
  if (kind === "touch") out.target = whichTarget(text);
  if (kind === "feed") out.object = /饭|狗粮|开饭|晚饭|午饭|早饭/.test(text) ? "meal" : "treat";
  if (kind === "play") out.object = /绳|拔河/.test(text) ? "rope" : "ball";
  if (kind === "walk" && /公园/.test(text)) out.object = "park";
  if (kind === "stroll" && /公园/.test(text)) out.object = "park";
  return out;
}

function minutesFor(kind, object) {
  switch (kind) {
    case "look": return 2;
    case "wait": return 12;
    case "ignore": return 18;
    case "walk": return 28;
    case "stroll": return 16;
    case "home": return 10;
    case "run": return 6;
    case "bath": return 14;
    case "sleep": return 1;
    case "feed": return object === "meal" ? 8 : 3;
    case "brush": return 7;
    case "play": return 4;
    default: return 3;
  }
}

function startsWithCommand(text) {
  return /^(摸|撸|揉|喂|给|坐|趴|握|出|回|洗|梳|扔|抛|丢|抱|看|叫|过|来|睡|对不|抱歉|晚安|不许|别动|站住|慢慢|快跑|零食|吃饭|开饭|自己|什么都|等一|发呆|伸手|闻|嗅|转|装死|打滚|松开|放下|球|回家|散步|遛|逗|举|坏|真棒|好狗|喝|谢谢|安静|别叫)/.test(text);
}

function base(original, text, tone) {
  return {
    tone,
    raw: original,
    compact: text,
    minutes: 3,
    target: null,
    trick: null,
    object: null,
    secondary: null,
    intimate: false,
    usedName: false,
    name: null,
    incomplete: false,
  };
}

export function parseLine(raw, pet = {}) {
  const original = String(raw ?? "").trim();
  const text = original.replace(/\s+/g, "");
  const tone = detectTone(text);
  if (!text) return { ...base(original, text, "soft"), kind: "look", minutes: 2, intimate: true };

  const named = extractName(text);
  if (named) {
    return { ...base(original, text, "soft"), kind: "name", name: named, minutes: 1, intimate: true };
  }

  let body = text;
  let usedName = false;
  if (pet.name && (body === pet.name || body.startsWith(pet.name))) {
    usedName = true;
    body = body.slice(pet.name.length).replace(/^[，,、：:]+/, "");
    if (!body) {
      return { ...base(original, text, tone), kind: "call", usedName, minutes: 2 };
    }
  }

  if (body === "我" || body === "你" || body === "那个" || body === "就是") {
    return { ...base(original, text, "soft"), kind: "speak", usedName, minutes: 1, incomplete: true, intimate: true };
  }

  if (body === "来" || body === "来吧") {
    return { ...base(original, text, tone), kind: "call", usedName, minutes: 2 };
  }
  if (body === "看" || body === "看看") {
    return { ...base(original, text, tone), kind: "look", usedName, minutes: 2 };
  }
  if (body === "喂" || body === "喂吧") {
    return { ...base(original, text, tone), kind: "feed", object: "treat", usedName, minutes: 3 };
  }

  if (body.length >= 18 && !startsWithCommand(body)) {
    return {
      ...base(original, text, tone === "flat" ? "soft" : tone),
      kind: "speak",
      usedName,
      minutes: 2,
      intimate: /对不起|晚安|喜欢你|爱你/.test(body),
    };
  }

  const hits = collect(body);
  if (!hits.length) {
    return { ...base(original, text, tone), kind: "speak", usedName, minutes: 2, intimate: tone === "soft" };
  }

  const primary = specialize(hits[0], body, tone);
  let secondary = null;
  const solo = new Set(["apology", "sleep", "scold", "name", "praise"]);
  if (!solo.has(primary.kind) && hits[1] && hits[1].index >= hits[0].index + Math.max(1, hits[0].len - 1)) {
    const next = specialize(hits[1], body, tone);
    if (next.kind !== primary.kind) secondary = next;
  }

  const intimate = ["apology", "praise", "sleep", "hold", "name"].includes(primary.kind)
    || (primary.kind === "touch" && primary.target === "belly")
    || tone === "soft";

  return {
    ...base(original, text, primary.tone || tone),
    ...primary,
    usedName,
    secondary,
    minutes: minutesFor(primary.kind, primary.object),
    intimate,
  };
}
