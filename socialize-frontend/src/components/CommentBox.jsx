import { useEffect, useState } from "react";
import { getComments, addComment } from "../services/api";

function CommentBox({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    const data = await getComments(postId);
    setComments(data.content || []);
  };

  const handleAddComment = async () => {
    if (!text.trim()) return;

    await addComment(postId, text);
    setText("");
    loadComments(); // refresh
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