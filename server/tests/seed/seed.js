const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
const secret = 'somesalt';

const todosSeed = [
    {
        _id: new ObjectId(),
        text: 'First test todo'
    },
    {
        _id: new ObjectId(),
        text: 'Second test todo'
    }
];

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const usersSeed = [
    {
        _id: userOneId,
        email: 'user@example.com',
        password: 'userOnePass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id: userOneId, access: 'auth'}, secret).toString()
            }
        ]
    },
    {
        _id: userTwoId,
        email: 'user2@example.com',
        password: 'userTwoPass',
    },

];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todosSeed).then(() => {
            done()
        });

    });
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        let savePromises = [];
        usersSeed.forEach((element) => {
            savePromises.push(new User(element).save())
        });

        return Promise.all(savePromises);
    }).then(() => done());
};

module.exports = {
    todosSeed,
    populateTodos,
    usersSeed,
    populateUsers
};