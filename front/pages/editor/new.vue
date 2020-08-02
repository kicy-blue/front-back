<template>
    <div>
        <div class="write-btn">
            <el-button @click="submit" type="primary">提交</el-button>
        </div>

        <rl-row>
            <el-col :span="12">
                <textarea class="md-editor" :value="content" @input="update" rows="10" cols="10"></textarea>
            </el-col>
            <el-col :span="12">
                <div class="markdown-body" v-html="compiledContent"></div>
            </el-col>
        </rl-row>
    </div>
</template>

<script>
//原生的:value @input --》复习防抖、节流

import marked from 'marked'
export default {
    data(){
        return{
            // timer:null, //在data里声名了，会变成响应式的数据 会按object.definedpropty这个逻辑走一遍，
            // 但是timer不需要在页面上显示的，如果一个变量需要在组件上共享，但是不期望额外的性能损耗，就直接在在用的地方this.timer
            content:`# kicy
            *上课
            *工作
            *学习
            *睡觉`
        }
    },
    mounted(){
        this.timer = null
    },
    computed:{
        compiledContent(){
            return marked(this.content,{})
        }
    },
    methods:{
        submit(){

        },
        update(e){
            //清除上一次的定时器
            clearTimeout(this.timer)
            //延迟更新
            this.timer = setTimeout(() => {
                this.content = e.target.value
            }, 350);
            
        }
    }
}
</script>

<style scpoed>
    .md-editor{
        width: 100%;
        height: 100vh;
        outline: none;
    }
    .write-btn{
        position: fixed;
        z-index: 100;
        right: 30px;
        top: 30px;
    }
</style>