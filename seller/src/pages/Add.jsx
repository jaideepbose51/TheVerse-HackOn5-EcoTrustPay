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

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Append basic product info
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestseller", bestseller);

      // Append eco-friendly info if provided
      if (isEcoFriendly) {
        formData.append(
          "ecoClaim",
          JSON.stringify({
            label: ecoClaim.label,
            description: ecoClaim.description,
          })
        );
        formData.append("ecoVerified", false); // Start as unverified
      }

      // Append images
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      const response = await axios.post(
        `${backendUrl}/api/seller/product/add`,
        formData,
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset all form fields
        resetForm();
      } else {
        toast.error(response.data.message || "Failed to add product");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
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
      className="flex flex-col w-full items-start gap-3"
    >
      {/* Image Upload Section */}
      <div>
        <p className="mb-2">Upload Image (At least 1 required)</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, idx) => {
            const setImage = [setImage1, setImage2, setImage3, setImage4][idx];
            const id = `image${idx + 1}`;
            return (
              <label key={id} htmlFor={id}>
                <img
                  className="w-20 h-20 object-cover border rounded"
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt="upload"
                />
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id={id}
                  hidden
                  accept="image/*"
                  required={idx === 0} // First image is required
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Product Basic Info */}
      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2 border rounded"
          type="text"
          placeholder="Type Here"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2 border rounded"
          placeholder="Write Content Here"
          rows="3"
          required
        />
      </div>

      {/* Category and Price */}
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div className="w-full sm:w-1/3">
          <p className="mb-2">Product Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
            <option value="Electronics">Electronics</option>
            <option value="Home">Home</option>
            <option value="Beauty">Beauty</option>
          </select>
        </div>

        <div className="w-full sm:w-1/3">
          <p className="mb-2">Sub Category</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
            <option value="Accessories">Accessories</option>
            <option value="Footwear">Footwear</option>
          </select>
        </div>

        <div className="w-full sm:w-1/3">
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 border rounded"
            type="number"
            placeholder="25"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL", "One Size"].map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
            >
              <p
                className={`${
                  sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"
                } px-3 py-1 cursor-pointer rounded`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bestseller */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bestseller"
          checked={bestseller}
          onChange={(e) => setBestseller(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="bestseller">Mark as Bestseller</label>
      </div>

      {/* Eco-Friendly Section */}
      <div className="w-full border-t pt-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="ecoFriendly"
            checked={isEcoFriendly}
            onChange={(e) => setIsEcoFriendly(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="ecoFriendly" className="font-medium">
            This product is eco-friendly
          </label>
        </div>

        {isEcoFriendly && (
          <div className="space-y-3 bg-green-50 p-4 rounded">
            <div>
              <p className="mb-2">Eco-Friendly Label</p>
              <input
                type="text"
                name="label"
                value={ecoClaim.label}
                onChange={handleEcoClaimChange}
                placeholder="e.g., Organic, Recycled, Sustainable"
                className="w-full max-w-[500px] px-3 py-2 border rounded"
              />
            </div>
            <div>
              <p className="mb-2">Eco-Friendly Description</p>
              <textarea
                name="description"
                value={ecoClaim.description}
                onChange={handleEcoClaimChange}
                placeholder="Describe why this product is eco-friendly"
                className="w-full max-w-[500px] px-3 py-2 border rounded"
                rows="2"
              />
            </div>
            <p className="text-sm text-gray-600">
              Note: After submission, you can verify your eco claims through our
              AI verification system.
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        className="w-28 py-3 mt-4 bg-black text-white rounded hover:bg-gray-800 transition"
        type="submit"
      >
        ADD
      </button>
    </form>
  );
};

export default Add;
