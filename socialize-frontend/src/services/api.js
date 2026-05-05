const BASE_URL = "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token
  };
};

// 🔐 Feed (requires token)
export const getFeed = async (page = 0, size = 5) => {
  const response = await fetch(
    `${BASE_URL}/posts/feed?page=${page}&size=${size}`,
    { headers: getAuthHeaders() }
  );
  return response.json();
};

export const createPost = async (content) => {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content })
  });

  return response.json();
};

export const likePost = async (postId) => {
  return fetch(`${BASE_URL}/likes/${postId}`, {
    method: "POST",
    headers: getAuthHeaders()
  });
};

export const unlikePost = async (postId) => {
  return fetch(`${BASE_URL}/likes/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
};

export const getLikeStatus = async (postId) => {
  const res = await fetch(`${BASE_URL}/likes/${postId}`, {
    headers: getAuthHeaders()
  });
  return res.json(); // { count, liked }
};

export const getComments = async (postId) => {
  const res = await fetch(`${BASE_URL}/comments/${postId}`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const addComment = async (postId, text) => {
  const res = await fetch(`${BASE_URL}/comments/${postId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ commentText: text })
  });
  return res.json();
};

export const followUser = async (followeeId) => {
  const res = await fetch(`${BASE_URL}/follow?followeeId=${followeeId}`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  return res.json();
};


// export const getFollowStats = async (userId) => {
//   const res = await fetch(`${BASE_URL}/follow/stats/${userId}`);
//   return res.json(); // { followers, following }
// };

export const loginUser = async (email, password) => {
  const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return response.text(); // ⚠️ important (not json)
};

export const registerUser = async (user) => {
  const res = await fetch("http://localhost:8080/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  return res.json();
};

export const getAllUsers = async () => {
  const res = await fetch("http://localhost:8080/api/users");
  return res.json();
};

export const getFollowing = async () => {
  const res = await fetch(`${BASE_URL}/follow/following/me`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const unfollowUser = async (followeeId) => {
  const res = await fetch(`${BASE_URL}/follow?followeeId=${followeeId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return res.text();
};

export const getUserById = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  return res.json();
};

export const getFollowStats = async (userId) => {
  const res = await fetch(`${BASE_URL}/follow/stats/${userId}`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

// api.js
export const getCurrentUser = async () => {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: getAuthHeaders()
  });
  return res.json(); // { userId, name, email }
};