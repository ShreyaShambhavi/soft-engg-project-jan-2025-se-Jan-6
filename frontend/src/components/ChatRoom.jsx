/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, MoreHorizontal, Paperclip, Image, MapPin, Send, ChevronDown, X, Download, Edit, Trash2, Check, MoreVertical } from 'lucide-react';
import axios from 'axios';

const StudyChatRoom = () => {
  // Keep existing state variables
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add new state variables for editing
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessageText, setEditedMessageText] = useState('');
  const [messageActionsId, setMessageActionsId] = useState(null); // Which message shows its actions menu
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // Which message is awaiting delete confirmation
  
  const messagesEndRef = useRef(null);
  const messageUpdateInterval = useRef(null);
  const editInputRef = useRef(null); // Reference to the edit input field

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Memoize fetch functions with useCallback to avoid dependency issues
  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/v1/chatrooms', {
        withCredentials: true
      });
      
      // Process the received chatrooms to ensure we have the last message info
      const roomsWithMsgInfo = await Promise.all(response.data.chatrooms.map(async room => {
        // For each chatroom, make an additional request to get latest message
        try {
          const msgResponse = await axios.get(`http://127.0.0.1:5000/api/v1/messages/${room.id}`, {
            withCredentials: true
          });
          
          // Get the most recent message if any exists
          const messages = msgResponse.data.messages || [];
          const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
          
          return {
            ...room,
            lastMessage: latestMessage ? latestMessage.message : null,
            lastMessageTime: latestMessage ? latestMessage.timestamp : null,
            lastMessageUser: latestMessage ? latestMessage.user.username : null
          };
        } catch (err) {
          console.error(`Error fetching messages for room ${room.id}:`, err);
          return room; // Return original room data if message fetch fails
        }
      }));
      
      setChatRooms(roomsWithMsgInfo);
      
      // If courseId is provided, select that chatroom
      if (courseId) {
        const selectedRoom = roomsWithMsgInfo.find(room => room.courseId === parseInt(courseId));
        if (selectedRoom) {
          setSelectedChatRoom(selectedRoom);
        }
      } else if (roomsWithMsgInfo.length > 0) {
        // Otherwise select the first chatroom
        setSelectedChatRoom(roomsWithMsgInfo[0]);
      }
    } catch (err) {
      console.error('Error fetching chatrooms:', err);
      setError('Failed to load chat rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Fetch messages for a chatroom
  const fetchMessages = useCallback(async (chatroomId) => {
    if (!chatroomId) return;
    
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/v1/messages/${chatroomId}`, {
        withCredentials: true
      });
      setMessages(response.data.messages);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  // Fetch course members
  const fetchCourseMembers = useCallback(async (courseId) => {
    if (!courseId) return;
    
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/v1/course-members/${courseId}`, {
        withCredentials: true
      });
      setMembers(response.data.members);
    } catch (err) {
      console.error('Error fetching course members:', err);
    }
  }, []);

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatRoom) return;
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/v1/messages', {
        courseId: selectedChatRoom.courseId,
        message: newMessage
      }, {
        withCredentials: true
      });
      
      // Add the new message to the messages list
      setMessages(prevMessages => [...prevMessages, response.data.messageData]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Initial load - only runs once
  useEffect(() => {
    fetchChatRooms();
    
    return () => {
      // Clean up interval on component unmount
      if (messageUpdateInterval.current) {
        clearInterval(messageUpdateInterval.current);
        messageUpdateInterval.current = null;
      }
    };
  }, [fetchChatRooms]); // fetchChatRooms is now stable with useCallback

  // Handle message polling and cleanup when selectedChatRoom changes
  useEffect(() => {
    // Clear any existing interval
    if (messageUpdateInterval.current) {
      clearInterval(messageUpdateInterval.current);
      messageUpdateInterval.current = null;
    }
    
    // Only set up polling if we have a selected chatroom
    if (selectedChatRoom?.id) {
      // Immediately fetch messages
      fetchMessages(selectedChatRoom.id);
      fetchCourseMembers(selectedChatRoom.courseId);
      
      // Then set up polling
      messageUpdateInterval.current = setInterval(() => {
        fetchMessages(selectedChatRoom.id);
      }, 5000);
    }
    
    return () => {
      if (messageUpdateInterval.current) {
        clearInterval(messageUpdateInterval.current);
        messageUpdateInterval.current = null;
      }
    };
  }, [selectedChatRoom, fetchMessages, fetchCourseMembers]);

  // Rest of your component remains the same...

  // Format timestamp for display
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return formatTime(isoString);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Generate avatar initials and color
  const getAvatarInfo = (username) => {
    if (!username) return { initials: '?', color: 'bg-gray-500' };
    
    const initials = username.charAt(0).toUpperCase();
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
    const colorIndex = Math.abs(username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    
    return {
      initials,
      color: colors[colorIndex]
    };
  };

  // Add new function to handle edit message
  const handleEditMessage = async (messageId) => {
    // Find the message to edit
    const messageToEdit = messages.find(msg => msg.id === messageId);
    if (!messageToEdit) return;
    
    // Set editing state
    setEditingMessageId(messageId);
    setEditedMessageText(messageToEdit.message);
    
    // Focus the edit input after it renders
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 50);
  };

  // Add function to save edited message
  const saveEditedMessage = async () => {
    if (!editingMessageId || !editedMessageText.trim()) {
      setEditingMessageId(null);
      return;
    }
    
    try {
      const response = await axios.put(`http://127.0.0.1:5000/api/v1/messages/${editingMessageId}`, {
        message: editedMessageText
      }, {
        withCredentials: true
      });
      
      // Update the message in the local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === editingMessageId 
            ? { ...msg, message: editedMessageText, edited: true }
            : msg
        )
      );
      
      // Clear editing state
      setEditingMessageId(null);
      setEditedMessageText('');
    } catch (err) {
      console.error('Error editing message:', err);
      // Optionally show an error notification
    }
  };

  // Add function to cancel editing
  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setEditedMessageText('');
  };

  // Add function to handle delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/v1/messages/${messageId}`, {
        withCredentials: true
      });
      
      // Remove the message from the local state
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      
      // Clear delete confirmation state
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting message:', err);
      // Optionally show an error notification
    }
  };

  // Add keyboard event handler for edit mode
  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditedMessage();
    } else if (e.key === 'Escape') {
      cancelEditMessage();
    }
  };

  // When clicking outside message actions, close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageActionsId && !event.target.closest('.message-actions')) {
        setMessageActionsId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messageActionsId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => fetchChatRooms()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-72 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <img 
              src="/IITm.png" 
              alt="IIT Madras Logo" 
              className="w-60 h-12 rounded cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
        </div>

        {/* Study Chat Rooms */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Study Chat Rooms</h2>
          
          {/* Removed the Personal/Group tab selection */}

          {/* Chat List */}
          <div className="space-y-2">
            {chatRooms.length === 0 ? (
              <p className="text-gray-500 text-sm p-4 text-center">
                No chat rooms available. Please enroll in courses.
              </p>
            ) : (
              chatRooms.map((room) => {
                const avatarInfo = getAvatarInfo(room.courseName);
                return (
                  <div 
                    key={room.id} 
                    className={`flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${
                      selectedChatRoom?.id === room.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setSelectedChatRoom(room)}
                  >
                    <div className={`w-10 h-10 rounded-lg ${avatarInfo.color} flex items-center justify-center text-white`}>
                      {avatarInfo.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate">{room.courseName}</div>
                        <div className="text-xs text-gray-500">
                          {room.lastMessageTime ? formatDate(room.lastMessageTime) : ''}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {room.lastMessage || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {selectedChatRoom ? (
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${getAvatarInfo(selectedChatRoom.courseName).color} rounded-lg flex items-center justify-center text-white`}>
                {getAvatarInfo(selectedChatRoom.courseName).initials}
              </div>
              <div>
                <div className="font-semibold">{selectedChatRoom.courseName}</div>
                <div className="text-sm text-gray-500">{members.length} participants</div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 border-b">
            <div className="text-gray-500">Select a chat room</div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChatRoom ? (
            messages.length > 0 ? (
              messages.map((msg, index) => {
                const isCurrentUser = msg.user.isCurrentUser;
                const avatarInfo = getAvatarInfo(msg.user.username);
                const isEditing = editingMessageId === msg.id;
                const isDeleting = deleteConfirmId === msg.id;
                const showActions = messageActionsId === msg.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} gap-3 max-w-[80%] relative group`}>
                      <div className={`w-8 h-8 ${avatarInfo.color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                        {avatarInfo.initials}
                      </div>
                      
                      <div>
                        <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-sm font-medium">{msg.user.username}</span>
                          <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                          {msg.edited && <span className="text-xs text-gray-400 italic">(edited)</span>}
                        </div>
                        
                        {isEditing ? (
                          <div className="flex flex-col">
                            <textarea
                              ref={editInputRef}
                              value={editedMessageText}
                              onChange={(e) => setEditedMessageText(e.target.value)}
                              onKeyDown={handleEditKeyPress}
                              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button 
                                onClick={cancelEditMessage}
                                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={saveEditedMessage}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                disabled={!editedMessageText.trim()}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : isDeleting ? (
                          <div className={`p-3 rounded-lg bg-red-50 border border-red-200`}>
                            <p className="text-gray-600 mb-2">Delete this message?</p>
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`p-3 rounded-lg ${
                            isCurrentUser ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800'
                          } relative`}>
                            {msg.message}
                            
                            {/* Message actions menu for current user's messages */}
                            {isCurrentUser && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setMessageActionsId(showActions ? null : msg.id)}
                                  className="p-1 rounded-full hover:bg-black hover:bg-opacity-20"
                                >
                                  <MoreVertical size={14} className="text-current" />
                                </button>
                                
                                {/* Dropdown menu */}
                                {showActions && (
                                  <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md py-1 z-10 message-actions">
                                    <button 
                                      onClick={() => {
                                        setMessageActionsId(null);
                                        handleEditMessage(msg.id);
                                      }}
                                      className="flex items-center w-full px-3 py-1 text-sm text-left text-gray-700 hover:bg-gray-100"
                                    >
                                      <Edit size={14} className="mr-2" /> Edit
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setMessageActionsId(null);
                                        setDeleteConfirmId(msg.id);
                                      }}
                                      className="flex items-center w-full px-3 py-1 text-sm text-left text-red-600 hover:bg-gray-100"
                                    >
                                      <Trash2 size={14} className="mr-2" /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>No messages yet</p>
                  <p className="text-sm">Be the first to send a message!</p>
                </div>
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-500">
                <p>Select a chat room to start messaging</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Scroll anchor */}
        </div>

        {/* Input Area */}
        {selectedChatRoom && (
          <div className="p-4 border-t">
            <form onSubmit={sendMessage} className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex gap-2">
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <Image className="w-5 h-5" />
                </button>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button 
                type="submit" 
                className={`${newMessage.trim() ? 'text-red-500 hover:text-red-600' : 'text-gray-300'}`}
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right Sidebar - Chat Details */}
      <div className="w-80 border-l hidden md:block">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Chat Details</h2>
          <button className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedChatRoom ? (
          <>
            {/* Members Section */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Members</h3>
                <div className="text-sm text-gray-500">{members.length} participants</div>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {members.map((member) => {
                  const avatarInfo = getAvatarInfo(member.username);
                  const isAdmin = member.roles.includes('admin') || member.roles.includes('teacher');
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${avatarInfo.color} rounded-full flex items-center justify-center text-white`}>
                          {avatarInfo.initials}
                        </div>
                        <div className="text-sm font-medium">{member.username}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                        {member.isCurrentUser && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Files Section (placeholder) */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Shared Files</h3>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-center text-sm text-gray-500 py-4">
                No files shared yet
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Select a chat room to see details
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyChatRoom;