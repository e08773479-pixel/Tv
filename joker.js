/* ============================================================
   JOKER 👑 — FRONTEND ENGINE
   File: joker.js
   Version: 1.0.0
   Purpose:
   - Splash / Boot sequence
   - Navigation
   - App state
   - UI interactions
   - API adapter
   - Authentication adapter
   - Chat / Calls / Rooms / Live
   - Games engine shell
   - Wallet / Store / Premium
   - Notifications
   - Search
   - Modals / Drawers / Toasts
   - Realtime adapter
   - Media adapter
   - Future backend integration
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     01 — GLOBAL CONFIG
     ========================================================== */

  const DEFAULT_CONFIG = {
    appName: "JOKER",
    brand: "الجوكر 👑",
    version: "1.0.0",

    api: {
      baseURL: "/api",
      timeout: 15000,
      credentials: "include"
    },

    routes: {
      home: "home",
      live: "live",
      rooms: "rooms",
      games: "games",
      chat: "chat",
      calls: "calls",
      discover: "discover",
      friends: "friends",
      notifications: "notifications",
      profile: "profile",
      wallet: "wallet",
      store: "store",
      premium: "premium",
      settings: "settings",
      security: "security"
    },

    features: {
      social: true,
      chat: true,
      calls: true,
      rooms: true,
      live: true,
      games: true,
      wallet: true,
      store: true,
      premium: true,
      notifications: true,
      search: true
    },

    splash: {
      duration: 5000,
      minimumDuration: 5000
    }
  };

  const externalConfig =
    window.MALAK_CONFIG ||
    window.JOKER_CONFIG ||
    window.JOKER_APP_CONFIG ||
    {};

  const CONFIG = deepMerge(DEFAULT_CONFIG, externalConfig);

  window.JOKER = window.JOKER || {};
  window.JOKER.config = CONFIG;


  /* ==========================================================
     02 — DOM HELPERS
     ========================================================== */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  const byId = (id) =>
    document.getElementById(id);

  const exists = (selector) =>
    !!$(selector);

  function on(element, event, handler, options) {
    if (!element) return;
    element.addEventListener(event, handler, options || false);
  }

  function delegate(root, event, selector, handler) {
    if (!root) return;

    root.addEventListener(event, (e) => {
      const target = e.target.closest(selector);

      if (!target || !root.contains(target)) {
        return;
      }

      handler(e, target);
    });
  }

  function setText(element, value) {
    if (!element) return;
    element.textContent = value == null ? "" : String(value);
  }

  function setHTML(element, html) {
    if (!element) return;
    element.innerHTML = html;
  }

  function toggleClass(element, className, force) {
    if (!element) return;

    if (typeof force === "boolean") {
      element.classList.toggle(className, force);
    } else {
      element.classList.toggle(className);
    }
  }

  function addClass(element, className) {
    if (!element) return;
    element.classList.add(className);
  }

  function removeClass(element, className) {
    if (!element) return;
    element.classList.remove(className);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /* ==========================================================
     03 — UTILITY FUNCTIONS
     ========================================================== */

  function deepMerge(target, source) {
    const output = Array.isArray(target)
      ? [...target]
      : { ...target };

    if (!source || typeof source !== "object") {
      return output;
    }

    Object.keys(source).forEach(key => {
      const value = source[key];

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        output[key] &&
        typeof output[key] === "object" &&
        !Array.isArray(output[key])
      ) {
        output[key] = deepMerge(output[key], value);
      } else {
        output[key] = value;
      }
    });

    return output;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function safeJSONParse(value, fallback = null) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return new Intl.NumberFormat("ar-EG").format(number);
  }

  function formatDate(date) {
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(d);
  }

  function uid(prefix = "joker") {
    return `${prefix}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }


  /* ==========================================================
     04 — APPLICATION STATE
     ========================================================== */

  const State = {
    boot: {
      started: false,
      ready: false,
      progress: 0,
      splashFinished: false
    },

    navigation: {
      currentPage: "home",
      previousPage: null
    },

    auth: {
      status: "unknown",
      user: null,
      session: null
    },

    ui: {
      sidebarOpen: false,
      mobileMenuOpen: false,
      searchOpen: false,
      modalOpen: false,
      drawerOpen: false,
      loading: false
    },

    data: {
      stories: [],
      posts: [],
      liveStreams: [],
      rooms: [],
      games: [],
      notifications: [],
      conversations: [],
      friends: [],
      transactions: [],
      storeItems: []
    },

    media: {
      stream: null,
      cameraEnabled: false,
      microphoneEnabled: false,
      screenSharing: false
    },

    realtime: {
      connected: false,
      socket: null
    }
  };


  /* ==========================================================
     05 — STATE STORE
     ========================================================== */

  const Store = {
    get(path) {
      if (!path) return State;

      return path
        .split(".")
        .reduce((object, key) => {
          return object ? object[key] : undefined;
        }, State);
    },

    set(path, value) {
      const parts = path.split(".");
      let target = State;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]]) {
          target[parts[i]] = {};
        }

        target = target[parts[i]];
      }

      target[parts[parts.length - 1]] = value;

      window.dispatchEvent(
        new CustomEvent("joker:statechange", {
          detail: {
            path,
            value
          }
        })
      );

      return value;
    },

    update(path, updater) {
      const current = this.get(path);
      return this.set(path, updater(current));
    }
  };

  window.JOKER.store = Store;


  /* ==========================================================
     06 — STORAGE
     ========================================================== */

  const Storage = {
    prefix: "joker:",

    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(this.prefix + key);

        if (raw === null) {
          return fallback;
        }

        return safeJSONParse(raw, raw);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(
          this.prefix + key,
          JSON.stringify(value)
        );

        return true;
      } catch {
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(this.prefix + key);
      } catch {
        /* intentionally ignored */
      }
    },

    clear() {
      try {
        Object.keys(localStorage)
          .filter(key => key.startsWith(this.prefix))
          .forEach(key => localStorage.removeItem(key));
      } catch {
        /* intentionally ignored */
      }
    }
  };

  window.JOKER.storage = Storage;


  /* ==========================================================
     07 — API CLIENT
     ========================================================== */

  class APIClient {
    constructor(config) {
      this.baseURL = config.baseURL || "/api";
      this.timeout = config.timeout || 15000;
      this.credentials = config.credentials || "include";
    }

    buildURL(path) {
      if (!path) {
        return this.baseURL;
      }

      if (/^https?:\/\//i.test(path)) {
        return path;
      }

      const base = this.baseURL.replace(/\/$/, "");
      const endpoint = String(path).replace(/^\//, "");

      return `${base}/${endpoint}`;
    }

    async request(path, options = {}) {
      const controller = new AbortController();

      const timeout = setTimeout(
        () => controller.abort(),
        this.timeout
      );

      const headers = {
        Accept: "application/json",
        ...(options.body instanceof FormData
          ? {}
          : {
              "Content-Type": "application/json"
            }),
        ...(options.headers || {})
      };

      try {
        const response = await fetch(
          this.buildURL(path),
          {
            ...options,
            headers,
            credentials: this.credentials,
            signal: controller.signal
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        let data;

        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const error = new Error(
            data?.message ||
            `Request failed with status ${response.status}`
          );

          error.status = response.status;
          error.data = data;

          throw error;
        }

        return data;
      } finally {
        clearTimeout(timeout);
      }
    }

    get(path, options = {}) {
      return this.request(path, {
        ...options,
        method: "GET"
      });
    }

    post(path, body, options = {}) {
      return this.request(path, {
        ...options,
        method: "POST",
        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body || {})
      });
    }

    put(path, body, options = {}) {
      return this.request(path, {
        ...options,
        method: "PUT",
        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body || {})
      });
    }

    patch(path, body, options = {}) {
      return this.request(path, {
        ...options,
        method: "PATCH",
        body:
          body instanceof FormData
            ? body
            : JSON.stringify(body || {})
      });
    }

    delete(path, options = {}) {
      return this.request(path, {
        ...options,
        method: "DELETE"
      });
    }
  }

  const API = new APIClient(CONFIG.api);

  window.JOKER.api = API;


  /* ==========================================================
     08 — SPLASH / BOOT ENGINE
     ========================================================== */

  const Splash = {
    element: null,
    percentElement: null,
    progressElement: null,
    statusElement: null,

    getElements() {
      this.element =
        byId("joker-splash") ||
        $(".joker-splash");

      this.percentElement =
        byId("joker-splash-percent") ||
        $(".joker-splash__percent");

      this.progressElement =
        byId("joker-splash-progress") ||
        $(".joker-splash__progress") ||
        $(".joker-splash__progress-bar") ||
        $(".joker-splash__line");

      this.statusElement =
        byId("joker-splash-status") ||
        $(".joker-splash__status");
    },

    setProgress(value) {
      value = clamp(Math.round(value), 0, 100);

      State.boot.progress = value;

      if (this.percentElement) {
        setText(this.percentElement, `${value}%`);
      }

      if (this.progressElement) {
        this.progressElement.style.width = `${value}%`;
        this.progressElement.style.setProperty(
          "--joker-progress",
          `${value}%`
        );
        this.progressElement.setAttribute(
          "aria-valuenow",
          String(value)
        );
      }

      window.dispatchEvent(
        new CustomEvent("joker:progress", {
          detail: {
            value
          }
        })
      );
    },

    setStatus(text) {
      if (this.statusElement) {
        setText(this.statusElement, text);
      }
    },

    async run() {
      this.getElements();

      State.boot.started = true;

      if (!this.element) {
        State.boot.ready = true;
        State.boot.splashFinished = true;
        this.setProgress(100);
        return;
      }

      this.element.removeAttribute("aria-hidden");
      removeClass(this.element, "is-hidden");
      removeClass(this.element, "is-complete");

      this.setProgress(0);

      const start = performance.now();
      const duration =
        Number(CONFIG.splash?.duration) || 5000;

      const statuses = [
        [0, "جاري تشغيل الجوكر..."],
        [15, "جاري تجهيز الواجهة..."],
        [32, "جاري تجهيز الأقسام..."],
        [50, "جاري تجهيز التجربة..."],
        [68, "جاري تهيئة الاتصال..."],
        [82, "جاري تجهيز الألعاب والغرف..."],
        [94, "تقريبًا خلصنا..."],
        [100, "أهلاً بك في الجوكر 👑"]
      ];

      let lastStatus = "";

      await new Promise(resolve => {
        const tick = now => {
          const elapsed = now - start;

          const progress = clamp(
            (elapsed / duration) * 100,
            0,
            100
          );

          this.setProgress(progress);

          let currentStatus = statuses[0][1];

          for (const [threshold, text] of statuses) {
            if (progress >= threshold) {
              currentStatus = text;
            }
          }

          if (currentStatus !== lastStatus) {
            lastStatus = currentStatus;
            this.setStatus(currentStatus);
          }

          if (progress >= 100) {
            resolve();
            return;
          }

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });

      this.setProgress(100);
      this.setStatus("أهلاً بك في الجوكر 👑");

      await sleep(180);

      State.boot.ready = true;

      await this.finish();
    },

    async finish() {
      if (!this.element) {
        State.boot.splashFinished = true;
        return;
      }

      addClass(this.element, "is-complete");

      await sleep(500);

      addClass(this.element, "is-hidden");

      this.element.setAttribute(
        "aria-hidden",
        "true"
      );

      State.boot.splashFinished = true;

      window.dispatchEvent(
        new CustomEvent("joker:splashcomplete")
      );
    }
  };


  /* ==========================================================
     09 — NAVIGATION ENGINE
     ========================================================== */

  const Navigation = {
    normalizePage(page) {
      if (!page) return "home";

      return String(page)
        .replace(/^#/, "")
        .replace(/^page-/, "")
        .trim()
        .toLowerCase();
    },

    findPage(page) {
      const normalized = this.normalizePage(page);

      const candidates = [
        `[data-page="${normalized}"]`,
        `#page-${normalized}`,
        `.${normalized}-page`,
        `.joker-page[data-route="${normalized}"]`
      ];

      for (const selector of candidates) {
        const element = $(selector);

        if (element) {
          return element;
        }
      }

      return null;
    },

    updateNav(page) {
      const normalized = this.normalizePage(page);

      $$(".joker-nav__item, [data-nav]").forEach(item => {
        const itemPage =
          item.dataset.page ||
          item.dataset.nav ||
          item.getAttribute("href")?.replace("#", "");

        toggleClass(
          item,
          "is-active",
          this.normalizePage(itemPage) === normalized
        );
      });
    },

    updateURL(page) {
      const normalized = this.normalizePage(page);

      try {
        history.replaceState(
          {
            jokerPage: normalized
          },
          "",
          `#${normalized}`
        );
      } catch {
        location.hash = normalized;
      }
    },

    go(page, options = {}) {
      const normalized = this.normalizePage(page);

      const previous = State.navigation.currentPage;

      State.navigation.previousPage = previous;
      State.navigation.currentPage = normalized;

      const pages = $$(".joker-page");

      pages.forEach(section => {
        const sectionPage =
          section.dataset.page ||
          section.dataset.route ||
          section.id?.replace(/^page-/, "");

        toggleClass(
          section,
          "is-active",
          this.normalizePage(sectionPage) === normalized
        );
      });

      this.updateNav(normalized);

      if (!options.skipURL) {
        this.updateURL(normalized);
      }

      document.documentElement.dataset.page =
        normalized;

      document.body.dataset.page =
        normalized;

      window.dispatchEvent(
        new CustomEvent("joker:navigate", {
          detail: {
            page: normalized,
            previousPage: previous
          }
        })
      );

      this.afterNavigation(normalized);

      return normalized;
    },

    afterNavigation(page) {
      switch (page) {
        case "chat":
          Chat.mount();
          break;

        case "live":
          Live.mount();
          break;

        case "rooms":
        case "voice-rooms":
          Rooms.mount();
          break;

        case "games":
          Games.mount();
          break;

        case "wallet":
          Wallet.mount();
          break;

        case "store":
          StoreModule.mount();
          break;

        case "premium":
        case "club":
          Premium.mount();
          break;

        case "notifications":
          Notifications.mount();
          break;

        case "profile":
          Profile.mount();
          break;

        default:
          break;
      }
    },

    init() {
      delegate(
        document,
        "click",
        "[data-page], [data-nav], [data-route]",
        (event, target) => {
          const page =
            target.dataset.page ||
            target.dataset.nav ||
            target.dataset.route;

          if (!page) return;

          if (
            target.tagName === "A" &&
            target.getAttribute("href")?.startsWith("#")
          ) {
            event.preventDefault();
          }

          this.go(page);
        }
      );

      on(window, "popstate", () => {
        const page =
          location.hash.replace(/^#/, "") ||
          "home";

        this.go(page, {
          skipURL: true
        });
      });

      on(window, "hashchange", () => {
        const page =
          location.hash.replace(/^#/, "") ||
          "home";

        if (
          page !== State.navigation.currentPage
        ) {
          this.go(page, {
            skipURL: true
          });
        }
      });

      const initial =
        location.hash.replace(/^#/, "") ||
        "home";

      this.go(initial, {
        skipURL: true
      });
    }
  };

  window.JOKER.navigation = Navigation;


  /* ==========================================================
     10 — MOBILE SIDEBAR
     ========================================================== */

  const MobileUI = {
    sidebar() {
      const sidebar =
        $(".joker-sidebar");

      if (!sidebar) return;

      State.ui.sidebarOpen =
        !State.ui.sidebarOpen;

      toggleClass(
        sidebar,
        "is-open",
        State.ui.sidebarOpen
      );

      toggleClass(
        document.body,
        "sidebar-open",
        State.ui.sidebarOpen
      );
    },

    closeSidebar() {
      const sidebar =
        $(".joker-sidebar");

      State.ui.sidebarOpen = false;

      removeClass(sidebar, "is-open");
      removeClass(
        document.body,
        "sidebar-open"
      );
    },

    init() {
      delegate(
        document,
        "click",
        "[data-sidebar-toggle]",
        () => this.sidebar()
      );

      delegate(
        document,
        "click",
        "[data-sidebar-close]",
        () => this.closeSidebar()
      );

      delegate(
        document,
        "click",
        ".joker-nav__item",
        () => {
          if (window.innerWidth <= 900) {
            this.closeSidebar();
          }
        }
      );
    }
  };


  /* ==========================================================
     11 — MODAL SYSTEM
     ========================================================== */

  const Modal = {
    root: null,

    ensure() {
      this.root =
        byId("joker-modal-root");

      if (this.root) {
        return this.root;
      }

      this.root =
        document.createElement("div");

      this.root.id =
        "joker-modal-root";

      this.root.className =
        "joker-modal-root";

      this.root.innerHTML = `
        <div class="joker-modal-backdrop" data-modal-close></div>
        <div class="joker-modal" role="dialog" aria-modal="true">
          <button
            class="joker-icon-button joker-modal__close"
            type="button"
            aria-label="إغلاق"
            data-modal-close
          >×</button>

          <div class="joker-modal__content"></div>
        </div>
      `;

      document.body.appendChild(this.root);

      delegate(
        this.root,
        "click",
        "[data-modal-close]",
        () => this.close()
      );

      return this.root;
    },

    open(content, options = {}) {
      const root = this.ensure();
      const modal = $(".joker-modal", root);
      const body = $(".joker-modal__content", root);

      if (!body) return;

      if (typeof content === "string") {
        setHTML(body, content);
      } else if (content instanceof Node) {
        body.replaceChildren(content);
      }

      if (options.title) {
        body.insertAdjacentHTML(
          "afterbegin",
          `<h3 class="joker-modal__title">${escapeHTML(
            options.title
          )}</h3>`
        );
      }

      addClass(root, "is-open");
      addClass(document.body, "modal-open");

      State.ui.modalOpen = true;

      if (modal) {
        modal.setAttribute(
          "data-modal-size",
          options.size || "medium"
        );
      }

      window.dispatchEvent(
        new CustomEvent("joker:modalopen")
      );
    },

    close() {
      if (!this.root) return;

      removeClass(
        this.root,
        "is-open"
      );

      removeClass(
        document.body,
        "modal-open"
      );

      State.ui.modalOpen = false;

      window.dispatchEvent(
        new CustomEvent("joker:modalclose")
      );
    }
  };

  window.JOKER.modal = Modal;


  /* ==========================================================
     12 — DRAWER / SHEET
     ========================================================== */

  const Drawer = {
    root: null,

    ensure() {
      if (this.root) {
        return this.root;
      }

      this.root =
        document.createElement("aside");

      this.root.id =
        "joker-drawer";

      this.root.className =
        "joker-drawer";

      this.root.innerHTML = `
        <div class="joker-drawer__backdrop" data-drawer-close></div>

        <div class="joker-drawer__panel">
          <div class="joker-drawer__header">
            <strong class="joker-drawer__title">الجوكر</strong>

            <button
              type="button"
              class="joker-icon-button"
              data-drawer-close
              aria-label="إغلاق"
            >×</button>
          </div>

          <div class="joker-drawer__content"></div>
        </div>
      `;

      document.body.appendChild(this.root);

      delegate(
        this.root,
        "click",
        "[data-drawer-close]",
        () => this.close()
      );

      return this.root;
    },

    open(content, title = "الجوكر") {
      const root = this.ensure();

      setText(
        $(".joker-drawer__title", root),
        title
      );

      const body =
        $(".joker-drawer__content", root);

      if (typeof content === "string") {
        setHTML(body, content);
      } else if (content instanceof Node) {
        body.replaceChildren(content);
      }

      addClass(root, "is-open");
      State.ui.drawerOpen = true;
    },

    close() {
      if (!this.root) return;

      removeClass(
        this.root,
        "is-open"
      );

      State.ui.drawerOpen = false;
    }
  };

  window.JOKER.drawer = Drawer;


  /* ==========================================================
     13 — TOAST SYSTEM
     ========================================================== */

  const Toast = {
    root: null,

    ensure() {
      if (this.root) return;

      this.root =
        document.createElement("div");

      this.root.className =
        "joker-toast-stack";

      this.root.setAttribute(
        "aria-live",
        "polite"
      );

      document.body.appendChild(
        this.root
      );
    },

    show(message, type = "info", duration = 3500) {
      this.ensure();

      const toast =
        document.createElement("div");

      toast.className =
        `joker-toast joker-toast--${type}`;

      toast.innerHTML = `
        <span class="joker-toast__icon">
          ${type === "success" ? "✓" :
            type === "error" ? "!" :
            type === "warning" ? "⚠" : "👑"}
        </span>

        <span class="joker-toast__text"></span>

        <button
          type="button"
          class="joker-toast__close"
          aria-label="إغلاق"
        >×</button>
      `;

      setText(
        $(".joker-toast__text", toast),
        message
      );

      this.root.appendChild(toast);

      requestAnimationFrame(() => {
        addClass(toast, "is-visible");
      });

      const close = () => {
        removeClass(
          toast,
          "is-visible"
        );

        setTimeout(() => {
          toast.remove();
        }, 300);
      };

      on(
        $(".joker-toast__close", toast),
        "click",
        close
      );

      setTimeout(close, duration);
    }
  };

  window.JOKER.toast = Toast;


  /* ==========================================================
     14 — AUTH ENGINE
     ========================================================== */

  const Auth = {
    async checkSession() {
      try {
        const response =
          await API.get("/auth/session");

        if (
          response &&
          (response.authenticated ||
            response.user)
        ) {
          State.auth.status =
            "authenticated";

          State.auth.user =
            response.user || null;

          State.auth.session =
            response.session || null;

          return true;
        }

        State.auth.status =
          "guest";

        return false;
      } catch {
        /*
          عدم وجود backend في مرحلة التطوير
          لا يجب أن يمنع الموقع من الفتح.
        */

        State.auth.status =
          "guest";

        return false;
      }
    },

    async login(credentials) {
      try {
        const response =
          await API.post(
            "/auth/login",
            credentials
          );

        State.auth.status =
          "authenticated";

        State.auth.user =
          response.user || null;

        State.auth.session =
          response.session || null;

        window.dispatchEvent(
          new CustomEvent(
            "joker:login",
            {
              detail: response
            }
          )
        );

        return response;
      } catch (error) {
        Toast.show(
          error.message ||
          "تعذر تسجيل الدخول حاليًا",
          "error"
        );

        throw error;
      }
    },

    async logout() {
      try {
        await API.post(
          "/auth/logout",
          {}
        );
      } catch {
        /* backend may not exist yet */
      }

      State.auth.status = "guest";
      State.auth.user = null;
      State.auth.session = null;

      Storage.remove("session");

      window.dispatchEvent(
        new CustomEvent("joker:logout")
      );
    },

    async googleLogin() {
      /*
        الربط الحقيقي مع Google OAuth
        يتم من خلال Backend.
      */

      try {
        const response =
          await API.get(
            "/auth/google/start"
          );

        if (response?.url) {
          location.href = response.url;
        }
      } catch {
        Toast.show(
          "تسجيل Google يحتاج تفعيل خدمة المصادقة على الخادم.",
          "warning"
        );
      }
    }
  };

  window.JOKER.auth = Auth;


  /* ==========================================================
     15 — SEARCH ENGINE
     ========================================================== */

  const Search = {
    input: null,
    timer: null,

    init() {
      this.input =
        $(".joker-search input") ||
        $("[data-search-input]");

      if (!this.input) return;

      on(
        this.input,
        "input",
        () => {
          clearTimeout(this.timer);

          const query =
            this.input.value.trim();

          if (!query) {
            this.clear();
            return;
          }

          this.timer =
            setTimeout(() => {
              this.search(query);
            }, 350);
        }
      );

      on(
        this.input,
        "keydown",
        event => {
          if (event.key === "Enter") {
            event.preventDefault();

            this.search(
              this.input.value.trim()
            );
          }
        }
      );
    },

    async search(query) {
      if (!query) return;

      try {
        const response =
          await API.get(
            `/search?q=${encodeURIComponent(query)}`
          );

        window.dispatchEvent(
          new CustomEvent(
            "joker:search",
            {
              detail: {
                query,
                results: response
              }
            }
          )
        );

        return response;
      } catch {
        /*
          لا يتم إنشاء نتائج وهمية.
          عدم وجود Backend = لا نتائج مصطنعة.
        */

        Toast.show(
          "البحث يحتاج اتصالًا بخدمة المنصة.",
          "warning"
        );
      }
    },

    clear() {
      window.dispatchEvent(
        new CustomEvent(
          "joker:searchclear"
        )
      );
    }
  };


  /* ==========================================================
     16 — STORIES
     ========================================================== */

  const Stories = {
    async load() {
      try {
        const response =
          await API.get("/stories");

        State.data.stories =
          Array.isArray(response)
            ? response
            : response?.items || [];

        this.render();

        return State.data.stories;
      } catch {
        this.renderEmpty();
        return [];
      }
    },

    render() {
      const container =
        $(".joker-stories");

      if (!container) return;

      if (!State.data.stories.length) {
        this.renderEmpty();
        return;
      }

      setHTML(
        container,
        State.data.stories
          .map(story => `
            <button
              class="joker-story"
              type="button"
              data-story-id="${escapeHTML(
                story.id
              )}"
            >
              <span class="joker-story__ring">
                <img
                  class="joker-story__avatar"
                  src="${safeURL(
                    story.avatar
                  )}"
                  alt=""
                  loading="lazy"
                >
              </span>

              <span class="joker-story__name">
                ${escapeHTML(
                  story.name || ""
                )}
              </span>
            </button>
          `)
          .join("")
      );
    },

    renderEmpty() {
      const container =
        $(".joker-stories");

      if (!container) return;

      setHTML(
        container,
        `
        <div class="joker-empty">
          <div class="joker-empty__icon">◎</div>
          <strong>لا توجد قصص حاليًا</strong>
          <span>ستظهر القصص عندما ينشر أصحابها محتوى.</span>
        </div>
        `
      );
    },

    init() {
      delegate(
        document,
        "click",
        "[data-story-id]",
        (event, target) => {
          const id =
            target.dataset.storyId;

          if (!id) return;

          Toast.show(
            "سيتم فتح القصة من خدمة المحتوى عند توفرها.",
            "info"
          );
        }
      );
    }
  };


  /* ==========================================================
     17 — SOCIAL FEED
     ========================================================== */

  const Social = {
    async loadFeed() {
      try {
        const response =
          await API.get("/feed");

        State.data.posts =
          Array.isArray(response)
            ? response
            : response?.items || [];

        this.renderFeed();

        return State.data.posts;
      } catch {
        this.renderEmpty();
        return [];
      }
    },

    renderFeed() {
      const container =
        $("[data-feed]") ||
        $(".joker-feed");

      if (!container) return;

      if (!State.data.posts.length) {
        this.renderEmpty();
        return;
      }

      setHTML(
        container,
        State.data.posts
          .map(post => this.postTemplate(post))
          .join("")
      );
    },

    postTemplate(post) {
      return `
        <article
          class="joker-post"
          data-post-id="${escapeHTML(
            post.id || ""
          )}"
        >

          <header class="joker-post__header">

            <div class="joker-post__author">

              <img
                class="joker-avatar"
                src="${safeURL(
                  post.author?.avatar
                )}"
                alt=""
                loading="lazy"
              >

              <div>
                <strong>
                  ${escapeHTML(
                    post.author?.name || ""
                  )}
                </strong>

                <small>
                  ${escapeHTML(
                    post.createdAt
                      ? formatDate(post.createdAt)
                      : ""
                  )}
                </small>
              </div>

            </div>

            <button
              class="joker-icon-button"
              type="button"
              data-post-menu
              aria-label="خيارات"
            >⋯</button>

          </header>

          ${
            post.text
              ? `
              <div class="joker-post__text">
                ${escapeHTML(post.text)}
              </div>
              `
              : ""
          }

          ${
            post.media?.url
              ? `
              <div class="joker-post__media">
                <img
                  src="${safeURL(
                    post.media.url
                  )}"
                  alt=""
                  loading="lazy"
                >
              </div>
              `
              : ""
          }

          <div class="joker-post__actions">

            <button
              type="button"
              data-post-like
            >
              ♡
              <span>
                ${formatNumber(
                  post.likesCount || 0
                )}
              </span>
            </button>

            <button
              type="button"
              data-post-comment
            >
              ◌
              <span>
                ${formatNumber(
                  post.commentsCount || 0
                )}
              </span>
            </button>

            <button
              type="button"
              data-post-share
            >
              ↗
            </button>

            <button
              type="button"
              data-post-save
            >
              ♢
            </button>

          </div>

        </article>
      `;
    },

    renderEmpty() {
      const container =
        $("[data-feed]") ||
        $(".joker-feed");

      if (!container) return;

      setHTML(
        container,
        `
        <div class="joker-empty">
          <div class="joker-empty__icon">👑</div>
          <strong>لا توجد منشورات لعرضها الآن</strong>
          <span>
            عندما تتوفر منشورات حقيقية من المنصة ستظهر هنا.
          </span>
        </div>
        `
      );
    },

    async like(postId) {
      if (!postId) return;

      try {
        await API.post(
          `/posts/${encodeURIComponent(postId)}/like`,
          {}
        );
      } catch {
        Toast.show(
          "لم يتم تنفيذ الإعجاب. تحقق من الاتصال بالخادم.",
          "warning"
        );
      }
    },

    async share(postId) {
      if (!postId) return;

      const url =
        `${location.origin}${location.pathname}#post/${postId}`;

      if (
        navigator.share &&
        typeof navigator.share === "function"
      ) {
        try {
          await navigator.share({
            title: CONFIG.brand,
            url
          });
        } catch {
          /* cancelled */
        }

        return;
      }

      try {
        await navigator.clipboard.writeText(url);

        Toast.show(
          "تم نسخ رابط المنشور.",
          "success"
        );
      } catch {
        Toast.show(
          "تعذر نسخ الرابط.",
          "error"
        );
      }
    },

    init() {
      delegate(
        document,
        "click",
        "[data-post-like]",
        (event, button) => {
          const post =
            button.closest("[data-post-id]");

          this.like(
            post?.dataset.postId
          );
        }
      );

      delegate(
        document,
        "click",
        "[data-post-share]",
        (event, button) => {
          const post =
            button.closest("[data-post-id]");

          this.share(
            post?.dataset.postId
          );
        }
      );
    }
  };


  /* ==========================================================
     18 — CHAT ENGINE
     ========================================================== */

  const Chat = {
    activeConversation: null,

    mount() {
      this.initComposer();
    },

    async loadConversations() {
      try {
        const response =
          await API.get("/conversations");

        State.data.conversations =
          Array.isArray(response)
            ? response
            : response?.items || [];

        this.renderConversations();

        return State.data.conversations;
      } catch {
        this.renderConversationEmpty();
        return [];
      }
    },

    renderConversations() {
      const container =
        $("[data-conversations]");

      if (!container) return;

      if (
        !State.data.conversations.length
      ) {
        this.renderConversationEmpty();
        return;
      }

      setHTML(
        container,
        State.data.conversations
          .map(conversation => `
            <button
              type="button"
              class="joker-conversation"
              data-conversation-id="${escapeHTML(
                conversation.id
              )}"
            >

              <img
                class="joker-avatar"
                src="${safeURL(
                  conversation.avatar
                )}"
                alt=""
                loading="lazy"
              >

              <span class="joker-conversation__body">
                <strong>
                  ${escapeHTML(
                    conversation.name || ""
                  )}
                </strong>

                <small>
                  ${escapeHTML(
                    conversation.lastMessage || ""
                  )}
                </small>
              </span>

              ${
                conversation.unreadCount
                  ? `
                    <span class="joker-nav__badge">
                      ${formatNumber(
                        conversation.unreadCount
                      )}
                    </span>
                  `
                  : ""
              }

            </button>
          `)
          .join("")
      );
    },

    renderConversationEmpty() {
      const container =
        $("[data-conversations]");

      if (!container) return;

      setHTML(
        container,
        `
        <div class="joker-empty">
          <div class="joker-empty__icon">💬</div>
          <strong>لا توجد محادثات</strong>
          <span>ستظهر محادثاتك الحقيقية هنا.</span>
        </div>
        `
      );
    },

    async openConversation(id) {
      if (!id) return;

      this.activeConversation = id;

      try {
        const response =
          await API.get(
            `/conversations/${encodeURIComponent(id)}/messages`
          );

        this.renderMessages(
          Array.isArray(response)
            ? response
            : response?.items || []
        );
      } catch {
        this.renderMessages([]);
        Toast.show(
          "تعذر تحميل الرسائل حاليًا.",
          "warning"
        );
      }
    },

    renderMessages(messages) {
      const container =
        $("[data-chat-messages]") ||
        $(".joker-chat__messages");

      if (!container) return;

      if (!messages.length) {
        setHTML(
          container,
          `
          <div class="joker-empty">
            <div class="joker-empty__icon">💬</div>
            <strong>ابدأ المحادثة</strong>
            <span>لا توجد رسائل لعرضها.</span>
          </div>
          `
        );

        return;
      }

      setHTML(
        container,
        messages
          .map(message => `
            <div
              class="
                joker-message
                ${
                  message.mine
                    ? "joker-message--mine"
                    : ""
                }
              "
              data-message-id="${escapeHTML(
                message.id || ""
              )}"
            >
              ${
                message.text
                  ? `
                    <div class="joker-message__bubble">
                      ${escapeHTML(
                        message.text
                      )}
                    </div>
                  `
                  : ""
              }

              <time>
                ${escapeHTML(
                  message.createdAt
                    ? formatDate(
                        message.createdAt
                      )
                    : ""
                )}
              </time>
            </div>
          `)
          .join("")
      );

      container.scrollTop =
        container.scrollHeight;
    },

    initComposer() {
      const composer =
        $("[data-chat-composer]");

      if (!composer) return;

      on(
        composer,
        "submit",
        async event => {
          event.preventDefault();

          const input =
            composer.querySelector(
              "textarea, input[name='message']"
            );

          if (!input) return;

          const text =
            input.value.trim();

          if (!text) return;

          if (!this.activeConversation) {
            Toast.show(
              "اختر محادثة أولًا.",
              "warning"
            );

            return;
          }

          try {
            await API.post(
              `/conversations/${encodeURIComponent(
                this.activeConversation
              )}/messages`,
              {
                text
              }
            );

            input.value = "";

            await this.openConversation(
              this.activeConversation
            );
          } catch {
            Toast.show(
              "تعذر إرسال الرسالة حاليًا.",
              "error"
            );
          }
        }
      );
    },

    init() {
      delegate(
        document,
        "click",
        "[data-conversation-id]",
        (event, target) => {
          this.openConversation(
            target.dataset.conversationId
          );
        }
      );

      this.initComposer();
    }
  };


  /* ==========================================================
     19 — REALTIME ENGINE
     ========================================================== */

  const Realtime = {
    socket: null,

    connect() {
      /*
        WebSocket الحقيقي يحتاج Backend.
        نحاول الاتصال فقط عندما يكون endpoint
        محددًا صراحة.
      */

      const endpoint =
        CONFIG.realtime?.url;

      if (!endpoint) {
        return false;
      }

      try {
        this.socket =
          new WebSocket(endpoint);

        on(
          this.socket,
          "open",
          () => {
            State.realtime.connected = true;

            window.dispatchEvent(
              new CustomEvent(
                "joker:realtime:connected"
              )
            );
          }
        );

        on(
          this.socket,
          "message",
          event => {
            const data =
              safeJSONParse(
                event.data,
                null
              );

            if (!data) return;

            this.handle(data);
          }
        );

        on(
          this.socket,
          "close",
          () => {
            State.realtime.connected =
              false;

            window.dispatchEvent(
              new CustomEvent(
                "joker:realtime:disconnected"
              )
            );
          }
        );

        on(
          this.socket,
          "error",
          () => {
            State.realtime.connected =
              false;
          }
        );

        return true;
      } catch {
        return false;
      }
    },

    send(type, payload = {}) {
      if (
        !this.socket ||
        this.socket.readyState !== WebSocket.OPEN
      ) {
        return false;
      }

      this.socket.send(
        JSON.stringify({
          type,
          payload
        })
      );

      return true;
    },

    handle(message) {
      window.dispatchEvent(
        new CustomEvent(
          `joker:realtime:${message.type || "message"}`,
          {
            detail: message.payload
          }
        )
      );
    }
  };

  window.JOKER.realtime = Realtime;


  /* ==========================================================
     20 — LIVE ENGINE
     ========================================================== */

  const Live = {
    mounted: false,

    mount() {
      if (this.mounted) return;

      this.mounted = true;

      this.load();
    },

    async load() {
      try {
        const response =
          await API.get("/live");

        State.data.liveStreams =
          Array.isArray(response)
            ? response
            : response?.items || [];

        this.render();
      } catch {
        this.renderEmpty();
      }
    },

    render() {
      const container =
        $("[data-live-list]") ||
        $(".joker-live-grid");

      if (!container) return;

      if (!State.data.liveStreams.length) {
        this.renderEmpty();
        return;
      }

      setHTML(
        container,
        State.data.liveStreams
          .map(stream => this.card(stream))
          .join("")
      );
    },

    card(stream) {
      return `
        <article
          class="joker-live-card"
          data-live-id="${escapeHTML(
            stream.id || ""
          )}"
        >

          <div class="joker-live-card__media">

            <img
              src="${safeURL(
                stream.thumbnail
              )}"
              alt=""
              loading="lazy"
            >

            <span class="joker-live-card__badge">
              LIVE
            </span>

          </div>

          <div class="joker-live-card__body">

            <div class="joker-live-card__author">

              <img
                class="joker-avatar joker-avatar--sm"
                src="${safeURL(
                  stream.host?.avatar
                )}"
                alt=""
                loading="lazy"
              >

              <div>
                <strong>
                  ${escapeHTML(
                    stream.host?.name || ""
                  )}
                </strong>

                <small>
                  ${escapeHTML(
                    stream.title || ""
                  )}
                </small>
              </div>

            </div>

            <button
              class="joker-button joker-button--primary"
              type="button"
              data-join-live
            >
              دخول البث
            </button>

          </div>

        </article>
      `;
    },

    renderEmpty() {
      const container =
        $("[data-live-list]") ||
        $(".joker-live-grid");

      if (!container) return;

      setHTML(
        container,
        `
        <div class="joker-empty">
          <div class="joker-empty__icon">🔴</div>
          <strong>لا يوجد بث مباشر الآن</strong>
          <span>
            ستظهر البثوث الحقيقية هنا عند بدء البث.
          </span>
        </div>
        `
      );
    },

    async join(id) {
      if (!id) return;

      try {
        const response =
          await API.post(
            `/live/${encodeURIComponent(id)}/join`,
            {}
          );

        window.dispatchEvent(
          new CustomEvent(
            "joker:live:joined",
            {
              detail: response
            }
          )
        );
      } catch {
        Toast.show(
          "تعذر الدخول إلى البث.",
          "error"
        );
      }
    },

    init() {
      delegate(
        document,
        "click",
        "[data-join-live]",
        (event, target) => {
          const card =
            target.closest("[data-live-id]");

          this.join(
            card?.dataset.liveId
          );
        }
      );
    }
  };


  /* ==========================================================
     21 — VOICE ROOMS
     ========================================================== */

  const Rooms = {
    async mount() {
      await this.load();
    },

    async load() {
      try {
        const response =
          await API.get("/rooms");

        State.data.rooms =
          Array.isArray(response)
            ? response
            : response?.items || [];

        this.render();
      } catch {
        this.renderEmpty();
      }
    },

    render() {
      const container =
        $("[data-rooms-list]") ||
        $(".joker-rooms-grid");

      if (!container) return;

      if (!State.data.rooms.length) {
        this.renderEmpty();
        return;
      }

      setHTML(
        container,
        State.data.rooms
          .map(room => `
            <article
              class="joker-room-card"
              data-room-id="${escapeHTML(
                room.id || ""
              )}"
            >

              <div
                class="joker-room-card__cover"
                style="
                  background-image:
                  url('${safeURL(
                    room.cover
                  )}');
                "
              ></div>

              <div class="joker-room-card__body">

                <div class="joker-room-card__title">
                  ${escapeHTML(
                    room.name || ""
                  )}
                </div>

                <div class="joker-room-card__owner">
                  <img
                    class="joker-avatar joker-avatar--sm"
                    src="${safeURL(
                      room.owner?.avatar
                    )}"
                    alt=""
                  >

                  <span>
                    ${escapeHTML(
                      room.owner?.name || ""
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  class="joker-button joker-button--primary"
                  data-join-room
                >
                  دخول الغرفة
                </button>

              </div>

            </article>
          `)
          .join("")
      );
    },

    renderEmpty() {
      const container =
        $("[data-rooms-list]") ||
        $(".joker-rooms-grid");

      if (!container) return;

      setHTML(
        container,
        `
        <div class="joker-empty">
          <div class="joker-empty__icon">🎙</div>
          <strong>لا توجد غرف متاحة الآن</strong>
          <span>
            الغرف ستظهر هنا عندما تكون متاحة فعليًا.
          </span>
        </div>
        `
      );
    },

    async join(id) {
      if (!
