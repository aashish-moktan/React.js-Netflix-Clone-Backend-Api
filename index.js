const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const urlEncoder = bodyParser.urlencoded({extended:false});
const jsonEncoder = bodyParser.json();
const authRouter = require('./routes/auth.route');

// setting body parser
app.use(urlEncoder);
app.use(jsonEncoder);

// setting route for auth
app.use('/api/auth',authRouter);

// setting up database
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.qsz1e.mongodb.net/netflix?retryWrites=true&w=majority`,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log('Successfully connected to database');
}).catch(()=>{
    console.log('Failed to connect to database');
})

app.get('/',(request,response)=>{
    response.send('GET request for homepage');
});



app.listen(8080,()=>{
    console.log("Server is running at port 8080");
});