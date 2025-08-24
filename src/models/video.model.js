import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const vidoeSchema=new mongoose.Schema({
    videofile:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
        
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    title:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        
    },
    description:{
        type:String,
        required:true,
        
    },
    duration:{
        type:Number,
        required:true,
    },
    views:{
        type:Number,
        default:0,

    },
    ispublished:{
        type:Boolean,
        required:true,
        default:true,
    }

    
},{timestamps:true})

vidoeSchema.plugin(mongooseAggregatePaginate)

export const Video= mongoose.model("Video",vidoeSchema)