const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
var services = require('../services/auth')

router.post('/signup',(req, res,next)=>{  
    services.sendVerificationEmail(req, res);
});

router.get('/activate/:token', (req, res)=>{
    services.activateSignup(req,res);
});


router.post('/login',(req, res, next)=>{
    services.login(req, res);
});


router.post('/resetpsw',(req, res, next)=>{
    services.sendResetEmail(req, res);
}); 


router.post('/reset/:token', (req, res)=>{
    services.resetPassword(req, res);
    });

module.exports = router;
