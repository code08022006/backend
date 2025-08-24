import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const mongodbConnect=async ()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MOGODB_URI}/${DB_NAME}`)
        console.log(`/n MongoDb connected!! DB host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("Mongodb connection failed: ",error);

        process.exit(1)
        
        
    }
}


export default mongodbConnect