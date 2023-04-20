//email searcher func
function emailLookup (email, users) {
  for (user in users) {
    if(users[user].email === email) {
      return users[user];
    }
  } 
  return null; // opposite of sending an object is to send null
};

//generate url id
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}
//generate user id
function generateRandomUser() {
  return Math.random().toString(36).substr(2, 10)
}

//fucntion to return the URLs where the userID is equal to the id of the currently logged-in user.
function urlsForUser(database, userIDD) {
  newDB = {};
  for (key in database) {
    if(database.hasOwnProperty(key) && database[key].userID === userIDD) {
      newDB[key] = {
        longURL : database[key].longURL,
        userID : database[key].userID
      }
    }
  }
  return newDB;
}


module.exports = {emailLookup, generateRandomString, generateRandomUser, urlsForUser};