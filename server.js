let express = require('express');
let app = express();
const cookieSession = require('cookie-session');
const helmet = require('helmet');
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { urlsForUser, generateShortKey } = require('./server/helpers/ServerHelper');

const urlDatabase = {
  'b2xVn2': {
    'longURL': 'https://www.google.com',
    'owner': '222@gg.com',
  },
  'b222x2': {
    'longURL': 'https://www.google.com',
    'owner': '222@gg.com',
  },
  'b21V22': {
    'longURL': 'https://www.google.com',
    'owner': '222@gg.com',
  },
  'bc212n': {
    'longURL': 'https://www.google.com',
    'owner': '222@gg.com',
  },
  'bc2122n': {
    'longURL': 'https://www.google.com',
    'owner': '2@gg.com',
  }
};

const userDatabase = {
  'email': {
    'name': '',
    'password': '',
  }
};

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

// css style folder static folder
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));

// helmet for security
app.use(helmet());

// Cookie Options
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/* GET ROUTES */

// register page
app.get('/register', function (req, res) {

  if (req.session.userID) {

    const templateVars = {
      urls: urlDatabase,
      username: req.session.userID
    };

    res.render('pages/urls_index', templateVars);

  } else {

    const templateVars = {
      msg: ``,
    };

    res.render('pages/register', templateVars);
  }
});

app.get('/index', function (req, res) {

  const templateVars = {
    msg: ``,
  };

  res.render('pages/index', templateVars);
});

// login page
app.get('/login', function (req, res) {

  console.log(userDatabase);

  const templateVars = {
    msg: ``,
  };

  res.render('pages/login', templateVars);
});

// index page
app.get('/', function (req, res) {

  // if user is not logged in
  if (!req.session.userID) {

    res.status(400).redirect('/index');

  } else {

    let userURLS = urlsForUser(req.session.userEmail, urlDatabase);

    const templateVars = {
      urls: userURLS,
      username: req.session.userID,
      email: req.session.userEmail

    };

    res.render('pages/urls_index', templateVars);
  }
});

app.get('/urls_new', function (req, res) {
  res.render('pages/urls_new');
});

app.get('/urls_view', function (req, res) {
  res.render('pages/urls_view');
});

// Page that shows after user is logged and shows what is inside urlDatabase
app.get('/urls_index', function (req, res) {
  let userURLS = urlsForUser(req.session.userEmail, {userDatabase});

  if (req.session.userID) {
    const templateVars = {
      urls: userURLS,
      username: req.session.userID,
      email: req.session.userEmail
    };

    res.render('pages/urls_index', templateVars);

  } else {
    const templateVars = {
      msg: `Access denied. You must be logged in to view the URLs page.`,
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
app.get('/urls/:shortURL/edit', (req, res) => {

  // check if the logged in user owns the URL
  let result = urlsForUser(req.session.userID, urlDatabase);

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: req.session.userID
  };

  res.render('pages/urls_edit', templateVars);

});

// view page
app.get('/urls/:shortURL/', (req, res) => {

  // check if the logged in user owns the URL
  let result = urlsForUser(req.session.userEmail, {urlDatabase});

  console.log(result);

  if (result === 1) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      username: req.session.userEmail
    };

    res.render('pages/urls_view', templateVars);
  }

  const templateVars = {
    msg: `Not authorized to view this URL`,
    username: req.session.userEmail
  };

  res.render('pages/urls_index', templateVars);

});

app.get('/urls_logout', (req, res) => {

  req.session = null;

  const templateVars = {
    msg: `Logged Out`,
  };

  res.render('pages/index', templateVars);
});


/* END OF GET ROUTES */


/* START OF POST ROUTES */

// Registration POST
app.post('/register', (req, res) => {

  const enteredEmail = req.body.email;

  // Check if the user is already registered
  for (let user in userDatabase) {

    let databaseEmail = userDatabase[user].email;

    // email already exists
    if (databaseEmail === enteredEmail) {

      const templateVars = {
        msg: `Email: ${databaseEmail} already exisits!`
      };

      res.status(400).res.render('pages/register', templateVars);

    }
  }

  const id = Math.floor(Math.random() * 4);
  const name = req.body.name + "#" + id;
  const salt = bcrypt.genSaltSync(5);

  // use salt to hash password
  const password = bcrypt.hashSync(req.body.password, salt);

  userDatabase[enteredEmail] = {
    name,
    password,
  };

  res.redirect('/login');

});

// handlelogin POST request
app.post('/login', (req, res) => {

  const enteredEmail = req.body.email;

  // find this email in the userDatabase
  if (userDatabase[enteredEmail] === "") {
    const templateVars = {
      msg: `The email address ${enteredEmail} was not found!`,
    };

    res.status(400).render('pages/login', templateVars);

    // check if the password is correct

  } else if (bcrypt.compareSync(req.body.password, userDatabase[enteredEmail].password) === false) {

    const templateVars = {
      msg: `The password you entered is incorrect.`,
    };

    res.status(400).render('pages/login', templateVars);

  } else {
    const username = userDatabase[enteredEmail].name;

    // create needed cookies
    req.session.userID = username;
    req.session.userEmail = enteredEmail;

    const templateVars = {
      urls: urlDatabase,
      username: req.session.userID,
      email: req.session.userEmail
    };

    res.render('pages/urls_index', templateVars);

  }

});

// handle urls/new POST request
app.post('/urls_new', (req, res) => {

  const shortURL = generateShortKey(); // Generate shortURL id
  const owner = req.session.userEmail;
  const longURL = req.body.enteredURL;

  urlDatabase[shortURL] = {
    longURL,
    owner
  };

  res.redirect("/urls_index");
});

app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL = req.params.shortURL;

  // if the user is not logged in
  if (!req.session.userID) {
    const templateVars = {
      msg: `You must be logged in to delete a URL!`
    };

    res.status(400).res.render('pages/index', templateVars);

    return;
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls_index');

});

app.post("/urls/:shortURL/edit", (req, res) => {

  // if the user is not logged in
  if (!req.session.userID) {
    const templateVars = {
      msg: `You must be logged in to edit a URL!`
    };

    res.status(400).res.render('pages/index', templateVars);

    return;
  }

  urlDatabase[req.params.shortURL].longURL = req.body.enteredURL;

  res.redirect("/urls_index");
});


/* END OF POST ROUTES */

app.listen(8080);
console.log('Server is listening on port 8080');
