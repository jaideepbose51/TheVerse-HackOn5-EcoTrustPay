import React from "react";
import { assets } from "../assets/assets";

const OurPolicy = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700">
      <div>
        <img
          src={assets.exchange_icon}
          alt="exchange_icon"
          className="w-12 m-auto mb-5"
        />
        <p className="font-semibold">Verified Green Products</p>
        <p className="text-gray-400">
          Every eco-claim is AI-verified for trust and transparency.
        </p>
      </div>

      <div>
        <img
          src={assets.quality_icon}
          alt="quality_icon"
          className="w-12 m-auto mb-5"
        />
        <p className="font-semibold">Fraud Protection</p>
        <p className="text-gray-400">
          Risky sellers are flagged automatically before checkout.
        </p>
      </div>

      <div>
        <img
          src={assets.support_img}
          alt="support_img"
          className="w-12 m-auto mb-5"
        />
        <p className="font-semibold">Real-time Customer Support</p>
        <p className="text-gray-400">
          We offer quick help and real-time responses for a smoother experience.
        </p>
      </div>
    </div>
  );
};

export default OurPolicy;
