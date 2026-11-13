import { BREEDS, breedOf } from "./breed.js";
import { clamp, makeRng } from "./util.js";

export function hourOf(pet) {
  return Math.floor(((pet.clockMin % 1440) + 1440) % 1440 / 60);
}

export function daypart(pet) {
  const h = hourOf(pet);
  if (h < 5) return "夜里";
  if (h < 8) return "清晨";
  if (h < 11) return "上午";
  if (h < 13) return "中午";
  if (h < 17) return "午后";
  if (h < 19) return "傍晚";
  return "晚上";
}

export function sunLine(pet) {
  const h = hourOf(pet);
  if (h < 6 || h >= 19) return "灯还亮着，窗外没有太阳";
  if (h < 9) return "太阳刚落在地毯靠窗的那一角";
  if (h < 12) return "太阳移到茶几腿旁边";
  if (h < 15) return "太阳爬上了沙发扶手";
  if (h < 18) return "太阳变成门口一条薄的光";
  return "窗外只剩一点脏脏的亮";
}

export function indoor(pet) {
  return pet.place !== "street" && pet.place !== "park";
}

export function placePhrase(place) {
  return {
    box: "纸箱里",
    rug: "地毯上",
    sofa: "沙发上",
    sofa_under: "沙发底下",
    window: "窗边",
    bowl: "食盆旁边",
    feet: "你脚边",
    door: "门边",
    balcony: "阳台",
    hallway: "玄关",
    street: "楼下的人行道上",
    park: "小区小路的梧桐荫里",
  }[place] || "屋子里";
}

export function daysTogether(pet, now = Date.now()) {
  if (!pet.bornAt) return 0;
  return Math.max(0, Math.floor((now - pet.bornAt) / 86400000));
}

export function createPet(breedId, seed = 1, now = Date.now()) {
  const breed = BREEDS[breedId] || BREEDS.boat;
  const rng = makeRng(seed);
  const traits = {};
  for (const [k, v] of Object.entries(breed.traits)) {
    traits[k] = clamp(v + (rng.next() - 0.5) * 0.1);
  }
  const clock = new Date(now);
  return {
    v: 1,
    breed: breed.id,
    seed,
    rngState: rng.state,
    name: null,
    nameKnown: 0,
    bornAt: now,
    lastSeenAt: now,
    lastInputAt: 0,
    clockMin: clock.getHours() * 60 + clock.getMinutes(),
    totalMin: 0,
    turns: 0,
    leftBox: false,
    energy: 0.74,
    stomach: 0.64,
    thirst: 0.72,
    bladder: 0.18,
    itch: 0.12,
    cleanliness: 0.86,
    arousal: 0.34,
    valence: 0.12,
    bond: 0.26,
    stress: 0.22,
    trustHands: 0.08,
    trustBelly: 0,
    wet: 0,
    muddy: 0,
    place: "box",
    posture: "stand",
    activity: "in_box",
    gaze: "you",
    holding: null,
    handSmell: "neutral",
    activityLock: 0,
    aloneMinutes: 0,
    burst: 0,
    tricks: { sit: 0, down: 0, paw: 0, spin: 0, speak: 0, stay: 0, rollover: 0 },
    objects: { ball: "sofa_under", rope: "rug", sock: "hallway", leash: "hallway" },
    bowlWater: 0.55,
    bowlFood: 0,
    memory: [],
    recentIds: [],
    walks: 0,
    bathes: 0,
    lastTrick: null,
    lastTrickMin: -999,
    peedThisWalk: false,
    accident: false,
    usedPad: false,
    traits,
  };
}

export function rankDrives(pet) {
  const night = hourOf(pet) < 6 || hourOf(pet) >= 22;
  const list = [
    { id: "hunger", pressure: 1 - pet.stomach },
    { id: "thirst", pressure: 1 - pet.thirst },
    { id: "bladder", pressure: pet.bladder },
    { id: "itch", pressure: pet.itch },
    { id: "sleep", pressure: (1 - pet.energy) * (night ? 1.15 : 0.75) },
    { id: "bond", pressure: Math.min(1, pet.bond * (pet.aloneMinutes / 30)) },
    {
      id: "play",
      pressure: pet.energy * pet.arousal * (pet.stomach > 0.35 ? 0.85 : 0.35),
    },
  ];
  if (pet.wet > 0.45 && pet.breed === "shadow") {
    list.push({ id: "cold", pressure: pet.wet });
  }
  return list.sort((a, b) => b.pressure - a.pressure);
}

export function metabolize(pet, minutes, opt = {}) {
  const m = Math.max(0, minutes);
  if (!m) return;
  pet.stomach = clamp(pet.stomach - 0.01 * m);
  pet.thirst = clamp(pet.thirst - 0.008 * m);
  pet.bladder = clamp(pet.bladder + 0.009 * m);
  pet.itch = clamp(pet.itch + 0.0025 * m + (pet.muddy > 0.2 ? 0.006 * m : 0));
  pet.wet = clamp(pet.wet - 0.03 * m);
  pet.muddy = clamp(pet.muddy - 0.008 * m);
  pet.stress = clamp(pet.stress - 0.008 * m);
  pet.arousal = clamp(pet.arousal + (0.3 - pet.arousal) * Math.min(0.8, m / 20));
  pet.valence = clamp(pet.valence + (0.08 - pet.valence) * 0.015 * m, -1, 1);
  if (pet.stomach < 0.22) pet.valence = clamp(pet.valence - 0.008 * m, -1, 1);
  if (pet.bladder > 0.85) pet.valence = clamp(pet.valence - 0.01 * m, -1, 1);
  if (pet.activity === "dozing" || pet.posture === "curl") {
    pet.energy = clamp(pet.energy + 0.012 * m);
  } else {
    pet.energy = clamp(pet.energy - 0.006 * m);
  }
  pet.clockMin += m;
  pet.totalMin += m;
  pet.aloneMinutes += m;
  if (pet.activityLock > 0) pet.activityLock = Math.max(0, pet.activityLock - m);
  if (pet.handSmell && pet.handSmell !== "neutral") {
    pet.handSmellMin = (pet.handSmellMin || 0) + m;
    if (pet.handSmellMin > 18) {
      pet.handSmell = "neutral";
      pet.handSmellMin = 0;
      pet.handNoted = false;
    }
  }

  if (pet.bladder >= 0.98 && indoor(pet)) {
    if (opt.fast) {
      pet.usedPad = true;
      pet.bladder = 0.28;
    } else if (opt.noAccident) {
      pet.bladder = 0.34;
    } else if (pet.totalMin > 40) {
      pet.bladder = 0.2;
      pet.accident = true;
      pet._accidentFresh = true;
      pet.cleanliness = clamp(pet.cleanliness - 0.25);
    } else {
      pet.bladder = 0.9;
    }
  }
}

export function settleFromDrives(pet) {
  const top = rankDrives(pet)[0];
  if (!top) return;
  if (top.id === "hunger") {
    pet.place = indoor(pet) ? "bowl" : pet.place;
    pet.activity = "watching_bowl";
    pet.posture = "sit";
    pet.gaze = "bowl";
  } else if (top.id === "thirst") {
    pet.place = indoor(pet) ? "bowl" : pet.place;
    pet.activity = "drinking";
    pet.posture = "stand";
    pet.gaze = "bowl";
  } else if (top.id === "bladder") {
    pet.place = indoor(pet) ? "door" : pet.place;
    pet.activity = "waiting_by_door";
    pet.posture = "sit";
    pet.gaze = "door";
  } else if (top.id === "itch") {
    pet.activity = "scratching";
    pet.posture = "sit";
    pet.gaze = "nowhere";
  } else if (top.id === "sleep" || top.id === "cold") {
    pet.activity = "dozing";
    pet.posture = "curl";
    pet.gaze = "nowhere";
    if (indoor(pet)) pet.place = pet.traits.velcro > 0.65 ? "feet" : "rug";
  } else if (top.id === "play") {
    pet.activity = "playing_alone";
    pet.posture = "stand";
    pet.gaze = "floor";
    if (indoor(pet)) pet.place = "rug";
  } else if (top.id === "bond") {
    pet.place = indoor(pet) ? "feet" : pet.place;
    pet.activity = "pressed_against_you";
    pet.posture = "down";
    pet.gaze = "you";
  }
  pet.activityLock = 10;
}

export function fastForward(pet, minutes) {
  const m = Math.max(0, Math.min(minutes, 16 * 60));
  metabolize(pet, m, { fast: true });
  if (hourOf(pet) >= 22 || hourOf(pet) < 6) {
    pet.activity = "dozing";
    pet.posture = "curl";
    pet.gaze = "nowhere";
    if (indoor(pet)) pet.place = pet.traits.velcro > 0.65 ? "feet" : "sofa";
    pet.energy = clamp(pet.energy + 0.25);
  } else {
    settleFromDrives(pet);
  }
  pet.burst = 0;
  pet.arousal = clamp(pet.arousal * 0.5 + 0.15);
}

export function aside(pet, now = Date.now()) {
  const day = `认识第${daysTogether(pet, now) + 1}天`;
  let doing = "它在屋子里";
  if (!pet.leftBox) doing = "它还在纸箱里，耳朵已经出来了";
  else if (pet.place === "street") doing = "你们在楼下";
  else if (pet.place === "park") doing = "你们在梧桐荫里";
  else if (pet.activity === "dozing" || pet.posture === "curl") doing = "它睡着，爪子偶尔抽一下";
  else if (pet.holding === "ball") doing = "球在它嘴里";
  else if (pet.holding === "leash") doing = "牵引绳在它嘴里";
  else if (pet.holding === "sock") doing = "它叼着一只袜子";
  else if (pet.place === "door") doing = "它坐在门边";
  else if (pet.place === "bowl") doing = "它在食盆旁边";
  else if (pet.place === "feet") doing = pet.posture === "down" ? "它趴在你脚边" : "它在你脚边";
  else if (pet.place === "window") doing = "它在窗边";
  else if (pet.place === "sofa_under") doing = "它有半个身子在沙发底下";
  else if (pet.wet > 0.4) doing = "毛还没干";
  else if (pet.place === "hallway") doing = "它在玄关";
  else doing = "它在地毯上，研究一件你不觉得重要的东西";
  const name = pet.name && pet.nameKnown > 0.45 ? pet.name : breedOf(pet).title;
  return `${daypart(pet)} · ${day} · ${name} · ${doing}`;
}

export function whisper(pet) {
  if (!pet.leftBox) return "把手伸过去，或先给它一个名字";
  if (pet.activity === "dozing" || pet.posture === "curl") return "它睡着。可以说得很轻";
  if (pet.holding === "ball") return "球还在它嘴里";
  if (pet.holding === "leash") return "它已经把绳子叼来了";
  if (pet.place === "door") return "它在门边等一个决定";
  if (pet.place === "street" || pet.place === "park") return "你们已经在外面";
  if (pet.stomach < 0.28) return "它惦记着那只空食盆";
  if (pet.bladder > 0.8 && indoor(pet)) return "它有点坐不住，鼻子朝着门";
  if (!pet.name) return "你还没有叫过它的名字";
  return "对它说一句，或做一件很小的事";
}

export function remember(pet, kind, detail = "") {
  pet.memory.push({ kind, detail, t: pet.totalMin });
  if (pet.memory.length > 16) pet.memory.shift();
}

export function toSave(pet) {
  const out = {};
  for (const [k, v] of Object.entries(pet)) {
    if (k.startsWith("_")) continue;
    out[k] = v;
  }
  return out;
}
