/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { Home, Calendar, Users, Download, BookOpen, Eye } from 'lucide-react';


const PYQs = () => {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({1: 0, 2: 0, 3: 0});
  const [activeIcon, setActiveIcon] = useState('Books');
  const [viewMode, setViewMode] = useState('questions'); // 'questions' or 'pdf'
  const [currentPage, setCurrentPage] = useState(1);

  const months = [
    'January 2023',
    'September 2023',
    'May 2023'
  ];

  // Map month names to PDF filenames
  const pdfFiles = {
    'January 2023': '/pyqs/January-2023.pdf',
    'September 2023': '/pyqs/September-2023.pdf',
    'May 2023': '/pyqs/May-2023.pdf',
  };

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

  const handleOptionSelect = (questionId, optionIndex) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleMonthSelect = (index) => {
    setSelectedMonth(index);
    setCurrentPage(1);
  };

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfFiles[months[selectedMonth]];
    link.download = `ST-PYQ-${months[selectedMonth]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get full PDF URL with optional parameters
  const getPdfUrl = (monthName, withParams = false) => {
    const relativePath = pdfFiles[monthName];
    const fullUrl = window.location.origin + relativePath;
    if (withParams) {
      // Add parameters to disable some browser PDF viewer controls for better embedding
      return `${fullUrl}#toolbar=0&navpanes=0`;
    }
    return fullUrl;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <img onClick={() => window.location.href = '/'}
            src="/IITm.png" 
            alt="IIT Madras Logo" 
            className="w-60 h-12 rounded cursor-pointer"
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
                  index === selectedMonth ? 'text-red-600 font-medium' : ''
                }`}
              >
                ✦ {month}
              </div>
            ))}
          </div>
          
          {/* View mode options */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">View Options</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setViewMode('questions')}
                className={`flex items-center gap-2 p-2 rounded ${
                  viewMode === 'questions' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                }`}
              >
                <BookOpen size={18} />
                <span>Questions View</span>
              </button>
              <button 
                onClick={() => setViewMode('pdf')}
                className={`flex items-center gap-2 p-2 rounded ${
                  viewMode === 'pdf' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                }`}
              >
                <Eye size={18} />
                <span>PDF View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-gray-500">Previous Year Questions / Software Testing</div>
              <h1 className="text-xl font-bold">End Term - {months[selectedMonth]}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-gray-600 p-2">✕</button>
            </div>
          </div>

          {viewMode === 'questions' ? (
            /* Questions View */
            <>
              <div className="text-sm text-gray-500 mb-6">Total Number Of Questions: {questions.length}</div>
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
            </>
          ) : (
            /* PDF View using iframe */
            <div className="flex flex-col items-center">
              <div className="border rounded-lg shadow-sm overflow-hidden mb-4" style={{ width: '100%', height: '75vh' }}>
                <iframe 
                  src={getPdfUrl(months[selectedMonth])}
                  title={`Software Testing PYQ - ${months[selectedMonth]}`}
                  className="w-full h-full"
                  onError={(e) => {
                    console.error("PDF loading error:", e);
                  }}
                />
              </div>
              
              <div className="w-full flex justify-center mb-8">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    <Download size={18} /> Download PDF
                  </button>
                  <a 
                    href={getPdfUrl(months[selectedMonth])}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <Eye size={18} /> Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot Button */}
      <div className="fixed bottom-4 right-4">
        <button className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-700 transition-colors">
          <div className="w-2 h-2 bg-white rounded-full" />
          AI Chatbot
        </button>
      </div>
    </div>
  );
};

export default PYQs;
