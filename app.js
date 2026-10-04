"use strict";

/*
  ============================================================
  APP ENGINE
  هنا كل الحركة والتفاعل والتنقل.
  ============================================================
*/

(() => {

  const DATA = window.MALAK_CONTENT;
  const MEDIA = window.MALAK_MEDIA;

  /* ---------------------------------------------------------
     SAFETY
  --------------------------------------------------------- */

  if (!DATA) {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:grid;
        place-items:center;
        background:#070506;
        color:white;
        font-family:Cairo,Arial,sans-serif;
        padding:30px;
        text-align:center;
      ">
        <div>
          <h1 style="font-size:32px;margin-bottom:15px;">
            حصلت مشكلة في تحميل المحتوى
          </h1>
          <p style="color:#aaa;line-height:2;">
            تأكد إن ملف content.js موجود بجانب index.html
            وإن اسمه مكتوب بالضبط content.js
          </p>
        </div>
      </div>
    `;
    return;
  }

  /* ---------------------------------------------------------
     DOM
  --------------------------------------------------------- */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const body = document.body;

  const loader = $("#loader");
  const gate = $("#gate");
  const app = $("#app");

  const passwordForm = $("#passwordForm");
  const passwordInput = $("#passwordInput");
  const passwordEye = $("#passwordEye");
  const passwordError = $("#passwordError");

  const menuButton = $("#menuButton");
  const menuClose = $("#menuClose");
  const menuBackdrop = $("#menuBackdrop");
  const sideMenu = $("#sideMenu");

  const letterContent = $("#letterContent");

  const poemList = $("#poemList");
  const poemReader = $("#poemReader");

  const poemScene = $("#poemScene");
  const poemNumber = $("#poemNumber");
  const poemSceneTitle = $("#poemSceneTitle");
  const poemSceneText = $("#poemSceneText");
  const poemDescription = $("#poemDescription");
  const poemLines = $("#poemLines");

  const previousPoem = $("#previousPoem");
  const nextPoem = $("#nextPoem");

  const detailsList = $("#detailsList");

  const memoryNumber = $("#memoryNumber");
  const memoryTitle = $("#memoryTitle");
  const memoryDescription = $("#memoryDescription");

  const memoryPrev = $("#memoryPrev");
  const memoryNext = $("#memoryNext");

  const soundToggle = $("#soundToggle");
  const soundStatus = $("#soundStatus");
  const soundProgress = $("#soundProgress");

  const finalTitle = $("#finalTitle");
  const finalText = $("#finalText");

  const restartJourney = $("#restartJourney");

  const backgroundImage = $("#backgroundImage");

  let currentPoem = 0;
  let currentMemory = 0;
  let unlocked = false;

  let audio = null;
  let audioReady = false;

  /* ---------------------------------------------------------
     LOADER
  --------------------------------------------------------- */

  window.addEventListener("load", () => {

    setTimeout(() => {

      if (loader) {
        loader.classList.add("hidden");
      }

      if (passwordInput) {
        setTimeout(() => {
          passwordInput.focus();
        }, 350);
      }

    }, 1550);

  });

  /* ---------------------------------------------------------
     BACKGROUND
  --------------------------------------------------------- */

  function setBackground(url) {

    if (!backgroundImage || !url) {
      return;
    }

    backgroundImage.classList.remove("active");

    setTimeout(() => {

      backgroundImage.style.backgroundImage =
        `url("${url}")`;

      backgroundImage.classList.add("active");

    }, 100);

  }

  /* ---------------------------------------------------------
     PASSWORD
  --------------------------------------------------------- */

  function showError(message = "الكلمة دي مش هي المفتاح...") {

    if (!passwordError) return;

    passwordError.textContent = message;
    passwordError.classList.add("show");

    if (passwordInput) {
      passwordInput.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-7px)" },
          { transform: "translateX(7px)" },
          { transform: "translateX(0)" }
        ],
        {
          duration: 350
        }
      );
    }

  }

  function hideError() {

    if (!passwordError) return;

    passwordError.classList.remove("show");

  }

  function unlock() {

    if (unlocked) return;

    unlocked = true;

    body.classList.remove("locked");

    if (app) {
      app.classList.add("ready");
    }

    if (gate) {
      gate.classList.add("hide");
    }

    setBackground(
      MEDIA?.backgrounds?.home ||
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=2200&q=90"
    );

    setTimeout(() => {

      if (gate) {
        gate.style.display = "none";
      }

      window.scrollTo({
        top: 0,
        behavior: "instant"
      });

    }, 750);

  }

  if (passwordForm) {

    passwordForm.addEventListener("submit", (event) => {

      event.preventDefault();

      const entered =
        String(passwordInput?.value || "")
          .trim()
          .toLowerCase();

      /*
        كلمة السر ثابتة هنا + موجودة في content.js
        عشان مايحصلش تعارض بين الملفات.
      */

      const password =
        String(DATA.password || "love")
          .trim()
          .toLowerCase();

      if (entered === password) {

        hideError();
        unlock();

      } else {

        showError();

        if (passwordInput) {
          passwordInput.select();
        }

      }

    });

  }

  /* ---------------------------------------------------------
     PASSWORD EYE
  --------------------------------------------------------- */

  if (passwordEye && passwordInput) {

    passwordEye.addEventListener("click", () => {

      const isPassword =
        passwordInput.type === "password";

      passwordInput.type =
        isPassword ? "text" : "password";

      passwordEye.textContent =
        isPassword ? "◉" : "◎";

    });

  }

  /* ---------------------------------------------------------
     MENU
  --------------------------------------------------------- */

  function openMenu() {

    sideMenu?.classList.add("open");
    menuBackdrop?.classList.add("open");

  }

  function closeMenu() {

    sideMenu?.classList.remove("open");
    menuBackdrop?.classList.remove("open");

  }

  menuButton?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);
  menuBackdrop?.addEventListener("click", closeMenu);

  /* ---------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------- */

  function getElement(id) {

    return document.getElementById(id);

  }

  function goTo(id) {

    const element = getElement(id);

    if (!element) {
      return;
    }

    closeMenu();

    if (id === "poemReader") {
      poemReader?.classList.add("active");
    }

    const headerOffset = 68;

    const top =
      element.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top,
      behavior: "smooth"
    });

    setActiveMenu(id);

  }

  function setActiveMenu(id) {

    $$(".menu-link").forEach(button => {

      const target = button.dataset.go;

      button.classList.toggle(
        "active",
        target === id
      );

    });

  }

  $$("[data-go]").forEach(button => {

    button.addEventListener("click", () => {

      const target = button.dataset.go;

      if (target) {
        goTo(target);
      }

    });

  });

  /* ---------------------------------------------------------
     LETTER
  --------------------------------------------------------- */

  function renderLetter() {

    if (!letterContent) return;

    letterContent.innerHTML = "";

    const paragraphs = Array.isArray(DATA.letter)
      ? DATA.letter
      : [];

    paragraphs.forEach((paragraph, index) => {

      const p = document.createElement("p");

      p.className = "letter-paragraph";
      p.textContent = paragraph;

      p.dataset.index = index;

      letterContent.appendChild(p);

    });

  }

  renderLetter();

  /* ---------------------------------------------------------
     POEMS
  --------------------------------------------------------- */

  function renderPoemList() {

    if (!poemList) return;

    poemList.innerHTML = "";

    const poems =
      Array.isArray(DATA.poems)
        ? DATA.poems
        : [];

    poems.forEach((poem, index) => {

      const card = document.createElement("article");

      card.className = "poem-card reveal";

      card.innerHTML = `
        <div class="poem-number">
          ${escapeHTML(poem.number || String(index + 1).padStart(2, "0"))}
        </div>

        <h3 class="poem-card-title">
          ${escapeHTML(poem.title || "قصيدة")}
        </h3>

        <p class="poem-card-subtitle">
          ${escapeHTML(poem.subtitle || "")}
        </p>
      `;

      card.addEventListener("click", () => {

        currentPoem = index;

        renderPoem();

        poemReader?.classList.add("active");

        setTimeout(() => {
          goTo("poemReader");
        }, 20);

      });

      poemList.appendChild(card);

    });

  }

  function renderPoem() {

    const poems = DATA.poems || [];

    if (!poems.length) return;

    const poem = poems[currentPoem];

    if (!poem) return;

    if (poemNumber) {
      poemNumber.textContent =
        `القصيدة ${poem.number || String(currentPoem + 1).padStart(2, "0")}`;
    }

    if (poemSceneTitle) {
      poemSceneTitle.textContent =
        poem.sceneTitle || poem.title || "";
    }

    if (poemSceneText) {
      poemSceneText.textContent =
        poem.sceneText || "";
    }

    if (poemDescription) {
      poemDescription.textContent =
        poem.description || "";
    }

    if (poemScene && poem.background) {

      poemScene.style.backgroundImage =
        `url("${poem.background}")`;

    }

    if (poemLines) {

      poemLines.innerHTML = "";

      const lines =
        Array.isArray(poem.lines)
          ? poem.lines
          : Array.isArray(poem.verses)
            ? poem.verses
            : [];

      lines.forEach((line, index) => {

        const p = document.createElement("p");

        p.className = "poem-line";

        p.dataset.number =
          String(index + 1).padStart(2, "0");

        p.style.animationDelay =
          `${Math.min(index * 25, 700)}ms`;

        p.textContent = line;

        poemLines.appendChild(p);

      });

    }

    if (previousPoem) {
      previousPoem.disabled =
        currentPoem === 0;

      previousPoem.style.opacity =
        currentPoem === 0 ? ".45" : "1";
    }

    if (nextPoem) {
      nextPoem.disabled =
        currentPoem === poems.length - 1;

      nextPoem.style.opacity =
        currentPoem === poems.length - 1 ? ".45" : "1";
    }

    setBackground(
      poem.background ||
      MEDIA?.backgrounds?.poetry
    );

  }

  renderPoemList();

  if (previousPoem) {

    previousPoem.addEventListener("click", () => {

      if (currentPoem <= 0) return;

      currentPoem--;

      renderPoem();

      window.scrollTo({
        top:
          poemReader.offsetTop - 60,
        behavior: "smooth"
      });

    });

  }

  if (nextPoem) {

    nextPoem.addEventListener("click", () => {

      const poems = DATA.poems || [];

      if (currentPoem >= poems.length - 1) return;

      currentPoem++;

      renderPoem();

      window.scrollTo({
        top:
          poemReader.offsetTop - 60,
        behavior: "smooth"
      });

    });

  }

  /* ---------------------------------------------------------
     DETAILS
  --------------------------------------------------------- */

  function renderDetails() {

    if (!detailsList) return;

    detailsList.innerHTML = "";

    const details =
      Array.isArray(DATA.details)
        ? DATA.details
        : [];

    details.forEach((item, index) => {

      const row = document.createElement("article");

      row.className = "detail-row reveal";

      row.innerHTML = `
        <div class="detail-number">
          ${escapeHTML(item.number || String(index + 1).padStart(2, "0"))}
        </div>

        <div>
          <h3 class="detail-title">
            ${escapeHTML(item.title || "")}
          </h3>

          <p class="detail-text">
            ${escapeHTML(item.text || "")}
          </p>
        </div>
      `;

      detailsList.appendChild(row);

    });

  }

  renderDetails();

  /* ---------------------------------------------------------
     MEMORY / SCENES
  --------------------------------------------------------- */

  function renderMemory() {

    const memories =
      Array.isArray(DATA.memories)
        ? DATA.memories
        : [];

    if (!memories.length) return;

    const memory =
      memories[currentMemory];

    if (!memory) return;

    if (memoryNumber) {

      memoryNumber.textContent =
        `المشهد ${memory.number || String(currentMemory + 1).padStart(2, "0")}`;

    }

    if (memoryTitle) {

      memoryTitle.textContent =
        memory.title || "";

    }

    if (memoryDescription) {

      memoryDescription.textContent =
        memory.text ||
        memory.description ||
        "";

    }

    if (memory.background) {

      setBackground(memory.background);

    } else {

      setBackground(
        MEDIA?.backgrounds?.memory
      );

    }

  }

  renderMemory();

  memoryPrev?.addEventListener("click", () => {

    const memories = DATA.memories || [];

    if (!memories.length) return;

    currentMemory =
      (currentMemory - 1 + memories.length) %
      memories.length;

    renderMemory();

  });

  memoryNext?.addEventListener("click", () => {

    const memories = DATA.memories || [];

    if (!memories.length) return;

    currentMemory =
      (currentMemory + 1) %
      memories.length;

    renderMemory();

  });

  /* ---------------------------------------------------------
     FINAL
  --------------------------------------------------------- */

  function renderFinal() {

    const final = DATA.finalMessage;

    if (!final) return;

    if (finalTitle) {

      if (typeof final === "object") {

        finalTitle.textContent =
          final.title || "إلى مَلَك";

      } else {

        finalTitle.textContent =
          "إلى مَلَك";

      }

    }

    if (finalText) {

      finalText.innerHTML = "";

      const paragraphs =
        typeof final === "object" &&
        Array.isArray(final.text)
          ? final.text
          : typeof final === "string"
            ? [final]
            : [];

      paragraphs.forEach(text => {

        const p = document.createElement("p");

        p.style.marginBottom = "18px";
        p.textContent = text;

        finalText.appendChild(p);

      });

    }

  }

  renderFinal();

  /* ---------------------------------------------------------
     AUDIO
  --------------------------------------------------------- */

  function setupAudio() {

    const url =
      MEDIA?.audio?.url;

    if (!soundToggle || !url) {

      if (soundStatus) {
        soundStatus.textContent =
          "الصوت غير متوفر حاليًا.";
      }

      return;

    }

    audio = new Audio(url);

    audio.preload = "metadata";
    audio.loop = true;
    audio.volume = .38;

    audio.addEventListener("loadedmetadata", () => {

      audioReady = true;

    });

    audio.addEventListener("timeupdate", () => {

      if (!audio || !soundProgress) return;

      if (!audio.duration) return;

      const percentage =
        (audio.currentTime / audio.duration) * 100;

      soundProgress.style.width =
        `${percentage}%`;

    });

    audio.addEventListener("play", () => {

      if (soundToggle) {
        soundToggle.textContent = "Ⅱ";
      }

      if (soundStatus) {
        soundStatus.textContent =
          "الموسيقى شغالة... خليك مع الحكاية.";
      }

    });

    audio.addEventListener("pause", () => {

      if (soundToggle) {
        soundToggle.textContent = "▶";
      }

      if (soundStatus) {
        soundStatus.textContent =
          "الموسيقى متوقفة.";
      }

    });

    audio.addEventListener("error", () => {

      audioReady = false;

      if (soundStatus) {
        soundStatus.textContent =
          "تعذر تحميل الموسيقى الخارجية. باقي الموقع يعمل بشكل طبيعي.";
      }

    });

  }

  setupAudio();

  soundToggle?.addEventListener("click", async () => {

    if (!audio) return;

    try {

      if (audio.paused) {

        await audio.play();

      } else {

        audio.pause();

      }

    } catch (error) {

      if (soundStatus) {
        soundStatus.textContent =
          "اضغط الزر مرة أخرى لتشغيل الصوت.";
      }

    }

  });

  /* ---------------------------------------------------------
     RESTART
  --------------------------------------------------------- */

  restartJourney?.addEventListener("click", () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    currentPoem = 0;
    currentMemory = 0;

    renderPoem();
    renderMemory();

  });

  /* ---------------------------------------------------------
     REVEAL ANIMATIONS
  --------------------------------------------------------- */

  function setupRevealObserver() {

    const items =
      $$(".reveal");

    if (!("IntersectionObserver" in window)) {

      items.forEach(item => {
        item.classList.add("visible");
      });

      return;

    }

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add("visible");

              observer.unobserve(entry.target);

            }

          });

        },
        {
          threshold: .12
        }
      );

    items.forEach(item => {
      observer.observe(item);
    });

  }

  setupRevealObserver();

  /* ---------------------------------------------------------
     LETTER REVEAL
  --------------------------------------------------------- */

  function setupLetterObserver() {

    const paragraphs =
      $$(".letter-paragraph");

    if (!paragraphs.length) return;

    if (!("IntersectionObserver" in window)) {

      paragraphs.forEach(p => {
        p.classList.add("visible");
      });

      return;

    }

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add("visible");

              observer.unobserve(entry.target);

            }

          });

        },
        {
          threshold: .15
        }
      );

    paragraphs.forEach(p => {
      observer.observe(p);
    });

  }

  setupLetterObserver();

  /* ---------------------------------------------------------
     ACTIVE SECTION TRACKING
  --------------------------------------------------------- */

  function setupSectionTracking() {

    const ids = [
      "home",
      "letter",
      "poetryIntro",
      "diwan",
      "details",
      "memory",
      "sound",
      "final"
    ];

    const sections =
      ids
        .map(id => document.getElementById(id))
        .filter(Boolean);

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              setActiveMenu(entry.target.id);

              if (entry.target.id === "home") {

                setBackground(
                  MEDIA?.backgrounds?.home
                );

              }

              if (entry.target.id === "letter") {

                setBackground(
                  MEDIA?.backgrounds?.letter
                );

              }

              if (entry.target.id === "poetryIntro") {

                setBackground(
                  MEDIA?.backgrounds?.poetry
                );

              }

              if (entry.target.id === "details") {

                setBackground(
                  MEDIA?.backgrounds?.details
                );

              }

              if (entry.target.id === "memory") {

                renderMemory();

              }

              if (entry.target.id === "sound") {

                setBackground(
                  MEDIA?.backgrounds?.sound
                );

              }

              if (entry.target.id === "final") {

                setBackground(
                  MEDIA?.backgrounds?.final
                );

              }

            }

          });

        },
        {
          threshold: .35
        }
      );

    sections.forEach(section => {
      observer.observe(section);
    });

  }

  setupSectionTracking();

  /* ---------------------------------------------------------
     ESC KEY
  --------------------------------------------------------- */

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

      closeMenu();

    }

  });

  /* ---------------------------------------------------------
     KEYBOARD POEM NAVIGATION
  --------------------------------------------------------- */

  document.addEventListener("keydown", event => {

    if (!poemReader?.classList.contains("active")) {
      return;
    }

    if (event.key === "ArrowRight") {

      nextPoem?.click();

    }

    if (event.key === "ArrowLeft") {

      previousPoem?.click();

    }

  });

  /* ---------------------------------------------------------
     UTILITY
  --------------------------------------------------------- */

  function escapeHTML(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }

  /* ---------------------------------------------------------
     INITIAL BACKGROUND
  --------------------------------------------------------- */

  setBackground(
    MEDIA?.backgrounds?.home
  );

  /*
    نعرض أول قصيدة جاهزة من البداية
    عشان لو المستخدم دخل الديوان كل شيء يكون حاضر.
  */

  renderPoem();

})();
