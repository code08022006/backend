import mongoose  from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const userSchema=new mongoose.Schema(
{
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        index:true,
        trim:true
    },
    email:{
         type:String,
        required:true,
        unique:true,
        lowercase:true,
        
        trim:true
    },
    fullname:{
         type:String,
        required:true,
        
        lowercase:true,
        index:true,
        trim:true
    },
    avatar:{
        type:String, //cloudnery url
        required:true,
    },
    coverImage:{
        type:String,
        required:false,

    },
    watchhistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"password is required"],
        
    },
    refreshtoken:{
        type:String,
    }
},{timestamps:true})


userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password=await bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jsonwebtoken.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            
            
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User=mongoose.model("User",userSchema)