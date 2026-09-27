(function () {
  "use strict";


  let loaderProgress = 0;
  let loaderTimer = null;


  function $(selector) {
    return document.querySelector(selector);
  }


  function setLoaderProgress(
    value,
    status
  ) {

    loaderProgress =
      Math.max(
        0,
        Math.min(100, value)
      );


    const bar =
      $("#loader-progress-bar");

    if (bar) {
      bar.style.width =
        `${loaderProgress}%`;
    }


    const statusElement =
      $("#loader-status");

    if (
      statusElement &&
      status
    ) {
      statusElement.textContent =
        status;
    }

  }


  function hideLoader() {

    const loader =
      $("#app-loader");

    const app =
      $("#app");


    if (loader) {
      loader.classList.add(
        "is-hidden"
      );
    }


    if (app) {
      app.classList.remove(
        "is-loading"
      );
    }


    window.MalakState?.set(
      "app.loading",
      false
    );

  }


  function showToast(
    message,
    type = "info"
  ) {

    const container =
      $("#toast-container");

    if (!container) {
      return;
    }


    const toast =
      document.createElement("div");

    toast.className =
      `toast ${type}`;


    const icon =
      document.createElement("span");

    icon.className =
      "toast-icon";

    icon.textContent =
      type === "error"
        ? "!"
        : type === "success"
          ? "✓"
          : "•";


    const text =
      document.createElement("span");

    text.textContent =
      message;


    toast.append(
      icon,
      text
    );

    container.appendChild(
      toast
    );


    setTimeout(() => {

      toast.style.opacity = "0";
      toast.style.transform =
        "translateY(8px)";

      setTimeout(
        () => toast.remove(),
        250
      );

    }, 3500);

  }


  function openDrawer() {

    const drawer =
      $("#mobile-drawer");

    const backdrop =
      $("#drawer-backdrop");

    if (!drawer) {
      return;
    }

    drawer.classList.add(
      "open"
    );

    drawer.setAttribute(
      "aria-hidden",
      "false"
    );

    if (backdrop) {
      backdrop.hidden = false;
    }

    document.body.classList.add(
      "no-scroll"
    );

    window.MalakState?.set(
      "ui.drawerOpen",
      true
    );

  }


  function closeDrawer() {

    const drawer =
      $("#mobile-drawer");

    const backdrop =
      $("#drawer-backdrop");


    if (drawer) {

      drawer.classList.remove(
        "open"
      );

      drawer.setAttribute(
        "aria-hidden",
        "true"
      );

    }


    if (backdrop) {
      backdrop.hidden = true;
    }


    document.body.classList.remove(
      "no-scroll"
    );


    window.MalakState?.set(
      "ui.drawerOpen",
      false
    );

  }


  function openSearch() {

    const modal =
      $("#search-modal");

    const input =
      $("#command-search-input");


    if (!modal) {
      return;
    }


    modal.hidden = false;

    window.MalakState?.set(
      "ui.searchOpen",
      true
    );


    requestAnimationFrame(() => {

      input?.focus();

    });

  }


  function closeSearch() {

    const modal =
      $("#search-modal");

    if (!modal) {
      return;
    }


    modal.hidden = true;

    window.MalakState?.set(
      "ui.searchOpen",
      false
    );

  }


  function toggleAccountMenu() {

    const menu =
      $("#account-menu");

    if (!menu) {
      return;
    }


    const isHidden =
      menu.hidden;


    menu.hidden =
      !isHidden;


    window.MalakState?.set(
      "ui.accountMenuOpen",
      isHidden
    );

  }


  function closeAccountMenu() {

    const menu =
      $("#account-menu");

    if (!menu) {
      return;
    }

    menu.hidden = true;

    window.MalakState?.set(
      "ui.accountMenuOpen",
      false
    );

  }


  async function checkBackend() {

    try {

      /*
       * هذا endpoint يجب أن يكون موجودًا
       * في الـBackend الحقيقي.
       *
       * لو غير موجود، لا نخلق بيانات بديلة.
       */

      await window.MalakAPI.get(
        "health"
      );


      window.MalakState.set(
        "app.apiOnline",
        true
      );


      return true;

    } catch {

      window.MalakState.set(
        "app.apiOnline",
        false
      );


      return false;

    }

  }


  async function loadAuthenticatedUser() {

    try {

      const result =
        await window.MalakAPI.get(
          "auth/session"
        );


      /*
       * Backend هو مصدر الحقيقة.
       */

      if (
        result &&
        result.authenticated &&
        result.user
      ) {

        window.MalakState.set(
          "auth.authenticated",
          true
        );

        window.MalakState.set(
          "auth.user",
          result.user
        );

        window.MalakState.set(
          "auth.session",
          result.session || null
        );


        renderUser(
          result.user
        );

      } else {

        renderGuest();

      }


    } catch {

      /*
       * عدم الاتصال لا يعني إنشاء مستخدم وهمي.
       */

      renderGuest(
        "تعذر تحميل الحساب"
      );

    }

  }


  function renderUser(user) {

    const name =
      user.displayName ||
      user.name ||
      user.username ||
      "مستخدم";


    const accountName =
      $("#account-name");

    const accountStatus =
      $("#account-status");

    const sideName =
      $("#side-account-name");

    const sideDescription =
      $("#side-account-description");


    if (accountName) {
      accountName.textContent =
        name;
    }

    if (accountStatus) {
      accountStatus.textContent =
        "متصل";
    }

    if (sideName) {
      sideName.textContent =
        name;
    }

    if (sideDescription) {
      sideDescription.textContent =
        user.bio ||
        "حساب ملك خفاجي";
    }

  }


  function renderGuest(
    message = "اتصل بحسابك"
  ) {

    window.MalakState.set(
      "auth.authenticated",
      false
    );

    window.MalakState.set(
      "auth.user",
      null
    );


    const accountName =
      $("#account-name");

    const accountStatus =
      $("#account-status");

    const sideName =
      $("#side-account-name");

    const sideDescription =
      $("#side-account-description");


    if (accountName) {
      accountName.textContent =
        "غير مسجل";
    }

    if (accountStatus) {
      accountStatus.textContent =
        message;
    }

    if (sideName) {
      sideName.textContent =
        "لم يتم تسجيل الدخول";
    }

    if (sideDescription) {
      sideDescription.textContent =
        "سجل الدخول للوصول إلى حسابك";
    }

  }


  function go(route) {

    window.MalakNavigation?.navigate(
      route
    );

  }


  async function logout() {

    try {

      await window.MalakAPI.post(
        "auth/logout"
      );

      renderGuest();

      showToast(
        "تم تسجيل الخروج.",
        "success"
      );

      go("home");

    } catch (error) {

      showToast(
        error.message ||
        "تعذر تسجيل الخروج.",
        "error"
      );

    }

  }


  function handleAction(action) {

    switch (action) {

      case "notifications":
        go("notifications");
        break;

      case "messages":
        go("chat");
        break;

      case "discover":
        go("discover");
        break;

      case "rooms":
        go("rooms");
        break;

      case "games":
        go("games");
        break;

      case "videos":
        go("videos");
        break;

      case "profile":
        go("profile");
        break;

      case "wallet":
        go("wallet");
        break;

      case "store":
        go("store");
        break;

      case "club":
        go("club");
        break;

      case "settings":
        go("settings");
        break;

      case "login":

        /*
         * صفحة Auth حقيقية ستأتي في المرحلة التالية.
         */

        window.location.href =
          "auth/login.html";

        break;

      case "logout":
        logout();
        break;

      case "account-menu":
        toggleAccountMenu();
        break;

      case "close-drawer":
        closeDrawer();
        break;

      case "close-search":
        closeSearch();
        break;

      case "service":

        showToast(
          "مركز المساعدة سيتم ربطه بخدمة الدعم.",
          "info"
        );

        break;

      case "create":

        showToast(
          "سيتم فتح أدوات الإنشاء بعد ربط خدمة المحتوى.",
          "info"
        );

        break;

      default:

        showToast(
          "هذا القسم سيتم تفعيله ضمن وحدته الخاصة.",
          "info"
        );

    }

  }


  function bindEvents() {

    document.addEventListener(
      "click",
      (event) => {

        const actionElement =
          event.target.closest(
            "[data-action]"
          );


        if (
          actionElement
        ) {

          handleAction(
            actionElement.dataset.action
          );

        }

      }
    );


    $("#mobile-menu-button")
      ?.addEventListener(
        "click",
        openDrawer
      );


    $("#drawer-backdrop")
      ?.addEventListener(
        "click",
        closeDrawer
      );


    $("#global-search")
      ?.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          openSearch();

        }
      );


    $("#global-search-input")
      ?.addEventListener(
        "focus",
        openSearch
      );


    document.addEventListener(
      "keydown",
      (event) => {

        if (
          (event.ctrlKey ||
           event.metaKey) &&
          event.key.toLowerCase() === "k"
        ) {

          event.preventDefault();

          openSearch();

        }


        if (
          event.key === "Escape"
        ) {

          closeSearch();
          closeAccountMenu();
          closeDrawer();

        }

      }
    );


    document.addEventListener(
      "click",
      (event) => {

        const menu =
          $("#account-menu");

        const trigger =
          event.target.closest(
            '[data-action="account-menu"]'
          );

        if (
          menu &&
          !menu.hidden &&
          !trigger &&
          !event.target.closest(
            "#account-menu"
          )
        ) {

          closeAccountMenu();

        }

      }
    );

  }


  async function boot() {

    try {

      setLoaderProgress(
        12,
        "جاري تشغيل النواة..."
      );


      if (
        !window.MalakState ||
        !window.MalakAPI
      ) {

        throw new Error(
          "تعذر تحميل ملفات النواة."
        );

      }


      setLoaderProgress(
        28,
        "جاري تجهيز النظام..."
      );


      window.MalakNavigation?.init();


      setLoaderProgress(
        45,
        "جاري الاتصال بالخدمات..."
      );


      const backendOnline =
        await checkBackend();


      setLoaderProgress(
        65,
        backendOnline
          ? "تم الاتصال بالخادم."
          : "الخادم غير متاح حاليًا."
      );


      await loadAuthenticatedUser();


      setLoaderProgress(
        82,
        "جاري تجهيز الواجهة..."
      );


      bindEvents();


      setLoaderProgress(
        100,
        backendOnline
          ? "اكتملت المنصة."
          : "تم تشغيل الواجهة."
      );


      window.MalakState.set(
        "app.ready",
        true
      );


      /*
       * الحدث هنا موجود، لكن loader
       * لا يعتمد عليه وحده.
       */

      window.dispatchEvent(
        new CustomEvent(
          "malak:app-ready"
        )
      );


      setTimeout(
        hideLoader,
        250
      );


    } catch (error) {

      console.error(
        "Malak boot error:",
        error
      );


      setLoaderProgress(
        100,
        "تم تشغيل الوضع الأساسي."
      );


      showToast(
        "تعذر تحميل بعض الخدمات. يمكنك المحاولة مرة أخرى.",
        "error"
      );


      /*
       * لا نترك الـLoader عالقًا.
       */

      setTimeout(
        hideLoader,
        500
      );

    }

  }


  /*
   * Fallback مستقل:
   * حتى لو حصل خطأ في مرحلة من مراحل التشغيل،
   * لن تبقى شاشة التحميل معلقة للأبد.
   */

  loaderTimer =
    setTimeout(() => {

      if (
        window.MalakState?.get(
          "app.ready"
        )
      ) {
        return;
      }

      setLoaderProgress(
        100,
        "تم تشغيل الواجهة الأساسية."
      );

      hideLoader();

    }, 8000);


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      boot,
      {
        once: true
      }
    );

  } else {

    boot();

  }


  window.MalakApp = {
    boot,
    go,
    showToast,
    openSearch,
    closeSearch,
    openDrawer,
    closeDrawer
  };

})();
