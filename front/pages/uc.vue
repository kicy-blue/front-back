<template>
    <div>
        <h1>用户中心</h1>

        <div id="drag" ref="drag">
            <input type="file" nmae="file" @change="handleFilerChange">
        </div>
        <div>
            <el-progress :stroke-width="20" :text-inside="true" :percentage="uploadProgress"></el-progress>
        </div>
        <el-button @click="uploadFile">上传</el-button>
        <div>
            <p>计算hash的进度</p>
            <el-progress :stroke-width="20" :text-inside="true" :percentage="hashProgress"></el-progress>
        </div>

        <div>
            <!-- chunk.progress
            progress<0 报错，显示红色
            ==100 成功
            别的数字 方块高度显示
            尽可能让方块看起来是正方形--》动态计算
             -->
             <!-- <pre>
                 {{chunks || json}}
             </pre> -->
            <div class="cube-container" :style="{width:cubeWidth+'px'}">
                <div class="cube" v-for="chunk in chunks" :key="chunk.name">
                    <div :class="{
                        'uploading':chunk.progress>0 && chunk.progress<100,
                        'success':chunk.progress==100,
                        'error':chunk.progress<0
                        }"
                        :style="{height:chunk.progress+'%'}">
                        <i class="el-icon-loading" style="color:#f56c6c" v-if="chunk.progress<100 && chunk.progress>0"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import sparkMD5 from 'spark-md5'
const CHUNK_SIZE = 0.1*1024*1024   //切片 切成100k
export default {
    async mounted(){
        const ret = await this.$http.get('/user/info')
        console.log(ret)
        this.bindEvents()
    },
    data(){
        return {
            file:null,
            // uploadProgress:0,
            hashProgress:0,
            chunks:[],
            hash:''
        }
    },
    computed:{
        cubeWidth(){
            return Math.ceil(Math.sqrt(this.chunks.length))*16
        },
        uploadProgress(){
            if(!this.file || this.chunks.length){
                return 0
            }
            // reduce 要放一个初始值 0
            const loaded = this.chunks.map(item=>item.chunk.size*item.pregress)
                            .reduce((acc,cur)=>acc+cur,0)
                            return parseInt(((loaded*100)/this.file.size).toFixed(2))
        }
    },
    methods:{
        //监听三个方法：移入，移出，hover
        bindEvents(){
            const dray = this.$refs.drag
            drag.addEventListener('dragover',e=>{
                drag.style.borderColor = 'red'
                e.preventDefault()
            })
            drag.addEventListener('dragleave',e=>{
                drag.style.borderColor = '#eee'
                e.preventDefault()
            })
            drag.addEventListener('drop',e=>{
                console.log(e.dataTransfer)
                const fileList = e.dataTransfer.files;
                drag.style.borderColor = '#eee'
                this.file = fileList[0]
                 e.preventDefault()
                 console.log('this.file',this.file)
            })
        },
        async blobToString(blob){
            return new Promise(resolve=>{
                const reader = new FileReader()
                reader.onload = function(){
                    console.log(reader.result)
                    const ret = reader.result.split('')
                                .map(v=>v.charCodeAt()) //先转成二进制
                                .map(v=>v.toString(16).toUpperCase())  //再toString(16) 转成16进制
                                .map(v=>v.padStart(2,'0')) //补齐两位数，用0填充
                                .join(' ')
                    resolve(ret)
                }
                reader.readAsBinaryString(blob)
            })
        },
        async isGif(file){
            //前面6个进制 '47 49 46 38 39 61' 和 '47 49 46 38 37 61' 不同年代的两个规范
            //转成对应的字符  GIF89a 和 GIF87a
            //16进制转化
            const ret = await this.blobToString(file.slice(0,6))
            console.log('isGif',ret)
            //图片头信息
            const isGif = (ret == '47 49 46 38 39 61') ||  (ret == '47 49 46 38 37 61') 
            //扩展：二进制判断图片的宽高
            return isGif
        },
        async isPng(file){
            //通过文件流来判定
            //先判定是不是gif  89 50 4E 47 0D 0A 1A 0A
            const ret = await this.blobToString(file.slice(0,8))
            const isPng = ret=="89 50 4E 47 0D 0A 1A 0A"
            return isPng
        },
         async isJpg(file){
            //通过文件流来判定
            //先判定是不是gif  89 50 4E 47 0D 0A 1A 0A
            const len = file.size
            const start = await this.blobToString(file.slice(0,2))
            const tail = await this.blobToString(file.slice(-2,len))
            const isJpg = (start=="FF D8") && (tail=="FF D9")
            return isJpg
        },
        async isImage(file){
            //通过文件流来判定
            //先判定是不是gif
            const isGif = await this.isGif(file)
            const isPng = await this.isPng(file)
            const isJpg = await this.isJpg(file)
            return isGif || isPng || isJpg
        },
        createFileChunk(file,size=CHUNK_SIZE){
            //切片上传
            const chunks = []
            let cur = 0
            while(cur<this.file.size){
                chunks.push({index:cur,file:this.file.slice(cur,cur+size)})
                cur += size
            }
            return chunks
        },
        //将md5第三方依赖整再static静态文件里（或者放在后端的public下），直接访问到,避免卡顿
        async calculateHashWorker(){
            return new Promise(resolve=>{
                this.worker = new Worker('./hash.js')
                //每次计算传chunks过去
                this.worker.postMessage({chunks:this.chunks})
               //计算后回传
                this.worker.onmessage = e =>{
                    const {progress,hash} = e.data
                    this.hashProgress = Number(progress.toFixed(2))
                    //如果hash值出来，说明计算完毕，resolve出来
                    if(hash){
                        resolve(hash)
                    }
                }

            })
        },
        async calculateHashIdle(){
             const chunks = this.chunks;
            //利用react的fiber
            return new Promise(resolve=>{
                const spark = new sparkMD5.ArrayBuffer()
                let count = 0

                //追加函数
                const appendToSpark = async file=>{
                    return new Promise(resolve=>{
                        const reader = new FileReader()
                        reader.readAsArrayBuffer(file) //安装数组的方式把二进制文件读取进来
                        reader.onload = e => {
                            spark.append(e.target.result)
                            resolve()
                        }
                    })
                }
                const workLoop = async deadline => {
                   
                    while(count<chunks.length && deadline.timeRemaining()>1){
                        //空闲时间,且又任务
                        await appendToSpark(chunks[count].file)
                        count++
                        if(count<chunks.length){
                            this.hashProgress = Number(
                                ((100*count)/chunks.length).toFixed(2)
                            )
                        }else{
                            this.hashProgress = 100
                            resolve(spark.end())
                        }
                    } 
                    window.requestIdleCallback(workLoop) //如果没有空闲时间，启动等到下一次
                }
                window.requestIdleCallback(workLoop)

            })

        },
        async calculateHashSample(){
            return new Promise(resolve=>{
                const spark = new sparkMD5.ArrayBuffer()
                const reader = new FileReader()
                //方法3;参考布隆过滤器  判断一个数据是否存在
                //1个G文件，抽样后5M以内
                //hash一样，文件不一样一样
                //hash不一样，文件一定不一样


                const file = this.file;
                const size = file.size;
                const offset = 2*1024*1024
                //第一个区块2M.最后一个区块书全要
                // 中间的，取前后各两个字节
                let chunks = [file.slice(0,offset)]

                let cur = offset
                while(cur<size){
                    if(cur+offset>=size){
                        //最后一个
                        chunks.push(file.slice(cur,cur+offset))
                    }else{
                        //下面是抽样的功能
                        //中间区块 中间的、取前后中各两节
                        const mid = cur + offset/2
                        const end = cur + offset 
                        chunks.push(file.slice(cur,cur+2))
                        chunks.push(file.slice(mid,mid+2))
                        chunks.push(file.slice(end-2,end))
                    }
                    cur += offset
                }
                reader.readAsArrayBuffer(new Blob(chunks))
                reader.onload = e => {
                    spark.append(e.target.result)
                    this.hashProgress = 100
                    resolve(spark.end())
                }
            })
        },
        async uploadFile(){
            //判定文件类型
            // if(!await this.isImage(this.file)){
            //     return
            // }
            // this.chunks = this.createFileChunk(this.file)
            //优化 ==》 动态计算
            const chunks = this.createFileChunk(this.file)

            // 三种方法，前两种计算的hash是一样的，后一个大文件时hash值和前两个不同

            // 方法一：
            //不要直接使用md5.hash计算，会使浏览器卡顿 ，先使用Wothis.rker
            // const hash1 = await this.calculateHashWorker()
            // console.log('文件hash1',hash1)

             // 方法二：
            //为什么需要hash值，为了实现文件的秒传，不重复
            //hash1使用react中的一个方法，利用浏览器的空闲时间，进行计算
            // const hash2 = await this.calculateHashIdle()
            // console.log('文件hash2',hash2)

             // 方法三：
            //抽样hash 不算全量
            //布隆过滤器 损失一小部分精度，换取效率
            const hash = await this.calculateHashSample()
            console.log('文件hash',hash)
            this.hash = hash;

            //32节---实现秒传
            //问一下后端，文件是否上传过，如果没有，是否又存在的切片
            const {data:{uploaded,uploadedList}} = await this.$http.post('/checkfile',{
                hash:this.hash,
                ext:this.file.name.split('.').pop()
            })

            console.log('uploaded',uploaded)

            if(uploaded){
                //秒传
                return this.$message.success('秒传成功！')
            }

            //28节----切片给上传
            this.chunks = chunks.map((chunk,index)=>{
                //切片的名字 hash+index
                const name = hash + '-' + index
                //变成结构化的数据
                return {
                    hash,
                    name,
                    index,
                    chunk:chunk.file,
                    //设置进度条,已经上传的，设为100，否则时0
                    progress:uploadedList.indexOf(name)>-1?100:0
                }
            })
           
            await this.uploadChunks(uploadedList)

            return
            //一下是其他简单的上传方式

            //文件是二进制的内容，放在formData里
            const form  = new FormData()
            form.append('name','file') //append把文件放进去
            form.append('file',this.file) //append把文件内容放进去
            const ret = await this.$http.post('/uploadfile',form,{
            //     onUploadProgress:progress=>{
            //         this.uploadProgress = Number(((progress.loaded/progress.total)*100).toFixed(2))
            //         console.log('uploadProgress',this.uploadProgress)
            //    }
            })
        },
        async uploadChunks(uploadedList){
            console.log('uploadedList',uploadedList,'this.chunks',this.chunks)
            const requests = this.chunks.map((chunk,index)=>{
                //转成promise
                console.log('每个切片',chunk)
                const form = new FormData()
                form.append('chunk',chunk.chunk)
                form.append('name',chunk.name)
                form.append('hash',chunk.hash)
                // form.append('index',chunk.index)//可以不传，后台不需要
                return {form,index:chunk.index,error:0}  //把整个chunk变成结构化的form

            // {form,index})  这里的index时chunk的index
            })
            // .map(({form,index})=>this.$http.post('/uploadfile',form,{
            //     onUploadProgress:progress=>{
            //         //不是整体进度条了，二十每个区块的进度条，整体进度条需要计算出来
            //         console.log('index,progress',index,progress)
            //         this.chunks[index].progress = Number(((progress.loaded/progress.total)*100).toFixed(2))
            //         // this.$set(this.chunks[index],'progress',_progress)
            //         console.log('uploadProgress',this.chunks[index])
            //    }
            // }))

            // @todo 并发量控制
            //尝试申请tcp连接过多，也会造成卡顿 （同一时间发出很多的request请求）
            //异步的并发数控制，
            // await Promise.all(requests)
            console.log('requests======',requests)
            await this.sendRequest(requests)
            await this.mergeRequest()
        },
        /*
        ****扩展：上传区块大小根据当前网络计算
            TCP慢启动，先上传一个初始区块，比如10kb，根据山川成功时间，决定下一个区块是20k，还是50k，还是5k,
            下一个一样的逻辑。肯能是100k，200k，或者2k
        */

        //上传可能报错
        //报错之后，进度条变红，开始重试
        //一个切片重试失败三次，整体全部终止
        async sendRequest(chunks,limit=4){
            //限制并发数
            //一个数组，长度时limit
            return new Promise((resolve,reject)=>{
                let len = chunks.length
                let counter = 0
                let isStop = false;

                const start = async ()=> {
                    if(isStop) return //终止所有任务

                    const task = chunks.shift() //弹出一个任务
                    console.log(chunks,'task',task)
                    if(task){
                        const {form,index,error} = task
                        console.log('form',form)

                        try{
                            await this.$http.post('/uploadfile',form,{
                                onUploadProgress:progress=>{
                                    //不是整体进度条了，二十每个区块的进度条，整体进度条需要计算出来
                                    this.chunks[index].progress = Number(((progress.loaded/progress.total)*100).toFixed(2))
                                }
                            })
                            if(counter==len-1){
                                //最后一个任务
                                resolve()
                            }else{
                                counter++
                                //启动下一个任务
                                start()
                            }
                        }catch(e){
                            this.chunks[index].progress = -1 //-1标红

                            //失败3次内尝试启动
                            if(error<3){
                                error++
                                chunks.unshift(task)
                                start()
                            }else{
                                //错误三次
                                isStop = true
                                reject()
                            }
                        }
                    }

                    
                }

                while(limit>0){
                    //启动limit个任务
                    //模拟延迟
                    setTimeout(()=>{
                        start()
                    },Math.random()*2000)
                    limit -= 1
                }
            })
        },
        async mergeRequest(){
            this.$http.post('mergefile',{
                ext:this.file.name.split('.').pop(),
                size:CHUNK_SIZE,//每个区块的大小
                hash:this.hash
            })
        },
        handleFilerChange(e){
            const [file] = e.target.files
            console.log('e',file,e)
            this.hashProgress = 0

            if(!file) return
            this.file = file
        }
    }
}
</script>

<style lang="stylus">
#drag
  height 100px
  line-height 100px
  border 2px dashed #eee
  text-align center
  vertical-align middle

.cube-container
  .cube
    width 14px
    height 14px
    line-height 12px 
    border 1px black solid
    background #eee
    float left 
    >.success
      background green
    >.uploading
      background blue
    >.error
      background red

</style>