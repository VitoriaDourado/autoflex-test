# autoflex-test

# Production Control System

Web system for managing products, raw materials, and production planning based on available stock.

The project follows an API architecture with separated backend and frontend.

---

## Technologies

### Backend
- Node.js
- Express
- PostgreSQL
- pg

### Frontend
- React
- Axios

---

## Database

The system uses PostgreSQL.

### Tables

#### products
- id (PK)
- code (unique)
- name
- price

#### raw_materials
- id (PK)
- code (unique)
- name
- stock_quantity

#### product_raw_materials
- product_id (FK → products)
- raw_material_id (FK → raw_materials)
- quantity_required

---

## Database Connection

The backend connects to PostgreSQL using a connection pool (`pg`).


Example configuration:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'your_password',
  database: 'production_db',
  port: 5432,
});

module.exports = pool;

```
# Running the Project
- Backend:
 ```javascript
  cd backend
  npm install
  npm run dev
 ```
- The backend runs on:
```javascript
 http://localhost:3001
  ```

- Frontend:
 ```javascript
  cd backend
  npm install
  npm run dev
 ```

- The frontend runs on:
```javascript
 http://localhost:5173/
  ```
