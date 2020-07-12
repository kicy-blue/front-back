'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app
    router.get('/', controller.home.index)
    //验证码 服务
    router.get('/captcha',controller.util.captcha)
    router.get('/sendcode',controller.util.sendcode)

    router.group({name:'user',prefix:'/user'},router=>{
        const {info,register,login,verify} = controller.user
        router.post('/register',register)
        router.post('/login',login)
        router.get('/info',info)
        router.get('/verify',verify)
    })
  

}
