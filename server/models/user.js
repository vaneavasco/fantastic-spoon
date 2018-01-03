const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const secret = process.env.JWT_SECRET;

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

userSchema.methods.removeToken = function (token) {
    return this.update({
        $pull: {
            tokens: {token}
        }
    });
};

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        bcrypt.genSalt()
            .then((salt) => {
                return bcrypt.hash(this.password, salt);
            })
            .then((hashedPassword) => {
                this.password = hashedPassword;
                next();
            })
            .catch((e) => next());
    } else {
        next();
    }
});

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

userSchema.statics.findByCredentials = function (email, password) {
    return this.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    })
};

let User = mongoose.model('User', userSchema);

module.exports = {User};