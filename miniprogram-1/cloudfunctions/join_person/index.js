// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
   var _docid=event.joinin
   var _openid=event._openid
   var _userimage= event.userimage
   var _nickname= event.nickname
   try {
       return await db.collection('joinin').doc(_docid).update({
         data: {
           join_person: _.push(_openid),
           join_images:_.push(_userimage),
           join_nickname:_.push(_nickname)
         }
       
     })

   } catch (error) {
     console.log(error)
   }
}
