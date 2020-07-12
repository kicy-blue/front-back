const {Service} = require('egg')
const nodemailer = require('nodemailer')

const userEmail = 'kicyblue@126.com'
//新建一个发送者
//需要在邮箱设置中开启授权码
// 授权码 BYWRLYEAFESTRYNS
const transporter = nodemailer.createTransport({
    service:'126',
    secureConnection:true,
    auth:{
        user:userEmail,
        pass:'lan030399'
    }
})

class ToolSercive extends Service{
    async sendMail(email,subject,text,html){
        const mailOptions = {
            from:userEmail,
            to:email,
            subject,
            text,
            html
        }
        try{
            await transporter.sendMail(mailOptions)
            return true
        }catch(err){
            console.log('email erron',err)
            return false
        }
    }
}

module.exports = ToolSercive