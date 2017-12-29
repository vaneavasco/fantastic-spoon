const mongoose = require('mongoose');

let User = mongoose.model('User', {
    name: {
        required: true,
        type: String,
        trim: true,
        minlength: 1
    },
    email: {
        required : true,
        trim: true,
        type: String,
        minlength: true
    }
});

module.exports = {User};