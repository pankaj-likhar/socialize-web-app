import { useEffect, useState } from "react";
import { getFeed, createPost } from "../services/api";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  const [page, setPage] = useState(0);       // 🔥 current page
  const [hasMore, setHasMore] = useState(true); // 🔥 more data?

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    if (page === 0) return;
    loadFeed();
  }, [page]);

  const loadFeed = async () => {
    if (!hasMore) return;

    try {
      const data = await getFeed(page);

      setPosts(prev => [...prev, ...(data.content || [])]); // 🔥 append

      setHasMore(!data.last); // backend gives "last"
    } catch (e) {
      console.error("Failed to load feed");
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    await createPost(newPost);
    setNewPost("");

    // 🔥 reload from scratch
    setPosts([]);
    setPage(0);
    setHasMore(true);

    const data = await getFeed(0);
    setPosts(data.content || []);
    setHasMore(!data.last);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto mt-6 px-4">

        {/* Create Post */}
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

        {/* 🔥 Load More Button */}
        {hasMore && (
          <div className="text-center mt-4">
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg"
            >
              Load More
            </button>
          </div>
        )}

        {!hasMore && (
          <p className="text-center text-gray-500 mt-4">
            No more posts
          </p>
        )}

      </div>
    </div>
  );
}

export default Home;