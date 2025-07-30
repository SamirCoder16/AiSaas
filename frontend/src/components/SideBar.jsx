import { Protect, useClerk, useUser } from "@clerk/clerk-react";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";

const navItems = [
  { to: "/ai", label: "Dashboard", icon: House },
  { to: "/ai/write-article", label: "Write Article", icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", icon: FileText },
  { to: "/ai/community", label: "Community", icon: Users },
];

const SideBar = ({ sideBar, setSideBar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const [profileGredient, setprofileGredient] = useState('Dashboard');
  const [isFlipping, setIsFlipping] = useState(false);

  const handleNavClick = (label) => {
    setSideBar(false);
    setprofileGredient(label);
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 1000); // duration should match CSS
  };

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex z-20 flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${
        sideBar ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="my-7 w-full">
        {/* Profile Image */}
        <div
          className={`w-15 h-15 flex items-center justify-center rounded-full mx-auto transition-transform duration-700 ${
            isFlipping ? "animate-flip" : ""
          } ${
            profileGredient === "Dashboard"
              ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA]"
              : ""
          } ${
            profileGredient === "Write Article"
              ? "bg-gradient-to-r from-[#226BFF] to-[#65ADFF]"
              : ""
          } ${
            profileGredient === "Blog Titles"
              ? "bg-gradient-to-r from-[#C341F6] to-[#8E37EB]"
              : ""
          } ${
            profileGredient === "Generate Images"
              ? "bg-gradient-to-r from-[#00AD25] to-[#17632E]"
              : ""
          } ${
            profileGredient === "Remove Background"
              ? "bg-gradient-to-r from-[#FF5A5A] to-[#FFB2B2]"
              : ""
          } ${
            profileGredient === "Remove Object"
              ? "bg-gradient-to-r from-[#417DF6] to-[#8E37EB]"
              : ""
          } ${
            profileGredient === "Review Resume"
              ? "bg-gradient-to-r from-[#00DA83] to-[#08B6CE]"
              : ""
          } ${
            profileGredient === "Community"
              ? "bg-gradient-to-r from-[#3F5EFB] to-[#FC466B]"
              : ""
          }`}
        >
          <img
            src={user.imageUrl}
            className="w-13 rounded-full mx-auto"
            alt="user Avatar"
          />
        </div>

        {/* Name */}
        <h1 className="mt-1 text-center">{user.fullName}</h1>

        {/* Nav Links */}
        <div className="px-6 mt-5 text-sm text-gray-600 font-medium">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => handleNavClick(label)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded transition-all duration-300 ${
                  label === "Dashboard" && isActive
                    ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
                    : ""
                } ${
                  label === "Write Article" && isActive
                    ? "bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white"
                    : ""
                } ${
                  label === "Blog Titles" && isActive
                    ? "bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white"
                    : ""
                } ${
                  label === "Generate Images" && isActive
                    ? "bg-gradient-to-r from-[#00AD25] to-[#17632E] text-white"
                    : ""
                } ${
                  label === "Remove Background" && isActive
                    ? "bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white"
                    : ""
                } ${
                  label === "Remove Object" && isActive
                    ? "bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white"
                    : ""
                } ${
                  label === "Review Resume" && isActive
                    ? "bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white"
                    : ""
                } ${
                  label === "Community" && isActive
                    ? "bg-gradient-to-r from-[#3F5EFB] to-[#FC466B] text-white"
                    : ""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom profile + logout */}
      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div
          className="flex gap-2 items-center cursor-pointer"
          onClick={openUserProfile}
        >
          <img
            src={user.imageUrl}
            className="w-8 h-8 rounded-full"
            alt="user Avatar"
          />
          <div>
            <h1 className="text-sm font-medium">{user.fullName}</h1>
            <p className="text-xs text-gray-400">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
              Plan
            </p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SideBar;
