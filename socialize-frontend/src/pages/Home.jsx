import { useEffect, useRef, useState } from "react";
import { getFeed, createPost } from "../services/api";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fileInputRef = useRef(null);

  // Load first page
  useEffect(() => {
    loadFeed(0, false);
  }, []);

  // Load more pages
  useEffect(() => {
    if (page === 0) return;
    loadFeed(page, true);
  }, [page]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const loadFeed = async (pageToLoad = 0, append = false) => {
    try {
      const data = await getFeed(pageToLoad);

      if (append) {
        setPosts((prev) => [
          ...prev,
          ...(data.content || [])
        ]);
      } else {
        setPosts(data.content || []);
      }

      setHasMore(!data.last);
    } catch (error) {
      console.error("Failed to load feed", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    // Revoke previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setSelectedImage(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreatePost = async () => {
    // Require either content or image
    if (!newPost.trim() && !selectedImage) {
      return;
    }

    try {
      setLoading(true);

      await createPost(newPost, selectedImage);

      // Reset form fields
      setNewPost("");
      setSelectedImage(null);

      // Remove preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Reload feed from first page
      const data = await getFeed(0);
      setPosts(data.content || []);
      setPage(0);
      setHasMore(!data.last);
    } catch (error) {
      console.error("Failed to create post", error);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) =>
      prev.filter((post) => post.postId !== postId)
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto mt-6 px-4">
        {/* Create Post */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <textarea
            className="w-full border p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            rows="3"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
          />

          {/* Image Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-3"
          />

          {/* Image Preview */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-96 object-cover rounded-lg mb-3"
            />
          )}

          {/* Post Button */}
          <button
            onClick={handleCreatePost}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              onDelete={handleDeletePost}
            />
          ))}
        </div>

        {/* Load More */}
        {hasMore && posts.length > 0 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg"
            >
              Load More
            </button>
          </div>
        )}

        {/* No More Posts */}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-gray-500 mt-4">
            No more posts
          </p>
        )}
      </div>
    </div>
  );
}

export default Home;