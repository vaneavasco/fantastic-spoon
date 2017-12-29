const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('unable to connect');
    }

    console.log('connected to mongodb server');

    // db.collection('Todos').insertOne({
    //     test : 'something to do',
    //     completed: false
    // }, (err, result) =>{
    //     if(err) {
    //         return console.log('unable to insert todo', err);
    //     }
    //
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    // db.collection('Users').insertOne({
    //     name: 'Vanea',
    //     age: '29',
    //     location: 'bucharest'
    // }, (err, result) => {
    //     if(err) {
    //         return console.log('insert error' , err);
    //     }
    //
    //     console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
    // });

    db.close();
});