
const svgCaptcha = require('svg-captcha')
// const Controller = require('egg').Controller
const BaseController = require('./base')

class UtilController extends BaseController {
  async captcha() {
    const captcha = svgCaptcha.create({
        size:4,
        fontSize:50,
        width:100,
        height:40,
        noise:3
    })
    console.log('captcha==>',captcha.text)

    this.ctx.session.captcha = captcha.text
    this.ctx.response.type = "image/svg+xml"
    this.ctx.body = captcha.data
  }
  async sendcode(){
      console.log('邮箱请求 =======')
      const {ctx} = this
      const email = ctx.query.email
      //生成随机验证码 截取4个
      let code = Math.random().toString().slice(2,6)
      console.log('邮箱'+email+'验证码：'+code)
      ctx.session.emailcode = code
      const subject = 'kicy蓝 验证码'
      const text = ''
      const html = `<h2>kicy蓝<a href="https://github.com/kicy-blue"></a></h2>`
      const hasSend = await this.service.tools.sendMail(email,subject,text,html)
      console.log('hasSend',hasSend,this.message)
      if(hasSend){
          this.message('发送成功')
      }else{
          this.message('发送失败')
      }
  }
}

module.exports = UtilController
