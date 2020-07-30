
const svgCaptcha = require('svg-captcha')
// const Controller = require('egg').Controller
const BaseController = require('./base')
const fse = require('fs-extra')
const path = require('path')

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

  async uploadfile(){
      //切片文件存储格式  public/hash/(hash+index)
      //断点续传 不难，难点在前端
      console.log('进入上传文件请求')
      const {ctx} = this
      console.log('ctx.request',ctx.request)
      const file = ctx.request.files[0]
      const {hash,name} = ctx.request.body;
      const chunkPath = path.resolve(this.config.UPLOAD_DIR,hash)
      const filePath = path.resolve()//文件最终存储位置，合并之后


    //   console.log('file',file,"name:",name)
      //拿到文件按的名字和其他信息
      //将文件目录一道目标目录

      if(!fse.existsSync(chunkPath)){
          await fse.mkdir(chunkPath)
      }
      await fse.move(file.filepath,`${chunkPath}/${name}`)

      this.message('切片上传成功')

    //   await fse.move(file.filepath,this.config.UPLOAD_DIR+'/'+file.filename)
      
      this.success({
          url:`/public/${file.filename}`
      })
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
      const text = `您的验证码是：${code}`
      const html = `<h2>kicy蓝<a href="https://github.com/kicy-blue" style="color:blue"></a><h3>${code}</h3></h2>`
      const hasSend = await this.service.tools.sendMail(email,subject,text,html)
      if(hasSend){
          this.message('发送成功')
      }else{
          this.message('发送失败')
      }
  }
}

module.exports = UtilController
