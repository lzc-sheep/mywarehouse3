var dateTimePicker = require('../../util/dateTimePicker.js');
var that
const db = wx.cloud.database();
const app= getApp()
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    content: '',
    start:'',
    destination:'',
    deadline:'',
    maxmember:'',
	  numbers:1,
    images: [],
    localimages:[],   //本地预览图片
    user: {},
    isLike: false,   //布尔型判断是否加入
    date: '2020-05-01',
    time: '12:00',
    dateTimeArray1: null,   //截止时间
    dateTime1: null,//截止时间
    nowTimeArray1:null,    //当前时间
    nowTime1:null,    //当前时间
    startYear: 2020,
    endYear: 2050,
    _id:''
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    that = this
    that.jugdeUserLogin2()
    console.log(app.globalData.openid)
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();
    var lastArray = obj.dateTimeArray.pop();
    var lastTime = obj.dateTime.pop();

    this.setData({
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime,
      nowTimeArray1:obj.dateTimeArray,
      nowTime1:obj.dateTime
    });
    getApp().loadFontFace()    //加载字体
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    that.jugdeUserLogin()
  },
  /**
   * 获取填写的内容
   */
  

  changeDateTime1(e) {
    this.setData({ dateTime1: e.detail.value });
  },  //读取截止时间改变

  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({ 
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
  },   //读取截止时间改变


  getTextAreaContent: function(event) {
    that.data.content = event.detail.value;
  },
  getStartposition: function(event) {
    that.data.start = event.detail.value;
  },
  getDestination: function(event) {
    that.data.destination =event.detail.value;
  },
  getDeadline: function(event){
    that.data.deadline =event.detail.value
  },
  getMaxmember: function(event){
    that.data.maxmember =event.detail.value
  },

  /**
   * 选择图片
   */
  chooseImage: function(event) {
    let that=this;
    if(this.data.images.length>=3){
      wx.showToast({
        icon: 'none',
        title: '图片最多上传3张哦',
      })
    }else{
    wx.chooseImage({
      count: 1,
      success: function(res) {
        // 设置图片
        let localimages=that.data.localimages;
        localimages.push(res.tempFilePaths)
        that.setData({
          localimages
        })
        for (var i in res.tempFilePaths) {
          // 将图片上传至云存储空间
          wx.cloud.uploadFile({
            // 指定要上传的文件的小程序临时文件路径
            cloudPath: that.timetostr(new Date()),
            filePath: res.tempFilePaths[i],
            // 成功回调
            success: res => {
              that.data.images.push(res.fileID);
            },
          })
        }
      },
    })
  }
  },
  /**
   * 图片路径格式化
   */
  timetostr(time){
    var randnum = Math.floor(Math.random() * (9999 - 1000)) + 1000;
    var str = randnum +"_"+ time.getMilliseconds() + ".png";
    return str;
  },

  /**
   * 发布
   */
  formSubmit: function(e) {
    if('avatarUrl' in that.data.user){
      console.log('图片：', that.data.images)
      this.data.content = e.detail.value['input-content'];
      if (this.data.canIUse) {
        var flag=(this.data.start.length==0)||(this.data.destination.length==0)||
        (this.data.maxmember.length==0);   //判断出发点终点，人数上限是否填写
        if (flag) {
          wx.showToast({
            icon: 'none',
            title: '还有信息未填写',
          })  
        }else if((this.data.content.length==0)&&(this.data.images.length==0)){   //判断输入内容是否输入，图片是否选择
          wx.showToast({
            icon: 'none',
            title: '写点东西吧',
          })
          }else if(!that.jugdeTime()){    //判断截止时间设置是否合理
            wx.showToast({
              icon: 'none',
              title: '时间太早啦',
            })
          }
         
         else if(!that.isNumber(that.data.maxmember)){
          console.log("人数上限类型错误")
          wx.showToast({
            icon: 'none',
            title: '人数只能为整数哦',
          })
         }else if(parseInt(that.data.maxmember)<2){
          console.log("人数小于下限")
          wx.showToast({
            icon: 'none',
            title: '人数不能小于2哦',
          })
         }else if(parseInt(that.data.maxmember)>6){
          console.log("人数超过上限")
          wx.showToast({
            icon: 'none',
            title: '人数不能大于6哦',
          })
         }
          else{
             
            this.saveDataToServer();
          }
        
        
      } else {
        wx.showToast({
          icon: 'none',
          title: '您的微信版本过低，请升级后重试',
        })
      }
    }else {
      that.jugdeUserLogin2();  //判断用户是否授权
    }
  },
  /**
   * 保存到发布集合中
   */
  saveDataToServer: function(event) {
    let that = this;
    db.collection('topic').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: new Date(),
        images: that.data.images,
        user: that.data.user,
        isLike: that.data.isLike,
		    numbers:that.data.numbers,
        start: that.data.start ,
        destination: that.data.destination,
        deadline1: that.data.dateTime1,
        deadline2:that.data.dateTimeArray1,
        nowtime1:that.data.nowTime1,
        nowtime2:that.data.nowTimeArray1,
        maxmember: that.data.maxmember
      },
      success: function(res) {
        // 保存到发布历史
        let tmp=res._id  //保存topic记录的id
        that.saveToHistoryServer();
        that.setData({
          textContent: '',
          images: [],
          localimages: [],
          _id: tmp
        })
        //添加到记录发布参与的集合中
        that.saveToJoinin();
        // 清空数据
        that.data.content = "";
        that.data.images = [];
        that.data.localimages = [];
        that.data.start="";
        that.data.destination="";
        that.data.deadline="";
        that.data.maxmember="";

        that.showTipAndSwitchTab();

      },
    })
  },
  /**
   * 添加成功添加提示，切换页面
   */
  showTipAndSwitchTab: function(event) {
    wx.showToast({
      title: '新增记录成功',
    })
    wx.switchTab({
      url: '../home/home',
    })
  },
  /**
   * 删除图片
   */
  removeImg: function(event) {
    var position = event.currentTarget.dataset.index;
    console.log('diandaol');
    this.data.localimages.splice(position, 1);
    // 渲染图片
    this.setData({
      localimages: this.data.localimages,
    })
    this.data.images.splice(position, 1);
  },
  // 预览图片
  previewImg: function(e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      //当前显示图片
      current: this.data.localimages[index],
      //所有图片
      urls: this.data.localimages
    })
  },

  /**
   * 添加到发布集合中
   */
  saveToJoinin: function(event){
    db.collection('joinin').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        user:that.data.user,
        join_id: that.data._id ,  //保存对应topic记录的id
        join_person: [],
        join_images: [],
        join_nickname:[]
      },
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      },
      fail: console.error
    })
  },
  saveToHistoryServer: function(event) {
    db.collection('history').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: that.data.content,
        date: new Date(),
        images: that.data.images,
        user: that.data.user,
        isLike: that.data.isLike,
        start: that.data.start ,
        destination: that.data.destination,
        deadline1: that.data.dateTime1,
        deadline2:that.data.dateTimeArray1,
        maxmember: that.data.maxmember
      },
      success: function(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      },
      fail: console.error
    })
  },


  /**
   * 判断用户是否登录
   */
  jugdeUserLogin: function(event) {
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {

              that.data.user = res.userInfo;
              app.globalData.user=res.userInfo;
            }
          })
        }
      }
    })
  },
  jugdeUserLogin2: function(event) {
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          // 没有授权，跳转到登录页面
          wx.navigateTo({
            url: '../login/login',
          })
        }
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  isNumber:function (val) {     //判断是否为整数

        var regPos = /^\d?$/; 
        var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; 
        if(regPos.test(val) || regNeg.test(val)) {
            return true;
            } else {
            return false;
            }
        },
    jugdeTime: function(){     //判断时间是否大于当前时间
          var flag=false
          var newDate = new Date()
          if(that.data.dateTimeArray1[0][that.data.dateTime1[0]]>newDate.getFullYear()){
            flag=true
          }else if(that.data.dateTimeArray1[1][that.data.dateTime1[1]]>(newDate.getMonth() + 1)){
            flag=true
          } else if(that.data.dateTimeArray1[2][that.data.dateTime1[2]]>newDate.getDate()){
            flag=true
          } else if(that.data.dateTimeArray1[3][that.data.dateTime1[3]]>newDate.getHours()){
            flag=true
          } else if (that.data.dateTimeArray1[4][that.data.dateTime1[4]]>newDate.getMinutes()){
            flag=true
          }
          return flag
        }      
  
})
