const request = require('supertest');
const expect = require('expect');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {ObjectId} = require('mongodb');


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

beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todosSeed).then((response) => {
            done()
        });

    });
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        let text = 'test todo test';
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));

            });
    });

    it('should not create a todo with invalid data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(todosSeed.length);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(todosSeed.length);
            })
            .end(done);
    });
});

describe('GET /todos:id', () => {
    it('should get a valid todo', (done) => {
        request(app)
            .get('/todos/' + todosSeed[0]._id)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toEqual(todosSeed[0]._id);
                expect(res.body.todo.text).toEqual(todosSeed[0].text);
            })
            .end(done);
    });

    it('should return not found', (done) => {
        request(app)
            .get('/todos/' + new ObjectId())
            .expect(404)
            .end(done);

    });

    it('should return 404 for invalid ids', (done) => {
        request(app)
            .get('/todos/bla123')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete a valid todo', (done) => {
        let toHexString = todosSeed[0]._id.toHexString();
        request(app)
            .delete(`/todos/${toHexString}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(toHexString);
                expect(res.body.todo.text).toBe(todosSeed[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(toHexString).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch(e => done());
            });

    });


    it('should return not found', (done) => {
        let toHexString = (new ObjectId()).toHexString();
        request(app)
            .delete('/todos/' + toHexString)
            .expect(404)
            .end(done);

    });


    it('should return 404 for invalid ids', (done) => {
        request(app)
            .get('/todos/bla123')
            .expect(404)
            .end(done);
    });


});