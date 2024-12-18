const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session');

let users = [
  {
  username: "test",
  password: "test123"
  },
];

// Check if the username is valid
const isValid = (username) => {
  // Ensure username is non-empty and doesn't already exist in `users`
  return username && !users.some(user => user.username === username);
};

// Check if username and password match the records
const authenticatedUser = (username, password) => {
  // Filter to find a user with the matching username and password
  const validUsers = users.filter((user) => user.username === username && user.password === password);
  console.log(validUsers)
  // Return true if any matching user is found, otherwise false
  return validUsers.length > 0;
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in: Username and password are required." });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' }); // Token valid for 1 hour

    // Store access token and username in session
    req.session.authorization= { accessToken, username } ;

    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const  isbn  = req.params.isbn; // Extract ISBN from the route
  const  review  = req.body.review; // Use `body` for reviews instead of `query`
  const username = req.session?.authorization?.username; // Get the username from the session
  console.log(review, username)
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
  const username = req.session?.authorization?.username; // Get the username from the session

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
