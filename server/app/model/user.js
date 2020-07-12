module.exports = app =>{
    const mongoose = app.mongoose
    // console.log('model=mongoose===',mongoose)
    const Schema = mongoose.Schema
    console.log('model=Schema===',Schema)


    const UserSchema = new Schema({
        email:{type:String,require:true},
        passwd:{type:String,require:true},
        nickname:{type:String,require:true},
        avatar:{type:String,require:false,default:"/avatar.jpg"},
        // timestamps:true  true会默认生成createtime,updatetime,id字段（inster 、update表一般都需要）
    },{timestamps:true})
    return mongoose.model('User',UserSchema)
}