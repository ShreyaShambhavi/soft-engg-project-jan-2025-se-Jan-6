import React, { useState } from 'react';
import { Home, Calendar, Users, Download, BookOpen, Eye } from 'lucide-react';


const PYQs = () => {
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [viewMode, setViewMode] = useState('pdf');

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
          
          
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-gray-500">Previous Year Questions / Software Testing</div>
              <h1 className="text-xl font-bold">End Term - {months[selectedMonth]}</h1>
            </div>
            <div className="flex justify-center items-center">
                <div className="flex justify-center items-center gap-4">
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

          {viewMode === 'questions' ? (
            <></>
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
