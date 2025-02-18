// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Home, Calendar, Users, Download, BookOpen } from 'lucide-react';

const PYQs = () => {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({1: 0, 2: 0, 3: 0});
  const [activeIcon, setActiveIcon] = useState('Books'); // Track the active icon

  const months = [
    'September 2024',
    'May 2024',
    'January 2024',
    'September 2023',
    'May 2023'
  ];

  const questions = [
    {
      id: 1,
      text: 'Which of the following has the worst time complexity ?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
    },
    {
      id: 2,
      text: 'Question 2',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
    },
    {
      id: 3,
      text: 'Question 3',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
    }
  ];

  // const sidebarIcons = [
  //   { icon: Home, label: 'Home' },
  //   { icon: Calendar, label: 'Calendar' },
  //   { icon: Users, label: 'Users' },
  //   { icon: BookOpen, label: 'Books' },
  //   { icon: Download, label: 'Download' }
  // ];

  const handleOptionSelect = (questionId, optionIndex) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleMonthSelect = (index) => {
    setSelectedMonth(index);
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
        <button>
          <img 
            src="/Search.png" 
            alt="Search" 
            className="w-8 h-8"
          />
        </button>
        <button onClick={() => window.location.href = '/announcements'}>
          <img 
            src="/Notif.png" 
            alt="Notifications" 
            className="w-8 h-8"
          />
        </button>
        <button onClick={() => window.location.href = '/profile'}>
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
        {/* <div className="w-16 border-r min-h-screen pt-6 flex flex-col items-center">
          {sidebarIcons.map((item) => (
            <button 
              key={item.label}
              onClick={() => setActiveIcon(item.label)} // Set the active icon on click
              className={`w-full p-4 flex flex-col items-center transition-colors ${
                activeIcon === item.label
                  ? 'text-red-600 bg-red-50' // Active styling
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </div> */}

        {/* Content Sidebar */}
        <div className="w-64 border-r min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">PYQs</h2>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 text-sm">
            <button className="px-3 py-1 rounded border hover:bg-gray-50">Content</button>
            <button className="px-3 py-1 rounded border hover:bg-gray-50">Quizzes</button>
            <button className="px-3 py-1 rounded border bg-red-50 text-red-600 border-red-200">End Term</button>
            <button className="px-3 py-1 rounded border hover:bg-gray-50">OPEs</button>
          </div>

          {/* Month List */}
          <div className="space-y-2">
            {months.map((month, index) => (
              <div 
                key={month}
                onClick={() => handleMonthSelect(index)}
                className={`p-2 flex items-center gap-2 hover:bg-gray-50 rounded cursor-pointer ${
                  index === selectedMonth ? 'text-red-600' : ''
                }`}
              >
                ✦ {month}
              </div>
            ))}
          </div>
        </div>

        {/* Questions Area */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-gray-500">Previous Year Questions / Artificial Intelligence</div>
              <h1 className="text-xl font-bold">End Term - {months[selectedMonth]}</h1>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-2">✕</button>
          </div>

          <div className="text-sm text-gray-500 mb-6">Total Number Of Questions: {questions.length}</div>

          {/* Questions */}
          <div className="space-y-8">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="space-y-4">
                <div className="font-medium">
                  {qIndex + 1}. {question.text}
                </div>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div 
                      key={oIndex} 
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => handleOptionSelect(question.id, oIndex)}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        oIndex === selectedOptions[question.id] ? 'border-red-600' : 'border-gray-300'
                      }`}>
                        {oIndex === selectedOptions[question.id] && (
                          <div className="w-2 h-2 rounded-full bg-red-600" />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI Chatbot Button */}
          <div className="fixed bottom-4 right-4">
            <button className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors">
              <div className="w-2 h-2 bg-white rounded-full" />
              AI Chatbot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PYQs;
