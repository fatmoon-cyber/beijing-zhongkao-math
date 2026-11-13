import assert from "node:assert/strict";
import test from "node:test";
import { parseLine } from "../js/parse.js";
import { createPet } from "../js/state.js";
import { respond } from "../js/narrate.js";

const BANNED = ["主人", "undefined", "NaN", "[object", "TODO", "开心值", "非常高兴", "blanket"];

function statsOk(pet) {
  for (const key of ["energy", "stomach", "thirst", "bladder", "itch", "cleanliness", "arousal", "bond", "stress", "wet", "muddy", "trustHands"]) {
    assert.ok(pet[key] >= 0 && pet[key] <= 1, key);
  }
  assert.ok(pet.valence >= -1 && pet.valence <= 1);
}

test("parser hears names, tricks, and unfinished words", () => {
  assert.equal(parseLine("你叫小船").kind, "name");
  assert.equal(parseLine("你叫小船").name, "小船");
  assert.equal(parseLine("叫一声").kind, "trick");
  assert.equal(parseLine("叫一声").trick, "speak");
  assert.equal(parseLine("坐下").trick, "sit");
  assert.equal(parseLine("摸摸肚子").kind, "touch");
  assert.equal(parseLine("摸摸肚子").target, "belly");
  assert.equal(parseLine("给点零食").kind, "feed");
  assert.equal(parseLine("给点零食").object, "treat");
  assert.equal(parseLine("吃饭了").object, "meal");
  assert.equal(parseLine("出门去公园").kind, "walk");
  assert.equal(parseLine("出门去公园").object, "park");
  assert.equal(parseLine("什么都不做").kind, "wait");
  assert.equal(parseLine("我").incomplete, true);
  const combo = parseLine("过来坐下");
  assert.equal(combo.kind, "call");
  assert.equal(combo.secondary.kind, "trick");
  assert.equal(combo.secondary.trick, "sit");
  const pet = { name: "小船" };
  assert.equal(parseLine("小船", pet).kind, "call");
  assert.equal(parseLine("小船，坐下", pet).kind, "trick");
  assert.equal(parseLine("今天风很大我想跟你说很久的话").kind, "speak");
});

test("a morning with the short-legged dog stays concrete", () => {
  const pet = createPet("boat", 42, Date.parse("2026-05-02T06:30:00Z"));
  const lines = [];
  const script = [
    "看看它",
    "伸手",
    "你叫小船",
    "小船",
    "摸摸头",
    "给点零食",
    "坐下",
    "坐下",
    "握手",
    "我",
    "什么都不做",
    "把球扔出去",
    "再扔一次",
    "出门",
    "慢慢走",
    "回家",
    "洗澡",
    "过来",
    "趴下",
    "不许叫",
    "对不起",
    "今天外面风很大，可是我们没有伞，我就在屋里跟你说话",
    "晚安",
  ];
  let at = 1_700_000_000_000;
  for (const line of script) {
    at += 20_000;
    const text = respond(pet, line, { at });
    lines.push(`你 ${line}\n${text}\n`);
    assert.ok(text.length >= 20, text);
    assert.ok(text.length < 700, text.length + text);
    for (const bad of BANNED) assert.equal(text.includes(bad), false, bad + text);
    statsOk(pet);
  }
  assert.equal(pet.name, "小船");
  assert.ok(pet.nameKnown > 0.4);
  assert.equal(pet.leftBox, true);
  assert.ok(pet.walks >= 1);
  assert.ok(pet.bathes >= 1);
  assert.ok(pet.tricks.sit > 0.05);
  console.log("\n----- 短腿 -----\n" + lines.join("\n"));
});

test("the square head refuses to be a doorbell, and looks do not repeat back to back", () => {
  const pet = createPet("square", 7, Date.parse("2026-05-02T07:00:00Z"));
  let at = 1_700_000_000_000;
  const say = (line) => {
    at += 20_000;
    return respond(pet, line, { at });
  };
  say("伸手");
  const looks = [];
  for (let i = 0; i < 6; i++) looks.push(say("看看它"));
  for (let i = 1; i < looks.length; i++) assert.notEqual(looks[i], looks[i - 1]);
  say("说话");
  const again = say("说话");
  assert.match(again, /刚刚|不愿意|习惯|声音/);
  console.log("\n----- 方头 说话 -----\n" + again + "\n");
});

test("a sleeping dog does not perform a clean spin", () => {
  const pet = createPet("shadow", 9, Date.parse("2026-05-02T14:00:00Z"));
  let at = 1_700_000_000_000;
  respond(pet, "伸手", { at });
  pet.activity = "dozing";
  pet.posture = "curl";
  pet.gaze = "nowhere";
  pet.energy = 0.2;
  const before = pet.tricks.spin;
  at += 20_000;
  const text = respond(pet, "转个圈", { at });
  assert.match(text, /睡|眼|耳|呼吸|梦/);
  assert.ok(pet.tricks.spin - before < 0.08);
  console.log("\n----- 睡着 -----\n" + text + "\n");
});

test("outside, a bath is not a bathtub", () => {
  const pet = createPet("curl", 3, Date.parse("2026-05-02T09:00:00Z"));
  let at = 1_700_000_000_000;
  const say = (line) => {
    at += 20_000;
    return respond(pet, line, { at });
  };
  say("摸摸头");
  const out = say("出门");
  assert.ok(pet.place === "street" || pet.place === "park" || pet.place === "rug");
  const bath = say("洗澡");
  if (pet.place === "street" || pet.place === "park") assert.match(bath, /水洼|外面|爪/);
  console.log("\n----- 出门与洗澡 -----\n" + out + "\n" + bath + "\n");
});
