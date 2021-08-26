require('./models/db');
const express = require('express');
var app = express();

const userController = require('./controllers/userController');

app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.use('/', userController);

app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.listen(process.env.PORT||3000,()=>{
    console.log("Express Server Started at Port: 3000");
});
