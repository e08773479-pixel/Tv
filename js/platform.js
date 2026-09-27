/* =========================================================
   MALAK KHAFAJI — PLATFORM CORE
   Shared identity / API / navigation / session
========================================================= */

(() => {
  "use strict";

  const CONFIG = {
    API_BASE: "/api",
    APP_NAME: "ملك خفاجي",
    VERSION: "1.0.0"
  };

  const Platform = {

    config: CONFIG,

    state: {
      user: null,
      notifications: [],
      unreadMessages: 0,
      connected: false
    },

    /* -----------------------------
       API
    ----------------------------- */

    async request(endpoint, options = {}) {

      const controller = new AbortController();

      const timeout = setTimeout(
        () => controller.abort(),
        options.timeout || 15000
      );

      try {

        const response = await fetch(
          CONFIG.API_BASE + endpoint,
          {
            method: options.method || "GET",

            headers: {
              "Content-Type": "application/json",

              ...(options.headers || {})
            },

            credentials: "include",

            body:
              options.body
                ? JSON.stringify(options.body)
                : undefined,

            signal: controller.signal
          }
        );

        let data = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {

          throw new Error(
            data?.message ||
            `API Error ${response.status}`
          );
        }

        return data;

      } finally {

        clearTimeout(timeout);
      }
    },

    /* -----------------------------
       AUTH
    ----------------------------- */

    async loadCurrentUser() {

      try {

        const result =
          await this.request("/auth/me");

        this.state.user =
          result.user || null;

        this.state.connected = true;

        this.renderIdentity();

        return this.state.user;

      } catch (error) {

        this.state.user = null;
        this.state.connected = false;

        this.renderIdentity();

        return null;
      }
    },

    async logout() {

      try {
        await this.request(
          "/auth/logout",
          {
            method: "POST"
          }
        );
      } finally {

        window.location.href =
          "/auth/login.html";
      }
    },

    /* -----------------------------
       NAVIGATION
    ----------------------------- */

    go(url) {
      window.location.href = url;
    },

    /* -----------------------------
       USER UI
    ----------------------------- */

    renderIdentity() {

      const user =
        this.state.user;

      document
        .querySelectorAll("[data-user-name]")
        .forEach(el => {

          el.textContent =
            user?.name || "الحساب";
        });

      document
        .querySelectorAll("[data-user-avatar]")
        .forEach(el => {

          if (user?.avatar) {

            el.src = user.avatar;

          } else {

            el.removeAttribute("src");
            el.classList.add("avatar-empty");
          }
        });

      document
        .querySelectorAll("[data-user-coins]")
        .forEach(el => {

          if (
            typeof user?.coins === "number"
          ) {

            el.textContent =
              user.coins.toLocaleString("ar-EG");

          } else {

            el.textContent = "—";
          }
        });
    },

    /* -----------------------------
       TOAST
    ----------------------------- */

    toast(message, type = "info") {

      const root =
        document.querySelector(
          "#malak-toast-root"
        );

      if (!root) return;

      const item =
        document.createElement("div");

      item.className =
        `malak-toast malak-toast-${type}`;

      item.textContent = message;

      root.appendChild(item);

      requestAnimationFrame(() => {
        item.classList.add("show");
      });

      setTimeout(() => {

        item.classList.remove("show");

        setTimeout(() => {
          item.remove();
        }, 250);

      }, 3000);
    },

    /* -----------------------------
       LOADING
    ----------------------------- */

    setLoading(element, loading) {

      if (!element) return;

      element.disabled = loading;

      element.classList.toggle(
        "is-loading",
        loading
      );
    }
  };

  window.Malak = Platform;

  document.addEventListener(
    "DOMContentLoaded",
    async () => {

      await Platform.loadCurrentUser();

      window.dispatchEvent(
        new CustomEvent(
          "malak:ready"
        )
      );
    }
  );

})();
