const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL RDS
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/health', async (req, res) => {
  res.send("I am OK.");
});

app.get('/students', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students');
  res.json(rows);
});

app.post('/students', async (req, res) => {
  const { id, name, email } = req.body;
  try {
    await pool.query('INSERT INTO students (id, name, email) VALUES (?, ?, ?)', [id, name, email]);
    res.status(201).send('Student added');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/students/:id', async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;
  try {
    await pool.query('UPDATE students SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    res.send('Student updated');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/students/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    res.send('Student deleted');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const port = process.env.PORT || 5005;
app.listen(port, () => console.log(`Listening on ${port}`));
