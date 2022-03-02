const router = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const CryptoJS = require('crypto-js');
const UserSchema = require('./../models/User');
const { query } = require('express');
// const authRouter = require('./auth.route');
// const verifyToken = require('./../node-api/verifyToken');

// VERIFY TOKEN WITH MIDDLEWARE

const verifyToken = (request, response, next) => {
    const authHeader = request.headers.token;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.SECRET_KEY,(error, userInfo)=>{
            if(error) response.status(401).json({message: 'Token is not valid'});
            request.user = userInfo;
            next();
        });
    }   
    else {
        response.status(401).json({message:'User is not valid'});
    }
}

// UPDATE
router.put('/:id',verifyToken, async (request, response)=>{
    if(request.params.id == request.user.id || request.user.isAdmin){
        if(request.body.password){
            request.body.password = CryptoJS.AES.encrypt(request.body.password,process.env.SECRET_KEY).toString();
        }
        try{
            const updateRes = await UserSchema.findByIdAndUpdate(request.user.id,{$set:request.body},{new:true});
            response.status(201).json(updateRes);
        }
        catch(error){
            response.status(500).json(error);
        }
    }
    else {
        response.status(401).json({message: 'You can only update your account'});
    }
});

// DELETE
router.delete('/:id', verifyToken, async (request, response)=>{
    if(request.params.id === request.user.id || request.user.isAdmin){
        try{
            const deleteRes = await UserSchema.findByIdAndDelete(request.user.id);
            if(deleteRes == null){  
                response.status(404).json({message:'User doesn\'t exist'});
            }
            else{
                response.status(200).json(deleteRes);
            }
        }
        catch(error){
            response.status(500).json(error);
        }
    }
    else{
        response.status(401).json({message:'You can only delete your account'});
    }
});

// GET USER
router.get('/find/:id', async (request, response)=>{
    try {
        console.log(request.params.id);
        const userData = await UserSchema.findById(request.params.id);
        if(userData == null){
            response.status(404).json({message: 'Sorry user not found'});
        }
        else{
            response.status(200).json(userData);
        }
    }
    catch(error){
        response.status(500).json({message:'Internal server error'});
    }
});

// GET ALL USER
router.get('/',verifyToken, async (request, response)=>{
    if(request.user.isAdmin){
        const userData = request.query.new ? await UserSchema.find().limit(10) : await UserSchema.find();
        if(userData == null){
            response.status(404).json({message:'Users not found'});
        }
        else {
            response.status(200).json(userData);
        }
    }
    else{
        response.status(401).json({message:'You are not allowed to see all users!!!'});
    }
});
// GET USER STATS
router.get('/stats',async (request, response)=>{
    const today = new Date();
    const lastYear = today.setFullYear(today.getFullYear() - 1);
    const monthsArray = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "November",
        "December"
    ]
    try {
        const allData = await UserSchema.aggregate([
            {
                $project: {
                    month: {$month:"$createdAt"}
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: {$sum : 1}
                } 
            }
        ]);
        response.status(200).json(allData);
    }
    catch(error){
        response.status(500).json(error);
    }
});

module.exports = router;