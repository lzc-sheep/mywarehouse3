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
    getApp().LoadFontFace()
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
    let myDate = new Date();
    let nowyear = myDate.getFullYear()-2020;
    let nowmont = myDate.getMonth();
    let nowdate = myDate.getDate()-1; 
    let nowhour = myDate.getHours();
    let nowminute = myDate.getMinutes();
    console.log(nowhour);
    console.log(nowminute);
    const db = wx.cloud.database();

    const _ = db.command
    db.collection('topic').where(_.or([
      {
        'deadline1.0':_.gt(nowyear)
      },
      {
        'deadline1.0':nowyear,
        'deadline1.1':_.gt(nowmont)
      },
      {
        'deadline1.0':nowyear,
        'deadline1.1':nowmont,
        'deadline1.2':_.gt(nowdate)
      },
      {
        'deadline1.0':nowyear,
        'deadline1.1':nowmont,
        'deadline1.2':nowdate,
        'deadline1.3':_.gt(nowhour)
      },
      {
        'deadline1.0':nowyear,
        'deadline1.1':nowmont,
        'deadline1.2':nowdate,
        'deadline1.3':nowhour,
        'deadline1.4':_.gt(nowminute)
      }
    ]))
      .orderBy('date', 'desc')
      .get({
        success: function(res) {
          // res.data 是包含以上定义的两条记录的数组
          console.log("数据：" + res.data)
          that.data.topics = res.data;
          var topic=wx.getStorageSync('topics');
          topic=that.data.topics;
          wx.setStorageSync('topics', topic)

          that.setData({
            topics: that.data.topics,
          })
          console.log(that.data.topics.length)
          var num=0;
          for(num=0;num<that.data.topics.length;++num)
          {
            console.log(that.data.topics[num])
          }
          wx.hideNavigationBarLoading(); //隐藏加载
          wx.stopPullDownRefresh();

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
    var id = event.currentTarget.dataset.topicid;
    var openid = event.currentTarget.dataset.openid;
    console.log(id);
    console.log(openid);
    wx.navigateTo({
      url: "../homeDetail/homeDetail?id=" + id + "&openid=" + openid
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getData();
    //var topics=wx.getStorageSync('topics')
    //this.setData({
    //  topics: topics
   // })
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
            totalTopic = that.data.topics.concat(temp);

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