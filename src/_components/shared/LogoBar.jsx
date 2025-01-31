import { Link } from "react-router-dom";
import { TextGradient } from "../../pages/LandingPage";

export const LogoBar = () => {
  return (
    <Link
      to="/"
      className="font-extrabold text-xl tracking-tighter dark:text-white"
    >
      <TextGradient>WorkTracker</TextGradient>
    </Link>
  );
};
