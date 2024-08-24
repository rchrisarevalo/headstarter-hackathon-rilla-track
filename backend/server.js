const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const server = express();
server.use(express.json());
server.use(cors());


server.get("/", (req, res) => {
    res.send('Hello world');
});

server.get("/status", (req, res) => {
    res.send('Hello status!')
})

module.exports.handler = serverless(server);