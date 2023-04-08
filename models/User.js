const mongoose = require('mongoose');

const Userschema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please add a name']
    },
    email:{
        type:String,
        required:[true, 'Please add an email'],
        unique:true,
        match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },  
    role:{
        type:String,
        enum:['user','publisher'],
        default:'user'
    },
    password:{
        type:String,
        required:[true, 'Please add a password'],
        minlength:6,
        select:false  // not going to be shown when we get the data
    }, 
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
}) 

module.exports = mongoose.model('User',Userschema);