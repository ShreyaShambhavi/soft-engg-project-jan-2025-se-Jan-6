import { useParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, Bell, BookCopy, LayoutDashboard, FolderDown, FileQuestion, NotebookPen, Bot, MessagesSquare, ChevronDown, ChevronRight } from 'lucide-react';
import CourseChatBotMini from './CourseChatBotMini';
import LectureViewer from './LectureViewer';
import AssignmentViewer from './AssignmentViewer';

function CoursePage() {
    const { courseName } = useParams();
    const [expandedSections, setExpandedSections] = useState({
        week1: false,
        week2: false,
        week3: false,
        week4: false,
        week5: false,
        week6: false,
        week7: false,
        week8: false,
        week9: false,
        week10: false,
        week11: false,
        week12: false
    });
    const [selectedContent, setSelectedContent] = useState(null);
    const [showChatbot, setShowChatbot] = useState(false);
    const [minimizedChatbot, setMinimizedChatbot] = useState(false);
    const [courseData, setCourseData] = useState(null);

    const [chatbotSize, setChatbotSize] = useState({ width: 380, height: 450 });
    const [isResizing, setIsResizing] = useState(false);
    const chatbotRef = useRef(null);
    const resizeStartPosRef = useRef({ x: 0, y: 0 });
    const initialSizeRef = useRef({ width: 0, height: 0 });

    useEffect(() => {
        fetchCourseData();
    }, [courseName]);

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

    const handleContentClick = (content) => {
        setSelectedContent(content);
    };

    const weeksContent = [
        {
            number: 1,
            lectures: [
                { 
                    type: 'lecture',
                    title: '1.1 Software Testing: Motivation', 
                    videoUrl: 'https://youtu.be/tTrVlQfP11M',
                    description: 'Software Testing: Motivation' 
                },
                { 
                    type: 'lecture',
                    title: '1.2 Software Development Life Cycle', 
                    videoUrl: 'https://youtu.be/79jPbpxndSw',
                    description: 'Software Development Life Cycle' 
                },
                { 
                    type: 'lecture',
                    title: '1.3 Software Testing: Terminologies', 
                    videoUrl: 'https://youtu.be/FpApclVsLrw',
                    description: 'Software Testing: Terminologies' 
                },
                { 
                    type: 'lecture',
                    title: '1.4 Software Testing: Terminologies and Processes', 
                    videoUrl: 'https://youtu.be/eYkSXT89Gi8',
                    description: 'Software Testing: Terminologies and Processes' 
                },
                { 
                    type: 'lecture',
                    title: '1.5 Software Test Automation: JUnit as an example', 
                    videoUrl: 'https://youtu.be/ZgZ0kpyED9k',
                    description: 'Software Test Automation: JUnit as an example' 
                },
                {
                    type: 'assignment',
                    title: 'Graded Assignment 1',
                    subtitle: 'Assignment',
                    dueDate: '2025-01-26, 23:59 IST',
                    lastSubmitted: '',
                    questions: [
                        {
                            text: '1) Select the statements that are true with respect to software errors.',
                            points: 1,
                            options: [
                                'If a software system that needs to be run continuously, encounters an error. There is no way to fix this error without shutting down the system.',
                                'Poorly tested software systems will be more prone to errors.',
                                'Software testing can be started only after the software development is completed.',
                                'After completely testing software, there can still be errors in the software.'
                            ],
                            answer: [
                                'Poorly tested software systems will be more prone to errors.',
                                'After completely testing software, there can still be errors in the software.'
                            ]
                        },
                        {
                            text: '2) Choose the correct sequence of testing levels based on the SDLC phase they are applied to. First to last from left to right. \
                            (1) Beta Testing\
                            (2) Unit Testing\
                            (3) System Testing\
                            (4) Integration Testing\
                            (5) Acceptance Testing',
                            points: 1,
                            options: [
                                '4 -> 2 -> 3 -> 1 -> 5',
                                '2 -> 1-> 4 -> 3 -> 5',
                                '5 -> 2 -> 3 -> 4 -> 1',
                                '2 -> 4 - > 3 -> 5 -> 1'
                            ],
                            answer: '2 -> 4 - > 3 -> 5 -> 1'
                        },
                        {
                            text: '4) There was an error detected in a software that has been developed and deployed. This error was fixed by the software developer. After fixing the error the developer wants to test that the whole system is working correctly, this testing is typically referred to as ______',
                            points: 1,
                            options: [
                                'Functional testing',
                                'Regression testing',
                                'System testing',
                                'Acceptance testing'
                            ],
                            answer: 'Regression testing'
                        },
                        {
                            text: '4) You want to develop an Android app that contains only one button. On pressing this button the whole screen turns white if its black, and turns black if its white. Initially when the app is started the screen is white. Your job is to develop this app and test the correctness, and complete this process quickly. Choose the minimum level of testing that should be sufficient while not compromising on the correctness.',
                            points: 1,
                            options: [
                                'Level 0',
                                'Level 1',
                                'Level 2',
                                'Level 3'
                            ],
                            answer: 'Level 1'
                        }

                    ]
                }
            ]
        },
        // Add more weeks as needed
    ];

    

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

    const weeks = Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        
    }));

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Icons */}
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

            {/* Weeks Sidebar */}
            <div className="w-64 bg-white border-r">
                <div className="p-4">
                    <div className="h-8">
                        <img src="/IITm.png" alt="IIT Madras Logo" className="h-full" />
                    </div>
                    <div className="text-sm text-gray-600 mt-2">My Courses / {courseName}</div>
                </div>

                <div className="border-t">
                    {weeks.map((week) => (
                        <div key={week.number} className="border-b">
                            <button
                                onClick={() => toggleSection(`week${week.number}`)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                            >
                                <span className="text-gray-700">Week {week.number}</span>
                                <div className="flex items-center space-x-2">
                                    
                                    {expandedSections[`week${week.number}`] ? 
                                        <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                    }
                                </div>
                            </button>

                            {expandedSections[`week${week.number}`] && (
                                <div className="px-4 py-2 space-y-2">
                                    {weeksContent.find(w => w.number === week.number)?.lectures.map((content, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleContentClick(content)}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center justify-between"
                                        >
                                            <span>{content.title}</span>
                                            {content.type === 'assignment' && (
                                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Assignment</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
                {/* Header */}
                <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Bell onClick={() => window.location.href = '/announcements'} className="cursor-pointer w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <div onClick={() => window.location.href = '/profile'} className="cursor-pointer w-8 h-8 bg-red-600 rounded-full text-white flex items-center justify-center">
                            {courseData?.instructor?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Content Viewer */}
                <div className="p-6">
                    {selectedContent?.type === 'lecture' ? (
                        <LectureViewer
                            username=""
                            courseName={courseName}
                            lecture={selectedContent || { 
                                title: 'Lecture 1: Some Popular Errors #1: Ariane 5', 
                                videoUrl: 'https://youtu.be/tTrVlQfP11M',
                                description: 'Software Testing Motivation' 
                            }}
                        />
                    ) : selectedContent?.type === 'assignment' ? (
                        <AssignmentViewer
                            assignment={selectedContent}
                        />
                    ) : (
                        <div className="text-center text-lg font-semibold text-gray-700">
                            Welcome to {courseName}!
                        </div>
                    )}
                </div>
            </div>

            {/* Chatbot Component */}
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

            
            {/* Chatbot component  */}

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
