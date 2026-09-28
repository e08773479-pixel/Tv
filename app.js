/* =========================================================
   JOKER — APPLICATION CORE
========================================================= */

"use strict";


/* =========================================================
   SHORTCUTS
========================================================= */

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];


/* =========================================================
   APP STATE
========================================================= */

const JOKER_APP = {

  currentRoute: "home",

  loading: true,

  theme:
    localStorage.getItem("joker_theme") || "dark",

  storageKey: "joker_session",

  searchTimer: null

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initializeApp();

});


/* =========================================================
   INITIALIZATION
========================================================= */

async function initializeApp() {

  setupTheme();

  setupNavigation();

  setupAuth();

  setupPasswordToggles();

  setupSearch();

  setupModal();

  setupLogout();

  await runLoader();

  await restoreSession();

  refreshInterface();

}


/* =========================================================
   LOADER
========================================================= */

async function runLoader() {

  const loader = $("#appLoader");
  const progress = $("#loaderProgress");
  const status = $("#loaderStatus");

  if (!loader || !progress) {
    return;
  }

  const steps = [

    [12, "جاري تجهيز الهوية..."],
    [28, "جاري تجهيز الواجهة..."],
    [46, "جاري فحص الجلسة..."],
    [63, "جاري تجهيز المسارات..."],
    [81, "جاري تجهيز الحساب..."],
    [94, "جاري إنهاء التجهيز..."],
    [100, "تم تجهيز المنصة"]

  ];


  for (const [value, message] of steps) {

    progress.style.width = `${value}%`;

    if (status) {
      status.textContent = message;
    }

    await sleep(
      value === 100 ? 250 : 180
    );

  }


  loader.classList.add("done");

  await sleep(450);

}


/* =========================================================
   SESSION
========================================================= */

async function restoreSession() {

  let raw = null;

  try {

    raw =
      localStorage.getItem(
        JOKER_APP.storageKey
      );

  } catch (error) {

    raw = null;

  }


  if (!raw) {

    showAuth();

    return;

  }


  try {

    const session = JSON.parse(raw);

    /*
     * لا نقبل جلسة ناقصة على أنها مستخدم حقيقي.
     */

    if (
      !session ||
      !session.user ||
      !session.user.id ||
      !session.user.email
    ) {

      clearSession();

      showAuth();

      return;

    }


    window.JOKER_DATA.currentUser =
      window.JOKER_DATA_HELPERS.normalizeUser(
        session.user
      );


    window.JOKER_DATA.session = {

      authenticated: true,

      provider:
        session.provider || "email",

      remember:
        Boolean(session.remember)

    };


    /*
     * مهم:
     * هذه الجلسة ليست Backend Auth.
     *
     * عند ربط Firebase/Supabase/API حقيقي
     * سيتم استبدال هذا الجزء بجلسة الخادم.
     */

    showApp();


  } catch (error) {

    console.warn(
      "Invalid local session.",
      error
    );

    clearSession();

    showAuth();

  }

}


/* =========================================================
   AUTH UI
========================================================= */

function showAuth() {

  $("#authScreen")?.classList.remove("hidden");

  $("#app")?.classList.add("hidden");

}


function showApp() {

  $("#authScreen")?.classList.add("hidden");

  $("#app")?.classList.remove("hidden");

}


/* =========================================================
   AUTH SWITCH
========================================================= */

function setupAuth() {

  $$("[data-auth-switch]").forEach(button => {

    button.addEventListener("click", () => {

      const target =
        button.dataset.authSwitch;

      switchAuthView(target);

    });

  });


  $("#loginForm")?.addEventListener(
    "submit",
    handleLogin
  );


  $("#registerForm")?.addEventListener(
    "submit",
    handleRegister
  );


  $("#googleLoginBtn")?.addEventListener(
    "click",
    handleGoogleAuth
  );


  $("#googleRegisterBtn")?.addEventListener(
    "click",
    handleGoogleAuth
  );


  $("#forgotPasswordBtn")?.addEventListener(
    "click",
    () => {

      openModal({

        title: "استعادة كلمة المرور",

        body: `
          <div class="modal-message">
            <p>
              استعادة كلمة المرور تحتاج إلى مزود
              مصادقة حقيقي متصل بالمنصة.
            </p>

            <p style="margin-top:10px;color:#8f96a8;font-size:11px">
              في الدفعة الأولى لن ندّعي أن هناك
              نظام بريد حقيقي من غير Backend.
            </p>
          </div>
        `

      });

    }
  );

}


function switchAuthView(view) {

  const login = $("#loginView");
  const register = $("#registerView");

  if (!login || !register) {
    return;
  }

  if (view === "register") {

    login.classList.add("hidden");
    register.classList.remove("hidden");

  } else {

    register.classList.add("hidden");
    login.classList.remove("hidden");

  }

}


/* =========================================================
   EMAIL LOGIN
========================================================= */

async function handleLogin(event) {

  event.preventDefault();

  const email =
    $("#loginEmail")?.value.trim();

  const password =
    $("#loginPassword")?.value;


  if (!email || !password) {

    showToast(
      "أدخل البريد الإلكتروني وكلمة المرور.",
      "error"
    );

    return;

  }


  /*
   * مهم جداً:
   *
   * لن ننشئ مستخدم وهمي عند الضغط على Login.
   *
   * حالياً نحتاج Auth Backend حقيقي.
   */

  if (
    !window.JOKER_DATA.backend.authConfigured
  ) {

    showAuthSetupMessage();

    return;

  }


  /*
   * نقطة الربط المستقبلية:
   *
   * const user =
   * await authProvider.signIn(email, password);
   */

}


/* =========================================================
   REGISTER
========================================================= */

async function handleRegister(event) {

  event.preventDefault();

  const name =
    $("#registerName")?.value.trim();

  const email =
    $("#registerEmail")?.value.trim();

  const password =
    $("#registerPassword")?.value;

  const confirm =
    $("#registerConfirmPassword")?.value;

  const terms =
    $("#acceptTerms")?.checked;


  if (!name || !email || !password || !confirm) {

    showToast(
      "أكمل بيانات إنشاء الحساب.",
      "error"
    );

    return;

  }


  if (password.length < 8) {

    showToast(
      "كلمة المرور يجب أن تكون 8 أحرف على الأقل.",
      "error"
    );

    return;

  }


  if (password !== confirm) {

    showToast(
      "كلمتا المرور غير متطابقتين.",
      "error"
    );

    return;

  }


  if (!terms) {

    showToast(
      "يجب الموافقة على الشروط.",
      "error"
    );

    return;

  }


  if (
    !window.JOKER_DATA.backend.authConfigured
  ) {

    showAuthSetupMessage();

    return;

  }


  /*
   * نقطة الربط مع Auth Provider الحقيقي.
   */

}


/* =========================================================
   GOOGLE AUTH
========================================================= */

function handleGoogleAuth() {

  /*
   * لا نقوم بعمل fake login.
   *
   * Google OAuth يحتاج:
   * - OAuth Client
   * - Redirect URI
   * - Auth Provider / Backend
   */

  openModal({

    title: "Google",

    body: `

      <div class="modal-message">

        <div style="
          width:56px;
          height:56px;
          display:grid;
          place-items:center;
          margin:0 auto 15px;
          border-radius:17px;
          background:#fff;
          color:#4285f4;
          font:bold 24px Arial;
        ">
          G
        </div>

        <h3 style="text-align:center;font-size:15px">
          Google Login جاهز للربط
        </h3>

        <p style="
          margin-top:9px;
          color:#8f96a8;
          font-size:10px;
          line-height:1.9;
          text-align:center;
        ">
          لن ننشئ جلسة مزيفة.
          عند إضافة OAuth الحقيقي سيتم فتح
          تسجيل Google الفعلي وإرجاع الحساب الحقيقي.
        </p>

      </div>

    `

  });

}


/* =========================================================
   AUTH SETUP MESSAGE
========================================================= */

function showAuthSetupMessage() {

  openModal({

    title: "المصادقة الحقيقية",

    body: `

      <div class="modal-message">

        <h3 style="font-size:15px">
          الواجهة جاهزة — Backend مطلوب
        </h3>

        <p style="
          margin-top:10px;
          color:#8f96a8;
          font-size:10px;
          line-height:2;
        ">
          لن يتم إنشاء حساب وهمي أو تخزين كلمة مرور
          داخل Front-End.
          تسجيل الدخول الحقيقي يحتاج خدمة مصادقة
          وقاعدة بيانات آمنة.
        </p>

        <div style="
          margin-top:18px;
          padding:13px;
          border:1px solid rgba(139,92,246,.15);
          border-radius:13px;
          background:rgba(139,92,246,.05);
          color:#b9b0e8;
          font-size:9px;
          line-height:1.9;
        ">
          الدفعة الأولى جهزت كل الواجهة ونقاط الربط،
          وفي مرحلة الـBackend سيتم توصيل الحسابات
          الحقيقية بدون إعادة تصميم المنصة.
        </div>

      </div>

    `

  });

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  $$("[data-route]").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const route =
          button.dataset.route;

        if (route) {
          navigate(route);
        }

      }
    );

  });


  $("#mobileMenuBtn")?.addEventListener(
    "click",
    () => {

      $("#sidebar")
        ?.classList.toggle("open");

    }
  );

}


function navigate(route) {

  const target =
    $(`#page-${route}`);

  if (!target) {
    return;
  }


  $$(".page").forEach(page => {

    page.classList.remove("active-page");

  });


  target.classList.add("active-page");


  $$(".nav-item").forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.route === route
    );

  });


  $$(".mobile-nav-item").forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.route === route
    );

  });


  JOKER_APP.currentRoute = route;


  $("#sidebar")?.classList.remove("open");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (route === "profile") {
    renderProfile();
  }


  if (route === "wallet") {
    renderWallet();
  }


  if (route === "notifications") {
    renderNotifications();
  }


  if (route === "friends") {
    renderFriends();
  }


  if (route === "rooms") {
    renderRooms();
  }


  if (route === "chat") {
    renderChat();
  }

}


/* =========================================================
   INTERFACE REFRESH
========================================================= */

function refreshInterface() {

  const user =
    window.JOKER_DATA_HELPERS.getUser();


  if (!user) {

    showAuth();

    return;

  }


  showApp();

  renderUser();

  renderNotifications();

  renderFriends();

  renderRooms();

  renderChat();

  renderProfile();

  renderWallet();

}


/* =========================================================
   USER
========================================================= */

function renderUser() {

  const user =
    window.JOKER_DATA_HELPERS.getUser();

  if (!user) {
    return;
  }


  const displayName =
    user.name || "حسابك";


  setText(
    "#topUserName",
    displayName
  );

  setText(
    "#homeUserName",
    displayName
  );

  setText(
    "#profileName",
    displayName
  );


  setText(
    "#userLevel",
    user.level || "—"
  );

  setText(
    "#userXp",
    formatNumber(user.xp)
  );

  setText(
    "#userCoins",
    formatNumber(user.coins)
  );


  setText(
    "#profileLevel",
    user.level || "—"
  );

  setText(
    "#profileXp",
    formatNumber(user.xp)
  );

  setText(
    "#profileCoins",
    formatNumber(user.coins)
  );

  setText(
    "#walletCoins",
    formatNumber(user.coins)
  );


  setText(
    "#profileHandle",
    user.username
      ? `@${user.username}`
      : "@account"
  );


  setText(
    "#profileBio",
    user.bio ||
    "أهلاً بك في الجوكر."
  );


  setAvatar(
    "#topAvatar",
    user
  );

  setAvatar(
    "#homeAvatar",
    user
  );

  setAvatar(
    "#profileAvatar",
    user
  );

}


/* =========================================================
   AVATAR
========================================================= */

function setAvatar(selector, user) {

  const element = $(selector);

  if (!element) {
    return;
  }


  element.innerHTML = "";


  if (user.avatar) {

    const image =
      document.createElement("img");

    image.src = user.avatar;

    image.alt =
      user.name || "User";

    image.loading = "lazy";

    image.onerror = () => {

      element.textContent =
        getInitial(user.name);

    };


    element.appendChild(image);

  } else {

    element.textContent =
      getInitial(user.name);

  }

}


function getInitial(name) {

  const value =
    String(name || "").trim();

  return value
    ? value.charAt(0).toUpperCase()
    : "?";

}


/* =========================================================
   FRIENDS
========================================================= */

function renderFriends() {

  const friends =
    window.JOKER_DATA_HELPERS.getFriends();

  const empty =
    $("#friendsEmpty");


  if (!empty) {
    return;
  }


  /*
   * لا توجد بيانات وهمية.
   */

  if (!friends.length) {

    empty.classList.remove("hidden");

    return;

  }


  empty.classList.add("hidden");

}


/* =========================================================
   ROOMS
========================================================= */

function renderRooms() {

  const rooms =
    window.JOKER_DATA_HELPERS.getRooms();


  const empty =
    $("#roomsEmpty");

  const count =
    $("#roomsNavCount");


  if (count) {

    if (rooms.length) {

      count.textContent =
        rooms.length;

    } else {

      count.textContent =
        "";

    }

  }


  if (!empty) {
    return;
  }


  if (!rooms.length) {

    empty.classList.remove("hidden");

    return;

  }


  empty.classList.add("hidden");

}


/* =========================================================
   CHAT
========================================================= */

function renderChat() {

  const chats =
    window.JOKER_DATA_HELPERS.getConversations();

  const list =
    $("#chatList");


  if (!list) {
    return;
  }


  if (!chats.length) {

    list.innerHTML = `

      <div class="chat-empty">

        <span>▱</span>

        <p>
          لا توجد محادثات بعد.
        </p>

      </div>

    `;

    return;

  }


  /*
   * عند وجود Backend:
   * يتم بناء المحادثات هنا من البيانات الحقيقية.
   */

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function renderNotifications() {

  const notifications =
    window.JOKER_DATA_HELPERS
      .getNotifications();


  const unread =
    window.JOKER_DATA_HELPERS
      .getUnreadNotifications();


  const list =
    $("#notificationsList");

  const topBadge =
    $("#notificationBadge");

  const sideCount =
    $("#sideNotificationCount");


  updateBadge(
    topBadge,
    unread.length
  );

  updateBadge(
    sideCount,
    unread.length
  );


  if (!list) {
    return;
  }


  if (!notifications.length) {

    list.innerHTML = `

      <div class="data-state large">

        <div class="data-state-icon">
          ♢
        </div>

        <h3>
          لا توجد إشعارات
        </h3>

        <p>
          عند وصول إشعار حقيقي سيظهر هنا.
        </p>

      </div>

    `;

    return;

  }


  /*
   * البيانات الحقيقية سيتم رسمها هنا.
   */

}


/* =========================================================
   PROFILE
========================================================= */

function renderProfile() {

  const user =
    window.JOKER_DATA_HELPERS.getUser();

  const activity =
    $("#profileActivity");


  if (!activity) {
    return;
  }


  if (!user) {

    activity.innerHTML = `

      <p>
        لا يوجد حساب مسجل.
      </p>

    `;

    return;

  }


  activity.innerHTML = `

    <div class="data-state">

      <div class="data-state-icon">
        ◎
      </div>

      <h3>
        لا يوجد نشاط مسجل بعد
      </h3>

      <p>
        النشاط سيظهر هنا من الأحداث الحقيقية
        للحساب.
      </p>

    </div>

  `;

}


/* =========================================================
   WALLET
========================================================= */

function renderWallet() {

  const user =
    window.JOKER_DATA_HELPERS.getUser();

  if (!user) {
    return;
  }


  setText(
    "#walletCoins",
    formatNumber(user.coins)
  );

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

  const global =
    $("#globalSearch");

  const page =
    $("#pageSearchInput");


  global?.addEventListener(
    "input",
    event => {

      handleSearch(
        event.target.value
      );

    }
  );


  page?.addEventListener(
    "input",
    event => {

      handleSearch(
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

        global?.focus();

      }

    }
  );

}


function handleSearch(value) {

  const query =
    String(value || "").trim();


  if (!query) {

    if (
      JOKER_APP.currentRoute === "search"
    ) {

      renderEmptySearch();

    }

    return;

  }


  navigate("search");


  clearTimeout(
    JOKER_APP.searchTimer
  );


  JOKER_APP.searchTimer =
    setTimeout(() => {

      executeSearch(query);

    }, 180);

}


function executeSearch(query) {

  const results =
    $("#searchResults");


  if (!results) {
    return;
  }


  /*
   * البحث هنا لا يخترع نتائج.
   *
   * لا نبحث إلا داخل بيانات حقيقية
   * تم تحميلها في JOKER_DATA.
   */

  const users =
    window.JOKER_DATA_HELPERS
      .getFriends()
      .filter(user => {

        const text = `

          ${user.name || ""}
          ${user.username || ""}
          ${user.bio || ""}

        `.toLowerCase();

        return text.includes(
          query.toLowerCase()
        );

      });


  const rooms =
    window.JOKER_DATA_HELPERS
      .getRooms()
      .filter(room => {

        const text = `

          ${room.name || ""}
          ${room.description || ""}

        `.toLowerCase();

        return text.includes(
          query.toLowerCase()
        );

      });


  if (!users.length && !rooms.length) {

    results.innerHTML = `

      <div class="data-state large">

        <div class="data-state-icon">
          ⌕
        </div>

        <h3>
          لا توجد نتائج
        </h3>

        <p>
          لم نجد نتيجة في البيانات المتاحة حالياً.
        </p>

      </div>

    `;

    return;

  }


  /*
   * سيتم تطوير Cards النتائج
   * في الدفعة الثانية.
   */

  results.innerHTML = `

    <div class="data-state">

      <h3>
        تم العثور على بيانات
      </h3>

      <p>
        سيتم عرض نتائج البحث الكاملة في
        وحدة الاكتشاف والملفات الشخصية.
      </p>

    </div>

  `;

}


function renderEmptySearch() {

  const results =
    $("#searchResults");

  if (!results) {
    return;
  }


  results.innerHTML = `

    <div class="data-state large">

      <div class="data-state-icon">
        ⌕
      </div>

      <h3>
        ابدأ البحث
      </h3>

      <p>
        النتائج ستأتي من البيانات الحقيقية للمنصة.
      </p>

    </div>

  `;

}


/* =========================================================
   THEME
========================================================= */

function setupTheme() {

  applyTheme(
    JOKER_APP.theme
  );


  $("#themeToggle")?.addEventListener(
    "click",
    toggleTheme
  );


  $("#settingsThemeBtn")?.addEventListener(
    "click",
    toggleTheme
  );

}


function toggleTheme() {

  JOKER_APP.theme =
    JOKER_APP.theme === "dark"
      ? "light"
      : "dark";


  localStorage.setItem(
    "joker_theme",
    JOKER_APP.theme
  );


  applyTheme(
    JOKER_APP.theme
  );

}


function applyTheme(theme) {

  document.body.classList.toggle(
    "light",
    theme === "light"
  );

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggles() {

  $$(".password-toggle").forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const target =
          document.getElementById(
            button.dataset.target
          );

        if (!target) {
          return;
        }


        target.type =
          target.type === "password"
            ? "text"
            : "password";

      }
    );

  });

}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

  $$("[data-modal-close]").forEach(
    element => {

      element.addEventListener(
        "click",
        closeModal
      );

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeModal();

      }

    }
  );

}


function openModal({
  title = "",
  body = ""
}) {

  const modal =
    $("#globalModal");

  const content =
    $("#modalContent");


  if (!modal || !content) {
    return;
  }


  content.innerHTML = `

    <div>

      <span class="section-kicker">
        JOKER
      </span>

      <h2 style="
        margin-top:7px;
        font-size:21px;
      ">
        ${escapeHtml(title)}
      </h2>

      <div style="margin-top:17px">
        ${body}
      </div>

    </div>

  `;


  modal.classList.remove("hidden");

}


function closeModal() {

  $("#globalModal")
    ?.classList.add("hidden");

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

  $("#logoutBtn")?.addEventListener(
    "click",
    logout
  );


  $("#settingsLogoutBtn")
    ?.addEventListener(
      "click",
      logout
    );

}


function logout() {

  clearSession();

  window.JOKER_DATA.currentUser = null;

  window.JOKER_DATA.session = {

    authenticated: false,
    provider: null,
    remember: false

  };


  switchAuthView("login");

  showAuth();

  showToast(
    "تم إنهاء الجلسة.",
    "success"
  );

}


function clearSession() {

  try {

    localStorage.removeItem(
      JOKER_APP.storageKey
    );

  } catch (error) {

    console.warn(
      "Could not clear session.",
      error
    );

  }

}


/* =========================================================
   UTILITIES
========================================================= */

function updateBadge(
  element,
  count
) {

  if (!element) {
    return;
  }


  if (count > 0) {

    element.textContent =
      count > 99
        ? "99+"
        : String(count);

    element.classList.remove(
      "hidden"
    );

  } else {

    element.textContent = "";

    element.classList.add(
      "hidden"
    );

  }

}


function setText(
  selector,
  value
) {

  const element =
    $(selector);

  if (element) {
    element.textContent =
      value ?? "";
  }

}


function formatNumber(value) {

  const number =
    Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat(
    "ar-EG"
  ).format(number);

}


function sleep(ms) {

  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );

}


function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   DEBUG API
========================================================= */

window.JOKER_APP = JOKER_APP;

window.JOKER = {

  navigate,

  openModal,

  closeModal,

  refresh: refreshInterface,

  logout

};
