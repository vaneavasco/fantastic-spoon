const express = require('express');
const bodyParser = require('body-parser');
const {Todo} = require('./models/todo');
const {ObjectID} = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

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

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }, (err) => {
        res.status(400).send({err});
    });
});

app.listen(port, () => {
    console.log(`started at port ${port}`)
});


module.exports = {app};