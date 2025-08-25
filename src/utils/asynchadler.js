const asynchandler=(requesthander)=>{
    return (req,res,next)=>{
        Promise.resolve(requesthander(req,res,next)).catch(
            (err)=>next(err)
        )
    }
}

export {asynchandler}