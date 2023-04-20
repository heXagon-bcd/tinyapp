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

const users = {
};


app.get("/", (req,res) => {
  res.send("Hello!");
});

//REGISTER PAGE
app.get("/register", (req,res) => {
  const templateVars = {
    urls: urlDatabase,
    user: null//when the user first registers, no user avail,header will look for user, with login
  };
    console.log(req.session.user_id);
  if(req.session.user_id) {
    res.redirect("/login")
  } else {
    res.render("urls_registration",templateVars)
  };
});

app.post("/register", (req,res) => {
  
  const randomUser = generateRandomUser();
  const newUser = {
    id: randomUser,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };

  if(req.body.email === "" || req.body.password === "") {
    res.send("400 code")
  };
  if(emailLookup(req.body.email, users)) {//industry standard is to checking if a value exists because real would would not know what the response is
    res.send("400");
  } else {
    users[randomUser] = newUser;
  }
  console.log("assert", newUser.email)
  req.session.user_id =  newUser.id;
  console.log("user db", users);
  res.redirect("/urls");
});

// URL CREATION PAGE
app.get("/urls", (req, res) => {
  console.log("/urls cookies",req.session);
  const templateVars = {
    urls: urlsForUser(urlDatabase, req.session["user_id"]),
    user: users[req.session["user_id"]],
  };
  if(!req.session.user_id) {
    res.send("Go back and login")
  } else {
  urlsForUser(urlDatabase, req.session["user_id"])
  res.render("urls_index", templateVars);
  }

});

app.post("/urls", (req, res) => {
  const foundKey = Object.keys(urlDatabase).find((key) => urlDatabase[key].longURL === req.body.longURL);// find if long url already exists in dictionary
  console.log("aaa",foundKey);
  if (foundKey === undefined) {
    const randomString = generateRandomString();
    urlDatabase[randomString] = {
      "longURL": req.body.longURL,
      "userID": req.session["user_id"]
    }
     res.redirect(`/urls/${randomString}`);
  } else {
    res.send("its already there");
  };
  console.log("post /urls -",req.body); // Log the POST request body to the console//
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };
  if(!req.session.user_id) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session["user_id"]] 
  };
  console.log("/urls/:id get", urlDatabase);
  console.log("/urls/:id get", req.params.id);
  
  if (!req.session.user_id) {
    res.send("sign in")
  } else if(urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.send("you don't own the url")
  } else {
      return res.render("urls_show", templateVars);    
    }
});

app.post("/urls/:id", (req,res) => {
const foundKey = Object.keys(urlDatabase).find((key) => urlDatabase[key].longURL === req.body["edit"])
if(foundKey === undefined) {
urlDatabase[req.params.id].longURL = req.body["edit"];
res.redirect(`/urls/${req.params.id}`)
} else {
  res.send("its already there");
};
})

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.send("404");
  } else {
    res.redirect(urlDatabase[req.params.id].longURL);
  }
  console.log("/u/:id - logn url - 1",urlDatabase[req.params.id])
  console.log("/u/:id - logn url",longURL);
});

app.post("/urls/:id/delete", (req,res) => {
  if (!req.session.user_id) {
    res.send("sign in")
  } else if(urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.send("you don't own the url")
  } else {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
  };
})


//LOGIN LOGOUT PAGE

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id
  };
  console.log(templateVars.user)
  res.render("urls_login", templateVars)
  // if(!user) {
  //   res.render("urls_login", templateVars);
  // } else {
  //   res.redirect("/urls")
  // }
  
})

app.post("/login", (req,res) => {
  console.log("login - body",req.body);
  if(!emailLookup(req.body.email, users)) {
    res.send("403 status - user not found")
  }
  if(bcrypt.compareSync((req.body.password), users[user].password) === false) {
    res.send("403 - wrong password")
  }
  if(bcrypt.compareSync((req.body.password), users[user].password) === true) {
    res.cookie("user_id", users[user].id)
    res.redirect(("/urls"));
  }
    console.log("post /login", users[user])
    console.log("post /login keys of users", Object.keys(users))
});

app.post("/logout", (req,res) => {
  res.clearCookie('session', {path: "/"});
  res.redirect("/login");
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