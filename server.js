let express = require('express');
let app = express();
const generateShortKey = require('./src/helpers/random.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

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
  res.render('pages/register');
});

// login page
app.get('/login', function (req, res) {
  res.render('pages/login');
});

// handlelogin POST request
app.post('/login', (req, res) => {

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
    res.redirect('login');
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

    res.render('pages/urls_index', templateVars);

  } else {
    
    const templateVars = {
      msg: "Access to URLs denied. You must be logged in.",
    };

    res.status("401");
    res.render('pages/index', templateVars);

  }

});

// about page
app.get('/about', function (req, res) {
  res.render('pages/about');
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

  console.log(urlDatabase);
  res.send('Short URL Created!');
});


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/");
});

app.post("/urls/:id/edit", (req, res) => {

  urlDatabase[req.params.id].longURL = req.body.enteredURL;

  res.redirect("/");

});


app.get("/urls_logout", (req, res) => {
  res.clearCookie();

  const templateVars = {
    msg: "Logged Out",
  };


  res.render('pages/index', templateVars);

});






// 23@g.com
// 12345

app.listen(8080);
console.log('Server is listening on port 8080');
