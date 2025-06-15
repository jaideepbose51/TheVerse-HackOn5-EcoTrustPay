import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsLetter from "../components/NewsLetter";

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img
          className="w-full lg:max-w-[450px] h-96 object-cover"
          src={assets.about_img}
          alt="about_img"
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>
            EcoTrust Pay is a platform born out of a mission to rebuild trust in
            green commerce. In a world full of vague or misleading eco-claims,
            we provide a real-time, AI-powered verification system that
            validates sustainability claims before a customer hits "Buy Now".
          </p>
          <p>
            Our system integrates directly into shopping flows, offering
            customers confidence by analyzing product images, text descriptions,
            and seller behavior. Whether it's flagging reused packaging or
            spotting suspicious seller activity, EcoTrust Pay ensures
            eco-products are truly what they claim to be.
          </p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            To empower customers with verified sustainable choices, reduce
            greenwashing, and support eco-conscious shopping at scale. We
            believe trust should be earned — not assumed — and we are building
            the infrastructure to make it happen.
          </p>
        </div>
      </div>

      <div className="text-4xl py-4">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Real-Time Eco Verification</b>
          <p className="text-gray-600">
            Using AI tools like AWS Rekognition and SageMaker, we validate
            product claims and flag unverified listings. Our badge system tells
            you instantly if a product is truly eco-friendly or not.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Trustworthy Sellers</b>
          <p className="text-gray-600">
            Sellers are scored based on their past behavior, certifications, and
            claim history. Fraud detection ensures risky sellers are flagged
            before transactions complete — ensuring your money supports real
            sustainability.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Smarter Deliveries, Less Waste</b>
          <p className="text-gray-600">
            Our group delivery model reduces carbon emissions by combining
            orders from the same locality. You not only shop smart, but also
            reduce packaging and last-mile delivery waste.
          </p>
        </div>
      </div>

      <NewsLetter />
    </div>
  );
};

export default About;
