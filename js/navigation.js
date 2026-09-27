(function () {
  "use strict";


  const routeAliases = {
    home: "home",
    discover: "discover",
    chat: "chat",
    rooms: "rooms",
    games: "games",
    videos: "videos",
    profile: "profile",
    friends: "friends",
    groups: "groups",
    wallet: "wallet",
    store: "store",
    club: "club",
    notifications: "notifications",
    settings: "settings",
    calls: "calls",
    map: "map"
  };


  function normalizeRoute(route) {

    route =
      String(route || "")
        .replace(/^#/, "")
        .trim()
        .toLowerCase();

    return routeAliases[route]
      ? route
      : "home";
  }


  function getCurrentRoute() {

    return normalizeRoute(
      window.location.hash
    );

  }


  function setActiveNavigation(route) {

    document
      .querySelectorAll(
        "[data-route]"
      )
      .forEach((element) => {

        element.classList.toggle(
          "active",
          element.dataset.route === route
        );

      });

  }


  function showPage(route) {

    document
      .querySelectorAll(
        ".page[data-page]"
      )
      .forEach((page) => {

        const active =
          page.dataset.page === route;

        page.hidden = !active;

        page.classList.toggle(
          "active-page",
          active
        );

      });

  }


  function navigate(route) {

    route =
      normalizeRoute(route);

    const current =
      getCurrentRoute();


    if (current !== route) {

      window.location.hash =
        route;

      return;
    }


    if (
      window.MalakState
    ) {

      window.MalakState.set(
        "navigation.previousRoute",
        window.MalakState.get(
          "navigation.currentRoute"
        )
      );

      window.MalakState.set(
        "navigation.currentRoute",
        route
      );

    }


    setActiveNavigation(route);
    showPage(route);


    window.dispatchEvent(
      new CustomEvent(
        "malak:navigate",
        {
          detail: {
            route
          }
        }
      )
    );

  }


  function handleHash() {

    const route =
      getCurrentRoute();

    navigate(route);

  }


  function init() {

    window.addEventListener(
      "hashchange",
      handleHash
    );

    document.addEventListener(
      "click",
      (event) => {

        const link =
          event.target.closest(
            "[data-route]"
          );

        if (!link) {
          return;
        }

        const route =
          normalizeRoute(
            link.dataset.route
          );

        if (
          route === "home" ||
          document.querySelector(
            `.page[data-page="${route}"]`
          )
        ) {
          return;
        }

        event.preventDefault();

        navigate(route);

      }
    );


    handleHash();

  }


  window.MalakNavigation = {
    init,
    navigate,
    getCurrentRoute
  };

})();
