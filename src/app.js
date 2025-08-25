import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app =express()
//configrations done
app.use(cors({
    origin:process.env.CORS_ORIGIN
}))


app.use(express.json({
    limit:"16kb"
}))//for form data text data

app.use(express.urlencoded({extended:true}))//for url data
app.use(express.static("public"))//to save images
app.use(cookieParser())


//router import

import userrouter from "./routes/user.router.js"

app.use("/api/v1/users",userrouter)
export default app