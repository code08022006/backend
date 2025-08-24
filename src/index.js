import mongodbConnect from "./db/index.js";
import dotenv from "dotenv"
import app from "./app.js";
dotenv.config({
    path:"./env"
})


mongodbConnect()
.then(()=>{
    app.listen(process.env.PORT ||8000 , ()=>{
        console.log(`the app is running on the port : ${process.env.PORT}`);
        
    })
})
    

.catch((err)=>{
    console.log("Mongo DB connection failed",err);
    
})