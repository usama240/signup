const mongoose = require('mongoose');
const User= mongoose.model('User');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const _ = require('lodash')

const services = require('../services/auth')

var api_key = 'key-96dc7fa5c9c88aabae700ed733a93d6f';
var domain = 'sandboxb4af830d421a45268c33921e560fc59c.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
const secret = "activationkey123";
const reset_secret = "resetkey123"

function sendVerificationEmail(req, res){
    const name = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    if(name==''||email==''||password==''){
        res.json({message:'Please fill complete form'});
    }
    
    User.findOne({email}).exec((err, user)=>{
        if(user){
            res.json({mesage: "User with this email already exist"})
        }
        else{
            const token = jwt.sign({name, email, password}, secret , {expiresIn: '1h'});
            var data = {
                from: 'usama.sarwar@vaivaltech.com',
                to: 'usama.sarwar@vaivaltech.com',
                subject: 'Verify your email',
                html: `<h2>Please click on given link to activativate your account</h2>
                <a href="http://localhost:3000/activate/${token}">http://localhost:3000/activate/${token}</a>`
            };
            mailgun.messages().send(data, function (error, body) {
            res.json(body);
          });
        }
    });     
}


function activateSignup(req, res){
    const token = req.params.token;
    if(token){
        jwt.verify(token, secret, (err, decodedToken)=>{
            if(err){
                res.json({message:"Incorrect or Expire Link"});
            }
            const {name, email, password} = decodedToken;
            User.find({username:name}, (err,result)=>{
            if(result!=0){
                res.json(res.render("user/signup"),{message:"you already activated your account"})
            }else{
                bcrypt.hash(password, 10, (err, hash)=>{ 
                    if(err){
                        res.json("error in password: "+err);
                    }
                    else{
                        const user = new User({
                            _id: new mongoose.Types.ObjectId,
                            username: name,
                            password: hash,
                            email: email
                        })
                        user.save()
                        .then(result=>{
                            res.json(result);
                        })
                        .catch(err=>{
                            res.json(err);
                        });
                    }
                });
            }
            });
                })
            }else{
                res.json({message: "Link invalid"});
            }
}

function login(req, res){
    if(req.body.email==''||req.body.password==''){
        res.json({message:'Please fill complete form'});
    }
    User.find({email:req.body.email})
    .then(user=>{
        if(user.length<1){
            res.json({error: "user not exist"});
        }
        bcrypt.compare(req.body.password, user[0].password,(err,result)=>{
            if(!result){
                res.json({error: "Invalid Password"});
            }
            else{ 
                    const token = jwt.sign({
                        username: user[0].username,
                        email: user[0].email
                    },
                    'text',
                    {expiresIn:"1h"});
                res.json({message:"login successfully"});
            }  
        })  
    })
    .catch(err=>{
        res.json(err)
    })
}

function sendResetEmail(req, res){
    email = req.body.email;
    if(email==''){
        res.json({message:'Please type your email'});
    }
    User.find({email:req.body.email})
    .then(user=>{
        if(user.length<1){
            res.json({error:'User not exist'});
        }

        const token = jwt.sign({_id: user._id}, reset_secret , {expiresIn: '1h'});

        var data = {
            from: 'usama.sarwar@vaivaltech.com',
            to: 'usama.sarwar@vaivaltech.com',
            subject: 'Verify your email',
            html: `<h2>Please click on given link to reset your password</h2>
            <a href="http://localhost:3000/reset/${token}">http://localhost:3000/reset/${token}</a>`
        };

        return User.updateOne({resetLink: token}, (err, success)=>{
            if(err){
                res.json({message:"reset password link error"});
            }else{
                mailgun.messages().send(data, function (error, body) {
                    res.json({message: "check your inbox and follow instructions"});
                  });
            }
        });
})
}

function resetPassword(req, res){
    token = req.params.token;
    const pass1 = req.body.newpassword;
    const pass2=req.body.confirmpassword;
    if(pass1==''||pass2==''){
        res.json({message:'Please fill complete details'});
    }
    else{
    if(pass1!=pass2){
        res.json({message: "confirm password doesn't match"});
        }else{
            jwt.verify(token, reset_secret, (err, decodedData)=>{
                if(err){
                    res.json({message: "Invalid or expired link"});
                }
                else{
                    bcrypt.hash(pass1, 10, (err, hash)=>{ 
                        if(err){
                            res.json("error in password: "+err);
                            }
                        else{
                            User.findOne({resetLink: token}, (err, user)=>{
                                if(err||!user){
                                    res.json({message:"Invalid or expired link this"});    
                                }
                                else{
                                    const obj = {
                                        password: hash,
                                        resetLink: ''
                                    }
                                    user = _.extend(user, obj);
                                    user.save((err, result)=>{
                                        if(err){
                                            res.json({message: "reset password error while saving in db"})
                                        }else{
                                            res.json({message: "password successfully reset"})
                                        }
                                    });
                                }
            
                            });
                        }})
                }
            })
        }}
};

module.exports = {
    sendVerificationEmail, activateSignup, login, sendResetEmail, resetPassword
}