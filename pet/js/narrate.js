import { parseLine } from "./parse.js";
import {
  accidentLine,
  actScene,
  boxScene,
  briefStart,
  coda,
  interrupt,
  intrusion,
  openingProse,
  orient,
  surplus,
  welcomeText,
} from "./scenes.js";
import { fastForward, hourOf, indoor, metabolize, rankDrives, remember } from "./state.js";
import { clamp, mergeNotes, mergePatch, nextRand, para } from "./util.js";

export { openingProse };

const DELTA_KEYS = [
  "stomach", "thirst", "bladder", "energy", "arousal", "stress",
  "bond", "trustHands", "trustBelly", "itch", "valence",
];

function snap(pet) {
  return {
    activity: pet.activity,
    place: pet.place,
    posture: pet.posture,
    gaze: pet.gaze,
    holding: pet.holding,
  };
}

function bestTrick(pet) {
  let name = null;
  let score = 0.22;
  for (const [k, v] of Object.entries(pet.tricks || {})) {
    if (v > score) {
      score = v;
      name = k;
    }
  }
  return name;
}

function asleep(pet) {
  return pet.activity === "dozing" && pet.posture === "curl";
}

export function interpret(pet, parsed) {
  const raw = `${parsed.compact || ""}${parsed.raw || ""}`;
  return {
    mentionsFood: /吃|饭|零食|肉|骨头|饿|碗|好吃/.test(raw),
    mentionsOut: /出门|遛弯|散步|去公园|想出去|出去玩/.test(raw),
    mentionsBath: /洗澡|香波/.test(raw),
    mentionsVet: /兽医|打针|医院/.test(raw),
  };
}

export function decide(pet, parsed, hearing) {
  const choice = {
    kind: parsed.kind,
    trick: parsed.trick || null,
    compliance: "full",
    performed: parsed.kind,
    quality: 0.75,
    delay: "instant",
    hijack: null,
    offered: null,
  };
  if (pet.burst >= 2) choice.quality = 0.45;

  const gentleWake = ["touch", "call", "hold", "offer"].includes(parsed.kind) || parsed.usedName;
  if (asleep(pet) && parsed.tone !== "sharp" && parsed.kind !== "scold" && parsed.kind !== "feed") {
    if (gentleWake) {
      return { ...choice, compliance: "too_asleep", performed: "wake_slow", delay: "slow", quality: 0.34 };
    }
    return { ...choice, compliance: "too_asleep", performed: "stir_only", delay: "slow", quality: 0.15 };
  }

  if ((parsed.tone === "sharp" || parsed.kind === "scold") && parsed.kind !== "trick") {
    const innocent = pet.arousal < 0.62 && !pet.holding;
    return {
      ...choice,
      kind: "scold",
      compliance: innocent ? "confused_appease" : "appease",
      performed: "appease",
      hijack: "fear",
      quality: 0.4,
    };
  }

  if (pet.bladder > 0.9 && indoor(pet) && ["trick", "play", "brush", "hold"].includes(parsed.kind)) {
    return { ...choice, compliance: "conflict", performed: "ask_door", delay: "false_start", hijack: "bladder", quality: 0.3 };
  }

  if (parsed.kind === "speak" && hearing.mentionsFood && pet.stomach < 0.55) {
    return { ...choice, compliance: "misread", performed: "seek_food", hijack: "hunger" };
  }
  if (parsed.kind === "speak" && hearing.mentionsOut && indoor(pet)) {
    return { ...choice, compliance: "misread", performed: "seek_door", hijack: "out", delay: "slow" };
  }
  if (parsed.kind === "speak" && hearing.mentionsBath && pet.bathes > 0) {
    return { ...choice, compliance: "partial", performed: "suspicious", hijack: "fear" };
  }

  if (parsed.kind === "trick") return decideTrick(pet, parsed, choice);

  if (parsed.kind === "call") {
    if (pet.breed === "square" && pet.arousal < 0.6 && nextRand(pet) < 0.52 - pet.bond * 0.28) {
      return { ...choice, compliance: "partial", performed: "halfway", delay: "slow", quality: 0.45 };
    }
    if (pet.place === "sofa_under") {
      return { ...choice, compliance: "full", performed: "extract_then_come", delay: "slow" };
    }
    if (pet.energy < 0.24) return { ...choice, compliance: "partial", performed: "come_slow", delay: "slow", quality: 0.4 };
    return choice;
  }

  if (parsed.kind === "touch") {
    if (pet.stress > 0.68 && parsed.target === "belly") {
      return { ...choice, compliance: "refuse", performed: "duck", hijack: "fear", quality: 0.2 };
    }
    if (parsed.target === "belly" && pet.bond < 0.4 + pet.traits.pride * 0.22) {
      return { ...choice, compliance: "bargain", performed: "sit_on_foot", delay: "slow", quality: 0.4 };
    }
    return choice;
  }

  if (parsed.kind === "feed" && pet.stomach > 0.84) {
    return { ...choice, compliance: "partial", performed: "cache", delay: "slow", quality: 0.5 };
  }

  if (parsed.kind === "run" && pet.energy < 0.28) {
    return { ...choice, compliance: "partial", quality: 0.3, delay: "slow" };
  }

  if (pet.stomach < 0.22 && ["trick", "call", "play"].includes(parsed.kind)) {
    choice.hijack = "hunger";
    choice.compliance = choice.compliance === "full" ? "bargain" : choice.compliance;
  }
  return choice;
}

function decideTrick(pet, parsed, choice) {
  const trick = parsed.trick;
  const flu = pet.tricks[trick] || 0;
  if (flu < 0.16 && pet.heardTrick === trick) {
    return {
      ...choice,
      compliance: "partial",
      performed: trick,
      quality: 0.34,
      delay: "slow",
      hijack: pet.stomach < 0.3 ? "hunger" : null,
    };
  }
  if (trick === "speak" && pet.traits.voicefulness < 0.32 && !(pet.lastTrick === "speak" && pet.totalMin - pet.lastTrickMin < 2.5 && pet.traits.pride > 0.62)) {
    return { ...choice, compliance: "partial", performed: "speak", quality: 0.28, delay: "slow" };
  }
  if (pet.lastTrick === trick && (flu > 0.34 || trick === "speak") && pet.totalMin - pet.lastTrickMin < 2.5 && pet.traits.pride > 0.62) {
    return { ...choice, compliance: "refuse", performed: "not_again", quality: 0.2, delay: "instant" };
  }
  const hungry = pet.stomach < 0.3 && (pet.trustHands > 0.2 || pet.traits.appetite > 0.65);
  if (flu < 0.18) {
    return {
      ...choice,
      compliance: "misread",
      performed: "offer",
      offered: bestTrick(pet),
      quality: 0.22,
      delay: "false_start",
      hijack: hungry ? "hunger" : null,
    };
  }
  let quality = 0.32 + flu * 0.62;
  let compliance = flu < 0.5 ? "partial" : "full";
  let delay = flu < 0.55 || pet.energy < 0.3 ? "slow" : "instant";
  let hijack = null;
  if (hungry) {
    hijack = "hunger";
    compliance = "bargain";
  }
  if (pet.arousal > 0.78 && ["stay", "down", "rollover"].includes(trick)) {
    compliance = "partial";
    quality = Math.min(quality, 0.42);
    delay = "false_start";
    hijack = hijack || "play";
  }
  if (trick === "stay" && pet.traits.velcro > 0.68) {
    compliance = "partial";
    quality = Math.min(quality, 0.48);
  }
  if (pet.burst >= 2) quality *= 0.6;
  return { ...choice, compliance, performed: trick, quality, delay, hijack };
}

function applyDeltas(pet, parsed, choice, notes) {
  const kind = choice.kind || parsed.kind;
  for (const key of DELTA_KEYS) {
    if (typeof notes[key] === "number") {
      const lo = key === "valence" ? -1 : 0;
      pet[key] = clamp((pet[key] || 0) + notes[key], lo, 1);
    }
  }
  if (typeof notes.clean === "number") pet.cleanliness = clamp(pet.cleanliness + notes.clean);
  if (typeof notes.cleanliness === "number") pet.cleanliness = clamp(pet.cleanliness + notes.cleanliness);
  if (notes.handSmell) {
    pet.handSmell = notes.handSmell;
    pet.handSmellMin = 0;
    pet.handNoted = false;
  }
  if (notes.bowlWater != null) pet.bowlWater = clamp(notes.bowlWater);
  if (notes.bowlFood != null) pet.bowlFood = clamp(notes.bowlFood);
  if (notes.wet != null) pet.wet = clamp(notes.wet);
  if (notes.muddy != null) pet.muddy = clamp(notes.muddy);
  if (notes.walks) pet.walks += notes.walks;
  if (notes.bathes) pet.bathes += notes.bathes;
  if (notes.nameSet) {
    const renaming = !!(pet.name && pet.name !== notes.nameSet);
    pet.name = notes.nameSet;
    pet.nameKnown = renaming ? 0.24 : Math.max(pet.nameKnown, 0.22);
    remember(pet, "named", pet.name);
  }
  if (parsed.usedName) pet.nameKnown = clamp(pet.nameKnown + 0.26);

  if (kind === "trick" && (choice.trick || parsed.trick)) {
    const trick = choice.trick || parsed.trick;
    let gain = 0.02;
    if (choice.compliance === "misread") gain = 0.06;
    else if (choice.compliance === "partial" || choice.compliance === "bargain") gain = 0.12;
    else if (choice.compliance === "full") gain = 0.1;
    else if (choice.compliance === "refuse") gain = 0.015;
    else if (choice.compliance === "too_asleep") gain = 0.02;
    gain *= 0.72 + pet.traits.learn * 0.55;
    if (pet.handSmell === "treat") gain += 0.025;
    pet.tricks[trick] = clamp((pet.tricks[trick] || 0) + gain);
  }

  if (notes.bond == null && ["touch", "hold", "call", "feed"].includes(kind) && choice.compliance !== "refuse") {
    pet.bond = clamp(pet.bond + 0.018);
  }
  if (["touch", "call", "feed", "hold", "speak", "play", "trick", "apology", "praise"].includes(kind)) {
    pet.aloneMinutes = 0;
  }
  if (kind === "feed" && choice.compliance !== "refuse") {
    remember(pet, "fed", parsed.object || "treat");
    if (!notes.handSmell) pet.handSmell = "treat";
  }
  if (parsed.tone === "sharp" || kind === "scold") {
    pet.stress = clamp(pet.stress + 0.06);
    remember(pet, "sharp", "");
  }
  if (kind === "walk" || kind === "stroll") remember(pet, "walk", pet.place);
  if (kind === "play") pet.playTries = (pet.playTries || 0) + 1;
  if (notes.bathes) remember(pet, "bath", "");
}

function applyPatch(pet, patch) {
  if (!patch) return;
  const { objects, ...rest } = patch;
  if (objects) pet.objects = { ...pet.objects, ...objects };
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) pet[k] = v;
  }
}

function applySleep(pet, notes) {
  const h = hourOf(pet);
  const night = notes.night || h >= 20 || h < 6;
  if (night && notes.night !== false) {
    const target = 7 * 60 + 5;
    let delta = (target - (pet.clockMin % 1440) + 1440) % 1440;
    if (delta < 90) delta = 8 * 60;
    pet.clockMin = (pet.clockMin + delta) % 1440;
    pet.totalMin += delta;
    pet.stomach = clamp(pet.stomach - Math.min(0.42, 0.006 * delta));
    pet.thirst = clamp(pet.thirst - Math.min(0.35, 0.004 * delta));
    pet.bladder = 0.4;
    pet.energy = 0.84;
    pet.arousal = 0.16;
    pet.stress = clamp(pet.stress - 0.15);
    pet.usedPad = false;
  } else {
    metabolize(pet, 28, { noAccident: true });
    pet.energy = clamp(pet.energy + 0.18);
    pet.arousal = 0.2;
    if (pet.bladder > 0.8) pet.bladder = 0.35;
  }
}

function commit(pet, parsed, choice, built) {
  const notes = built.notes || {};
  applyDeltas(pet, parsed, choice, notes);
  if ((choice.kind || parsed.kind) === "sleep") applySleep(pet, notes);
  else metabolize(pet, built.minutes ?? parsed.minutes ?? 3);
  if (notes.peed) {
    pet.bladder = 0.2;
    pet.peedThisWalk = true;
  }
  if (notes.peedThisWalkClear) pet.peedThisWalk = false;
  applyPatch(pet, built.patch);
  if ((choice.kind || parsed.kind) === "trick") pet.heardTrick = choice.trick || parsed.trick;
  if ((choice.kind || parsed.kind) === "trick" && !["too_asleep", "misread", "refuse"].includes(choice.compliance)) {
    pet.lastTrick = choice.trick || parsed.trick;
    pet.lastTrickMin = pet.totalMin;
  }
  pet.lastHijack = choice.hijack || "";
  pet.activityLock = 8;
  pet.turns += 1;
  pet._usedNameInPara = false;
}

function maybeIntrude(pet, parsed) {
  if (!pet.leftBox) return null;
  if (parsed.intimate && parsed.kind !== "touch") return null;
  if (pet.turns < 2) return null;
  if (["wait", "ignore", "sleep", "name", "apology", "walk", "stroll", "play", "bath", "home"].includes(parsed.kind)) return null;
  const chance = 0.045 + pet.traits.sensitivity * 0.035;
  if (nextRand(pet) > chance) return null;
  return intrusion(pet);
}

function finish(pet, parsed, choice, built, opt) {
  commit(pet, parsed, choice, built);
  let text = built.text;
  if (pet._accidentFresh) {
    text = para([text, accidentLine()]);
    pet._accidentFresh = false;
    pet.place = "hallway";
    pet.posture = "stand";
    pet.gaze = "floor";
    pet.activity = "watching_you";
  }
  pet.lastSeenAt = opt.at ?? Date.now();
  if (!text || text.length < 8) text = "它看着你，耳朵动了动，把没说完的那一点留在眼睛里。";
  return text;
}

function compose(pet, parsed, hearing) {
  const choice = decide(pet, parsed, hearing);
  if (!pet.leftBox) {
    const built = boxScene(pet, parsed);
    return finish(pet, parsed, choice, { ...built, minutes: parsed.minutes }, { at: pet._at });
  }
  const before = snap(pet);
  pet._drives = null;
  if (parsed.kind === "wait" || parsed.kind === "ignore") {
    pet._drives = rankDrives(pet);
  }
  const parts = [];
  const patches = [];
  const notes = [];
  const mundane = ["feet", "rug"].includes(before.place)
    && !before.holding
    && before.activity !== "dozing"
    && before.posture !== "curl"
    && ["touch", "trick", "speak", "praise", "apology", "call", "feed", "offer"].includes(parsed.kind);
  if (choice.compliance === "too_asleep" || !(mundane && nextRand(pet) < 0.62)) {
    parts.push(interrupt(pet, before));
  }
  if (choice.compliance !== "too_asleep") {
    const o = orient(pet, parsed, choice);
    if (o?.text) {
      parts.push(o.text);
      patches.push(o.patch);
    }
  }
  const intr = maybeIntrude(pet, parsed);
  if (intr) parts.push(intr);
  const act = actScene(pet, before, parsed, hearing, choice) || { text: "", patch: null, notes: {} };
  parts.push(act.text);
  patches.push(act.patch);
  notes.push(act.notes);
  if (choice.compliance !== "too_asleep") {
    const extra = surplus(pet, parsed);
    const crowded = parts.join("").length > 220 || parts.join("").includes("喷嚏");
    if (extra?.text && !crowded) {
      parts.push(extra.text);
      patches.push(extra.patch);
    } else {
      const tail = coda(pet, parsed, choice);
      if (tail) parts.push(tail);
    }
  }
  return finish(pet, parsed, choice, {
    text: para(parts),
    patch: mergePatch(...patches),
    notes: mergeNotes(...notes),
    minutes: parsed.minutes,
  }, { at: pet._at });
}

function composeCombo(pet, parsed, hearing) {
  const second = {
    ...parsed.secondary,
    raw: parsed.raw,
    compact: parsed.compact,
    tone: parsed.tone,
    usedName: parsed.usedName,
    intimate: false,
    secondary: null,
    minutes: 3,
  };
  const c1 = decide(pet, { ...parsed, secondary: null }, hearing);
  const c2 = decide(pet, second, interpret(pet, second));
  c2.quality *= 0.65;
  c2.delay = "false_start";
  const before = snap(pet);
  const act = actScene(pet, before, second, interpret(pet, second), c2);
  const text = para([
    interrupt(pet, before),
    briefStart(pet, parsed),
    "你这句话还没在它腿上落稳，下一句又到了",
    act.text,
  ]);
  if (parsed.kind === "trick" && parsed.trick) {
    pet.tricks[parsed.trick] = clamp((pet.tricks[parsed.trick] || 0) + 0.04);
  }
  return finish(pet, second, c2, {
    text,
    patch: act.patch,
    notes: act.notes || {},
    minutes: (parsed.minutes || 3) + 2,
  }, { at: pet._at });
}

export function respond(pet, raw, opt = {}) {
  const at = opt.at ?? Date.now();
  pet._at = at;
  if (pet.lastInputAt && at - pet.lastInputAt > 0 && at - pet.lastInputAt < 3200) {
    pet.burst = (pet.burst || 0) + 1;
  } else pet.burst = 0;
  pet.lastInputAt = at;
  const parsed = parseLine(raw, pet);
  const hearing = interpret(pet, parsed);
  if (parsed.secondary && pet.leftBox) return composeCombo(pet, parsed, hearing);
  return compose(pet, parsed, hearing);
}

export function welcomeBack(pet, awayMin) {
  const sim = Math.min(Math.max(awayMin, 0), 16 * 60);
  fastForward(pet, sim);
  if (!pet.leftBox) pet.place = "box";
  const text = welcomeText(pet, awayMin);
  pet.lastSeenAt = Date.now();
  return text;
}
