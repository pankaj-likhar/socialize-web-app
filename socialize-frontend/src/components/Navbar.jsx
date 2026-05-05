import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();

  let user = null;

  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);

      user = {
        userId: decoded.userId,
        name: decoded.name || decoded.sub
      };
    }
  } catch {
    console.error("JWT decode failed");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-white shadow px-6 py-3 flex justify-between items-center">

      {/* LEFT → Logo only */}
      <div>
        <h1
          onClick={() => navigate("/")}
          className="text-xl font-bold cursor-pointer text-blue-600"
        >
          Socialize
        </h1>
      </div>

      {/* RIGHT → Everything else */}
      <div className="flex items-center gap-6">

        {/* Navigation */}
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-blue-500"
        >
          Home
        </button>

        <button
          onClick={() => navigate("/users")}
          className="text-gray-600 hover:text-blue-500"
        >
          Users
        </button>

        {/* Profile */}
        {user && (
  <div className="flex items-center gap-2 px-3 py-1">
    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
      {user.name.charAt(0).toUpperCase()}
    </div>

    <span className="text-gray-700 font-medium">
      {user.name}
    </span>
  </div>
)}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;