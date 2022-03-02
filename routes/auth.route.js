const router = require('express').Router();
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const UserSchema = require('./../models/User');

// REGISTER
router.post('/register',async (request,response)=>{
    const data = {
        username: request.body.username,
        email: request.body.email,
        password: CryptoJS.AES.encrypt(request.body.password,process.env.SECRET_KEY).toString()
    }
    try{
        const insertResponse = await new UserSchema(data).save();
        response.status(201).json(insertResponse);
    }
    catch(error){
        if(error.code == 11000 && error.keyPattern.email == 1) response.status(409).json({message:'Email already exist\'s'});
        else response.status(500).json({message: 'Failed to create user.Please try again!!!'});
    }
});

// LOGIN
router.post('/login', async (request, response) => {
    try{
        const user = await UserSchema.findOne({"email":request.body.email});
        if(user == null){
            response.status(404).json({message:'User not found'});
        }
        else{
            // decrypt password
            var bytes  = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
            var originalPassword = bytes.toString(CryptoJS.enc.Utf8);
            if(request.body.password != originalPassword){
                response.status(401).json({message:'Username or password didn\'t match'});
            }
            else{
                const token = jwt.sign({id:user._id, isAdmin:user.isAdmin},process.env.SECRET_KEY,{expiresIn:'5d'});
                const {password, ...obj} = user._doc;
                response.status(200).json({...obj,token});   
            }
        }
    }
    catch(error){
        response.status(500).json(error);
    }
});

module.exports = router;