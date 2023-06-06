let express = require('express');
let app = express();
const generateShortKey = require('./src/helpers/random.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const bcrypt = require("bcrypt");

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
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// css style folder static folder
app.use(express.static(__dirname));

// helmet for security
app.use(helmet());

// register page
app.get('/register', function (req, res) {

  if (req.cookies["username"]) {
    const templateVars = {
      urls: urlDatabase,
      username: req.cookies["username"]
    };

    res.render('pages/urls_index', templateVars);
  } else {
    res.render('pages/register');
  }

});

app.get('/index', function (req, res) {

  const templateVars = {
    msg: "",
  };
  res.render('pages/index', templateVars);
});

// login page
app.get('/login', function (req, res) {

  const templateVars = {
    msg: "",
  };

  res.render('pages/login', templateVars);
});

// handlelogin POST request
app.post('/login', (req, res) => {
  let statusMsg = "";

  console.log("login page");

  for (let id in userDatabase) {

    let databaseEmail = userDatabase[id].email;
    let databasePassword = userDatabase[id].password;

    // email not found
    if (!databaseEmail === req.body.email) {

      statusMsg = "Email address not found.";

      const templateVars = {
        msg: statusMsg,
      };

      res.render('pages/login', templateVars);
    }

    // compare hash to check password is correct
    if (!bcrypt.compareSync(req.body.password, databasePassword)) {

      statusMsg = "Invalid password.";

      const templateVars = {
        msg: statusMsg,
      };

      res.render('pages/login', templateVars);
    }

  }

  res.cookie('username', req.body.email);

  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };

  res.render('pages/urls_index', templateVars);

});

// index page
app.get('/', function (req, res) {

  // if user is not logged in
  if (!req.cookies["username"]) {

    res.redirect('/index');

  } else {
    const templateVars = {
      urls: urlDatabase,
      username: req.cookies["username"],
    };

    res.render('pages/urls_index', templateVars);
  }
});

app.get('/urls_new', function (req, res) {
  res.render('pages/urls_new');
});

// Page that shows what's inside urlDatabase
app.get('/urls_index', function (req, res) {

  if (req.cookies["username"]) {
    const templateVars = {
      urls: urlDatabase,
      username: req.cookies["username"]
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
  res.render('pages/urls_new');
});

// edit page
app.get('/urls/:id/edit', (req, res) => {

  const templateVars = {
    urls: urlDatabase[req.params.id],
    username: req.cookies["username"]
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

  const id = Math.floor(Math.random() * 4); // Generate id
  const name = req.body.fullname;
  const email = req.body.email;
  const salt = bcrypt.genSaltSync(5);
  console.log(name + email);
  // use salt to hash password
  const password = bcrypt.hashSync(req.body.password, salt);

  userDatabase[id] = {
    id,
    name,
    email,
    password,
  };

  res.cookie('username', req.body.email);

  console.log(req.cookies["username"]);

  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };

  res.render('pages/urls_index', templateVars);

});

app.get('/urls_logout', (req, res) => {
  res.clearCookie("username");

  const templateVars = {
    msg: "Logged Out",
  };

  res.render('pages/index', templateVars);

});

app.listen(8080);
console.log('Server is listening on port 8080');
