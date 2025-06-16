import React, { useEffect, useState } from "react";
import { currency } from "../App";
import { toast } from "react-toastify";

const dummyProducts = [
  {
    _id: "P1",
    name: "Bamboo Toothbrush",
    image: [
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcS7lr4AHk0B_VeCgaVbnIZJoAJsmZzzhBeCKz0MQ5iXYBx4pOryIHdwajBdTGtK5AcRvYbDs7mB1QMRjEB8uXiuW-Ks0MI1_uAyH0gsHEA6-bs3BrS0pYhNHg",
    ],
    category: "Personal Care",
    price: 99,
  },
  {
    _id: "P2",
    name: "Compostable Plate Set",
    image: [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSwpzkMphp17sx_OwvgFrYJ9s3wXqv2I-5nUV0RFkE0gpyitFNEkWlKzEbggWh-_vv55jDptqKkza8WtQbsTXhG0CPz4HeEWZmXwzUrBFf7LB-0fLzftRWYlA",
    ],
    category: "Kitchen",
    price: 199,
  },
  {
    _id: "P3",
    name: "Reusable Grocery Bag",
    image: [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTmfEXmv37gRANPA5w1WxXVkyMRrU2TlOTco8V7tllv2eoR5dIS6hlDNy2qriP5-6o__NBtTbboV4id19laiK-MiJuMe7AM4NSR9pXw9XPQlgVy_uue2cBf",
    ],
    category: "Lifestyle",
    price: 149,
  },
  {
    _id: "P4",
    name: "Eco-Friendly Notebook",
    image: [
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcScuLsncohKZQ76V-ZWNxxqOIJg33K5K-GvRhhRG-7y2BXX8fUc7tRhIkGbGca_p9fMYgDyhb3fi9IpgZSLcbjL1F4HfsCRXLJ8ES9qeRlaGgqxxx1UTaL7pA",
    ],
    category: "Stationery",
    price: 129,
  },
  {
    _id: "P5",
    name: "Biodegradable Trash Bags",
    image: ["https://m.media-amazon.com/images/I/81p0oggkdhL.jpg"],
    category: "Cleaning",
    price: 89,
  },
];

const List = () => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    setTimeout(() => {
      setList(dummyProducts);
      toast.info("Loaded Product Data");
    }, 500);
  };

  const removeProduct = (id) => {
    setList((prev) => prev.filter((item) => item._id !== id));
    toast.success("Product Removed From List");
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products List</p>
      <div className="flex flex-col gap-2">
        {/* ----------------List Table Title--------------- */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1.5fr_1fr_0.5fr] items-center px-2 py-1 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Delete</b>
        </div>

        {/* -----------------Product List------------------ */}
        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1.5fr_1fr_0.5fr] items-center gap-2 py-3 px-2 border text-sm"
            key={index}
          >
            <img
              className="w-12 h-12 object-cover"
              src={item.image[0]}
              alt="product"
            />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <p
              className="text-right md:text-center cursor-pointer text-lg text-red-500 font-bold"
              onClick={() => removeProduct(item._id)}
            >
              X
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;
