const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const COMMENTS_FILE = path.join(__dirname, 'comments.json');

// Use middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize data
let data = {};
let comments = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const fileData = fs.readFileSync(DATA_FILE, 'utf8');
    if (fileData) {
      data = JSON.parse(fileData);
    }
  }
  if (fs.existsSync(COMMENTS_FILE)) {
    const fileData = fs.readFileSync(COMMENTS_FILE, 'utf8');
    if (fileData) {
      comments = JSON.parse(fileData);
    }
  }
} catch (error) {
  console.error('Error reading or parsing data files:', error);
}

// Register endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (data[username]) {
    return res.status(400).json({ message: 'User already exists' });
  }
  data[username] = { password };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = data[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.status(200).json({ message: 'Login successful' });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the real site page
app.get('/real-site', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'real-site.html'));
});

// Comment posting endpoint
app.post('/comment', (req, res) => {
  const { username, text } = req.body;
  if (!data[username]) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const newComment = { username, text };
  comments.push(newComment);
  try {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
    res.status(201).json({ message: 'Comment posted successfully' });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ message: 'Error saving comment' });
  }
});

// Get comments endpoint
app.get('/comments', (req, res) => {
  res.status(200).json({ comments });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
