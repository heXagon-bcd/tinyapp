const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser())

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req,res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  console.log(req.cookies)
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const foundKey = Object.keys(urlDatabase).find((key) => urlDatabase[key] === req.body.longURL);// find if long url already exists in dictionary
  if (foundKey === undefined) {
    randomString = generateRandomString()
    urlDatabase[randomString] = req.body.longURL;
    return res.redirect(`/urls/${randomString}`);
  } else {
    res.send("its already there");
  }
  console.log(req.body); // Log the POST request body to the console

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL === undefined) {
    res.send("404");
  } else {
    res.redirect(longURL);
  }
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.post("/login", (req,res) => {
  console.log("username",req.body.username);
  res.cookie("username",req.body.username);
  res.redirect(("/urls"))
  
});

app.post("/logout", (req,res) => {
  console.log("username",req.body.username);
  res.cookie("username",req.body.username);
  res.clearCookie('username', {path: "/login"});
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}!`);

  
});