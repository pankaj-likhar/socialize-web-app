import { useEffect, useState } from "react";
import { getComments, addComment } from "../services/api";
import { subscribeToComments } from "../services/websocket"; // ✅ ADD

function CommentBox({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  // 🔹 Load initial comments (only once)
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    const data = await getComments(postId);
    setComments(data.content || []);
  };

  // 🔥 REAL-TIME SUBSCRIPTION
  useEffect(() => {
    const interval = setInterval(() => {
      subscribeToComments(postId, (event) => {
        setComments(prev => {
          // ❗ prevent duplicates
          if (prev.some(c => c.commentId === event.comment.commentId)) {
            return prev;
          }
          return [event.comment, ...prev];
        });
      });
    }, 300);

    return () => clearInterval(interval);
  }, [postId]);

  // 🔹 Add comment
  const handleAddComment = async () => {
    if (!text.trim()) return;

    await addComment(postId, text);
    setText("");

    // ❌ REMOVE THIS
    // loadComments();
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
      />
      <button onClick={handleAddComment}>Send</button>

      <div style={{ marginTop: "10px" }}>
        {comments.map(c => (
          <div key={c.commentId}>
            <b>{c.userName}</b>: {c.commentText}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentBox;