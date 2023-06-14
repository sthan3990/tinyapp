let express = require('express');
let app = express();
const generateShortKey = require('./src/helpers/random.js');
const cookieSession = require('cookie-session');
const helmet = require('helmet');
const bcrypt = require("bcrypt");

const statusMsg = "";

const urlDatabase = {
  "1": {
    "id": 1,
    "shortURL": "b2xVn2",
    "longURL": "https://www.google.com"
  },
  "2": {
    "id": 2,
    "shortURL": "c2xVz2",
    "longURL": "https://www.lighthouse.com"
  },
};

const userDatabase = {
  "1": {
    "id": 1,
    "name": "steve",
    "email": "abc@gmail.com",
    "password": "",
  },
};

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(express.urlencoded({ extended: false }));

// css style folder static folder
app.use(express.static(__dirname));

// helmet for security
app.use(helmet());

// register page
app.get('/register', function (req, res) {

  if (req.session.userID) {

    const templateVars = {
      urls: urlDatabase,
      msg: statusMsg,
      username: req.session.userID
    };

    res.render('pages/urls_index', templateVars);

  } else {
    const templateVars = {
      msg: statusMsg
    };

    res.render('pages/register', templateVars);
  }
});

app.get('/index', function (req, res) {

  const templateVars = {
    msg: statusMsg,
  };
  res.render('pages/index', templateVars);
});

// login page
app.get('/login', function (req, res) {

  const templateVars = {
    msg: statusMsg,
  };

  res.render('pages/login', templateVars);
});

// handlelogin POST request
app.post('/login', (req, res) => {

  let statusMsg = "";

  let enteredEmail = req.body.email;

  for (let user in userDatabase) {

    if (userDatabase[user].email !== enteredEmail) {
      statusMsg = "Email not found.";

      const templateVars = {
        msg: statusMsg,
      };

      res.status(400).render('pages/login', templateVars);

    } else if (bcrypt.compareSync(req.body.password, userDatabase[user].password) === false) {


      statusMsg = "Passwords is incorrect.";

      const templateVars = {
        msg: statusMsg,
      };

      res.status(400).render('pages/login', templateVars);

    } else {

      const templateVars = {
        urls: urlDatabase,
        username: req.session.userID
      };

      res.render('pages/urls_index', templateVars);

    }
  }
});

// index page
app.get('/', function (req, res) {

  // if user is not logged in
  if (!req.session.userID) {

    res.status(400).redirect('/index');

  } else {
    const templateVars = {
      urls: urlDatabase,
      username: req.session.userID,
    };

    res.render('pages/urls_index', templateVars);
  }
});

app.get('/urls_new', function (req, res) {
  res.render('pages/urls_new');
});

// Page that shows what's inside urlDatabase
app.get('/urls_index', function (req, res) {

  if (req.session.userID) {

    const templateVars = {
      urls: urlDatabase,
      username: req.session.userID
    };

    res.status(400).render('pages/urls_index', templateVars);

  } else {
    const templateVars = {
      msg: "Access to URLs denied. You must be logged in.",
    };
    res.status(400).render('pages/index', templateVars);
  }
});

// tinyurl page
app.get('/urls/new', (req, res) => {

  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.render('pages/urls_new');
  }

});

// edit page
app.get('/urls/:id/edit', (req, res) => {

  const templateVars = {
    urls: urlDatabase[req.params.id],
    username: req.session.userID
  };

  res.render('pages/urls_edit', templateVars);

});

// handle urls/new POST request
app.post('/urls_new', (req, res) => {

  const id = Math.floor(Math.random() * 100); // Generate id
  const shortURL = generateShortKey(); // Generate shortURL id
  const longURL = req.body.enteredURL;

  urlDatabase[id] = {
    id,
    shortURL,
    longURL,
  };


  res.redirect("/urls_index");
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/");
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.enteredURL;
  res.redirect("/");
});

// Handle registration
app.post('/register', (req, res) => {

  const email = req.body.email;

  for (let user in userDatabase) {

    let databaseEmail = userDatabase[user].email;

    // email already exists
    if (databaseEmail === email) {

      const templateVars = {
        msg: `Email: ${databaseEmail} already exisits!`
      };

      res.status(400).res.render('pages/register', templateVars);

    }
  }

  const id = Math.floor(Math.random() * 4); // Generate id
  const name = req.body.fullname;
  const salt = bcrypt.genSaltSync(5);

  // use salt to hash password
  const password = bcrypt.hashSync(req.body.password, salt);

  userDatabase[id] = {
    id,
    name,
    email,
    password,
  };

  req.session.userID = userDatabase[id].email;

  res.redirect('/login');

});

app.get('/urls_logout', (req, res) => {
  req.session = null;

  const templateVars = {
    msg: "Logged Out",
  };

  res.render('pages/index', templateVars);

});

app.listen(8080);
console.log('Server is listening on port 8080');
