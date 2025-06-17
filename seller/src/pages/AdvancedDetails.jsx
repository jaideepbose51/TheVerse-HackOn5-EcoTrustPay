import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";
import { assets } from "../assets/assets";

const AdvancedDetails = ({ token }) => {
  // Basic Information
  const [sellerType, setSellerType] = useState("unbranded");
  const [shopName, setShopName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");

  // Categories
  const [categories, setCategories] = useState([]);
  const [sellsBrands, setSellsBrands] = useState(false);

  // Branded Seller Fields
  const [gstNumber, setGstNumber] = useState("");
  const [sourceDetails, setSourceDetails] = useState("");

  // Document Uploads (matching Add.jsx style)
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

  const handleImageUpload = (e, setter) => {
    const files = Array.from(e.target.files);
    if (files.length + shopImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setter((prev) => [...prev, ...files]);
    e.target.value = null; // Reset input to allow same file re-upload
  };

  const removeImage = (index, setter, state) => {
    setter(state.filter((_, i) => i !== index));
  };

  const handleCategoryToggle = (cat) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!shopName || !businessDescription || !businessAddress) {
      toast.error("Please fill all required business information");
      setIsSubmitting(false);
      return;
    }

    if (categories.length === 0) {
      toast.error("Please select at least one category");
      setIsSubmitting(false);
      return;
    }

    if (shopImages.length === 0 || purchaseBills.length === 0) {
      toast.error("Please upload shop images and purchase bills");
      setIsSubmitting(false);
      return;
    }

    if (sellerType === "branded" && (!gstNumber || !sourceDetails)) {
      toast.error("Please fill all required branded seller fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();

      // Basic Information
      formData.append("shopName", shopName);
      formData.append("businessDescription", businessDescription);
      formData.append("businessAddress", businessAddress);
      formData.append("yearsInBusiness", yearsInBusiness);
      formData.append("website", website);
      formData.append(
        "socialMediaLinks",
        JSON.stringify({
          instagram,
          facebook,
        })
      );

      // Seller Type
      formData.append("sellerType", sellerType);
      formData.append("sellsBrands", sellsBrands);
      formData.append("categories", JSON.stringify(categories));

      // Branded Seller Info
      if (sellerType === "branded") {
        formData.append("gstNumber", gstNumber);
        formData.append("sourceDetails", sourceDetails);
      }

      // Append files
      shopImages.forEach((file, index) => {
        formData.append(`shopImages`, file);
      });

      purchaseBills.forEach((file, index) => {
        formData.append(`purchaseBills`, file);
      });

      if (sellerType === "branded") {
        brandAssociations.forEach((file, index) => {
          formData.append(`brandAssociations`, file);
        });
      }

      const res = await axios.put(
        `${backendUrl}/api/seller/details`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token.replace("Bearer ", "")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(res.data.message || "Verification submitted successfully!");
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to submit verification. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Seller Verification
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg">Business Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shop Name*
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Years in Business
              </label>
              <input
                type="number"
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Description*
            </label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Address*
            </label>
            <textarea
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              rows="2"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Page name or URL"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Seller Type */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg">Seller Type</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Seller Type*
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="unbranded"
                  checked={sellerType === "unbranded"}
                  onChange={() => setSellerType("unbranded")}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Unbranded</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="branded"
                  checked={sellerType === "branded"}
                  onChange={() => setSellerType("branded")}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700">Branded</span>
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sellsBrands"
              checked={sellsBrands}
              onChange={(e) => setSellsBrands(e.target.checked)}
              className="h-4 w-4 text-blue-600"
            />
            <label htmlFor="sellsBrands" className="text-sm text-gray-700">
              Sells Branded Products
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Categories*
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryToggle(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
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
        </div>

        {/* Section 3: Branded Seller Info (Conditional) */}
        {sellerType === "branded" && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-lg text-blue-800">
              Brand Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  GST Number*
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Source Details*
                </label>
                <textarea
                  value={sourceDetails}
                  onChange={(e) => setSourceDetails(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  rows="3"
                  required
                  placeholder="Describe your manufacturing/sourcing process"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand Association Documents
              </label>
              <div className="flex gap-4 flex-wrap">
                {brandAssociations.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Brand doc ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index,
                          setBrandAssociations,
                          brandAssociations
                        )
                      }
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="cursor-pointer">
                  <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={assets.upload_area}
                      alt="upload"
                    />
                  </div>
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, setBrandAssociations)}
                    hidden
                    multiple
                    accept="image/*,.pdf"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Document Uploads */}
        <div className="space-y-6">
          {/* Shop Images */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg">Shop Images* (Max 5)</h3>
            <p className="text-sm text-gray-500">
              Upload images of your physical store, warehouse, or workspace
            </p>
            <div className="flex gap-4 flex-wrap">
              {shopImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Shop image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeImage(index, setShopImages, shopImages)
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {shopImages.length < 5 && (
                <label className="cursor-pointer">
                  <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={assets.upload_area}
                      alt="upload"
                    />
                  </div>
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, setShopImages)}
                    hidden
                    multiple
                    accept="image/*"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Purchase Bills */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg">Purchase Bills* (Max 5)</h3>
            <p className="text-sm text-gray-500">
              Upload bills/invoices from your suppliers
            </p>
            <div className="flex gap-4 flex-wrap">
              {purchaseBills.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={
                      file.type.startsWith("image/")
                        ? URL.createObjectURL(file)
                        : assets.document_icon
                    }
                    alt={`Purchase bill ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeImage(index, setPurchaseBills, purchaseBills)
                    }
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {purchaseBills.length < 5 && (
                <label className="cursor-pointer">
                  <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={assets.upload_area}
                      alt="upload"
                    />
                  </div>
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, setPurchaseBills)}
                    hidden
                    multiple
                    accept="image/*,.pdf"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${
              isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            {isSubmitting ? "Submitting..." : "Submit Verification"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedDetails;
