import { useState } from "react";
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";  
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { login } = useAuth();  
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);  
      navigate("/dashboard");        
    } catch (err) {
      setError(err.message);         
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <img onClick={() => window.location.href = '/'}
            src="/IITm.png" 
            alt="IIT Madras Logo" 
            className="w-60 h-12 rounded"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <a href="/signup" className="text-gray-600">Sign up</a>
          <a href="/login" className="text-red-500">Log in</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)] px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Login Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Log in</h2>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}  

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="email"
                    placeholder="Email ID"
                    className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} 
                  </button>

              
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-red-600" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-red-600">Forgot password?</a>
                </div>
                
                <button type="submit" className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Log in
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">Or log in with</p>
                <div className="flex justify-center space-x-4 mt-4">
                  <button className="p-2 border rounded-full">
                    <img src="/G.png" alt="Google" className="w-15 h-6" />
                  </button>
                  <button className="p-2 border rounded-full">
                    <img src="/Fb.png" alt="Facebook" className="w-15 h-6" />
                  </button>
                  <button className="p-2 border rounded-full">
                    <img src="/Apple.png" alt="Microsoft" className="w-15 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Background Image */}
            <div className="relative h-full rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-red-600"></div>
              <img 
                src="/SIgnup.png"
                alt="Hexagonal Pattern"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
