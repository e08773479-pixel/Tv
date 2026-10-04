window.MALAK_MEDIA = {

  /* =========================================================
     BACKGROUNDS
     ========================================================= */

  backgrounds: {

    gate:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=88",

    hero:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2200&q=88",

    poetry:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2200&q=88",

    sound:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=2200&q=88",

    final:
      "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=2200&q=88"

  },


  /* =========================================================
     MUSIC
     =========================================================
     
     اتركها فارغة حاليًا لو مفيش ملف صوت.
     
     لما تحط موسيقى عندك:
     
     music: "music/malak.mp3"
     
     ========================================================= */

  music: "",

  /* =========================================================
     PRELOAD
     ========================================================= */

  preload() {

    Object.values(this.backgrounds).forEach(url => {

      const image = new Image();

      image.decoding = "async";
      image.src = url;

    });

  }

};
