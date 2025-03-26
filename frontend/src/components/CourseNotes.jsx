import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, Users, Download, BookOpen, PlusCircle, 
  Save, Trash2, X, Edit, RotateCw, AlertCircle, ChevronDown,
  ChevronRight, Search, Bell, UserCircle
} from 'lucide-react';
import axios from 'axios';

const COURSE_ID_MAP = {
  'Artificial Intelligence': 1,
  'Deep Learning': 2,
  'Software Engineering': 3,
  'Software Testing': 4
};

const CourseNotes = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  // UI States
  const [activeIcon, setActiveIcon] = useState('Books');
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info'); 
  const [expandedCourses, setExpandedCourses] = useState({});
  
  // Data States
  const [userCourses, setUserCourses] = useState([]);
  const [courseNotes, setCourseNotes] = useState({});
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch all user courses
  const fetchUserCourses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/v1/courses', {
        withCredentials: true
      });
      
      if (response.data && response.data.courses) {
        setUserCourses(response.data.courses);
        
        // Initialize expanded state for each course
        const expanded = {};
        response.data.courses.forEach(course => {
          expanded[course.id] = true; // Start with all courses expanded
        });
        setExpandedCourses(expanded);
        
        // Fetch notes for each course
        await Promise.all(response.data.courses.map(course => fetchNotesForCourse(course.id)));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('Failed to load courses. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch notes for a specific course
  const fetchNotesForCourse = async (courseId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/v1/notes?courseId=${courseId}`, {
        withCredentials: true
      });
      
      if (response.data && response.data.notes) {
        setCourseNotes(prev => ({
          ...prev,
          [courseId]: response.data.notes
        }));
      }
    } catch (error) {
      console.error(`Error fetching notes for course ${courseId}:`, error);
    }
  };
  
  // Create a new note
  const createNote = async (courseId) => {
    if (!courseId) {
      showNotification('Please select a course first', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/v1/notes', {
        title: 'New Note',
        content: 'Start typing your note content here...',
        courseId: courseId
      }, {
        withCredentials: true
      });
      
      if (response.data && response.data.note) {
        // Update the notes for this course
        setCourseNotes(prev => ({
          ...prev,
          [courseId]: [response.data.note, ...(prev[courseId] || [])]
        }));
        
        // Select the new note
        setSelectedNote(response.data.note);
        setSelectedCourseId(courseId);
        setEditTitle(response.data.note.title);
        setEditContent(response.data.note.content);
        setIsEditing(true);
        showNotification('New note created successfully!', 'success');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      showNotification('Failed to create note. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Save note changes
  const saveNote = async () => {
    if (!selectedNote || !editTitle.trim()) {
      showNotification('Note title cannot be empty', 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await axios.put(`http://127.0.0.1:5000/api/v1/notes/${selectedNote.id}`, {
        title: editTitle,
        content: editContent
      }, {
        withCredentials: true
      });
      
      if (response.data && response.data.note) {
        // Update the note in the list
        setCourseNotes(prev => {
          const courseNotesArray = [...prev[selectedCourseId]];
          const noteIndex = courseNotesArray.findIndex(note => note.id === selectedNote.id);
          
          if (noteIndex !== -1) {
            courseNotesArray[noteIndex] = response.data.note;
          }
          
          return {
            ...prev,
            [selectedCourseId]: courseNotesArray
          };
        });
        
        setSelectedNote(response.data.note);
        setIsEditing(false);
        showNotification('Note saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      showNotification('Failed to save note. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete the current note
  const deleteNote = async () => {
    if (!selectedNote) return;
    
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    setIsSaving(true);
    try {
      await axios.delete(`http://127.0.0.1:5000/api/v1/notes/${selectedNote.id}`, {
        withCredentials: true
      });
      
      // Remove the note from the list
      setCourseNotes(prev => {
        const courseNotesArray = prev[selectedCourseId].filter(note => note.id !== selectedNote.id);
        
        return {
          ...prev,
          [selectedCourseId]: courseNotesArray
        };
      });
      
      // Clear selection
      setSelectedNote(null);
      setEditTitle('');
      setEditContent('');
      setIsEditing(false);
      
      showNotification('Note deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting note:', error);
      showNotification('Failed to delete note. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle note selection
  const selectNote = (note, courseId) => {
    // Ask to save changes if currently editing
    if (isEditing && selectedNote && selectedNote.id !== note.id) {
      if (window.confirm('You have unsaved changes. Save before switching?')) {
        saveNote();
      }
    }
    
    setSelectedNote(note);
    setSelectedCourseId(courseId);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };
  
  // Toggle course expansion
  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Show notification
  const showNotification = (message, type = 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  };
  
  // Load courses and notes on mount
  useEffect(() => {
    fetchUserCourses();
  }, []);
  
  const sidebarIcons = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: BookOpen, label: 'Books', path: '/notes' },
    { icon: Download, label: 'Download', path: '/resources' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Icon Sidebar */}
      <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-8">
        {sidebarIcons.map((item, index) => (
          <div
            key={index}
            className="cursor-pointer relative group"
            onClick={() => {
              setActiveIcon(item.label);
              navigate(item.path);
            }}
          >
            <div className={`flex items-center justify-center p-2 rounded-md ${
              activeIcon === item.label ? 'bg-red-50 text-red-600' : 'text-gray-600'
            }`}>
              <item.icon size={22} />
            </div>
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap z-10">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              onClick={() => navigate('/')}
              src="/IITm.png" 
              alt="IIT Madras Logo" 
              className="h-10 rounded cursor-pointer mr-4" 
            />
            <h1 className="text-xl font-semibold text-gray-800">My Course Notes</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-400 cursor-pointer" />
            <Bell 
              className="w-5 h-5 text-gray-400 cursor-pointer" 
              onClick={() => navigate('/announcements')}
            />
            <UserCircle 
              className="w-6 h-6 text-gray-400 cursor-pointer" 
              onClick={() => navigate('/profile')}
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Course Notes Sidebar */}
          <div className="w-72 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">All Courses</h2>
              <p className="text-sm text-gray-500 mb-4">Select a note to view or edit</p>
              
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : userCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">You are not enrolled in any courses</p>
                  <button 
                    onClick={() => navigate('/courses')}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Browse Courses
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userCourses.map(course => (
                    <div key={course.id} className="border rounded-md overflow-hidden">
                      <button
                        onClick={() => toggleCourseExpansion(course.id)}
                        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
                      >
                        <span className="font-medium text-gray-700">{course.name}</span>
                        <div className="flex items-center space-x-2">
                          <PlusCircle 
                            size={16} 
                            className="text-gray-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              createNote(course.id);
                            }}
                            title="Add note"
                          />
                          {expandedCourses[course.id] ? 
                            <ChevronDown size={18} className="text-gray-500" /> : 
                            <ChevronRight size={18} className="text-gray-500" />
                          }
                        </div>
                      </button>
                      
                      {expandedCourses[course.id] && (
                        <div className="bg-white">
                          {!courseNotes[course.id] || courseNotes[course.id].length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500">
                              <p className="text-sm mb-3">No notes for this course</p>
                              <button
                                onClick={() => createNote(course.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                Create First Note
                              </button>
                            </div>
                          ) : (
                            <div className="p-2 space-y-1">
                              {courseNotes[course.id].map(note => (
                                <button
                                  key={note.id}
                                  onClick={() => selectNote(note, course.id)}
                                  className={`w-full px-3 py-2 rounded-md text-left flex items-center ${
                                    selectedNote?.id === note.id 
                                      ? 'bg-red-50 text-red-600 border border-red-200' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full mr-2 ${
                                    selectedNote?.id === note.id ? 'bg-red-600' : 'bg-gray-400'
                                  }`}></span>
                                  <div className="flex-1 truncate">
                                    {note.title}
                                    <div className="text-xs text-gray-500">{formatDate(note.timestamp)}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {selectedNote ? (
              <div className="h-full flex flex-col">
                {/* Note Header */}
                <div className="bg-white border-b">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="text-xl font-semibold w-full border-b border-gray-300 pb-1 focus:outline-none focus:border-red-500"
                          placeholder="Note title"
                        />
                      ) : (
                        <div>
                          <div className="text-sm text-gray-500">
                            {userCourses.find(c => c.id === selectedCourseId)?.name}
                          </div>
                          <h1 className="text-xl font-semibold">{selectedNote.title}</h1>
                          <div className="text-sm text-gray-500">
                            {formatDate(selectedNote.timestamp)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {isEditing ? (
                        <>
                          <button 
                            onClick={saveNote}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-md text-sm flex items-center ${
                              isSaving ? 'bg-gray-300 text-gray-500' : 'bg-red-600 text-white'
                            }`}
                          >
                            {isSaving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" /> Save
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => {
                              setEditTitle(selectedNote.title);
                              setEditContent(selectedNote.content);
                              setIsEditing(false);
                            }}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                        >
                          <Edit className="w-4 h-4 mr-1 inline-block" /> Edit
                        </button>
                      )}
                      <button 
                        onClick={deleteNote}
                        disabled={isSaving}
                        className={`p-2 rounded-md ${
                          isSaving ? 'text-gray-300' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete Note"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Note Content */}
                <div className="flex-1 p-6 overflow-auto">
                  {isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-full p-4 bg-white rounded-lg shadow-sm focus:outline-none min-h-[200px] resize-none"
                      placeholder="Type your note content here..."
                    />
                  ) : (
                    <div 
                      className="p-4 bg-white rounded-lg shadow-sm min-h-[200px] prose max-w-none" 
                      dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">No Note Selected</h2>
                  <p className="text-gray-500 mb-6">
                    Select a note from the sidebar to view or edit its content, or create a new note to get started.
                  </p>
                  {userCourses.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {userCourses.slice(0, 4).map(course => (
                        <button
                          key={course.id}
                          onClick={() => createNote(course.id)}
                          className="px-4 py-2 border border-red-200 bg-white text-red-600 rounded-md text-sm hover:bg-red-50"
                        >
                          New {course.name.split(' ')[0]} Note
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Alert */}
      {showAlert && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-lg z-50 ${
          alertType === 'success' ? 'bg-green-600 text-white' :
          alertType === 'error' ? 'bg-red-600 text-white' :
          'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} />
            <span>{alertMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseNotes;