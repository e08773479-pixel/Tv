/* =========================================================
   JOKER
   app.js
   Application controller
========================================================= */

(() => {

  "use strict";


  /* =======================================================
     DOM
  ======================================================= */

  const $ = selector =>
    document.querySelector(selector);

  const $$ = selector =>
    [...document.querySelectorAll(selector)];


  /* =======================================================
     ELEMENTS
  ======================================================= */

  const splash =
    $("#splash");

  const authScreen =
    $("#authScreen");

  const app =
    $("#app");

  const sidebar =
    $("#sidebar");

  const sidebarBackdrop =
    $("#sidebarBackdrop");

  const toast =
    $("#toast");

  const searchModal =
    $("#searchModal");

  const roomModal =
    $("#roomModal");

  const cameraModal =
    $("#cameraModal");

  const profileModal =
    $("#profileModal");


  /* =======================================================
     APP INIT
  ======================================================= */

  function init() {

    setupSplash();

    setupAuth();

    setupNavigation();

    setupSidebar();

    setupSearch();

    setupModals();

    setupProfile();

    setupCamera();

    setupTheme();

    setupGames();

    setupRoom();

    setupMisc();

    restoreInterface();

    JOKER.state.initialized = true;

    persist();

  }


  /* =======================================================
     SPLASH
  ======================================================= */

  function setupSplash() {

    setTimeout(() => {

      splash.classList.add("hide");

      const authenticated =
        JOKER.state.authenticated;

      if (authenticated) {

        showApp();

      } else {

        showAuth();

      }

    }, 1500);

  }


  function showAuth() {

    authScreen.classList.remove("hidden");

    app.classList.add("hidden");

  }


  function showApp() {

    authScreen.classList.add("hidden");

    app.classList.remove("hidden");

    updateUserUI();

    navigate(
      JOKER.state.currentPage || "home",
      false
    );

  }


  /* =======================================================
     AUTH
  ======================================================= */

  function setupAuth() {

    $$(".auth-tab").forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          $$(".auth-tab")
            .forEach(item =>
              item.classList.remove("active")
            );

          tab.classList.add("active");

          const type =
            tab.dataset.auth;

          if (type === "register") {

            $("#loginForm")
              .classList.add("hidden");

            $("#registerForm")
              .classList.remove("hidden");

          } else {

            $("#registerForm")
              .classList.add("hidden");

            $("#loginForm")
              .classList.remove("hidden");

          }

        }
      );

    });


    $("#loginForm")
      .addEventListener(
        "submit",
        handleLogin
      );


    $("#registerForm")
      .addEventListener(
        "submit",
        handleRegister
      );


    $("#googleLoginBtn")
      .addEventListener(
        "click",
        () => {

          if (!JOKER.config.features.googleAuth) {

            showToast(
              "Google",
              "تسجيل Google الحقيقي يحتاج إعداد OAuth وBackend.",
              "!"
            );

            return;

          }

        }
      );


    $("#logoutBtn")
      .addEventListener(
        "click",
        logout
      );

  }


  function handleLogin(event) {

    event.preventDefault();

    const email =
      $("#loginEmail").value.trim();

    const password =
      $("#loginPassword").value;

    if (!email || !password) {

      showToast(
        "تسجيل الدخول",
        "أكمل البيانات المطلوبة.",
        "!"
      );

      return;

    }

    /*
      مهم:
      هذه الدفعة لا تدعي أن الدخول تم على سيرفر حقيقي.
      يتم إنشاء جلسة محلية فقط لتجربة واجهة التطبيق.
    */

    JOKER.state.authenticated = true;

    JOKER.state.user = {

      ...JOKER.state.user,

      name:
        JOKER.state.user.name ||
        email.split("@")[0],

      email,

      online: true

    };

    persist();

    showApp();

    showToast(
      "أهلًا بك",
      "تم فتح واجهة حسابك المحلية.",
      "✓"
    );

  }


  function handleRegister(event) {

    event.preventDefault();

    const name =
      $("#registerName").value.trim();

    const email =
      $("#registerEmail").value.trim();

    const password =
      $("#registerPassword").value;

    if (
      !name ||
      !email ||
      password.length < 8
    ) {

      showToast(
        "إنشاء الحساب",
        "أدخل اسمًا وبريدًا وكلمة مرور لا تقل عن 8 أحرف.",
        "!"
      );

      return;

    }

    JOKER.state.authenticated = true;

    JOKER.state.user = {

      ...JOKER.state.user,

      id:
        `local-${Date.now()}`,

      name,

      email,

      bio: "",

      level: 1,

      coins: 0,

      friendsCount: 0,

      followersCount: 0,

      roomsCount: 0,

      online: true

    };

    persist();

    showApp();

    showToast(
      "تم إنشاء الحساب",
      "تم تجهيز حسابك المحلي. الربط الحقيقي سيأتي مع Backend.",
      "✓"
    );

  }


  function logout() {

    JOKER.state.authenticated = false;

    JOKER.state.user = {
      ...JOKER.defaultUser
    };

    JOKER.storage.clear();

    stopCamera();

    closeAllModals();

    showAuth();

    showToast(
      "تم تسجيل الخروج",
      "تم إنهاء الجلسة المحلية.",
      "✓"
    );

  }


  /* =======================================================
     NAVIGATION
  ======================================================= */

  function setupNavigation() {

    document.addEventListener(
      "click",
      event => {

        const trigger =
          event.target.closest("[data-page]");

        if (!trigger) return;

        const page =
          trigger.dataset.page;

        if (!page) return;

        navigate(page);

      }
    );

  }


  function navigate(
    page,
    save = true
  ) {

    if (!JOKER.ui.pages.includes(page)) {

      page = "home";

    }

    $$(".page").forEach(section => {

      section.classList.toggle(
        "active",
        section.id === `page-${page}`
      );

    });


    $$(".nav-item").forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === page
      );

    });


    $$(".bottom-item").forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === page
      );

    });


    JOKER.state.currentPage = page;


    closeSidebar();


    if (save) {

      persist();

    }


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


    JOKER.events.emit(
      "pageChanged",
      page
    );

  }


  /* =======================================================
     SIDEBAR
  ======================================================= */

  function setupSidebar() {

    $("#openSidebar")
      ?.addEventListener(
        "click",
        openSidebar
      );

    $("#closeSidebar")
      ?.addEventListener(
        "click",
        closeSidebar
      );

    sidebarBackdrop
      ?.addEventListener(
        "click",
        closeSidebar
      );

  }


  function openSidebar() {

    sidebar.classList.add("open");

    sidebarBackdrop.classList.add("show");

    JOKER.state.sidebarOpen = true;

  }


  function closeSidebar() {

    sidebar.classList.remove("open");

    sidebarBackdrop.classList.remove("show");

    JOKER.state.sidebarOpen = false;

  }


  /* =======================================================
     SEARCH
  ======================================================= */

  function setupSearch() {

    $("#globalSearchBtn")
      .addEventListener(
        "click",
        openSearch
      );


    $("#globalSearchInput")
      .addEventListener(
        "input",
        event => {

          renderSearch(
            event.target.value
          );

        }
      );


    document.addEventListener(
      "keydown",
      event => {

        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k"
        ) {

          event.preventDefault();

          openSearch();

        }


        if (
          event.key === "Escape"
        ) {

          closeAllModals();

        }

      }
    );

  }


  function openSearch() {

    searchModal.classList.remove(
      "hidden"
    );

    $("#globalSearchInput")
      .value = "";

    $("#searchResults").innerHTML = `

      <div class="search-empty">

        ابدأ بكتابة كلمة للبحث.

      </div>

    `;

    setTimeout(
      () =>
        $("#globalSearchInput").focus(),
      50
    );

  }


  function renderSearch(query) {

    const clean =
      String(query || "").trim();

    if (!clean) {

      $("#searchResults").innerHTML = `

        <div class="search-empty">
          ابدأ بكتابة كلمة للبحث.
        </div>

      `;

      return;

    }


    /*
      لا توجد بيانات مستخدمين حقيقية بعد.
      لذلك لا نعرض نتائج وهمية.
    */

    $("#searchResults").innerHTML = `

      <div class="search-empty">

        <div style="font-size:30px;margin-bottom:10px;">
          ⌕
        </div>

        <strong style="display:block;color:#fff;margin-bottom:5px;">
          لا توجد بيانات متصلة
        </strong>

        <span>
          البحث عن «${escapeHTML(clean)}»
          سيعمل عند ربط قاعدة البيانات.
        </span>

      </div>

    `;

  }


  /* =======================================================
     MODALS
  ======================================================= */

  function setupModals() {

    document.addEventListener(
      "click",
      event => {

        const close =
          event.target.closest(
            "[data-close-modal]"
          );

        if (!close) return;

        closeAllModals();

      }
    );

  }


  function closeAllModals() {

    [
      searchModal,
      roomModal,
      cameraModal,
      profileModal
    ].forEach(modal => {

      modal?.classList.add("hidden");

    });


    stopCamera();

    JOKER.state.currentModal = null;

  }


  /* =======================================================
     PROFILE
  ======================================================= */

  function setupProfile() {

    $("#editProfileBtn")
      .addEventListener(
        "click",
        openProfileEditor
      );


    $("#profileForm")
      .addEventListener(
        "submit",
        saveProfile
      );

  }


  function openProfileEditor() {

    const user =
      JOKER.state.user;

    $("#editName").value =
      user.name || "";

    $("#editBio").value =
      user.bio || "";

    profileModal.classList.remove(
      "hidden"
    );

    JOKER.state.currentModal =
      "profile";

  }


  function saveProfile(event) {

    event.preventDefault();

    const name =
      $("#editName").value.trim();

    const bio =
      $("#editBio").value.trim();

    if (!name) {

      showToast(
        "الملف الشخصي",
        "الاسم مطلوب.",
        "!"
      );

      return;

    }

    JOKER.state.user.name =
      name;

    JOKER.state.user.bio =
      bio;

    persist();

    updateUserUI();

    closeAllModals();

    showToast(
      "تم الحفظ",
      "تم تحديث بيانات الملف المحلي.",
      "✓"
    );

  }


  function updateUserUI() {

    const user =
      JOKER.state.user;

    const name =
      user.name ||
      "حسابك";

    const email =
      user.email ||
      "لم يتم ربط البريد بعد";

    const initial =
      getInitial(name);


    $("#miniName").textContent =
      name;

    $("#topName").textContent =
      name;

    $("#profileName").textContent =
      name;

    $("#profileEmail").textContent =
      email;

    $("#profileBio").textContent =
      user.bio ||
      "أضف نبذة عنك من إعدادات الملف الشخصي.";


    $("#miniAvatar").textContent =
      initial;

    $("#topAvatar").textContent =
      initial;

    $("#profileAvatar").textContent =
      initial;


    $("#statFriends").textContent =
      user.friendsCount || 0;

    $("#statFollowers").textContent =
      user.followersCount || 0;

    $("#statRooms").textContent =
      user.roomsCount || 0;

    $("#statCoins").textContent =
      user.coins || 0;

    $("#walletCoins").textContent =
      user.coins || 0;

  }


  function getInitial(name) {

    if (!name) return "ج";

    return name
      .trim()
      .charAt(0)
      .toUpperCase();

  }


  /* =======================================================
     CAMERA
  ======================================================= */

  function setupCamera() {

    /*
      زر تشغيل الكاميرا موجود في النظام.
      يمكن استدعاء نافذة الكاميرا مستقبلًا من أي زر.
    */

    $("#startCameraBtn")
      .addEventListener(
        "click",
        startCamera
      );


    $("#cameraEndBtn")
      .addEventListener(
        "click",
        closeAllModals
      );


    $("#cameraMuteBtn")
      .addEventListener(
        "click",
        toggleCameraMute
      );

  }


  async function startCamera() {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      showToast(
        "الكاميرا",
        "المتصفح لا يدعم الوصول إلى الكاميرا.",
        "!"
      );

      return;

    }


    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,

          audio: true

        });


      const video =
        $("#cameraPreview");

      video.srcObject =
        stream;

      video.style.display =
        "block";

      $("#cameraPermissionState")
        .style.display =
        "none";

      $(".camera-controls")
        .style.display =
        "flex";


      JOKER.state.camera.active =
        true;

      JOKER.state.camera.stream =
        stream;

      JOKER.state.camera.muted =
        false;


      showToast(
        "الكاميرا",
        "تم تشغيل الكاميرا والمايك بإذن جهازك.",
        "✓"
      );

    } catch (error) {

      console.warn(
        "Camera permission:",
        error
      );

      showToast(
        "الكاميرا",
        "لم يتم السماح بالوصول إلى الكاميرا أو المايك.",
        "!"
      );

    }

  }


  function toggleCameraMute() {

    const stream =
      JOKER.state.camera.stream;

    if (!stream) return;

    const tracks =
      stream.getAudioTracks();

    const next =
      !JOKER.state.camera.muted;

    tracks.forEach(track => {

      track.enabled =
        !next;

    });

    JOKER.state.camera.muted =
      next;

    $("#cameraMuteBtn")
      .textContent =
      next ? "🔇" : "🎙️";

  }


  function stopCamera() {

    const stream =
      JOKER.state.camera.stream;

    if (stream) {

      stream
        .getTracks()
        .forEach(track =>
          track.stop()
        );

    }


    const video =
      $("#cameraPreview");

    if (video) {

      video.srcObject = null;

      video.style.display =
        "none";

    }


    if ($("#cameraPermissionState")) {

      $("#cameraPermissionState")
        .style.display =
        "flex";

    }


    if ($(".camera-controls")) {

      $(".camera-controls")
        .style.display =
        "none";

    }


    JOKER.state.camera = {

      active: false,

      stream: null,

      muted: false

    };

  }


  /* =======================================================
     ROOM
  ======================================================= */

  function setupRoom() {

    $("#openRoomDemo")
      .addEventListener(
        "click",
        () => {

          roomModal.classList.remove(
            "hidden"
          );

          JOKER.state.currentModal =
            "room";

        }
      );


    $("#createRoomBtn")
      .addEventListener(
        "click",
        () => {

          showToast(
            "إنشاء روم",
            "إنشاء الرومات الحقيقي يحتاج Realtime Backend.",
            "!"
          );

        }
      );

  }


  /* =======================================================
     GAMES
  ======================================================= */

  function setupGames() {

    $$(".game-card")
      .forEach(card => {

        card.addEventListener(
          "click",
          () => {

            showToast(
              "Joker Arcade",
              "نظام الألعاب سيتم ربطه بحسابك في دفعة الألعاب.",
              "🎮"
            );

          }
        );

      });

  }


  /* =======================================================
     THEME
  ======================================================= */

  function setupTheme() {

    $("#themeBtn")
      .addEventListener(
        "click",
        toggleTheme
      );

  }


  function toggleTheme() {

    /*
      الوضع الداكن هو الهوية الأساسية.
      التغيير هنا يجهز النظام لتوسعة Light Mode.
    */

    JOKER.state.theme =
      JOKER.state.theme === "dark"
        ? "light"
        : "dark";

    document.body.dataset.theme =
      JOKER.state.theme;

    $("#themeBtn").textContent =
      JOKER.state.theme === "dark"
        ? "☾"
        : "☀";

    persist();

    showToast(
      "المظهر",
      JOKER.state.theme === "dark"
        ? "تم تفعيل المظهر الداكن."
        : "تم تفعيل المظهر الفاتح التجريبي.",
      "✦"
    );

  }


  /* =======================================================
     MISC
  ======================================================= */

  function setupMisc() {

    $("#giftInfoBtn")
      ?.addEventListener(
        "click",
        () => {

          showToast(
            "الهدايا",
            "نظام الهدايا والعملات الحقيقي سيُربط بالحساب في الدفعات القادمة.",
            "♢"
          );

        }
      );

  }


  /* =======================================================
     RESTORE
  ======================================================= */

  function restoreInterface() {

    if (
      JOKER.state.theme
    ) {

      document.body.dataset.theme =
        JOKER.state.theme;

      $("#themeBtn").textContent =
        JOKER.state.theme === "dark"
          ? "☾"
          : "☀";

    }


    updateUserUI();

  }


  /* =======================================================
     TOAST
  ======================================================= */

  let toastTimer = null;


  function showToast(
    title,
    message,
    icon = "✦"
  ) {

    $("#toastTitle")
      .textContent =
      title;

    $("#toastMessage")
      .textContent =
      message;

    $("#toastIcon")
      .textContent =
      icon;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
      setTimeout(
        () => {

          toast.classList.remove(
            "show"
          );

        },
        3500
      );

  }


  /* =======================================================
     PERSIST
  ======================================================= */

  function persist() {

    JOKER.storage.save(
      JOKER.state
    );

  }


  /* =======================================================
     ESCAPE HTML
  ======================================================= */

  function escapeHTML(value) {

    return String(value)

      .replaceAll("&", "&amp;")

      .replaceAll("<", "&lt;")

      .replaceAll(">", "&gt;")

      .replaceAll('"', "&quot;")

      .replaceAll("'", "&#039;");

  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.JokerApp = {

    navigate,

    openSearch,

    openRoom() {

      roomModal.classList.remove(
        "hidden"
      );

    },

    openCamera() {

      cameraModal.classList.remove(
        "hidden"
      );

    },

    showToast

  };


  /* =======================================================
     START
  ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

})();
