import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Home, Book, Calendar, Users, FileText, Download, MoreVertical, Search, Bell } from 'lucide-react';

const CourseChatBot = ({ courseName }) => {
  // State for chat functionality
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, label: "Today" },
    { icon: <Book className="w-5 h-5" />, label: "Multi Bandits Question" },
    { icon: <Book className="w-5 h-5" />, label: "CNN Doubts" },
    { icon: <Book className="w-5 h-5" />, label: "Software Designing Query" },
    { divider: true, label: "Previous 7 days" },
    { icon: <Book className="w-5 h-5" />, label: "Web Design Workflow" },
    { icon: <Book className="w-5 h-5" />, label: "Alpha Beta Pruning" },
    { icon: <Book className="w-5 h-5" />, label: "Unit Testing" },
    { icon: <Book className="w-5 h-5" />, label: "Presentation Skills" },
  ];

  // Handle sending message to API
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);
      // Add user message to chat
      const userMessage = { type: 'user', content: inputMessage };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      // Send message to API
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          session_id: username || 'default' // Use username as session ID if available
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add API response to chat
        const botMessage = { type: 'bot', content: data.response };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Handle error
        const errorMessage = { type: 'error', content: 'Sorry, there was an error processing your message.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { type: 'error', content: 'Failed to connect to the chat server.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <img src="/IITm.png" alt="IIT Madras Logo" className="w-60 h-12 rounded" />
            {/*<div className="text-sm">
              <div className="font-semibold">IIT Madras</div>
              <div className="text-xs text-gray-600">Degree in Data Science and Applications</div>
            </div>*/}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="AI Chatbot"
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-4">
          <button className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
            + New chat
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item, index) => (
            item.divider ? (
              <div key={index} className="text-xs text-gray-500 px-3 py-2">{item.label}</div>
            ) : (
              <button
                key={index}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {item.icon}
                {item.label}
              </button>
            )
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <div className="text-2xl font-semibold">Hi, Let me help you out!</div>
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Bell className="w-5 h-5 text-gray-400" />
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
              <span className="text-sm">U</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {/* Chat messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {courseName && (
            <div className="text-gray-600 mt-4">
              Current course: {courseName}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="What are Transformers?"
              className="flex-1 outline-none text-sm p-3 border rounded-lg"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-500"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
          <div className="text-xs text-gray-400 mt-1 text-center">
            AI chatbot may produce inaccurate information about people, places, or facts
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseChatBot;
