const NodeHelper = require("node_helper");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
  start: function () {
    this.config = {
      updateInterval: 2 * 60 * 1000,
      driveRemote: "drive:mirror-videos"
    };

    this.syncTimer = null;
    this.syncInProgress = false;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
      this.config = Object.assign({}, this.config, payload || {});
      this.startSyncLoop();
    }
  },

  startSyncLoop: function () {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    this.syncVideos();

    this.syncTimer = setInterval(() => {
      this.syncVideos();
    }, this.config.updateInterval);
  },

  syncVideos: function () {
    if (this.syncInProgress) {
      console.log("MMM-DriveVideos: Sync already in progress, skipping");
      return;
    }

    this.syncInProgress = true;

    const localPath = path.join(this.path, "public", "videos");
    const remotePath = this.config.driveRemote || "drive:mirror-videos";

    try {
      fs.mkdirSync(localPath, { recursive: true });
    } catch (e) {
      console.error("MMM-DriveVideos: Failed to create local videos folder", e);
      this.syncInProgress = false;
      return;
    }

    const command = `rclone sync "${remotePath}" "${localPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("MMM-DriveVideos: rclone sync failed:", error.message);
      }

      if (stderr) {
        console.error("MMM-DriveVideos: rclone stderr:", stderr);
      }

      if (stdout) {
        console.log("MMM-DriveVideos: rclone stdout:", stdout);
      }

      const videoList = this.getVideoList(localPath);
      this.sendSocketNotification("VIDEO_LIST", videoList);

      this.syncInProgress = false;
    });
  },

  getVideoList: function (videoDir) {
    try {
      const files = fs.readdirSync(videoDir);

      return files
        .filter((file) => {
          const fullPath = path.join(videoDir, file);
          return fs.statSync(fullPath).isFile() && file.toLowerCase().endsWith(".mp4");
        })
        .sort()
        .map((file) => `/modules/MMM-DriveVideos/public/videos/${encodeURIComponent(file)}`);
    } catch (e) {
      console.error("MMM-DriveVideos: Error reading videos folder", e);
      return [];
    }
  }
});
