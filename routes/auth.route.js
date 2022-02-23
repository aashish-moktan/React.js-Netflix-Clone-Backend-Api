const router = require('express').Router();
const CryptoJS = require('crypto-js');
require('dotenv').config();
const UserSchema = require('./../models/User');

router.post('/register',async (request,response)=>{
    const data = request.body;
    const password = CryptoJS.AES.encrypt(data.password,process.env.SECRET_KEY);
    data['password'] = password;
    try{
        const insertResponse = await new UserSchema(data).save();
        response.send(insertResponse);
    }
    catch(error){
        response.send(error);
    }
});

module.exports = router;