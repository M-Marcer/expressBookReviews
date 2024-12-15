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

// Get all books
public_users.get('/', async (req, res) => {
    try {
        const booksPromise = new Promise((resolve, reject) => {
            // Simulating an asynchronous task (e.g., fetching books)
            if (books) {
                resolve(books); // Resolve the promise with the books data
            } else {
                reject(new Error("Books data not found")); // Reject if something goes wrong
            }
        });

        const bookList = await booksPromise; // Wait for the promise to resolve
        res.send(bookList); // Send the resolved data
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch books", error: error.message });
    }
});

// Get book by isbn
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    // Creating a promise to handle the operation
    const fetchBookByISBN = new Promise((resolve, reject) => {
        const book = books[isbn]; // Assuming 'books' is an object with ISBN as keys
        if (book) {
            resolve(book); // Resolve the promise with the book details
        } else {
            reject(new Error("Book not found")); // Reject if the book does not exist
        }
    });

    // Using .then() and .catch() to handle the promise
    fetchBookByISBN
        .then(bookDetails => {
            res.send(bookDetails); // Send the book details when the promise resolves
        })
        .catch(error => {
            res.status(404).json({ message: "Failed to fetch book by ISBN", error: error.message });
        });
});


// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    const fetchBookAuthor = new Promise(( resolve, reject) => {
        const book = Object.values(books).filter(book =>  book.author === author);
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Book not found"));
        };
    });

    fetchBookAuthor 
    .then(bookDetails => {
        res.send(bookDetails); // Send the book details when the promise resolves
    })
    .catch(error => {
        res.status(404).json({ message: "Failed to fetch book by author", error: error.message });
    });
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    const fetchBookTitle = new Promise(( resolve, reject) => {
        const book = Object.values(books).filter(book =>  book.title === title);
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Book not found"));
        };
    });

    fetchBookTitle
    .then(bookDetails => {
        res.send(bookDetails); // Send the book details when the promise resolves
    })
    .catch(error => {
        res.status(404).json({ message: "Failed to fetch book by title", error: error.message });
    });
});

// Get book reviews
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;

    const fetchReview = new Promise((resolve,reject)=>{
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Book not found"));
        };
    });

    fetchReview
    .then(bookDetails => {
        res.send(bookDetails.reviews);
    })
    .catch(error => {
        res.status(404).json({ message: "Failed to fetch book review", error: error.message });
    });
});

module.exports.general = public_users;
