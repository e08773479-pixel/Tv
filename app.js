"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const DATA = window.MALAK_CONTENT || {};
  const MEDIA = window.MALAK_MEDIA || {};

  const body = document.body;

  const gate = document.getElementById("gate");
  const app = document.getElementById("app");

  const passwordForm = document.getElementById("passwordForm");
  const passwordInput = document.getElementById("passwordInput");
  const passwordEye = document.getElementById("passwordEye");
  const passwordError = document.getElementById("passwordError");

  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const closeMenu = document.getElementById("closeMenu");
  const menuOverlay = document.getElementById("menuOverlay");

  const letterBody = document.getElementById("letterBody");

  const poem = document.getElementById("poem");
  const poemCounter = document.getElementById("poemCounter");
  const prevPoem = document.getElementById("prevPoem");
  const nextPoem = document.getElementById("nextPoem");

  const diwanList = document.getElementById("diwanList");

  const detailsGrid = document.getElementById("detailsGrid");

  const memoryImage = document.getElementById("memoryImage");
  const memoryPhoto = document.getElementById("memoryPhoto");
  const memoryDate = document.getElementById("memoryDate");
  const memoryTitle = document.getElementById("memoryTitle");
  const memoryDescription = document.getElementById("memoryDescription");
  const memoryCounter = document.getElementById("memoryCounter");

  const prevMemory = document.getElementById("prevMemory");
  const nextMemory = document.getElementById("nextMemory");

  const playMusic = document.getElementById("playMusic");
  const musicStatus = document.getElementById("musicStatus");

  const soundButton = document.getElementById("soundButton");
  const soundText = document.getElementById("soundText");

  const revealFinal = document.getElementById("revealFinal");
  const finalMessage = document.getElementById("finalMessage");
  const finalMessageText = document.getElementById("finalMessageText");


  /*
  ==========================================================
  SAFETY
  ==========================================================
  */

  if (!window.MALAK_CONTENT) {
    console.error("MALAK_CONTENT غير موجود. تأكد أن content.js يعمل قبل app.js.");
    return;
  }


  /*
  ==========================================================
  STARS
  ==========================================================
  */

  function createStars() {

    const container = document.getElementById("stars");

    if (!container) return;

    const count =
      window.innerWidth < 600
        ? 35
        : window.innerWidth < 1000
          ? 55
          : 80;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {

      const star = document.createElement("span");

      star.className = "star";

      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      star.style.setProperty(
        "--time",
        `${2 + Math.random() * 5}s`
      );

      star.style.animationDelay =
        `${Math.random() * 5}s`;

      fragment.appendChild(star);
    }

    container.appendChild(fragment);
  }

  createStars();


  /*
  ==========================================================
  PASSWORD
  ==========================================================
  */

  function showPasswordError() {

    if (passwordError) {
      passwordError.classList.add("show");
      passwordError.textContent =
        "كلمة السر غير صحيحة.";
    }

    if (passwordInput) {

      passwordInput.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-8px)" },
          { transform: "translateX(8px)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(0)" }
        ],
        {
          duration: 350
        }
      );

      passwordInput.focus();
      passwordInput.select();
    }
  }


  function hidePasswordError() {

    if (passwordError) {
      passwordError.classList.remove("show");
    }

  }


  function unlock() {

    if (body) {
      body.classList.remove("locked");
    }

    if (gate) {
      gate.classList.add("hide");
    }

    if (app) {
      app.classList.add("ready");
    }

    /*
      نخلي الصفحة تتحرك للأعلى بعد فتحها
      عشان ما تفضلش واقفة في مكان شاشة الدخول.
    */

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });

    setTimeout(() => {

      if (gate && gate.parentNode) {
        gate.remove();
      }

      revealLetter();

    }, 900);
  }


  function checkPassword() {

    if (!passwordInput) {
      console.error(
        "passwordInput غير موجود في index.html."
      );
      return;
    }

    const entered =
      passwordInput.value.trim();

    const correctPassword =
      String(DATA.password || "malak").trim();

    /*
      كلمة السر الأساسية:
      malak
    */

    if (entered.toLowerCase() === correctPassword.toLowerCase()) {

      hidePasswordError();

      unlock();

      return true;
    }

    showPasswordError();

    return false;
  }


  if (passwordForm) {

    passwordForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        checkPassword();

      }
    );

  } else {

    console.warn(
      "passwordForm غير موجود. تأكد من id=\"passwordForm\"."
    );

  }


  /*
  ==========================================================
  PASSWORD EYE
  ==========================================================
  */

  if (passwordEye && passwordInput) {

    passwordEye.addEventListener(
      "click",
      event => {

        event.preventDefault();

        const isPassword =
          passwordInput.type === "password";

        passwordInput.type =
          isPassword
            ? "text"
            : "password";

        passwordEye.textContent =
          isPassword
            ? "◌"
            : "◉";

      }
    );

  }


  /*
  ==========================================================
  NAVIGATION
  ==========================================================
  */

  function openMenu() {

    if (menu) {
      menu.classList.add("open");
    }

    if (menuOverlay) {
      menuOverlay.classList.add("open");
    }

  }


  function closeMenuPanel() {

    if (menu) {
      menu.classList.remove("open");
    }

    if (menuOverlay) {
      menuOverlay.classList.remove("open");
    }

  }


  if (menuButton) {
    menuButton.addEventListener(
      "click",
      openMenu
    );
  }


  if (closeMenu) {
    closeMenu.addEventListener(
      "click",
      closeMenuPanel
    );
  }


  if (menuOverlay) {
    menuOverlay.addEventListener(
      "click",
      closeMenuPanel
    );
  }


  document
    .querySelectorAll("[data-go]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.go;

          const target =
            document.getElementById(id);

          closeMenuPanel();

          if (!target) return;

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }
      );

    });


  /*
  ==========================================================
  LETTER
  ==========================================================
  */

  function renderLetter() {

    if (!letterBody) return;

    letterBody.innerHTML = "";

    const letter =
      Array.isArray(DATA.letter)
        ? DATA.letter
        : [];

    letter.forEach(
      (text, index) => {

        const paragraph =
          document.createElement("p");

        paragraph.className =
          "letter__paragraph";

        paragraph.textContent =
          text;

        paragraph.dataset.index =
          index;

        letterBody.appendChild(
          paragraph
        );

      }
    );

  }


  function revealLetter() {

    if (!letterBody) return;

    const paragraphs =
      letterBody.querySelectorAll(
        ".letter__paragraph"
      );

    paragraphs.forEach(
      (paragraph, index) => {

        setTimeout(
          () => {

            paragraph.classList.add(
              "visible"
            );

          },
          index * 180
        );

      }
    );

  }

  renderLetter();


  /*
  ==========================================================
  POETRY
  ==========================================================
  */

  let currentPoem = 0;

  function getPoemLines(item) {

    if (!item) return [];

    if (Array.isArray(item.lines)) {
      return item.lines;
    }

    if (Array.isArray(item.verses)) {
      return item.verses;
    }

    return [];

  }


  function renderPoem() {

    if (!poem) return;

    const poems =
      Array.isArray(DATA.poems)
        ? DATA.poems
        : [];

    if (!poems.length) {

      poem.innerHTML =
        "<p>الديوان لسه بيتكتب.</p>";

      return;
    }

    const item =
      poems[currentPoem];

    poem.classList.add("fade");

    setTimeout(() => {

      const lines =
        getPoemLines(item)
          .map(line => {

            if (!line) {
              return "<br>";
            }

            return `
              <span class="poem__line">
                ${escapeHTML(line)}
              </span>
            `;

          })
          .join("");

      poem.innerHTML = `

        <div>

          <div class="poem__title">
            ${escapeHTML(item.title || "")}
          </div>

          ${
            item.subtitle
              ? `
                <div class="poem__subtitle">
                  ${escapeHTML(item.subtitle)}
                </div>
              `
              : ""
          }

          <div class="poem__lines">
            ${lines}
          </div>

        </div>

      `;

      if (poemCounter) {

        poemCounter.textContent =
          `${String(currentPoem + 1).padStart(2, "0")}
           /
           ${String(poems.length).padStart(2, "0")}`;

      }

      poem.classList.remove("fade");

    }, 180);

  }


  function changePoem(direction) {

    const poems =
      Array.isArray(DATA.poems)
        ? DATA.poems
        : [];

    if (!poems.length) return;

    currentPoem += direction;

    if (currentPoem < 0) {
      currentPoem =
        poems.length - 1;
    }

    if (currentPoem >= poems.length) {
      currentPoem = 0;
    }

    renderPoem();

  }


  if (prevPoem) {

    prevPoem.addEventListener(
      "click",
      () => changePoem(-1)
    );

  }


  if (nextPoem) {

    nextPoem.addEventListener(
      "click",
      () => changePoem(1)
    );

  }


  renderPoem();


  /*
  ==========================================================
  DIWAN
  ==========================================================
  */

  function renderDiwan() {

    if (!diwanList) return;

    diwanList.innerHTML = "";

    const diwan =
      Array.isArray(DATA.diwan)
        ? DATA.diwan
        : [];

    diwan.forEach(
      item => {

        const button =
          document.createElement("button");

        button.className =
          "diwan-item";

        button.innerHTML = `

          <div>

            <div class="diwan-item__meta">
              ${escapeHTML(item.number || "")}
            </div>

            <div class="diwan-item__name">
              ${escapeHTML(item.title || "")}
            </div>

          </div>

          <div class="diwan-item__meta">
            ${escapeHTML(item.description || "")}
          </div>

        `;

        button.addEventListener(
          "click",
          () => {

            const index =
              DATA.poems.findIndex(
                poemItem =>
                  poemItem.id === item.id ||
                  poemItem.title === item.title
              );

            if (index >= 0) {

              currentPoem = index;

              renderPoem();

              const poetrySection =
                document.getElementById("poetry");

              if (poetrySection) {

                poetrySection.scrollIntoView({
                  behavior: "smooth"
                });

              }

            }

          }
        );

        diwanList.appendChild(
          button
        );

      }
    );

  }

  renderDiwan();


  /*
  ==========================================================
  DETAILS
  ==========================================================
  */

  function renderDetails() {

    if (!detailsGrid) return;

    detailsGrid.innerHTML = "";

    const details =
      Array.isArray(DATA.details)
        ? DATA.details
        : [];

    details.forEach(
      (item, index) => {

        const article =
          document.createElement("article");

        article.className =
          "detail";

        article.innerHTML = `

          <span class="detail__number">
            ${escapeHTML(
              item.number ||
              String(index + 1).padStart(2, "0")
            )}
          </span>

          <div>

            <h3>
              ${escapeHTML(item.title || "")}
            </h3>

            <p>
              ${escapeHTML(item.text || "")}
            </p>

          </div>

        `;

        detailsGrid.appendChild(
          article
        );

      }
    );

  }

  renderDetails();


  /*
  ==========================================================
  MEMORY
  ==========================================================
  */

  let currentMemory = 0;

  function renderMemory() {

    const memories =
      Array.isArray(DATA.memories)
        ? DATA.memories
        : [];

    if (!memories.length) return;

    if (!memoryPhoto) return;

    const item =
      memories[currentMemory];

    if (memoryImage) {
      memoryImage.classList.add(
        "changing"
      );
    }

    setTimeout(
      () => {

        if (item.image) {
          memoryPhoto.src =
            item.image;
        }

        if (memoryDate) {
          memoryDate.textContent =
            item.date || "";
        }

        if (memoryTitle) {
          memoryTitle.textContent =
            item.title || "";
        }

        if (memoryDescription) {
          memoryDescription.textContent =
            item.description || item.text || "";
        }

        if (memoryCounter) {
          memoryCounter.textContent =
            String(currentMemory + 1)
              .padStart(2, "0");
        }

        memoryPhoto.onload = () => {

          if (memoryImage) {
            memoryImage.classList.remove(
              "changing"
            );
          }

        };

        /*
          لو مفيش صورة أصلًا، ما نستناش onload.
        */

        if (!item.image && memoryImage) {

          memoryImage.classList.remove(
            "changing"
          );

        }

      },
      180
    );

  }


  function changeMemory(direction) {

    const memories =
      Array.isArray(DATA.memories)
        ? DATA.memories
        : [];

    if (!memories.length) return;

    currentMemory += direction;

    if (currentMemory < 0) {
      currentMemory =
        memories.length - 1;
    }

    if (currentMemory >= memories.length) {
      currentMemory = 0;
    }

    renderMemory();

  }


  if (prevMemory) {

    prevMemory.addEventListener(
      "click",
      () => changeMemory(-1)
    );

  }


  if (nextMemory) {

    nextMemory.addEventListener(
      "click",
      () => changeMemory(1)
    );

  }


  renderMemory();


  /*
  ==========================================================
  MUSIC
  ==========================================================
  */

  let audio = null;
  let musicPlaying = false;

  if (MEDIA && MEDIA.music) {

    audio =
      new Audio(MEDIA.music);

    audio.loop = true;
    audio.preload = "none";

  }


  function toggleMusic() {

    if (!audio) {

      if (musicStatus) {
        musicStatus.textContent =
          "الموسيقى غير مضافة حاليًا.";
      }

      return;

    }

    if (!musicPlaying) {

      audio.play()
        .then(() => {

          musicPlaying = true;

          if (playMusic) {
            playMusic.textContent = "Ⅱ";
          }

          if (musicStatus) {
            musicStatus.textContent =
              "يعمل الآن";
          }

          if (soundButton) {
            soundButton.classList.add(
              "active"
            );
          }

          if (soundText) {
            soundText.textContent =
              "يعمل";
          }

        })
        .catch(() => {

          if (musicStatus) {
            musicStatus.textContent =
              "اضغطي مرة أخرى للتشغيل";
          }

        });

    } else {

      audio.pause();

      musicPlaying = false;

      if (playMusic) {
        playMusic.textContent = "▶";
      }

      if (musicStatus) {
        musicStatus.textContent =
          "متوقف";
      }

      if (soundButton) {
        soundButton.classList.remove(
          "active"
        );
      }

      if (soundText) {
        soundText.textContent =
          "صامت";
      }

    }

  }


  if (playMusic) {

    playMusic.addEventListener(
      "click",
      toggleMusic
    );

  }


  if (soundButton) {

    soundButton.addEventListener(
      "click",
      toggleMusic
    );

  }


  /*
  ==========================================================
  FINAL MESSAGE
  ==========================================================
  */

  function renderFinalMessage() {

    if (!finalMessageText) return;

    const message =
      DATA.finalMessage;

    /*
      النسخة الجديدة من content.js
      تستخدم:
      finalMessage: {
        title,
        text: [...]
      }
    */

    if (
      message &&
      typeof message === "object" &&
      !Array.isArray(message)
    ) {

      if (finalMessage) {

        const titleElement =
          finalMessage.querySelector(
            "[data-final-title]"
          );

        if (titleElement && message.title) {
          titleElement.textContent =
            message.title;
        }

      }

      if (Array.isArray(message.text)) {

        finalMessageText.innerHTML =
          message.text
            .map(
              line =>
                `<p>${escapeHTML(line)}</p>`
            )
            .join("");

      } else {

        finalMessageText.textContent =
          message.text || "";

      }

      return;
    }

    finalMessageText.textContent =
      message || "";

  }


  renderFinalMessage();


  if (revealFinal) {

    revealFinal.addEventListener(
      "click",
      () => {

        revealFinal.style.display =
          "none";

        if (finalMessage) {

          finalMessage.classList.add(
            "show"
          );

        }

      }
    );

  }


  /*
  ==========================================================
  OBSERVER
  ==========================================================
  */

  if ("IntersectionObserver" in window) {

    const observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(
            entry => {

              if (!entry.isIntersecting) {
                return;
              }

              if (
                entry.target.id ===
                "letter"
              ) {

                revealLetter();

              }

            }
          );

        },
        {
          threshold: 0.18
        }
      );


    document
      .querySelectorAll(".section")
      .forEach(section => {

        observer.observe(section);

      });

  }


  /*
  ==========================================================
  KEYBOARD
  ==========================================================
  */

  document.addEventListener(
    "keydown",
    event => {

      /*
        Enter في خانة كلمة السر
        يتعامل معه الفورم أصلًا.
      */

      if (event.key === "Escape") {
        closeMenuPanel();
      }

      if (
        event.key === "ArrowRight" &&
        document.activeElement === document.body
      ) {

        changePoem(1);

      }

      if (
        event.key === "ArrowLeft" &&
        document.activeElement === document.body
      ) {

        changePoem(-1);

      }

    }
  );


  /*
  ==========================================================
  ESCAPE HTML
  ==========================================================
  */

  function escapeHTML(value) {

    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /*
  ==========================================================
  MEDIA PRELOAD
  ==========================================================
  */

  if (
    MEDIA &&
    typeof MEDIA.preload === "function"
  ) {

    try {
      MEDIA.preload();
    } catch (error) {
      console.warn(
        "تعذر تحميل الوسائط:",
        error
      );
    }

  }

});
