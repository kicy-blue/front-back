<template>
   <div ref="list" class="kk-list-container" @scroll="scrollEvent($event)">
        <div class="kk-list-phantom" :style="{height:listHeight+'px'}">
        </div>
        <div class="kk-list" :style="{top:getTop}">
            <ArticleItem class="kk-list-item"
                v-for="item in visibleData"
                :key="item._id"
                :article="item"
                :style="{height:size+'px'}"
            >
            </ArticleItem>
        </div>
    </div>
</template>

<script>
import ArticleItem from "./ArticleItem.vue";
export default {
    components:{
        ArticleItem
    },
    props:{
        listData:{
            type:Array,
            default:()=>[]
        },
        size:{
            type:Number,
            default:200
        }
    },
    computed:{
        listHeight(){
            return this.listData.length*this.size
        },
        getTop(){
            return `${this.stateOffset}px`
        },
        visibleCount(){
            return Math.ceil(this.screenHeight/this.size)
        },
        visibleData(){
            return this.listData.slice(this.start,Math.min(this.end,this.listData.length))
        }
    },
    data(){
        return{
            screenHeight:800,
            stateOffset:0,
            start:0, //开始的索引
            end:4,//结束的索引
        }
    },
    mounted(){
        this.end = this.start+this.visibleCount
    },
    methods:{
        scrollEvent(){
            let scrollTop = this.$ref.list.scrollTop

            this.start = Math.floor(scrollTop/this.size)
            this.end = this.start+this.visibleCount
            this.startOffset = scrollTop-(scrollTop%this.size)

        }
    }
}
</script>

<style>
.kk-list-container{
    height: 100%;
    overflow: auto;
    position: relative;
}
.kk-list-phantom{
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    z-index: -1;
}
.kk-list{
    position:absolute;
    left: 0;
    top: 0;
    right: 0;
}
.kk-list-item{
    padding: 10px;
    color: #555;
    border: 1px solid #999;
}

</style>