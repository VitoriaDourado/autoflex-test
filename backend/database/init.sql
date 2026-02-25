CREATE TABLE raw_materials (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    stock_quantity INTEGER NOT NULL CHECK (stock_quantity >= 0)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE product_raw_materials (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    raw_material_id INTEGER REFERENCES raw_materials(id) ON DELETE CASCADE,
    quantity_required INTEGER NOT NULL CHECK (quantity_required > 0),
    PRIMARY KEY (product_id, raw_material_id)
);