const express = require('express');
const router = express.Router();
const User = require('../../models/User')
const auth = require('../../middleware/auth');
const bcrypt = require('bcrypt')
const gravatar =require('gravatar')
// const config =require('config')
const jwt = require('jsonwebtoken')
const {check,validationResult} = require('express-validator')
router.get('/',auth,async (req,res)=>{
    try{
        const user  = await User.findById(req.user.id).select('-password')
        res.json(user);

    }catch(err){
        console.log(err.message);
        res.status(500).send('Server Error')

    }

}
)

router.post('/',[check('email','Please include a valid email')
.isEmail(),
check(
    'password',
    'password is requried'
).exists()],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {email,password} = req.body;
   try{
    let user = await User.findOne({email});
    if(!user){
        res.status(400).json({errors:[{msg:'Invalid credentials'}]})
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        res.status(400).json({errors:[{msg:'Invalid credentials'}]})
    }
   
    const payload ={
        user:{
            id:user.id
        }
    }
    jwt.sign(payload,"secretkey",{expiresIn:360000}
    ,(err,token)=>{
        if(err) throw err;
        res.json({token});
    })

   }catch(err){
    console.log(err)

   }

    //see if users exists


    // get users avatar

    //encrypt password

    //return jsonwebtoken
    // res.send('User Route')
})


module.exports= router