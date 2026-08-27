/**
 * 模拟出题引擎：基于北京教育考试院近5年真题的稳定题位与命题模式，
 * 参数化生成同风格新题，并同步生成标准答案与详细解题过程。
 * 每个模板都注明了所仿照的真题题位与年份实例。
 */
(function () {
  "use strict";

  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[ri(0, arr.length - 1)]; }
  var SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  function sup(n) { return String(n).split("").map(function (c) { return SUP[c] || c; }).join(""); }

  var TEMPLATES = [
    /* ---------- 题位2：科学记数法（2021Q2/2022Q2/2023Q2/2024Q2/2025Q2 均考） ---------- */
    {
      id: "sci", name: "科学记数法（选择题·题位2）", kps: ["科学记数法"],
      generate: function () {
        var ctx = pick([
          ["某年京津冀地区快递业务量约为{N}件", "件"],
          ["某项水利工程年调水量约为{N}立方米", "立方米"],
          ["我国某年新能源汽车产量约为{N}辆", "辆"],
          ["某市全年地铁客运量约为{N}人次", "人次"]
        ]);
        var mant = ri(101, 989); // 1.01 ~ 9.89
        var exp = ri(8, 11);
        var a = (mant / 100).toString();
        var digits = String(mant) + new Array(exp - 2 + 1).join("0"); // mant×10^(exp-2)
        var wrong1 = (mant / 10).toFixed(1) + "×10" + sup(exp - 1);
        var wrong2 = a + "×10" + sup(exp + 1);
        var wrong3 = (mant / 1000).toString() + "×10" + sup(exp + 1);
        var correct = a + "×10" + sup(exp);
        var opts = [correct, wrong1, wrong2, wrong3];
        // 打乱
        for (var i = opts.length - 1; i > 0; i--) { var j = ri(0, i); var t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
        var ansIdx = opts.indexOf(correct);
        var letters = ["A", "B", "C", "D"];
        return {
          type: "选择题", score: 2,
          text: ctx[0].replace("{N}", Number(digits).toLocaleString("zh-CN")) +
            "。将 " + Number(digits).toLocaleString("zh-CN") + " 用科学记数法表示应为（　）" +
            opts.map(function (o, k) { return letters[k] + ". " + o; }).join("　"),
          answer: letters[ansIdx],
          solution: "科学记数法要求写成 a×10ⁿ（1≤|a|＜10，n为整数）。" +
            digits.length + "位整数 " + Number(digits).toLocaleString("zh-CN") +
            " 的小数点需向左移动 " + exp + " 位，得 a＝" + a + "，n＝" + exp +
            "，即 " + correct + "。故选" + letters[ansIdx] + "。"
        };
      }
    },

    /* ---------- 题位17：实数与特殊角三角函数计算（2021Q17/2022Q17 同款） ---------- */
    {
      id: "calc17", name: "实数计算·特殊角三角函数（解答题·题位17）", kps: ["锐角三角函数", "实数与平方根", "整式乘除与幂运算"],
      generate: function () {
        var tri = pick([
          { txt: "4sin45°", coeff: 2, base: 2 },   // = 2√2
          { txt: "2sin60°", coeff: 1, base: 3 },   // = √3
          { txt: "6tan30°", coeff: 2, base: 3 },   // = 2√3
          { txt: "4cos30°", coeff: 2, base: 3 },   // = 2√3
          { txt: "2cos45°", coeff: 1, base: 2 }    // = √2
        ]);
        var k = ri(1, 3); // 根式项系数
        var minus = pick([true, false]);
        var surdVal = tri.base * k * k;
        var absV = ri(2, 6);
        var m = ri(1, 3);
        var text = "计算：" + tri.txt + (minus ? " − " : " + ") + "√" + surdVal +
          " + |−" + absV + "| − (π−" + m + ")⁰。";
        var totalCoeff = tri.coeff + (minus ? -k : k);
        var constPart = absV - 1;
        var surdStr = totalCoeff === 0 ? "" : (totalCoeff === 1 ? "√" + tri.base : (totalCoeff === -1 ? "−√" + tri.base : totalCoeff + "√" + tri.base));
        var ans;
        if (!surdStr) ans = String(constPart);
        else if (constPart === 0) ans = surdStr;
        else ans = totalCoeff > 0 ? surdStr + "+" + constPart : constPart + surdStr.replace("−", "−");
        if (surdStr && constPart !== 0 && totalCoeff < 0) ans = constPart + surdStr;
        var triVal = tri.coeff === 1 ? "√" + tri.base : tri.coeff + "√" + tri.base;
        var surdSimp = k === 1 ? "√" + tri.base : k + "√" + tri.base;
        return {
          type: "解答题", score: 5, text: text, answer: ans,
          solution: "分项化简：" + tri.txt + "＝" + triVal + "（特殊角三角函数值）；√" + surdVal +
            "＝" + surdSimp + "（化最简二次根式）；|−" + absV + "|＝" + absV +
            "（绝对值）；(π−" + m + ")⁰＝1（零指数幂）。\n原式＝" + triVal + (minus ? " − " : " + ") + surdSimp +
            " + " + absV + " − 1＝" + ans + "。"
        };
      }
    },

    /* ---------- 题位18：解一元一次不等式组（2021Q18/2022Q18 同款） ---------- */
    {
      id: "ineq18", name: "解一元一次不等式组（解答题·题位18）", kps: ["不等式与不等式组"],
      generate: function () {
        var p = ri(-2, 2), gap = ri(2, 4), q = p + gap;
        var a = ri(3, 5), c = a - 3;             // (a−c)x > 3p → x > p
        var b = ri(1, 6), d = 3 * p - b;         // ax − b > cx + d
        var f = q;                               // (3x−f)/2 < x → x < f
        var ineq1 = a + "x − " + b + " ＞ " + (c === 0 ? "" : c + "x ") + (d >= 0 ? (c === 0 ? "" : "+ ") + d : "− " + Math.abs(d));
        if (c === 0 && d < 0) ineq1 = a + "x − " + b + " ＞ −" + Math.abs(d);
        if (c === 0 && d >= 0) ineq1 = a + "x − " + b + " ＞ " + d;
        return {
          type: "解答题", score: 5,
          text: "解不等式组：{ " + ineq1 + " ①；　(3x − " + f + ")/2 ＜ x ② }",
          answer: p + " ＜ x ＜ " + q,
          solution: "解不等式①：移项得 " + (a - c) + "x ＞ " + (3 * p) + "，系数化为1得 x ＞ " + p +
            "。\n解不等式②：两边同乘2得 3x − " + f + " ＜ 2x，移项得 x ＜ " + f +
            "。\n在数轴上取两个解集的公共部分，原不等式组的解集为 " + p + " ＜ x ＜ " + q + "。"
        };
      }
    },

    /* ---------- 题位19：整体代入化简求值（2021Q19/2022Q19/2024Q19 同款） ---------- */
    {
      id: "eval19", name: "化简求值·整体代入（解答题·题位19）", kps: ["整式乘除与幂运算", "一元二次方程"],
      generate: function () {
        var k = ri(1, 5);
        var variant = pick([1, 2]);
        if (variant === 1) {
          // 已知 x²+2x−k=0，求 (x+1)²+x(x+2)
          return {
            type: "解答题", score: 5,
            text: "已知 x² + 2x − " + k + " ＝ 0，求代数式 (x+1)² + x(x+2) 的值。",
            answer: String(2 * k + 1),
            solution: "先化简：(x+1)² + x(x+2)＝x²+2x+1+x²+2x＝2(x²+2x)+1。\n由已知 x²+2x−" + k +
              "＝0，得 x²+2x＝" + k + "（整体）。\n整体代入：原式＝2×" + k + "+1＝" + (2 * k + 1) + "。"
          };
        }
        // 已知 m²+3m−k=0，求 m(m+3)+(m−1)(m+4)
        return {
          type: "解答题", score: 5,
          text: "已知 m² + 3m − " + k + " ＝ 0，求代数式 m(m+3) + (m−1)(m+4) 的值。",
          answer: String(2 * k - 4),
          solution: "先化简：m(m+3)＝m²+3m；(m−1)(m+4)＝m²+3m−4。\n故原式＝2(m²+3m)−4。\n由已知 m²+3m＝" + k +
            "（整体），代入得原式＝2×" + k + "−4＝" + (2 * k - 4) + "。"
        };
      }
    },

    /* ---------- 填空11位：分式方程（2021Q11/2022Q11 同款） ---------- */
    {
      id: "frac11", name: "解分式方程（填空题·题位11）", kps: ["分式方程"],
      generate: function () {
        var a = pick([2, 3]);            // a/(x+b) = 1/x
        var t = ri(1, 4);
        var b = (a - 1) * t;             // 保证整数根 x = b/(a−1) = t
        return {
          type: "填空题", score: 2,
          text: "方程 " + a + "/(x+" + b + ") ＝ 1/x 的解为＿＿＿。",
          answer: "x＝" + t,
          solution: "方程两边同乘 x(x+" + b + ")，得 " + a + "x ＝ x + " + b +
            "。\n移项合并：" + (a - 1) + "x ＝ " + b + "，解得 x ＝ " + t +
            "。\n检验：当 x＝" + t + " 时，x(x+" + b + ")＝" + (t * (t + b)) + "≠0，故 x＝" + t + " 是原方程的解。"
        };
      }
    },

    /* ---------- 题位21：一元二次方程含参（2021Q21/2022Q6 命题模式） ---------- */
    {
      id: "quad21", name: "一元二次方程含参·判别式（解答题·题位21）", kps: ["一元二次方程"],
      generate: function () {
        var a = pick([2, 3, 4]);       // 方程 x²−(a+1)mx+a·m²=0，根为 m 与 am
        var d = (a - 1) * ri(1, 3);    // 两根差
        var m = d / (a - 1);
        var bCoef = a + 1;
        return {
          type: "解答题", score: 6,
          text: "已知关于x的一元二次方程 x² − " + bCoef + "mx + " + a + "m² ＝ 0。（1）求证：该方程总有两个实数根；（2）若 m＞0，且该方程的两个实数根的差为 " + d + "，求m的值。",
          answer: "（1）见解析；（2）m＝" + m,
          solution: "（1）Δ＝(" + bCoef + "m)² − 4×" + a + "m²＝" + (bCoef * bCoef) + "m² − " + (4 * a) +
            "m²＝" + (bCoef * bCoef - 4 * a) + "m²＝(" + (a - 1) + "m)²≥0，故方程总有两个实数根。\n（2）因式分解：(x − m)(x − " + a +
            "m)＝0，两根为 x₁＝m，x₂＝" + a + "m。\n两根之差：|" + a + "m − m|＝" + (a - 1) + "|m|＝" + d +
            "，解得 m＝±" + m + "。\n∵m＞0，∴m＝" + m + "。"
        };
      }
    },

    /* ---------- 填空12位：反比例函数（2021Q12/2022Q12 同款） ---------- */
    {
      id: "inv12", name: "反比例函数求值（填空题·题位12）", kps: ["反比例函数"],
      generate: function () {
        var x1 = pick([1, 2, 3]), y1 = pick([2, 4, 6]);
        var k = x1 * y1;
        var divisors = [1, 2, 3, 4, 6, 8, 12, 24].filter(function (d) { return k % d === 0 && d !== x1; });
        var x2 = pick(divisors) * pick([1, -1]);
        var m = k / x2;
        return {
          type: "填空题", score: 2,
          text: "在平面直角坐标系xOy中，若反比例函数 y＝k/x（k≠0）的图象经过点A(" + x1 + "," + y1 + ")和点B(" + x2 + ",m)，则m的值为＿＿＿。",
          answer: String(m),
          solution: "由点A(" + x1 + "," + y1 + ")在图象上，得 k＝" + x1 + "×" + y1 + "＝" + k +
            "。\n反比例函数上任意一点满足 xy＝k，故 m＝" + k + "÷(" + x2 + ")＝" + m + "。"
        };
      }
    },

    /* ---------- 题位6：概率（2021Q6/2022Q5/2023Q6 命题模式） ---------- */
    {
      id: "prob6", name: "简单概率·列表法（选择题·题位6）", kps: ["概率"],
      generate: function () {
        var variant = pick([1, 2]);
        if (variant === 1) {
          var r = ri(1, 3), w = ri(1, 3);
          var n = r + w;
          return {
            type: "选择题", score: 2,
            text: "不透明的袋子中装有红球" + r + "个、白球" + w + "个，这些球除颜色外无其他差别。从袋子中随机摸出一个球，则摸到红球的概率是（　）A. " + r + "/" + n + "　B. " + w + "/" + n + "　C. 1/" + n + "　D. 1/2",
            answer: "A",
            solution: "共有 " + n + " 个球，每个球被摸到的可能性相同，其中红球 " + r +
              " 个。\nP(摸到红球)＝红球数/总球数＝" + r + "/" + n + "。故选A。"
          };
        }
        return {
          type: "选择题", score: 2,
          text: "不透明的袋子中装有红、绿小球各一个，除颜色外无其他差别。从中随机摸出一个小球，放回并摇匀，再随机摸出一个小球，则两次摸到的球颜色相同的概率是（　）A. 1/4　B. 1/3　C. 1/2　D. 3/4",
          answer: "C",
          solution: "用列表法：两次摸球共4种等可能结果——（红,红）（红,绿）（绿,红）（绿,绿）。\n颜色相同的有（红,红）（绿,绿）共2种。\nP＝2/4＝1/2。故选C。"
        };
      }
    },

    /* ---------- 填空9位：二次根式有意义（2021Q9/2022Q9 同款） ---------- */
    {
      id: "sqrt9", name: "二次根式有意义的条件（填空题·题位9）", kps: ["二次根式"],
      generate: function () {
        var a = ri(2, 12);
        var variant = pick([1, 2]);
        if (variant === 1) {
          return {
            type: "填空题", score: 2,
            text: "若 √(x−" + a + ") 在实数范围内有意义，则实数x的取值范围是＿＿＿。",
            answer: "x≥" + a,
            solution: "二次根式有意义要求被开方数非负：x−" + a + "≥0，解得 x≥" + a + "。"
          };
        }
        return {
          type: "填空题", score: 2,
          text: "若 √(" + a + "−x) 在实数范围内有意义，则实数x的取值范围是＿＿＿。",
          answer: "x≤" + a,
          solution: "二次根式有意义要求被开方数非负：" + a + "−x≥0，解得 x≤" + a + "。"
        };
      }
    },

    /* ---------- 填空10位：因式分解（2021Q10/2022Q10 同款） ---------- */
    {
      id: "factor10", name: "因式分解（填空题·题位10）", kps: ["因式分解"],
      generate: function () {
        var a = pick([2, 3, 5, 7]);
        var variant = pick([1, 2]);
        if (variant === 1) {
          return {
            type: "填空题", score: 2,
            text: "分解因式：" + a + "x² − " + a + "y² ＝＿＿＿。",
            answer: a + "(x+y)(x−y)",
            solution: "先提公因式" + a + "：" + a + "x²−" + a + "y²＝" + a +
              "(x²−y²)；\n再用平方差公式 x²−y²＝(x+y)(x−y)：原式＝" + a + "(x+y)(x−y)。"
          };
        }
        return {
          type: "填空题", score: 2,
          text: "分解因式：x³ − " + 2 * a + "x²y + " + a * a + "xy² ＝＿＿＿。",
          answer: "x(x−" + a + "y)²",
          solution: "先提公因式x：原式＝x(x²−" + 2 * a + "xy+" + a * a +
            "y²)；\n括号内符合完全平方公式 a²−2ab+b²＝(a−b)²：原式＝x(x−" + a + "y)²。"
        };
      }
    },

    /* ---------- 填空13位：切线与圆（2021Q13 命题模式） ---------- */
    {
      id: "circle13", name: "切线长与圆心角（填空题·题位13）", kps: ["点、直线与圆的位置关系"],
      generate: function () {
        var p = ri(8, 14) * 5; // 40~70
        return {
          type: "填空题", score: 2,
          text: "如图，PA，PB是⊙O的切线，A，B是切点。若∠P＝" + p + "°，则∠AOB＝＿＿＿°。（图：P在圆外，PA、PB分别切⊙O于A、B）",
          answer: (180 - p) + "°",
          solution: "切线垂直于过切点的半径，故∠OAP＝∠OBP＝90°。\n四边形OAPB的内角和为360°：∠AOB＝360°−90°−90°−" + p +
            "°＝" + (180 - p) + "°。"
        };
      }
    },

    /* ---------- 题位26：二次函数对称性（2021Q26/2022Q26/2023Q26 命题模式） ---------- */
    {
      id: "para26", name: "二次函数对称性比较（解答题·题位26·简化版）", kps: ["二次函数"],
      generate: function () {
        var x1 = ri(0, 2), x2 = x1 + pick([2, 3, 4]);
        var t2 = (x1 + x2) / 2;
        var tStr = Number.isInteger(t2) ? String(t2) : (x1 + x2) + "/2";
        var x3 = x2 + ri(1, 2);
        return {
          type: "解答题", score: 6,
          text: "在平面直角坐标系xOy中，点(" + x1 + ",y₁)，(" + x2 + ",y₂)，(" + x3 +
            ",y₃)在抛物线 y＝ax²+bx+c（a＞0）上，设抛物线的对称轴为 x＝t。（1）若 y₁＝y₂，求t的值，并比较y₃与y₁的大小；（2）若对于 y₁＜y₂＜y₃，直接写出t的取值范围。",
          answer: "（1）t＝" + tStr + "，y₃＞y₁；（2）t＜" + tStr,
          solution: "（1）y₁＝y₂说明两点(" + x1 + ",y₁)、(" + x2 + ",y₂)关于对称轴对称，故 t＝(" + x1 + "+" + x2 +
            ")/2＝" + tStr + "。\n因a＞0，抛物线开口向上，离对称轴越远函数值越大：|" + x3 + "−" + tStr + "|＝" +
            (x3 - t2) + " ＞ |" + x1 + "−" + tStr + "|＝" + (t2 - x1) + "，故 y₃＞y₁。\n（2）开口向上时，若三点函数值随横坐标递增，需三点都在对称轴右侧“或”对称轴足够靠左，使 " +
            x1 + " 与 " + x2 + " 中离轴更近的是 " + x1 + "：临界情形为 t＝(" + x1 + "+" + x2 +
            ")/2（此时y₁＝y₂）。故 t＜(" + x1 + "+" + x2 + ")/2 时才有 y₁＜y₂＜y₃（此时 " + x2 + "、" + x3 +
            " 依次更远）。即 t＜" + (x1 + x2) + "/2。"
        };
      }
    },

    /* ---------- 题位23位：一次函数平移（2021Q23/2023Q22 命题模式） ---------- */
    {
      id: "linear23", name: "一次函数平移与交点（解答题·题位23·简化版）", kps: ["一次函数"],
      generate: function () {
        var k = pick([1, 2, 3]);
        var b = ri(1, 4);
        var x0 = b / k;
        var x0Str = Number.isInteger(x0) ? String(x0) : b + "/" + k;
        return {
          type: "解答题", score: 5,
          text: "在平面直角坐标系xOy中，一次函数 y＝kx+b（k≠0）的图象由函数 y＝" + (k === 1 ? "" : k) +
            "x 的图象向下平移 " + b + " 个单位长度得到。（1）求这个一次函数的解析式；（2）求该图象与x轴、y轴的交点坐标。",
          answer: "（1）y＝" + (k === 1 ? "" : k) + "x−" + b + "；（2）与x轴交于(" + x0Str + ",0)，与y轴交于(0,−" + b + ")",
          solution: "（1）“上加下减”：向下平移" + b + "个单位长度，解析式为 y＝" + (k === 1 ? "" : k) + "x − " + b +
            "。\n（2）令y＝0：" + (k === 1 ? "" : k) + "x−" + b + "＝0，解得 x＝" + x0Str + "，与x轴交点为(" + x0Str +
            ",0)；\n令x＝0：y＝−" + b + "，与y轴交点为(0,−" + b + ")。"
        };
      }
    }
  ];

  window.SIM_TEMPLATES = TEMPLATES;

  /* ---------- UI ---------- */
  var sel = document.getElementById("gen-select");
  TEMPLATES.forEach(function (t) {
    var o = document.createElement("option");
    o.value = t.id;
    o.textContent = t.name;
    sel.appendChild(o);
  });

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  document.getElementById("gen-btn").addEventListener("click", function () {
    var id = sel.value;
    var tpl = TEMPLATES.filter(function (t) { return t.id === id; })[0] || pick(TEMPLATES);
    var q = tpl.generate();
    var host = document.getElementById("gen-host");
    var kpBadges = tpl.kps.map(function (k) {
      return '<span class="badge kp" data-kp="' + esc(k) + '">' + esc(k) + "</span>";
    }).join("");
    host.insertAdjacentHTML(
      "afterbegin",
      '<div class="q-card sim-card">' +
      '<div class="q-head"><span class="badge sim">模拟题 · 仿北京卷</span>' +
      '<span class="badge type">' + esc(q.type) + '</span><span class="badge score">' + q.score + "分</span>" +
      kpBadges + "</div>" +
      '<div class="q-text">' + esc(q.text) + "</div>" +
      '<button class="q-toggle">显示标准答案与解题过程</button>' +
      '<div class="q-answer">' +
      '<div class="ans">【标准答案】' + esc(q.answer) + "</div>" +
      '<div class="sol">【解题过程】\n' + esc(q.solution) + "</div>" +
      "</div></div>"
    );
  });
})();
