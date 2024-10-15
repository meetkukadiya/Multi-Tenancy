import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import "./CSS/Products.css";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [message, setMessage] = useState("");

  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    navigate("/login");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/products", {
          headers: {
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)authToken\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/products",
        newProduct,
        {
          headers: {
            Authorization: `Bearer ${document.cookie.replace(
              /(?:(?:^|.*;\s*)authToken\s*\=\s*([^;]*).*$)|^.*$/,
              "$1"
            )}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Product added successfully!");
        setMessage("Product added successfully!");
        setNewProduct({ name: "", price: "" });
        // Re-fetch products to update the list
        const productsResponse = await axios.get(
          "http://localhost:5000/products",
          {
            headers: {
              Authorization: `Bearer ${document.cookie.replace(
                /(?:(?:^|.*;\s*)authToken\s*\=\s*([^;]*).*$)|^.*$/,
                "$1"
              )}`,
            },
          }
        );
        setProducts(productsResponse.data);
      } else {
        setMessage("Failed to add product.");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("An error occurred while adding the product.");
    }
  };

  return (
    <>
      <div className="">
        <Navbar />
      </div>
      <div className="product-page">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>

        <div className="products-container">
          <h1>Products</h1>
          <form onSubmit={handleSubmit} className="product-form">
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleChange}
              placeholder="Product Name"
              required
            />
            <input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleChange}
              placeholder="Product Price"
              required
            />
            <button type="submit">Add Product</button>
          </form>
          {message && <p>{message}</p>}
          <div className="product-list">
            <h2>Product List</h2>
            {products.length > 0 ? (
              <ul>
                {products.map((product) => (
                  <li key={product.id}>
                    {product.name} - {product.price} ₹
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-pro"> No products available. </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Products;
