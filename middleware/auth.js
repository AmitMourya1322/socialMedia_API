const jwt = require('jsonwebtoken');

module.exports =(req,res,next)=>{
    //get to the headen from the header
    const token = req.header('x-auth-token');


    //check if not token
    if(!token){
        return res.status(401).json({msg:'No token , authroization denied'})

    }

    try{
        const decoded =  jwt.verify(token,"secretkey")
        req.user = decoded.user;
        next();

    }catch(err){
        res.status(401).json({mesg:'token is not valid'});

    }
}