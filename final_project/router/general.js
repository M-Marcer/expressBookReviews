const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
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
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user - missing username or psw."});
  
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost/books');
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`http://localhost:5000/books/${isbn}`);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch book by ISBN", error: error.message });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const response = await axios.get('http://localhost:5000/books');
        const results = Object.values(response.data).filter(book => book.author === author);
        res.send(JSON.stringify(results, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books by author", error: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const response = await axios.get('http://localhost:5000/books');
        const results = Object.values(response.data).filter(book => book.title === title);
        res.send(JSON.stringify(results, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books by title", error: error.message });
    }
});

// Get book reviews
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`http://localhost:5000/books/${isbn}`);
        const book = response.data;

        if (book && book.reviews && Object.keys(book.reviews).length > 0) {
            res.send(book.reviews);
        } else {
            res.send(`No reviews available for the book ${isbn}`);
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch book reviews", error: error.message });
    }
});
module.exports.general = public_users;
