//解析token的中间件，也可以用egg-jwt,自己封装更适合了解原理
const jwt = require('jsonwebtoken')

module.exports = ({app})=>{
    return async function verify(ctx,next){
        if(!ctx.request.header.authorization){
            ctx.body = {
                code:-666,
                message:'登录过期了'
            } 
            return
        }

        //解析
        const token = ctx.request.header.authorization.replace('Bearer','')
        try{
            //根据密钥进行验证
            //koa中间件写法
            const ret = await jwt.verify(token,app.config.jwt.secret)
            console.log('ret--中间件',ret)
            ctx.state.email = ret.email
            ctx.state.userid = ret._id
            await next()
        }catch(err){
            console.log('err--中间件',err)
            if(err.name=='TokenExpiredError'){
                ctx.body = {
                    code:-666,
                    message:'登录过期了'
                }
            }else{
                ctx.body = {
                    code:-1,
                    message:'用户信息出错'
                }
            }
        }
    }

}