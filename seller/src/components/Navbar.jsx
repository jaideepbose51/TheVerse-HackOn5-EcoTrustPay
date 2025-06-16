import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("seller_token");
    setToken("");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between py-2 px-[4%] border-b">
      <img className="w-[max(10%,80px)]" src={assets.logo} alt="Logo" />
      <button
        onClick={handleLogout}
        className="bg-gray-700 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-800 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
