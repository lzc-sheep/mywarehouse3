const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalCount: 0,
    topics: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that=this
    wx.cloud.init({
      env: app.globalData.evn
    })
    app.loadFontFace()
  },

  onShow: function() {
   // let that = this
    this.getData();

  },
  /**
   * 获取列表数据
   * 
   */
  getData: function() {
    let that=this
    let myDate = new Date();//获取当前日期
    let nowyear = myDate.getFullYear()-2020;//获取年份,2020年为0
    let nowmont = myDate.getMonth();//获取月份
    let nowdate = myDate.getDate()-1; //获取日期，从0开始
    let nowhour = myDate.getHours();//获取时
    let nowminute = myDate.getMinutes();//获取分
    console.log(nowhour);
    console.log(nowminute);
    const db = wx.cloud.database();

    const _ = db.command
	 /**
   * 获取截至日期大于当前日期的数据
   * 
   */
    db.collection('topic').where(_.or([
      {
        'deadline1.0':_.gt(nowyear)//年份大于当前年份
      },
      {
        'deadline1.0':nowyear,//年份相等
        'deadline1.1':_.gt(nowmont)//月份大于当前月份
      },
      {
        'deadline1.0':nowyear,
        'deadline1.1':nowmont,
        'deadline1.2':_.gt(nowdate)//日期大于当前日期
      },
      {
        'deadline1.0':nowyear,
        'deadline1.1':nowmont,
        'deadline1.2':nowdate,
        'deadline1.3':_.gt(nowhour)//小时大于当前小时
      },
      {
        'deadline1.0':nowyear,
        'deadline1.1':nowmont,
        'deadline1.2':nowdate,
        'deadline1.3':nowhour,
        'deadline1.4':_.gt(nowminute)//分钟大于当前分钟
      }
    ]))
      .orderBy('date', 'desc')
      .get({
        success: function(res) {
          // res.data 是包含以上定义的两条记录的数组
          console.log("数据：" + res.data)
          that.data.topics = res.data;
          var topic=wx.getStorageSync('topics');//同步获取topics的内容
          topic=that.data.topics;
          wx.setStorageSync('topics', topic)//将topic存储在topics中，覆盖原来的topics内容

          that.setData({
            topics: that.data.topics,
          })
          console.log(that.data.topics.length)//得到的结果条数
          var num=0;
          for(num=0;num<that.data.topics.length;++num)
          {
            console.log(that.data.topics[num])
          }
          wx.hideNavigationBarLoading(); //隐藏加载
          wx.stopPullDownRefresh();//停止当前页面下拉刷新

        },
        fail: function(event) {
          wx.hideNavigationBarLoading(); //隐藏加载
          wx.stopPullDownRefresh();
        }
      })

  },
  /**
   * item 点击
   */
  onItemClick: function(event) {
    var id = event.currentTarget.dataset.topicid;//获取绑定事件的id
    var openid = event.currentTarget.dataset.openid;//获取绑定事件的openid,即发布人的openid
    console.log(id);
    console.log(openid);
    wx.navigateTo({
      url: "../homeDetail/homeDetail?id=" + id + "&openid=" + openid
    })//跳转到homedetail页面并传输id和openid
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var temp = [];
    // 获取后面十条
    if (this.data.topics.length < this.data.totalCount) {
      const db = wx.cloud.database();
      db.collection('topic').get({
        success: function(res) {
          // res.data 是包含以上定义的两条记录的数组
          if (res.data.length > 0) {
            for (var i = 0; i < res.data.length; i++) {
              var tempTopic = res.data[i];
              console.log(tempTopic);
              temp.push(tempTopic);
            }

            var totalTopic = {};
            totalTopic = that.data.topics.concat(temp);//将topic和temp拼接起来

            console.log(totalTopic);
            that.setData({
              topics: totalTopic,
            })
          } else {
            wx.showToast({
              title: '没有更多数据了',
            })
          }
        },
      })
    } else {
      wx.showToast({
        title: '没有更多数据了',
      })
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})