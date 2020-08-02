<template>
    <div>
        <!-- 编辑器的发展，每一个技术的实现都有一个更新迭代的过程

        任何框架的选择，都要考虑它的扩展、兼容性
        
        1、刚开始用第三方：
        tinyMce,wangEditor
        2、开源定制 slate.js
        3、专门的编辑器团队，非常复杂，word在线版，计算位置，定位，样式，实现一个简单的浏览器工作差不多----大厂
         -->
        <div class="write-btn">
            <el-button @click="submit" type="primary">提交</el-button>
        </div>

        <el-row>
            <el-col :span="12">
                <textarea ref="editor" class="md-editor" :value="content" @input="update" rows="10" cols="10"></textarea>
            </el-col>
            <el-col :span="12">
                <div class="markdown-body" v-html="compiledContent"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
//原生的:value @input --》复习防抖、节流

import marked from 'marked'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import "highlight.js/styles/github.css"

export default {
    data(){
        return{
// timer:null, //在data里声名了，会变成响应式的数据 会按object.definedpropty这个逻辑走一遍，
// 但是timer不需要在页面上显示的，如果一个变量需要在组件上共享，但是不期望额外的性能损耗，就直接在在用的地方this.timer
content:`# kicy
*上课
*工作
*学习
*睡觉
\`\`\`javascript

let a = 1;
console.log(q)
\`\`\`
            `
        }
    },
    mounted(){
        this.timer = null
        this.bindEvents()

        //扩展marked,配置选项
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function(code, language) {
                console.log('language',language)
                const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
                return hljs.highlight(validLanguage, code).value;
            },
        });
    },
    computed:{
        compiledContent(){
            return marked(this.content,{})
        }
    },
    //loadsh/debounce
    methods:{
        bindEvents(){
            this.$refs.editor.addEventListener('paste',async e=> {
                const files = e.clipboardData.files
                console.log(e.clipboardData,'files',files)
                //直接上传
            })
            this.$refs.editor.addEventListener('drop',async e =>{
                const files = e.dataTransfer.files
                console.log('file--transfer',files)
                //@todo 上传文件
                e.preventDefault()
            })
        },
        update(e){
            //清除上一次的定时器
            clearTimeout(this.timer)
            //延迟更新
            this.timer = setTimeout(() => {
                this.content = e.target.value
            }, 350);
            
        },
        async submit(){
            //文章列表、点赞、关注、草稿
            //user表--》aticle 一对多
            let ret = await this.$http.post('article/create',{
                content:this.content,  //接口里设置delected:false 默认不显示
                compiledContent:this.compiledContent //显示只读取这个
            })
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