import React, { useState } from 'react';
import { Search, Bell, User, Download, X } from 'lucide-react';

const CourseResources = ({ courseName = "Course 3" }) => {
  const [activeTab, setActiveTab] = useState('Course 3');
  const [activeSection, setActiveSection] = useState('Slides');

  const courses = ['Course 1', 'Course 2', 'Course 3'];
  
  const sections = [
    { id: 'transcripts', label: 'Transcripts' },
    { id: 'slides', label: 'Slides' },
    { id: 'notes', label: 'Notes' },
    { id: 'reference-books', label: 'Reference Books' },
    { id: 'pyqs', label: 'PYQs' },
    { id: 'summary', label: 'Summary' },
    { id: 'important-documents', label: 'Important Documents' },
  ];

  const weeks = Array.from({ length: 5 }, (_, i) => ({
    week: `WEEK ${i + 1}`,
    lecture: true,
    tutorial: true,
    screencast: true,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img src="/IITm.png" alt="IIT Madras Logo" className="w-60 h-12 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Bell className="w-5 h-5 text-gray-400 cursor-pointer" onClick={() => window.location.href = '/announcements'} />
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer">
              <User className="w-5 h-5 cursor-pointer" onClick={() => window.location.href = '/profile'} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 border-r min-h-screen p-6">
          <h1 className="text-2xl font-bold mb-6">Downloads</h1>
          
          {/* Course Tabs */}
          <div className="flex gap-2 mb-6">
            {courses.map((course) => (
              <button
                key={course}
                onClick={() => setActiveTab(course)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeTab === course ? 'bg-red-500 text-white' : 'border'
                }`}
              >
                {course}
              </button>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.label)}
                className={`w-full px-4 py-3 text-left rounded-lg flex items-center gap-3 ${
                  activeSection === section.label
                    ? 'bg-red-50 text-red-500 border border-red-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <Download className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Downloads / {courseName}</div>
              <h2 className="text-2xl font-bold">Slides</h2>
              <div className="text-sm text-gray-500">Date: 10th Jan 2025</div>
            </div>
            <button>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Downloads Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Week</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Lecture</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tutorial</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Screencast</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {weeks.map((week) => (
                  <tr key={week.week}>
                    <td className="px-6 py-4 text-sm">{week.week}</td>
                    <td className="px-6 py-4">
                      {week.lecture && (
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {week.tutorial && (
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {week.screencast && (
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseResources;