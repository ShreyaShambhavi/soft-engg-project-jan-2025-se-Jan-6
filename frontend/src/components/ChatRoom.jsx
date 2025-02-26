/* eslint-disable no-unused-vars */
import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Search, Bell, MoreHorizontal, Paperclip, Image, MapPin, Send, ChevronDown, X, Download } from 'lucide-react';

const StudyChatRoom = () => {
  const [activeTab, setActiveTab] = useState('group');
  
  const chatRooms = [
    { id: 'SE', name: 'Software Engineering', time: '08:00', lastMessage: 'Can someone explain...' },
    { id: 'AI', name: 'Artificial Intelligence', time: 'Feb 1st', lastMessage: 'Week 3 GA Ques 4...' },
    { id: 'DL', name: 'Deep Learning', time: 'Jan 25th', lastMessage: 'Neural networks using py...' },
    { id: 'AT', name: 'Algorithmic Thinking', time: '10:18', lastMessage: 'Graph algorithms used for...' },
  ];

  const members = [
    { id: 'A', name: 'Adarsh Pradhan', color: 'bg-red-500', role: 'Admin' },
    { id: 'S', name: 'Satyaki Goswami', color: 'bg-yellow-500' },
    { id: 'H', name: 'Himanshu Singh', color: 'bg-green-500' },
  ];

  const files = [
    { name: 'week_3.pdf', size: '120 KB' },
    { name: 'img_2.png', size: '140 KB' },
    { name: 'code.py', size: '560 KB' },
    { name: 'agile.doc', size: '1.5 MB' },
    { name: 'week_3.pdf', size: '120 KB' },
    { name: 'app.py', size: '85 KB' },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-72 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <img src="/IITm.png" alt="IIT Madras Logo" className="w-60 h-12 rounded" />
            {/*<div className="text-sm">
              <div className="font-semibold">IIT Madras</div>
              <div className="text-xs text-gray-600">Degree in Data Science and Applications</div>
            </div>*/}
          </div>
        </div>

        {/* Study Chat Rooms */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Study Chat Rooms</h2>
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-1 rounded-full text-sm ${activeTab === 'personal' ? 'bg-red-500 text-white' : 'border'}`}
            >
              Personal
            </button>
            <button 
              onClick={() => setActiveTab('group')}
              className={`px-4 py-1 rounded-full text-sm ${activeTab === 'group' ? 'bg-red-500 text-white' : 'border'}`}
            >
              Group
            </button>
          </div>

          {/* Chat List */}
          <div className="space-y-2">
            {chatRooms.map((room) => (
              <div key={room.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className={`w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white`}>
                  {room.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">{room.name}</div>
                    <div className="text-xs text-gray-500">{room.time}</div>
                  </div>
                  <div className="text-sm text-gray-500 truncate">{room.lastMessage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
              SE
            </div>
            <div>
              <div className="font-semibold">Software Engineering</div>
              <div className="text-sm text-gray-500">250 participants</div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Message bubbles would go here */}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex gap-2">
              <button className="text-gray-400 hover:text-gray-600">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <Image className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <MapPin className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none"
            />
            <button className="text-red-500 hover:text-red-600">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Chat Details */}
      <div className="w-80 border-l">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Chat Details</h2>
          <button className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Members Section */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Members</h3>
            <div className="text-sm text-gray-500">250 participants</div>
          </div>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${member.color} rounded-full flex items-center justify-center text-white`}>
                    {member.id}
                  </div>
                  <div className="text-sm font-medium">{member.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {member.role}
                    </span>
                  )}
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
            <button className="text-red-500 text-sm font-medium">+ Add</button>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Gallery</h3>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-400 rounded" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">{file.size}</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyChatRoom;