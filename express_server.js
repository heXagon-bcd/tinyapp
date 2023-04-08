const express = require("express");
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req,rest) => {
  rest.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}!`);
});