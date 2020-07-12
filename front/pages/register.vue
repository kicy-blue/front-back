<template>
  <div class="login-container">
      <el-form class="login-form" label-width="100px" :model="form" :rules="rules" ref="registerForm">
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

            <el-form-item prop="nickname" label="昵称">
              <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
          </el-form-item>

            <el-form-item prop="passwd" label="密码">
              <el-input type="password" v-model="form.passwd" placeholder="请输入密码"></el-input>
          </el-form-item>

            <el-form-item prop="repasswd" label="确认密码">
              <el-input type="password" v-model="form.repasswd" placeholder="请输再次输入面膜"></el-input>
          </el-form-item>

          <el-form-item prop="repasswd" label="">
              <el-button type="primary" @click.native.prevent="handleRegister">注册</el-button>
          </el-form-item>
      </el-form>
  </div>
</template>

<script>
   import md5 from "md5";
export default {
    layout:'login',
      methods:{
        handleRegister(){
            this.$refs.registerForm.validate(async valid=>{
                if(valid){
                    console.log('检验成功')
                    //@todo 发送成功
                    const {repasswd,...params} = this.form;
                    let obj = {
                       ...params,
                       passwd:md5(this.form.passwd)
                    }
                    console.log('obj',obj)
                    let ret = await this.$http.post('/user/register',obj)
                    // code = 0 成功
                    console.log('ret=',ret)
                    if(ret.code==0){
                        this.$alert('注册成功','成功',{
                            confirmButtonText:'去登录',
                            callback:()=>{
                                this.$router.push('/login')
                            }
                        })
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
    data(){
        return {
            form:{
                email:"18802683293@126.com",
                nickname:'kicy',
                passwd:'123456',
                repasswd:'123456',
                captcha:''
            },
            rules:{
                email:[
                    {required:true,message:"请输入邮箱"},
                    {type:'email',message:"请输入正确的邮箱格式"},
                ],
                captcha:[
                    {required:true,message:"请输入验证码"},
                ],
                nickname:[
                    {required:true,message:"请输入昵称"},
                ],
                passwd:[
                    {required:true,pattern:/^[\w_-]{6,12}$/g,message:"请输入密码"},
                ],
                repasswd:[
                    {required:true,message:"请输入再次输入密码"},
                    {validator:(rule,value,callback)=>{
                        if(value !== this.form.passwd){
                            callback(new Error('两次密码不一致'))
                        }
                            callback()
                        }
                    }
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