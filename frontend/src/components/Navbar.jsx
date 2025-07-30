import { ArrowRight } from "lucide-react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const navigate = useNavigate();

  // use clerk hooks
  const { user } = useUser();
  const { openSignIn } = useClerk();

  return (
    <div className="fixed z-5 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32 cursor-pointer">
      <img
        src={assets.logo}
        alt="logo"
        className="sm:w-44 w-32"
        onClick={() => navigate("/")}
      />

      {user ? (
        <div className="flex items-center justify-center gap-3 rounded-full bg-gray-100 px-3 py-1.5">
          <UserButton />
          <p className="text-md font-medium text-gray-600 hidden sm:block">
            {user.firstName}
          </p>
        </div>
      ) : (
        <button
          onClick={openSignIn}
          className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5"
        >
          Get started <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
