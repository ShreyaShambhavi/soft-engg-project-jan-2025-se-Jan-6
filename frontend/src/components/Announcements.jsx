import React, { useState } from 'react';
import { BellRing, Home, Bell, Book, Calendar, Download, List, Search, User } from 'lucide-react';

const Announcements = () => {
    const announcements = [
        {
            id: 1,
            title: "Important Announcement",
            date: "10th Jan 2025",
            category: "Artificial Intelligence",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 2,
            title: "Week 5 Content Released",
            date: "10th Jan 2025",
            category: "Artificial Intelligence",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 3,
            title: "Milestone 3 Dealine Reminder",
            date: "10th Jan 2025",
            category: "Deadline",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 4,
            title: "LLM Live Session on 4th Feb 2025",
            date: "10th Jan 2025",
            category: "LLM",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 5,
            title: "Important Announcement",
            date: "10th Jan 2025",
            category: "Software Testing",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 6,
            title: "Week 5 Content Released",
            date: "10th Jan 2025",
            category: "Software Testing",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 7,
            title: "Important Announcement",
            date: "10th Jan 2025",
            category: "Software Testing",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 8,
            title: "Quiz 1 City Released",
            date: "10th Jan 2025",
            category: "Quiz",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 9,
            title: "Hall Ticket Released",
            date: "10th Jan 2025",
            category: "Examination",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
        {
            id: 10,
            title: "BSc Certificate Released",
            date: "10th Jan 2025",
            category: "Certificate",
            content: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident, animi deleniti incidunt dolor dignissimos quasi facere a. Perferendis tempora, quia cupiditate facilis voluptates animi, est ut molestias, maxime ex totam? Delectus rem, vero facere laudantium a aut ipsum fuga corporis natus blanditiis animi provident dolor labore accusantium ea, necessitatibus assumenda rerum! Minus natus corporis laboriosam. Omnis qui laudantium repellendus mollitia facere itaque, quibusdam reprehenderit similique fuga quas. Veritatis distinctio voluptas vel eum ipsum nemo eius maxime eaque ipsa. Dolor necessitatibus at soluta, blanditiis eligendi provident reiciendis vero cumque asperiores porro minus incidunt vel minima praesentium aut earum velit quo recusandae!",
            isImportant: true,
            isRead: false
        },
    ];

    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(1);

    const selectedAnnouncement = announcements.find(
        announcement => announcement.id === selectedAnnouncementId
    ) || announcements[0];

    const handleClose = () => {
        console.log('Close clicked');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Navbar */}
            <div className="bg-white border-b">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/1200px-IIT_Madras_Logo.svg.png" 
                            alt="IIT Madras Logo" 
                            className="w-12 h-12 rounded-full"
                        />
                        <div className="flex flex-col">
                            <span className="font-semibold">IIT Madras</span>
                            <span className="text-sm text-gray-500">Degree in Data Science and Applications</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Bell className="w-5 h-5 text-gray-400" />
                        <User className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="w-16 bg-white border-r">
                    <div className="flex flex-col items-center py-4 space-y-8">
                        <a href="/"> <Home className="w-6 h-6 text-gray-400 cursor-pointer" /> </a>
                        <Book className="w-6 h-6 text-gray-400 cursor-pointer" />
                        <Calendar className="w-6 h-6 text-gray-400 cursor-pointer" />
                        <List className="w-6 h-6 text-gray-400 cursor-pointer" />
                        <Download className="w-6 h-6 text-gray-400 cursor-pointer" />
                    </div>
                </div>

                {/* Announcements List */}
                <div className="w-100 bg-white border-r p-2">
                    <div className="p-4">
                        <h1 className="text-2xl font-bold mb-4">Announcments</h1>
                        <div className="space-y-2">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className={`p-3 rounded-lg cursor-pointer ${
                                        selectedAnnouncementId === announcement.id
                                            ? 'bg-red-50 border border-red-200'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => setSelectedAnnouncementId(announcement.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        {announcement.isImportant ? (
                                            <BellRing className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <Bell className="w-5 h-5 text-gray-400" />
                                        )}
                                        <span className={`${
                                            announcement.isRead ? 'text-gray-400' : 'text-gray-900'
                                        }`}>
                                            {announcement.title}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Announcement Content */}
                <div className="flex-1 p-10 bg-white">
                    <div className="max-w-screen">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>Announcement</span>
                            <span>/</span>
                            <span>{selectedAnnouncement.category}</span>
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold">{selectedAnnouncement.title}</h2>
                            <button 
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-sm text-gray-500 mb-4">
                            Date: {selectedAnnouncement.date}
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            {selectedAnnouncement.content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
