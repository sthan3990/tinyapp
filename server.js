let express = require('express');
let app = express();
const generateShortKey = require('./src/random.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))

// css style folder static folder
app.use(express.static(__dirname));

// use res.render to load up an ejs view file

// index page
app.get('/', function (req, res) {
  res.render('pages/index');
});


// about page
app.get('/about', function (req, res) {
  res.render('pages/about');
});

// tinyurl page
app.get('/urls/new', (req, res) => {
  res.render('pages/urls_new');
});

// handle urls/new POST request
app.post('/urls', (req, res) => {

  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  
  let shortID = generateShortKey(); // Generate shortURL id
  urlDatabase[shortID] = req.body.longURL; // Put this in the urlDatabase 
  console.log(urlDatabase);
  console.log(req.body); // Log the POST request body to the console
  res.send('Ok');
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  // if the key value pair exists
  if (urlDatabase[id]) {
    const templateVars = {
      url: urlDatabase[id],
      id: id,
    };

    res.render("pages/urls_view", templateVars);
  }   else {
    res.status(404).redirect("");
  }
});

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
 
  if (req.body.email === null) {
   document.getElementById("emailError").innerHTML = "Enter Email";
  }

  res.redirect('/urls');

});






// 23@g.com
// 12345

app.listen(8080);
console.log('Server is listening on port 8080');
