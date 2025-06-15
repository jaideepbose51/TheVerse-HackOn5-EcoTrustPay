import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsLetter from "../components/NewsLetter";

export const Contact = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 px-4">
        <img
          className="w-full md:max-w-[480px] object-cover"
          src={assets.contact_img}
          alt="contact_img"
        />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-600">
            Our Headquarters
          </p>
          <p className="text-gray-500">
            KIIT University
            <br />
            Bhubaneswar, Odisha, India
          </p>

          <p className="text-gray-500">
            Tel: +91 98765 43210
            <br />
            Email: ecotrustpay@theverse.in
          </p>

          <p className="font-semibold text-xl text-gray-600">
            Careers at EcoTrust Pay
          </p>
          <p className="text-gray-500">
            Join us in reshaping trust in sustainable commerce. Explore open
            roles and internships.
          </p>
          <button className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">
            Explore Careers
          </button>
        </div>
      </div>

      <NewsLetter />
    </div>
  );
};

export default Contact;
