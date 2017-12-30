const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


// Todo.remove({}).then((result) => {
//     console.log(result);
// });

let id= '5a47f4a5f6685bcf19addd56';

Todo.findByIdAndRemove(id).then((todo) => {
    console.log(todo);
}, (err) => {
    console.log(err);
});