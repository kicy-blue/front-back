const {Service} = require('egg')
const nodemailer = require('nodemailer')
const user = require('../model/user')

// const userEmail = 'kicyblue@126.com'
const userEmail = '756099379@qq.com'

//新建一个发送者
//需要在邮箱设置中开启授权码
// 授权码 BYWRLYEAFESTRYNS
const transporter = nodemailer.createTransport({
    service:'QQ',
    secureConnection:true,
    auth:{
        user:userEmail,
        pass:'gllehpvoicrtbeaa' //第三方授权码
    }
})

class ToolSercive extends Service{
    async sendMail(email,subject,text,html){
        const mailOptions = {
            from:userEmail,
            cc:userEmail, //抄送给自己，方便验证
            to:email,
            subject,
            text,
            html
        }
        try{
            await transporter.sendMail(mailOptions)
            return true
        }catch(err){
            console.log('email eror',err)
            return false
        }
    }
}

module.exports = ToolSercive