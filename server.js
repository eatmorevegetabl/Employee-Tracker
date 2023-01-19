const express = require('express');
const mysql = require('mysql2');

const db = require('./config/connection');
const startingMenu = require('./config/staff');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Not found
app.use((req, res) => {
  res.status(404).end();
});

//start server
db.connect((err) => {
  if (err) throw err;
  console.log('Database connected.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startingMenu();
  });
});
