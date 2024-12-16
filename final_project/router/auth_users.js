const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
// Return true if any valid user is found, otherwise false
if (validusers.length > 0) {
    return true;
} else {
    return false;
}

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  
  const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params; // Extract ISBN from the route
  const { review } = req.query; // Get review from the request query
  const username = req.session?.username; // Get the username from the session

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: Please log in to post a review." });
  }

  if (!review) {
    return res.status(400).json({ message: "Bad Request: Review text is required." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Initialize reviews for the book if not present
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or modify the review for the user
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully.",
    reviews: books[isbn].reviews
  });


});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Extract ISBN from the route
    const username = req.session?.username; // Get the username from the session
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized: Please log in to delete your review." });
    }
  
    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    // Check if the book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for the logged-in user." });
    }
  
    // Delete the user's review
    delete books[isbn].reviews[username];
  
    return res.status(200).json({
      message: "Review deleted successfully.",
      reviews: books[isbn].reviews,
    });
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
