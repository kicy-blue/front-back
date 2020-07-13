module.exports = app =>{
    const mongoose = app.mongoose
    // console.log('model=mongoose===',mongoose)
    const Schema = mongoose.Schema


    const UserSchema = new Schema({
        //select是不查出来返回到前端
        __v:{type:String,select:false},
        email:{type:String,require:true},
        passwd:{type:String,require:true,select:false},
        nickname:{type:String,require:true},
        avatar:{type:String,require:false,default:"/avatar.jpg"},
        // timestamps:true  true会默认生成createtime,updatetime,id字段（inster 、update表一般都需要）
    },{timestamps:true})
    return mongoose.model('User',UserSchema)
}