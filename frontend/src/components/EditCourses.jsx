/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, Check, X } from 'lucide-react';

const EditCourses = ({ user, selectedCourses, onClose }) => {
  const [allCourses, setAllCourses] = useState([]);
  const [coursesToAdd, setCoursesToAdd] = useState([]);
  const [coursesToDrop, setCoursesToDrop] = useState([]);
  const [oldCourses, setOldCourses] = useState([]);
  const [newCourses, setNewCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [dropDropdownOpen, setDropDropdownOpen] = useState(false);
  const [oldCourseDropdownOpen, setOldCourseDropdownOpen] = useState(false);
  const [newCourseDropdownOpen, setNewCourseDropdownOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/available-courses', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch available courses');
      }
      const data = await response.json();
      setAllCourses(data.courses);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    }
  };

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const handleAddCourses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/courses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_names: coursesToAdd }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to add courses');
      }
      const data = await response.json();
      setNotification('Courses added successfully');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        onClose(data.user);
        fetchAvailableCourses();
      }, 1500);
    } catch (error) {
      console.error('Error adding courses:', error);
      setNotification('Failed to add courses');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    }
  };

  const handleDropCourses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/courses/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_names: coursesToDrop }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to drop courses');
      }
      const data = await response.json();
      setNotification('Courses dropped successfully');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        onClose(data.user);
        fetchAvailableCourses();
      }, 1500);
    } catch (error) {
      console.error('Error dropping courses:', error);
      setNotification('Failed to drop courses');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    }
  };

  const handleChangeCourses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/courses/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_course_names: oldCourses, new_course_names: newCourses }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to change courses');
      }
      const data = await response.json();
      setNotification('Courses changed successfully');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        onClose(data.user);
        fetchAvailableCourses();
      }, 1500);
    } catch (error) {
      console.error('Error changing courses:', error);
      setNotification('Failed to change courses');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    }
  };

  const toggleCourseSelection = (courseList, setCourseList, course) => {
    if (courseList.includes(course)) {
      setCourseList(courseList.filter(c => c !== course));
    } else {
      setCourseList([...courseList, course]);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Manage Courses</h3>
          <button onClick={() => onClose(null)} className="text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'add' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-red-600'}`}
            onClick={() => setActiveTab('add')}
          >
            Add Courses
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'drop' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-red-600'}`}
            onClick={() => setActiveTab('drop')}
          >
            Drop Courses
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'change' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-red-600'}`}
            onClick={() => setActiveTab('change')}
          >
            Change Courses
          </button>
        </div>
        <div className="space-y-6">
          {activeTab === 'add' && (
            <div>
              <div className="text-gray-700 mb-2 font-medium">Select Courses to Add</div>
              <div className="relative">
                <button
                  className="w-full p-3 bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-left flex items-center justify-between"
                  onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                >
                  <span>
                    {coursesToAdd.length === 0 
                      ? 'Select courses to add' 
                      : `${coursesToAdd.length} course${coursesToAdd.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown size={20} className={`transition ${addDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {addDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {allCourses.map((course, index) => (
                      <div 
                        key={index} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                          coursesToAdd.includes(course.name) ? 'bg-red-50 text-red-600' : ''
                        }`}
                        onClick={() => toggleCourseSelection(coursesToAdd, setCoursesToAdd, course.name)}
                      >
                        <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                          coursesToAdd.includes(course.name) ? 'bg-red-500 border-red-500' : 'border-gray-300'
                        }`}>
                          {coursesToAdd.includes(course.name) && <Check size={12} color="white" />}
                        </div>
                        {course.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddCourses}
                disabled={coursesToAdd.length === 0}
              >
                Add Selected Courses
              </button>
            </div>
          )}
          {activeTab === 'drop' && (
            <div>
              <div className="text-gray-700 mb-2 font-medium">Select Courses to Drop</div>
              <div className="relative">
                <button
                  className="w-full p-3 bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-left flex items-center justify-between"
                  onClick={() => setDropDropdownOpen(!dropDropdownOpen)}
                >
                  <span>
                    {coursesToDrop.length === 0 
                      ? 'Select courses to drop' 
                      : `${coursesToDrop.length} course${coursesToDrop.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown size={20} className={`transition ${dropDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                {dropDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {selectedCourses.map((course, index) => (
                      <div 
                        key={index} 
                        className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                          coursesToDrop.includes(course) ? 'bg-red-50 text-red-600' : ''
                        }`}
                        onClick={() => toggleCourseSelection(coursesToDrop, setCoursesToDrop, course)}
                      >
                        <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                          coursesToDrop.includes(course) ? 'bg-red-500 border-red-500' : 'border-gray-300'
                        }`}>
                          {coursesToDrop.includes(course) && <Check size={12} color="white" />}
                        </div>
                        {course}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDropCourses}
                disabled={coursesToDrop.length === 0}
              >
                Drop Selected Courses
              </button>
            </div>
          )}
          {activeTab === 'change' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-700 mb-2 font-medium">Select Courses to Replace</div>
                  <div className="relative">
                    <button
                      className="w-full p-3 bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-left flex items-center justify-between"
                      onClick={() => setOldCourseDropdownOpen(!oldCourseDropdownOpen)}
                    >
                      <span>
                        {oldCourses.length === 0 
                          ? 'Select courses to replace' 
                          : `${oldCourses.length} course${oldCourses.length > 1 ? 's' : ''} selected`}
                      </span>
                      <ChevronDown size={20} className={`transition ${oldCourseDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {oldCourseDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {selectedCourses.map((course, index) => (
                          <div 
                            key={index} 
                            className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                              oldCourses.includes(course) ? 'bg-red-50 text-red-600' : ''
                            }`}
                            onClick={() => toggleCourseSelection(oldCourses, setOldCourses, course)}
                          >
                            <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                              oldCourses.includes(course) ? 'bg-red-500 border-red-500' : 'border-gray-300'
                            }`}>
                              {oldCourses.includes(course) && <Check size={12} color="white" />}
                            </div>
                            {course}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-700 mb-2 font-medium">Select New Courses</div>
                  <div className="relative">
                    <button
                      className="w-full p-3 bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-left flex items-center justify-between"
                      onClick={() => setNewCourseDropdownOpen(!newCourseDropdownOpen)}
                    >
                      <span>
                        {newCourses.length === 0 
                          ? 'Select new courses' 
                          : `${newCourses.length} course${newCourses.length > 1 ? 's' : ''} selected`}
                      </span>
                      <ChevronDown size={20} className={`transition ${newCourseDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>
                    {newCourseDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {allCourses.map((course, index) => (
                          <div 
                            key={index} 
                            className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center ${
                              newCourses.includes(course.name) ? 'bg-red-50 text-red-600' : ''
                            }`}
                            onClick={() => toggleCourseSelection(newCourses, setNewCourses, course.name)}
                          >
                            <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${
                              newCourses.includes(course.name) ? 'bg-red-500 border-red-500' : 'border-gray-300'
                            }`}>
                              {newCourses.includes(course.name) && <Check size={12} color="white" />}
                            </div>
                            {course.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleChangeCourses}
                disabled={oldCourses.length === 0 || newCourses.length === 0 || oldCourses.length !== newCourses.length}
              >
                Change Courses
              </button>
            </div>
          )}
        </div>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p>{notification}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

EditCourses.propTypes = {
  user: PropTypes.object.isRequired,
  selectedCourses: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditCourses;