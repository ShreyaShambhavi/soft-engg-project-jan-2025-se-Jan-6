// eslint-disable-next-line no-unused-vars
import React from 'react';


const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
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
        
        <div className="flex items-center space-x-6">
          <a href="#" className="text-red-500 border-b-2 border-red-500">Home</a>
          <a href="#" className="text-gray-600">Academics</a>
          <a href="#" className="text-gray-600">Admissions</a>
          <a href="#" className="text-gray-600">Student Life</a>
          <a href="#" className="text-gray-600">About</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-red-500" onClick={() => window.location.href = '/signup'} >Sign up </button>
          <button className="px-4 py-2 text-white bg-red-500 rounded-md" onClick={() => window.location.href = '/login'}>Log in</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center mt-[-5%] h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 gap-8 items-center">
            {/* Left Column - Text Content */}
            <div>
              <h1 className="text-5xl font-bold text-red-500 mb-4">
                Study from anywhere,
                <br />
                at your own pace!
              </h1>
              <p className="text-gray-600 mb-8">
                IIT Madras, India&apos;s top technical institute, welcomes you to the Four year
                Bachelor of Science (BS) Degree in Data Science and Applications.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Applications Open For May 2025 Batch</span>
                  <button className="px-6 py-2 bg-red-500 text-white rounded-md" onClick={() => window.location.href = '/signup'}>
                    Apply Now
                  </button>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="relative">
              <div className="flex justify-center">
                <img 
                  src="./Landing Page Graphic.png" 
                  alt="AI and Data Science Illustration" 
                  className="w-full max-w-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;