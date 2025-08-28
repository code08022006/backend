import { asynchandler } from "../utils/asynchadler.js";
import { ApiError } from "../utils/Apierror.js";
import {User} from "../models/user.model.js"
import{cloudinaryUpload} from "../utils/cloudinary.js"

import { ApiResponce } from "../utils/Apiresonse.js";
import jwt from "jsonwebtoken"

const generateRefreshandAccesstoken = async (userid) => {
    try {
        const user = await User.findById(userid);

        if (!user) {
            throw new ApiError(404, "User not found for token generation");
        }

        const accessToken = user.generateAccessToken?.();
        const refreshToken = user.generateRefreshToken?.();

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Token generation methods not defined");
        }

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken };

    } catch (error) {
        console.error("Error in generateRefreshandAccesstoken:", error);
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};


const registeruser=asynchandler( async(req,res)=>{
    console.log(req.body);
    
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
// console.log(req.body)
const {fullname,username,email,password}=req.body
// chaecking that the user must enter all the fields
if ([fullname,username,email,password].some(field => !field || field.trim() === ""))
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
// console.log(req.files);
//here we wnat to know the localpath of the avatar so we did this
const avtarLocalpath=req.files?.avatar[0]?.path
// const coverimagelocalpath=req.files?.coverImage[0]?.path

let coverimagelocalpath;
// this is done to allow user if the coverimage is not uploaded tobhi ddont woory
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverimagelocalpath=req.files.coverImage[0].path
}

//not avatar prenebnt give the erroer to the user
if (!avtarLocalpath){
    throw new ApiError(400,"avtar image must required")
}

//uploading file to cloudinary

const avatar=await cloudinaryUpload(avtarLocalpath);
const coverImage=await cloudinaryUpload(coverimagelocalpath)
//here we see our file is uploaded to cloudinary or not
if(!avatar){
    throw new ApiError(400,"avtar image must be needed")
}
    //here User which is written in user.model.js is the only one which is making contact with the db so to do something with db we have to do it through User
//here we create db entries
    const user= await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url|| "",
        password,
    
        username:username.toLowerCase(),
        email,
        


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


const loginUser=asynchandler(async(req,res)=>{
    
    
    // req body -> data
// username or email
//find the user
//password check
//access and referesh token
//send cookie

const {password,username,email}=req.body; 
//here we are giving the options that user can login with username or emial but password must be eneter
if(!(username || email)){
    throw new ApiError(400,"username or email must be entered")
}

//here we are checking that the the user with given username or password is present in the db or not here we use User.findone because first User is used because we know we are going to contact with db and in our current code only User can contact with db hence we use User and also a dollar or  is a databse operation like in sql we do SELECT same to that
const user =await User.findOne({
    $or:[{username},{email}]
})
// after doing both the above steps if we dont get the user after all that it means the user is never register in the db
if(!user){
    throw ApiError (404,"user not found")
}
// here we are checking the paswwoerd
const ispasswordvalid=await user.isPasswordCorrect(password)//here we pass a password which we retrive from the req.body

if (!ispasswordvalid){
    throw ApiError(401,"password not found")
}
const{refreshToken,accessToken}=await generateRefreshandAccesstoken(user._id)

//now we wan t to send some dta to user but note that in above we make a useLogin which is a object which contains all the user fileds then by this we can simply share to user a userlogin varialbe but note userlogin also contains password and refreshtoken so we have to remove it then we can send it easily
const loggedinUser=await User.findById(user._id).select("-password -refreshtoken") //here we give the the fileds which we dont want in the string and ther name come from User.model.js 

//now we have to send refresh token and access token which we can send through cookies beacuse cookies make them encrypt and then send them
// here httponly true and secure true makes the cookies to be changed by only the server
const options={
    httpOnly:true,
    secure:true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
    new ApiResponce(
        200,
        {
            user:refreshToken,accessToken,loggedinUser
        },
        "user logged in successfully"
    )
)
//now we wnant to logout the user then only we have to do that we want to take refresh token out of the users machine and alsothis we have to take cookiescan do usin a middleware and for this we have to design our own middlewrae middleware means "jatte wakt mujse milke jana"
})
const logoutuser=asynchandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user,{
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true,
        },




    )
    const options={
    httpOnly:true,
    secure:true
}
return res
.status(200)
.clearCookie("accesstoken",options)
.clearCookie("refreshtoken",options)
.json(new ApiResponce(200,{},"user logged out"))
})
//now we want to make sure that after some time the user dont need to re enter his mail and password after suuceessful login so for this we are auto comparing the refrsh token in the db and user refresh token then the logic for this is as follows
const refreshAccessToken=asynchandler(async(req,res)=>{
    //first we access the refresh token which on the user side
    const incominRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incominRefreshToken){
        throw new ApiError(401,"Unauthorized access")
    }
    //now we are verifiying the token in the same way as we doing on the auth middelwre
   try {
     const decodedToken=jwt.verify(incominRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
     // now if we get the decode refresh token then we will get _id which we writeen in the generaterefreshtoken
 
    const user= await User.findById(decodedToken?._id)
 
    if(!user){
     throw new ApiError (401,"invalid refresh token")
    }
 
 //    now we comparing the refresh token
 if(incominRefreshToken !== user?.refreshToken){
     throw new ApiError(401,"refresh token is expired or used")
 
 //if matche then generate new token 
 
 
 
 
 }
 const options={
     httpOnly:true,
 
     secure:true,
 }
 const {accessToken,newrefreshToken}=await generateRefreshandAccesstoken(user._id)
 return res
 .status(200)
 .cookies("accessToken",accessToken,options)
 .cookies("refreshToken",newrefreshToken,options)
 .json(
     new ApiResponce(
         200,
         {
             accessToken,refreshToken:newrefreshToken
         },
         "Access token refreshed successfully"
     )
 )
   } catch (error) {
    throw new ApiError(401,error?.message || "invlaid access token")
    
   }
})

export{registeruser,loginUser,logoutuser,refreshAccessToken}