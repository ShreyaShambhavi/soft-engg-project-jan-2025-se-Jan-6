/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Pencil, User, Mail, Phone, Calendar, UserCircle } from 'lucide-react';
import { Home, LayoutDashboard, BookCopy } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import EditCourses from './EditCourses';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isEditCoursesOpen, setIsEditCoursesOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState('Home');

  const sidebarIcons = [
    { icon: Home, label: 'Home', url: "/" },
    { icon: LayoutDashboard, label: 'Dashboard', url: "/dashboard" },
    { icon: BookCopy, label: 'Courses', url: "/courses" },
  ];

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUser(data);
      setSelectedCourses(data.courses);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/all-courses', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch all courses');
      }
      const data = await response.json();
      setAllCourses(data.courses);
    } catch (error) {
      console.error('Error fetching all courses:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAllCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center">
          <img 
            onClick={() => window.location.href = '/'}
            src="./IITm.png" 
            alt="IIT Madras Logo" 
            className="w-60 h-12 rounded cursor-pointer"
          />
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="hover:bg-gray-100 p-2 rounded-full transition">
            <img 
              src="./Search.png" 
              alt="Search" 
              className="w-6 h-6"
            />
          </button>
          <button 
            className="hover:bg-gray-100 p-2 rounded-full transition"
            onClick={() => navigate('/announcements')}
          >
            <img 
              src="./Notif.png" 
              alt="Notifications" 
              className="w-6 h-6"
            />
          </button>
          <button 
            className="hover:bg-gray-100 p-2 rounded-full transition"
            onClick={() => navigate('/profile')}
          >
            <img 
              src="./Avatar.png" 
              alt="Profile" 
              className="w-8 h-8 rounded-full border-2 border-red-500"
            />
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Icon Sidebar */}
        <div className="w-16 border-r min-h-screen pt-6 flex flex-col items-center">
          {sidebarIcons.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveIcon(item.label);
                navigate(item.url);
              }}
              className={`w-full p-4 flex flex-col items-center transition-colors ${
                activeIcon === item.label
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </div>

        {/* Main Content with adjusted padding and max-width */}
        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {/* Rest of your component remains the same */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Header */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6 md:mb-0 shadow-md">
                      <img 
                        src="./Avatar.png"
                        alt="Profile"
                        className="w-28 h-28 rounded-full border-4 border-white"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-3xl font-bold mb-2">{user ? user.username : 'UserName'}</h2>
                      <p className="text-gray-500 mb-4">{user ? user.roles.map(role => role.name).join(', ') : 'Student'}</p>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-400 h-2 rounded-full w-3/4"></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">75% Progress</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 mt-10 text-center">
                    <div className="p-4 hover:bg-gray-50 rounded-lg transition">
                      <div className="font-bold text-2xl text-red-600">50</div>
                      <div className="text-gray-500 text-sm mt-1">Tasks Completed</div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 rounded-lg transition">
                      <div className="font-bold text-2xl text-blue-600">100</div>
                      <div className="text-gray-500 text-sm mt-1">Hours</div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 rounded-lg transition">
                      <div className="font-bold text-2xl text-green-600">2000</div>
                      <div className="text-gray-500 text-sm mt-1">Points</div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold mb-6">Achievements</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl text-yellow-500 flex flex-col items-center justify-center w-24 h-24 shadow-sm hover:shadow transition">
                      <div className="text-3xl mb-2">🏅</div>
                      <div className="text-xs font-medium">Top Scorer</div>
                    </div>
                    <div className="p-4 border border-purple-200 bg-purple-50 rounded-xl text-purple-500 flex flex-col items-center justify-center w-24 h-24 shadow-sm hover:shadow transition">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="text-xs font-medium">Fast Learner</div>
                    </div>
                    <div className="p-4 border border-green-200 bg-green-50 rounded-xl text-green-500 flex flex-col items-center justify-center w-24 h-24 shadow-sm hover:shadow transition">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="text-xs font-medium">Perfect Score</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - About */}
              <div className="bg-white rounded-xl p-8 shadow-sm h-fit">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <User size={20} className="mr-2 text-red-500" />
                  About
                </h3>
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="text-gray-500 text-sm mb-2 flex items-center">
                      <Mail size={16} className="mr-2" />
                      Email ID
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{user ? user.email : '2xxxxxxxx@ds.study.iitm.ac.in'}</div>
                      <button className="text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100 rounded transition">
                        <Pencil size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <div className="text-gray-500 text-sm mb-2 flex items-center">
                      <Phone size={16} className="mr-2" />
                      Phone
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">+91 **********</div>
                      <button className="text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100 rounded transition">
                        <Pencil size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <div className="text-gray-500 text-sm mb-2 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      Date of Birth
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">DD-MM-YYYY</div>
                      <button className="text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100 rounded transition">
                        <Pencil size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <div className="text-gray-500 text-sm mb-2 flex items-center">
                      <UserCircle size={16} className="mr-2" />
                      Role
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                      {user ? user.roles : 'not available'}
                        {user ? user.roles.map(role => role.name).join(', ') : 'Student'}
                        </div>
                      <button className="text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100 rounded transition">
                        
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <LogoutButton className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Courses Management */}
            <div className="bg-white rounded-xl p-8 shadow-sm mt-8">
              <h3 className="text-xl font-semibold mb-6">Manage Courses</h3>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                onClick={() => setIsEditCoursesOpen(true)}
              >
                Edit Courses
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditCoursesOpen && (
        <EditCourses
          user={user}
          allCourses={allCourses}
          selectedCourses={selectedCourses}
          onClose={(updatedUser) => {
            setIsEditCoursesOpen(false);
            if (updatedUser) {
              setUser(updatedUser);
              setSelectedCourses(updatedUser.courses);
            }
          }}
        />
      )}
    </div>
  );
};

export default Profile;