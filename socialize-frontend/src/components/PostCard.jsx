// src/components/PostCard.jsx

import { useEffect, useState } from "react";
import {
  likePost,
  unlikePost,
  getLikeStatus,
  followUser,
  unfollowUser,
  deletePost,
  getUserById
} from "../services/api";
import CommentBox from "./CommentBox";
import { subscribeToLikes } from "../services/websocket";
import { jwtDecode } from "jwt-decode";

function PostCard({ post, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Store latest user details so updated profile image is shown
  const [postUser, setPostUser] = useState({
    name: post.userName,
    profileImageUrl: post.profileImageUrl || null
  });

  // Get current logged-in user ID
  let currentUserId = null;

  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      currentUserId = decoded.userId;
    }
  } catch {
    console.error("JWT decode failed");
  }

  const isOwner =
    Number(post.userId) === Number(currentUserId);

  // Load latest user data (important after profile image update)
  useEffect(() => {
    const loadPostUser = async () => {
      try {
        const userData = await getUserById(post.userId);

        setPostUser({
          name: userData.name,
          profileImageUrl:
            userData.profileImageUrl || null
        });
      } catch (error) {
        console.error(
          "Failed to load post user data",
          error
        );
      }
    };

    loadPostUser();
  }, [post.userId]);

  // Load like status
  useEffect(() => {
    getLikeStatus(post.postId).then((data) => {
      setLiked(data.liked);
      setCount(data.count);
    });
  }, [post.postId]);

  // Real-time likes
  useEffect(() => {
    const interval = setInterval(() => {
      subscribeToLikes(post.postId, (event) => {
        setCount(event.count);
      });
    }, 300);

    return () => clearInterval(interval);
  }, [post.postId]);

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikePost(post.postId);
        setLiked(false);
      } else {
        await likePost(post.postId);
        setLiked(true);
      }
    } catch (e) {
      console.error("Like failed", e);
    }
  };

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(post.userId);
        setFollowing(false);
      } else {
        await followUser(post.userId);
        setFollowing(true);
      }
    } catch (e) {
      console.error("Follow failed", e);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      await deletePost(post.postId);

      if (onDelete) {
        onDelete(post.postId);
      }
    } catch (error) {
      console.error("Failed to delete post", error);
      alert("Failed to delete post");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {/* Profile Image */}
          {postUser.profileImageUrl ? (
            <img
              src={postUser.profileImageUrl}
              alt={postUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
              {postUser.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Username */}
          <p className="font-semibold text-gray-800">
            {postUser.name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isOwner && (
            <button
              onClick={handleFollow}
              className="text-sm text-blue-500 hover:underline"
            >
              {following ? "Following" : "Follow"}
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-sm text-red-500 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-gray-700 mb-3 leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Post Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full rounded-lg mb-3 max-h-[500px] object-cover"
        />
      )}

      <hr className="mb-3" />

      {/* Actions */}
      <div className="flex items-center gap-6 text-sm mb-3">
        <button
          onClick={handleLike}
          className="flex items-center gap-1 text-red-500 hover:scale-105 transition"
        >
          {liked ? "❤️" : "🤍"}
          <span>{count}</span>
        </button>

        <button
          onClick={() =>
            setShowComments(!showComments)
          }
          className="text-gray-500 hover:text-blue-500"
        >
          💬 Comments
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentBox postId={post.postId} />
      )}
    </div>
  );
}

export default PostCard;