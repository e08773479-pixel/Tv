/* =========================================================
   JOKER — DATA LAYER
   لا توجد بيانات مستخدمين وهمية هنا.
========================================================= */

"use strict";


window.JOKER_DATA = {

  app: {
    name: "الجوكر",
    version: "1.0.0",
    locale: "ar-EG"
  },


  /*
   * الحساب الحالي.
   *
   * null = لا يوجد مستخدم مسجل حالياً.
   *
   * عندما يتم ربط Backend حقيقي:
   * يتم ملء هذا الكائن من قاعدة البيانات / جلسة المستخدم.
   */

  currentUser: null,


  /*
   * بيانات الجلسة.
   */

  session: {
    authenticated: false,
    provider: null,
    remember: false
  },


  /*
   * بيانات المستخدم المستقبلية.
   */

  userSchema: {

    id: null,

    name: "",
    email: "",

    username: "",
    avatar: "",
    cover: "",
    bio: "",

    level: 0,
    xp: 0,
    coins: 0,

    friendsCount: 0,
    followersCount: 0,

    createdAt: null,
    lastActiveAt: null

  },


  /*
   * مجموعات البيانات الحقيقية.
   *
   * تظل فارغة حتى يصل مصدر حقيقي للبيانات.
   */

  friends: [],
  conversations: [],
  rooms: [],
  games: [],
  notifications: [],
  transactions: [],
  achievements: [],


  /*
   * إعدادات الواجهة.
   */

  settings: {
    theme: "dark"
  },


  /*
   * معلومات الربط بالـBackend.
   *
   * لا نضع مفاتيح سرية داخل Front-End.
   */

  backend: {

    configured: false,

    provider: null,

    apiBaseUrl: "",

    authConfigured: false,
    realtimeConfigured: false

  }

};


/* =========================================================
   SAFE HELPERS
========================================================= */

window.JOKER_DATA_HELPERS = {


  hasUser() {

    return Boolean(
      window.JOKER_DATA.currentUser &&
      window.JOKER_DATA.currentUser.id
    );

  },


  getUser() {

    return window.JOKER_DATA.currentUser;

  },


  getFriends() {

    return Array.isArray(window.JOKER_DATA.friends)
      ? window.JOKER_DATA.friends
      : [];

  },


  getRooms() {

    return Array.isArray(window.JOKER_DATA.rooms)
      ? window.JOKER_DATA.rooms
      : [];

  },


  getGames() {

    return Array.isArray(window.JOKER_DATA.games)
      ? window.JOKER_DATA.games
      : [];

  },


  getNotifications() {

    return Array.isArray(window.JOKER_DATA.notifications)
      ? window.JOKER_DATA.notifications
      : [];

  },


  getUnreadNotifications() {

    return this.getNotifications()
      .filter(item => item && item.read === false);

  },


  getConversations() {

    return Array.isArray(window.JOKER_DATA.conversations)
      ? window.JOKER_DATA.conversations
      : [];

  },


  getTransactions() {

    return Array.isArray(window.JOKER_DATA.transactions)
      ? window.JOKER_DATA.transactions
      : [];

  }

};


/* =========================================================
   DATA NORMALIZATION
========================================================= */

window.JOKER_DATA_HELPERS.normalizeUser = function(raw) {

  if (!raw || typeof raw !== "object") {
    return null;
  }

  return {

    id: raw.id ?? null,

    name: String(raw.name ?? "").trim(),

    email: String(raw.email ?? "").trim(),

    username:
      String(raw.username ?? "")
      .replace(/^@/, "")
      .trim(),

    avatar:
      typeof raw.avatar === "string"
        ? raw.avatar
        : "",

    cover:
      typeof raw.cover === "string"
        ? raw.cover
        : "",

    bio:
      typeof raw.bio === "string"
        ? raw.bio
        : "",

    level:
      Number.isFinite(Number(raw.level))
        ? Number(raw.level)
        : 0,

    xp:
      Number.isFinite(Number(raw.xp))
        ? Number(raw.xp)
        : 0,

    coins:
      Number.isFinite(Number(raw.coins))
        ? Number(raw.coins)
        : 0,

    friendsCount:
      Number.isFinite(Number(raw.friendsCount))
        ? Number(raw.friendsCount)
        : 0,

    followersCount:
      Number.isFinite(Number(raw.followersCount))
        ? Number(raw.followersCount)
        : 0,

    createdAt: raw.createdAt ?? null,

    lastActiveAt: raw.lastActiveAt ?? null

  };

};


/* =========================================================
   NO FAKE DATA POLICY
========================================================= */

window.JOKER_DATA_POLICY = {

  allowFakePeople: false,

  allowFakeMessages: false,

  allowFakeRooms: false,

  allowFakeBalances: false,

  allowFakeOnlineCounts: false,

  allowFakeGameResults: false,

  allowFakeNotifications: false

};
