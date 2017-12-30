const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

//let id = '5a4754ae9dd7ac386e0ab1b3';

// Todo.find({_id: id}).then((todos) => {
//     console.log(todos);
// });
//
//
// Todo.findOne({_id: id}).then((todo) => {
//     console.log(todo);
// });

// if(!ObjectID.isValid(id)) {
//     console.log('Id not valid');
// }
//
// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found');
//     }
//
//     console.log(todo);
// }).catch((e) => console.log(e));

let id = '5a46a510e7c25c24489a4e4d';

User.findById(id).then((user) => {
    if (!user) {
        return console.log('Unable to find user');
    }

    console.log(JSON.stringify(user, undefined, 2));
}, (e) => {
    console.log(e);
});



