import { useEffect, useState } from "react";
import { getFeed, createPost } from "../services/api";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    const data = await getFeed();
    setPosts(data.content || []);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    await createPost(newPost);
    setNewPost("");
    loadFeed();
  };

  return (
  <div className="bg-gray-100 min-h-screen">
    <Navbar />

    <div className="max-w-xl mx-auto mt-6 px-4">

      {/* Create Post Box */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <input
          className="w-full border p-2 rounded-lg mb-2 focus:ring-2 focus:ring-blue-400 outline-none"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
        />

        <button
          onClick={handleCreatePost}
          className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600"
        >
          Post
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.postId} post={post} />
        ))}
      </div>

    </div>
  </div>
);
}

export default Home;