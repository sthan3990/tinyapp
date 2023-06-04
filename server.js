let express = require('express');
let app = express();
const generateShortKey = require('./src/helpers/random.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

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
app.use(cookieParser()

  // cookieSession({
  //   name: 'session',
  //   keys: ['key1'],? ['key2']
  //   maxAge: 10 * 60 * 1000 // 10 mins
  // })


);
app.use(express.urlencoded({ extended: false }));

// css style folder static folder
app.use(express.static(__dirname));

// helmet for security 
//app.use(helmet());

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

  res.redirect('/');

});

// index page
app.get('/', function (req, res) {

  const templateVars = {
    username: req.cookies["username"],
  };

  res.render('pages/index', templateVars);
});

app.get('/urls_new', function (req, res) {
  res.render('pages/urls_new');
});

// Page that shows what's inside urlDatabase
app.get('/urls_index', function (req, res) {

  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };

  res.render('pages/urls_index', templateVars);

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

  res.render('pages/urls_edit',templateVars);

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








// 23@g.com
// 12345

app.listen(8080);
console.log('Server is listening on port 8080');
