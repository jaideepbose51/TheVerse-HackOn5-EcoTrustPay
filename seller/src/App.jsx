// ✅ All imports should be at the top
import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, useNavigate } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import AdvancedDetails from "./pages/AdvancedDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [seller, setSeller] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchSellerProfile();
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const fetchSellerProfile = async () => {
  try {
    const res = await axios.get(`${backendUrl}/api/seller/profile`, {
      headers: { Authorization: token },
    });

    console.log("✅ Seller Profile Response:", res.data);
    const sellerData = res.data; // <-- FIXED HERE

    if (!sellerData || typeof sellerData !== "object") {
      throw new Error("❌ Seller data missing or malformed");
    }

    setSeller(sellerData);

    const hasIncompleteDocs = () => {
      const brandDocs = sellerData.brandDocuments || {};
      const { shopImages, purchaseBills, brandAssociations, gstNumber } = brandDocs;

      if (sellerData.sellerType === "branded") {
        return !(
          shopImages?.length &&
          purchaseBills?.length &&
          brandAssociations?.length &&
          gstNumber
        );
      } else {
        return !(shopImages?.length && purchaseBills?.length);
      }
    };

    if (sellerData.status !== "verified" || hasIncompleteDocs()) {
      console.warn("⛔ Incomplete documents or unverified seller");
      navigate("/seller/advanced-details");
    }

  } catch (err) {
    console.error("❌ Failed to fetch seller profile:", err);

    if (err?.response?.status === 401) {
      console.warn("⛔ Unauthorized. Resetting token...");
      setToken(""); // Trigger login
    } else {
      console.warn("⚠️ Server error. Keeping token for retry.");
    }

    debugger;
  }
};


  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/" element={<List token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route
                  path="/seller/advanced-details"
                  element={<AdvancedDetails token={token} />}
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
