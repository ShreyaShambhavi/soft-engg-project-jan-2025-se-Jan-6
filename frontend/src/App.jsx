/* eslint-disable no-unused-vars */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import CoursePage from './components/CoursePage';
import Assignment from './components/Assignment';
import ChatRoom from './components/ChatRoom';
import Announcements from './components/Announcements';
import Profile from './components/Profile';
import CourseChatBot from './components/CourseChatBot';
import CourseNotes from './components/CourseNotes';
import CourseResources from './components/CourseResources';
import PYQs from './components/PYQs';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<PrivateRoute element={Dashboard} />} />
      <Route path="/courses" element={<PrivateRoute element={Courses} />} />
      <Route path="/courses/:courseName" element={<PrivateRoute element={CoursePage} />} />
      <Route path="/assignment" element={<PrivateRoute element={Assignment} />} />
      <Route path="/chatroom/:courseChatRoom" element={<PrivateRoute element={ChatRoom} />} />
      <Route path="/announcements" element={<PrivateRoute element={Announcements} />} />
      <Route path="/profile" element={<PrivateRoute element={Profile} />} />
      <Route path="/chatbot/:courseChatBot" element={<PrivateRoute element={CourseChatBot} />} />
      <Route path="/notes/:courseNotes" element={<PrivateRoute element={CourseNotes} />} />
      <Route path="/resources/:courseResources" element={<PrivateRoute element={CourseResources} />} />
      <Route path="/resources/:courseResources/pyqs" element={<PrivateRoute element={PYQs} />} />
    </Routes>
  );
}

export default App;