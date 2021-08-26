require('./user');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Signup',{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false} ,(err)=>{
    if (!err){console.log("mongoDB connection successful")}
    else{console.log("Error in DB connection: "+ err)}
});