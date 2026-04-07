Module.register("MMM-DriveVideos", {
  defaults: {
    playMode: "linear",
    muted: true,
    showArrows: true,
    arrowOpacity: 0.3,
    arrowFontSize: 40,
    objectFit: "cover",
    enableSwipe: true,
    enableTapPause: true
  },

  start() {
    this.videos = [];
    this.currentIndex = 0;
    this.videoElement = null;
    this.loaded = false;
    this.nextPlaylist = null;
    this.isPaused = false;

    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchMoved = false;

    this.sendSocketNotification("CONFIG", this.config);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "VIDEO_LIST") {
      if (!this.loaded) {
        this.videos = payload;
        this.loaded = true;
        this.updateDom();
      } else {
        this.nextPlaylist = payload;
      }
    }
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.overflow = "hidden";

    if (!this.loaded || this.videos.length === 0) {
      wrapper.innerHTML = "No videos found";
      return wrapper;
    }

    const video = document.createElement("video");
    video.src = this.videos[this.currentIndex];
    video.autoplay = true;
    video.muted = this.config.muted;
    video.playsInline = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = this.config.objectFit;

    video.onended = () => {
      if (this.nextPlaylist) {
        this.videos = this.nextPlaylist;
        this.nextPlaylist = null;

        if (this.currentIndex >= this.videos.length) {
          this.currentIndex = 0;
        }
      }

      this.playNext();
    };

    this.videoElement = video;
    wrapper.appendChild(video);

    wrapper.addEventListener("touchstart", (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchMoved = false;
    }, { passive: true });

    wrapper.addEventListener("touchmove", () => {
      this.touchMoved = true;
    }, { passive: true });

    wrapper.addEventListener("touchend", (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      const diff = this.touchEndX - this.touchStartX;

      if (this.config.enableSwipe && Math.abs(diff) > 50) {
        if (diff > 0) {
          this.handleArrow("left");
        } else {
          this.handleArrow("right");
        }
        return;
      }

      if (this.config.enableTapPause && !this.touchMoved) {
        this.togglePause();
      }
    });

    wrapper.addEventListener("pointerup", (e) => {
      if (e.pointerType === "mouse") {
        if (this.config.enableTapPause) {
          this.togglePause();
        }
      }
    });

    if (this.config.showArrows) {
      const leftArrow = this.createArrow("left");
      const rightArrow = this.createArrow("right");
      wrapper.appendChild(leftArrow);
      wrapper.appendChild(rightArrow);
    }

    return wrapper;
  },

  createArrow(direction) {
    const arrow = document.createElement("div");

    arrow.innerHTML = direction === "left" ? "❮" : "❯";
    arrow.style.position = "absolute";
    arrow.style.top = "50%";
    arrow.style.transform = "translateY(-50%)";
    arrow.style.zIndex = "10";
    arrow.style.cursor = "pointer";
    arrow.style.userSelect = "none";
    arrow.style.webkitUserSelect = "none";
    arrow.style.touchAction = "manipulation";
    arrow.style.opacity = this.config.arrowOpacity.toString();
    arrow.style.background = "transparent";
    arrow.style.fontSize = this.config.arrowFontSize + "px";

    if (direction === "left") {
      arrow.style.left = "10px";
    } else {
      arrow.style.right = "10px";
    }

    arrow.addEventListener("touchstart", (e) => {
      e.stopPropagation();
      this.handleArrow(direction);
    }, { passive: true });

    arrow.addEventListener("pointerup", (e) => {
      e.stopPropagation();
      if (e.pointerType === "mouse") {
        this.handleArrow(direction);
      }
    });

    return arrow;
  },

  handleArrow(direction) {
    if (!this.videos.length) return;

    this.isPaused = false;

    if (direction === "left") {
      this.currentIndex = (this.currentIndex - 1 + this.videos.length) % this.videos.length;
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.videos.length;
    }

    this.playCurrent();
  },

  togglePause() {
    if (!this.videoElement) return;

    if (this.videoElement.paused) {
      this.videoElement.play();
      this.isPaused = false;
    } else {
      this.videoElement.pause();
      this.isPaused = true;
    }
  },

  playNext() {
    if (!this.videos.length) return;

    this.isPaused = false;

    if (this.config.playMode === "random") {
      this.currentIndex = Math.floor(Math.random() * this.videos.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.videos.length;
    }

    this.playCurrent();
  },

  playCurrent() {
    if (!this.videoElement || !this.videos.length) return;

    this.videoElement.src = this.videos[this.currentIndex];
    this.videoElement.style.objectFit = this.config.objectFit;
    this.videoElement.play();
  }
});
