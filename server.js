let express = require('express');
let app = express();
const cookieSession = require('cookie-session');
const helmet = require('helmet');
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const { urlsForUser, generateShortKey, isObjEmpty } = require('./server/helpers/ServerHelper');

const urlDatabase = {
  'b2xVn2': {
    'longURL': 'https://www.google.com',
    'owner': '222@gg.com'
  }
};

const userDatabase = {
  'email': {
    'name': '',
    'password': '',
  },
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

    res.redirect('/urls');

  } else {

    res.render('pages/register');
  }
});

app.get('/index', function (req, res) {

  res.render('pages/index');

});

// login page
app.get('/login', function (req, res) {

  res.render('pages/login');
});

// index page
/*
    if user is not logged in:
        (Minor) redirect to /login
    if user is logged in:
        (Minor) redirect to /urls
*/

app.get('/', function (req, res) {
  // if user is not logged in
  if (!req.session.userID) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get('/urls_new', function (req, res) {
  res.render('pages/urls_new');
});

app.get('/urls_view', function (req, res) {
  res.render('pages/urls_view');
});

app.get('/urls', function (req, res) {

  let userURLS = urlsForUser(req.session.userEmail, urlDatabase);
  let isEmpty = isObjEmpty(userURLS);

  if (isEmpty) {
    res.redirect('urls/new');
  } else if (req.session.userID && isEmpty !== true) {

    const templateVars = {
      urls: userURLS,
      username: userDatabase[req.session.user_id],
      email: req.session.userEmail
    };

    res.render('pages/urls_index', templateVars);

  } else {
    console.log('Incorrect username or password');
    res
      .status(401)
      .redirect('/index');
  }
});

// tinyurl page
app.get('/urls/new', (req, res) => {

  // If the user is not logged in, redirect GET /urls/new to GET /login
  if (!req.session.userID) {
    res.redirect("/login");
  }
  res.render('pages/urls_new');

});

// edit page
app.get('/urls/:shortURL/edit', (req, res) => {

  let userURLS = urlsForUser(req.session.userEmail, urlDatabase);
  let isEmpty = isObjEmpty(userURLS);

  if (!req.session.userID) {
    res.status(400);
    res.redirect('/index');
  } else if (isEmpty === true) {
    res.status(404);
    res.redirect('/urls');
  }  else {
    const templateVars = {
      longURL: urlDatabase[req.params.shortURL].longURL,
      shortURL: req.params.shortURL,
      username: req.session.userID,
      email: req.session.userEmail
    };
    res.render('pages/urls_edit', templateVars);
  }
});


// view page
app.get('/urls/:shortURL/', (req, res) => {

  let userURLS = urlsForUser(req.session.userEmail, urlDatabase);
  let isEmpty = isObjEmpty(userURLS);
  
  if (!req.session.userID) {
    res.status(400);
    res.redirect('/index');
  } else if (isEmpty === true) {
    res.status(404);
    res.redirect('/urls');
  }  else {
    const templateVars = {
      longURL: urlDatabase[req.params.shortURL].longURL,
      shortURL: req.params.shortURL,
      username: req.session.userID,
      email: req.session.userEmail
    };
    res.render('pages/urls_edit', templateVars);
  }

});

app.get('/urls_logout', (req, res) => {

  req.session = null;

  res.redirect('/');
});


/* END OF GET ROUTES */


/* START OF POST ROUTES */

// Registration POST
app.post('/register', (req, res) => {

  const enteredEmail = req.body.email;
  const hasKey = enteredEmail in userDatabase;

  // Check if the user is already registered
  if (!hasKey) {

    const id = Math.floor(Math.random() * 4);
    const name = req.body.name + "#" + id;
    const salt = bcrypt.genSaltSync(3);

    // use salt to hash password
    const password = bcrypt.hashSync(req.body.password, salt);

    userDatabase[enteredEmail] = {
      name,
      password,
    };

    res.redirect('/login');
  }

  res.status(403).redirect('/');

});

// handlelogin POST request
app.post('/login', (req, res) => {

  const enteredEmail = req.body.email;
  const hasKey = enteredEmail in userDatabase;

  if (hasKey) {
    const enteredPassword = req.body.password;
    const databasePassword = userDatabase[enteredEmail].password;

    if (bcrypt.compareSync(enteredPassword, databasePassword) === true) {
      req.session.userID = userDatabase[enteredEmail].name;
      req.session.userEmail = enteredEmail;
      res.redirect('/urls');
    }

  }
  
  res.status(400).redirect('/');

});

// handle urls/new POST request
app.post('/urls_new', (req, res) => {

  const shortURL = generateShortKey(); // Generate shortURL id
  const owner = req.session.userEmail;
  const longURL = req.body.enteredURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    owner: owner
  };

  console.log(urlDatabase[shortURL]);

  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  res.redirect('/urls');

});

app.post("/urls/:shortURL/edit", (req, res) => {

  urlDatabase[req.params.shortURL].longURL = req.body.enteredURL;

  res.redirect("/urls");

});


/* END OF POST ROUTES */

app.listen(8080);
console.log('Server is listening on port 8080');
