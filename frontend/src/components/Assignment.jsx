import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, Home, Book, Calendar, Users, FileText, Download, Bot } from 'lucide-react';

const GradedAssignment = () => {
  const [activeTab, setActiveTab] = useState('Content');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  const weeks = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    isActive: i === 4, // Week 5 is active
  }));

  const navigationTabs = ['Content', 'Quizzes', 'End Term'];

  const lectures = [
    { id: '5.1', title: 'Lecture 1', completed: true },
    { id: '5.2', title: 'Lecture 2', completed: true },
    { id: '5.3', title: 'Lecture 3', completed: false },
    { id: '5.4', title: 'Lecture 4', completed: false },
    { id: '5.5', title: 'Lecture 5', completed: false },
    { id: '5.6', title: 'Tutorial 1', completed: false },
    { id: '5.7', title: 'Tutorial 2', completed: false },
  ];

  const assignments = [
    { id: '5.1', title: 'Practice Assignment 1', completed: true },
    { id: '5.2', title: 'Practice Assignment 2', completed: false },
    { id: '5.3', title: 'Graded Assignment 1', inProgress: true },
    { id: '5.4', title: 'Graded Assignment 2', completed: false },
    { id: '5.5', title: 'Programming Assignment 1', completed: false },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 border-r">
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

        {/* Week Navigation */}
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {navigationTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeTab === tab ? 'bg-red-500 text-white' : 'text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {weeks.map((week) => (
              <button
                key={week.number}
                className={`w-full p-3 text-left rounded-lg flex items-center justify-between ${
                  week.isActive ? 'border-2 border-red-500' : 'border hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">Week {week.number}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-4">
            My Courses / Software Engineering
          </div>

          {/* Assignment Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Graded Assignment 1</h1>
            <div className="text-sm text-gray-600">
              <div>Deadline: 9th Feb 2025</div>
              <div>Estimated time: 1 Hour</div>
            </div>
          </div>

          {/* Quiz Questions */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="font-medium">1. Which of the following is NOT a type of software testing?</div>
              {['Unit Testing', 'Debugging', 'Integration Testing', 'System Testing'].map((option) => (
                <label key={option} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name="question1"
                    value={option}
                    onChange={(e) => setSelectedAnswers({ ...selectedAnswers, q1: e.target.value })}
                    className="text-red-500 focus:ring-red-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <div className="space-y-4">
              <div className="font-medium">2. Which testing technique is used without knowledge of the internal code structure?</div>
              {['White-box testing', 'Black-box testing', 'Grey-box testing', 'Unit testing'].map((option) => (
                <label key={option} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name="question2"
                    value={option}
                    onChange={(e) => setSelectedAnswers({ ...selectedAnswers, q2: e.target.value })}
                    className="text-red-500 focus:ring-red-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="mt-8 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Submit
          </button>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l p-6">
          {/* Lectures & Tutorials */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Lectures & Tutorials</h2>
              <div className="text-sm text-gray-500">2/7 Completed</div>
            </div>
            <div className="space-y-2">
              {lectures.map((lecture) => (
                <div key={lecture.id} className="flex items-center justify-between text-sm">
                  <span>{lecture.id} {lecture.title}</span>
                  <div className={`w-4 h-4 rounded-full ${
                    lecture.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                </div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Assignments</h2>
              <div className="text-sm text-gray-500">1/5 Completed</div>
            </div>
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between text-sm">
                  <span>{assignment.id} {assignment.title}</span>
                  <div className={`w-4 h-4 rounded-full ${
                    assignment.completed ? 'bg-green-500' : 
                    assignment.inProgress ? 'bg-yellow-500' : 'bg-gray-200'
                  }`} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Chatbot Button */}
          <button className="fixed bottom-6 right-6 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
            <Bot className="w-5 h-5" />
            AI Chatbot
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradedAssignment;