Module.register("MMM-DriveVideos", {
  defaults: {
    updateInterval: 2 * 60 * 1000,
    driveRemote: "drive:mirror-videos",
    width: "100%",
    height: "100%",
    playMode: "linear",
    muted: true
  },

  start: function () {
    this.playlist = [];
    this.pendingPlaylist = null;
    this.currentIndex = 0;
    this.currentVideoElement = null;

    this.sendSocketNotification("CONFIG", {
      updateInterval: this.config.updateInterval,
      driveRemote: this.config.driveRemote
    });
  },

  getNextIndex: function () {
    if (!this.playlist || this.playlist.length === 0) {
      return 0;
    }

    if (this.config.playMode === "random") {
      if (this.playlist.length === 1) {
        return 0;
      }

      let next;
      do {
        next = Math.floor(Math.random() * this.playlist.length);
      } while (next === this.currentIndex);

      return next;
    }

    return (this.currentIndex + 1) % this.playlist.length;
  },

  getStyles: function () {
    return ["MMM-DriveVideos.css"];
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.style.width = this.config.width;
    wrapper.style.height = this.config.height;

    if (!this.playlist || this.playlist.length === 0) {
      wrapper.innerHTML = "No videos found";
      return wrapper;
    }

    const video = document.createElement("video");
    video.src = this.playlist[this.currentIndex];
    video.autoplay = true;
    video.muted = this.config.muted;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.style.width = this.config.width;
    video.style.height = this.config.height;
    video.style.objectFit = "contain";

    video.onended = () => {
      if (this.pendingPlaylist) {
        this.playlist = this.pendingPlaylist;
        this.pendingPlaylist = null;
        this.currentIndex = 0;
      } else {
        this.currentIndex = this.getNextIndex();
      }

      this.updateDom(0);
    };

    this.currentVideoElement = video;
    wrapper.appendChild(video);
    return wrapper;
  },

  notificationReceived: function () {},

  socketNotificationReceived: function (notification, payload) {
    if (notification === "VIDEO_LIST") {
      if (!Array.isArray(payload)) {
        return;
      }

      if (this.playlist.length === 0) {
        this.playlist = payload;
        this.currentIndex = 0;
        this.updateDom(0);
        return;
      }

      this.pendingPlaylist = payload;
    }
  }
});
