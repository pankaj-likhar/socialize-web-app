import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const token = await loginUser(email, password);
      localStorage.setItem("token", token);
      navigate("/");
    } catch {
      alert("Login failed");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
    
    <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
      
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Welcome Back 👋
      </h2>

      <form onSubmit={handleLogin} className="space-y-5">

        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>

      <p className="text-sm text-center text-gray-500 mt-4">
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-blue-500 cursor-pointer hover:underline"
        >
          Register
        </span>
      </p>

    </div>
  </div>
);
}

export default Login;