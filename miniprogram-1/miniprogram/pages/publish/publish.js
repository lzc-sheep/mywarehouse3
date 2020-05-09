var dateTimePicker = require('../../util/dateTimePicker.js');
var that
const db = wx.cloud.database();
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
    localimages:[],
    user: {},
    isLike: false,
    date: '2020-05-01',
    time: '12:00',
    dateTimeArray1: null,
    dateTime1: null,
    startYear: 2020,
    endYear: 2050,
    _id:''
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    that = this
    that.jugdeUserLogin();
    // 获取完整的年月日 时分秒，以及默认显示的数组
    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj1.dateTimeArray.pop();
    var lastTime = obj1.dateTime.pop();

    this.setData({
      dateTimeArray1: obj1.dateTimeArray,
      dateTime1: obj1.dateTime
    });
  },
  /**
   * 获取填写的内容
   */

  changeDateTime1(e) {
    this.setData({ dateTime1: e.detail.value });
  },

  changeDateTimeColumn1(e) {
    var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({ 
      dateTimeArray1: dateArr,
      dateTime1: arr
    });
  },


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
    wx.chooseImage({
      count: 6,
      success: function(res) {
        // 设置图片
        let localimages=that.data.localimages;
        localimages.push(res.tempFilePaths)
        that.setData({
          localimages
        })
        console.log("本地长度"+that.data.localimages.length);
        for(var j=0;j < that.data.localimages.length;j++){
          console.log(that.data.localimages[j]);
        }
        /*console.log(res.tempFilePaths)*/
        for (var i in res.tempFilePaths) {
          // 将图片上传至云存储空间
          wx.cloud.uploadFile({
            // 指定要上传的文件的小程序临时文件路径
            cloudPath: that.timetostr(new Date()),
            filePath: res.tempFilePaths[i],
            // 成功回调
            success: res => {
              that.data.images.push(res.fileID);
              /*console.log(that.data.images.length);
              for(var j=0;j < that.data.images.length;j++){
                console.log(that.data.images[j]);
              }*/
            },
          })
        }
      },
    })
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
    console.log('图片：', that.data.images)

    this.data.content = e.detail.value['input-content'];
    if (this.data.canIUse) {
      var flag=(this.data.start.trim()==0)||(this.data.destination.trim()==0)||
      (this.data.maxmember.trim()==0);
      if (flag) {
        wx.showToast({
          icon: 'none',
          title: '还有信息未填写',
        })
      }else if((this.data.content.trim()==0)&&(this.data.images.length==0)){
        wx.showToast({
          icon: 'none',
          title: '写点东西吧',
        })
        }else{
          this.saveDataToServer();
        }
      
      
    } else {
      this.jugdeUserLogin();
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
        join_id: that.data._id   //保存对应topic记录的id
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
              console.log(that.data.user)
            }
          })
        }
      }
    })
  },
 
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})