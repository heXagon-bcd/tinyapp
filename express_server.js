const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const {emailLookup, generateRandomString, generateRandomUser, urlsForUser} = require('./helpers');
const app = express();
const PORT = 8080;
app.use(cookieSession({
  name: 'session',
  keys: ['secret', 'keys'],
  maxAge: 24 * 0 * 0 * 0. //Cookie Options days/hours/minutes/seconds
}));
app.set("view engine", "ejs"); // use ejs as templating enjine
app.use(express.urlencoded({ extended: true }));

//object to handle url input
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//object to handle user input
const users = {
};

//REGISTER PAGE
//GET route for /register which renders the registration template
app.get("/register", (req,res) => {
  const templateVars = {
    urls: urlDatabase,
    user: null//when the user first registers, no user avail,header will look for user, with login
  };
  if (req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_registration",templateVars);
  }
});
//route to handle input from registration web page
app.post("/register", (req,res) => {
  const randomUser = generateRandomUser();
  const newUser = {
    id: randomUser,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  if (req.body.email === "" || req.body.password === "") {
    res.status(403).send("You don't have authorization. Either you didn't provide an email or password");
  }
  if (emailLookup(req.body.email, users)) {//industry standard is to checking if a value exists because real would would not know what the response is
    res.status(403).send("User already exists, please login");
  } else {
    users[randomUser] = newUser;
  }
  req.session.user_id =  newUser.id;
  res.redirect("/urls");
});

// URL CREATION PAGE
//route for /urls in expressserver.js and render using accompanying template
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(urlDatabase, req.session["user_id"]),
    user: users[req.session["user_id"]],
  };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    urlsForUser(urlDatabase, req.session["user_id"]);
    res.render("urls_index", templateVars);
  }
});

//route to handle post requests for front end submission
app.post("/urls", (req, res) => {
  const foundKey = Object.keys(urlDatabase).find((key) => urlDatabase[key].longURL === req.body.longURL);// find if long url already exists in dictionary
  if (foundKey === undefined) {
    const randomString = generateRandomString();
    urlDatabase[randomString] = {
      "longURL": req.body.longURL,
      "userID": req.session["user_id"]
    };
    res.redirect(`/urls/${randomString}`);
  } else {
    res.status(403).send("403. url already exists");
  }
});

//Route to render new url creation
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//route for /urls/:id in expressserver.js and render using accompanying template
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("404. Not Found. Url does not exist");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session["user_id"]]
  };
  if (!req.session.user_id) {
    res.status(403).send("403. You dont have authorization to this url. You either have not signed in or you don't own the URL.");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("403. you don't own the this bookmarked URL");
  } else {
    return res.render("urls_show", templateVars);
  }
});

//route to handle front end edit interaction
app.post("/urls/:id", (req,res) => {
  const foundKey = Object.keys(urlDatabase).find((key) => urlDatabase[key].longURL === req.body["edit"]);
  if (foundKey === undefined) {
    urlDatabase[req.params.id].longURL = req.body["edit"];
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.status(403).send("403. This record already exists in the database");
  }
});

//route to access short urls
app.get("/u/:id", (req, res) => {
  const urlRecord = urlDatabase[req.params.id];
  if (!urlRecord) {
    res.status(404).send('404. Not Found. Url does not exist');
  } else {
    res.redirect(urlDatabase[req.params.id].longURL);
  }
});

//POST route for /urls/:id/delete to remove URLs
app.post("/urls/:id/delete", (req,res) => {
  if (!req.session.user_id) {
    res.status(403).send("403. Please sign in");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("403. You don't own the url");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

//LOGIN LOGOUT PAGE

//route to render login page
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id
  };
  if (!req.session.user_id) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// route to handle front end interactions
app.post("/login", (req,res) => {
  const tempUserDB = emailLookup(req.body.email, users);
  if (!emailLookup(req.body.email, users)) {
    res.status(403).send('403. You not have authorization. User not found');
  }
  if (bcrypt.compareSync((req.body.password), tempUserDB.password) === false) {
    res.status(403).send('403. You do not have authorization. Wrong password');
  }
  if (bcrypt.compareSync((req.body.password), tempUserDB.password) === true) {
    req.session.user_id = tempUserDB.id;
    res.redirect(("/urls"));
  }
});

//route to handle logout button interaction
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}!`);
});