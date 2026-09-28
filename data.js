/* =========================================================
   JOKER
   data.js
   Shared configuration + local state schema
========================================================= */

window.JOKER = window.JOKER || {};

JOKER.config = {

  appName: "الجوكر",

  version: "1.0.0",

  environment: "frontend",

  backendConnected: false,

  features: {

    authentication: true,

    googleAuth: false,

    realtimeChat: false,

    voiceRooms: false,

    videoCalls: false,

    games: false,

    wallet: false,

    notifications: false

  }

};


/* =========================================================
   STATIC UI CONTENT
========================================================= */

JOKER.ui = {

  pages: [
    "home",
    "discover",
    "rooms",
    "games",
    "chat",
    "friends",
    "notifications",
    "profile",
    "wallet",
    "store"
  ],

  searchCategories: [
    "الأشخاص",
    "الرومات",
    "الألعاب",
    "المجتمعات"
  ]

};


/* =========================================================
   USER STATE
========================================================= */

JOKER.defaultUser = {

  id: null,

  name: "",

  email: "",

  avatar: "",

  bio: "",

  level: 1,

  coins: 0,

  friendsCount: 0,

  followersCount: 0,

  roomsCount: 0,

  online: true

};


/* =========================================================
   LOCAL APPLICATION STATE
========================================================= */

JOKER.state = {

  initialized: false,

  authenticated: false,

  currentPage: "home",

  theme: "dark",

  user: {
    ...JOKER.defaultUser
  },

  camera: {

    active: false,

    stream: null,

    muted: false

  },

  sidebarOpen: false,

  currentModal: null

};


/* =========================================================
   STORAGE
========================================================= */

JOKER.storage = {

  key: "joker_local_state_v1",

  load() {

    try {

      const raw =
        localStorage.getItem(this.key);

      if (!raw) return null;

      return JSON.parse(raw);

    } catch (error) {

      console.warn(
        "Joker storage load failed:",
        error
      );

      return null;

    }

  },

  save(state) {

    try {

      localStorage.setItem(
        this.key,
        JSON.stringify(state)
      );

    } catch (error) {

      console.warn(
        "Joker storage save failed:",
        error
      );

    }

  },

  clear() {

    try {

      localStorage.removeItem(this.key);

    } catch (error) {

      console.warn(
        "Joker storage clear failed:",
        error
      );

    }

  }

};


/* =========================================================
   SAFE STATE MERGE
========================================================= */

JOKER.mergeState = function(saved) {

  if (!saved || typeof saved !== "object") {

    return;

  }

  JOKER.state = {

    ...JOKER.state,

    ...saved,

    user: {

      ...JOKER.defaultUser,

      ...(saved.user || {})

    },

    camera: {

      ...JOKER.state.camera,

      ...(saved.camera || {})

    }

  };

};


/* =========================================================
   SEARCH
========================================================= */

JOKER.search = {

  query: "",

  results: [],

  /**
   * لا يوجد مصدر بيانات اجتماعي حقيقي في هذه الدفعة.
   * لذلك لا نُنشئ أشخاصًا وهميين.
   */
  execute(query) {

    this.query = String(query || "").trim();

    this.results = [];

    return this.results;

  }

};


/* =========================================================
   BACKEND CONTRACT
========================================================= */

JOKER.backend = {

  baseURL: "",

  endpoints: {

    login: "/auth/login",

    register: "/auth/register",

    google: "/auth/google",

    me: "/users/me",

    users: "/users",

    friends: "/friends",

    chats: "/chats",

    messages: "/messages",

    rooms: "/rooms",

    games: "/games",

    notifications: "/notifications",

    wallet: "/wallet"

  }

};


/* =========================================================
   EVENTS BUS
========================================================= */

JOKER.events = {

  listeners: {},

  on(event, callback) {

    if (!this.listeners[event]) {

      this.listeners[event] = [];

    }

    this.listeners[event].push(callback);

  },

  emit(event, payload) {

    const callbacks =
      this.listeners[event] || [];

    callbacks.forEach(callback => {

      try {

        callback(payload);

      } catch (error) {

        console.error(
          `Joker event "${event}" failed:`,
          error
        );

      }

    });

  }

};


/* =========================================================
   INITIAL LOAD
========================================================= */

(function loadJokerState() {

  const saved =
    JOKER.storage.load();

  if (saved) {

    JOKER.mergeState(saved);

  }

})();
