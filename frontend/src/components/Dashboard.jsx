/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts";
import { Bell, Home, Calendar, Users, BookOpen, Download, X, LayoutDashboard, BookCopy } from "lucide-react";
import LogoutButton from "./LogoutButton";

const Dashboard = () => {
  const [activeIcon, setActiveIcon] = useState('Home');
  const [user, setUser] = useState(null);

  // Initialize tasks from localStorage or use an empty array if no tasks are saved
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [newTask, setNewTask] = useState(''); // State for new task input

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
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
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const studyHoursData = [
    { month: 'Dec 2024', you: 2, students: 3 },
    { month: 'Jan 2025', you: 5, students: 4 },
    { month: 'Feb 2025', you: 4, students: 5 }
  ];

  const dailyHoursData = [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 3.5 },
    { day: 'Wed', hours: 2 },
    { day: 'Thurs', hours: 3 },
    { day: 'Fri', hours: 1 }
  ];

  const events = [
    { name: 'Milestone 2 Submission Deadline', date: 'Feb 9th' },
    { name: 'LLM Live Session', date: 'Feb 15th' },
    { name: 'Assignment 7 Submission', date: 'Feb 9th' },
    { name: 'DL Live Session', date: 'Feb 15th' },
    { name: 'NLP Live Session', date: 'Feb 9th' },
    { name: 'CV Tutorial Session', date: 'Feb 15th' }
  ];

  const recentPoints = [
    { name: 'L4.5 LLM Lecture', points: '+5 points' },
    { name: 'DL Assignment', points: '+5 points' },
    { name: 'SE Lecture', points: '+2 points' },
    { name: 'AI Lecture', points: '+5 points' }
  ];

  const sidebarIcons = [
    { icon: Home, label: 'Home', url: "/"},
    { icon: LayoutDashboard, label: 'Dashboard', url: "/dashboard"},
    { icon: BookCopy, label: 'Courses', url: "/courses" },
  ];

  // Add a new task
  const addTask = () => {
    if (newTask.trim() === '') return; // Prevent empty tasks
    const newTaskObj = { name: newTask, points: '+5 points', completed: false };
    setTasks([...tasks, newTaskObj]); // Add the new task to the list
    setNewTask(''); // Clear the input field
  };

  // Toggle task completion
  const toggleTaskCompletion = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks); // Update the tasks state
  };

  // Delete a task
  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks); // Update the tasks state
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <img 
            src="/IITm.png" 
            alt="IIT Madras Logo" 
            className="w-60 h-12 rounded"
            onClick={() => window.location.href = '/'}
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
            <img src="Avatar.png" alt="Profile" className="w-8 h-8" />
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

        {/* Main Dashboard Content */}
        <div className="flex-1 p-8 bg-gray-50">
          <div className="grid grid-cols-3 gap-8">
            {/* User Profile */}
            <div className="col-span-1 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <img
                src="/Avatar.png"
                alt="Avatar"
                className="w-48 h-48 mx-auto mb-4 rounded-full object-cover">
                </img>
                
                <h2 className="text-2xl font-bold mb-2">Welcome, {user ? user.username : 'User'}!</h2>
                <p className="text-red-500">Role: {user ? user.roles.join(', ') : 'Degree'}</p>
                <p className="text-red-500">CGPA: 8.0</p>
              </div>
            </div>

            {/* Tasks Tracker */}
            <div className="col-span-1 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Tasks Tracker</h3>

                {/* Input for Adding New Tasks */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Add a new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    onClick={addTask}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Add
                  </button>
                </div>

                {/* List of Tasks */}
                {tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(index)} // Toggle completion
                      className="w-4 h-4"
                    />
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.name}
                    </span>
                    <span className="text-sm text-gray-500">{task.points}</span>
                    <button
                      onClick={() => deleteTask(index)} // Delete task
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="col-span-1 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">February 2025</h3>
                <div className="grid grid-cols-7 gap-2 text-sm">
                  <div className="text-red-500">Mon</div>
                  <div className="text-red-500">Tue</div>
                  <div className="text-red-500">Wed</div>
                  <div className="text-red-500">Thu</div>
                  <div className="text-red-500">Fri</div>
                  <div className="text-red-500">Sat</div>
                  <div className="text-red-500">Sun</div>
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="text-center py-2">{i + 1}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Study Hours Charts */}
            <div className="col-span-2 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Number of Study Hours</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studyHoursData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Bar dataKey="you" fill="#EF4444" />
                      <Bar dataKey="students" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Daily Hours Line Chart */}
            <div className="col-span-1 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Hours studied per day</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyHoursData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Line type="monotone" dataKey="hours" stroke="#EF4444" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="col-span-1 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Upcoming Events</h3>
                  <span className="text-sm text-gray-500">View All</span>
                </div>
                {events.map((event, index) => (
                  <div key={index} className="flex items-center gap-4 mb-4">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Points */}
            <div className="col-span-1 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Total Points</h3>
                <p className="text-4xl font-bold text-amber-500">30</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recent Points</h4>
                  {recentPoints.map((point, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <span className="text-sm">{point.name}</span>
                      <span className="text-sm text-gray-500">{point.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;