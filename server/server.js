require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const auth = require('./middleware/auth');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(404).send();
});

app.post('/todos', auth.authenticate, (req, res) => {
    let todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', auth.authenticate, (req, res) => {
    Todo.find({_creator: req.user._id}).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', auth.authenticate, (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({_id: id, _creator: req.user._id}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }


        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', auth.authenticate, (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove({_id: id, _creator: req.user._id}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.status(200).send({todo});
    }).catch((e) => {
        res.status(400).send()
    });
});

app.patch('/todos/:id', auth.authenticate, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = Date.now();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {"new": true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        return res.status(400).send();
    })
});

app.post('/users', (req, res) => {
    let userData = _.pick(req.body, ['email', 'password']);
    if (_.isEmpty(userData)) {
        return res.status(400).send();
    }

    let user = new User(userData);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.get('/users/me', auth.authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    loginData = _.pick(req.body, ['password', 'email']);
    if (!loginData.hasOwnProperty('password') || !loginData.hasOwnProperty('email')) {
        res.status(400).send();
    }

    User.findByCredentials(loginData.email, loginData.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch(e => res.status(400).send())
});

app.delete('/users/me/token', auth.authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};