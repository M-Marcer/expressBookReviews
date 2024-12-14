const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
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
      //res.send("Current acces Token: " + accessToken);
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Check if the user is logged in by verifying session
  if (!req.session.authorization) {
      return res.status(401).json({ message: "You need to log in first" });
  }

  const username = req.session.authorization.username; // Get the username from session
  const isbn = req.params.isbn; // Get the ISBN from the URL parameter
  const review = req.query.review; // Get the review from the query

  // Check if review is provided in the request
  if (!review) {
      return res.status(400).json({ message: "Review text is required" });
  }

  // Find the book by ISBN (assuming 'books' is an object or array where books are stored)
  const book = books[isbn]; // Assuming books is an object with ISBN as the key

  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book already has reviews
  if (!book.reviews) {
      // Initialize reviews if not already present
      book.reviews = {};
  }

  // If the user has already reviewed the book, update the review
  if (book.reviews[username]) {
      book.reviews[username] = review; // Update existing review
      return res.status(200).json({ message: "Review updated successfully" });
  } else {
      // If this is a new review, add it
      book.reviews[username] = review;
      return res.status(201).json({ message: "Review added successfully" });
  }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Check if the user is logged in by verifying session
    if (!req.session.authorization) {
        return res.status(401).json({ message: "You need to log in first" });
    }

    const username = req.session.authorization.username; // Get the username from session
    const isbn = req.params.isbn; // Get the ISBN from the URL parameter

    // Find the book by ISBN (assuming 'books' is an object or array where books are stored)
    const book = books[isbn]; // Assuming books is an object with ISBN as the key

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book has reviews
    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the user's review
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
