import React from "react";

const GradientButton = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
  >
    {children}
  </button>
);

export default GradientButton;
