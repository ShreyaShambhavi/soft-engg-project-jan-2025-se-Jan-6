// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Pencil } from 'lucide-react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-white">
    {/* Navigation Bar */}
    <nav className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center">
        <img onClick={() => window.location.href = '/'}
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
        <button>
          <img 
            src="./Search.png" 
            alt="Search" 
            className="w-8 h-8"
          />
        </button>
        <button>
          <img 
            src="./Notif.png" 
            alt="Notifications" 
            className="w-8 h-8"
          />
        </button>
        <button>
          <img 
            src="./Avatar.png" 
            alt="Profile" 
            className="w-8 h-8"
          />
        </button>
      </div>
    </nav>
    <div className="flex flex-col items-center justify-center mt-[-10%] h-screen">
        <div className="max-w-10xl mx-auto">
            <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="col-span-2 space-y-8">
                {/* Profile Header */}
                <div className="bg-white rounded-lg p-6">
                <div className="flex items-center space-x-6">
                    <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center">
                    <div className="text-white text-4xl">
                        <image>
                            <img 
                            src="./Avatar.png"
                            alt="Profile Picture"
                            className="w-30 h-30 rounded-full">
    
                            </img>
                        </image>
                    </div>
                    </div>
                    <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-4">UserName</h2>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div className="bg-yellow-400 h-2 rounded-full w-3/4"></div>
                    </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 mt-8 text-center">
                    <div>
                    <div className="font-semibold text-xl">50</div>
                    <div className="text-gray-500">Tasks Completed</div>
                    </div>
                    <div>
                    <div className="font-semibold text-xl">100</div>
                    <div className="text-gray-500">Hours</div>
                    </div>
                    <div>
                    <div className="font-semibold text-xl">2000</div>
                    <div className="text-gray-500">Points</div>
                    </div>
                </div>
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-6">Achievements</h3>
                <div className="flex space-x-8">
                    <div className="p-2 border rounded-full text-yellow-500 flex items-center justify-center w-14 h-14">
                        <div className="w-10 h-10 flex items-center justify-center text-2xl">🏅</div>
                    </div>
                    <div className="p-2 border rounded-full text-purple-500 flex items-center justify-center w-14 h-14">
                        <div className="w-10 h-10 flex items-center justify-center text-2xl">🎯</div>
                    </div>
                    <div className="p-2 border rounded-full text-green-500 flex items-center justify-center w-14 h-14">
                        <div className="w-10 h-10 flex items-center justify-center text-2xl">⭐</div>
                    </div>
                </div>
                </div>
            </div>

            {/* Right Column - About */}
            <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-6">About</h3>
                <div className="space-y-4">
                <div>
                    <div className="text-gray-500 mb-1">Email ID</div>
                    <div className="flex items-center justify-between">
                    <div>2xxxxxxxx@ds.study.iitm.ac.in</div>
                    <button className="text-gray-400"><Pencil size={16} /></button>
                    </div>
                </div>
                <div>
                    <div className="text-gray-500 mb-1">Phone</div>
                    <div className="flex items-center justify-between">
                    <div>+91 **********</div>
                    <button className="text-gray-400"><Pencil size={16} /></button>
                    </div>
                </div>
                <div>
                    <div className="text-gray-500 mb-1">DoB</div>
                    <div className="flex items-center justify-between">
                    <div>DD-MM-YYYY</div>
                    <button className="text-gray-400"><Pencil size={16} /></button>
                    </div>
                </div>
                </div>
            </div>
            </div>
            </div>
            </div>
            </div>
  );
};

export default Profile;
