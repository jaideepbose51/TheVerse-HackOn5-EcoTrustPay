import React, { useEffect, useState } from "react";
import { currency } from "../App";
import { toast } from "react-toastify";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const List = () => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Admin not logged in");

    try {
      const response = await axios.get(`${BASE_URL}/api/admin/catalogues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const catalogues = response.data;

      if (Array.isArray(catalogues)) {
        // Extract all products from all catalogues
        const allProducts = catalogues.flatMap((catalogue) =>
          catalogue.products.map((product) => ({
            ...product,
            catalogueId: catalogue._id,
            category: catalogue.category,
          }))
        );

        setList(allProducts);
        toast.success("Loaded Product List");
      } else {
        toast.error("Unexpected response format");
        console.log("⚠️ Unexpected API response:", catalogues);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch products");
    }
  };

  const removeProduct = async (productId) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Admin not logged in");

    try {
      // Note: You'll need to implement this endpoint in your backend
      // It should handle deleting a specific product from a catalogue
      await axios.delete(`${BASE_URL}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setList((prev) => prev.filter((item) => item._id !== productId));
      toast.success("Product removed");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error removing product");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2 text-lg font-semibold">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1.5fr_1fr_0.5fr] items-center px-2 py-1 border bg-gray-100 text-sm font-semibold">
          <span>Image</span>
          <span>Name</span>
          <span>Price</span>
          <span>Delete</span>
        </div>

        {/* Products */}
        {list.map((product) => (
          <div
            key={product._id}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1.5fr_1fr_0.5fr] items-center gap-2 py-3 px-2 border text-sm"
          >
            <img
              className="w-12 h-12 object-cover rounded"
              src={product.images?.[0] || ""}
              alt={product.name}
            />
            <p>{product.name}</p>
            <p>
              {currency}
              {product.price}
            </p>
            <button
              onClick={() => removeProduct(product._id)}
              className="text-red-500 text-lg font-bold text-right md:text-center"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
