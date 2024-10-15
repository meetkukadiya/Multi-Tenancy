const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Create connection to main_db
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: "multi_tenancy",
// });

// connection.connect((error) => {
//   if (error) {
//     console.error("Error connecting to MySQL database:", error);
//   } else {
//     console.log("Connected to MySQL database!");
//   }
// });

// Register User and Create Tenant Database
// app.post("/register", async (req, res) => {
//   const { username, password, role } = req.body;

//   // Hash the password
//   const hashedPassword = await bcrypt.hash(password, 10);

//   // Generate a unique tenant database name
//   const tenantDBName = `tenant_${username}`;

//   try {
//     const connection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: tenantDBName,
//     });

//     // Store user in multi_tenancy
//     const [result] = await connection.query(
//       "INSERT INTO users (username, password, role, tenant_db) VALUES (?, ?, ?, ?)",
//       [username, hashedPassword, role, tenantDBName]
//     );

//     console.log("Add the Detail of Tenant : ", result);

//     // Create a new database for the tenant
//     console.log("Successfully created Tanant database", connection);

//     await connection.query(`CREATE DATABASE ${tenantDBName}`);

//     // Create a sample table in the new tenant database
//     await connection.query(`
//       CREATE TABLE ${tenantDBName}.products (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         price DECIMAL(10, 2) NOT NULL
//       )
//     `);

//     res
//       .status(201)
//       .json({ message: "User registered and tenant database created" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const tenantDBName = `tenant_${username}`;

  // Connect main Database
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Store user in multi_tenancy database
    const [result] = await connection.query(
      "INSERT INTO users (username, password, role, tenant_db) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, role, tenantDBName]
    );

    console.log("Add the Detail of Tenant: ", result);

    // Create the tenant database
    await connection.query(`CREATE DATABASE ${tenantDBName}`);

    // Disconnect the main Database
    await connection.end();

    // Connect to the tenant database
    const tenantConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: tenantDBName,
    });

    // Create a table in Tenant database
    await tenantConnection.query(`
        CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL
        )
      `);

    console.log("Successfully created tenant database and products table");

    // Disconnect the tenant Database
    await tenantConnection.end();

    res.status(201).json({
      message: "User registered and tenant database created",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login API and Create Token and Access the Database
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Fetch the user from main_db
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token with tenant database name
    const token = jwt.sign(
      { userId: user.id, tenantDB: user.tenant_db },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// middleware to verify token and connect to tenant database
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  // const token = req.cookies.authToken;
  console.log("Token in Authentication", token);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.tenantDB = decoded.tenantDB;

    // connect to tenant database
    req.tenantDBConnection = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: req.tenantDB,
    });

    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Create product in tenant database
app.post("/products", authenticate, async (req, res) => {
  const { name, price } = req.body;

  try {
    await req.tenantDBConnection.query(
      "INSERT INTO products (name, price) VALUES (?, ?)",
      [name, price]
    );
    res.status(201).json({ message: "Product created in tenant database" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Product creation failed" });
  }
});

// Get products from tenant database
app.get("/products", authenticate, async (req, res) => {
  try {
    const [products] = await req.tenantDBConnection.query(
      "SELECT * FROM products"
    );
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
