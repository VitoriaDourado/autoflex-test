const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const productRoutes = require('./routes/productRoutes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const PORT = 3001;

app.listen(PORT, async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected:', result.rows[0]);
  } catch (error) {
    console.error('Database connection error:', error);
  }

  console.log(`Server running on port ${PORT}`);

});