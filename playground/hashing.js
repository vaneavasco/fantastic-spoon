const {SHA256} = require("crypto-js");
const jwt = require('jsonwebtoken');

let data = {
    id: 5
};

let token = jwt.sign(data, 'blabla12');
console.log(token);

console.log(jwt.verify(token, 'blabla12'));

// let message = 'I r baboon';
//
// let hash = SHA256(message).toString();
//
// console.log(`Message: ${message}, hash: ${hash}`);
