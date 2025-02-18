// eslint-disable-next-line no-unused-vars
import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { 
  Home, 
  Login, 
  Signup, 
  Dashboard,
  Courses, 
  CoursePage, 
  Assignment, 
  ChatRoom, 
  Announcements, 
  Profile, 
  CourseChatBot, 
  CourseNotes,
  CourseResources,
  PYQs
} from './components/index.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/courses' element={<Courses />} />
        <Route path='/courses/:coursePage' element={<CoursePage />} />
        <Route path='/assignment' element={<Assignment />} />
        <Route path='/chatroom/:courseChatRoom' element={<ChatRoom />} />
        <Route path='/announcements' element={<Announcements />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/chatbot/:courseChatBot' element={<CourseChatBot />} />
        <Route path='/notes/:courseNotes' element={<CourseNotes />} />
        <Route path='/resources/:courseResources' element={<CourseResources />} />
        <Route path='/resources/:courseResources/pyqs' element={<PYQs />} />
      </Routes>
    </Router>
  )
}

export default App