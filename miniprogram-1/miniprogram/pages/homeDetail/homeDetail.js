var that
const app = getApp()
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topic: {},
    id: '',
    openid: '',
    isLike: '',
    joinin: '',
    join_images: [],
    join_nickname: [],
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    that = this;
    that.data.id = options.id;
    that.data.openid = options.openid;
    // 获取话题信息
    console.log(that.data.id);
    console.log(that.data.openid)
    /*db.collection('collect').doc(that.data.id)*/
    db.collection('topic').doc(that.data.id).get({
      success: function(res) {
        that.topic = res.data;
        that.setData({
          topic: that.topic,
        })
      }
    })

    // 获取收藏情况
    wx.cloud.callFunction({
        name: 'login',
        success: res => {
          console.log('callFunction test result: ', res)
          console.log('haha:', res.result.OPENID);
          that.data.openid = res.result.OPENID;
      // 获取收藏情况
      db.collection('collect')
        .where({
          _openid:that.data.topic._openid,//不必要
          _id: that.data.id,
          adder:that.data.openid,
        
  
        })
        .get({
          success: function(res) {
            if (res.data.length > 0) {
              that.refreshLikeIcon(true)
            } else {
              that.refreshLikeIcon(false)
            }
          },
          fail: console.error
        })
        }
        })

      db.collection('joinin')
      .where({
        join_id: that.data.id
      })
      .get({
        success: function(res) {
          console.log(that.data.id)
          console.log("标记");
          console.log(res.data[0]._id);
          console.log("标记");
          that.joinin=res.data[0]._id;
          that.join_images=res.data[0].join_images;
          that.join_nickname=res.data[0].join_nickname;
          that.setData({
            joinin: that.joinin,
            join_images: that.join_images,
            join_nickname: that.join_nickname
          })
        },
        fail: console.error
      })
  },

  onShow: function() {
    // 获取回复列表
    let that=this
    that.getReplay()
    db.collection('topic').doc(that.data.id).get({
      success: function(res) {
        that.topic = res.data;
        that.setData({
          topic: that.topic,
        })
      }
    })

    // 获取收藏情况
    db.collection('collect')
      .where({
        _openid: that.data.openid,
        _id: that.data.id

      })
      .get({
        success: function(res) {
          if (res.data.length > 0) {
            that.refreshLikeIcon(true)
          } else {
            that.refreshLikeIcon(false)
          }
        },
        fail: console.error
      })

      db.collection('joinin')
      .where({
        join_id: that.data.id
      })
      .get({
        success: function(res) {
          console.log(that.data.id)
          console.log("标记");
          console.log(res.data[0]._id);
          console.log("标记");
          that.joinin=res.data[0]._id;
          that.join_images=res.data[0].join_images;
          that.join_nickname=res.data[0].join_nickname;
          that.join_person=res.data[0].join_person;
          that.setData({
            joinin: that.joinin,
            join_images: that.join_images,
            join_nickname: that.join_nickname,
          })
        },
        fail: console.error
      })
  },

  getReplay: function() {
    // 获取回复列表
    db.collection('replay')
      .where({
        t_id: that.data.id
      })
      .get({
        success: function(res) {
          // res.data 包含该记录的数据
          console.log(res)
          that.setData({
            replays: res.data
          })
        },
        fail: console.error
      })
  },
  /**
   * 刷新点赞icon
   */
  refreshLikeIcon(isLike) {
    console.log('test');
    that.data.isLike = isLike
    that.setData({
      isLike: isLike,
    })
  },
  // 预览图片
  previewImg: function(e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;

    wx.previewImage({
      //当前显示图片
      current: this.data.topic.images[index],
      //所有图片
      urls: this.data.topic.images
    })
  },
  /**
   * 喜欢点击
   */
  onLikeClick: function(event) {
    console.log(that.data.openid);
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        console.log('callFunction test result: ', res)
        console.log('haha:', res.result.openid);
        that.data.openid = res.result.openid;
        console.log(that);
        if (that.data.isLike) {
          // 需要判断是否存在
          that.removeFromCollectServer();
          that.deleteToTopic();
          that.removeFromJoin();
          that.refreshLikeIcon(false)

        } else {
          if (that.data.topic.maxmember == that.data.topic.numbers) {  //满人的情况
            wx.showToast({
              title: '已经满人了哦！',
            })
          }
          if (that.data.openid== that.data.topic._openid) {
            //发帖人不能重复参加情况
            wx.showToast({
              title: '您是发布人哦！',
            })
          }
          else {
            console.log('1111')
            console.log(that);
            that.saveToCollectServer();
            that.addToTopic();
            that.addUserInfo();
          }
        }
       
        }
        })
    console.log(that.data.isLike);
    
  },
  /**
   * 添加到收藏集合中
   */
  saveToCollectServer: function(event) {console.log("?");
  console.log(that.data.openid);
    wx.cloud.callFunction({
      name: 'runDB',
      data: {
        type: "insert", //指定操作是insert  
        db: "collect", //指定操作的数据表
        data: { //指定insert的数据
          _openid: that.data.topic._openid,
          adder:that.data.openid,
          _id: that.data.id,
          
          
        }
      },
      success: res => {
        console.log('[云函数] [insertDB] 已增加信息', res);
    
          that.refreshLikeIcon(true)
          
       

      },
      fail: err => {
        console.error('[云函数] [insertDB] 增加失败', err)
      }
    })

   /* db.collection('collect').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: that.data.topic._openid,
        date: new Date(),
      },
      success: function(res) {
        that.refreshLikeIcon(true)
        console.log(res)
      },
    })*/
  },
  addToTopic:function(enent){
    wx.cloud.callFunction({
      name:'runDB',
      data:{
        type:"update",
        db: "topic",
        a:1,
        id:that.data.id,
      },
      success: res => {
        console.log('[云函数] [updateDB] 已更新信息', res);
      },
      fail: err => {
        console.error('[云函数] [updateDB] 更新失败', err)
      }
    })
  
  },
  addUserInfo: function(event){
    wx.cloud.callFunction({
     name: 'join_person',
      data: {  
        _id: that.data.id,
        _openid: that.data.openid,
        nickname:app.globalData.user.nickName,
        joinin: that.data.joinin ,
        userimage: app.globalData.user.avatarUrl,
        type: "add"
      },
      success: res => {
        console.log("增加人员成功")
      },
      fail: err => {
        console.log("增加人员失败")
        console.log(err);
      }
    })

  },
  removeFromJoin: function(){
    wx.cloud.callFunction({
      name: 'join_person',
       data: {  
         _id: that.data.id,
         _openid: that.data.openid,
         nickname:app.globalData.user.nickName,
         joinin: that.data.joinin ,
         userimage: app.globalData.user.avatarUrl,
         type: "delete"
       },
       success: res => {
         console.log("删除人员成功")
       },
       fail: err => {
         console.log("删除人员失败")
         console.log(err);
       }
     })
  },
  /**
   * 从收藏集合中移除
   */
  removeFromCollectServer: function(event) {
    /*db.collection('collect').doc(that.data.id).remove({

      success: that.refreshLikeIcon(false),
    });*///该函数没有足够的权限需要使用云函数
    wx.cloud.callFunction({
      name: 'runDB',
      data: {
        type: "delete",
        db: "collect",
        _openid: that.data.topic._openid,//不必要
        _id: that.data.id,
        adder: that.data.openid,
      },
      success: res => {
        console.log('[云函数] [updateDB] 已删除', res);
      }
    })

  },
  deleteToTopic:function(event){
    wx.cloud.callFunction({
      name:'runDB',
      data:{
        type:"update",
        db: "topic",
        a:-1,
        id:that.data.id,
      },
      success: res => {
        console.log('[云函数] [updateDB] 已更新信息', res);
      },
      fail: err => {
        console.error('[云函数] [updateDB] 更新失败', err)
      }
    })
  },
  /**
   * 跳转回复页面
   */
  onReplayClick() {
    wx.navigateTo({
      url: "../replay/replay?id=" + that.data.id + "&openid=" + that.data.openid
    })
  },

  /**
   * 用户点击右上角分享
   */
  
  onShareAppMessage: function() {

  }
})