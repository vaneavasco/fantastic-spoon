const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const secret = 'somesalt';

let userSchema = new mongoose.Schema({
    email: {
        required: true,
        trim: true,
        type: String,
        minlength: true,
        unique: true,
        validate: {
            validator: (emailValue) => {
                return validator.isEmail(emailValue);
            },
            message: 'Invalid email value.'
        }
    },
    password: {
        required: true,
        type: String,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.toJSON = function () {
    let userObject = this.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = function () {
    let access = 'auth';
    let token = jwt.sign({_id: this._id.toHexString(), access}, secret).toString();

    this.tokens = this.tokens.concat({access, token});

    return this.save().then(() => {
        return token;
    });
};


// userSchema.statics.findByToken = function (token) {
//     let User = this;
//     let decoded;
//
//     try {
//         decoded = jwt.verify(token, secret);
//     } catch (e) {
//
//     }
//
//     return User.findOne({
//         '_id': decoded._id,
//         'tokens.token': token,
//         'tokens.access': 'auth'
//     });
// };

userSchema.statics.findByToken = function (token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, secret);
    } catch (e) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};


let User = mongoose.model('User', userSchema);

module.exports = {User};