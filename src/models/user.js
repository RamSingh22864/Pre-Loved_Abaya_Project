
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['seller', 'buyer'],
        default: 'buyer', // Set the default role
        required: true
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    userImage: {
        type: String,
        default: null,
    },
    ContactNumber: {
        type: String,
    },
    
    //password work
    token:{
        type:String,
        default:''
    }
},
{timestamps: true});

module.exports = mongoose.model("User", UserSchema)