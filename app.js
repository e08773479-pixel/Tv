"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const DATA = window.MALAK_CONTENT;
  const MEDIA = window.MALAK_MEDIA;

  if (!DATA) {
    console.error("MALAK_CONTENT غير موجود.");
    return;
  }

  /*
  ==========================================================
  ELEMENTS
  ==========================================================
  */

  const body =
    document.body;

  const gate =
    document.getElementById("gate");

  const app =
    document.getElementById("app");

  const passwordForm =
    document.getElementById("passwordForm");

  const passwordInput =
    document.getElementById("passwordInput");

  const passwordEye =
    document.getElementById("passwordEye");

  const passwordError =
    document.getElementById("passwordError");

  const menu =
    document.getElementById("menu");

  const menuButton =
    document.getElementById("menuButton");

  const closeMenu =
    document.getElementById("closeMenu");

  const menuOverlay =
    document.getElementById("menuOverlay");

  const letterBody =
    document.getElementById("letterBody");

  const poem =
    document.getElementById("poem");

  const poemCounter =
    document.getElementById("poemCounter");

  const prevPoem =
    document.getElementById("prevPoem");

  const nextPoem =
    document.getElementById("nextPoem");

  const diwanList =
    document.getElementById("diwanList");

  const detailsGrid =
    document.getElementById("detailsGrid");

  const memoryImage =
    document.getElementById("memoryImage");

  const memoryPhoto =
    document.getElementById("memoryPhoto");

  const memoryDate =
    document.getElementById("memoryDate");

  const memoryTitle =
    document.getElementById("memoryTitle");

  const memoryDescription =
    document.getElementById("memoryDescription");

  const memoryCounter =
    document.getElementById("memoryCounter");

  const prevMemory =
    document.getElementById("prevMemory");

  const nextMemory =
    document.getElementById("nextMemory");

  const playMusic =
    document.getElementById("playMusic");

  const musicStatus =
    document.getElementById("musicStatus");

  const soundButton =
    document.getElementById("soundButton");

  const soundText =
    document.getElementById("soundText");

  const revealFinal =
    document.getElementById("revealFinal");

  const finalMessage =
    document.getElementById("finalMessage");

  const finalMessageText =
    document.getElementById("finalMessageText");


  /*
  ==========================================================
  STARS
  ==========================================================
  */

  function createStars() {

    const container =
      document.getElementById("stars");

    if (!container) return;

    const count =
      window.innerWidth < 600
        ? 35
        : window.innerWidth < 1000
          ? 55
          : 80;

    const fragment =
      document.createDocumentFragment();

    for (let i = 0; i < count; i++) {

      const star =
        document.createElement("span");

      star.className = "star";

      star.style.left =
        `${Math.random() * 100}%`;

      star.style.top =
        `${Math.random() * 100}%`;

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

  passwordEye.addEventListener(
    "click",
    () => {

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


  passwordForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const entered =
        passwordInput.value.trim();

      if (entered === DATA.password) {

        passwordError.classList.remove("show");

        unlock();

      } else {

        passwordError.classList.add("show");

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

      }

    }
  );


  function unlock() {

    body.classList.remove("locked");

    gate.classList.add("hide");

    app.classList.add("ready");

    setTimeout(() => {

      gate.remove();

      revealLetter();

    }, 1100);

  }


  /*
  ==========================================================
  NAVIGATION
  ==========================================================
  */

  function openMenu() {

    menu.classList.add("open");
    menuOverlay.classList.add("open");

  }

  function closeMenuPanel() {

    menu.classList.remove("open");
    menuOverlay.classList.remove("open");

  }

  menuButton.addEventListener(
    "click",
    openMenu
  );

  closeMenu.addEventListener(
    "click",
    closeMenuPanel
  );

  menuOverlay.addEventListener(
    "click",
    closeMenuPanel
  );


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

    letterBody.innerHTML = "";

    DATA.letter.forEach(
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
          index * 220
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

  function renderPoem() {

    if (!DATA.poems.length) {

      poem.innerHTML =
        "<p>الديوان لسه بيتكتب.</p>";

      return;

    }

    const item =
      DATA.poems[currentPoem];

    poem.classList.add("fade");

    setTimeout(() => {

      const lines =
        item.lines
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
            ${escapeHTML(item.title)}
          </div>

          <div class="poem__lines">
            ${lines}
          </div>

        </div>

      `;

      poemCounter.textContent =
        `${String(currentPoem + 1).padStart(2,"0")}
         / 
         ${String(DATA.poems.length).padStart(2,"0")}`;

      poem.classList.remove("fade");

    }, 180);

  }


  function changePoem(direction) {

    currentPoem += direction;

    if (currentPoem < 0) {
      currentPoem =
        DATA.poems.length - 1;
    }

    if (currentPoem >= DATA.poems.length) {
      currentPoem = 0;
    }

    renderPoem();

  }


  prevPoem.addEventListener(
    "click",
    () => changePoem(-1)
  );

  nextPoem.addEventListener(
    "click",
    () => changePoem(1)
  );

  renderPoem();


  /*
  ==========================================================
  DIWAN
  ==========================================================
  */

  function renderDiwan() {

    diwanList.innerHTML = "";

    DATA.diwan.forEach(
      item => {

        const button =
          document.createElement("button");

        button.className =
          "diwan-item";

        button.innerHTML = `

          <div>

            <div class="diwan-item__meta">
              ${escapeHTML(item.number)}
            </div>

            <div class="diwan-item__name">
              ${escapeHTML(item.title)}
            </div>

          </div>

          <div class="diwan-item__meta">
            ${escapeHTML(item.description)}
          </div>

        `;

        button.addEventListener(
          "click",
          () => {

            const index =
              DATA.poems.findIndex(
                poemItem =>
                  poemItem.title
                    .includes(item.title)
              );

            if (index >= 0) {

              currentPoem = index;

              renderPoem();

              document
                .getElementById("poetry")
                .scrollIntoView({
                  behavior: "smooth"
                });

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

    detailsGrid.innerHTML = "";

    DATA.details.forEach(
      item => {

        const article =
          document.createElement("article");

        article.className =
          "detail";

        article.innerHTML = `

          <span class="detail__number">
            ${escapeHTML(item.number)}
          </span>

          <div>

            <h3>
              ${escapeHTML(item.title)}
            </h3>

            <p>
              ${escapeHTML(item.text)}
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

    if (!DATA.memories.length) {
      return;
    }

    const item =
      DATA.memories[currentMemory];

    memoryImage.classList.add(
      "changing"
    );

    setTimeout(
      () => {

        memoryPhoto.src =
          item.image;

        memoryDate.textContent =
          item.date;

        memoryTitle.textContent =
          item.title;

        memoryDescription.textContent =
          item.description;

        memoryCounter.textContent =
          String(currentMemory + 1)
            .padStart(2,"0");

        memoryPhoto.onload =
          () => {

            memoryImage.classList.remove(
              "changing"
            );

          };

      },
      250
    );

  }


  function changeMemory(direction) {

    currentMemory += direction;

    if (currentMemory < 0) {
      currentMemory =
        DATA.memories.length - 1;
    }

    if (
      currentMemory >=
      DATA.memories.length
    ) {
      currentMemory = 0;
    }

    renderMemory();

  }


  prevMemory.addEventListener(
    "click",
    () => changeMemory(-1)
  );

  nextMemory.addEventListener(
    "click",
    () => changeMemory(1)
  );

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

      musicStatus.textContent =
        "أضف ملف الموسيقى في media.js";

      return;

    }

    if (!musicPlaying) {

      audio.play()
        .then(() => {

          musicPlaying = true;

          playMusic.textContent =
            "Ⅱ";

          musicStatus.textContent =
            "يعمل الآن";

          soundButton.classList.add(
            "active"
          );

          soundText.textContent =
            "يعمل";

        })
        .catch(() => {

          musicStatus.textContent =
            "اضغطي مرة أخرى للتشغيل";

        });

    } else {

      audio.pause();

      musicPlaying = false;

      playMusic.textContent =
        "▶";

      musicStatus.textContent =
        "متوقف";

      soundButton.classList.remove(
        "active"
      );

      soundText.textContent =
        "صامت";

    }

  }


  playMusic.addEventListener(
    "click",
    toggleMusic
  );

  soundButton.addEventListener(
    "click",
    toggleMusic
  );


  /*
  ==========================================================
  FINAL MESSAGE
  ==========================================================
  */

  finalMessageText.textContent =
    DATA.finalMessage;


  revealFinal.addEventListener(
    "click",
    () => {

      revealFinal.style.display =
        "none";

      finalMessage.classList.add(
        "show"
      );

    }
  );


  /*
  ==========================================================
  LAZY / OBSERVATION
  ==========================================================
  */

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
        threshold: .18
      }
    );


  document
    .querySelectorAll(".section")
    .forEach(section => {

      observer.observe(section);

    });


  /*
  ==========================================================
  KEYBOARD
  ==========================================================
  */

  document.addEventListener(
    "keydown",
    event => {

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

    return String(value)
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

    MEDIA.preload();

  }

});
