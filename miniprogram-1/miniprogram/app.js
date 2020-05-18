//app.js
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    let that = this;
    this.globalData = {
      openid:"",
      env:"software-engineer-07-a7cb1"
    }
    wx.cloud.callFunction({
      name: 'login',
      success: function(res) {
        that.globalData.openid=res.result.openid
      },
      fail: console.error
    })

  }
})