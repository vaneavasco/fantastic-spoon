const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('unable to connect');
    }

    console.log('connected to mongodb server');
    db.collection('Todos').find({_id : new ObjectID('5a460016ff0dc3236da26cd9')}).toArray().then((docs) => {
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('ubable to fetch', err);
    });

    db.close();
});