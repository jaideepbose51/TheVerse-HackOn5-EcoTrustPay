import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Verify from "./pages/Verify";
import List from "./pages/List";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SellerList from "./pages/SellerList";
import SellerDetails from "./pages/SellerDetail";
import PendingSellers from "./pages/PendingSellers";
import SellerDetail from "./pages/SellerDetail";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

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
                <Route path="/add" element={<Verify token={token} />} />
                <Route path="/" element={<List token={token} />} />
                <Route path="/sellers" element={<SellerList />} />
                <Route
                  path="/admin/sellers/pending"
                  element={<PendingSellers />}
                />
                <Route path="/admin/seller/:id" element={<SellerDetail />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
//triger
export default App;
