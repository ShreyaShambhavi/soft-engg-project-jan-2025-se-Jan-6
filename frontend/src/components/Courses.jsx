// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Bell, Home, Calendar, Users, BookOpen, Download, X, LayoutDashboard, BookCopy } from "lucide-react";

const Courses = () => {
  const [activeIcon, setActiveIcon] = useState('Home');
  const courses = [
    {
      title: 'Artificial Intelligence',
      isNew: true,
    },
    {
      title: 'Deep Learning',
      isNew: true,
    },
    {
      title: 'Software Engineering',
      isNew: true,
    },
    {
      title: 'Software Testing',
      isNew: true,
    },
  ];
  const sidebarIcons = [
    { icon: Home, label: 'Home', url: "/"},
    { icon: LayoutDashboard, label: 'Dashboard', url: "/dashboard"},
    { icon: BookCopy, label: 'Courses', url: "/courses" },
  ];

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
          <button className="cursor-pointer" onClick={() => window.location.href = '/announcements'}>
            <img 
              src="./Notif.png" 
              alt="Notifications" 
              className="w-8 h-8"
            />
          </button>
          <button className="cursor-pointer" onClick={() => window.location.href = '/profile'}>
            <img 
              src="./Avatar.png" 
              alt="Profile" 
              className="w-8 h-8"
            />
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Icon Sidebar - Exactly matching the reference */}
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
 <div className="flex flex-col items-center justify-center mt-[-10%] h-screen ml-2">
      <div className="max-w-10xl mx-auto">
        <div className="mb-8 w-full ml-4">
          <h2 className="text-2xl font-semibold">Courses</h2>
          <div className="text-red-500 font-medium">CGPA: 9.89</div>
        </div>

      <div className="grid grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden">
            {/* Course Image */}
            <div className="bg-indigo-900 p-1">
              <img 
                src="./courses.png" 
                alt={course.title}
                className="w-80 h-60 object-cover"
              />
            </div>
            
            {/* Course Info */}
            <div className="p-4 bg-yellow-100">
              {course.isNew && (
                <div className="text-sm text-red-500 mb-1">New Course</div>
              )}
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{course.title}</h3>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Courses;
