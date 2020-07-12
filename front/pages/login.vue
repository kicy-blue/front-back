<template>
    <div class="login-container">
        <el-form class="login-form" label-width="100px" :model="form" :rules="rules" ref="loginForm">
            <div class="title-container">
                <img src="/joke.jpg" alt="">
            </div>
            <el-form-item prop="email" label="邮箱">
                <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
            </el-form-item>

            <el-form-item prop="captcha" label="验证码" class="captcha-container">
                <div class="captcha">
                    <img :src="code.captcha" alt="" @click="resetCaptcha">
                </div>
                <el-input v-model="form.captcha" placeholder="请输入验证码"></el-input>
            </el-form-item>

             <el-form-item prop="emailCode" label="邮箱验证码" class="captcha-container">
                <div class="captcha">
                    <el-button type="primary" @click="sendEmailCode" :disable="send.timer>0">{{sendText}}</el-button>
                </div>
                <el-input v-model="form.emailCode" placeholder="请输入验证码"></el-input>
            </el-form-item>


            <el-form-item prop="passwd" label="密码">
                <el-input type="password" v-model="form.passwd" placeholder="请输入密码"></el-input>
            </el-form-item>

            <el-form-item label="">
                <el-button type="primary" @click.native.prevent="handleLogin">登录</el-button>
            </el-form-item>
        </el-form>

    </div>
</template>

<script>
import md5 from "md5";
export default {
    layout:'login',
      methods:{
        async sendEmailCode(){
            //@todo
            await this.$http.get('/sendcode?email='+this.form.email)

            this.send.timer = 10 
            this.timer = setInterval(()=>{
                this.send.timer -= 1
                if(this.send.timer===0){
                    clearInterval(this.timer)
                }
            },1000)
        },
        handleLogin(){
            this.$refs.loginForm.validate(async valid=>{
                if(valid){
                    //@todo 发送成功
                    const {...params} = this.form;
                    let obj = {
                       ...params,
                       passwd:md5(this.form.passwd)
                    }
                    console.log('obj',obj)
                    let ret = await this.$http.post('/user/login',obj)
                    // code = 0 成功
                    console.log('ret=',ret)
                    if(ret.code==0){
                        //token存储
                        this.localStorage.setItem('token',res.data.token)
                        this.$message.success('登录成功')
                        setTimeout(()=>{
                            this.$router.push("/")
                        },500)
                    }else{
                        this.$message.error(ret.message)
                    }
                }else{
                    console.log('检验失败')
                }
            })
        },
        resetCaptcha(){
            this.code.captcha = '/api/captcha?'+new Date().getTime()
        }
    },
    computed:{
        sendText(){
            if(this.send.timer<=0){
                return '发送'
            }
            return `${this.send.timer}s后发送`
        }
    },
    data(){
        return {
             send:{
                timer:0
            },
            form:{
                email:"18802683293@163.com",
                passwd:'123456',
                captcha:'',
                emailCode:''
            },
            rules:{
                email:[
                    {required:true,message:"请输入邮箱"},
                    {type:'email',message:"请输入正确的邮箱格式"},
                ],
                captcha:[
                    {required:true,message:"请输入验证码"},
                ],
                emailCode:[
                    {required:true,message:"请输入邮箱验证码"},
                ],
                passwd:[
                    {required:true,pattern:/^[\w_-]{6,12}$/g,message:"请输入密码"},
                ],
            },
            code:{
                captcha:'/api/captcha'
            }
        }
    }
  
}
</script>

<style lang="stylus">

</style>