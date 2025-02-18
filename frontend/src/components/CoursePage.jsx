import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Home, Search, Bell, BookOpen, Calendar, Users2, FileText, Download, BookCopy, LayoutDashboard, FolderDown, FileQuestion, NotebookPen, Bot, MessagesSquare } from 'lucide-react';

function CoursePage({ 
    username = 'User', 
    courseName = 'Software Engineering'
}) {
    const [expandedSections, setExpandedSections] = useState({});
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [activeTab, setActiveTab] = useState('Content');
    const [showChatbot, setShowChatbot] = useState(false);
    const [minimizedChatbot, setMinimizedChatbot] = useState(false);
    const [activeLectureTab, setActiveLectureTab] = useState('Lecture Overview');

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
        { icon: <BookCopy />, label: "courses", url: "/courses" },
        { icon: <LayoutDashboard />, label: "dashboard", url: "/dashboard" },
        { icon: <FolderDown />, label: "resources", url: "/resources/Software-Engineering" },
        { icon: <FileQuestion />, label: "pyqs", url: "/resources/Software-Engineering/pyqs" },
        { icon: <NotebookPen />, label: "notes", url: "/notes/Software-Engineering" },
        { icon: <Bot />, label: "chatbot", url: "/chatbot/Software-Engineering" },
        { icon: <MessagesSquare />, label: "chatroom", url: "/chatroom/Software-Engineering" },
    ];

    const weeks = Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        status: i < 4 ? 'completed' : i === 4 ? 'in-progress' : 'pending'
    }));

    const lectureTabs = [
        'Lecture Overview',
        'Resources & documents',
        'Transcript',
        'Summary'
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Icon Sidebar */}
            <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-8">
                {sidebarIcons.map((item, index) => (
                    <div key={index} className="cursor-pointer" onClick={() => window.location.href = item.url}>
                        {item.icon}
                    </div>
                ))}
            </div>

            {/* Main Navigation Sidebar */}
            <div className="w-64 bg-white border-r">
                <div className="p-4">
                    <div className="h-8">
                        <img src="/iit-madras-logo.png" alt="IIT Madras Logo" className="h-full" />
                    </div>
                    <div className="text-sm text-gray-600 mt-2">My Courses / {courseName}</div>
                </div>

                {/* Course Navigation */}
                <div className="border-t">
                    <div className="flex border-b">
                        <button 
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'Content' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                            onClick={() => setActiveTab('Content')}
                        >
                            Content
                        </button>
                        <button 
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'Quizzes' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                            onClick={() => setActiveTab('Quizzes')}
                        >
                            Quizzes
                        </button>
                        <button 
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'End Term' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                            onClick={() => setActiveTab('End Term')}
                        >
                            End Term
                        </button>
                    </div>

                    {/* Weeks List */}
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

            {/* Main Content Area */}
            <div className="flex-1">
                {/* Header */}
                <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{username}</span>
                        <div className="w-8 h-8 bg-red-600 rounded-full text-white flex items-center justify-center">
                            {username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-6">
                    {selectedLecture ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-semibold">UI Design, A User - Centered Approach</h2>
                                    <div className="flex items-center mt-1">
                                        <span className="text-yellow-400">★</span>
                                        <span className="ml-1">4.9</span>
                                        <span className="text-gray-500 ml-1">(1395 reviews)</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="px-3 py-1 text-sm border rounded">Share</button>
                                    <button className="px-3 py-1 text-sm border rounded">Save</button>
                                </div>
                            </div>
                            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                                <video 
                                    controls
                                    className="w-full h-full"
                                    src={`/api/lectures/${selectedLecture.id}`}
                                />
                            </div>
                            <div className="border-b">
                                <div className="flex space-x-4">
                                    {lectureTabs.map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveLectureTab(tab)}
                                            className={`px-4 py-2 ${activeLectureTab === tab ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeLectureTab === 'Lecture Overview' && (
                                <div className="mt-4">
                                    <ul className="space-y-2">
                                        <li>Introduction</li>
                                        <li>Agile Methodologies</li>
                                        <li>Other Methodologies</li>
                                        <li>Conclusion</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex justify-between">
                            <div className="w-2/3 bg-white rounded-lg p-6 shadow-sm">
                                <h1 className="text-2xl font-bold mb-4">Course Overview</h1>
                                {/* Course content here */}
                            </div>

                            {/* Right Sidebar */}
                            <div className="w-1/3 pl-6">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="font-medium mb-4">Lectures & Tutorials</h3>
                                    <div className="text-sm text-gray-600 mb-2">2/7 Completed</div>
                                    <div className="space-y-2">
                                        {Array.from({ length: 7 }, (_, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <button 
                                                    onClick={() => setSelectedLecture({
                                                        id: i + 1,
                                                        type: i < 5 ? 'Lecture' : 'Tutorial',
                                                        number: i + 1
                                                    })}
                                                    className="text-sm text-left hover:text-red-600 transition-colors"
                                                >
                                                    {i + 1}.{i < 5 ? ` Lecture ${i + 1}` : ` Tutorial ${i - 4}`}
                                                </button>
                                                {renderStatus(i < 2 ? 'completed' : 'pending')}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Chatbot Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setShowChatbot(!showChatbot)}
                    className="bg-red-600 text-white rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-red-700 transition-colors"
                >
                    <span>AI Chatbot</span>
                </button>
            </div>

            {/* Chatbot Popup */}
            {showChatbot && (
                <div className={`fixed right-4 ${minimizedChatbot ? 'bottom-16' : 'bottom-20'} z-50 bg-white rounded-lg shadow-lg w-80 ${minimizedChatbot ? 'h-12' : 'h-96'} transition-all duration-300`}>
                    <div className="p-3 border-b flex justify-between items-center">
                        <h3 className="font-medium">AI Chatbot</h3>
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
                        <div className="p-4 h-full">
                            <div className="h-full flex flex-col">
                                <div className="flex-1 overflow-y-auto">
                                    {/* Chat messages would go here */}
                                </div>
                                <div className="mt-4">
                                    <input 
                                        type="text" 
                                        placeholder="Type your message..."
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CoursePage;
