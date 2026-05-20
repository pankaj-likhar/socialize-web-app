// src/pages/Users.jsx

import { useEffect, useState } from "react";
import {
  getAllUsers,
  followUser,
  unfollowUser,
  getFollowing
} from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";

function Users() {
  const [users, setUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Get logged-in user email
  let currentUserEmail = null;

  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      currentUserEmail = decoded.sub;
    }
  } catch (e) {
    console.error("JWT decode failed");
  }

  useEffect(() => {
    loadUsers();
    loadFollowing();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error("Failed to load users", e);
    }
  };

  const loadFollowing = async () => {
    try {
      const data = await getFollowing();
      const ids = data.map((u) => u.userId);
      setFollowingIds(ids);
    } catch (e) {
      console.error("Failed to load following", e);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      if (followingIds.includes(userId)) {
        await unfollowUser(userId);

        setFollowingIds((prev) =>
          prev.filter((id) => id !== userId)
        );
      } else {
        await followUser(userId);

        setFollowingIds((prev) => [...prev, userId]);
      }
    } catch (e) {
      console.error("Follow/Unfollow failed", e);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-6 px-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Find Users
        </h2>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by name..."
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {users
            .filter((user) =>
              user.name
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((user) => (
              <div
                key={user.userId}
                onClick={() =>
                  navigate(`/profile/${user.userId}`)
                }
                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Profile Image */}
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 mb-2">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name */}
                  <h3 className="font-semibold text-gray-800">
                    {user.name}
                  </h3>

                  {/* Email */}
                  <p className="text-sm text-gray-500 mb-3">
                    {user.email}
                  </p>

                  {/* Follow Button */}
                  <button
                    disabled={
                      user.email === currentUserEmail
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowToggle(user.userId);
                    }}
                    className={`px-4 py-1 rounded-lg text-sm ${
                      user.email === currentUserEmail
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : followingIds.includes(
                            user.userId
                          )
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {user.email === currentUserEmail
                      ? "You"
                      : followingIds.includes(
                          user.userId
                        )
                      ? "Unfollow"
                      : "Follow"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Users;