import { asynchandler } from "../utils/asynchadler.js";
import { ApiError } from "../utils/Apierror.js";
import {User} from "../models/user.model.js"
import{cloudinaryUpload} from "../utils/cloudinary.js"

import { ApiResponce } from "../utils/Apiresonse.js";
const registeruser=asynchandler( async(req,res)=>{
 // get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return response
//body contains all the input fileds that are eneter by the user in the form ,only text details body has
const {fullname,username,email}=req.body
// chaecking that the user must enter all the fields
if ([fullname,username,email].some((field)=>
field?.trim===""))
{
    throw new ApiError(400,"please enter all the credentials")
}
//checking that the user with the same emeil and username exists  in the server or not
const existedUser=await User.findOne(
    {
        $or:[{username},{email}]
    }
    
)
if(existedUser){
    throw new ApiError(409,"user exists")
}


//here files gives us the properties which are in array because of this we use index to access them
//here we are saving the local path of the file aas multer takes our file then store it to our server for sime time  then uploads is to cloudinary
//? this is used to check optionaly because some time we does not get the property because of the some reason
const avtarLocalpath=req.files?.avatar[0]?.path
const coverimagelocalpath=req.files?.coverImage[0]?.path


if (!avtarLocalpath){
    throw new ApiError(400,"avtar image must required")
}

//uploading file to cloudinary

const avatar=await cloudinaryUpload(avtarLocalpath);
const coverImage=await cloudinaryUpload(coverimagelocalpath)

if(!avatar){
    throw new ApiError(400,"avtar image must be needed")
}
    //here User which is written in user.model.js is the only one which is making contact with the db so to do something with db we have to do it through User
//here we create db entries
    const user= await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url|| "",
        email,
        username:username.toLowerCase(),
        
        


    })
    //here first we check that user is created or not if it is created then we are removing password and refresh tokens from the db
    //syntax to check the user is created or not is await User.findById(user._id)
    const createuser=await User.findById(user._id).select("-password -refreshtoken")

    if(!createuser){
        throw new ApiError(500,"Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponce(200,createuser,"User Registered!")

    )
})

export{registeruser}