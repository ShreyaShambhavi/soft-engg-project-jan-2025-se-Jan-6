// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Eye } from 'lucide-react';

const Signup = () => {
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
          {/*<span className="ml-2 text-sm font-medium">
            IIT Madras
            <br />
            Degree in Data Science and Applications
          </span>*/}
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
                
                <form className="space-y-6">
                <div>
                    <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                </div>
                
                <div>
                    <input
                    type="email"
                    placeholder="Email ID"
                    className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                </div>
                
                <div className="relative">
                    <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <Eye className="absolute right-3 top-3 text-gray-400" size={20} />
                </div>
                
                <div>
                    <select className="w-full p-3 bg-gray-50 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500">
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    </select>
                </div>
                
                <button className="w-full p-3 bg-red-600 text-white rounded-md hover:bg-red-700">
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