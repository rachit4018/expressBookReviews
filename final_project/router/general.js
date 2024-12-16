const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    if(isbn){
        const bks = books[isbn]
        if(bks){
            res.send(JSON.stringify(bks,null,4));
        }
        else{
            res.send("Sorry, no book found");
        }
    }
    else{
        res.send("Please, enter the isbn");
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;

  const filteredBooks = Object.values(books).filter(book => book.author === author);

  // If no books are found, return an error response
  if (filteredBooks.length === 0) {
    return res.status(404).json({ message: "No books found for the specified author." });
  }

  // Return the matching books
  return res.status(200).json(filteredBooks);
    
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
