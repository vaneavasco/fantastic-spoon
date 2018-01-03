const request = require('supertest');
const expect = require('expect');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {ObjectId} = require('mongodb');
const seed = require('./seed/seed');

beforeEach(seed.populateUsers);
beforeEach(seed.populateTodos);

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
                    expect(todos.length).toBe(seed.todosSeed.length);
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
                expect(res.body.todos.length).toBe(seed.todosSeed.length);
            })
            .end(done);
    });
});

describe('GET /todos:id', () => {
    it('should get a valid todo', (done) => {
        request(app)
            .get('/todos/' + seed.todosSeed[0]._id)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toEqual(seed.todosSeed[0]._id);
                expect(res.body.todo.text).toEqual(seed.todosSeed[0].text);
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
        let toHexString = seed.todosSeed[0]._id.toHexString();
        request(app)
            .delete(`/todos/${toHexString}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(toHexString);
                expect(res.body.todo.text).toBe(seed.todosSeed[0].text);
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


describe('GET users/me', () => {
    it('should return user when authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', seed.usersSeed[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(seed.usersSeed[0]._id.toHexString());
                expect(res.body.email).toBe(seed.usersSeed[0].email);
            })
            .end(done);
    });

    it('should return 401 when not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});


describe('POST /users', () => {
    it('should create a user', (done) => {
        let email = 'example@example.com';
        let password = 'password123';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(email);
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
            })
            .end((err) => {
                if (err) {
                    return done();
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                });
            });
    });

    it('it should return validation errors', (done) => {
        request(app)
            .post('/users')
            .send({email: 'wer', password: '12'})
            .expect(400)
            .end(done);
    });

    it('it should not create duplicate users (email in use)', (done) => {
        request(app)
            .post('/users')
            .send({email: seed.usersSeed[0].email, password: seed.usersSeed[0].password})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('my should login a user with valid credentials', (done) => {
        request(app)
            .post('/users/login')
            .send({email: seed.usersSeed[0].email, password: seed.usersSeed[0].password})
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toExist();
                expect(res.headers['x-auth']).toExist();
                expect(res.body.email).toBe(seed.usersSeed[0].email);

            })
            .end((err, res) => {
                if (err) {
                    return done();
                }

                User.findById({_id: seed.usersSeed[0]._id}).then((user) => {
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });

                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not login a user with invalid credentials', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: seed.usersSeed[1].email,
                password: seed.usersSeed[1].password + '1'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(seed.usersSeed[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should delete a valid token', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', seed.usersSeed[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done();
                }

                User.findById(seed.usersSeed[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(e => done())
            });
    });

    it('should respond with 400 to an invalid token', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', seed.usersSeed[0].tokens[0].token + 'bla')
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done();
                }

                User.findById(seed.usersSeed[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch(e => done())
            });
    });
});