/**
 * 主应用逻辑：知识点占比统计、学期列表渲染、模糊搜索、真题展示、出题思路分析。
 * 数据来源：window.QUESTIONS（2021–2025 北京中考数学真题140道）、window.CURRICULUM。
 */
(function () {
  "use strict";

  var Q = window.QUESTIONS;
  var YEARS = [2021, 2022, 2023, 2024, 2025];
  var TOTAL_SCORE = 0;
  Q.forEach(function (q) { TOTAL_SCORE += q.score; });

  /* ============ 统计：每个知识点的题量、分值、年份 ============ */
  var STATS = {}; // name -> {count, score, years:Set, questions:[]}
  Q.forEach(function (q) {
    q.kps.forEach(function (kp) {
      if (!STATS[kp]) STATS[kp] = { count: 0, score: 0, years: {}, questions: [] };
      STATS[kp].count++;
      STATS[kp].score += q.score;
      STATS[kp].years[q.year] = true;
      STATS[kp].questions.push(q);
    });
  });
  window.KP_STATS = STATS;
  window.TOTAL_SCORE = TOTAL_SCORE;

  function pct(kp) {
    var s = STATS[kp];
    if (!s) return 0;
    return (s.score / TOTAL_SCORE) * 100;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ============ 题目卡片 ============ */
  function questionCard(q, extraClass, extraBadge) {
    var kpBadges = q.kps.map(function (k) {
      return '<span class="badge kp" data-kp="' + esc(k) + '">' + esc(k) + "</span>";
    }).join("");
    var fig = q.hasFigure ? '<span class="badge figure">含图（文字已描述图形要点）</span>' : "";
    return (
      '<div class="q-card ' + (extraClass || "") + '">' +
      '<div class="q-head">' +
      (extraBadge || ('<span class="badge year">' + q.year + "年 第" + q.no + "题</span>")) +
      '<span class="badge type">' + esc(q.type) + '</span>' +
      '<span class="badge score">' + q.score + "分</span>" + kpBadges + fig +
      "</div>" +
      '<div class="q-text">' + esc(q.text) + "</div>" +
      '<button class="q-toggle">显示答案与解析</button>' +
      '<div class="q-answer">' +
      '<div class="ans">【答案】' + esc(q.answer) + "</div>" +
      '<div class="sol">【解析】' + esc(q.solution) + "</div>" +
      "</div></div>"
    );
  }

  // 事件委托：答案开合 + 知识点标签点击跳搜索
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("q-toggle")) {
      var panel = e.target.nextElementSibling;
      panel.classList.toggle("show");
      e.target.textContent = panel.classList.contains("show") ? "收起答案与解析" : "显示答案与解析";
    }
    if (e.target.classList.contains("badge") && e.target.dataset.kp) {
      document.getElementById("search-input").value = e.target.dataset.kp;
      doSearch();
      switchTab("search");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  /* ============ 页签切换 ============ */
  function switchTab(id) {
    document.querySelectorAll("nav.tabs button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.tab === id);
    });
    document.querySelectorAll(".tab-page").forEach(function (p) {
      p.classList.toggle("active", p.id === "page-" + id);
    });
  }
  window.switchTab = switchTab;
  document.querySelectorAll("nav.tabs button").forEach(function (b) {
    b.addEventListener("click", function () { switchTab(b.dataset.tab); });
  });

  /* ============ 学期知识点 + 占比渲染 ============ */
  function renderCurriculum() {
    var host = document.getElementById("curriculum-host");
    var html = "";
    window.CURRICULUM.forEach(function (sem, i) {
      var semScore = 0, semCount = 0;
      sem.units.forEach(function (u) {
        u.kps.forEach(function (kp) {
          var s = STATS[kp.name];
          if (s) { semScore += s.score; semCount += s.count; }
        });
      });
      var semPct = ((semScore / TOTAL_SCORE) * 100).toFixed(1);
      html +=
        '<div class="semester-block' + (i === 4 ? " open" : "") + '">' +
        '<div class="semester-head">' +
        '<div class="title"><span class="tag">' + esc(sem.short) + "</span>" + esc(sem.semester) + "</div>" +
        '<div class="meta">考查 ' + semCount + " 题次 · 分值占比约 " + semPct + '%<span class="arrow">▶</span></div>' +
        "</div>" +
        '<div class="semester-body">';
      sem.units.forEach(function (u) {
        html += '<div class="unit-name">■ ' + esc(u.unit) + "</div>";
        u.kps.forEach(function (kp) {
          var s = STATS[kp.name];
          var p = pct(kp.name);
          var yearsArr = s ? Object.keys(s.years).sort() : [];
          html +=
            '<div class="kp-row' + (s ? "" : " zero") + '" data-kp="' + esc(kp.name) + '">' +
            '<div class="kp-name">' + esc(kp.name) + "</div>" +
            '<div class="bar-track"><div class="bar-fill" style="width:' + Math.min(100, p * 6) + '%"></div></div>' +
            '<div class="kp-pct">' +
            (s
              ? "<b>" + p.toFixed(1) + "%</b> · " + s.count + "题次 · " + yearsArr.length + "个年份"
              : "近5年未单独考查") +
            "</div></div>";
        });
      });
      html += "</div></div>";
    });
    host.innerHTML = html;

    host.querySelectorAll(".semester-head").forEach(function (h) {
      h.addEventListener("click", function () {
        h.parentElement.classList.toggle("open");
      });
    });
    host.querySelectorAll(".kp-row[data-kp]").forEach(function (row) {
      if (row.classList.contains("zero")) return;
      row.addEventListener("click", function () {
        document.getElementById("search-input").value = row.dataset.kp;
        doSearch();
        switchTab("search");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  /* ============ 模糊搜索 ============ */
  function normalize(s) {
    return s
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[（）()、，。·．\-—_]/g, "");
  }

  /** 返回匹配的知识点规范名列表（按相关度排序） */
  function matchKps(query) {
    var nq = normalize(query);
    if (!nq) return [];
    var scored = [];
    Object.keys(window.KP_INDEX).forEach(function (name) {
      var info = window.KP_INDEX[name];
      var candidates = [name].concat(info.aliases || []);
      var best = 0;
      candidates.forEach(function (c) {
        var nc = normalize(c);
        if (!nc) return;
        var sc = 0;
        if (nc === nq) sc = 100;
        else if (nc.indexOf(nq) !== -1) sc = 60 + Math.min(30, nq.length * 6);
        else if (nq.indexOf(nc) !== -1) sc = 50 + Math.min(30, nc.length * 6);
        else if (nq.length >= 2) {
          // 逐字重合率（模糊容错：输入“园的性质”也能命中“圆”类需要拼音，这里用字符重合）
          var hit = 0;
          for (var i = 0; i < nq.length; i++) if (nc.indexOf(nq[i]) !== -1) hit++;
          var ratio = hit / nq.length;
          if (ratio >= 0.6 && hit >= 2) sc = Math.round(ratio * 40);
        }
        if (sc > best) best = sc;
      });
      if (best > 0) scored.push({ name: name, score: best });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.map(function (x) { return x.name; });
  }

  function doSearch() {
    var query = document.getElementById("search-input").value.trim();
    var info = document.getElementById("search-result-info");
    var host = document.getElementById("search-result-host");
    if (!query) {
      info.innerHTML = "";
      host.innerHTML = '<div class="empty-tip">输入知识点名称（支持模糊输入，如“勾股”“抛物线”“sin”），即可查看其出现年份、真题原题与答案。</div>';
      return;
    }
    switchTab("search");

    var kps = matchKps(query);
    // 匹配到的知识点下的题目（去重）
    var qmap = {};
    var kpsWithData = [];
    kps.forEach(function (k) {
      var s = STATS[k];
      if (!s) return;
      kpsWithData.push(k);
      s.questions.forEach(function (q) { qmap[q.id] = q; });
    });
    // 题干全文匹配作为补充
    var nq = normalize(query);
    if (nq.length >= 2) {
      Q.forEach(function (q) {
        if (normalize(q.text).indexOf(nq) !== -1) qmap[q.id] = q;
      });
    }
    var list = Object.keys(qmap).map(function (id) { return qmap[id]; });
    list.sort(function (a, b) { return a.year - b.year || a.no - b.no; });

    if (!list.length) {
      info.innerHTML = "未找到与 “<b>" + esc(query) + "</b>” 相关的知识点或真题，请换个说法试试（如“方程”“圆”“统计”）。";
      host.innerHTML = "";
      return;
    }

    var yearsHit = {};
    list.forEach(function (q) { yearsHit[q.year] = (yearsHit[q.year] || 0) + 1; });
    var yearStr = Object.keys(yearsHit).sort().map(function (y) {
      return y + "年（" + yearsHit[y] + "题）";
    }).join("、");

    var chipHtml = kpsWithData.slice(0, 6).map(function (k) {
      return '<span class="kp-match-chip">' + esc(k) + " · " + esc(window.KP_INDEX[k].short) + " · 占比" + pct(k).toFixed(1) + "%</span>";
    }).join("");

    info.innerHTML =
      "“<b>" + esc(query) + "</b>” 匹配到 <b>" + kpsWithData.length + "</b> 个知识点、<b>" +
      list.length + "</b> 道真题，出现于：<b>" + yearStr + "</b><br>" + chipHtml;

    var html = "";
    var lastYear = null;
    list.forEach(function (q) {
      if (q.year !== lastYear) {
        html += '<div class="year-group-title">' + q.year + "年北京市中考数学</div>";
        lastYear = q.year;
      }
      html += questionCard(q);
    });
    host.innerHTML = html;
  }
  window.doSearch = doSearch;

  document.getElementById("search-btn").addEventListener("click", doSearch);
  document.getElementById("search-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") doSearch();
  });
  document.querySelectorAll(".search-hint span").forEach(function (s) {
    s.addEventListener("click", function () {
      document.getElementById("search-input").value = s.textContent;
      doSearch();
    });
  });

  /* ============ 出题思路（基于数据的分析） ============ */
  function renderAnalysis() {
    // 题位 → 各年知识点
    var slotHost = document.getElementById("slot-table-host");
    var rows = "";
    for (var no = 1; no <= 28; no++) {
      var kpCount = {};
      var scores = [];
      YEARS.forEach(function (y) {
        var q = Q.filter(function (x) { return x.year === y && x.no === no; })[0];
        if (!q) return;
        if (scores.indexOf(q.score) === -1) scores.push(q.score);
        q.kps.forEach(function (k) { kpCount[k] = (kpCount[k] || 0) + 1; });
      });
      var top = Object.keys(kpCount).sort(function (a, b) { return kpCount[b] - kpCount[a]; });
      var stable = top.filter(function (k) { return kpCount[k] >= 3; });
      var label = (stable.length ? stable : top.slice(0, 2)).map(function (k) {
        return esc(k) + "（" + kpCount[k] + "/5年）";
      }).join("、");
      rows +=
        "<tr><td class='num'>" + no + "</td><td>" + scores.join("/") + "分</td><td>" + label + "</td></tr>";
    }
    slotHost.innerHTML =
      '<table class="slot-table"><tr><th>题号</th><th>分值</th><th>近5年考点（出现年数）</th></tr>' + rows + "</table>";

    // 高频知识点 TOP 12
    var topHost = document.getElementById("top-kp-host");
    var names = Object.keys(STATS).sort(function (a, b) { return STATS[b].score - STATS[a].score; }).slice(0, 12);
    var thtml = '<table class="slot-table"><tr><th>知识点</th><th>学期</th><th>题次</th><th>累计分值</th><th>分值占比</th><th>出现年份</th></tr>';
    names.forEach(function (k) {
      var s = STATS[k];
      thtml +=
        "<tr><td>" + esc(k) + "</td><td>" + esc(window.KP_INDEX[k] ? window.KP_INDEX[k].short : "—") +
        "</td><td class='num'>" + s.count + "</td><td class='num'>" + s.score +
        "</td><td class='num'>" + pct(k).toFixed(1) + "%</td><td>" +
        Object.keys(s.years).sort().join("、") + "</td></tr>";
    });
    topHost.innerHTML = thtml + "</table>";
  }

  /* ============ 初始化 ============ */
  document.getElementById("db-count").textContent = Q.length;
  renderCurriculum();
  renderAnalysis();
  doSearch();
})();
