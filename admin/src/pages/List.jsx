import React, { useEffect, useState } from "react";
import { currency } from "../App";
import { toast } from "react-toastify";
import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

const List = () => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Admin not logged in");

    try {
      const response = await axios.get(`${BASE_URL}/admin/catalogues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      if (Array.isArray(data)) {
        setList(data);
        toast.success("Loaded Product List");
      } else {
        toast.error("Unexpected response format");
        console.log("⚠️ Unexpected API response:", data);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch products");
    }
  };

  const removeProduct = async (id) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Admin not logged in");

    try {
      // 🔁 Adjust this if you have a real delete/block route
      await axios.delete(`${BASE_URL}/admin/catalogues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setList((prev) => prev.filter((item) => item._id !== id));
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
          <span>Category</span>
          <span>Price</span>
          <span>Delete</span>
        </div>

        {/* Products */}
        {list.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1.5fr_1fr_0.5fr] items-center gap-2 py-3 px-2 border text-sm"
          >
            <img
              className="w-12 h-12 object-cover rounded"
              src={item.images?.[0] || item.image?.[0] || ""}
              alt={item.name}
            />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <button
              onClick={() => removeProduct(item._id)}
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
