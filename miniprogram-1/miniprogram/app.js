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
      env:"yibeitang-zs"
    }
    wx.cloud.callFunction({
      name: 'login',
      success: function(res) {
        that.globalData.openid=res.result.OPENID
        console.log(that.globalData.openid)
      },
      fail: console.error
    })
    this.loadFontFace()
  },
  loadFontFace(){
    wx.loadFontFace({
      family: 'Bitstream Vera Serif Bold',
      source: 'url("https://7969-yibeitang-zs-1301754671.tcb.qcloud.la/taohua.ttf?sign=42c307eaa48155484b9730de08c4d81e&t=1590490821")',
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
      source: 'url("https://7969-yibeitang-zs-1301754671.tcb.qcloud.la/qingshu.ttf?sign=7d66700205557377a51bd62756fefe10&t=1590490868")',
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