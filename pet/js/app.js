import { BREEDS } from "./breed.js";
import { openingProse, respond, welcomeBack } from "./narrate.js";
import { aside, createPet, toSave, whisper } from "./state.js";

const KEY = "roomdog.v1";

const logEl = document.querySelector("#log");
const chooserEl = document.querySelector("#chooser");
const composerEl = document.querySelector("#form");
const asideEl = document.querySelector("#aside");
const sayEl = document.querySelector("#say");
const hintsEl = document.querySelector("#hints");
const formEl = document.querySelector("#form");
const resetBox = document.querySelector("#reset-box");

let pet = null;
let log = [];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1 || !data.pet || !BREEDS[data.pet.breed]) return null;
    return data;
  } catch {
    return null;
  }
}

function persist() {
  const data = { v: 1, pet: toSave(pet), log: log.slice(-80) };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* private mode or full storage: the dog still lives in this tab */
  }
}

function addBlock(role, text) {
  const p = document.createElement("p");
  p.className = role === "you" ? "you" : "dog";
  if (role === "you") {
    const k = document.createElement("span");
    k.className = "kicker";
    k.textContent = "你";
    const s = document.createElement("span");
    s.textContent = text;
    p.append(k, s);
  } else {
    p.textContent = text;
  }
  logEl.appendChild(p);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  p.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
}

function paintAside() {
  asideEl.textContent = aside(pet);
  sayEl.placeholder = whisper(pet);
  hintsEl.replaceChildren();
  for (const hint of hintList(pet)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hint";
    b.textContent = hint.label;
    b.addEventListener("click", () => {
      if (hint.fill) {
        sayEl.value = hint.fill;
        sayEl.focus();
        return;
      }
      submit(hint.send);
    });
    hintsEl.appendChild(b);
  }
}

function hintList(pet) {
  const list = [];
  if (!pet.name) list.push({ label: "给它一个名字", fill: "你叫" });
  else list.push({ label: pet.name, send: pet.name });
  if (!pet.leftBox) list.push({ label: "伸手", send: "伸手" });
  if (pet.place === "street" || pet.place === "park") {
    list.push({ label: "慢慢走", send: "慢慢走" });
    list.push({ label: "我们回家", send: "回家" });
  } else {
    list.push({ label: "摸摸头", send: "摸摸头" });
    if (pet.holding === "ball") list.push({ label: "球给我", send: "球给我" });
    else list.push({ label: "把球扔出去", send: "把球扔出去" });
    if (pet.stomach < 0.45) list.push({ label: "给点零食", send: "给点零食" });
    if (pet.bladder > 0.62 || pet.place === "door") list.push({ label: "出门", send: "出门" });
  }
  list.push({ label: "什么都不做", send: "什么都不做" });
  const seen = new Set();
  return list.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  }).slice(0, 4);
}

function showPlay() {
  chooserEl.hidden = true;
  composerEl.hidden = false;
  paintAside();
  sayEl.focus();
}

function bootChooser() {
  chooserEl.hidden = false;
  composerEl.hidden = true;
  asideEl.textContent = "纸箱还没拆";
  chooserEl.replaceChildren();
  const head = document.createElement("h2");
  head.textContent = "纸箱里是哪一种";
  const deck = document.createElement("div");
  deck.className = "deck";
  chooserEl.append(head, deck);
  for (const breed of Object.values(BREEDS)) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card";
    const t = document.createElement("strong");
    t.textContent = breed.title;
    const p = document.createElement("span");
    p.textContent = breed.card;
    btn.append(t, p);
    btn.addEventListener("click", () => start(breed.id));
    deck.appendChild(btn);
  }
}

function start(breedId) {
  pet = createPet(breedId, (Date.now() ^ (Math.random() * 1e9)) >>> 0);
  log = [{ role: "dog", text: openingProse(breedId) }];
  logEl.replaceChildren();
  for (const item of log) addBlock(item.role, item.text);
  persist();
  showPlay();
}

function submit(text) {
  const raw = (text ?? sayEl.value).trim();
  if (!raw || !pet) return;
  sayEl.value = "";
  const reply = respond(pet, raw);
  log.push({ role: "you", text: raw });
  log.push({ role: "dog", text: reply });
  if (log.length > 80) log = log.slice(-80);
  addBlock("you", raw);
  addBlock("dog", reply);
  paintAside();
  persist();
}

function boot() {
  const saved = load();
  if (!saved) {
    bootChooser();
    return;
  }
  pet = saved.pet;
  if (!pet.objects) pet.objects = { ball: "sofa_under", rope: "rug", sock: "hallway", leash: "hallway" };
  if (!pet.tricks) pet.tricks = { sit: 0, down: 0, paw: 0, spin: 0, speak: 0, stay: 0, rollover: 0 };
  if (!pet.traits) pet.traits = BREEDS[pet.breed].traits;
  log = Array.isArray(saved.log) ? saved.log : [];
  logEl.replaceChildren();
  for (const item of log) addBlock(item.role, item.text);
  const away = Date.now() - (pet.lastSeenAt || Date.now());
  if (pet.turns > 0 && away > 25 * 60 * 1000) {
    const text = welcomeBack(pet, away / 60000);
    log.push({ role: "dog", text });
    addBlock("dog", text);
    persist();
  }
  showPlay();
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  submit();
});

sayEl.addEventListener("keydown", (e) => {
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Enter") {
    e.preventDefault();
    submit();
  }
});

document.querySelector("#reset").addEventListener("click", () => {
  resetBox.hidden = false;
});
document.querySelector("#reset-no").addEventListener("click", () => {
  resetBox.hidden = true;
});
document.querySelector("#reset-yes").addEventListener("click", () => {
  localStorage.removeItem(KEY);
  pet = null;
  log = [];
  logEl.replaceChildren();
  resetBox.hidden = true;
  bootChooser();
});

boot();
