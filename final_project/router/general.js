const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    else{
        return res.status(404).json({message: "Please enter username and/or password"});
    }

});

function getBooksAsync() {
    return new Promise((resolve, reject) => {
      // Simulate asynchronous operation (e.g., database query)
      setTimeout(() => {
        if (books) {
          resolve(books); // Resolve with the book list
        } else {
          reject("No books available"); // Reject with an error message
        }
      }, 1000); // Simulate 1-second delay
    });
  }
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  getBooksAsync()
    .then((books) => {
      // On success, send the book list as a JSON response
      res.send(JSON.stringify(books, null, 4));
    })
    .catch((error) => {
      // On error, send the error message
      res.status(500).send(error);
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  let myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isbn) {
        const bks = books[isbn]; // Assuming `books` is an object with ISBN as keys
        if (bks) {
          resolve(bks); // Resolve with the book data
        } else {
          reject("Sorry, no book found"); // Reject if the book is not found
        }
      } else {
        reject("Please, enter the ISBN"); // Reject if no ISBN is provided
      }
    }, 6000); // Simulate a 6-second delay
  });

  // Handle the resolved or rejected promise
  myPromise
    .then((book) => {
      // Send the book data as JSON when the promise resolves
      res.send(JSON.stringify(book, null, 4));
    })
    .catch((errorMessage) => {
      // Send the error message when the promise is rejected
      res.status(400).send(errorMessage);
    });
    
    
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  const author = req.params.author;

  try {
    const filteredBooks = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksByAuthor = Object.values(books).filter(book => book.author === author);

        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor); // Resolve if books are found
        } else {
          reject("No books found for the specified author."); // Reject if no books are found
        }
      }, 2000);
    });

    // Send the filtered books
    res.status(200).json(filteredBooks);
  } catch (error) {
    // Send the error message
    res.status(404).json({ message: error });
  }
    
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;

  const filteredBooks = Object.values(books).filter(book => book.title === title);

  // If no books are found, return an error response
  if (filteredBooks.length === 0) {
    return res.status(404).json({ message: "No books found for the specified title." });
  }

  // Return the matching books
  return res.status(200).json(filteredBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if(isbn){
        const bks = books[isbn]
        if(bks){
            res.send(JSON.stringify(bks["reviews"],null,4));
        }
        else{
            res.send("Sorry, no book found");
        }
    }
    else{
        res.send("Please, enter the isbn");
    }
});

module.exports.general = public_users;
