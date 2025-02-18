// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Home, Calendar, Users, Download, BookOpen, X, Pencil, Undo, RotateCw } from 'lucide-react';

const CourseNotes = () => {
  const [activeIcon, setActiveIcon] = useState('Books'); // Default active icon is 'Books'
  const [activeNoteId, setActiveNoteId] = useState(1); // Default active note

  const notesList = [
    { id: 1, title: 'Deep Learning Notes' },
    { id: 2, title: 'Software Engineering Notes' },
    { id: 3, title: 'Software Testing Notes' },
    { id: 4, title: 'Artificial Intelligence Notes' },
    { id: 5, title: 'Software Testing Notes' },
  ];

  const sidebarIcons = [
    { icon: Home, label: 'Home' },
    { icon: Calendar, label: 'Calendar' },
    { icon: Users, label: 'Users' },
    { icon: BookOpen, label: 'Books' },
    { icon: Download, label: 'Download' }
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
            <img src="/Search.png" alt="Search" className="w-8 h-8" />
          </button>
          <button onClick={() => window.location.href = '/announcements'}>
            <img src="/Notif.png" alt="Notifications" className="w-8 h-8" />
          </button>
          <button onClick={() => window.location.href = '/profile'}>
            <img src="/Avatar.png" alt="Profile" className="w-8 h-8" />
          </button>
        </div>
      </nav>

      <div className="flex">
        {/* Icon Sidebar */}
        <div className="w-16 border-r min-h-screen pt-6 flex flex-col items-center">
          {sidebarIcons.map((item) => (
            <button 
              key={item.label}
              onClick={() => setActiveIcon(item.label)} // Set active icon on click
              className={`w-full p-4 flex flex-col items-center transition-colors ${
                activeIcon === item.label 
                  ? 'text-red-600 bg-red-50'  // Highlight active icon
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </div>

        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r min-h-screen p-4">
          <h2 className="text-xl font-semibold mb-6">Notes Space</h2>
          
          <div className="space-y-3">
            {notesList.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full px-4 py-2 rounded-md text-left flex items-center transition-colors ${
                  activeNoteId === note.id 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  activeNoteId === note.id ? 'bg-red-600' : 'bg-gray-400'
                }`}></span>
                {note.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white">
          {/* Header */}
          <div className="border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="text-sm text-gray-500">Deep Learning / Week 4</div>
                <h1 className="text-xl font-semibold">CNN</h1>
                <div className="text-sm text-gray-500">Date : 04 Feb 2024</div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                  Continue
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Notes Area */}
          <div className="p-6 bg-gray-50 min-h-[calc(100vh-10rem)]">
            {/* Empty state or rich text editor would go here */}
          </div>

          {/* Bottom Toolbar */}
          <div className="fixed bottom-6 right-6 flex items-center space-x-4">
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
              <Pencil size={20} />
            </button>
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
              <Undo size={20} />
            </button>
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
              <RotateCw size={20} />
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700">
              AI Context
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseNotes;
