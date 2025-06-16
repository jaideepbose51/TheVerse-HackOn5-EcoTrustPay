import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("seller_token");
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
      isActive ? "bg-gray-200 font-semibold" : ""
    }`;

  return (
    <div className="w-[18%] min-h-screen border-r-2 bg-white">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink className={navLinkClasses} to="/">
          <img className="w-5 h-5" src={assets.order_icon} alt="List" />
          <p className="hidden md:block">List Items</p>
        </NavLink>

        <NavLink className={navLinkClasses} to="/add">
          <img className="w-5 h-5" src={assets.add_icon} alt="Add" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        <NavLink className={navLinkClasses} to="/orders">
          <img className="w-5 h-5" src={assets.order_icon} alt="Orders" />
          <p className="hidden md:block">Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
