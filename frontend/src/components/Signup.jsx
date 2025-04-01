// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use useAuth hook
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/all-courses', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setAllCourses(data.courses);
    } catch (error) {
      console.error('Error fetching all courses:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // First, create the user account
      const signupResponse = await fetch('http://127.0.0.1:5000/api/v1/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role, courses }),
        credentials: 'include',
      });

      if (!signupResponse.ok) {
        throw new Error(await signupResponse.text());
      }

      try {
        await login(email, password); 
        
        navigate('/dashboard');
      } catch (loginError) {
        throw new Error('Signup successful but could not log in automatically. Please log in manually.');
      }
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Signup successful')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const toggleCourseSelection = (courseName) => {
    if (courses.includes(courseName)) {
      setCourses(courses.filter(c => c !== courseName));
    } else {
      setCourses([...courses, courseName]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <img 
            src="./IITm.png" 
            alt="IIT Madras Logo" 
            className="w-60 h-12 rounded"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <a href="#" className="text-red-500" onClick={() => window.location.href = '/signup'}>Sign up</a>
          <a href="#" className="text-gray-600" onClick={() => window.location.href = '/login'}>Log in</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex justify-center items-center min-h-[calc(100vh-5rem)] px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Signup Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-8">Create An Account</h2>
              
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    placeholder="Email ID"
                    className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Eye className="absolute right-3 top-3 text-gray-400" size={20} />
                </div>
                
                <div>
                  <select
                    className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="professor">Professor</option>
                    <option value="instructor">Instructor</option>
                    <option value="ta">TA</option>
                    <option value="admin">Admin</option>
                    <option value="dm">DM</option>
                  </select>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-left flex items-center justify-between"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>
                      {courses.length === 0 
                        ? 'Select courses' 
                        : `${courses.length} course${courses.length > 1 ? 's' : ''} selected`}
                    </span>
                    <ChevronDown size={20} className={`transition ${dropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {allCourses && allCourses.map((course, index) => (
                        <div 
                          key={index} 
                          className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                            courses.includes(course.name) ? 'bg-red-50 text-red-600' : ''
                          }`}
                          onClick={() => toggleCourseSelection(course.name)}
                        >
                          <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                            courses.includes(course.name) ? 'bg-red-500 border-red-500' : 'border-gray-300'
                          }`}>
                            {courses.includes(course.name) && <Check size={12} color="white" />}
                          </div>
                          {course.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button type="submit" className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Sign up
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">OR</p>
                <div className="flex justify-center space-x-4 mt-4">
                  <button className="p-2 border rounded-full">
                    <img src="./G.png" alt="Google" className="w-15 h-6" />
                  </button>
                  <button className="p-2 border rounded-full">
                    <img src="./Fb.png" alt="Facebook" className="w-15 h-6" />
                  </button>
                  <button className="p-2 border rounded-full">
                    <img src="./Apple.png" alt="Microsoft" className="w-15 h-6" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right Column - Hexagonal Pattern */}
            <div className="relative h-full rounded-lg overflow-hidden">
              {/* Red background */}
              <div className="absolute inset-0 bg-red-600"></div>
              {/* Hexagonal pattern */}
              <img 
                src="./SIgnup.png"
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

export default Signup;