// Create function `urlsForUser(id)` which returns URLs where userID equals id
// of logged in user and update code to:
// only display urls if the user is logged in
// only show urls that belong to the user when logged in

const urlsForUser = (email, database) => {
  const match = {};

  for (let shortURL in database) {

    let databaseEmail = database[shortURL].owner;

    console.log("my email is", databaseEmail);

    if (databaseEmail === email) {
      match[shortURL] = database[shortURL].longURL;
    }
  }

  console.log(match);

  return match;
};

// Generate a Random Short URL ID
// Output: string of 6 random alphanumeric characters
const generateShortKey = () => {
  let shortURL = ``;
  let letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G"
  ];
  const numbers = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
  ];

  for (let i = 0; i < 3; i++) {
    let randLetter = Math.floor(Math.random() * letters.length);
    let randNumber = Math.floor(Math.random() * numbers.length);
    shortURL = shortURL.concat(letters[randLetter],numbers[randNumber]);
  }
  return shortURL;
};

// check if the object is empty or not
// 
function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}


module.exports =  {urlsForUser, generateShortKey, isObjEmpty};


