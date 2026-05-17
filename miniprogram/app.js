App({
  onLaunch: function () {
    // 云开发初始化 — 请将 'cloud1-d5gqwn87z8075a091' 替换为实际云环境 ID
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-d5gqwn87z8075a091',
        traceUser: true,
      })
    }
  },
})
