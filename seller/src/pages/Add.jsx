import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [ecoClaim, setEcoClaim] = useState(false);

  const [newProductId, setNewProductId] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestseller", bestseller);
      formData.append("ecoClaim", ecoClaim);

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
        setNewProductId(response.data.productId || response.data._id);

        // Reset form fields (but keep ecoClaim active if they want to verify)
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

  const handleEcoVerify = async () => {
    if (!newProductId) {
      toast.warning("Add product first before verifying");
      return;
    }

    try {
      setVerifying(true);
      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      const response = await axios.post(
        `${backendUrl}/api/seller/product/verify-eco/${newProductId}`,
        {},
        {
          headers: { Authorization: authToken },
        }
      );

      if (response.data.success) {
        toast.success("Product successfully eco-verified!");
      } else {
        toast.error(response.data.message || "Eco verification failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Verification error");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="mb-2">Upload Image</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, idx) => {
            const setImage = [setImage1, setImage2, setImage3, setImage4][idx];
            const id = `image${idx + 1}`;
            return (
              <label key={id} htmlFor={id}>
                <img
                  className="w-20"
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt="upload"
                />
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id={id}
                  hidden
                  accept="image/*"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Product Inputs */}
      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
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
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Write Content Here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="w-full px-3 py-2"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub Category</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-3 py-2"
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="number"
            placeholder="25"
            min="0"
            required
          />
        </div>
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
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
                } px-3 py-1 cursor-pointer`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          onChange={(e) => setBestseller(e.target.checked)}
          type="checkbox"
          id="bestseller"
          checked={bestseller}
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to BestSeller
        </label>
      </div>

      {/* Eco Claim */}
      <div className="flex gap-2 mt-2">
        <input
          onChange={(e) => setEcoClaim(e.target.checked)}
          type="checkbox"
          id="ecoClaim"
          checked={ecoClaim}
        />
        <label className="cursor-pointer" htmlFor="ecoClaim">
          Claim Eco-Friendliness
        </label>
      </div>

      <button className="w-28 py-3 mt-4 bg-black text-white" type="submit">
        ADD
      </button>

      {ecoClaim && newProductId && (
        <button
          type="button"
          className="w-44 mt-3 py-2 bg-green-600 text-white"
          onClick={handleEcoVerify}
          disabled={verifying}
        >
          {verifying ? "Verifying..." : "Verify Eco Claim"}
        </button>
      )}
    </form>
  );
};

export default Add;
