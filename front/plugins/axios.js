 import Vue from 'vue'
 import axios from 'axios'

 const service = axios.create({
     //timeout:5
     baseURL:'/api'
 })

//  请求拦截
//主要做token的管理
service.interceptors.request.use(
    async config => {
        const token = localStorage.getItem('token')
        if(token){
            config.headers.common['Authorization'] = 'Bearer'+token
        }
        return config
    }
)

//  响应拦截
service.interceptors.response.use(
    async response=>{
        let {data} = response

        return data
    }
)

 Vue.prototype.$http = service
 export const http = service