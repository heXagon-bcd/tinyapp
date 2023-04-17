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

//email searcher func
function emailLookup (email) {
  for (user in users) {
    if(users[user].email === email) {
      return users[user];
    }
  } 
  return null; // opposite of sending an object is to send null
};

//function to check if user cookie is present && currently in db
function userCheck(callback) {
  if(!req.cookies.user_id) {
    res.redirect("/login")
  } else {
    callback();
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    console.log(req.cookies.user_id);
    if(req.cookies.user_id) {
      res.redirect("/urls")
    } else {
    res.render("urls_registration",templateVars)
  };
});

app.post("/register", (req,res) => {
  console.log("register body",req.body);
  console.log("register email value", req.body.email);
  const randomUser = generateRandomUser();
  const newUser = {
    id: randomUser,
    email: req.body.email,
    password: req.body.password
  };

  if(req.body.email === "" || req.body.password === "") {
    res.send("400 code")
  };
  console.log("ture of false", emailLookup());
  if(emailLookup(req.body.email)) {//industry standard is to checking if a value exists because real would would not know what the response is
    res.send("400");
  } else {
    users[randomUser] = newUser;
  }
  console.log("assert", newUser.email)
  res.cookie("user_id", newUser.id);
  console.log("user db", users);
  res.redirect("/urls");
});

// URL CREATION PAGE
app.get("/urls", (req, res) => {
  console.log("/urls cookies",req.cookies);
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
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
  console.log(req.body); // Log the POST request body to the console//

});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  if(!req.cookies.user_id) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]] 
  };
  console.log("/urls/:id get", urlDatabase);
  console.log("/urls/:id get", req.params.id);
  for (url in urlDatabase) {
    if(url === req.params.id) {
      res.render("urls_show", templateVars);
    } else {
      res.send("invalid link id")
    }
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.send("404");
  } else {
    res.redirect(urlDatabase[req.params.id]);
  }
  console.log("/u/:id - logn url - 1",urlDatabase[req.params.id])
  console.log("/u/:id - logn url",longURL);
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})


//LOGIN LOGOUT PAGE

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies.user_id
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
  if(!emailLookup(req.body.email)) {
    res.send("403 status - user not found")
  }
  if(users[user].password !== req.body.password) {
    res.send("403 - wrong password")
  }
  if(users[user].password === req.body.password) {
    res.cookie("user_id", users[user].id)
    res.redirect(("/urls"));
  }
    console.log("post /login", users[user])
    console.log("post /login keys of users", Object.keys(users))
});

app.post("/logout", (req,res) => {
  res.clearCookie('user_id', {path: "/"});
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