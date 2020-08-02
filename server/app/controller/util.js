
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
//   uploadfile\mergefile 两个方法相辅相成
 async mergefile(){
    const {ext,size,hash} = this.ctx.request.body
    
    const filePath = path.resolve(this.config.UPLOAD_DIR,`${hash}.${ext}`)
    console.log('mergefile,request====filePath:',filePath)
    await this.ctx.service.tools.mergeFile(filePath,hash,size)
    this.success({
        url:`/public/${hash}.${ext}`
    })
  }
  async checkfile(){
      const {ctx} = this
      const {ext,hash} = ctx.request.body
      //判断文件是否存在
      const filePath = path.resolve(this.config.UPLOAD_DIR,`${hash}.${ext}`)
      let uploaded = false
      let uploadedList = []
      if(fse.existsSync(filePath)){
          //文件存在
          uploaded = true
      }else{
          //读取文件目录下面有没有这个文件切片
          uploadedList =await this.getUploadedList(path.resolve(this.config.UPLOAD_DIR,hash))
      }
      this.success({
        uploaded,
        uploadedList
      })
  }
  async getUploadedList(dirPath){
      //判断这个文件目录是否存在
      return fse.existsSync(dirPath)
      // filter(name=>name[0]!=='.' 过滤隐藏文件，比如 .DS_Store
            ? (await fse.readdir(dirPath)).filter(name=>name[0]!=='.')
            : []
  }
  async uploadfile(){
        //切片文件存储格式  public/hash/(hash+index)

        //切片上传报错处理
        //报错 （模拟出错概率）
        if(Math.random()>0.5){
            return this.ctx.status = 500
        }

      //断点续传 不难，难点在前端
      console.log('进入上传文件请求')
      const {ctx} = this
    //   console.log('ctx.request-----------------------------',ctx.request)
      const file = ctx.request.files[0] //获取前端传过来的文件
      const {hash,name} = ctx.request.body; //获取body内容
      console.log('ctx.hash,name-----------------------------',hash,name)

      const chunkPath = path.resolve(this.config.UPLOAD_DIR,hash) //文件夹（hash切片目录）
      const filePath = path.resolve()//文件最终存储位置，合并之后


    //   console.log('file',file,"name:",name)
      //拿到文件按的名字和其他信息
      //将文件目录移到目标目录
      if(!fse.existsSync(chunkPath)){
          await fse.mkdir(chunkPath) //文件不存在，创建一个
      }
      await fse.move(file.filepath,`${chunkPath}/${name}`) //name具体切片的名字放到对应目录下
    //   await fse.move(file.filepath,this.config.UPLOAD_DIR+'/'+file.filename)

      this.message('切片上传成功')

      
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
