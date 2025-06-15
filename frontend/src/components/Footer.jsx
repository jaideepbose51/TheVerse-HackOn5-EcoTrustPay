import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm px-4">
        <div>
          <img className="mb-5 w-32" src={assets.logo} alt="logo" />
          <p className="w-full md:w-2/3 text-gray-600">
            EcoTrust Pay is building a smarter, safer way to shop sustainably.
            We help verify eco-claims, prevent fraud, and reduce carbon
            emissions through intelligent group deliveries — earning trust at
            every click.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600 cursor-pointer">
            <li>Home</li>
            <li>About Us</li>
            <li>Contact</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+91 98765 43210</li>
            <li>ecotrustpay@theverse.in</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          © 2025 EcoTrust Pay — All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Footer;
