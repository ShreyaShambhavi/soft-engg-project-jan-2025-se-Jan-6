import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, Bell, BookOpen, Calendar, Users2, FileText, Download, BookCopy, LayoutDashboard, FolderDown, FileQuestion, NotebookPen, Bot, MessagesSquare } from 'lucide-react';
import CourseChatBotMini from './CourseChatBotMini';
import LectureViewer from './LectureViewer'; // Import the LectureViewer component

function CoursePage() {
    const { courseName } = useParams();
    const [expandedSections, setExpandedSections] = useState({});
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [showChatbot, setShowChatbot] = useState(false);
    const [minimizedChatbot, setMinimizedChatbot] = useState(false);
    const [activeLectureTab, setActiveLectureTab] = useState('Lecture Overview');
    const [courseData, setCourseData] = useState(null);

    const [chatbotSize, setChatbotSize] = useState({ width: 380, height: 450 });
    const [isResizing, setIsResizing] = useState(false);
    const chatbotRef = useRef(null);
    const resizeStartPosRef = useRef({ x: 0, y: 0 });
    const initialSizeRef = useRef({ width: 0, height: 0 });

    useEffect(() => {
        fetchCourseData();
    }, [courseName]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e) => {
            const deltaX = e.clientX - resizeStartPosRef.current.x;
            const deltaY = e.clientY - resizeStartPosRef.current.y;

            setChatbotSize({
                width: Math.max(300, initialSizeRef.current.width + deltaX),
                height: Math.max(300, initialSizeRef.current.height + deltaY),
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        document.body.style.cursor = 'se-resize';
        document.body.style.userSelect = 'none';

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };
    }, [isResizing]);

    const handleStartResize = (e) => {
        e.preventDefault();
        e.stopPropagation();

        resizeStartPosRef.current = {
            x: e.clientX,
            y: e.clientY
        };

        initialSizeRef.current = {
            width: chatbotSize.width,
            height: chatbotSize.height
        };

        setIsResizing(true);
    };

    const fetchCourseData = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/v1/courses/${courseName}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            setCourseData(data.course);
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderStatus = (status) => {
        if (status === 'completed') {
            return <div className="w-4 h-4 rounded-full bg-green-500"></div>;
        } else if (status === 'in-progress') {
            return <div className="w-4 h-4 rounded-full bg-yellow-500"></div>;
        }
        return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
    };

    const sidebarIcons = [
        { icon: <Home />, label: "Home", url: "/" },
        { icon: <BookCopy />, label: "Courses", url: "/courses" },
        { icon: <LayoutDashboard />, label: "Dashboard", url: "/dashboard" },
        { icon: <FolderDown />, label: "Resources", url: `/resources/${courseName}` },
        { icon: <FileQuestion />, label: "PYQs", url: `/resources/${courseName}/pyqs` },
        { icon: <NotebookPen />, label: "Notes", url: `/notes/${courseName}` },
        { icon: <Bot />, label: "ChatBot", url: `/chatbot/${courseName}` },
        { icon: <MessagesSquare />, label: "Chatroom", url: `/chatroom/${courseName}` },
    ];

    const weeks = Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        status: i < 4 ? 'completed' : i === 4 ? 'in-progress' : 'pending'
    }));

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-8">
                {sidebarIcons.map((item, index) => (
                    <div
                        key={index}
                        className="cursor-pointer relative group"
                        onClick={() => window.location.href = item.url}
                    >
                        <div className="flex items-center justify-center">
                            {item.icon}
                        </div>
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap z-10">
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-64 bg-white border-r">
                <div className="p-4">
                    <div className="h-8">
                        <img src="/IITm.png" alt="IIT Madras Logo" className="h-full" />
                    </div>
                    <div className="text-sm text-gray-600 mt-2">My Courses / {courseName}</div>
                </div>

                <div className="border-t">
                    <div className="py-2">
                        {weeks.map((week) => (
                            <button
                                key={week.number}
                                onClick={() => toggleSection(`week${week.number}`)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                            >
                                <span className="text-gray-700">Week {week.number}</span>
                                {renderStatus(week.status)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{courseData?.instructor || 'Instructor'}</span>
                        <div className="w-8 h-8 bg-red-600 rounded-full text-white flex items-center justify-center">
                            {courseData?.instructor?.charAt(0).toUpperCase() || 'I'}
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {/* Use LectureViewer component here */}
                    <LectureViewer
                        username=""
                        courseName={courseName}
                        lecture={selectedLecture || { title: courseData?.title || 'Lecture Title', videoUrl: 'https://youtu.be/tTrVlQfP11M' }}
                    />
                </div>
            </div>

            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => {
                        setShowChatbot(!showChatbot);
                        setMinimizedChatbot(false);
                    }}
                    className="bg-red-600 text-white rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-red-700 transition-colors"
                >
                    <span>AI Chatbot</span>
                </button>
            </div>

            {showChatbot && (
                <div
                    ref={chatbotRef}
                    className="fixed right-4 bottom-20 z-50 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden"
                    style={{
                        width: minimizedChatbot ? '300px' : `${chatbotSize.width}px`,
                        height: minimizedChatbot ? '42px' : `${chatbotSize.height}px`,
                        maxWidth: '80vw',
                        maxHeight: '80vh'
                    }}
                >
                    <div className="p-3 border-b flex justify-between items-center">
                        <div className="flex items-center">
                            {!minimizedChatbot && (
                                <button
                                    className="w-6 h-6 ml-2 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                                    onMouseDown={handleStartResize}
                                    title="Resize chatbot"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 3L3 21"/>
                                        <path d="M21 11L21 3L13 3"/>
                                        <path d="M11 21L3 21L3 13"/>
                                    </svg>
                                </button>
                            )}
                            <h3 className="font-medium">AI Chatbot</h3>
                        </div>
                        <div className="space-x-2">
                            <button
                                onClick={() => setMinimizedChatbot(!minimizedChatbot)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                {minimizedChatbot ? 'Maximize' : 'Minimize'}
                            </button>
                            <button
                                onClick={() => setShowChatbot(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {!minimizedChatbot && (
                        <div className="flex-1 overflow-hidden">
                            <CourseChatBotMini courseName={courseName} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CoursePage;
