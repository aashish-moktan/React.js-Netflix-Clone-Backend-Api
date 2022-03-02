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
        response.status(500).json({message: 'Failed to get data. Please try again'});
    }
});


// GET ALL MOVIES
router.get('/',async (request, response)=>{
    try {
        const moviesData = await MovieSchema.find().sort({_id: -1});
        if(moviesData.length == 0){
            response.status(404).json({message: 'Movies not found !!!'});
        }
        else{
            response.status(200).json(moviesData);
        }
    }
    catch(error){
        response.status(500).json({message:'Failed to get movies. Please try again !!!'});
    }
});

module.exports = router;