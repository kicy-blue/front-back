const {Service} = require('egg')
const nodemailer = require('nodemailer')
const fse = require('fs-extra')
const path = require('path')
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
    async mergeFile(filePath,filehash,size){
        const chunkDir = path.resolve(this.config.UPLOAD_DIR,filehash)//切片文件夹
        let chunks = await fse.readdir(chunkDir) //fse.readdir 读取所有文件名字
        chunks.sort((a,b)=>a.split('-')[1]-b.split('-')[1]) //数组排序
        chunks = chunks.map(cp=>path.resolve(chunkDir,cp)) //每个chunk都是一个完整的路径
        console.log('ToolSercive====chunkDir:',chunkDir)
       console.log('chunks',chunks)
        await this.mergeChunks(chunks,filePath,size)
    }
    async mergeChunks(files,dest,size){
        const pipStream = (filePath,writeStream)=>new Promise((resolve)=>{
            const readStream = fse.createReadStream(filePath) //createReadStream 创建可读的流，把filepath读出来
            readStream.on('end',()=>{
                fse.unlinkSync(filePath)
                resolve()
            })
            //一边读一写
            readStream.pipe(writeStream)
        })

        await Promise.all(
            files.map((file,index)=>{
                //createWriteStream创建一个可读的流   dest目标文件
                pipStream(file,fse.createWriteStream(dest,{
                    // start:index*size,
                    // end:(index+1)*size,
                    start:Math.floor(index*size),
                    end:Math.floor((index+1)*size)
                }))
            })
        )
    }
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