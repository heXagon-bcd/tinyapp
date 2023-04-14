const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser())
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

//generate url id
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}
//generate user id
function generateRandomUser() {
  return Math.random().toString(36).substr(2, 10)
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {};

app.get("/", (req,res) => {
  res.send("Hello!");
});

//REGISTER PAGE
app.get("/register", (req,res) => {
  const templateVars = {
    urls: urlDatabase,
    user: null//when the user first registers, no user avail,header will look for user, with login
  };
  console.log(req.body)
  res.render("urls_registration",templateVars)
});

app.post("/register", (req,res) => {
  console.log(req.body);
  console.log(req.body.email);
  const randomUser = generateRandomUser();
  const newUser = {
    id: randomUser,
    email: req.body.email,
    password: req.body.password
  };
  users[randomUser] = newUser;
  res.cookie("user_id", newUser.id);
  console.log("user db", users);
  res.redirect("/urls");
});

// URL CREATION PAGE
app.get("/urls", (req, res) => {
  console.log("cookies",req.cookies);
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
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


//LOGIN LOGOUT PAGE
app.post("/login", (req,res) => {
  // console.log("username",req.body.username);
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