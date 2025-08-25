import { Router } from "express";
import { registeruser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.midleware.js";
const router=Router()
//creating a router menas in app.js we give api/v1/users after that/register will execute
//here we mentioning the upload fields
//we upload the data using multar
router.route("/register").post(
    upload.fields([
        //here we are given the name avvtara is given to our databas file to store the image under the avatar and this same name must be given in frontend
        {
            name:"avatar",
            maxCount:1,
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),
    registeruser)

export default router