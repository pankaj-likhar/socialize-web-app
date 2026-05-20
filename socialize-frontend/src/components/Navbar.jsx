// src/components/Navbar.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "../services/api";
import logo from "../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // Load current user details (including profileImageUrl)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const decoded = jwtDecode(token);
        const userId = decoded.userId;

        const userData = await getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user", error);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between items-center">
      {/* Left: Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img
          src={logo}
          alt="logo"
          className="w-12 h-12"
        />

        <span className="text-xl font-bold text-blue-600">
          Socialize
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Navigation */}
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-blue-500"
        >
          Home
        </button>

        <button
          onClick={() => navigate("/users")}
          className="text-gray-600 hover:text-blue-500"
        >
          Users
        </button>

        {/* Profile */}
        {user && (
          <div
            onClick={() =>
              navigate(`/profile/${user.userId}`)
            }
            className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-gray-100 rounded-lg"
          >
            {/* Show uploaded image if available */}
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <span className="text-gray-700 font-medium">
              {user.name}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;