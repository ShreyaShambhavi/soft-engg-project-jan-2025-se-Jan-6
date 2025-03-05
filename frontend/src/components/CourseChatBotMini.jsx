import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CourseChatBotMini = ({ courseName }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef(null);

  const location = useLocation();
  const pathSegment = location.pathname.split('/').filter(segment => segment).pop() || 'default';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);
      const userMessage = { type: 'user', content: inputMessage };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          session_id: username || 'default',
          path_param: pathSegment.toLowerCase()
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = { type: 'bot', content: data.response };
        setMessages(prev => [...prev, botMessage]);
      } else {
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

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    const isError = message.type === 'error';

    return (
      <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block p-3 rounded-lg max-w-full ${
            isUser
              ? 'bg-blue-600 text-white'
              : isError
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {isUser || isError ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                  a: ({ node, href, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline hover:text-blue-800"
                      {...props}
                    />
                  ),
                  code: ({ node, inline, className, children, ...props }) => {
                    return inline ? (
                      <code className="bg-gray-100 text-red-500 px-1 rounded-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto mb-2">
                        <code className="text-sm text-gray-800" {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-2 italic" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="text-lg font-semibold">Hi, Let me help you out!</div>
        
      </header>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
        {courseName && (
          <div className="text-gray-600 mt-4">
            Current course: {courseName}
          </div>
        )}
      </div>

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
  );
};

export default CourseChatBotMini;
