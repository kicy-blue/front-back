const BaseController = require('./base')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

//测试用，随机定义hash盐
const HashSalt = "kicylan@bule@123"

const createRule = {
    email:{type:'string'},
    nickname:{type:'string'},
    passwd:{type:'string'},
    captcha:{type:'string'}
}

class UserController extends BaseController{

    async login(){
        this.success('token')
        const {ctx,app} = this
        const {email,captcha,passwd,emailCode} = ctx.request.body
        console.log(ctx.session,'邮箱验证码：',emailCode)
        console.log('ctx.session.captcha',ctx.session.captcha)
        console.log('emailCode',emailCode,'ctx.session.emailcode',ctx.session.emailCode,emailCode!==ctx.session.emailcode)

        if(captcha.toUpperCase()!==ctx.session.captcha.toUpperCase()){
            return this.error('验证码错误')
        }

        if(emailCode!==ctx.session.emailcode){
            return this.error('邮箱验证码错误')
        }

        const user = await ctx.model.User.findOne({
            email,
            passwd:md5(passwd*HashSalt)
        })
        console.log('user==',user)
        if(!user){
            return this.error('用户密码错误')
        }
        //用户的信息加密token 返回
        console.log('app.config.jwt',app.config.jwt)
        const token = jwt.sign({
            _id:user._id,
            email,
        },app.config.jwt.secret,{
            expiresIn:"1h"
        })
        this.success({
            token,email,nickname:user.nickname
        })
    }
    async register(){
        const {ctx} = this
        try{
            //检验传递的参数
            ctx.validate(createRule)
        }catch(e){
            return this.error('参数检验错误',-1,e.error)
        }
        const {email,passwd,captcha,nickname} = ctx.request.body
        // console.log({email,passwd,captcha,nickname})

        if(captcha.toUpperCase()===ctx.session.captcha.toUpperCase()){
            // this.success({name:'test'})
            //邮箱是否重复校验
            if(await this.checkEmail(email)){
                this.error('邮箱重复了')
            }else{
                // 入库操作,新建用户
                const ret = await ctx.model.User.create({
                    email,
                    nickname,
                    passwd:md5(passwd*HashSalt)
                })
                //有id则新增成功
                if(ret._id){
                    this.message('注册成功')
                }
            }
        }else{
            this.error('验证码错误')
        }
        

    }
    async checkEmail(email){
        // 注册到ctx model下的user
        const user = await this.ctx.model.User.findOne({email})
        return user
    }
    async verify(){
        //校验用户名是否存在
    }
    async info(){
        // console.log('进入请求用户接口')
        const {ctx} = this
        //这里还不知道是哪个用户，需要从头部请求(request Headers)的token里读取
        //有点接口需要从token里读数据，有的不需要，==》解析token
        const {email} = ctx.state
        const user =await this.checkEmail(email)
        this.success(user)
    }
}

module.exports = UserController