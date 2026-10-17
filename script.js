/* Наталия | Beauty — интерактив без библиотек */
(function () {
  "use strict";

  var PHONE_DISPLAY = "8-960-463-59-93";

  /* ---------------------------------------------------------
     ФОТОГРАФИИ РАБОТ — все 14 файлов из папки nogti.
     Оригиналы лежат в nogti/ без изменений; для сайта сделаны
     копии images/works/nogti-NN.jpg (те же байты, чистое имя,
     расширение .jpg для надёжного MIME-типа на хостинге).
     Как добавить новое фото:
     1) Положите файл в папку nogti/.
     2) Скопируйте его в images/works/ под следующим номером.
     3) Добавьте одну строку ниже — лента и галерея подхватят
        её автоматически (скорость пересчитается сама).
     ПРИМЕЧАНИЕ: файл nogti-05.jpg содержит чужой водяной знак
     «NAGELSALON CORINNE» — решите, оставлять ли это фото.
  ---------------------------------------------------------- */
  var WORKS_ROW_1 = [
    { src: "images/works/nogti-01.jpg", title: "Морская волна", desc: "нюд с сине-белыми волнами", cat: "design" },
    { src: "images/works/nogti-02.jpg", title: "Френч с золотом", desc: "белый френч и золотая веточка", cat: "design" },
    { src: "images/works/nogti-03.jpg", title: "Мята с глиттером", desc: "нюд, мятный акцент и линия глиттера", cat: "design" },
    { src: "images/works/nogti-04.jpg", title: "Жемчужный акцент", desc: "молочный маникюр и жемчужная рамка", cat: "design" },
    { src: "images/works/nogti-05.jpg", title: "Глиттерный френч", desc: "нюд и серебристый глиттер", cat: "design" },
    { src: "images/works/nogti-06.jpg", title: "Сливовый оттенок", desc: "насыщенное однотонное покрытие", cat: "manicure" },
    { src: "images/works/nogti-07.jpg", title: "Нежный нюд", desc: "короткий нюдовый маникюр", cat: "manicure" }
  ];
  var WORKS_ROW_2 = [
    { src: "images/works/nogti-08.jpg", title: "Классический френч", desc: "короткий квадрат и белая улыбка", cat: "manicure" },
    { src: "images/works/nogti-09.jpg", title: "Сияющий френч", desc: "нюд с деликатным глиттером по краю", cat: "manicure" },
    { src: "images/works/nogti-10.jpg", title: "Праздничный дизайн", desc: "глубокий зелёный и рисунок-бант", cat: "design" },
    { src: "images/works/nogti-11.jpg", title: "Педикюр с глиттером", desc: "френч и серебристое сияние", cat: "beauty" },
    { src: "images/works/nogti-12.jpg", title: "Матовый с золотом", desc: "матовое покрытие и золотые детали", cat: "manicure" },
    { src: "images/works/nogti-13.jpg", title: "Педикюр: геометрия", desc: "нюд, чёрные линии и принт", cat: "beauty" },
    { src: "images/works/nogti-14.jpg", title: "Яркие волны", desc: "нюд, жёлтый и фиолетовый", cat: "design" }
  ];

  var CAT_LABEL = { manicure: "Маникюр", design: "Дизайн", beauty: "Beauty" };

  /* ---------- Шапка: тень + мобильное меню ---------- */
  var header = document.querySelector(".header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("mainNav");

  function onScroll() {
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
  }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Плавное появление при прокрутке ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var delay = en.target.getAttribute("data-reveal-delay");
          if (delay) en.target.style.transitionDelay = delay + "ms";
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Бесшовная лента с расчётом скорости ----------
     Структура: track > [half][half], половины полностью одинаковые,
     анимация translateX(0 → -50%) — стык незаметен, пауз и скачков нет.
     Скорость НЕ задана наугад: измеряем реальную ширину кадра
     (фото + отступ) и подбираем длительность так, чтобы каждый
     дизайн можно было спокойно рассмотреть ~2–3 секунды:
       duration = (ширина половины / шаг кадра) × SECONDS_PER_TILE.
     При любой ширине экрана половина дублируется столько раз,
     чтобы полностью перекрывать вьюпорт — пустых промежутков нет.
     Пересчёт выполняется при загрузке и изменении размера окна. */
  var SECONDS_PER_TILE = 2.5;

  function makeTile(w, hideFromAT) {
    var d = document.createElement("div");
    d.className = "work-tile";
    if (hideFromAT) d.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.src = w.src;
    img.alt = hideFromAT ? "" : (w.title + " — " + w.desc);
    img.loading = "lazy";
    img.width = 480; img.height = 500;
    img.decoding = "async";
    var meta = document.createElement("div");
    meta.className = "work-tile__meta";
    var tag = document.createElement("span");
    tag.className = "work-tile__tag";
    tag.textContent = CAT_LABEL[w.cat] || "Работа";
    var strong = document.createElement("strong");
    strong.textContent = w.title;
    var span = document.createElement("span");
    span.textContent = w.desc;
    meta.appendChild(tag); meta.appendChild(strong); meta.appendChild(span);
    d.appendChild(img); d.appendChild(meta);
    return d;
  }

  function tileStep(half) {
    var t = half.querySelector(".work-tile");
    if (!t) return 260;
    var mr = parseFloat(window.getComputedStyle(t).marginRight) || 0;
    return t.getBoundingClientRect().width + mr;
  }

  function buildMarquee(trackId, works) {
    var track = document.getElementById(trackId);
    if (!track || !works.length) return;
    track.innerHTML = "";
    track.style.animationDuration = "";

    // Одна половина: набор фото, при необходимости повторённый,
    // чтобы перекрыть вьюпорт с запасом (без пустых промежутков).
    var half = document.createElement("div");
    half.className = "marquee__half";
    works.forEach(function (w) { half.appendChild(makeTile(w, false)); });
    track.appendChild(half);

    var viewportW = track.parentElement ? track.parentElement.clientWidth : window.innerWidth;
    var setW = half.getBoundingClientRect().width;
    var repeats = setW > 0 ? Math.max(1, Math.ceil((viewportW * 1.25) / setW)) : 1;
    for (var r = 1; r < repeats; r++) {
      works.forEach(function (w) { half.appendChild(makeTile(w, true)); });
    }

    // Вторая половина — точная копия первой: цикл -50% бесшовный.
    var half2 = half.cloneNode(true);
    half2.setAttribute("aria-hidden", "true");
    var imgs = half2.querySelectorAll("img");
    for (var k = 0; k < imgs.length; k++) { imgs[k].alt = ""; }
    track.appendChild(half2);

    // Скорость из реальной геометрии: один кадр ≈ 2,5 секунды.
    var step = tileStep(half);
    var halfW = half.getBoundingClientRect().width;
    if (step > 0 && halfW > 0) {
      var tilesInHalf = halfW / step;
      track.style.animationDuration = (tilesInHalf * SECONDS_PER_TILE).toFixed(2) + "s";
    }
  }

  function buildAllMarquees() {
    buildMarquee("marqueeTrack1", WORKS_ROW_1);
    buildMarquee("marqueeTrack2", WORKS_ROW_2);
  }
  buildAllMarquees();
  window.addEventListener("load", buildAllMarquees);
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildAllMarquees, 250);
  });

  /* ---------- Галерея: сетка + фильтр + лайтбокс ---------- */
  var ALL_WORKS = WORKS_ROW_1.concat(WORKS_ROW_2);
  var grid = document.getElementById("galleryGrid");
  var visibleWorks = ALL_WORKS.slice();

  function buildGallery() {
    if (!grid) return;
    grid.innerHTML = "";
    ALL_WORKS.forEach(function (w, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "g-item";
      btn.dataset.cat = w.cat;
      btn.dataset.index = String(i);
      btn.setAttribute("aria-label", "Открыть: " + w.title);
      var img = document.createElement("img");
      img.src = w.src; img.alt = w.title + " — " + w.desc;
      img.loading = "lazy"; img.width = 600; img.height = 560;
      var cap = document.createElement("span");
      cap.className = "g-item__cap";
      cap.textContent = w.title;
      btn.appendChild(img); btn.appendChild(cap);
      btn.addEventListener("click", function () { openLightbox(i); });
      grid.appendChild(btn);
    });
  }
  buildGallery();

  document.querySelectorAll(".gallery__filters .chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".gallery__filters .chip").forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.dataset.filter;
      visibleWorks = [];
      grid.querySelectorAll(".g-item").forEach(function (item) {
        var show = (f === "all" || item.dataset.cat === f);
        item.classList.toggle("is-hidden", !show);
        if (show) visibleWorks.push(ALL_WORKS[Number(item.dataset.index)]);
      });
    });
  });

  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightboxImg");
  var lbCap = document.getElementById("lightboxCaption");
  var currentGlobal = 0;
  var lastFocus = null;

  function currentVisibleIndex(globalIdx) {
    var w = ALL_WORKS[globalIdx];
    var i = visibleWorks.indexOf(w);
    return i === -1 ? 0 : i;
  }
  function showAt(visibleIdx) {
    if (!visibleWorks.length) return;
    visibleIdx = (visibleIdx + visibleWorks.length) % visibleWorks.length;
    var w = visibleWorks[visibleIdx];
    currentGlobal = ALL_WORKS.indexOf(w);
    lbImg.src = w.src;
    lbImg.alt = w.title + " — " + w.desc;
    lbCap.textContent = (CAT_LABEL[w.cat] ? CAT_LABEL[w.cat] + " · " : "") + w.title + " — " + w.desc;
    lightbox.dataset.vis = String(visibleIdx);
  }
  function openLightbox(globalIdx) {
    if (!lightbox) return;
    lastFocus = document.activeElement;
    showAt(currentVisibleIndex(globalIdx));
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = lightbox.querySelector(".lightbox__btn--close");
    if (closeBtn) closeBtn.focus();
  }
  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    lbImg.src = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (lightbox) {
    document.getElementById("lightboxPrev").addEventListener("click", function () {
      showAt(Number(lightbox.dataset.vis || 0) - 1);
    });
    document.getElementById("lightboxNext").addEventListener("click", function () {
      showAt(Number(lightbox.dataset.vis || 0) + 1);
    });
    lightbox.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showAt(Number(lightbox.dataset.vis || 0) - 1);
      if (e.key === "ArrowRight") showAt(Number(lightbox.dataset.vis || 0) + 1);
    });
  }

  /* ---------- FAQ: аккордеон ---------- */
  document.querySelectorAll(".faq__item").forEach(function (item) {
    var btn = item.querySelector(".faq__q");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq__item.open").forEach(function (o) {
        o.classList.remove("open");
        var b = o.querySelector(".faq__q");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Копирование номера (кнопка «Скопировать» и кнопка MAX) ----------
     MAX не умеет открывать чат по ссылке с номером, поэтому кнопка
     копирует номер: посетитель вставляет его в поиск внутри MAX. */
  var copyBtn = document.getElementById("copyPhoneBtn");
  var copyHint = document.getElementById("copyHint");
  var maxBtn = document.getElementById("maxCopyBtn");
  var maxFooterBtns = document.querySelectorAll(".js-copy-max");

  function flashLabel(btn, html, ms) {
    if (btn.dataset.origHtml === undefined) btn.dataset.origHtml = btn.innerHTML;
    btn.innerHTML = html;
    if (btn._flashTimer) clearTimeout(btn._flashTimer);
    btn._flashTimer = setTimeout(function () {
      btn.innerHTML = btn.dataset.origHtml;
    }, ms);
  }

  function copyPhone(done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PHONE_DISPLAY).then(done, function () { fallbackCopy(done); });
    } else {
      fallbackCopy(done);
    }
  }

  function fallbackCopy(done) {
    try {
      var ta = document.createElement("textarea");
      ta.value = PHONE_DISPLAY;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    } catch (e) {
      if (copyHint) copyHint.textContent = "Не получилось скопировать автоматически: " + PHONE_DISPLAY;
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyPhone(function () {
        if (copyHint) copyHint.textContent = "Номер " + PHONE_DISPLAY + " скопирован — вставьте его в звонки или мессенджер.";
        flashLabel(copyBtn, "Номер скопирован ✓", 2500);
      });
    });
  }

  function maxCopyFeedback(btn) {
    copyPhone(function () {
      if (copyHint) {
        copyHint.textContent = "Номер " + PHONE_DISPLAY + " скопирован. Откройте MAX и вставьте номер в поиск — откроется чат со мной.";
      }
      flashLabel(btn, "Номер скопирован ✓", 3000);
    });
  }

  if (maxBtn) {
    maxBtn.addEventListener("click", function () { maxCopyFeedback(maxBtn); });
  }
  maxFooterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () { maxCopyFeedback(btn); });
  });

  /* ---------- Год в подвале ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
