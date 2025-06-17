import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

const AdvancedDetails = ({ token }) => {
  const [sellerType, setSellerType] = useState("unbranded");
  const [categories, setCategories] = useState([]);
  const [sellsBrands, setSellsBrands] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [sourceDetails, setSourceDetails] = useState("");

  const [shopImages, setShopImages] = useState([]);
  const [brandAssociations, setBrandAssociations] = useState([]);
  const [purchaseBills, setPurchaseBills] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    "electronics",
    "fashion",
    "home",
    "books",
    "beauty",
    "sports",
  ];

  const handleFileChange = (e, setter) => {
    setter(Array.from(e.target.files));
  };

  const handleCategoryToggle = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ✅ Validation
    if (categories.length === 0) {
      toast.error("Please select at least one category.");
      setIsSubmitting(false);
      return;
    }

    if (shopImages.length === 0 || purchaseBills.length === 0) {
      toast.error("Please upload shop images and purchase bills.");
      setIsSubmitting(false);
      return;
    }

    if (
      sellerType === "branded" &&
      (gstNumber.trim() === "" ||
        sourceDetails.trim() === "" ||
        brandAssociations.length === 0)
    ) {
      toast.error("Please fill all required branded seller fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("sellerType", sellerType);
      formData.append("sellsBrands", sellsBrands ? "true" : "false");

      categories.forEach((cat) => formData.append("categories", cat));
      shopImages.forEach((file) => formData.append("shopImages", file));
      purchaseBills.forEach((file) => formData.append("purchaseBills", file));

      if (sellerType === "branded") {
        formData.append("gstNumber", gstNumber);
        formData.append("sourceDetails", sourceDetails);
        brandAssociations.forEach((file) =>
          formData.append("brandAssociations", file)
        );
      }

      const res = await axios.put(`${backendUrl}/api/seller/details`, formData, {
        headers: {
          Authorization: `Bearer ${token.replace("Bearer ", "")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "Submitted successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Submission failed. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full items-start gap-3 p-4 max-w-4xl mx-auto"
    >
      <h2 className="text-xl font-semibold">Advanced Seller Verification</h2>

      {/* Seller Type */}
      <div className="w-full">
        <label className="block mb-2 font-medium">Seller Type*</label>
        <select
          value={sellerType}
          onChange={(e) => setSellerType(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="unbranded">Unbranded</option>
          <option value="branded">Branded</option>
        </select>
      </div>

      {/* Categories */}
      <div className="w-full">
        <label className="block mb-2 font-medium">Product Categories*</label>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => handleCategoryToggle(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                categories.includes(cat)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sells Brands */}
      <div className="w-full">
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={sellsBrands}
            onChange={(e) => setSellsBrands(e.target.checked)}
          />
          Sells Branded Products
        </label>
      </div>

      {/* Branded Seller Fields */}
      {sellerType === "branded" && (
        <>
          <div className="w-full">
            <label className="block mb-2 font-medium">GST Number*</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="w-full">
            <label className="block mb-2 font-medium">Source Details*</label>
            <textarea
              value={sourceDetails}
              onChange={(e) => setSourceDetails(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="w-full">
            <label className="block mb-2 font-medium">Brand Associations*</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, setBrandAssociations)}
              className="w-full"
              accept="image/*"
              required
            />
          </div>
        </>
      )}

      {/* Shop Images */}
      <div className="w-full">
        <label className="block mb-2 font-medium">Shop Images*</label>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileChange(e, setShopImages)}
          className="w-full"
          accept="image/*"
          required
        />
      </div>

      {/* Purchase Bills */}
      <div className="w-full">
        <label className="block mb-2 font-medium">Purchase Bills*</label>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileChange(e, setPurchaseBills)}
          className="w-full"
          accept="image/*"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-600 text-white px-6 py-2 rounded-md mt-4 hover:bg-green-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Advanced Details"}
      </button>
    </form>
  );
};

export default AdvancedDetails;
