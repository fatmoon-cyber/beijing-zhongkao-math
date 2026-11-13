import { breedOf } from "./breed.js";
import { daypart, hourOf, indoor, placePhrase, sunLine } from "./state.js";
import { para, pickOne, nextRand } from "./util.js";

function say(pet, group, list) {
  return pickOne(pet, group, list).text;
}

const TRICK_WORD = {
  sit: "坐下",
  down: "趴下",
  paw: "握手",
  spin: "转圈",
  speak: "说话",
  stay: "别动",
  rollover: "打滚",
};

function trickWord(trick) {
  return TRICK_WORD[trick] || "那个动作";
}

export function openingProse(breedId) {
  const texts = {
    boat: "纸箱还没完全打开。通气孔被鼻子拱得有点湿。你的膝盖一落地，箱子里先响的不是喉咙，是尾巴打在纸板上的声音，很密，像有人在下面鼓掌。一只过大的耳朵先探出来，另一只被箱沿压弯了。它看着你，整个后半身仍在箱子里继续鼓掌。",
    shadow: "纸箱打开一条缝。里面的动物把细细的下巴搁上箱沿，没有发出声音。它的皮底下能看见一点冷，眼睛却是热的，一直看着你的手，好像手是这间屋子的天气。你再靠近一点，它才把一只前爪也放上来，爪尖在抖，不知道是怕，还是已经想碰你。",
    curl: "纸箱里有一双不肯错开的眼睛，卷毛在阴影里一颤一颤。你还没说话，它已经把你走到它面前的步数听完了。纸板底下伸出一只爪子，极轻地点了点你的鞋尖，又收回去。像先打过招呼，再决定要不要认识。",
    square: "纸箱敞着。它坐在里面，尾巴卷好，姿势像这箱子是它自己的座位。你伸手的时候它没有迎上来，只把鼻子凑到能数清你指纹的距离，认真地闻，然后打了一个很小的喷嚏。它看了你一眼。那一眼的意思很清楚：可以，但先别抱。",
  };
  return texts[breedId] || texts.boat;
}

export function boxScene(pet, parsed) {
  const b = breedOf(pet).body;
  const kind = parsed.kind;

  if (kind === "name") {
    return {
      text: `你朝纸箱放出一个新的声音。${b.ears}动了动。它不知道这是名字，名字要在耳朵里撞上好几次，才会肯留下来。它看着你，等这个声音再来一次。`,
      patch: { gaze: "you", activity: "in_box", posture: "stand" },
      notes: { nameSet: parsed.name },
    };
  }

  if (kind === "look" || kind === "wait" || kind === "speak" || kind === "praise" || kind === "apology") {
    return {
      text: say(pet, "box.look", [
        `你没有把手伸进去。它就维持着前爪扒箱沿的姿势，${b.ears}跟着你的呼吸轻轻转。纸箱里的尾巴偶尔自己响一下，像一句没人问的话。`,
        `它在纸箱的阴影里看你。你看得越久，它越把下巴往箱沿上送，送出一点点，又收回去。${b.greet}`,
        parsed.incomplete
          ? "你只说出一个字，就停了。纸箱里的动物把那一个字含住，等后半截。后半截没有来。它用鼻子碰了碰箱沿，替你把句子在那里收住。"
          : `你的声音进了纸箱，在纸板里变得更近。它歪过头，${b.ears}把每个字的温度量了一遍，没有出来，也没有躲。`,
      ]),
      patch: { gaze: "you" },
      notes: {},
    };
  }

  if (kind === "scold") {
    return {
      text: `这个声音太硬了，纸箱像忽然变小。它把身体压低，舌头很快地舔了一下鼻头，眼睛仍看着你，不知道自己哪一步还没做就已经做错。`,
      patch: { posture: "down", gaze: "you", activity: "in_box" },
      notes: { stress: 0.12, valence: -0.08, bond: 0 },
    };
  }

  if (kind === "sleep") {
    return {
      text: `你把声音放轻。它在纸箱里转了半圈，${b.sleep}。纸板随着呼吸轻轻响。它还没真正睡着，可已经把你算进这间屋子的背景里。`,
      patch: { posture: "curl", activity: "dozing", gaze: "nowhere" },
      notes: { arousal: -0.1 },
    };
  }

  if (kind === "feed") {
    const meal = parsed.object === "meal";
    return {
      text: meal
        ? `食盆在厨房里响了一声。纸箱里的动物停了一拍，然后整只翻过箱沿，落地时四只脚没有同时到。它还是赶到盆边，吃得又急又响，吃完抬头看你，嘴上挂着一颗没舔掉的。`
        : `你的手指间有一点味道。它先把鼻子伸出纸箱，只够到空气，于是前爪一扒，整只滚了出来，滚到你手上。接零食的时候牙齿碰得极轻，轻完又用舌头在你指腹上找第二块。`,
      patch: {
        leftBox: true,
        place: meal ? "bowl" : "feet",
        posture: "stand",
        activity: meal ? "watching_bowl" : "watching_you",
        gaze: meal ? "bowl" : "hands",
      },
      notes: meal
        ? { stomach: 0.5, bowlFood: 0, bond: 0.04, handSmell: "treat", valence: 0.1 }
        : { stomach: 0.16, trustHands: 0.1, bond: 0.04, handSmell: "treat", arousal: 0.08, valence: 0.1 },
    };
  }

  if (kind === "water") {
    return {
      text: `水声比你的手更有说服力。它从纸箱里出来，出来的方式有点跌，然后把脸埋进碗里。喝完下巴还滴着，它把滴下来的那一点也舔掉了。`,
      patch: { leftBox: true, place: "bowl", posture: "stand", activity: "drinking", gaze: "bowl" },
      notes: { thirst: 0.3, bladder: 0.06, bowlWater: 0.7, bond: 0.02 },
    };
  }

  if (kind === "hold") {
    if (pet.traits.pride > 0.75) {
      return {
        text: `你想把它连同纸箱一起抱起来。它的身体立刻变成实心的，四条腿往下溜，溜到地毯上，坐下，尾巴卷好。${b.refuse}。认识的第一件事，它选择了站在自己的脚上。`,
        patch: { leftBox: true, place: "rug", posture: "sit", activity: "watching_you", gaze: "floor" },
        notes: { stress: 0.06, bond: 0.01 },
      };
    }
    return {
      text: `你的手从它肚子底下穿过。它在纸箱里僵了一秒，然后重量忽然有了，热的，带着纸板和一点点奶味。${b.lean}。放到地毯上的时候，它还抓着你的袖口，好像地面是第二步，不是第一步。`,
      patch: { leftBox: true, place: "feet", posture: "stand", activity: "pressed_against_you", gaze: "you" },
      notes: { bond: 0.05, stress: pet.traits.sensitivity > 0.7 ? 0.05 : -0.04, valence: 0.06 },
    };
  }

  if (kind === "walk" || kind === "stroll" || kind === "run") {
    return {
      text: `你看向门。它先看你的脸，再看门，中间还隔着一只纸箱。它把前爪扒上箱沿，屁股一挣，滚到地毯上，站稳以前先撞到你的脚踝。门外的世界它闻到了，可腿还在学习这间屋子。它坐下来，${b.ears}朝着门，身体留给你。`,
      patch: { leftBox: true, place: "rug", posture: "sit", activity: "watching_you", gaze: "door" },
      notes: { arousal: 0.06, bond: 0.02 },
    };
  }

  if (kind === "trick" || kind === "play" || kind === "bath" || kind === "brush") {
    const word = kind === "trick" ? trickWord(parsed.trick) : kind === "play" ? "球" : kind === "bath" ? "洗澡" : "梳子";
    return {
      text: `「${word}」落进纸箱，纸箱里没有足够的地板来完成它。它把前爪扒上沿，整只翻出来，落地时坐到了你的鞋上。坐不是你要的那个坐，可它抬起脸，${b.ears}张着，很愿意把下一遍做对。`,
      patch: { leftBox: true, place: "feet", posture: "sit", activity: "watching_you", gaze: "you" },
      notes: { bond: 0.03, arousal: 0.05 },
    };
  }

  return {
    text: `你的手伸到箱沿。它先闻指甲，再闻袖口，然后才把下巴搁上来，搁得很轻。${b.greet}。下一秒它已经在地毯上了，四只脚还在跟地板谈判。`,
    patch: { leftBox: true, place: "rug", posture: "stand", activity: "watching_you", gaze: "you" },
    notes: { bond: 0.03, stress: -0.04 },
  };
}

export function interrupt(pet, before) {
  const b = breedOf(pet).body;
  if (before.activity === "dozing" || before.posture === "curl") {
    return say(pet, "int.sleep", [
      `${sunLine(pet)}。它把呼吸放得很浅，${b.sleep}。你一出声，那点呼吸先乱了`,
      "它睡着，爪子抽动了一下，像在梦里踩到一块不存在的地板。声音进来，梦断了，眼睛还没睁",
    ]);
  }
  if (before.holding === "ball") {
    return say(pet, "int.ball", [
      "球还含在它嘴里。你说话时它没有松口，只是用舌头把球顶到一边，好让耳朵能工作",
      "它叼着球站着，球上沾着一点地毯的毛。你的声音让后半身先回答，嘴仍拒绝谈判",
    ]);
  }
  if (before.holding === "leash") {
    return "牵引绳从它嘴角垂下来，绳头是湿的。它一听见你，就把绳子往你手里送，牙印还留在绳上";
  }
  if (before.holding === "sock") {
    return "一只袜子从它嘴里垂着。它看见你在看，就把袜子又往里含了含，好像含住就不算被抓住";
  }
  if (before.holding === "rope") {
    return "绳子玩具从它嘴角拖到地上。你一开口，它就把绳子往旁边甩了甩，甩出一个它自己才懂的节拍";
  }
  if (before.place === "sofa_under") {
    return "它有半个身子在沙发底下，外面只剩后腿和一点灰。你的声音钻进去，倒退这才开始";
  }
  if (before.place === "door") {
    return say(pet, "int.door", [
      "它坐在门边，鼻子几乎碰到门缝。你一说话它就回头，回头的速度说明它等的就是这个",
      "门被它盯得很具体。你开口的时候它已经站起来，爪尖在地板上点了一下",
    ]);
  }
  if (before.place === "bowl") {
    if (pet.stomach < 0.35 && pet.bowlFood <= 0.02) {
      return "它在空食盆边。盆沿是湿的，那是它刚才舔的。你的声音让舔的动作停住，停住以后它还是看着盆";
    }
    return "它在食盆旁边，水声一下子断了。下巴上挂着一滴，它带着那一滴转过头";
  }
  if (pet.wet > 0.4) {
    return say(pet, "int.wet", [
      "它身上还有潮气，经过你的时候带起一点凉。你出声，它先抖了半下，水意就回到空气里",
      "毛还没干，贴着它的肋骨。它听见你，耳朵先起来，身子还不愿意离开那一点剩余的温度",
      "你一靠近就能闻到湿毛。它把一侧身子朝向你，另一侧还在滴",
      "水顺着它下巴的一根毛往下走。它等那滴落下，才分神听你",
    ]);
  }
  if (before.activity === "scratching") {
    return "它正扭着身子啃后腿，啃到一半被你撞见，腿还翘着，表情努力装成这是有计划的";
  }
  if (before.activity === "stretched_in_sun") {
    return `${sunLine(pet)}。它把身体摊在那块光里。你说话，光里的身体只抬起头，其余部分还想留在热里`;
  }
  if (before.place === "feet" && before.posture === "down") {
    return "它趴在你脚边，下巴搁着你的鞋。你一出声，下巴就抬起来，鞋面上留下一小块热";
  }
  if (before.place === "feet") {
    return say(pet, "int.feet", [
      `它本来就挨着你。话不必走太远，${b.ears}已经接住了`,
      "你脚边那点重量换了个姿势，下巴从鞋面挪到鞋边，给你的句子让出一只耳朵",
      pet.name && pet.nameKnown > 0.45
        ? `${pet.name}的呼吸打在你的脚踝上。你一开口，呼吸就改了节奏`
        : "它用鼻头抵着你的裤脚，像把你的声音当成从布料里长出来的",
      "地板上有一小块被它暖过的地方。你说话的时候，它从那块暖里抬起眼睛",
    ]);
  }
  if (before.place === "street" || before.place === "park") {
    const ground = before.place === "park" ? "梧桐的影子" : "楼下的砖";
    return say(pet, "int.out", [
      `风比你的声音大一点。它的鼻子忙着读地面，${b.ears}却分了一只给你`,
      `你们走在${ground}上。它忽然停住，不是因为你，是因为砖缝里有别的狗留下的一句旧话。然后它才听见你`,
    ]);
  }
  if (before.place === "window") {
    return "它蹲在窗边，玻璃上有一小块被鼻子碰过的雾。你出声的时候雾慢慢淡了，它的注意力还挂在窗外一件已经消失的东西上";
  }
  if (before.place === "hallway") {
    return "它在玄关，站在你的鞋中间。一只鞋被它碰倒了。你说话时它看着那只鞋，好像鞋会先回答";
  }
  if (before.activity === "watching_you") {
    return say(pet, "int.watch", [
      "它正看着你，像在等你变成一件事情。你果然变成了",
      "它坐着，目光放在你手上。开口的是你的嘴，它还是先看了手",
    ]);
  }
  return say(pet, "int.gen", [
    `${sunLine(pet)}。它在${placePhrase(before.place)}，${b.ears}先转向你，身体还留在原地`,
    "屋子里很静。它把一只前爪搭在另一只上面，你的声音把这个结构拆掉了",
    "它正在闻地毯的某一小块，闻得像那一块会回答。你开口，鼻子离开了，心思还留了一点在那块上",
  ]);
}

export function orient(pet, parsed, choice) {
  const b = breedOf(pet).body;
  if (choice.compliance === "too_asleep") return null;
  if (pet.burst >= 2) {
    return {
      text: "你一句还叠在上一句上面。它的四只脚短暂地选了四个方向，最后先选了坐着，坐着至少不会选错",
      patch: { posture: "sit", gaze: "you" },
    };
  }
  const quietKind = ["apology", "praise", "name", "sleep", "feed"].includes(parsed.kind);
  if (!quietKind && (choice.hijack === "hunger" || (pet.stomach < 0.26 && !["wait", "ignore"].includes(parsed.kind)))) {
    if (!(pet.lastHijack === "hunger" && nextRand(pet) < 0.55)) {
      const outside = !indoor(pet);
      return {
        text: say(pet, outside ? "orient.hunger.out" : "orient.hunger", outside
          ? [
            "风里它的肚子响了一下。它看你一眼，又去闻下一块砖，好像砖缝里会有午饭",
            "它走着走着把步子放慢，鼻子在地面上找吃过的东西留下的影子",
          ]
          : [
            "它听是听见了，可肚子比耳朵诚实。鼻子朝厨房偏了偏，又努力扳回来",
            "你的话进到一半，它咽了一下。厨房里什么也没有，它还是咽了",
            "眼睛在你脸上停留不稳，总要去空食盆那边核对一次",
            "它把这句要求先放在一边，用舌尖舔了舔嘴角，像嘴里应该有东西",
          ]),
        patch: { gaze: outside ? "floor" : "bowl" },
      };
    }
  }
  if (choice.hijack === "bladder" || (pet.bladder > 0.84 && indoor(pet) && !["walk", "home", "stroll", "wait"].includes(parsed.kind))) {
    return {
      text: "它的身体想做你要的事，眼睛却先去了门那边。门缝里有外面，也有它自己的急事",
      patch: { gaze: "door" },
    };
  }
  if (parsed.usedName && pet.name && pet.nameKnown < 0.45) {
    return {
      text: `「${pet.name}」这个声音又来了一次。它还没有完全认领，可耳朵已经比别的声音更愿意留下它`,
      patch: { gaze: "you" },
    };
  }
  if (parsed.usedName && pet.name) {
    return {
      text: `它的名字一落地，${b.ears}就到位了。身体慢半拍，也还是跟着来`,
      patch: { gaze: "you" },
    };
  }
  if (parsed.tone === "soft") {
    return {
      text: "你的声音放得很低。它把耳朵放平一点，不是害怕，是把这个音量当成只给它的",
      patch: { gaze: "you" },
    };
  }
  if (parsed.tone === "question" && pet.traits.learn > 0.62 && pet.energy > 0.35) {
    return {
      text: `句子是向上的。它把头侧了侧，${b.ears}跟着侧。这个角度它不常用`,
      patch: { gaze: "you" },
    };
  }
  if (pet.handSmell === "treat" && !pet.handNoted && ["trick", "call"].includes(parsed.kind)) {
    pet.handNoted = true;
    return {
      text: "它看的不是你的脸。它看你的手，手刚才带过吃的，这个情报还热着",
      patch: { gaze: "hands" },
    };
  }
  return null;
}

export function intrusion(pet) {
  const b = breedOf(pet).body;
  if (!indoor(pet)) {
    return say(pet, "intrude.out", [
      "一只鸽子在前面不远处办事。它把这件事当成必须到场的会议，绳子立刻紧了",
      "对面楼有人喊了一个和它无关的名字。它还是看了",
      "风把一张纸刮过路面。它追了两步，又回头确认你还在绳子这一头",
      "灯柱下有一条已经干了的、别的狗留下的消息。它读得很慢，慢到你不得不也站在那里",
    ]);
  }
  return say(pet, "intrude.in", [
    pet.traits.sensitivity > 0.7
      ? "楼上传来椅子拖过地板的声音。它整只矮下去，耳朵贴平，过了好几秒才把其中一只重新支起来"
      : "楼上传来椅子腿拖过地板的声音。它的耳朵追着那声音走到天花板，又走回来",
    "冰箱忽然自己响了一声。它看向厨房，看了很认真，像那是一句呼唤",
    "窗帘动了一下。它盯着窗帘，身体却没离开原来的地方，像怕一走开，你的话就失效",
    "你的口袋亮了一下。它看了看那点光，又看你，以为光也许和它有关",
    "水管里有谁跑过去。它听完了，喉咙里滚了一下，没有放出来",
    `窗外有鸟在叫。它想回嘴，又觉得在屋里回嘴不合适，只把${b.ears}转向窗子`,
    "有一股你看不见的味道从门缝进来。它的鼻子先离职了，身体还留在原地",
    "它忽然想起自己的后腿，扭过头去啃了一口，什么也没啃到。再抬头时，眼神清爽了一些",
  ]);
}

function hungryTail(choice) {
  if (choice.hijack !== "hunger") return "";
  return "做完它不看你的脸，看你的手，看那只手是不是还藏着别的。";
}

function actTrick(pet, parsed, choice) {
  const b = breedOf(pet).body;
  const asked = parsed.trick;
  const word = trickWord(asked);
  const slow = choice.delay === "slow" || choice.delay === "false_start"
    ? say(pet, "trick.slow", [
      "它没有马上做。身体还留在上一件事里，过了两拍才想起来你在等一个形状。",
      "这个字它要在嘴里过一遍，才肯交给腿。",
      "它先看你的脸，确认你是认真的，然后才开始搬动自己。",
    ])
    : "";

  if (choice.performed === "not_again") {
    return {
      text: `「${word}」它刚刚做过。${b.refuse}。再来一次，在它看来是你的习惯，不是它的。`,
      patch: { posture: "sit", gaze: "floor", activity: "watching_you" },
      notes: { arousal: -0.04 },
    };
  }

  if (choice.performed === "ask_door") {
    return {
      text: `它起步想去完成「${word}」，走到一半改了方向，改去门边。坐下，看着锁。这个姿势比你要的那个更紧急。`,
      patch: { place: "door", posture: "sit", gaze: "door", activity: "waiting_by_door" },
      notes: {},
    };
  }

  if (choice.compliance === "misread") {
    const known = choice.offered;
    if (known && known !== asked && TRICK_WORD[known]) {
      return {
        text: `${slow}你要的是${word}。它交给你的是${trickWord(known)}，而且交得很诚恳。诚恳不能自动变成另一个形状。它看着你的脸，准备你一摇头，就把这个换成别的。`,
        patch: patchForTrick(known),
        notes: { arousal: 0.04 },
      };
    }
    return {
      text: `${slow}${say(pet, "trick.misread", [
        `「${word}」这个形状它还没有。它把鼻子抵上你的指节，呼出热气，又退后，偶然地坐了一下。像先拿一个它会的姿势，来换你的反应`,
        `你要${word}。它提供的是靠近，把额头抵住你的手，抵得很认真，好像认真可以代替形状`,
        `「${word}」落下来的时候它歪了歪头，然后做了一个含混的半蹲。半蹲不是答案，它自己也知道，所以眼睛一直没有离开你`,
      ])}`,
      patch: { posture: "sit", gaze: "hands", activity: "watching_you", place: indoor(pet) ? "feet" : pet.place },
      notes: { arousal: 0.05 },
    };
  }

  let core = "";
  let patch = { gaze: choice.hijack === "hunger" ? "hands" : "you", activity: "watching_you" };
  if (asked === "sit") {
    core = choice.quality < 0.55
      ? `前脚先往前挪，给后半身腾地方。${b.sitMess}。这个姿势它自己也觉得还不是。`
      : `${b.sitClean}。坐下已经不用思考，可它还是留了一点余光，确认你看见了。`;
    patch = { ...patch, posture: "sit", place: indoor(pet) ? (pet.place === "street" || pet.place === "park" ? pet.place : "feet") : pet.place };
  } else if (asked === "down") {
    core = choice.quality < 0.5 || choice.hijack === "play"
      ? `它往下折，折到一半又弹起来，好像地板太近了。第二次才真正下去，${b.down}。下去以后前爪还在轻轻挪。`
      : `${b.down}。下巴最后才放下，放下以后它从眉毛底下看你。`;
    patch = { ...patch, posture: "down" };
  } else if (asked === "paw") {
    core = choice.quality < 0.55
      ? `${b.paw}。爪子落在你掌心边缘，又滑下去。它看着自己的爪子，好像爪子该更懂事一点。`
      : `${b.paw}。这一次留在你手里，留了整整一个呼吸，才因为自己的重量而收回。`;
    patch = { ...patch, posture: "sit", place: indoor(pet) ? "feet" : pet.place };
  } else if (asked === "spin") {
    core = `${b.spin}。停下来的时候它还要找一次你，找你的时候眼睛亮，像刚从自己的圈里回来。`;
    patch = { ...patch, posture: "stand", gaze: "you" };
  } else if (asked === "speak") {
    if (pet.traits.voicefulness < 0.35 || pet.traits.pride > 0.8) {
      core = `${b.hush}。它不是不会出声，是不愿意把声音交到屋子里当表演。`;
      patch = { ...patch, posture: "sit", gaze: "floor" };
    } else {
      core = `它叫了一声。${b.voice}。叫完自己愣了一下，看你这是不是要的那种。`;
      patch = { ...patch, posture: "stand", gaze: "you" };
    }
  } else if (asked === "stay") {
    core = choice.quality < 0.55 || pet.traits.velcro > 0.65
      ? "它站住。表面是静止的，里面有什么在轻轻敲。敲了几秒，一只前爪还是迈出来，它立刻把那只爪子收回去，表情像不是自己干的。"
      : "它停住，眼睛锁着你。这项静止很完整，完整到它的呼吸都放轻了，怕呼吸也算出走。";
    patch = { ...patch, posture: "stand", gaze: "you" };
  } else if (asked === "rollover") {
    if (pet.bond < 0.45 && pet.trustBelly < 0.3) {
      core = `它倒下，可肚子没有交出来。侧躺已经是它能给的全部。${b.refuse}。`;
      patch = { ...patch, posture: "down", gaze: "you" };
    } else {
      core = "它侧过去，脊背着地，四爪朝天。其中一条后腿忽然自己踢空气。它盯着那条腿，有点被自己出卖。";
      patch = { ...patch, posture: "belly_up", gaze: "you", place: indoor(pet) ? "feet" : pet.place };
    }
  } else {
    core = `${b.sitClean}。`;
    patch = { ...patch, posture: "sit" };
  }

  const bargain = hungryTail(choice);
  return {
    text: `${slow}${core}${bargain}`,
    patch,
    notes: { arousal: asked === "speak" || asked === "spin" ? 0.08 : 0.03, valence: 0.04, bond: 0.01 },
  };
}

function patchForTrick(trick) {
  if (trick === "down" || trick === "rollover") return { posture: "down", gaze: "you", activity: "watching_you" };
  if (trick === "spin" || trick === "speak") return { posture: "stand", gaze: "you", activity: "watching_you" };
  return { posture: "sit", gaze: "you", activity: "watching_you" };
}

function actTouch(pet, parsed, choice) {
  const b = breedOf(pet).body;
  if (choice.performed === "duck" || choice.compliance === "refuse") {
    return {
      text: `你的手还没落到它身上，它已经把肩膀沉下去，舌头飞快地舔了一下鼻头。手停在半空。它没有躲远，只是现在还不能被摸。${b.refuse}。`,
      patch: { posture: "down", gaze: "floor", activity: "watching_you" },
      notes: { stress: 0.08, bond: 0, valence: -0.04 },
    };
  }
  if (choice.performed === "sit_on_foot" || (parsed.target === "belly" && pet.bond < 0.4 && pet.trustBelly < 0.25)) {
    return {
      text: "你的手去找肚子。它不翻。它把屁股坐到你的脚上，用这个替换那个。坐得很重，算另一种交给。",
      patch: { place: "feet", posture: "sit", gaze: "you", activity: "pressed_against_you" },
      notes: { bond: 0.02, valence: 0.03 },
    };
  }
  if (pet.wet > 0.45) {
    return {
      text: "手按上去，毛还是潮的，潮意立刻回到你掌心。它闻了闻你的手，认出刚才那盆水，然后把背更结实地送进你手里。",
      patch: { place: "feet", posture: "sit", gaze: "you", activity: "pressed_against_you" },
      notes: { bond: 0.02, stress: -0.05, handSmell: "wetdog" },
    };
  }
  const target = parsed.target || "back";
  const lines = {
    head: pet.breed === "boat"
      ? "你的手盖上它的头顶。它先往下缩了缩，随即把重量交给这只手，眼睛慢慢眯起来。那两只过大的耳朵从你指缝里支出来，还在值班。"
      : "你的手盖上它的头顶。它先往下缩了缩，随即把重量交给这只手，眼睛慢慢眯起来。耳朵还醒着。",
    back: `手顺着背走。它把背拱高一点去够手心，拱完又把背放平，好像刚才那一下太诚实。${pet.traits.mouthy > 0.65 ? "拱到第二遍的时候，它轻轻含住你的袖口，含住就当摸完了。" : ""}`,
    belly: "它翻过来的过程有点犹豫，翻定了就把前爪收在胸口。你的手指碰到皮，后腿忽然自己踢起来。它看向那条腿，觉得这不是它同意的部分。",
    ears: "你揉它的耳根。它歪过头，把那只耳朵更彻底地放进你手里，另一只仍监视着房间。揉完它抖了抖头，像把耳朵戴回原处。",
    chin: "手指抵住下巴。它的头自然抬起来，喉咙露出来。它看着你，看你知不知道这是信任。",
    paws: "你碰它的爪子。趾尖缩了一下，又张开，肉垫是热的。它低头看你捏着它的脚，表情认真，像这是一件需要监督的事。",
    chest: `手掌贴上它的胸口，心跳比你以为的快。它没有退，${b.lean}。`,
  };
  const patch = {
    place: indoor(pet) ? "feet" : pet.place,
    posture: target === "belly" ? "belly_up" : "sit",
    gaze: "you",
    activity: "pressed_against_you",
  };
  const notes = {
    bond: target === "belly" ? 0.035 : 0.025,
    stress: -0.06,
    valence: 0.07,
    trustBelly: target === "belly" ? 0.08 : 0,
    arousal: target === "belly" ? -0.04 : 0.02,
  };
  return { text: lines[target] || lines.back, patch, notes };
}

function actCall(pet, choice) {
  const b = breedOf(pet).body;
  if (choice.performed === "halfway") {
    return {
      text: `它听见了。它朝你走来，走到屋子正中就坐下。剩下的距离它留给你，这是它一贯的算术。${b.sitClean}。`,
      patch: { place: "rug", posture: "sit", gaze: "floor", activity: "watching_you" },
      notes: { bond: 0.01, valence: 0.02 },
    };
  }
  if (choice.performed === "extract_then_come" || pet.place === "sofa_under") {
    return {
      text: `沙发底下先露出鼻子，再露出一点灰，然后是整只。它抖了抖，才小跑到你面前。小跑的最后两步变成往你腿上的一靠。${b.lean}。`,
      patch: { place: "feet", posture: "sit", gaze: "you", activity: "pressed_against_you" },
      notes: { bond: 0.02 },
    };
  }
  if (choice.performed === "come_slow" || pet.energy < 0.24) {
    return {
      text: "它来了。来的速度像地板有黏性。到了以后直接躺下，把到达当成结束，下巴搁上你的脚背。",
      patch: { place: indoor(pet) ? "feet" : pet.place, posture: "down", gaze: "you", activity: "pressed_against_you" },
      notes: { bond: 0.02, energy: -0.03 },
    };
  }
  if (pet.place === "feet") {
    return {
      text: "它本来就在你脚边。听见过来，它把身体又往你的鞋上送了送，认为自己已经完成，而且完成得很好。",
      patch: { place: "feet", posture: "sit", gaze: "you", activity: "pressed_against_you" },
      notes: { valence: 0.04, bond: 0.01 },
    };
  }
  if (!indoor(pet)) {
    return {
      text: `绳子松着的时候它在前面。你一叫，它折回来，折回来的路上还是抽空闻了一处。${b.greet}。`,
      patch: { place: pet.place, posture: "stand", gaze: "you", activity: "watching_you" },
      notes: { bond: 0.015 },
    };
  }
  return {
    text: `它过来的路线不是直线。中间去闻了一下茶几腿，然后才把脸抬起来。${b.greet}。最后一步停在你的膝盖前面。`,
    patch: { place: "feet", posture: "stand", gaze: "you", activity: "watching_you" },
    notes: { bond: 0.02, valence: 0.04 },
  };
}

function actFeed(pet, parsed) {
  const meal = parsed.object === "meal";
  const dropBall = pet.holding
    ? `它嘴里本来有东西，先吐在地毯上，吐的时候看了那东西一眼，像暂时请假。`
    : "";
  if (!meal && pet.stomach > 0.82) {
    return {
      text: `${dropBall}它接过零食，并不嚼。它走到沙发边，把零食塞进垫子缝，用鼻子把缝压平。这是储备，不是拒绝。`,
      patch: { place: "sofa", posture: "stand", gaze: "you", holding: null, activity: "watching_you" },
      notes: { stomach: 0.04, trustHands: 0.05, handSmell: "treat", valence: 0.04, bond: 0.015 },
    };
  }
  if (meal && pet.stomach > 0.75) {
    return {
      text: `${dropBall}它闻了闻盆，吃了几口，留下一些。它不是不领情，是肚子还占着。剩下的被它用鼻子堆到盆边，像收拾过了。`,
      patch: { place: "bowl", posture: "stand", gaze: "bowl", holding: null, activity: "watching_bowl" },
      notes: { stomach: 0.15, bowlFood: 0.2, handSmell: "treat", bond: 0.015 },
    };
  }
  if (meal) {
    return {
      text: `${dropBall}食盆一响，耳朵比腿先到。它吃得很快，快到有两颗滚到盆外，于是把地板也舔了。吃完还盯着盆，怀疑盆会再长出一层。`,
      patch: { place: "bowl", posture: "stand", gaze: "bowl", holding: null, activity: "watching_bowl" },
      notes: { stomach: 0.55, bowlFood: 0, thirst: -0.08, handSmell: "treat", valence: 0.1, bond: 0.02 },
    };
  }
  const eager = pet.stomach < 0.4;
  return {
    text: eager
      ? `${dropBall}零食还在你指间的时候，它已经坐住了。这个坐是它自己发明的，用来缩短等待。它接得很轻，轻完又用舌头在你指腹上确认没有第二块。`
      : `${dropBall}它先闻，再看你的眼睛，像履行一道手续，然后才从你指间把零食衔走。嚼得很慢，慢是礼貌，不是无所谓。`,
    patch: { place: "feet", posture: "sit", gaze: "hands", holding: null, activity: "watching_you" },
    notes: { stomach: eager ? 0.18 : 0.12, trustHands: 0.08, handSmell: "treat", arousal: 0.06, valence: 0.08, bond: 0.02 },
  };
}

function actWater(pet) {
  if (pet.thirst > 0.55) {
    return {
      text: "你把水放低。它喝的时候牙齿偶尔碰到盆沿，一圈圈喝得很响。喝完下巴还滴着，滴到前爪上，它又把前爪舔干。",
      patch: { place: "bowl", posture: "stand", gaze: "bowl", activity: "drinking" },
      notes: { thirst: 0.45, bladder: 0.08, bowlWater: 0.45 },
    };
  }
  return {
    text: "它喝了两口，够了。其余的水它留给自己等一会儿再相信。盆沿上留下一个湿鼻子印。",
    patch: { place: "bowl", posture: "stand", gaze: "you", activity: "watching_you" },
    notes: { thirst: 0.12, bladder: 0.03, bowlWater: Math.max(0.2, pet.bowlWater) },
  };
}

function actSpeak(pet, parsed, hearing, choice) {
  const b = breedOf(pet).body;
  const raw = parsed.compact || "";
  if (choice.performed === "seek_food" || hearing.mentionsFood) {
    return {
      text: "有一个字它听得很清楚，清楚到身体直接朝厨房转了半圈。食盆如果是空的，它会回头看你，觉得你不该随便用那个字。它的鼻子在盆沿上核对了一遍。",
      patch: { place: indoor(pet) ? "bowl" : pet.place, posture: "stand", gaze: "bowl", activity: "watching_bowl" },
      notes: { arousal: 0.05 },
    };
  }
  if (choice.performed === "seek_door" || (hearing.mentionsOut && indoor(pet))) {
    if (pet.walks >= 2) {
      return {
        text: "这类声音它收藏过。它去玄关，绳子在它嘴里，含着绳子回来看你，看你是不是说话算话。绳头把地板拖出一条湿痕。",
        patch: { place: "hallway", posture: "stand", gaze: "you", holding: "leash", activity: "waiting_by_door", objects: { leash: "mouth" } },
        notes: { arousal: 0.12 },
      };
    }
    return {
      text: "它听懂的不是整句，是你看向门的那个方向。它也看了一眼门，然后看你，等这个眼色变成真的。",
      patch: { place: "door", posture: "sit", gaze: "door", activity: "waiting_by_door" },
      notes: { arousal: 0.06 },
    };
  }
  if (choice.performed === "suspicious" || (hearing.mentionsBath && pet.bathes > 0)) {
    return {
      text: "这个词它记住了。记住的方式是后退半步，先去检查你手里有没有盆。检查完它还是过来，过来的路线是弯的。",
      patch: { posture: "stand", gaze: "hands", activity: "watching_you" },
      notes: { stress: 0.06, arousal: 0.05 },
    };
  }
  if (parsed.incomplete || raw === "我" || raw === "你") {
    return {
      text: "你只说出一个字，就停了。它把那一个字含在耳朵里等后半截。后半截没有来。于是它用鼻子碰了碰你的手，像替你把句子收住。",
      patch: { place: indoor(pet) ? "feet" : pet.place, posture: "sit", gaze: "you", activity: "pressed_against_you" },
      notes: { bond: 0.01 },
    };
  }
  if (/爱|喜欢/.test(raw) && raw.length < 18) {
    return {
      text: "你说喜欢。喜欢没有气味，它闻不出来。它把下巴放上你的脚背，用重量问你是不是这个意思。",
      patch: { place: indoor(pet) ? "feet" : pet.place, posture: "down", gaze: "you", activity: "pressed_against_you" },
      notes: { bond: 0.03, valence: 0.06, stress: -0.04 },
    };
  }
  if (/雨/.test(raw)) {
    return {
      text: "你说到雨。它看了看自己的爪子，又看了看门。两件事都暂时不干。耳朵还留在你的句子里。",
      patch: { gaze: "door", posture: "sit", activity: "watching_you" },
      notes: {},
    };
  }
  if (/风/.test(raw)) {
    return {
      text: `你提到风。它看向窗，窗没有动，可它还是看了一会儿，像风会从句子里走进来。${b.ears}没有完全回来。`,
      patch: { place: indoor(pet) ? "window" : pet.place, gaze: "window", posture: "sit", activity: "watching_window" },
      notes: {},
    };
  }
  if (hearing.mentionsVet) {
    return {
      text: "有个词让它的耳朵向后折了一下。它走过来，却站在你手刚好够不到的地方，用这个距离听完剩下的话。",
      patch: { posture: "stand", gaze: "you", activity: "watching_you" },
      notes: { stress: 0.08 },
    };
  }
  if ((parsed.raw || "").length > 36) {
    return {
      text: `你说了很长。它在第三句前后坐下，不是因为听懂了，是因为你的声音变成一种天气，它可以待在里面。${b.ears}为其中几个字动过，动完它把下巴搁上你的脚背。`,
      patch: { place: indoor(pet) ? "feet" : pet.place, posture: "sit", gaze: "you", activity: "pressed_against_you" },
      notes: { bond: 0.02, stress: -0.04, arousal: -0.05 },
    };
  }
  return {
    text: say(pet, "speak.plain", [
      "它听着。听的时候嘴巴微微张着，不是要叫，是把你的声音留在舌头上试温度。听完它用鼻子碰了碰你的手，算收到了。",
      `它侧过${b.ears}，把你的话装进去。装完没有行动，只是更靠近了一点，靠近是它的答复。`,
      "你说完了。它没有做任何技巧，只把一只前爪搭上你的脚，搭上去又觉得也许过分，于是爪尖还留着，重量收回去。",
    ]),
    patch: { gaze: "you", activity: "watching_you", posture: pet.posture === "curl" ? "sit" : pet.posture },
    notes: { bond: 0.012, valence: 0.03 },
  };
}

function actLook(pet, before) {
  const b = breedOf(pet).body;
  const where = placePhrase(before.place);
  let notice;
  if (pet.breed === "square") {
    notice = "你一直看它。它把目光挪到别处，尾巴却卷得更紧了一点。这是它允许被看的方式。";
  } else if (pet.breed === "boat") {
    notice = "你一直看它。它一发现这件事，后半身就先开始有意见，短腿还没想好，屁股已经在地毯上磨出声音。";
  } else if (pet.breed === "shadow") {
    notice = "你的注视对它来说有重量。它承受了一会儿，然后走过来，把那重量换成身体的接触，细细地靠住你的小腿。";
  } else {
    notice = "你看着它的时候，它也看着你，看很久也不躲。看完它忽然坐直，像问：是这个吗？是现在吗？";
  }
  const detail = say(pet, "look.detail", [
    "它左前爪的指甲比右前爪长一点，走路时会留下更清楚的一声",
    "鼻头是湿的，湿了一小块地板，它并不在意",
    "它的胡须有一根弯着，弯向你的方向",
    `${b.sleep.split("，")[0]}这种事，它醒着的时候也有一点`,
    "地毯上有一根线头，它用鼻子把线头推远，又推回来",
  ]);
  const patch = pet.breed === "shadow"
    ? { place: indoor(pet) ? "feet" : pet.place, posture: "sit", gaze: "you", activity: "pressed_against_you" }
    : { gaze: "you", activity: before.activity === "dozing" ? "watching_you" : before.activity, posture: before.posture === "curl" ? "down" : before.posture };
  return {
    text: `它在${where}。${detail}。${notice}`,
    patch,
    notes: { bond: 0.008 },
  };
}

function driveBeat(pet, drive) {
  const b = breedOf(pet).body;
  switch (drive.id) {
    case "hunger":
      return pet.bowlFood > 0.05
        ? {
          text: "它走到食盆边，把剩下的吃完，吃得很响，响完把盆舔了一圈",
          patch: { place: "bowl", posture: "stand", activity: "watching_bowl", gaze: "bowl" },
          notes: { stomach: 0.18, bowlFood: 0 },
        }
        : {
          text: "它走到食盆边。盆是空的，它还是舔出了声音，又看看你的手",
          patch: { place: "bowl", posture: "stand", activity: "watching_bowl", gaze: "hands" },
          notes: {},
        };
    case "thirst":
      return pet.bowlWater > 0.08
        ? {
          text: "它去喝水，喝得认真，下巴滴下来的那一点也被它事后处理干净",
          patch: { place: "bowl", posture: "stand", activity: "drinking", gaze: "bowl" },
          notes: { thirst: 0.22, bladder: 0.05, bowlWater: Math.max(0, pet.bowlWater - 0.25) },
        }
        : {
          text: "水也见了底。它把空碗推得碰了一下柜门，然后回头找你",
          patch: { place: "bowl", posture: "stand", activity: "watching_bowl", gaze: "you" },
          notes: {},
        };
    case "bladder":
      return {
        text: `它走到门边坐下，看着锁。${b.hush}。这是它会用的最清楚的一句`,
        patch: { place: "door", posture: "sit", activity: "waiting_by_door", gaze: "door" },
        notes: {},
      };
    case "itch":
      return {
        text: "它坐下，扭过头去啃后腿，啃出一串细小的声音。啃完它看着那条腿，好像腿让它失望了",
        patch: { activity: "scratching", posture: "sit", gaze: "nowhere" },
        notes: { itch: -0.22 },
      };
    case "sleep":
      return {
        text: `它在原地转了半圈，没找到理想的形状，还是倒下了。${b.sleep}`,
        patch: {
          place: indoor(pet) ? (pet.traits.velcro > 0.7 ? "feet" : "rug") : pet.place,
          activity: "dozing",
          posture: "curl",
          gaze: "nowhere",
        },
        notes: { energy: 0.06, arousal: -0.08 },
      };
    case "cold":
      return {
        text: "潮气还在毛里。它往你的小腿上靠，靠得很紧，想借一块干燥的温度",
        patch: { place: "feet", posture: "down", activity: "pressed_against_you", gaze: "you" },
        notes: { stress: -0.04 },
      };
    case "play":
      if (pet.objects.ball === "sofa_under") {
        return {
          text: "它自己去找球。球在沙发底下，它只进去一半，扒拉两下，把球扒得更深，然后退出来看着那条缝",
          patch: { place: "sofa", posture: "sit", gaze: "floor", activity: "playing_alone" },
          notes: { arousal: 0.04 },
        };
      }
      return {
        text: "它用鼻子把球推了一小段。球停住，它也停住，像忽然忘了推完以后该发生什么",
        patch: { place: "rug", activity: "playing_alone", posture: "stand", gaze: "floor", objects: { ball: "rug" } },
        notes: { arousal: 0.05 },
      };
    default:
      return {
        text: `它走到你脚边。${b.lean}。没有人叫它`,
        patch: { place: indoor(pet) ? "feet" : pet.place, posture: "down", activity: "pressed_against_you", gaze: "you" },
        notes: { bond: 0.01 },
      };
  }
}

function idleEnd(pet) {
  const b = breedOf(pet).body;
  if (!indoor(pet)) {
    return {
      text: "它在你脚边坐下，城市的味道还贴在它鼻子上。它打了个很小的喷嚏，把其中一种味道还回去",
      patch: { posture: "sit", gaze: "you", activity: "watching_you" },
    };
  }
  if (pet.traits.pride > 0.72 && pet.traits.velcro < 0.45) {
    return {
      text: "它在离你两步的地方坐下，看窗，或者看窗上自己的影子。有一只耳朵是给你的。它不会承认",
      patch: { place: "window", posture: "sit", gaze: "window", activity: "watching_window" },
    };
  }
  if (pet.traits.velcro > 0.6) {
    return {
      text: `忙完自己的事，它还是回到你脚边。${b.lean}。耳朵可以朝你，眼睛就不必了`,
      patch: { place: "feet", posture: "down", activity: "pressed_against_you", gaze: "you" },
    };
  }
  return {
    text: "它在地毯上坐下，打了个很小的哈欠。哈欠结束时看了你一眼，确认你还在，就够了",
    patch: { place: "rug", posture: "sit", activity: "watching_you", gaze: "you" },
  };
}

function actWait(pet, before, parsed) {
  const hour = hourOf(pet);
  if (parsed.kind === "ignore") {
    const end = pet.traits.velcro > 0.65
      ? {
        text: "你的不理会被它理解成一个谜。它把谜带到你脚边，用鼻子顶你的小腿，顶一下，停一下，给你改正的机会。",
        patch: { place: indoor(pet) ? "feet" : pet.place, posture: "sit", gaze: "you", activity: "pressed_against_you" },
        notes: { bond: 0.01, arousal: 0.04 },
      }
      : {
        text: "你去忙你的。它看起来接受了，走到窗边坐下，把窗外当成第二件工作。过了一会儿，它的下巴点一下，又抬起来，像检查你是否还在这间屋里。",
        patch: { place: indoor(pet) ? "window" : pet.place, posture: "sit", gaze: "window", activity: "watching_window" },
        notes: {},
      };
    return {
      text: `你把脸转向自己的事。屋子里的空气立刻变成你不在看它的那种。${end.text}`,
      patch: end.patch,
      notes: end.notes || {},
    };
  }
  if (indoor(pet) && hour >= 13 && hour <= 16 && pet.stomach > 0.4 && pet.energy > 0.35 && pet.bladder < 0.72 && nextRand(pet) < 0.42) {
    return {
      text: `${sunLine(pet)}。你什么都不做，它就自己走进那块光里，把身体摊开，摊到光的边缘不够用。灰尘在光里慢慢转。它的眼睛睁着一条缝，缝里没有要求。`,
      patch: { place: "rug", posture: "down", activity: "stretched_in_sun", gaze: "nowhere" },
      notes: { arousal: -0.08, valence: 0.05, energy: 0.04 },
    };
  }
  const drives = pet._drives || [];
  const primary = drives[0] ? driveBeat(pet, drives[0]) : driveBeat(pet, { id: "bond" });
  const secondary = drives[1] && drives[1].pressure > 0.55 ? driveBeat(pet, drives[1]) : null;
  const end = idleEnd(pet);
  const start = before.activity === "dozing"
    ? "你没有新的要求。它本来就在睡，睡梦里的爪子又踩了一下，然后真的安静了"
    : "你没有发出新的要求。它等了一小会儿，等指令掉下来。指令没有掉";
  return {
    text: para([start, primary.text, secondary && secondary.text !== primary.text ? secondary.text : "", end.text]),
    patch: end.patch,
    notes: { ...(primary.notes || {}), ...(secondary?.notes || {}) },
  };
}

const OUTDOOR_EVENTS = [
  "第三棵树的根上有一条别的狗留下的、已经干了的句子。它读了很久，读到你不得不也站在树下",
  "草丛边有半块被人掉过的饼干的气味。饼干不在了，它还是把那块地面审核了两遍",
  "楼道口的台阶上坐过一只猫。它的毛竖起一条线，又自己把那条线放平，决定今天不追究",
  "一只塑料袋贴着墙根。它不愿意走袋子的下风处，绕了半步，绕完还回头看那只袋子",
  "有人在花坛沿上坐过，留下一手心的盐味。它把那一小段路走得特别慢",
];

function actWalk(pet, parsed) {
  const park = parsed.object === "park" || parsed.kind === "stroll" && pet.place === "park";
  const dest = park || parsed.object === "park" ? "park" : (pet.place === "park" ? "park" : "street");
  const destWord = dest === "park" ? "小区的梧桐下面" : "楼下";
  if (!indoor(pet) && (parsed.kind === "walk" || parsed.kind === "stroll")) {
    const ev = say(pet, "out.event", OUTDOOR_EVENTS);
    return {
      text: `你们已经在外面。它把你的下一句理解成可以继续。${ev}。走的时候绳子${pet.traits.velcro > 0.6 ? "是松的，它不时回头，像点名" : "会忽然紧一下，紧的是它的兴趣，不是你的速度"}。`,
      patch: { place: pet.place, posture: "stand", gaze: "floor", activity: "walking", holding: null },
      notes: { energy: -0.06, arousal: 0.04 },
    };
  }
  if (!indoor(pet)) {
    return actWalk(pet, { ...parsed, kind: "stroll" });
  }
  const event = say(pet, "out.event", OUTDOOR_EVENTS);
  const pee = pet.bladder > 0.42
    ? "在第一根灯柱下它停住，办了一件出门必须办的事，办完用后腿象征性地刨了两下空气。"
    : "它今天没有在灯柱下停留太久，只留下一个鼻子印。";
  const square = pet.breed === "square"
    ? "它听见出门，先假装没听见，可你一碰到绳子，它已经站在门边，尾巴卷得整整齐齐，好像这是它的日程，不是你的。"
    : pet.breed === "shadow"
      ? "门一开，风先进来。它缩了一下，还是出去了，出去以后就贴着你的小腿走，细腿踩得很轻。"
      : "门开的瞬间它的身体已经在门外了，你只是跟着那个决定。";
  return {
    text: `${square}牵引绳在玄关，它叼起来递给你，递完自己先下楼。到了${destWord}，${pee}${event}。`,
    patch: { place: dest, posture: "stand", gaze: "floor", activity: "walking", holding: null, objects: { leash: "clipped" } },
    notes: {
      energy: -0.12,
      stomach: -0.05,
      arousal: 0.1,
      walks: 1,
      handSmell: "outside",
      peed: pet.bladder > 0.42,
      muddy: dest === "park" ? Math.min(1, pet.muddy + 0.25) : pet.muddy,
      valence: 0.06,
    },
  };
}

function actHome(pet) {
  if (indoor(pet)) {
    return {
      text: "门在你身后，本来就是关着的。它看看你，又看看门，以为自己漏听了一句。看完它把鼻子抵上门缝，替你把外面的味道确认了一遍，然后回到你脚边。",
      patch: { place: "feet", posture: "sit", gaze: "you", activity: "watching_you" },
      notes: {},
    };
  }
  const linger = pet.energy > 0.45 && pet.traits.pride < 0.8
    ? "快到楼门口时它又拐去闻了最后一处，闻完才肯把肩膀转向家的方向。"
    : "它往回走的时候没有抗议，可每一步都比来的时候短一点。";
  return {
    text: `你说回家。${linger}楼梯间的灯一亮，它的爪子声就变熟了。进门它先喝了两口，水从下巴滴到玄关的地砖上，然后才把身体靠过来，外面的灰尘还在它背上。`,
    patch: { place: "hallway", posture: "stand", gaze: "you", activity: "watching_you", holding: null, objects: { leash: "hallway" } },
    notes: { thirst: 0.18, arousal: -0.08, energy: -0.05, peedThisWalkClear: true },
  };
}

function actBath(pet) {
  if (!indoor(pet)) {
    return {
      text: "外面没有澡盆。它把你的话理解成水洼，走过去，踩了一脚，又抬起来看那只湿掉的爪子，像这只爪子背叛了它。",
      patch: { muddy: Math.min(1, pet.muddy + 0.2), wet: Math.min(1, pet.wet + 0.15), gaze: "you", posture: "stand" },
      notes: { valence: -0.02 },
    };
  }
  const b = breedOf(pet).body;
  const resist = pet.traits.pride > 0.7
    ? "它一听见水，就变成一块不愿意被搬动的石头。石头最后还是进了盆，进盆的方式是你赢了，它没有帮忙。"
    : pet.traits.sensitivity > 0.7
      ? "水声一起它就发抖，抖得很细。它没有逃，只是把下巴搁在盆沿上，眼睛看着你，看你还要不要继续。"
      : "它知道这两个字。知道的证据是它先看门，再看你，然后自己走进去，走进去的背影像去办一件忍辱的公事。";
  const after = pet.energy > 0.4 && pet.breed !== "shadow"
    ? `冲完它一跳出来就${b.shake}。水甩到你的小腿上。紧接着它在地毯上无目的地跑了两圈，跑完扑倒，舌头掉出来，眼睛却亮得不像刚受过苦。`
    : `它${b.shake}。抖完不去跑，而是钻到你腿边，想用你的裤子把剩下的水收走。`;
  return {
    text: `${resist}水是温的，它还是做出一种被淋到的表情。${after}`,
    patch: { place: "rug", posture: "stand", gaze: "you", activity: "watching_you", wet: 0.88, muddy: 0, holding: null },
    notes: { cleanliness: 0.4, itch: -0.3, bathes: 1, stress: 0.05, arousal: pet.breed === "shadow" ? -0.05 : 0.15, energy: -0.08, handSmell: "soap", valence: 0.02 },
  };
}

function actBrush(pet) {
  const find = pet.muddy > 0.2 || pet.itch > 0.45
    ? "梳子在肩胛那里停住，勾出一小团打结的毛。它回头看那团毛，好像不认识。"
    : "梳子下去的时候它的皮跟着动。";
  const bite = pet.traits.mouthy > 0.6
    ? "梳到第二下，它侧过头，轻轻咬住梳子，咬住就不让你继续，也不让你拿走。"
    : "它把身体靠向梳子的方向，哪边有齿，哪边就更重。";
  return {
    text: `${find}${bite}梳完它抖了抖，不是因为湿，是因为皮还记得那些齿。`,
    patch: { posture: "sit", gaze: "you", activity: "pressed_against_you", place: indoor(pet) ? "feet" : pet.place },
    notes: { itch: -0.45, bond: 0.02, valence: 0.05, cleanliness: 0.08 },
  };
}

function actPlay(pet, parsed) {
  const obj = parsed.object === "rope" ? "rope" : "ball";
  const name = obj === "rope" ? "绳子玩具" : "球";
  const where = pet.objects[obj];
  if (!indoor(pet)) {
    return {
      text: `外面没有把${name}带出来。它听懂你要玩，就在人行道上做出一个室内的起跑姿势，跑了三步，发现没有东西可追，于是回头看你，要求你解释这个空。`,
      patch: { posture: "stand", gaze: "you", activity: "watching_you" },
      notes: { arousal: 0.06 },
    };
  }
  if (pet.holding === obj) {
    if (pet.traits.pride > 0.68 && nextRand(pet) < 0.55) {
      return {
        text: `你去拿${name}。它把嘴闭上。${name}还在里面。它侧过身，用身体把这件事挡住，眼睛却亮着，希望你继续想要。`,
        patch: { holding: obj, gaze: "you", posture: "stand", activity: "playing_alone", place: "rug" },
        notes: { arousal: 0.1 },
      };
    }
    return {
      text: `它把${name}放进你手里，牙齿还恋了一恋。你扔出去，${name}滚到门边。它追，爪子在地板上打滑，叼回来，交到你掌心之前又改了主意，只把${name}抵在你的手腕上。`,
      patch: { holding: obj, place: "feet", gaze: "you", objects: { [obj]: "mouth" }, posture: "stand", activity: "playing_alone" },
      notes: { arousal: 0.14, energy: -0.05, valence: 0.06 },
    };
  }
  if (where === "sofa_under") {
    const chosen = pickOne(pet, "play.under", [
      {
        text: `${name}在沙发底下，比它以为的更深。它钻进去，只剩后半截在外面，倒退，再倒退，鼻梁上沾了灰，终于把${name}扒出来。你一扔，${name}听懂了家具的阴谋，又滚回那条缝里。它坐下，对着缝，像在谈判。`,
        patch: { place: "sofa", posture: "sit", gaze: "floor", holding: null, objects: { [obj]: "sofa_under" }, activity: "watching_you" },
        notes: { arousal: 0.1, energy: -0.04 },
      },
      {
        text: `缝还是那条缝。它看了你一眼，像在问你是不是故意的，然后只伸进去一只前爪。爪尖勾到灰，没勾到${name}。它把爪子抽出来舔了舔，舔完坐下，把这场谈判推迟。`,
        when: () => (pet.playTries || 0) > 0,
        patch: { place: "sofa", posture: "sit", gaze: "you", holding: null, activity: "watching_you" },
        notes: { arousal: 0.04 },
      },
      {
        text: `它没有再钻进去。它趴在沙发边，对着缝吹了口气，${name}纹丝不动。于是它回头把绳子玩具叼来，放在你脚上，当作${name}今天不在时的替身。`,
        when: () => (pet.playTries || 0) > 0,
        patch: { holding: "rope", objects: { rope: "mouth" }, place: "feet", posture: "stand", gaze: "you", activity: "playing_alone" },
        notes: { arousal: 0.06, valence: 0.03 },
      },
    ]);
    return { text: chosen.text, patch: chosen.patch, notes: chosen.notes || {} };
  }
  if (pet.energy < 0.26) {
    return {
      text: `它看见${name}在${placePhrase(where)}，走过去闻了闻，没有叼。追逐今天在它身体里暂时没有座位。它回头看你，像把${name}的工作交还。`,
      patch: { place: where === "mouth" ? "rug" : (where || "rug"), gaze: "you", activity: "watching_you", posture: "stand" },
      notes: {},
    };
  }
  if (pet.traits.pride > 0.7 && nextRand(pet) < 0.45) {
    return {
      text: `它把${name}从${placePhrase(where)}叼起来，叼到地毯中央，放下，用鼻子推得离你更远，然后自己趴上去。玩可以，规则得由它写。`,
      patch: { holding: null, place: "rug", objects: { [obj]: "rug" }, posture: "down", activity: "playing_alone", gaze: "you" },
      notes: { arousal: 0.08, valence: 0.04 },
    };
  }
  const land = nextRand(pet) < 0.34 ? "sofa_under" : "hallway";
  const landText = land === "sofa_under" ? "沙发底下" : "玄关";
  return {
    text: `它去${placePhrase(where)}把${name}叼来，一路有点小跑。你扔向${landText}。它追出去，在那里截住，叼着回来，停在你的手刚好够不着的地方。嘴里的意见是先不给，眼睛的意见是请你再扔一次。`,
    patch: { holding: obj, place: "feet", objects: { [obj]: "mouth" }, posture: "stand", gaze: "you", activity: "playing_alone" },
    notes: { arousal: 0.16, energy: -0.05, valence: 0.07 },
  };
}

function actHold(pet) {
  const b = breedOf(pet).body;
  if (pet.traits.pride > 0.75 && pet.bond < 0.62) {
    return {
      text: `你弯腰去抱。它的身体立刻变重，从你胳膊里滑回地板，滑完坐下，把尾巴卷好。${b.refuse}。它可以靠着你，但不打算被搬走。`,
      patch: { place: indoor(pet) ? "feet" : pet.place, posture: "sit", gaze: "floor", activity: "watching_you" },
      notes: { stress: 0.05, bond: 0 },
    };
  }
  if (pet.traits.sensitivity > 0.75 && pet.bond < 0.45) {
    return {
      text: "你把它抱起来。它在你手里变成一根绷着的细骨头，心跳贴着你的手腕。放到地上以后它没有逃，只是靠着你的鞋站了一会儿，把刚才的高度慢慢忘掉。",
      patch: { place: "feet", posture: "stand", gaze: "you", activity: "pressed_against_you" },
      notes: { stress: 0.06, bond: 0.02 },
    };
  }
  return {
    text: `你把它抱起来。重量比看上去诚实，热也是。${b.lean}。它的鼻子碰到你的下巴，碰一下，像盖章。放下的时候它还抓着你的衣服，爪子松开得很慢。`,
    patch: { place: "feet", posture: "stand", gaze: "you", activity: "pressed_against_you" },
    notes: { bond: 0.04, valence: 0.07, stress: -0.05 },
  };
}

function actDrop(pet, parsed) {
  if (pet.holding) {
    const thing = { ball: "球", rope: "绳子玩具", sock: "袜子", leash: "牵引绳" }[pet.holding] || "嘴里的东西";
    const key = pet.holding;
    return {
      text: `你伸手。它看着你的手看了一秒，那一秒里它在重新立法。然后它把${thing}放进你掌心，牙齿离开时还轻轻刮过，像签名。`,
      patch: { holding: null, objects: { [key]: "feet" }, place: "feet", gaze: "hands", posture: "sit", activity: "watching_you" },
      notes: { valence: 0.04, bond: 0.015 },
    };
  }
  if (/球/.test(parsed.compact || "") && pet.objects.ball) {
    return {
      text: `球不在它嘴里。它顺着你的眼神去找，找到${placePhrase(pet.objects.ball)}，叼起来，叼到你面前，可还是放在离手一寸的地方。一寸是它的幽默。`,
      patch: { holding: "ball", objects: { ball: "mouth" }, place: "feet", gaze: "you", posture: "stand", activity: "playing_alone" },
      notes: { arousal: 0.06 },
    };
  }
  return {
    text: "它嘴里是空的。它把空张给你看，舌头在，牙齿在，没有你要收回的东西。然后它坐下，等候更明确的名词。",
    patch: { posture: "sit", gaze: "you", activity: "watching_you" },
    notes: {},
  };
}

function actTease(pet) {
  if (pet.stomach < 0.45) {
    return {
      text: "你把东西举高。它坐得很直，直得发疼，眼睛跟着你的手走。走了几个来回，它忽然把脸转到一边，看墙。墙没有零食。可看着墙，至少不是在求。",
      patch: { posture: "sit", gaze: "floor", activity: "watching_you", place: "feet" },
      notes: { stress: 0.05, arousal: 0.08, valence: -0.04 },
    };
  }
  return {
    text: "你在逗它。它看穿了，看穿的方式是打了一个很小的哈欠，然后把下巴放回前爪上。游戏如果没有食物，它可以选择不参加。",
    patch: { posture: "down", gaze: "you", activity: "watching_you" },
    notes: { arousal: -0.02 },
  };
}

function actApology(pet) {
  const b = breedOf(pet).body;
  if (pet.stress > 0.35) {
    return {
      text: `你的声音软下来。它没有直线走过来，而是绕了一个很浅的弧，弧线结束在你的小腿边。${b.lean}。它舔了一下你的手背，舔完把额头抵住你，抵得很短，像把刚才那个硬声音还回去。`,
      patch: { place: indoor(pet) ? "feet" : pet.place, posture: "sit", gaze: "you", activity: "pressed_against_you" },
      notes: { stress: -0.16, valence: 0.08, bond: 0.03 },
    };
  }
  return {
    text: "你在道歉。它并没有觉得自己受伤，可它听得懂这种声音的软。它把鼻子拱进你的手心，拱出一点热，算把道歉收下，也算告诉你其实不必。",
    patch: { place: indoor(pet) ? "feet" : pet.place, posture: "sit", gaze: "you", activity: "pressed_against_you" },
    notes: { bond: 0.02, valence: 0.05, stress: -0.06 },
  };
}

function actPraise(pet) {
  const b = breedOf(pet).body;
  if (pet.breed === "square") {
    return {
      text: `你夸它。它把脸转到一边，好像这句话的收件人在它身后。卷紧的尾巴暴露了它。${b.sitClean}。`,
      patch: { posture: "sit", gaze: "floor", activity: "watching_you" },
      notes: { valence: 0.07, bond: 0.015 },
    };
  }
  if (pet.breed === "shadow") {
    return {
      text: "夸奖的声音很轻，刚好是它能收的大小。它把侧腹更紧地贴上你的小腿，贴住就不看你，怕一对视，这点高兴就要溢出来。",
      patch: { place: indoor(pet) ? "feet" : pet.place, posture: "sit", gaze: "floor", activity: "pressed_against_you" },
      notes: { valence: 0.08, bond: 0.02, stress: -0.05 },
    };
  }
  return {
    text: `你一夸它，${pet.breed === "boat" ? "整段后半身就参加了会议，短尾巴只是其中最小的部分" : "它的眼睛亮起来，亮完又坐得更直，像要把这句好话坐实"}。它看着你，等你再说一次。再说一次也没关系。`,
    patch: { posture: "sit", gaze: "you", activity: "watching_you", place: indoor(pet) ? "feet" : pet.place },
    notes: { valence: 0.09, bond: 0.02, arousal: 0.05 },
  };
}

function actScold(pet, choice) {
  const b = breedOf(pet).body;
  if (choice.compliance === "confused_appease") {
    const known = Object.entries(pet.tricks).sort((a, c) => c[1] - a[1])[0];
    const offer = known && known[1] > 0.25
      ? `它迅速坐下，又把爪子抬起来，想从会的事情里找出你要的那一件。`
      : "它坐下，坐得又快又歪，把所有可能的正确先铺在地板上。";
    return {
      text: `你的声音忽然变硬。它并没有在闯祸，所以它愣住，舌头舔了舔鼻头。${offer}${b.ears}向后，眼睛仍看着你，想把你的脸读成一个它能完成的形状。`,
      patch: { posture: "sit", gaze: "you", activity: "watching_you" },
      notes: { stress: 0.16, valence: -0.1, arousal: 0.05, bond: -0.01 },
    };
  }
  return {
    text: `硬声音落地的时候它正在兴头上。兴头熄了一半。它把身体放低，尾巴不再参加，嘴巴闭上。${b.refuse}。它还是看着你，看你的下一口气压会不会降下来。`,
    patch: { posture: "down", gaze: "you", activity: "watching_you" },
    notes: { stress: 0.14, valence: -0.08, arousal: -0.06 },
  };
}

function actSleep(pet) {
  const b = breedOf(pet).body;
  const h = hourOf(pet);
  const night = h >= 20 || h < 6;
  if (pet.activity === "dozing") {
    return {
      text: night
        ? `它已经睡了。你的晚安只让它的耳朵动了动，没有睁眼。夜里它会自己到阳台去一次，你大概只能听见爪子，听不见叫。`
        : `它已经在睡。你的话像一层薄被盖上去，它的呼吸就更浅。${b.sleep}。`,
      patch: { activity: "dozing", posture: "curl", gaze: "nowhere", place: pet.place === "box" ? "box" : (pet.traits.velcro > 0.65 ? "feet" : pet.place) },
      notes: { night },
    };
  }
  if (night) {
    return {
      text: `你说晚安。它在${placePhrase(pet.place)}转了两圈，把白天的味道踩平，然后倒下。${b.sleep}。后半夜它会悄悄去一次阳台，办完就回来，把下巴放回原来的位置。你醒来的时候，只会觉得它一夜没动。`,
      patch: { activity: "dozing", posture: "curl", gaze: "nowhere", place: pet.traits.velcro > 0.6 ? "feet" : "rug" },
      notes: { night: true, arousal: -0.2 },
    };
  }
  return {
    text: `现在是${daypart(pet)}，不是睡觉的钟点。它还是懂了你的意思，在你脚边踩了几步，找不到夜里的那个形状，就将就把下巴搁上你的脚背。眼睛闭上，又睁开一条缝，确认这不是告别。`,
    patch: { place: indoor(pet) ? "feet" : pet.place, activity: "dozing", posture: "curl", gaze: "nowhere" },
    notes: { night: false, arousal: -0.12 },
  };
}

function actSniff(pet) {
  if (!indoor(pet)) {
    const ev = say(pet, "out.event", OUTDOOR_EVENTS);
    return {
      text: `你允许它闻。允许一发出，绳子就不再是直线。${ev}。它的鼻子工作的时候，眼睛是空的，整只狗都搬进了鼻腔里。`,
      patch: { posture: "stand", gaze: "floor", activity: "sniffing" },
      notes: { arousal: 0.05, valence: 0.04 },
    };
  }
  return {
    text: "它沿着踢脚线走，鼻子离地只有一指。沙发腿，食盆底，你的一只鞋，每一处都有一句旧话。它在鞋上停得最久，停完打了个很小的喷嚏，把你的味道从别人的味道里分出来。",
    patch: { place: "hallway", posture: "stand", gaze: "floor", activity: "sniffing" },
    notes: { valence: 0.03 },
  };
}

function actRun(pet) {
  const b = breedOf(pet).body;
  if (!indoor(pet)) {
    if (pet.energy < 0.3) {
      return {
        text: "你让它跑。它跑了四步，第四步变成走。细细的舌头出来一点，它看着你，像说速度今天只剩这些。",
        patch: { posture: "stand", gaze: "you", activity: "walking" },
        notes: { energy: -0.06 },
      };
    }
    return {
      text: `绳子一松，它就变成另一只动物。${pet.breed === "shadow" ? "细腿几乎不沾地，停住时它自己都有点吃惊。" : "它在前面跑出一个弧，再折回来，折回来的时候耳朵是翻的。"}跑完它把肩膀撞上你的腿，要你承认你看见了。`,
      patch: { posture: "stand", gaze: "you", activity: "walking" },
      notes: { energy: -0.12, arousal: 0.15, valence: 0.08 },
    };
  }
  if (pet.energy < 0.28) {
    return {
      text: "屋里没有足够的跑。它也没有足够的电。它只是从地毯这头快走到那头，快走到一半就坐下了，坐下还看着你，想把这算成一次奔跑。",
      patch: { place: "rug", posture: "sit", gaze: "you", activity: "watching_you" },
      notes: { energy: -0.03 },
    };
  }
  return {
    text: `它在沙发和玄关之间突然加速。${b.spin}。茶几腿响了一声，它没有撞上，可所有的毛都认为自己撞上了。跑完它停在你面前，爪子在地板上还打着滑，眼睛亮，要求你解释为什么屋子这么小。`,
    patch: { place: "feet", posture: "stand", gaze: "you", activity: "watching_you" },
    notes: { energy: -0.1, arousal: 0.18, valence: 0.06 },
  };
}

function actOffer(pet) {
  const b = breedOf(pet).body;
  return {
    text: `你把手伸出去，没有摸它，只是放在它闻得到的地方。它的鼻子从指尖走到腕，走到袖口，袖口里有屋子和你的一天。${pet.handSmell === "treat" ? "它在指缝里多停了一秒，那里还有零食的幽灵。" : ""}${b.ears}在闻的时候是放松的。闻完它用额头碰了碰你的掌心，碰完才算打招呼结束。`,
    patch: { place: indoor(pet) ? "feet" : pet.place, posture: "stand", gaze: "hands", activity: "watching_you" },
    notes: { bond: 0.02, stress: -0.04 },
  };
}

function actName(pet, parsed) {
  const b = breedOf(pet).body;
  const renaming = !!(pet.name && pet.name !== parsed.name);
  return {
    text: renaming
      ? `旧的那个声音还留在它耳朵里。你换了一个新的。它侧过头，${b.ears}像在听一个还没站稳的口令，要再听一次才肯把旧的让出去。`
      : `你发出一个新的声音。${b.ears}转向你，等这个声音再来一次。名字要在耳朵上多碰几次，才肯留下来。`,
    patch: { gaze: "you", activity: "watching_you", posture: pet.posture === "curl" ? "down" : "sit" },
    notes: { nameSet: parsed.name, bond: 0.012 },
  };
}

export function actScene(pet, before, parsed, hearing, choice) {
  if (choice.compliance === "too_asleep" && choice.performed === "stir_only") {
    const b = breedOf(pet).body;
    return {
      text: `它没有起来。眼睛睁开一条缝，缝里有你，随即又合上。${b.ears}朝你的方向倒了一下，算把你的话签收了，身体仍旧留在睡里。`,
      patch: { activity: "dozing", posture: "curl", gaze: "nowhere" },
      notes: { arousal: 0.02 },
    };
  }
  if (choice.compliance === "too_asleep" && choice.performed === "wake_slow") {
    const follow = actScene(
      { ...pet, activity: "watching_you", posture: "down", gaze: "you" },
      { ...before, activity: "watching_you", posture: "down" },
      parsed,
      hearing,
      { ...choice, compliance: "partial", performed: parsed.trick || parsed.kind, delay: "slow", quality: 0.35 },
    );
    return {
      text: `它先只睁眼。眼白转过来找到你，身体还是那团热的。过了好几秒，前半身才肯起来，后半身还在谈判。${follow.text}`,
      patch: follow.patch,
      notes: { ...(follow.notes || {}), energy: -0.04, arousal: 0.08 },
    };
  }

  switch (parsed.kind) {
    case "name": return actName(pet, parsed);
    case "look": return actLook(pet, before);
    case "wait":
    case "ignore": return actWait(pet, before, parsed);
    case "touch": return actTouch(pet, parsed, choice);
    case "offer": return actOffer(pet);
    case "call": return actCall(pet, choice);
    case "feed": return actFeed(pet, parsed);
    case "water": return actWater(pet);
    case "trick": return actTrick(pet, parsed, choice);
    case "play": return actPlay(pet, parsed);
    case "walk":
    case "stroll": return actWalk(pet, parsed);
    case "home": return actHome(pet);
    case "bath": return actBath(pet);
    case "brush": return actBrush(pet);
    case "speak": return actSpeak(pet, parsed, hearing, choice);
    case "sleep": return actSleep(pet);
    case "hold": return actHold(pet);
    case "drop": return actDrop(pet, parsed);
    case "tease": return actTease(pet);
    case "apology": return actApology(pet);
    case "praise": return actPraise(pet);
    case "scold": return actScold(pet, choice);
    case "sniff": return actSniff(pet);
    case "run": return actRun(pet);
    default: return actSpeak(pet, parsed, hearing, choice);
  }
}

export function surplus(pet, parsed) {
  if (["scold", "apology", "name", "sleep", "wait", "ignore"].includes(parsed.kind)) return null;
  if (nextRand(pet) > 0.8) return null;
  const b = breedOf(pet).body;
  if (!pet.holding && pet.traits.mouthy > 0.62 && indoor(pet) && ["look", "call", "touch", "praise"].includes(parsed.kind) && nextRand(pet) < 0.18) {
    return {
      text: "事情做完，它又离开了一小会儿，回来时嘴里多了一只袜子。袜子是你的。它把袜子放在你脚边，放得像一件礼物，也像一个问题。",
      patch: { holding: "sock", objects: { sock: "mouth" }, place: "feet", gaze: "you" },
    };
  }
  return {
    text: say(pet, "surplus", [
      "做完它打了个很小的喷嚏，把鼻子里的一粒灰还回给地毯",
      `它舔了舔鼻头，${b.ears}还保持着刚才的方向`,
      "它绕着自己的前爪看了一圈，什么也没找到，于是把这件事作废",
      "一阵很轻的气从它鼻子里出去，像一句没有字的收尾",
      pet.breed === "boat" ? "短腿终于也表态了：它的后半身在地毯上轻轻擦了一下" : "它的重心从左脚换到右脚，换完才算真正结束",
    ]),
    patch: null,
  };
}

export function coda(pet, parsed, choice) {
  if (["wait", "ignore", "look", "walk", "stroll", "sleep", "home", "apology"].includes(parsed.kind)) return "";
  if (choice.hijack) return "";
  if (nextRand(pet) > 0.55) return "";
  if (pet.bladder > 0.84 && indoor(pet)) {
    return "说完这些，它还是朝门的方向偏了偏鼻子。";
  }
  if (pet.stomach < 0.24 && parsed.kind !== "feed") {
    return "它的舌头朝厨房的方向舔了一下空气。";
  }
  if (pet.holding === "ball" && parsed.kind !== "play" && parsed.kind !== "drop") {
    return "球始终没有放下。它用一边腮帮子把球顶正，继续看着你。";
  }
  return "";
}

export function accidentLine() {
  return "做到一半它忽然站起来，快步去了玄关，在垫子上办了一件很小的事，然后把垫子盯住，好像只要盯得够久，这件事就会自己消失。";
}

export function briefStart(pet, parsed) {
  const b = breedOf(pet).body;
  switch (parsed.kind) {
    case "call":
      return `它刚把重心移向你，${b.ears}已经先到了`;
    case "trick":
      return `「${trickWord(parsed.trick)}」刚落到它腿上，腿还没选好形状`;
    case "feed":
      return "它已经朝你的手坐下去了，坐是冲着味道去的";
    case "touch":
      return "你的手刚碰到它的毛";
    case "play":
      return "它刚要去找球";
    case "walk":
      return "它的爪子已经转向门";
    default:
      return "它刚要照第一句去做";
  }
}

export function welcomeText(pet, awayMin) {
  const b = breedOf(pet).body;
  let time;
  if (awayMin < 70) time = "你离开的时间不长，屋子还留着你走时的温度";
  else if (awayMin < 280) time = `你出去了有一会儿。${sunLine(pet)}`;
  else if (awayMin < 900) time = "天色换过一轮。玄关的鞋还是那些鞋，它核对过不止一次";
  else time = "你离开得很久。它把日子过成等候和睡觉两件事情来回倒";

  let where;
  if (pet.activity === "dozing" || pet.posture === "curl") where = `你进来的时候它在${placePhrase(pet.place)}，${b.sleep}`;
  else if (pet.place === "door") where = "它坐在门边，像已经把开门的声音预演过好几遍";
  else if (pet.place === "bowl") where = pet.stomach < 0.35 ? "它在空食盆旁边坐着，盆沿被舔得发亮" : "它在食盆旁边，并不急";
  else where = `它在${placePhrase(pet.place)}。先动的是${b.ears}`;

  let greet;
  if (pet.bond > 0.55 && awayMin > 80) greet = `${b.greet}。高兴有一点溢出，它自己也压不住`;
  else if (pet.bond < 0.32) greet = "它看见是你，确认完了，才把背挺直。欢迎很短";
  else greet = "它朝你走了两步，又停住，把剩下的步子留给你";

  const extra = [];
  if (pet.usedPad) {
    extra.push("阳台的垫子被用过了。它看了你一眼，希望你跳过这个话题");
    pet.usedPad = false;
  }
  if (pet.stomach < 0.28) extra.push("食盆空着，空了有一会儿");
  return para([time, where, greet, extra.join("。")]);
}
