import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  // Image states
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  // Product details
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  // Eco-friendly options
  const [ecoClaim, setEcoClaim] = useState({
    label: "",
    description: "",
  });
  const [isEcoFriendly, setIsEcoFriendly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!name || !description || !price || !image1) {
      toast.error("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();

      // Append basic product info
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", parseFloat(price).toFixed(2));
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);

      // Handle sizes
      if (sizes.length > 0) {
        formData.append("sizes", sizes.join(","));
      } else {
        formData.append("sizes", "One Size");
      }

      // Append eco-friendly info if provided
      if (isEcoFriendly) {
        formData.append("ecoLabel", ecoClaim.label);
        formData.append("ecoDescription", ecoClaim.description);
        formData.append("ecoVerified", "false");
      }

      // Append images with correct field names
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        `${backendUrl}/api/seller/product/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token.replace("Bearer ", "")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Product added successfully!");
        resetForm();
      } else {
        throw new Error(response.data.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Add product error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add product. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Men");
    setSubCategory("Topwear");
    setSizes([]);
    setBestseller(false);
    setImage1(null);
    setImage2(null);
    setImage3(null);
    setImage4(null);
    setEcoClaim({ label: "", description: "" });
    setIsEcoFriendly(false);
  };

  const handleEcoClaimChange = (e) => {
    const { name, value } = e.target;
    setEcoClaim((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3 p-4 max-w-4xl mx-auto"
    >
      {/* Image Upload Section */}
      <div className="w-full">
        <p className="mb-2 font-medium">Upload Images (At least 1 required)</p>
        <div className="flex gap-4 flex-wrap">
          {[image1, image2, image3, image4].map((img, idx) => {
            const setImage = [setImage1, setImage2, setImage3, setImage4][idx];
            const id = `image${idx + 1}`;
            return (
              <label key={id} htmlFor={id} className="cursor-pointer">
                <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={!img ? assets.upload_area : URL.createObjectURL(img)}
                    alt="upload"
                  />
                </div>
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id={id}
                  hidden
                  accept="image/*"
                  required={idx === 0}
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Product Basic Info */}
      <div className="w-full">
        <label className="block mb-2 font-medium">Product Name*</label>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          type="text"
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="w-full">
        <label className="block mb-2 font-medium">Product Description*</label>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe your product in detail"
          rows="4"
          required
        />
      </div>

      {/* Category and Price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div>
          <label className="block mb-2 font-medium">Category*</label>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
            <option value="Electronics">Electronics</option>
            <option value="Home">Home</option>
            <option value="Beauty">Beauty</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Sub Category*</label>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
            <option value="Accessories">Accessories</option>
            <option value="Footwear">Footwear</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Price (₹)*</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-4 py-2 border rounded-lg"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="w-full">
        <label className="block mb-2 font-medium">Available Sizes</label>
        <div className="flex flex-wrap gap-2">
          {["S", "M", "L", "XL", "XXL", "One Size"].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                sizes.includes(size)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Bestseller */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="bestseller"
          checked={bestseller}
          onChange={(e) => setBestseller(e.target.checked)}
          className="w-5 h-5 rounded"
        />
        <label htmlFor="bestseller" className="font-medium">
          Mark as Bestseller
        </label>
      </div>

      {/* Eco-Friendly Section */}
      <div className="w-full border-t pt-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="ecoFriendly"
            checked={isEcoFriendly}
            onChange={(e) => setIsEcoFriendly(e.target.checked)}
            className="w-5 h-5 rounded"
          />
          <label htmlFor="ecoFriendly" className="font-medium">
            This product is eco-friendly
          </label>
        </div>

        {isEcoFriendly && (
          <div className="space-y-3 bg-green-50 p-4 rounded-lg">
            <div>
              <label className="block mb-2 font-medium">
                Eco-Friendly Label
              </label>
              <input
                type="text"
                name="label"
                value={ecoClaim.label}
                onChange={handleEcoClaimChange}
                placeholder="e.g., Organic, Recycled, Sustainable"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">
                Eco-Friendly Description
              </label>
              <textarea
                name="description"
                value={ecoClaim.description}
                onChange={handleEcoClaimChange}
                placeholder="Describe why this product is eco-friendly"
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        className={`w-full md:w-48 py-3 mt-6 rounded-lg font-medium ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding Product..." : "Add Product"}
      </button>
    </form>
  );
};

export default Add;
