"use strict";

document.addEventListener("DOMContentLoaded", function () {

  const DATA = window.MALAK_CONTENT || {};
  const MEDIA = window.MALAK_MEDIA || {};

  const $ = (id) => document.getElementById(id);

  const body = document.body;

  const app = $("app");

  const menu = $("menu");
  const menuButton = $("menuButton");
  const closeMenu = $("closeMenu");
  const menuOverlay = $("menuOverlay");

  const letterBody = $("letterBody");

  const poem = $("poem");
  const poemCounter = $("poemCounter");
  const prevPoem = $("prevPoem");
  const nextPoem = $("nextPoem");

  const diwanList = $("diwanList");

  const detailsGrid = $("detailsGrid");

  const memoryImage = $("memoryImage");
  const memoryPhoto = $("memoryPhoto");
  const memoryDate = $("memoryDate");
  const memoryTitle = $("memoryTitle");
  const memoryDescription = $("memoryDescription");
  const memoryCounter = $("memoryCounter");
  const prevMemory = $("prevMemory");
  const nextMemory = $("nextMemory");

  const playMusic = $("playMusic");
  const musicStatus = $("musicStatus");

  const soundButton = $("soundButton");
  const soundText = $("soundText");

  const revealFinal = $("revealFinal");
  const finalMessage = $("finalMessage");
  const finalMessageText = $("finalMessageText");


  /* =====================================================
     STARS
     ===================================================== */

  function createStars() {

    const stars = $("stars");

    if (!stars) return;

    stars.innerHTML = "";

    for (let i = 0; i < 70; i++) {

      const star =
        document.createElement("span");

      star.className = "star";

      star.style.left =
        Math.random() * 100 + "%";

      star.style.top =
        Math.random() * 100 + "%";

      star.style.setProperty(
        "--time",
        (2 + Math.random() * 4) + "s"
      );

      star.style.animationDelay =
        (Math.random() * 4) + "s";

      stars.appendChild(star);

    }

  }

  createStars();


  /* =====================================================
     ESCAPE HTML
     ===================================================== */

  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  /* =====================================================
     MENU
     ===================================================== */

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
    .forEach(function(button){

      button.addEventListener(
        "click",
        function(){

          const target =
            button.getAttribute("data-go");

          const section =
            document.getElementById(target);

          if (!section) return;

          closeMenuPanel();

          section.scrollIntoView({
            behavior:"smooth",
            block:"start"
          });

        }
      );

    });


  /* =====================================================
     LETTER
     ===================================================== */

  function renderLetter() {

    if (!letterBody) return;

    const letter =
      Array.isArray(DATA.letter)
        ? DATA.letter
        : [];

    letterBody.innerHTML = "";

    letter.forEach(function(text, index){

      const p =
        document.createElement("p");

      p.className =
        "letter__paragraph";

      p.textContent =
        text;

      letterBody.appendChild(p);

      setTimeout(
        function(){
          p.classList.add("visible");
        },
        150 + index * 220
      );

    });

  }

  renderLetter();


  /* =====================================================
     POEMS
     ===================================================== */

  const poems =
    Array.isArray(DATA.poems)
      ? DATA.poems
      : [];

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

    if (!poems.length) {

      poem.innerHTML =
        "<p>الديوان لسه بيتكتب.</p>";

      return;

    }


    if (currentPoem < 0) {
      currentPoem = poems.length - 1;
    }

    if (currentPoem >= poems.length) {
      currentPoem = 0;
    }


    const item =
      poems[currentPoem];

    const lines =
      getPoemLines(item);


    poem.classList.add("fade");


    setTimeout(
      function(){

        const renderedLines =
          lines.map(function(line){

            if (!line) {
              return "<br>";
            }

            return `
              <span class="poem__line">
                ${escapeHTML(line)}
              </span>
            `;

          }).join("");


        poem.innerHTML = `

          <div>

            <div class="poem__title">
              ${escapeHTML(
                item.title || "قصيدة"
              )}
            </div>

            <div class="poem__lines">
              ${renderedLines}
            </div>

          </div>

        `;


        if (poemCounter) {

          poemCounter.textContent =
            `${String(currentPoem + 1).padStart(2,"0")} / ${String(poems.length).padStart(2,"0")}`;

        }


        poem.classList.remove("fade");

      },
      180
    );

  }


  if (prevPoem) {

    prevPoem.addEventListener(
      "click",
      function(){

        currentPoem--;

        renderPoem();

      }
    );

  }


  if (nextPoem) {

    nextPoem.addEventListener(
      "click",
      function(){

        currentPoem++;

        renderPoem();

      }
    );

  }


  renderPoem();


  /* =====================================================
     DIWAN
     ===================================================== */

  function renderDiwan() {

    if (!diwanList) return;

    const source =
      Array.isArray(DATA.diwan)
        ? DATA.diwan
        : poems;

    diwanList.innerHTML = "";


    source.forEach(
      function(item,index){

        const button =
          document.createElement("button");

        button.className =
          "diwan-item";


        button.innerHTML = `

          <span>

            <span class="diwan-item__meta">
              ${String(index + 1).padStart(2,"0")}
            </span>

            <br>

            <span class="diwan-item__name">
              ${escapeHTML(
                item.title || "قصيدة"
              )}
            </span>

          </span>

          <span>
            ↗
          </span>

        `;


        button.addEventListener(
          "click",
          function(){

            currentPoem = index;

            renderPoem();

            const poetry =
              document.getElementById(
                "poetry"
              );

            if (poetry) {

              poetry.scrollIntoView({
                behavior:"smooth"
              });

            }

          }
        );


        diwanList.appendChild(button);

      }
    );

  }

  renderDiwan();


  /* =====================================================
     DETAILS
     ===================================================== */

  function renderDetails() {

    if (!detailsGrid) return;

    const details =
      Array.isArray(DATA.details)
        ? DATA.details
        : [];

    detailsGrid.innerHTML = "";


    details.forEach(
      function(item,index){

        const article =
          document.createElement("article");

        article.className =
          "detail";


        article.innerHTML = `

          <span class="detail__number">
            ${String(index + 1).padStart(2,"0")}
          </span>

          <div>

            <h3>
              ${escapeHTML(
                item.title || ""
              )}
            </h3>

            <p>
              ${escapeHTML(
                item.text ||
                item.description ||
                ""
              )}
            </p>

          </div>

        `;


        detailsGrid.appendChild(article);

      }
    );

  }

  renderDetails();


  /* =====================================================
     MEMORY
     ===================================================== */

  const memories =
    Array.isArray(DATA.memories)
      ? DATA.memories
      : [];

  let currentMemory = 0;


  function renderMemory() {

    if (!memories.length) {

      if (memoryTitle) {
        memoryTitle.textContent =
          "حاجات لسه هتتكتب";
      }

      if (memoryDescription) {
        memoryDescription.textContent =
          "كل حاجة جميلة ليها وقتها.";
      }

      return;

    }


    if (currentMemory < 0) {
      currentMemory =
        memories.length - 1;
    }

    if (currentMemory >= memories.length) {
      currentMemory = 0;
    }


    const item =
      memories[currentMemory];


    if (memoryImage) {
      memoryImage.classList.add("changing");
    }


    setTimeout(
      function(){

        if (memoryPhoto) {

          memoryPhoto.src =
            item.image ||
            item.background ||
            "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1600&q=85";

        }


        if (memoryDate) {

          memoryDate.textContent =
            item.date ||
            String(
              currentMemory + 1
            ).padStart(2,"0");

        }


        if (memoryTitle) {

          memoryTitle.textContent =
            item.title ||
            "ذكرى";

        }


        if (memoryDescription) {

          memoryDescription.textContent =
            item.description ||
            item.text ||
            "";

        }


        if (memoryCounter) {

          memoryCounter.textContent =
            String(
              currentMemory + 1
            ).padStart(2,"0");

        }


        if (memoryImage) {
          memoryImage.classList.remove(
            "changing"
          );
        }

      },
      220
    );

  }


  if (prevMemory) {

    prevMemory.addEventListener(
      "click",
      function(){

        currentMemory--;

        renderMemory();

      }
    );

  }


  if (nextMemory) {

    nextMemory.addEventListener(
      "click",
      function(){

        currentMemory++;

        renderMemory();

      }
    );

  }


  renderMemory();


  /* =====================================================
     MUSIC
     ===================================================== */

  let audio = null;
  let playing = false;


  if (
    MEDIA &&
    MEDIA.music &&
    MEDIA.music.url
  ) {

    audio =
      new Audio(
        MEDIA.music.url
      );

    audio.loop =
      MEDIA.music.loop !== false;

  }


  function updateSoundUI() {

    if (soundButton) {

      soundButton.classList.toggle(
        "active",
        playing
      );

    }


    if (soundText) {

      soundText.textContent =
        playing
          ? "يعمل"
          : "صامت";

    }


    if (musicStatus) {

      musicStatus.textContent =
        playing
          ? "الموسيقى تعمل"
          : "تشغيل";

    }


    if (playMusic) {

      playMusic.textContent =
        playing
          ? "Ⅱ"
          : "▶";

    }

  }


  async function toggleMusic() {

    if (!audio) {

      if (musicStatus) {

        musicStatus.textContent =
          "أضيفي الموسيقى من media.js";

      }

      return;

    }


    try {

      if (audio.paused) {

        await audio.play();

        playing = true;

      } else {

        audio.pause();

        playing = false;

      }

      updateSoundUI();

    } catch(error) {

      console.warn(
        "تعذر تشغيل الموسيقى:",
        error
      );

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


  /* =====================================================
     FINAL MESSAGE
     ===================================================== */

  function renderFinal() {

    if (!finalMessageText) return;

    const final =
      DATA.finalMessage;


    if (!final) {

      finalMessageText.textContent =
        "لسه في كلام كتير.";

      return;

    }


    if (
      typeof final === "object" &&
      !Array.isArray(final)
    ) {

      finalMessageText.textContent =
        Array.isArray(final.text)
          ? final.text.join("\n\n")
          : String(final.text || "");

      return;

    }


    if (Array.isArray(final)) {

      finalMessageText.textContent =
        final.join("\n\n");

      return;

    }


    finalMessageText.textContent =
      String(final);

  }


  if (revealFinal) {

    revealFinal.addEventListener(
      "click",
      function(){

        renderFinal();

        if (finalMessage) {

          finalMessage.classList.add(
            "show"
          );

        }

        revealFinal.style.display =
          "none";

      }
    );

  }


  /* =====================================================
     KEYBOARD
     ===================================================== */

  document.addEventListener(
    "keydown",
    function(event){

      if(event.key === "Escape") {
        closeMenuPanel();
      }

      if(
        event.key === "ArrowRight" &&
        document.activeElement?.tagName !== "INPUT"
      ){

        currentPoem++;

        renderPoem();

      }

      if(
        event.key === "ArrowLeft" &&
        document.activeElement?.tagName !== "INPUT"
      ){

        currentPoem--;

        renderPoem();

      }

    }
  );


  /* =====================================================
     OBSERVER
     ===================================================== */

  const observer =
    new IntersectionObserver(
      function(entries){

        entries.forEach(
          function(entry){

            if(
              entry.isIntersecting
            ){

              entry.target
                .querySelectorAll(
                  ".letter__paragraph"
                )
                .forEach(
                  function(item,index){

                    setTimeout(
                      function(){
                        item.classList.add(
                          "visible"
                        );
                      },
                      index * 180
                    );

                  }
                );

            }

          }
        );

      },
      {
        threshold:.15
      }
    );


  document
    .querySelectorAll(".letter")
    .forEach(
      function(section){
        observer.observe(section);
      }
    );


  /* =====================================================
     SAFETY
     ===================================================== */

  window.MALAK_APP = {
    openMenu,
    closeMenuPanel,
    renderPoem,
    renderMemory,
    toggleMusic
  };

});
