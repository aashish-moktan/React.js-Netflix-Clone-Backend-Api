const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const MovieSchema = require('./../models/Movie');

dotenv.config();

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

// CREATE MOVIE
router.post('/',verifyToken, async (request, response)=>{
    if(request.user.isAdmin){
        try{
            const insertRes = await new MovieSchema(request.body).save();
            response.status(201).json(insertRes);
        }
        catch(error){
            if(error.code == 11000){
                response.status(409).json({message: 'Movie already exists'});
            }
            else{
                response.status(500).json(error);
            }
        }
    }
    else {
        response.status(401).json({message: 'Unauthorized user'});
    }
});

// UPDATE
router.put('/:id', verifyToken, async (request, response)=>{
    if(request.user.isAdmin){
        try{
            const updateRes = await MovieSchema.findByIdAndUpdate(request.params.id, request.body,{new:true});
            response.status(200).json(updateRes);
        }
        catch(error){
            response.status(500).json({message:'Failed to update movie. Please try again !!!'});
        }
    }
    else{
        response.status(401).json({message:'Unauthorized'});
    }
});

// DELETE
router.delete('/:id', verifyToken, async (request, response)=>{
    if(request.user.isAdmin){
        try{
            const deleteRes = await MovieSchema.findByIdAndDelete(request.params.id,{new:true});
            if(deleteRes == null){
                response.status(404).json({message: 'Sorry movie not found !!!'});
            }
            else{
                response.status(200).json(deleteRes);
            }
        }
        catch(error){
            response.status(500).json({message:'Failed to delete movie'});
        }
    }
    else{
        response.status(401).json({message:'Unauthorized'});
    }
});

// GET MOVIE BY ID
router.get('/find/:id',async (request, response)=>{
    try{
        const movieData = await MovieSchema.findById(request.params.id);
        if(movieData == null){
            response.status(404).json({message:'Movie not found !!!'});
        }
        else{
            response.status(200).json(movieData);
        }
    }
    catch(error){
        response.status(500).json({message:'Failed to get movie info'});
    }
});

// GET RANDOM MOVIE OR SERIES
router.get('/random', async(request, response)=>{
    try{
        const type = request.query.type;
        let aggregation;
        if(type === "movie"){
            aggregation = [
                {$match: { isSeries: false }},
                {$sample: { size: 1 }}
            ]
        }
        else{
            aggregation = [
                {$match: { isSeries: true}},
                {$sample: { size: 1}}
            ]
        }
        const movieData = await MovieSchema.aggregate(aggregation);
        if(movieData.length == 0){
            response.status(404).json({message:'Data not found !!!'});
        }
        else {
            response.status(200).json(movieData);
        }
    }
    catch(error){
        console.log(error);
        response.status(500).json(error);
    }
});



/*
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
*/

module.exports = router;