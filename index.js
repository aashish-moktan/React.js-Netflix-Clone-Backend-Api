const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
app.get('/',(request,response)=>{
    response.send('GET request for homepage');
});

// setting up database
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.qsz1e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`).then(()=>{
    console.log('Successfully connected to database');
}).catch(()=>{
    console.log('Failed to connect to database');
})


app.listen(8080,()=>{
    console.log("Server is running at port 8080");
});