const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const productRawMaterialRoutes = require('./routes/productRawMaterialRoutes');
const productionRoutes = require('./routes/productionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);
app.use('/products', productRawMaterialRoutes);
app.use('/raw-materials', rawMaterialRoutes);
app.use('/production', productionRoutes);

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