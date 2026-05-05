import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getFeed,
  getUserById,
  getFollowStats,
  getFollowing,
  followUser,
  unfollowUser
} from "../services/api";
import { jwtDecode } from "jwt-decode";

function Profile() {
  const { userId } = useParams();

  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // 🔐 Get logged-in user
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

  // 📦 Load profile AFTER currentUserId is ready
  useEffect(() => {
    if (!userId || currentUserId === null) return;

    const loadProfile = async () => {
      try {
        const numericUserId = Number(userId);
        const numericCurrentUserId = Number(currentUserId);

        // 👤 user
        const userData = await getUserById(numericUserId);
        setUser(userData);

        // 📊 stats
        const statsData = await getFollowStats(numericUserId);
        setStats(statsData);

        // 📝 posts
        const data = await getFeed();
        const userPosts = data.content.filter(
          p => Number(p.userId) === numericUserId
        );
        setPosts(userPosts);

        // 👇 follow check ONLY if NOT self
        if (numericUserId !== numericCurrentUserId) {
          const followingList = await getFollowing();
          const ids = followingList.map(u => Number(u.userId));
          setIsFollowing(ids.includes(numericUserId));
        } else {
          setIsFollowing(false);
        }

      } catch (e) {
        console.error("Failed to load profile");
      }
    };

    loadProfile();
  }, [userId, currentUserId]);

  // ✅ Safe comparison
  const isMyProfile =
    currentUserId !== null &&
    Number(userId) === Number(currentUserId);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setStats(prev => ({
          ...prev,
          followers: prev.followers - 1
        }));
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setStats(prev => ({
          ...prev,
          followers: prev.followers + 1
        }));
      }
    } catch {
      console.error("Follow toggle failed");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto mt-6 px-4">

        {/* 👤 Profile Header */}
        <div className="bg-white p-6 rounded-xl shadow mb-4 text-center">

          {/* Avatar */}
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-3">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-gray-800">
            {user?.name || "User"}
          </h2>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-3 text-gray-600">
            <span><b>{stats.followers}</b> Followers</span>
            <span><b>{stats.following}</b> Following</span>
          </div>

          {/* ✅ Show button ONLY for other users */}
          {currentUserId !== null && !isMyProfile && (
            <button
              onClick={handleFollowToggle}
              className={`mt-4 px-5 py-1 rounded-full text-sm ${
                isFollowing
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}

        </div>

        {/* 📝 Posts */}
        <h3 className="text-lg font-semibold mb-2">
          {isMyProfile ? "Your Posts" : "Posts"}
        </h3>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet</p>
        ) : (
          posts.map(post => (
            <div
              key={post.postId}
              className="bg-white p-4 rounded-lg shadow mb-3"
            >
              {post.content}
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Profile;