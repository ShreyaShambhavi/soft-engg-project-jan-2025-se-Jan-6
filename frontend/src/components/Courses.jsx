/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Home, LayoutDashboard, BookCopy } from "lucide-react";

const Courses = () => {
  const [activeIcon, setActiveIcon] = useState('Home');
  const [userCourses, setUserCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserCourses();
  }, []);

  const fetchUserCourses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/courses', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setUserCourses(data.courses);
    } catch (error) {
      console.error('Error fetching user courses:', error);
    }
  };

  const sidebarIcons = [
    { icon: Home, label: 'Home', url: "/" },
    { icon: LayoutDashboard, label: 'Dashboard', url: "/dashboard" },
    { icon: BookCopy, label: 'Courses', url: "/courses" },
  ];

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
          <button>
            <img
              src="/Search.png"
              alt="Search"
              className="w-8 h-8"
            />
          </button>
          <button className="cursor-pointer" onClick={() => window.location.href = '/announcements'}>
            <img
              src="/Notif.png"
              alt="Notifications"
              className="w-8 h-8"
            />
          </button>
          <button className="cursor-pointer" onClick={() => window.location.href = '/profile'}>
            <img
              src="/Avatar.png"
              alt="Profile"
              className="w-8 h-8"
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
                window.location.href = item.url;
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

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Centered heading and CGPA with more spacing */}
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-semibold mb-2">Courses</h2>
              <div className="text-red-500 font-medium">CGPA: 9.89</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {userCourses.length === 0 ? (
                <div className="col-span-4 text-center">
                  <p className="text-lg font-medium">You have no courses. Please add a course to get started.</p>
                </div>
              ) : (
                userCourses.map((course, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg overflow-hidden shadow cursor-pointer"
                    onClick={() => navigate(`/courses/${course.name}`)}
                  >
                    {/* Course Image */}
                    <div className="bg-indigo-900 p-1">
                      <img
                        src="/courses.png"
                        alt={course.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>

                    {/* Course Info */}
                    <div className="p-4 bg-yellow-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{course.name}</h3>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;