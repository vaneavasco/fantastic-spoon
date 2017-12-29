const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if(err) {
        return console.log('unable to connect');
    }

    console.log('connected to mongodb server');

    //findOneAndDelete
    db.collection('Todos').findOneAndUpdate({_id: new ObjectID("5a4685da7a8684eadcacea01")}, {$set : {completed: true}}, {returnOriginal: false}).then((result) => {
        console.log(result);
    }, (err) => {
        console.log(err);
    });



    db.close();
});