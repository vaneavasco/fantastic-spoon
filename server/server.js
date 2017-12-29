const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {User} = require('./models/user');
const {Todo} = require('./models/todo');


const app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({text: req.body.text});
    todo.save().then((doc) => {
            res.send(doc);
        },
        (err) => {
            res.status(400).send(err);
        }
    );

});

let port = 3000;
app.listen(port, () => {
    console.log('started on port ', port)
});


// let newTodo = new Todo({
//     text: 'cook breakfast ' + Date.now(),
// });
//
// newTodo.save().then((result) => {
//         console.log(result)
//     },
//     (err) => {
//         console.log(err);
//     }
// );
//
// let newUser = new User({
//     name: 'gigi',
//     email: 'gigi@gmail.com'
// });
//
// newUser.save().then((result) => {
//     console.log(JSON.stringify(result, undefined, 2));
// }, (error) => {
//     console.log('Unable to save user', error);
// });