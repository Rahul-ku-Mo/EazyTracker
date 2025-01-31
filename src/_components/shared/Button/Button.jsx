import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Button = ({ btnInput, icon }) => {
  return (
    <div className="text-sm inline-flex items-center rounded-md transition-all ease-in-out duration-300 hover:bg-zinc-600 hover:text-white text-black w-full bg-zinc-400/95 p-2">
      {icon && <FontAwesomeIcon icon={icon} className="pr-2" />}
      {btnInput}
    </div>
  );
};

export default Button;
