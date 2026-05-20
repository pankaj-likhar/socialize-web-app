// src/pages/Profile.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Navbar from "../components/Navbar";
import {
  getFeed,
  getUserById,
  getFollowStats,
  getFollowing,
  followUser,
  unfollowUser,
  uploadProfileImage
} from "../services/api";

function Profile() {
  const { userId } = useParams();

  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0
  });

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Profile image states
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get logged-in user ID from JWT
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setCurrentUserId(Number(decoded.userId));
      }
    } catch {
      console.error("JWT decode failed");
    }
  }, []);

  // Load profile data
  useEffect(() => {
    if (!userId || currentUserId === null) return;

    const loadProfile = async () => {
      try {
        const numericUserId = Number(userId);
        const numericCurrentUserId = Number(currentUserId);

        // User data
        const userData = await getUserById(numericUserId);
        setUser(userData);

        // Follow stats
        const statsData = await getFollowStats(numericUserId);
        setStats(statsData);

        // User posts
        const feedData = await getFeed(0, 100);
        const userPosts = (feedData.content || []).filter(
          (post) => Number(post.userId) === numericUserId
        );
        setPosts(userPosts);

        // Follow status
        if (numericUserId !== numericCurrentUserId) {
          const followingList = await getFollowing();
          const ids = followingList.map((u) =>
            Number(u.userId)
          );
          setIsFollowing(ids.includes(numericUserId));
        } else {
          setIsFollowing(false);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    loadProfile();
  }, [userId, currentUserId]);

  const isMyProfile =
    currentUserId !== null &&
    Number(userId) === Number(currentUserId);

  // Follow / Unfollow
  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);

        setStats((prev) => ({
          ...prev,
          followers: prev.followers - 1
        }));
      } else {
        await followUser(userId);
        setIsFollowing(true);

        setStats((prev) => ({
          ...prev,
          followers: prev.followers + 1
        }));
      }
    } catch (error) {
      console.error("Follow toggle failed", error);
    }
  };

  // Select image
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Upload profile image
  const handleUploadProfileImage = async () => {
    if (!selectedImage) return;

    try {
      setUploading(true);

      const updatedUser =
        await uploadProfileImage(selectedImage);

      setUser(updatedUser);

      setSelectedImage(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      alert("Profile image updated successfully!");
    } catch (error) {
      console.error(
        "Failed to upload profile image",
        error
      );
      alert("Failed to upload profile image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto mt-6 px-4">
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-xl shadow mb-4 text-center">
          {/* Profile Image */}
          <div className="w-24 h-24 mx-auto mb-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
              />
            ) : user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Upload controls (only on own profile) */}
          {isMyProfile && (
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2"
              />

              {selectedImage && (
                <div>
                  <button
                    onClick={handleUploadProfileImage}
                    disabled={uploading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : "Upload Profile Image"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.name || "User"}
          </h2>

          {/* Email */}
          <p className="text-gray-500 mt-1">
            {user?.email}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4 text-gray-600">
            <span>
              <b>{stats.followers}</b> Followers
            </span>
            <span>
              <b>{stats.following}</b> Following
            </span>
          </div>

          {/* Follow Button */}
          {currentUserId !== null && !isMyProfile && (
            <button
              onClick={handleFollowToggle}
              className={`mt-4 px-5 py-2 rounded-full text-sm ${
                isFollowing
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        {/* Posts */}
        <h3 className="text-lg font-semibold mb-2">
          {isMyProfile ? "Your Posts" : "Posts"}
        </h3>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.postId}
              className="bg-white p-4 rounded-lg shadow mb-3"
            >
              {post.content}

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="mt-3 rounded-lg w-full"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;