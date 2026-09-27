(function () {
  "use strict";

  /*
   * Global application state.
   *
   * مهم:
   * لا توجد هنا أرصدة أو مستخدمين أو رسائل وهمية.
   * البيانات الحقيقية تأتي من API.
   */

  const state = {

    app: {
      ready: false,
      loading: true,
      apiOnline: false,
      version: "1.0.0"
    },

    auth: {
      authenticated: false,
      user: null,
      session: null
    },

    navigation: {
      currentRoute: "home",
      previousRoute: null
    },

    notifications: {
      unreadCount: null
    },

    wallet: {
      loaded: false,
      balance: null,
      currency: null
    },

    rooms: {
      loaded: false,
      items: []
    },

    feed: {
      loaded: false,
      items: []
    },

    ui: {
      drawerOpen: false,
      accountMenuOpen: false,
      searchOpen: false
    }

  };


  function clone(value) {
    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value));
  }


  function getState() {
    return clone(state);
  }


  function get(path) {

    if (!path) {
      return getState();
    }

    const parts = path.split(".");
    let current = state;

    for (const part of parts) {

      if (
        current === null ||
        current === undefined ||
        !(part in current)
      ) {
        return undefined;
      }

      current = current[part];
    }

    return clone(current);
  }


  function set(path, value) {

    const parts = path.split(".");
    let current = state;

    for (let i = 0; i < parts.length - 1; i++) {

      const part = parts[i];

      if (
        typeof current[part] !== "object" ||
        current[part] === null
      ) {
        current[part] = {};
      }

      current = current[part];
    }

    current[parts[parts.length - 1]] = value;

    window.dispatchEvent(
      new CustomEvent("malak:state-change", {
        detail: {
          path,
          value: clone(value)
        }
      })
    );

    return value;
  }


  function update(path, updater) {

    const oldValue = get(path);
    const newValue = updater(oldValue);

    return set(path, newValue);
  }


  window.MalakState = {
    getState,
    get,
    set,
    update
  };

})();
