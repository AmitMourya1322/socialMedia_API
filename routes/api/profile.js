const express = require('express');
const router = express.Router();
const axios = require('axios')
const config = require('config')
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const {check,validationResult} = require('express-validator')
router.get('/me', auth, async (req,res)=>{
    try{
        const profile= await Profile.findOne({user:req.user.id}).populate('user',
        ['name','avatar'])
        if(!profile){
            return res.status(400).json({msg:'There is no profile'})
        }
        res.json(profile)

    }catch(err){
        console.log(err.message);
        res.status(500).send("sever error")

    }

})

router.post('/',[auth,[
    check('status','required')
.not()
.isEmail(),
check('skills','skill is required')
.not()
.isEmpty()]], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    }
    const {
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        status,
        bio,
        location,
        company,
        githubusername
      } = req.body;

      const profileFields={};
      profileFields.user = req.user.id;
      if(company) profileFields.company = company;
      if(website) profileFields.website = website;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(status) profileFields.status = status;
      if(githubusername) profileFields.githubusername = githubusername;
      if(skills){
        console.log("123")
        profileFields.skills= skills.split(',').map(skill=>
            skill.trim())
      }

      //build social object

      profileFields.social ={}
      if(youtube) profileFields.social.youtube = youtube
      if(twitter) profileFields.social.twitter = twitter
      if(facebook) profileFields.social.facebook = facebook
      if(linkedin) profileFields.social.linkedin = linkedin
      if(instagram) profileFields.social.instagram = instagram
      console.log(skills);
      try{

        let profile = await Profile.findOne({user :req.user.id});
        if(profile){
            // i forget to written porfile so i face issue
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set:profileFields},
                {new :true}
            );
            return res.json(profile)
        }

        //create
        profile = new Profile(profileFields)
        await profile.save();
        res.json(profile)

      }catch(err){
        console.error(err.message);
        res.status(500).send('SErver Error')
      }


})

router.get('/',async(req,res)=>{
    try{
        const profile = await Profile.find().populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:"there is no profile"})
        }
        res.json(profile)

    }catch(err){
        console.error(err.message);
        res.status(500).send('SErver Error')
    }
})


router.get('/user/:user_id',async(req,res)=>{
    try{
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:"there is no profile"})
        }
        res.json(profile)

    }catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg:"there is no profile"})

        }
        res.status(500).send('SErver Error')
    }
})


router.delete('/',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOneAndRemove({user: req.user.id});
        await User.findByIdAndRemove({_id:req.user.id})
        if(!profile){
            return res.status(400).json({msg:"there is no profile"})
        }
        res.json({msg:'user deleted'})

    }catch(err){
        console.error(err.message);
        res.status(500).send('SErver Error')
    }
})

router.put('/experience',[auth,[
    check('title','Title is required')
    .not()
    .isEmpty(),
    check('company','company is required')
    .not()
    .isEmpty(),
    check('from','from date is required')
    .not()
    .isEmpty(),
]], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});

    }
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }= req.body;
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description

    }

    try{
        const profile = await Profile.findOne({user : req.user.id});
        profile.experience.unshift(newExp);
        await profile.save()
        res.json(profile);

    }catch(err){
        console.log(err);
        res.status(500).send('server error')
    }

})
 //delete experience from profile
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id});
        const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex,1);
        await profile.save();
        res.json(profile)

    }catch(err){
        console.log(err);
        res.status(500).send('server error')

    }
})

// add education
router.put('/education',[auth,[
    check('school','School is required')
    .not()
    .isEmpty(),
    check('degree','degree is required')
    .not()
    .isEmpty(),
    check('fieldofstudy','field of study is required')
    .not()
    .isEmpty(),
]], async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});

    }
    const{
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }= req.body;
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description

    }

    try{
        const profile = await Profile.findOne({user : req.user.id});
        profile.education.unshift(newEdu);
        await profile.save()
        res.json(profile);

    }catch(err){
        console.log(err);
        res.status(500).send('server error')
    }

})
 //delete education from profile
router.delete('/education/:edu_id',auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id});
        const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex,1);
        await profile.save();
        res.json(profile)

    }catch(err){
        console.log(err);
        res.status(500).send('server error')

    }
})

router.get('/github/:username',async (req,res)=>{
    try {
        const uri = encodeURI(
            `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
          );
          const headers = {
            'user-agent': 'node.js',
            Authorization: `token get('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')`
          };
          
          const gitHubResponse = await axios.get(uri, { headers })
          res.json(JSON.parse(gitHubResponse));
        }catch (error) {
            console.log(error);
            res.status(500).send('server error')
        }
        
        
    } 
)
module.exports= router