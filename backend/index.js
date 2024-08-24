const express = require("express");
const serverless = require("serverless-http");
const app = express();

app.use(express.json())

app.get("/hello", (req, res) => {
  res.send("Hello World!");
});

module.exports.handler = serverless(app);