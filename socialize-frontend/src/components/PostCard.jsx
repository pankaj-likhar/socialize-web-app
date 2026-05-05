import { useEffect, useState } from "react";
import { likePost, unlikePost, getLikeStatus } from "../services/api";
import { followUser, unfollowUser } from "../services/api";
import CommentBox from "./CommentBox";

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Like status
  useEffect(() => {
    getLikeStatus(post.postId).then(data => {
      setLiked(data.liked);
      setCount(data.count);
    });
  }, [post.postId]);

  // Like handler
  const handleLike = async () => {
    if (liked) {
      await unlikePost(post.postId);
      setLiked(false);
      setCount(count - 1);
    } else {
      await likePost(post.postId);
      setLiked(true);
      setCount(count + 1);
    }
  };

  // Follow handler
  const handleFollow = async () => {
    if (following) {
      await unfollowUser(post.userId);
      setFollowing(false);
    } else {
      await followUser(post.userId);
      setFollowing(true);
    }
  };

  return (
  <div className="bg-white rounded-xl shadow-md p-4">

    {/* 🔹 Header */}
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
          {post.userName.charAt(0).toUpperCase()}
        </div>

        {/* Username */}
        <div>
          <p className="font-semibold text-gray-800">
            {post.userName}
          </p>
        </div>
      </div>

      {/* Follow Button */}
      <button
        onClick={handleFollow}
        className="text-sm text-blue-500 hover:underline"
      >
        {following ? "Following" : "Follow"}
      </button>
    </div>

    {/* 🔹 Content */}
    <p className="text-gray-700 mb-3 leading-relaxed">
      {post.content}
    </p>

    {/* 🔹 Divider */}
    <hr className="mb-3" />

    {/* 🔹 Actions */}
    <div className="flex items-center gap-6 text-sm mb-3">
      <button
        onClick={handleLike}
        className="flex items-center gap-1 text-red-500 hover:scale-105 transition"
      >
        {liked ? "❤️" : "🤍"} 
        <span>{count}</span>
      </button>

     <button
  onClick={() => setShowComments(!showComments)}
  className="text-gray-500 hover:text-blue-500"
>
  💬 Comments
</button>
    </div>

    {/* 🔹 Comments */}
    {showComments && <CommentBox postId={post.postId} />}

  </div>
);
}

export default PostCard;