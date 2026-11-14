(() => {
  'use strict';

  const W = 480;
  const H = 400;
  const TAU = Math.PI * 2;
  const SAVE_KEY = 'pawpal-save-v1';
  const PET_X = 240;
  const PET_Y = 338;
  const GAME_TIME = 30;
  const FONT = 'ui-rounded, "SF Pro Rounded", "Nunito", "PingFang SC", "Microsoft YaHei", "WenQuanYi Micro Hei", system-ui, sans-serif';
  const EYE = '#2d2433';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // ---------------------------------------------------------------- data

  const SPECIES = {
    cat: { colors: ['#f7a95b', '#a9b4c2', '#ffe3bd', '#d6b6f2'], top: 180, fav: 'fish' },
    dog: { colors: ['#d19a66', '#f4cf7a', '#f3ede2', '#b9aca0'], top: 156, fav: 'kibble' },
    bunny: { colors: ['#ffffff', '#ffd0dc', '#cfa883', '#c3cad8'], top: 218, fav: 'carrot' },
  };

  const FOODS = [
    { id: 'kibble', price: 0, hunger: 18, happy: 0, clean: 0 },
    { id: 'carrot', price: 3, hunger: 26, happy: 4, clean: 0 },
    { id: 'fish', price: 6, hunger: 40, happy: 8, clean: -2 },
    { id: 'cake', price: 12, hunger: 30, happy: 25, clean: -6 },
  ];

  const ACCESSORIES = [
    { id: 'flower', price: 20 },
    { id: 'bow', price: 30 },
    { id: 'glasses', price: 45 },
    { id: 'tophat', price: 70 },
    { id: 'crown', price: 150 },
  ];

  const I18N = {
    en: {
      title: 'Pawpal',
      subtitle: 'Adopt a little pet and take good care of it!',
      choosePet: 'Choose your pet',
      cat: 'Cat', dog: 'Dog', bunny: 'Bunny',
      chooseColor: 'Pick a color',
      nameLabel: 'Give it a name',
      adopt: 'Adopt!',
      nameCat: 'Mochi', nameDog: 'Buddy', nameBunny: 'Snowball',
      hunger: 'Food', happy: 'Fun', energy: 'Energy', clean: 'Clean',
      feed: 'Feed', play: 'Play', bath: 'Bath', sleep: 'Sleep', wake: 'Wake', shop: 'Shop',
      kibble: 'Kibble', carrot: 'Carrot', fish: 'Fish', cake: 'Cake',
      free: 'Free',
      flower: 'Flower', bow: 'Bow', glasses: 'Glasses', tophat: 'Top hat', crown: 'Crown',
      shopTitle: 'Shop',
      shopLead: 'Dress up your pet! Earn coins in the mini-game.',
      wear: 'Wear', takeOff: 'Take off',
      notEnough: 'Not enough coins! Play the mini-game to earn more.',
      close: 'Close',
      hello: 'Hi! Tap me for cuddles!',
      hungry: "I'm hungry...",
      sleepy: 'So sleepy...',
      dirty: 'I need a bath!',
      bored: 'Play with me!',
      happyLines: ['I love you!', 'Yay!', 'Best day ever!', 'La la la~'],
      full: "I'm full!",
      yum: 'Yummy!',
      favorite: 'My favorite!',
      tooTired: 'Too tired to play...',
      fresh: 'So fresh!',
      alreadyClean: "I'm already clean!",
      goodNight: 'Good night...',
      awake: 'I slept so well!',
      levelUp: 'Level up! Lv.{n}   +{c} coins',
      welcomeBack: 'Welcome back! {name} missed you.',
      howTo: 'Move to catch the treats. Dodge the stinky socks!',
      go: 'GO!',
      timeUp: "Time's up!",
      earned: 'You earned {c} coins!',
      best: 'Best: {n}',
      newBest: 'New record!',
      again: 'Play again',
      backHome: 'Back home',
      settings: 'Settings',
      language: 'Language',
      sound: 'Sound',
      on: 'On', off: 'Off',
      newPet: 'Adopt a new pet',
      confirmReset: 'Say goodbye to {name} and start over?',
      yes: 'Yes, start over', no: 'Cancel',
      stageBaby: 'Baby', stageKid: 'Kid', stageAdult: 'Grown-up',
      day: 'Day {n}',
      langToggle: '中文',
    },
    zh: {
      title: '萌宠小屋',
      subtitle: '领养一只小宠物，好好照顾它吧！',
      choosePet: '选择你的宠物',
      cat: '猫咪', dog: '小狗', bunny: '兔兔',
      chooseColor: '选择颜色',
      nameLabel: '给它起个名字',
      adopt: '领养！',
      nameCat: '团子', nameDog: '旺财', nameBunny: '雪球',
      hunger: '饱食', happy: '心情', energy: '精力', clean: '清洁',
      feed: '喂食', play: '玩耍', bath: '洗澡', sleep: '睡觉', wake: '叫醒', shop: '商店',
      kibble: '宠物粮', carrot: '胡萝卜', fish: '小鱼', cake: '蛋糕',
      free: '免费',
      flower: '小花', bow: '蝴蝶结', glasses: '眼镜', tophat: '礼帽', crown: '皇冠',
      shopTitle: '商店',
      shopLead: '给宠物打扮一下吧！玩小游戏可以赚金币。',
      wear: '戴上', takeOff: '取下',
      notEnough: '金币不够！去玩小游戏赚金币吧。',
      close: '关闭',
      hello: '你好呀！点点我，摸摸头！',
      hungry: '我饿了…',
      sleepy: '好困呀…',
      dirty: '我想洗澡！',
      bored: '陪我玩嘛！',
      happyLines: ['最喜欢你了！', '好开心！', '今天真棒！', '啦啦啦~'],
      full: '吃饱啦！',
      yum: '真好吃！',
      favorite: '我的最爱！',
      tooTired: '太累了，玩不动…',
      fresh: '香喷喷！',
      alreadyClean: '我已经很干净啦！',
      goodNight: '晚安…',
      awake: '睡得真香！',
      levelUp: '升级啦！Lv.{n}   金币 +{c}',
      welcomeBack: '欢迎回来！{name}想你了。',
      howTo: '左右移动接住零食，躲开臭袜子！',
      go: '开始！',
      timeUp: '时间到！',
      earned: '获得 {c} 金币！',
      best: '最高分：{n}',
      newBest: '新纪录！',
      again: '再玩一次',
      backHome: '回家',
      settings: '设置',
      language: '语言',
      sound: '声音',
      on: '开', off: '关',
      newPet: '重新领养',
      confirmReset: '要和{name}告别并重新开始吗？',
      yes: '重新开始', no: '取消',
      stageBaby: '幼崽', stageKid: '少年', stageAdult: '成年',
      day: '第 {n} 天',
      langToggle: 'English',
    },
  };

  // ---------------------------------------------------------------- state

  function defaultState() {
    const zh = (navigator.language || '').toLowerCase().startsWith('zh');
    return {
      v: 1,
      adopted: false,
      species: 'cat',
      color: 0,
      name: '',
      born: Date.now(),
      stats: { hunger: 70, happy: 70, energy: 85, clean: 80 },
      coins: 10,
      xp: 0,
      level: 1,
      asleep: false,
      owned: [],
      wearing: null,
      best: 0,
      lastSeen: Date.now(),
      lang: zh ? 'zh' : 'en',
      muted: false,
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved || saved.v !== 1) return base;
      const s = Object.assign(base, saved);
      s.stats = Object.assign(defaultState().stats, saved.stats);
      for (const k of Object.keys(s.stats)) s.stats[k] = clamp(Number(s.stats[k]) || 0, 0, 100);
      if (!SPECIES[s.species]) s.species = 'cat';
      s.color = clamp(s.color | 0, 0, 3);
      if (!I18N[s.lang]) s.lang = 'en';
      if (!Array.isArray(s.owned)) s.owned = [];
      s.coins = Math.max(0, s.coins | 0);
      s.level = Math.max(1, s.level | 0);
      return s;
    } catch (e) {
      return base;
    }
  }

  function save() {
    state.lastSeen = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) { /* storage unavailable: keep playing without saving */ }
  }

  let state = loadState();
  let mode = state.adopted ? 'home' : 'adopt';
  let time = 0;
  let anim = null;
  let bubble = null;
  let needTimer = 5;
  let petXpTimer = 0;
  const particles = [];
  const pointer = { x: PET_X, y: PET_Y - 100, inside: false };
  const view = { blinkT: 2, blink: 0, lookX: 0, lookY: 0, joyT: 0 };
  const draft = { species: 'cat', color: 0 };

  function T(key, vars) {
    let s = I18N[state.lang][key];
    if (Array.isArray(s)) s = pick(s);
    if (vars) for (const k of Object.keys(vars)) s = s.replace('{' + k + '}', vars[k]);
    return s;
  }

  const xpNeed = level => 40 + level * 30;
  const petScale = () => (state.level < 3 ? 0.84 : state.level < 6 ? 0.96 : 1.08);
  const stageKey = () => (state.level < 3 ? 'stageBaby' : state.level < 6 ? 'stageKid' : 'stageAdult');
  const mood = () => (state.stats.hunger + state.stats.happy + state.stats.energy + state.stats.clean) / 4;
  const petColor = () => SPECIES[state.species].colors[state.color];
  const defaultName = species => T('name' + species[0].toUpperCase() + species.slice(1));

  function changeStat(key, delta) {
    state.stats[key] = clamp(state.stats[key] + delta, 0, 100);
  }

  // The pet was left alone (tab hidden or game closed): needs drift slowly and never bottom out.
  function applyAway(ms) {
    const min = Math.min(ms / 60000, 12 * 60);
    if (min < 0.2) return;
    const s = state.stats;
    const drift = (key, perMin, floor) => {
      s[key] = Math.max(Math.min(s[key], floor), s[key] - perMin * min);
    };
    drift('hunger', 0.6, 20);
    drift('happy', 0.4, 25);
    drift('clean', 0.3, 25);
    if (state.asleep) {
      s.energy = clamp(s.energy + min * 60 * 1.8, 0, 100);
      if (s.energy >= 100) state.asleep = false;
    } else {
      drift('energy', 0.3, 30);
    }
  }

  // ---------------------------------------------------------------- audio

  let audioCtx = null;
  function tone(freq, dur, type, vol, delay, slide) {
    if (state.muted) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const t0 = audioCtx.currentTime + (delay || 0);
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
      g.gain.setValueAtTime(vol || 0.06, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (e) { /* audio is optional */ }
  }

  const sfx = {
    tap: () => tone(660, 0.07, 'triangle', 0.05),
    pet: () => { tone(880, 0.09, 'sine', 0.06); tone(1175, 0.13, 'sine', 0.05, 0.07); },
    eat: () => { for (let i = 0; i < 3; i++) tone(260 + i * 30, 0.07, 'square', 0.035, 0.6 + i * 0.4); },
    coin: () => { tone(988, 0.06, 'square', 0.035); tone(1319, 0.13, 'square', 0.035, 0.06); },
    star: () => [988, 1319, 1568].forEach((f, i) => tone(f, 0.1, 'square', 0.035, i * 0.06)),
    bad: () => tone(220, 0.28, 'sawtooth', 0.05, 0, -130),
    level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.07, i * 0.1)),
    bath: () => { for (let i = 0; i < 8; i++) tone(rand(700, 1500), 0.08, 'sine', 0.03, i * 0.3); },
    sleep: () => { tone(523, 0.25, 'sine', 0.06); tone(392, 0.4, 'sine', 0.06, 0.22); },
    wake: () => { tone(392, 0.15, 'sine', 0.06); tone(523, 0.28, 'sine', 0.06, 0.14); },
    deny: () => tone(170, 0.14, 'square', 0.035),
    tick: () => tone(520, 0.08, 'triangle', 0.05),
  };

  // ---------------------------------------------------------------- drawing helpers

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const target = amt < 0 ? 0 : 255;
    const k = Math.abs(amt);
    const r = Math.round(lerp(n >> 16, target, k));
    const g = Math.round(lerp((n >> 8) & 255, target, k));
    const b = Math.round(lerp(n & 255, target, k));
    return `rgb(${r},${g},${b})`;
  }

  function ell(c, x, y, rx, ry, rot) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
  }

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function starPath(c, points, outer, inner) {
    c.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 ? inner : outer;
      const a = -Math.PI / 2 + (i * Math.PI) / points;
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    c.closePath();
  }

  function heartPath(c, s) {
    c.beginPath();
    c.moveTo(0, s * 0.35);
    c.bezierCurveTo(-s * 1.1, -s * 0.3, -s * 0.5, -s * 1.0, 0, -s * 0.4);
    c.bezierCurveTo(s * 0.5, -s * 1.0, s * 1.1, -s * 0.3, 0, s * 0.35);
    c.closePath();
  }

  // Accessories are drawn around (0,0) in a roughly 40x40 box; the pet places and scales them.
  function drawAccessory(c, id) {
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.lineWidth = 2.4;
    if (id === 'flower') {
      c.fillStyle = '#ff9fc0';
      c.strokeStyle = '#e0608c';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU - Math.PI / 2;
        ell(c, Math.cos(a) * 8.5, Math.sin(a) * 8.5, 6.5, 6.5);
        c.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU - Math.PI / 2;
        ell(c, Math.cos(a) * 8.5, Math.sin(a) * 8.5, 6.5, 6.5);
        c.fill();
      }
      c.fillStyle = '#ffd23f';
      c.strokeStyle = '#e0a100';
      ell(c, 0, 0, 5, 5);
      c.fill();
      c.stroke();
    } else if (id === 'bow') {
      c.fillStyle = '#ff5c7a';
      c.strokeStyle = '#c93656';
      for (const sgn of [-1, 1]) {
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(sgn * 17, -10);
        c.lineTo(sgn * 17, 10);
        c.closePath();
        c.fill();
        c.stroke();
      }
      ell(c, 0, 0, 5, 5);
      c.fill();
      c.stroke();
    } else if (id === 'glasses') {
      c.strokeStyle = '#3d3550';
      c.fillStyle = 'rgba(150, 215, 255, 0.35)';
      for (const sgn of [-1, 1]) {
        ell(c, sgn * 11, 0, 8.5, 8.5);
        c.fill();
        c.stroke();
      }
      c.beginPath();
      c.moveTo(-2.5, -1);
      c.quadraticCurveTo(0, -3, 2.5, -1);
      c.stroke();
    } else if (id === 'tophat') {
      c.fillStyle = '#3d3550';
      c.strokeStyle = '#231d30';
      rr(c, -11, -15, 22, 26, 3);
      c.fill();
      c.stroke();
      c.fillStyle = '#ff5c7a';
      c.fillRect(-11, 2, 22, 5);
      c.fillStyle = '#3d3550';
      ell(c, 0, 11, 19, 4.5);
      c.fill();
      c.stroke();
    } else if (id === 'crown') {
      c.fillStyle = '#ffd23f';
      c.strokeStyle = '#e0a100';
      c.beginPath();
      c.moveTo(-15, 10);
      c.lineTo(-15, -6);
      c.lineTo(-8, 2);
      c.lineTo(0, -12);
      c.lineTo(8, 2);
      c.lineTo(15, -6);
      c.lineTo(15, 10);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = '#ff5c7a';
      ell(c, 0, 4, 2.8, 2.8);
      c.fill();
      c.fillStyle = '#5bb8ff';
      ell(c, -9, 5, 2.2, 2.2);
      c.fill();
      ell(c, 9, 5, 2.2, 2.2);
      c.fill();
    }
  }

  // Every icon, food, treat and prop in the game is drawn here so no image assets are needed.
  function drawItem(c, id, x, y, size, rot) {
    c.save();
    c.translate(x, y);
    if (rot) c.rotate(rot);
    c.scale(size / 44, size / 44);
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.lineWidth = 2.4;
    switch (id) {
      case 'kibble': {
        c.fillStyle = '#a8683a';
        c.strokeStyle = '#7a4622';
        c.beginPath();
        c.arc(0, -1, 13, Math.PI, 0);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#c98a55';
        for (const [dx, dy] of [[-6, -6], [1, -9], [7, -5], [-1, -4]]) {
          ell(c, dx, dy, 2, 2);
          c.fill();
        }
        c.fillStyle = '#ff7f9a';
        c.strokeStyle = '#c9506b';
        c.beginPath();
        c.moveTo(-19, -1);
        c.lineTo(19, -1);
        c.lineTo(13, 14);
        c.lineTo(-13, 14);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#fff';
        c.save();
        c.translate(0, 8);
        heartPath(c, 4.5);
        c.fill();
        c.restore();
        break;
      }
      case 'carrot': {
        c.rotate(0.6);
        c.fillStyle = '#5fc46a';
        c.strokeStyle = '#3a9547';
        for (const [dx, r] of [[-5, -0.5], [0, 0], [5, 0.5]]) {
          ell(c, dx, -15, 3, 7, r);
          c.fill();
          c.stroke();
        }
        c.fillStyle = '#ff8a3c';
        c.strokeStyle = '#d9641c';
        c.beginPath();
        c.moveTo(-8, -9);
        c.quadraticCurveTo(0, -13, 8, -9);
        c.quadraticCurveTo(5, 10, 0, 19);
        c.quadraticCurveTo(-5, 10, -8, -9);
        c.closePath();
        c.fill();
        c.stroke();
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(-4, -2);
        c.lineTo(1, -2);
        c.moveTo(0, 5);
        c.lineTo(4, 5);
        c.stroke();
        break;
      }
      case 'fish': {
        c.fillStyle = '#6ec3f4';
        c.strokeStyle = '#3b8fc4';
        c.beginPath();
        c.moveTo(8, 0);
        c.lineTo(19, -9);
        c.lineTo(19, 9);
        c.closePath();
        c.fill();
        c.stroke();
        ell(c, -3, 0, 14, 9);
        c.fill();
        c.stroke();
        c.fillStyle = '#fff';
        ell(c, -10, -2, 3, 3);
        c.fill();
        c.fillStyle = EYE;
        ell(c, -10.5, -2, 1.5, 1.5);
        c.fill();
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(-1, 0, 5, -0.9, 0.9);
        c.stroke();
        break;
      }
      case 'cake': {
        c.fillStyle = '#ffe0a8';
        c.strokeStyle = '#d9a257';
        rr(c, -15, -3, 30, 17, 4);
        c.fill();
        c.stroke();
        c.fillStyle = '#ff9fc0';
        c.strokeStyle = '#e0608c';
        c.beginPath();
        c.moveTo(-15, -3);
        c.quadraticCurveTo(-15, -10, -8, -10);
        c.lineTo(8, -10);
        c.quadraticCurveTo(15, -10, 15, -3);
        c.quadraticCurveTo(11, 3, 7.5, -1);
        c.quadraticCurveTo(4, 3, 0, -1);
        c.quadraticCurveTo(-4, 3, -7.5, -1);
        c.quadraticCurveTo(-11, 3, -15, -3);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#ff4d5e';
        c.strokeStyle = '#c42a3b';
        ell(c, 0, -14, 4.5, 4.5);
        c.fill();
        c.stroke();
        break;
      }
      case 'bone': {
        c.rotate(-0.5);
        const lobes = [[-11, -4.5], [-11, 4.5], [11, -4.5], [11, 4.5]];
        c.strokeStyle = '#b9a184';
        c.lineWidth = 4.8;
        c.strokeRect(-11, -3.5, 22, 7);
        for (const [dx, dy] of lobes) {
          ell(c, dx, dy, 5.5, 5.5);
          c.stroke();
        }
        c.fillStyle = '#fff8ec';
        c.fillRect(-11, -3.5, 22, 7);
        for (const [dx, dy] of lobes) {
          ell(c, dx, dy, 5.5, 5.5);
          c.fill();
        }
        break;
      }
      case 'star': {
        c.fillStyle = '#ffd23f';
        c.strokeStyle = '#e0a100';
        starPath(c, 5, 18, 8.5);
        c.fill();
        c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.7)';
        ell(c, -4, -4, 3, 2, -0.6);
        c.fill();
        break;
      }
      case 'sock': {
        c.fillStyle = '#a9b88f';
        c.strokeStyle = '#6f7d58';
        c.beginPath();
        c.moveTo(-7, -14);
        c.lineTo(6, -14);
        c.lineTo(6, 1);
        c.quadraticCurveTo(19, 5, 17, 13);
        c.quadraticCurveTo(13, 19, 0, 15);
        c.quadraticCurveTo(-7, 12, -7, 6);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#f4f1e4';
        rr(c, -9, -19, 17, 7, 2.5);
        c.fill();
        c.stroke();
        c.strokeStyle = '#7fae4c';
        c.lineWidth = 1.8;
        for (const dx of [-13, 12]) {
          c.beginPath();
          c.moveTo(dx, -6);
          c.quadraticCurveTo(dx - 3, -10, dx, -13);
          c.quadraticCurveTo(dx + 3, -16, dx, -19);
          c.stroke();
        }
        break;
      }
      case 'coin': {
        c.fillStyle = '#ffd23f';
        c.strokeStyle = '#d99a00';
        ell(c, 0, 0, 17, 17);
        c.fill();
        c.stroke();
        c.strokeStyle = '#f0b400';
        c.lineWidth = 1.8;
        ell(c, 0, 0, 12, 12);
        c.stroke();
        c.fillStyle = '#e0a100';
        ell(c, 0, 3, 4.5, 3.6);
        c.fill();
        for (const [dx, dy] of [[-5.5, -1.5], [-2, -5], [2, -5], [5.5, -1.5]]) {
          ell(c, dx, dy, 1.9, 2.2);
          c.fill();
        }
        break;
      }
      case 'ball': {
        c.fillStyle = '#ff6b6b';
        c.strokeStyle = '#c9403f';
        ell(c, 0, 0, 16, 16);
        c.fill();
        c.save();
        c.clip();
        c.strokeStyle = '#fff';
        c.lineWidth = 5;
        c.beginPath();
        c.arc(-14, -14, 20, 0, TAU);
        c.stroke();
        c.fillStyle = '#ffd23f';
        ell(c, 9, 9, 5, 5);
        c.fill();
        c.restore();
        ell(c, 0, 0, 16, 16);
        c.stroke();
        break;
      }
      case 'bubble': {
        c.strokeStyle = '#58b6e8';
        for (const [dx, dy, r] of [[-5, 3, 12], [10, -8, 7], [10, 10, 5]]) {
          c.fillStyle = 'rgba(190, 232, 255, 0.85)';
          ell(c, dx, dy, r, r);
          c.fill();
          c.stroke();
          c.fillStyle = '#fff';
          ell(c, dx - r * 0.35, dy - r * 0.35, r * 0.28, r * 0.2, -0.7);
          c.fill();
        }
        break;
      }
      case 'moon': {
        c.fillStyle = '#ffd86b';
        c.strokeStyle = '#e0a100';
        c.rotate(-0.5);
        c.beginPath();
        c.arc(0, 0, 16, Math.PI / 4, (7 * Math.PI) / 4);
        c.arc(9, 0, 11.5, -1.39, 1.39, true);
        c.closePath();
        c.fill();
        c.stroke();
        break;
      }
      case 'sun': {
        c.strokeStyle = '#f0a500';
        c.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          c.beginPath();
          c.moveTo(Math.cos(a) * 13, Math.sin(a) * 13);
          c.lineTo(Math.cos(a) * 18, Math.sin(a) * 18);
          c.stroke();
        }
        c.fillStyle = '#ffd23f';
        c.lineWidth = 2.4;
        ell(c, 0, 0, 9.5, 9.5);
        c.fill();
        c.stroke();
        break;
      }
      case 'bag': {
        c.strokeStyle = '#6d4fd1';
        c.beginPath();
        c.arc(0, -7, 7, Math.PI, 0);
        c.stroke();
        c.fillStyle = '#a98bff';
        rr(c, -14, -7, 28, 24, 5);
        c.fill();
        c.stroke();
        c.fillStyle = '#fff';
        c.save();
        c.translate(0, 7);
        heartPath(c, 6);
        c.fill();
        c.restore();
        break;
      }
      case 'heart': {
        c.fillStyle = '#ff5c7a';
        c.strokeStyle = '#c93656';
        c.translate(0, 5);
        heartPath(c, 16);
        c.fill();
        c.stroke();
        break;
      }
      default:
        drawAccessory(c, id);
    }
    c.restore();
  }

  // ---------------------------------------------------------------- pet

  // Origin is between the feet; the pet is roughly 100 wide and SPECIES[..].top tall at scale 1.
  function drawPet(c, x, y, s, p) {
    const sp = p.species;
    const base = p.color;
    const line = shade(base, -0.62);
    const dark = shade(base, -0.26);
    const light = shade(base, 0.62);
    const t = p.t || 0;
    const expr = p.expr || 'normal';
    const sleeping = expr === 'sleep';
    const joy = expr === 'joy';
    const breathe = sleeping ? Math.sin(t * 1.4) * 2.2 : Math.sin(t * 2.4) * 1.3;
    const wag = Math.sin(t * (joy ? 16 : 5)) * (sleeping ? 0.15 : 1);
    const sq = p.squash || 0;

    c.save();
    c.translate(x, y);
    c.scale(s * (1 + sq * 0.1), s * (1 - sq * 0.1));
    c.lineJoin = 'round';
    c.lineCap = 'round';
    const outline = () => {
      c.strokeStyle = line;
      c.lineWidth = 3;
    };
    outline();

    if (sp === 'cat' || sp === 'dog') {
      for (const [w, col] of [[15, line], [9.5, sp === 'dog' ? dark : base]]) {
        c.strokeStyle = col;
        c.lineWidth = w;
        c.beginPath();
        if (sp === 'cat') {
          c.moveTo(32, -20);
          c.bezierCurveTo(70, -8, 86 + wag * 4, -42, 76 + wag * 8, -74);
        } else {
          c.moveTo(32, -30);
          c.quadraticCurveTo(58, -34, 60 + wag * 10, -64);
        }
        c.stroke();
      }
      outline();
    } else {
      c.fillStyle = light;
      ell(c, 42, -22, 12, 12);
      c.fill();
      c.stroke();
    }

    c.fillStyle = base;
    for (const sgn of [-1, 1]) {
      ell(c, sgn * 22, -5, 15, 9);
      c.fill();
      c.stroke();
    }

    ell(c, 0, -42 + breathe * 0.3, 44, 42);
    c.fill();
    c.stroke();
    c.fillStyle = light;
    ell(c, 0, -34 + breathe * 0.3, 27, 27);
    c.fill();

    if (p.dirty) {
      c.fillStyle = 'rgba(120, 86, 52, 0.5)';
      ell(c, -24, -52, 7, 5, 0.4);
      c.fill();
      ell(c, 20, -24, 6, 4, -0.3);
      c.fill();
    }

    c.fillStyle = base;
    const armRot = joy ? 1.9 + Math.sin(t * 14) * 0.25 : 0.4;
    for (const sgn of [-1, 1]) {
      c.save();
      c.translate(sgn * 37, -62);
      c.rotate(-sgn * armRot);
      ell(c, 0, 12, 9.5, 15);
      c.fill();
      c.stroke();
      c.restore();
    }

    c.translate(0, -108 + breathe);
    c.rotate(joy ? Math.sin(t * 9) * 0.07 : Math.sin(t * 0.9) * 0.025);

    if (sp === 'cat') {
      for (const sgn of [-1, 1]) {
        c.save();
        c.scale(sgn, 1);
        c.fillStyle = base;
        c.beginPath();
        c.moveTo(12, -36);
        c.lineTo(40, -70);
        c.lineTo(51, -20);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#ffb3c1';
        c.beginPath();
        c.moveTo(25, -40);
        c.lineTo(38, -58);
        c.lineTo(44, -32);
        c.closePath();
        c.fill();
        c.restore();
      }
    } else if (sp === 'bunny') {
      for (const sgn of [-1, 1]) {
        const rot = sgn * (0.14 + Math.sin(t * 1.7 + sgn) * 0.04 + (sleeping ? 0.25 : 0));
        c.save();
        c.translate(sgn * 18, -38);
        c.rotate(rot);
        c.fillStyle = base;
        ell(c, 0, -36, 12, 36);
        c.fill();
        c.stroke();
        c.fillStyle = '#ffb3c1';
        ell(c, 0, -34, 5.5, 25);
        c.fill();
        c.restore();
      }
    }

    c.fillStyle = base;
    ell(c, 0, 0, 52, 44);
    c.fill();
    c.stroke();

    if (sp === 'dog') {
      c.fillStyle = dark;
      ell(c, 19, -4, 14, 15);
      c.fill();
      c.fillStyle = light;
      ell(c, 0, 14, 22, 15);
      c.fill();
      for (const sgn of [-1, 1]) {
        c.save();
        c.translate(sgn * 42, -28);
        c.rotate(sgn * (-0.3 + (joy ? Math.sin(t * 14) * 0.25 : Math.sin(t * 2) * 0.03)));
        c.fillStyle = dark;
        ell(c, sgn * 4, 22, 14, 27);
        c.fill();
        c.stroke();
        c.restore();
      }
    } else if (sp === 'cat') {
      c.strokeStyle = dark;
      c.lineWidth = 3.5;
      c.beginPath();
      c.moveTo(-9, -41);
      c.lineTo(-8, -33);
      c.moveTo(0, -42);
      c.lineTo(0, -30);
      c.moveTo(9, -41);
      c.lineTo(8, -33);
      c.stroke();
      outline();
    }

    c.fillStyle = 'rgba(255, 110, 145, 0.4)';
    for (const sgn of [-1, 1]) {
      ell(c, sgn * 34, 12, 8, 5);
      c.fill();
    }

    if (sp !== 'dog') {
      c.strokeStyle = sp === 'cat' ? line : '#b9adc0';
      c.globalAlpha = 0.55;
      c.lineWidth = 1.6;
      for (const sgn of [-1, 1]) {
        c.beginPath();
        c.moveTo(sgn * 38, 8);
        c.lineTo(sgn * 63, 3);
        c.moveTo(sgn * 38, 13);
        c.lineTo(sgn * 63, 16);
        c.stroke();
      }
      c.globalAlpha = 1;
    }

    const ex = 19;
    const ey = -3;
    const lx = (p.lookX || 0) * 2.6;
    const ly = (p.lookY || 0) * 2;
    c.strokeStyle = EYE;
    c.lineWidth = 3.2;
    for (const sgn of [-1, 1]) {
      const cx = sgn * ex;
      if (joy) {
        c.beginPath();
        c.arc(cx, ey + 4, 7, Math.PI * 1.12, Math.PI * 1.88);
        c.stroke();
      } else if (sleeping || p.blink) {
        c.beginPath();
        c.arc(cx, ey - 3, 7, Math.PI * 0.12, Math.PI * 0.88);
        c.stroke();
      } else {
        c.fillStyle = EYE;
        ell(c, cx + lx, ey + ly, 6.8, 7.4);
        c.fill();
        c.fillStyle = '#fff';
        ell(c, cx + lx - 2.2, ey + ly - 2.6, 2.4, 2.4);
        c.fill();
        ell(c, cx + lx + 2.2, ey + ly + 2.6, 1.1, 1.1);
        c.fill();
        if (expr === 'sad') {
          c.lineWidth = 2.6;
          c.beginPath();
          c.moveTo(sgn * 29, ey - 10);
          c.lineTo(sgn * 12, ey - 15);
          c.stroke();
          c.lineWidth = 3.2;
        }
      }
    }
    if (expr === 'sad') {
      c.fillStyle = '#7fd0ff';
      c.beginPath();
      c.moveTo(-26, 4);
      c.quadraticCurveTo(-31, 12, -26, 14);
      c.quadraticCurveTo(-21, 12, -26, 4);
      c.fill();
    }

    if (sp === 'dog') {
      c.fillStyle = EYE;
      ell(c, 0, 7, 7, 5);
      c.fill();
    } else {
      c.fillStyle = '#ff8fa3';
      c.beginPath();
      c.moveTo(-4.5, 5);
      c.lineTo(4.5, 5);
      c.lineTo(0, 10.5);
      c.closePath();
      c.fill();
    }

    c.strokeStyle = EYE;
    c.lineWidth = 2.4;
    const open = p.mouth != null ? p.mouth : joy ? 0.75 : 0;
    if (open > 0.05) {
      c.fillStyle = '#7a2e3e';
      ell(c, 0, 16 + open * 2, 7.5, 2 + open * 6);
      c.fill();
      c.stroke();
      c.fillStyle = '#ff8fa3';
      ell(c, 0, 18 + open * 5, 4, open * 2.6);
      c.fill();
    } else if (expr === 'sad') {
      c.beginPath();
      c.arc(0, 22, 6, Math.PI * 1.15, Math.PI * 1.85);
      c.stroke();
    } else {
      c.beginPath();
      c.arc(-5, 11.5, 5, 0, Math.PI);
      c.stroke();
      c.beginPath();
      c.arc(5, 11.5, 5, 0, Math.PI);
      c.stroke();
      if (sp === 'bunny') {
        c.fillStyle = '#fff';
        c.lineWidth = 1.6;
        rr(c, -3.5, 16, 7, 6, 1.5);
        c.fill();
        c.stroke();
      }
    }

    const acc = p.accessory;
    if (acc) {
      c.save();
      if (acc === 'glasses') {
        c.translate(0, ey);
        c.scale(1.72, 1.72);
      } else if (acc === 'tophat') {
        c.translate(0, -54);
        c.rotate(-0.1);
        c.scale(1.35, 1.35);
      } else if (acc === 'crown') {
        c.translate(0, -52);
        c.scale(1.25, 1.25);
      } else if (acc === 'bow') {
        c.translate(33, -34);
        c.rotate(0.35);
        c.scale(0.95, 0.95);
      } else if (acc === 'flower') {
        c.translate(-35, -32);
        c.scale(0.9, 0.9);
      }
      drawAccessory(c, acc);
      c.restore();
    }

    c.restore();
  }

  // ---------------------------------------------------------------- particles

  function spawn(type, x, y, o) {
    const p = Object.assign({ type, x, y, vx: 0, vy: 0, g: 0, life: 1, size: 10, rot: 0, vr: 0, color: '#fff', text: '' }, o);
    particles.push(p);
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles(c) {
    for (const p of particles) {
      c.save();
      c.globalAlpha = clamp(p.life / 0.4, 0, 1);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      if (p.type === 'heart') {
        c.fillStyle = '#ff5c7a';
        heartPath(c, p.size);
        c.fill();
      } else if (p.type === 'bubble') {
        c.fillStyle = 'rgba(200, 236, 255, 0.6)';
        c.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        c.lineWidth = 1.5;
        ell(c, 0, 0, p.size, p.size);
        c.fill();
        c.stroke();
        c.fillStyle = '#fff';
        ell(c, -p.size * 0.35, -p.size * 0.35, p.size * 0.22, p.size * 0.22);
        c.fill();
      } else if (p.type === 'spark') {
        c.fillStyle = p.color;
        starPath(c, 4, p.size, p.size * 0.35);
        c.fill();
      } else if (p.type === 'confetti') {
        c.fillStyle = p.color;
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 'crumb') {
        c.fillStyle = p.color;
        ell(c, 0, 0, p.size, p.size);
        c.fill();
      } else if (p.type === 'text') {
        c.font = `800 ${p.size}px ${FONT}`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.lineWidth = 4;
        c.strokeStyle = '#fff';
        c.strokeText(p.text, 0, 0);
        c.fillStyle = p.color;
        c.fillText(p.text, 0, 0);
      }
      c.restore();
    }
  }

  function confetti(n) {
    const colors = ['#ff7f9a', '#ffd23f', '#6cc4f5', '#5fd0a5', '#a98bff', '#ffa94d'];
    for (let i = 0; i < n; i++) {
      spawn('confetti', rand(40, W - 40), rand(-40, 20), {
        vx: rand(-60, 60), vy: rand(60, 160), g: 160, life: rand(1.6, 2.6),
        size: rand(8, 13), rot: rand(0, TAU), vr: rand(-8, 8), color: pick(colors),
      });
    }
  }

  function hearts(n) {
    const s = petScale();
    for (let i = 0; i < n; i++) {
      spawn('heart', PET_X + rand(-45, 45) * s, PET_Y - rand(110, 170) * s, {
        vx: rand(-25, 25), vy: rand(-80, -45), life: rand(0.8, 1.3), size: rand(7, 12), rot: rand(-0.3, 0.3),
      });
    }
  }

  // ---------------------------------------------------------------- home scene

  function skyPhase() {
    const d = new Date();
    const h = d.getHours() + d.getMinutes() / 60;
    if (h >= 6.5 && h < 17) return 'day';
    if ((h >= 17 && h < 19) || (h >= 5 && h < 6.5)) return 'dusk';
    return 'night';
  }

  function drawWindow(c, x, y, w, h) {
    const phase = skyPhase();
    c.save();
    rr(c, x, y, w, h, 14);
    c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h);
    if (phase === 'day') {
      g.addColorStop(0, '#7fcfff');
      g.addColorStop(1, '#d9f3ff');
    } else if (phase === 'dusk') {
      g.addColorStop(0, '#7f8fe0');
      g.addColorStop(0.6, '#ffb38a');
      g.addColorStop(1, '#ffd9a0');
    } else {
      g.addColorStop(0, '#1d2452');
      g.addColorStop(1, '#3d4a8a');
    }
    c.fillStyle = g;
    c.fillRect(x, y, w, h);
    if (phase === 'night') {
      c.fillStyle = '#fff';
      const stars = [[18, 20], [48, 44], [84, 16], [108, 58], [30, 76], [70, 84], [100, 30]];
      stars.forEach(([sx, sy], i) => {
        c.globalAlpha = 0.5 + 0.5 * Math.sin(time * 2 + i * 1.7);
        ell(c, x + sx, y + sy, 1.6, 1.6);
        c.fill();
      });
      c.globalAlpha = 1;
      drawItem(c, 'moon', x + w - 34, y + 32, 40);
    } else {
      const sy = phase === 'day' ? y + 32 : y + h - 22;
      c.fillStyle = phase === 'day' ? '#ffe066' : '#ff8a5c';
      ell(c, x + w - 34, sy, 15, 15);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.9)';
      for (const [off, cy, sc] of [[0, 38, 1], [70, 70, 0.75]]) {
        const cx = x + ((time * 6 + off) % (w + 60)) - 30;
        ell(c, cx, y + cy, 16 * sc, 9 * sc);
        c.fill();
        ell(c, cx + 13 * sc, y + cy + 3 * sc, 12 * sc, 7 * sc);
        c.fill();
        ell(c, cx - 12 * sc, y + cy + 3 * sc, 10 * sc, 6 * sc);
        c.fill();
      }
    }
    c.restore();
    c.strokeStyle = '#fff';
    c.lineWidth = 7;
    rr(c, x, y, w, h, 14);
    c.stroke();
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(x + w / 2, y);
    c.lineTo(x + w / 2, y + h);
    c.moveTo(x, y + h / 2);
    c.lineTo(x + w, y + h / 2);
    c.stroke();
    c.fillStyle = '#fff';
    rr(c, x - 10, y + h, w + 20, 10, 5);
    c.fill();
  }

  function drawRoom(c) {
    const g = c.createLinearGradient(0, 0, 0, 268);
    g.addColorStop(0, '#ffe9d9');
    g.addColorStop(1, '#ffd7c2');
    c.fillStyle = g;
    c.fillRect(0, 0, W, 268);
    c.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 13; col++) {
        ell(c, col * 40 + (row % 2 ? 20 : 0), 18 + row * 38, 3, 3);
        c.fill();
      }
    }

    drawWindow(c, 44, 44, 128, 104);

    c.save();
    c.translate(388, 96);
    c.rotate(0.04);
    c.fillStyle = '#fff';
    c.strokeStyle = '#e8b79c';
    c.lineWidth = 5;
    rr(c, -40, -34, 80, 68, 8);
    c.fill();
    c.stroke();
    c.fillStyle = '#ffc9d6';
    ell(c, 0, 8, 13, 11);
    c.fill();
    for (const [dx, dy] of [[-16, -6], [-6, -15], [6, -15], [16, -6]]) {
      ell(c, dx, dy, 5.5, 6.5);
      c.fill();
    }
    c.restore();

    c.fillStyle = '#f2b596';
    c.fillRect(0, 262, W, 10);
    c.fillStyle = '#eec08f';
    c.fillRect(0, 272, W, H - 272);
    c.strokeStyle = 'rgba(190, 130, 80, 0.35)';
    c.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      const y = 272 + i * 32;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(W, y);
      c.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const row = i % 4;
      const x = 30 + i * 61 - row * 23;
      c.beginPath();
      c.moveTo(x % W, 272 + row * 32);
      c.lineTo(x % W, 304 + row * 32);
      c.stroke();
    }

    c.fillStyle = '#ff9fb5';
    ell(c, PET_X, PET_Y + 8, 158, 36);
    c.fill();
    c.strokeStyle = '#ffc6d3';
    c.lineWidth = 5;
    ell(c, PET_X, PET_Y + 8, 136, 27);
    c.stroke();

    drawItem(c, 'kibble', 62, 318, 50);
    drawItem(c, 'ball', 424, 330, 34, Math.sin(time * 0.7) * 0.2);
  }

  function drawBubble(c, text, x, y) {
    c.save();
    c.font = `700 15px ${FONT}`;
    const w = Math.max(60, c.measureText(text).width + 28);
    const h = 36;
    const bx = clamp(x - w / 2, 8, W - w - 8);
    const by = Math.max(8, y - h - 12);
    c.fillStyle = '#fff';
    c.strokeStyle = '#4a3b52';
    c.lineWidth = 2.5;
    rr(c, bx, by, w, h, 16);
    c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(x - 8, by + h - 1.5);
    c.lineTo(x, by + h + 11);
    c.lineTo(x + 8, by + h - 1.5);
    c.fill();
    c.beginPath();
    c.moveTo(x - 8, by + h);
    c.lineTo(x, by + h + 11);
    c.lineTo(x + 8, by + h);
    c.stroke();
    c.fillStyle = '#4a3b52';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, bx + w / 2, by + h / 2 + 1);
    c.restore();
  }

  function mouthPos() {
    const s = petScale();
    return { x: PET_X, y: PET_Y - 90 * s };
  }

  function drawHome(c) {
    drawRoom(c);
    const s = petScale();
    const st = state.stats;
    const dirty = st.clean < 30;
    let expr = 'normal';
    let mouth;
    let y = PET_Y;
    let squash = 0;

    if (state.asleep) {
      expr = 'sleep';
    } else if (anim && anim.type === 'eat') {
      const p = anim.t / anim.dur;
      mouth = p < 0.28 ? 0.8 : Math.abs(Math.sin((p - 0.28) * Math.PI * 6)) * 0.9;
    } else if ((anim && anim.type === 'bath') || view.joyT > 0) {
      expr = 'joy';
      if (!anim) {
        const hop = Math.abs(Math.sin(view.joyT * 9));
        y -= hop * 12;
        squash = (0.5 - hop) * 0.5;
      }
    } else if (mood() < 35 || Math.min(st.hunger, st.happy, st.energy, st.clean) < 15) {
      expr = 'sad';
    }

    c.fillStyle = 'rgba(120, 60, 80, 0.18)';
    ell(c, PET_X, PET_Y + 3, 58 * s * (1 - (PET_Y - y) / 60), 11 * s);
    c.fill();

    drawPet(c, PET_X, y, s, {
      species: state.species,
      color: petColor(),
      t: time,
      expr,
      mouth,
      blink: view.blink > 0,
      lookX: view.lookX,
      lookY: view.lookY,
      accessory: state.wearing,
      dirty,
      squash,
    });

    if (dirty && !(anim && anim.type === 'bath')) {
      c.strokeStyle = 'rgba(120, 150, 70, 0.7)';
      c.lineWidth = 2.5;
      c.lineCap = 'round';
      for (const dx of [-70, 72]) {
        const bx = PET_X + dx * s;
        const by = PET_Y - 70 * s + Math.sin(time * 2 + dx) * 4;
        c.beginPath();
        c.moveTo(bx, by);
        c.quadraticCurveTo(bx - 6, by - 9, bx, by - 18);
        c.quadraticCurveTo(bx + 6, by - 27, bx, by - 36);
        c.stroke();
      }
      c.fillStyle = '#4a3b52';
      for (let i = 0; i < 2; i++) {
        const a = time * 3.2 + i * Math.PI;
        ell(c, PET_X + Math.cos(a) * 62 * s, PET_Y - 150 * s + Math.sin(a * 1.7) * 14, 2.4, 2.4);
        c.fill();
      }
    }

    if (anim && anim.type === 'eat') {
      const p = anim.t / anim.dur;
      const m = mouthPos();
      const from = { x: PET_X + 110, y: PET_Y - 20 };
      const k = clamp(p / 0.28, 0, 1);
      const ease = 1 - Math.pow(1 - k, 3);
      const fx = lerp(from.x, m.x + 20 * s, ease);
      const fy = lerp(from.y, m.y + 6, ease) - Math.sin(k * Math.PI) * 40;
      const bites = Math.floor(clamp((p - 0.28) / 0.72, 0, 0.999) * 3.4);
      const size = [40, 30, 20, 0][bites] * s;
      if (size > 0) drawItem(c, anim.food, fx, fy, size, Math.sin(time * 10) * 0.08);
    }

    if (anim && anim.type === 'bath') {
      c.fillStyle = '#fff';
      c.strokeStyle = '#a9d3ee';
      c.lineWidth = 3;
      rr(c, PET_X - 96, PET_Y - 50, 192, 62, 28);
      c.fill();
      c.stroke();
      c.fillStyle = '#eaf7ff';
      rr(c, PET_X - 106, PET_Y - 60, 212, 18, 9);
      c.fill();
      c.stroke();
      c.fillStyle = '#fff';
      for (let i = 0; i < 9; i++) {
        const fx = PET_X - 88 + i * 22;
        const r = 13 + Math.sin(time * 4 + i * 1.3) * 3;
        ell(c, fx, PET_Y - 62 + Math.sin(time * 3 + i) * 2, r, r);
        c.fill();
        c.stroke();
      }
      c.fillStyle = '#fff';
      c.fillRect(PET_X - 92, PET_Y - 62, 184, 10);
    }

    if (state.asleep) {
      c.fillStyle = 'rgba(24, 22, 70, 0.48)';
      c.fillRect(0, 0, W, H);
    }

    drawParticles(c);

    if (bubble) drawBubble(c, bubble.text, PET_X, PET_Y - (SPECIES[state.species].top + 6) * s);
  }

  function say(key, vars) {
    bubble = { text: T(key, vars), t: 2.6 };
  }

  function updateHome(dt) {
    const st = state.stats;
    const s = petScale();

    if (state.asleep) {
      changeStat('hunger', (-2.5 / 60) * dt);
      changeStat('clean', (-1.2 / 60) * dt);
      changeStat('energy', 1.8 * dt);
      if (Math.random() < dt * 0.9) {
        spawn('text', PET_X + 40 * s, PET_Y - 150 * s, {
          text: 'Z', vx: rand(12, 26), vy: rand(-34, -22), life: 1.8, size: rand(14, 24), color: '#cfd6ff',
        });
      }
      if (st.energy >= 100) {
        state.asleep = false;
        sfx.wake();
        say('awake');
        view.joyT = 0.8;
        renderHud();
        save();
      }
    } else {
      changeStat('hunger', (-5 / 60) * dt);
      changeStat('happy', ((st.hunger < 15 ? -8 : -4) / 60) * dt);
      changeStat('energy', (-3 / 60) * dt);
      changeStat('clean', (-2.5 / 60) * dt);
    }

    if (anim) {
      anim.t += dt;
      if (anim.type === 'eat') {
        const bites = Math.floor(clamp((anim.t / anim.dur - 0.28) / 0.72, 0, 0.999) * 3.4);
        if (bites > anim.bites) {
          anim.bites = bites;
          const m = mouthPos();
          for (let i = 0; i < 6; i++) {
            spawn('crumb', m.x + 14 * s, m.y + 8, {
              vx: rand(-70, 70), vy: rand(-110, -30), g: 420, life: rand(0.4, 0.7), size: rand(1.6, 3.2), color: anim.crumb,
            });
          }
        }
      } else if (anim.type === 'bath' && Math.random() < dt * 16) {
        spawn('bubble', PET_X + rand(-90, 90), PET_Y - rand(40, 120), {
          vx: rand(-14, 14), vy: rand(-70, -30), life: rand(0.8, 1.5), size: rand(4, 11),
        });
      }
      if (anim.t >= anim.dur) {
        const done = anim;
        anim = null;
        if (done.type === 'eat') {
          say(done.fav ? 'favorite' : 'yum');
          if (done.fav) hearts(4);
          view.joyT = 0.7;
        } else if (done.type === 'bath') {
          st.clean = 100;
          changeStat('happy', 6);
          say('fresh');
          view.joyT = 0.9;
          for (let i = 0; i < 12; i++) {
            spawn('spark', PET_X + rand(-70, 70), PET_Y - rand(20, 190) * s, {
              life: rand(0.6, 1.2), size: rand(5, 10), vr: rand(-3, 3), color: pick(['#fff', '#ffe98a', '#bfe9ff']),
            });
          }
        }
        renderHud();
        save();
      }
    }

    view.blinkT -= dt;
    if (view.blinkT <= 0) {
      view.blink = 0.13;
      view.blinkT = rand(2, 5);
    }
    view.blink = Math.max(0, view.blink - dt);
    view.joyT = Math.max(0, view.joyT - dt);
    const tx = pointer.inside ? clamp((pointer.x - PET_X) / 160, -1, 1) : 0;
    const ty = pointer.inside ? clamp((pointer.y - (PET_Y - 110 * s)) / 140, -1, 1) : 0;
    view.lookX = lerp(view.lookX, tx, 1 - Math.pow(0.002, dt));
    view.lookY = lerp(view.lookY, ty, 1 - Math.pow(0.002, dt));

    if (bubble) {
      bubble.t -= dt;
      if (bubble.t <= 0) bubble = null;
    }
    petXpTimer = Math.max(0, petXpTimer - dt);
    needTimer -= dt;
    if (needTimer <= 0 && !bubble && !anim && !state.asleep) {
      needTimer = rand(7, 10);
      const needs = [['hunger', 'hungry'], ['energy', 'sleepy'], ['clean', 'dirty'], ['happy', 'bored']]
        .filter(([k]) => st[k] < 30)
        .sort((a, b) => st[a[0]] - st[b[0]]);
      if (needs.length) say(needs[0][1]);
      else if (mood() > 72 && Math.random() < 0.4) say('happyLines');
    }
  }

  // ---------------------------------------------------------------- actions

  function addXp(n) {
    state.xp += n;
    let leveled = false;
    while (state.xp >= xpNeed(state.level)) {
      state.xp -= xpNeed(state.level);
      state.level++;
      const bonus = 10 + state.level * 2;
      state.coins += bonus;
      leveled = true;
      toast(T('levelUp', { n: state.level, c: bonus }));
    }
    if (leveled) {
      confetti(60);
      sfx.level();
      view.joyT = 1.4;
    }
  }

  const busy = () => mode !== 'home' || !!anim;

  function feed(food) {
    if (busy() || state.asleep) return;
    closeTray();
    if (state.stats.hunger >= 97) {
      say('full');
      sfx.deny();
      return;
    }
    if (state.coins < food.price) {
      toast(T('notEnough'));
      sfx.deny();
      return;
    }
    const fav = SPECIES[state.species].fav === food.id;
    state.coins -= food.price;
    changeStat('hunger', food.hunger);
    changeStat('happy', food.happy + (fav ? 8 : 0));
    changeStat('clean', food.clean);
    const crumb = { kibble: '#a8683a', carrot: '#ff8a3c', fish: '#6ec3f4', cake: '#ff9fc0' }[food.id];
    anim = { type: 'eat', t: 0, dur: 2, food: food.id, bites: 0, fav, crumb };
    bubble = null;
    sfx.eat();
    addXp(food.price > 0 ? 7 : 4);
    renderHud();
    save();
  }

  function bath() {
    if (busy() || state.asleep) return;
    closeTray();
    if (state.stats.clean >= 95) {
      say('alreadyClean');
      sfx.deny();
      return;
    }
    anim = { type: 'bath', t: 0, dur: 3 };
    bubble = null;
    sfx.bath();
    addXp(6);
    renderHud();
  }

  function toggleSleep() {
    if (busy()) return;
    closeTray();
    state.asleep = !state.asleep;
    if (state.asleep) {
      sfx.sleep();
      say('goodNight');
    } else {
      sfx.wake();
      bubble = null;
      view.blinkT = 0;
    }
    renderHud();
    save();
  }

  function cuddle() {
    if (busy()) return;
    if (state.asleep) {
      sfx.tap();
      return;
    }
    hearts(3);
    changeStat('happy', 2.5);
    view.joyT = Math.max(view.joyT, 0.55);
    sfx.pet();
    if (petXpTimer <= 0) {
      petXpTimer = 3;
      addXp(1);
    }
    renderHud();
  }

  // ---------------------------------------------------------------- mini-game

  const game = { phase: 'idle', t: 0, count: 0, score: 0, items: [], spawn: 0, px: W / 2, tx: W / 2, hurt: 0, glad: 0, left: false, right: false, lastTick: 0 };

  function startGame() {
    if (mode === 'home' && (anim || state.asleep)) return;
    closeTray();
    if (state.stats.energy < 15) {
      say('tooTired');
      sfx.deny();
      return;
    }
    mode = 'game';
    Object.assign(game, {
      phase: 'count', count: 3, t: GAME_TIME, score: 0, items: [], spawn: 0.3,
      px: W / 2, tx: W / 2, hurt: 0, glad: 0, left: false, right: false, lastTick: 4,
    });
    particles.length = 0;
    bubble = null;
    $('#quit-btn').hidden = false;
    renderHud();
  }

  function goHome() {
    mode = 'home';
    game.phase = 'idle';
    particles.length = 0;
    $('#quit-btn').hidden = true;
    closeOverlay('result');
    renderHud();
  }

  function endGame() {
    if (game.phase !== 'play') {
      goHome();
      return;
    }
    game.phase = 'over';
    const score = game.score;
    const record = score > state.best;
    if (record) state.best = score;
    state.coins += score;
    changeStat('happy', Math.min(40, 12 + score));
    changeStat('energy', -20);
    changeStat('hunger', -6);
    changeStat('clean', -5);
    $('#result-score').textContent = score;
    $('#result-earned').textContent = T('earned', { c: score });
    $('#result-best').textContent = record && score > 0 ? T('newBest') : T('best', { n: state.best });
    $('#again-btn').disabled = state.stats.energy < 15;
    $('#quit-btn').hidden = true;
    openOverlay('result');
    addXp(10 + Math.floor(score / 2));
    if (record && score > 0) sfx.level();
    renderHud();
    save();
  }

  function updateGame(dt) {
    if (game.left) game.tx -= 430 * dt;
    if (game.right) game.tx += 430 * dt;
    game.tx = clamp(game.tx, 34, W - 34);
    game.px = lerp(game.px, game.tx, 1 - Math.pow(0.00001, dt));
    game.hurt = Math.max(0, game.hurt - dt);
    game.glad = Math.max(0, game.glad - dt);

    if (game.phase === 'count') {
      game.count -= dt;
      const n = Math.ceil(game.count);
      if (n < game.lastTick && n > 0) {
        game.lastTick = n;
        sfx.tick();
      }
      if (game.count <= 0) {
        game.phase = 'play';
        sfx.coin();
      }
      return;
    }
    if (game.phase !== 'play') return;

    game.t -= dt;
    const prog = 1 - game.t / GAME_TIME;
    game.spawn -= dt;
    if (game.spawn <= 0) {
      game.spawn = lerp(0.72, 0.36, prog) * rand(0.8, 1.2);
      const r = Math.random();
      const kind = r < 0.2 ? 'sock' : r < 0.27 ? 'star' : pick(['bone', 'fish', 'carrot', 'cake']);
      game.items.push({
        kind, x: rand(30, W - 30), y: -24,
        vy: lerp(140, 250, prog) * rand(0.9, 1.15), rot: rand(-0.5, 0.5), vr: rand(-2, 2),
      });
    }

    for (let i = game.items.length - 1; i >= 0; i--) {
      const it = game.items[i];
      it.y += it.vy * dt;
      it.rot += it.vr * dt;
      if (it.y > 312 && it.y < 360 && Math.abs(it.x - game.px) < 40) {
        game.items.splice(i, 1);
        if (it.kind === 'sock') {
          game.score = Math.max(0, game.score - 3);
          game.hurt = 0.6;
          sfx.bad();
          spawn('text', it.x, 300, { text: '-3', vy: -60, life: 0.8, size: 22, color: '#f0524f' });
        } else {
          const pts = it.kind === 'star' ? 5 : 1;
          game.score += pts;
          game.glad = 0.35;
          (it.kind === 'star' ? sfx.star : sfx.coin)();
          spawn('text', it.x, 300, { text: '+' + pts, vy: -60, life: 0.8, size: pts > 1 ? 26 : 20, color: pts > 1 ? '#e0a100' : '#3aa76d' });
          if (pts > 1) {
            for (let k = 0; k < 8; k++) {
              spawn('spark', it.x, 320, { vx: rand(-90, 90), vy: rand(-120, -20), g: 200, life: rand(0.4, 0.8), size: rand(4, 8), color: '#ffd23f' });
            }
          }
        }
      } else if (it.y > H + 30) {
        game.items.splice(i, 1);
      }
    }

    if (game.t <= 0) {
      game.t = 0;
      endGame();
    }
  }

  function drawGame(c) {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#8fd6ff');
    g.addColorStop(0.75, '#e4f7ff');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.fillStyle = '#ffe066';
    ell(c, 410, 62, 26, 26);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.9)';
    for (const [off, cy, sc] of [[0, 70, 1.3], [210, 120, 1], [380, 48, 0.8]]) {
      const cx = ((time * 9 + off) % (W + 120)) - 60;
      ell(c, cx, cy, 26 * sc, 13 * sc);
      c.fill();
      ell(c, cx + 20 * sc, cy + 4 * sc, 18 * sc, 10 * sc);
      c.fill();
      ell(c, cx - 20 * sc, cy + 4 * sc, 16 * sc, 9 * sc);
      c.fill();
    }
    c.fillStyle = '#a8e08a';
    ell(c, 110, 372, 210, 70);
    c.fill();
    ell(c, 400, 378, 190, 62);
    c.fill();
    c.fillStyle = '#7fcf63';
    c.fillRect(0, 352, W, H - 352);
    c.fillStyle = '#6bbd52';
    for (let i = 0; i < 16; i++) {
      const x = 14 + i * 31;
      c.beginPath();
      c.moveTo(x - 5, 354);
      c.lineTo(x, 344 + (i % 3) * 2);
      c.lineTo(x + 5, 354);
      c.fill();
    }

    for (const it of game.items) drawItem(c, it.kind, it.x, it.y, 38, it.rot);

    c.fillStyle = 'rgba(40, 90, 40, 0.2)';
    ell(c, game.px, 393, 32, 6);
    c.fill();
    const lean = clamp((game.tx - game.px) / 120, -1, 1);
    drawPet(c, game.px, 392, 0.52, {
      species: state.species,
      color: petColor(),
      t: time,
      expr: game.hurt > 0 ? 'sad' : game.glad > 0 ? 'joy' : 'normal',
      mouth: game.hurt > 0 || game.glad > 0 ? undefined : 0.6,
      lookX: lean,
      lookY: -0.8,
      accessory: state.wearing,
    });

    drawParticles(c);

    c.fillStyle = 'rgba(255,255,255,0.9)';
    rr(c, 12, 12, 96, 36, 18);
    c.fill();
    drawItem(c, 'coin', 32, 30, 28);
    c.fillStyle = '#4a3b52';
    c.font = `800 20px ${FONT}`;
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText(String(game.score), 52, 31);

    const frac = clamp(game.t / GAME_TIME, 0, 1);
    c.fillStyle = 'rgba(255,255,255,0.9)';
    rr(c, 124, 20, 290, 20, 10);
    c.fill();
    if (frac > 0.02) {
      c.fillStyle = frac < 0.25 ? '#f0524f' : '#ff9f7f';
      rr(c, 128, 24, Math.max(12, 282 * frac), 12, 6);
      c.fill();
    }

    if (game.phase === 'count') {
      c.fillStyle = 'rgba(74, 59, 82, 0.35)';
      c.fillRect(0, 0, W, H);
      const n = Math.ceil(game.count);
      const pulse = 1 + (game.count - Math.floor(game.count)) * 0.35;
      c.textAlign = 'center';
      c.fillStyle = '#fff';
      c.strokeStyle = '#4a3b52';
      c.lineWidth = 8;
      c.font = `900 ${Math.round(96 * pulse)}px ${FONT}`;
      c.strokeText(String(n), W / 2, 170);
      c.fillText(String(n), W / 2, 170);
      c.font = `800 17px ${FONT}`;
      c.lineWidth = 5;
      c.strokeText(T('howTo'), W / 2, 262);
      c.fillText(T('howTo'), W / 2, 262);
      const legend = [['bone', '+1'], ['star', '+5'], ['sock', '-3']];
      legend.forEach(([id, label], i) => {
        const lx = W / 2 - 110 + i * 110;
        drawItem(c, id, lx - 16, 304, 34);
        c.textAlign = 'left';
        c.strokeText(label, lx + 4, 305);
        c.fillText(label, lx + 4, 305);
      });
    }
  }

  // ---------------------------------------------------------------- DOM / UI

  const canvas = $('#scene');
  const ctx = canvas.getContext('2d');
  let viewScale = 1;
  let dpr = 1;

  function fitCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssW = canvas.clientWidth || W;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round((cssW * dpr * H) / W);
    viewScale = canvas.width / W;
  }

  function renderIcon(cv) {
    const size = Number(cv.dataset.size) || 32;
    const d = Math.min(window.devicePixelRatio || 1, 3);
    cv.width = cv.height = Math.round(size * d);
    cv.style.width = cv.style.height = size + 'px';
    const c = cv.getContext('2d');
    c.setTransform(d, 0, 0, d, 0, 0);
    drawItem(c, cv.dataset.icon, size / 2, size / 2, size);
  }

  const renderIcons = root => root.querySelectorAll('canvas[data-icon]').forEach(renderIcon);

  let toastTimer = 0;
  function toast(text) {
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function openOverlay(id) {
    $('#' + id).hidden = false;
  }
  function closeOverlay(id) {
    $('#' + id).hidden = true;
  }

  function priceHtml(price) {
    if (price === 0) return `<span class="price free">${T('free')}</span>`;
    return `<span class="price"><canvas class="icon" data-icon="coin" data-size="16"></canvas>${price}</span>`;
  }

  function renderTray() {
    const tray = $('#food-tray');
    tray.innerHTML = '';
    for (const food of FOODS) {
      const b = document.createElement('button');
      b.className = 'food';
      b.dataset.food = food.id;
      b.innerHTML = `<canvas class="icon" data-icon="${food.id}" data-size="40"></canvas><span>${T(food.id)}</span>${priceHtml(food.price)}`;
      b.addEventListener('click', () => feed(food));
      tray.appendChild(b);
    }
    renderIcons(tray);
  }

  function closeTray() {
    $('#food-tray').hidden = true;
    $('[data-action="feed"]').classList.remove('active');
  }

  function toggleTray() {
    if (busy() || state.asleep) return;
    const tray = $('#food-tray');
    tray.hidden = !tray.hidden;
    $('[data-action="feed"]').classList.toggle('active', !tray.hidden);
  }

  function renderShop() {
    const grid = $('#shop-grid');
    grid.innerHTML = '';
    $('#shop-coins').textContent = state.coins;
    for (const item of ACCESSORIES) {
      const owned = state.owned.includes(item.id);
      const wearing = state.wearing === item.id;
      const b = document.createElement('button');
      b.className = 'shop-item' + (wearing ? ' wearing' : '');
      b.dataset.item = item.id;
      const tag = owned ? `<span class="tag">${T(wearing ? 'takeOff' : 'wear')}</span>` : priceHtml(item.price);
      b.innerHTML = `<canvas class="icon" data-icon="${item.id}" data-size="52"></canvas><span>${T(item.id)}</span>${tag}`;
      b.addEventListener('click', () => {
        const msg = $('#shop-msg');
        msg.textContent = '';
        if (!owned) {
          if (state.coins < item.price) {
            msg.textContent = T('notEnough');
            sfx.deny();
            return;
          }
          state.coins -= item.price;
          state.owned.push(item.id);
          state.wearing = item.id;
          sfx.star();
          addXp(8);
        } else {
          state.wearing = wearing ? null : item.id;
          sfx.tap();
        }
        save();
        renderShop();
        renderHud();
      });
      grid.appendChild(b);
    }
    renderIcons(grid);
  }

  const hud = {
    name: $('#pet-name-label'),
    badge: $('#level-badge'),
    xp: $('#xp-fill'),
    sub: $('#hud-sub'),
    coins: $('#coins'),
    sleepLabel: $('#sleep-label'),
    sleepIcon: $('#sleep-icon'),
    stats: {},
  };
  $$('.stat').forEach(el => {
    hud.stats[el.dataset.stat] = { el, fill: el.querySelector('.fill') };
  });

  function renderHud() {
    hud.name.textContent = state.name;
    hud.badge.textContent = 'Lv.' + state.level;
    hud.xp.style.width = clamp((state.xp / xpNeed(state.level)) * 100, 0, 100) + '%';
    const days = Math.floor((Date.now() - state.born) / 86400000) + 1;
    hud.sub.textContent = `${T(stageKey())} · ${T('day', { n: days })}`;
    hud.coins.textContent = state.coins;
    for (const k of Object.keys(hud.stats)) {
      const v = state.stats[k];
      hud.stats[k].fill.style.width = v.toFixed(1) + '%';
      hud.stats[k].el.classList.toggle('low', v < 25);
    }
    const icon = state.asleep ? 'sun' : 'moon';
    hud.sleepLabel.textContent = T(state.asleep ? 'wake' : 'sleep');
    if (hud.sleepIcon.dataset.icon !== icon) {
      hud.sleepIcon.dataset.icon = icon;
      renderIcon(hud.sleepIcon);
    }
    const blocked = busy();
    $$('.action').forEach(b => {
      const a = b.dataset.action;
      b.disabled = a === 'shop' ? mode !== 'home' : a === 'sleep' ? blocked : blocked || state.asleep;
    });
  }

  function applyLang() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = T('title');
    $$('[data-i18n]').forEach(el => {
      el.textContent = T(el.dataset.i18n);
    });
    $$('[data-lang-toggle]').forEach(el => {
      el.textContent = T('langToggle');
    });
    $$('[data-lang]').forEach(el => el.classList.toggle('selected', el.dataset.lang === state.lang));
    $$('[data-sound]').forEach(el => el.classList.toggle('selected', (el.dataset.sound === 'off') === state.muted));
    $('#name-input').placeholder = defaultName(draft.species);
    renderTray();
    renderShop();
    renderHud();
  }

  function setLang(lang) {
    state.lang = lang;
    bubble = null;
    applyLang();
    if (state.adopted) save();
  }

  // ---- adoption screen

  function renderAdopt() {
    $$('.species').forEach(b => b.classList.toggle('selected', b.dataset.species === draft.species));
    const sw = $('#swatches');
    sw.innerHTML = '';
    SPECIES[draft.species].colors.forEach((col, i) => {
      const b = document.createElement('button');
      b.className = 'swatch' + (i === draft.color ? ' selected' : '');
      b.style.background = col;
      b.setAttribute('aria-label', col);
      b.addEventListener('click', () => {
        draft.color = i;
        sfx.tap();
        renderAdopt();
      });
      sw.appendChild(b);
    });
    $('#name-input').placeholder = defaultName(draft.species);
  }

  function drawAdoptPreviews() {
    $$('.species').forEach(b => {
      const cv = b.querySelector('canvas');
      const d = Math.min(window.devicePixelRatio || 1, 3);
      if (cv.width !== Math.round(100 * d)) {
        cv.width = Math.round(100 * d);
        cv.height = Math.round(112 * d);
      }
      const c = cv.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0);
      c.clearRect(0, 0, 100, 112);
      const sp = b.dataset.species;
      const selected = sp === draft.species;
      drawPet(c, 46, 108, 0.46, {
        species: sp,
        color: SPECIES[sp].colors[selected ? draft.color : 0],
        t: time + (sp === 'dog' ? 1.3 : sp === 'bunny' ? 2.6 : 0),
        expr: selected ? 'joy' : 'normal',
      });
    });
  }

  function showAdopt() {
    mode = 'adopt';
    draft.species = 'cat';
    draft.color = 0;
    $('#name-input').value = '';
    renderAdopt();
    openOverlay('adopt');
  }

  function adopt() {
    const name = $('#name-input').value.trim() || defaultName(draft.species);
    const fresh = defaultState();
    fresh.lang = state.lang;
    fresh.muted = state.muted;
    fresh.adopted = true;
    fresh.species = draft.species;
    fresh.color = draft.color;
    fresh.name = name;
    state = fresh;
    mode = 'home';
    anim = null;
    particles.length = 0;
    closeOverlay('adopt');
    confetti(50);
    sfx.level();
    say('hello');
    view.joyT = 1.2;
    needTimer = 9;
    applyLang();
    save();
  }

  // ---- events

  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }

  canvas.addEventListener('pointermove', e => {
    const p = canvasPoint(e);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = true;
    if (mode === 'game') game.tx = p.x;
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
  });
  canvas.addEventListener('pointerdown', e => {
    const p = canvasPoint(e);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = true;
    if (mode === 'game') {
      game.tx = p.x;
      return;
    }
    if (mode !== 'home') return;
    if (!$('#food-tray').hidden) {
      closeTray();
      return;
    }
    const s = petScale();
    const top = SPECIES[state.species].top * s;
    const dx = (p.x - PET_X) / (70 * s);
    const dy = (p.y - (PET_Y - top / 2)) / (top / 2 + 8);
    if (dx * dx + dy * dy <= 1) cuddle();
  });

  window.addEventListener('keydown', e => {
    if (mode !== 'game') return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') game.left = true;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') game.right = true;
    else return;
    e.preventDefault();
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') game.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') game.right = false;
  });

  $$('.action').forEach(b => {
    b.addEventListener('click', () => {
      sfx.tap();
      const a = b.dataset.action;
      if (a === 'feed') toggleTray();
      else if (a === 'play') startGame();
      else if (a === 'bath') bath();
      else if (a === 'sleep') toggleSleep();
      else if (a === 'shop') {
        closeTray();
        $('#shop-msg').textContent = '';
        renderShop();
        openOverlay('shop');
      }
    });
  });

  $('#quit-btn').addEventListener('click', () => {
    sfx.tap();
    endGame();
  });
  $('#again-btn').addEventListener('click', () => {
    sfx.tap();
    closeOverlay('result');
    mode = 'home';
    startGame();
  });
  $('#home-btn').addEventListener('click', () => {
    sfx.tap();
    goHome();
    view.joyT = 0.9;
  });

  $$('[data-close]').forEach(b => {
    b.addEventListener('click', () => {
      sfx.tap();
      closeOverlay(b.dataset.close);
    });
  });

  $('#settings-btn').addEventListener('click', () => {
    sfx.tap();
    closeTray();
    openOverlay('settings');
  });
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  $$('[data-lang-toggle]').forEach(b => b.addEventListener('click', () => setLang(state.lang === 'zh' ? 'en' : 'zh')));
  $$('[data-sound]').forEach(b => {
    b.addEventListener('click', () => {
      state.muted = b.dataset.sound === 'off';
      applyLang();
      sfx.tap();
      if (state.adopted) save();
    });
  });
  $('#reset-btn').addEventListener('click', () => {
    $('#confirm-text').textContent = T('confirmReset', { name: state.name });
    openOverlay('confirm');
  });
  $('#confirm-yes').addEventListener('click', () => {
    closeOverlay('confirm');
    closeOverlay('settings');
    closeOverlay('result');
    $('#quit-btn').hidden = true;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) { /* nothing to clear */ }
    state.adopted = false;
    showAdopt();
  });

  $$('.species').forEach(b => {
    b.addEventListener('click', () => {
      draft.species = b.dataset.species;
      draft.color = 0;
      sfx.tap();
      renderAdopt();
    });
  });
  $('#adopt-btn').addEventListener('click', adopt);
  $('#name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') adopt();
  });

  window.addEventListener('resize', fitCanvas);
  document.addEventListener('visibilitychange', () => {
    if (!state.adopted) return;
    if (document.hidden) {
      save();
    } else {
      applyAway(Date.now() - state.lastSeen);
      state.lastSeen = Date.now();
      renderHud();
    }
  });
  window.addEventListener('pagehide', () => {
    if (state.adopted) save();
  });

  // ---------------------------------------------------------------- main loop

  let last = performance.now();
  let hudTimer = 0;
  let saveTimer = 0;

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt;

    if (mode === 'home') updateHome(dt);
    else if (mode === 'game') updateGame(dt);
    updateParticles(dt);

    ctx.setTransform(viewScale, 0, 0, viewScale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (mode === 'game') {
      drawGame(ctx);
    } else if (mode === 'home') {
      drawHome(ctx);
    } else {
      drawRoom(ctx);
      drawAdoptPreviews();
    }

    hudTimer -= dt;
    if (hudTimer <= 0 && state.adopted) {
      hudTimer = 0.25;
      renderHud();
    }
    saveTimer += dt;
    if (saveTimer > 5 && state.adopted) {
      saveTimer = 0;
      save();
    }
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- boot

  fitCanvas();
  renderIcons(document);
  if (state.adopted) {
    const away = Date.now() - state.lastSeen;
    applyAway(away);
    applyLang();
    if (away > 5 * 60000) toast(T('welcomeBack', { name: state.name }));
    save();
  } else {
    applyLang();
    showAdopt();
  }
  requestAnimationFrame(frame);
})();
