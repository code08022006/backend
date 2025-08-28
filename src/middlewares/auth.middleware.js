//here we are implement the logout logic but first we have to first check that usser must be login so we check it first then we proceed to logout method in our controller 

import { ApiError } from "../utils/Apierror.js";
import { asynchandler } from "../utils/asynchadler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
export const verifyJWT=asynchandler(async(req,res,next)=>{
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401,"Unauthorized access")
        }
    
       const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id) .select("-password -refreshtoken")// _id: this._id,
       
        if(!user){
            throw new ApiError(401,"unauthorzed access token")
    
    
    
        }
    
    
        req.user=user
        next()
} catch (error) {

    throw new ApiError(401,error?.message,
        "invalid access token"
    )
    
}
    

})