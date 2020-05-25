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
    this.loadFontFace()
  },
  loadFontFace(){
    wx.loadFontFace({
      family: 'Bitstream Vera Serif Bold',
      source: 'url("https://736f-software-engineer-07-a7cb1-1301675170.tcb.qcloud.la/taohua.ttf?sign=82104803df1a45404381a57a5d7283e7&t=1590393102")',
      global: true,
      success(res){
        console.log("success1")
      },
      fail:function(res){
        console.log("fail1")
      },
      complete:function(res){
        console.log(res.status)
      }
    })
    wx.loadFontFace({
      family: 'content',
      source: 'url("https://736f-software-engineer-07-a7cb1-1301675170.tcb.qcloud.la/qingshu.ttf?sign=c7752b7838b3964cdb998f2ef7a15875&t=1590393858")',
      global: true,
      success(res){
        console.log("success2")
      },
      fail:function(res){
        console.log("fail1")
      },
      complete:function(res){
        console.log(res.status)
      }
    })

  }
})