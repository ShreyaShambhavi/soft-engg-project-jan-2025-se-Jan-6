import React from 'react';

const LectureViewer = ({ username = '', courseName = '', lecture = { title: '', videoUrl: '', thumbnailUrl: '' } }) => {
    
    const {
        title = 'Lecture Title',
        videoUrl = '',
        thumbnailUrl = ''
    } = lecture;

    // Function to convert YouTube watch URL to embed URL
    const getEmbedUrl = (url) => {
        try {
            // For YouTube URLs
            if (url && url.includes('youtube.com/watch')) {
                // Extract video ID
                const videoId = new URL(url).searchParams.get('v');
                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }
            
            // For youtu.be short URLs
            if (url && url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }
            
            // If it's already an embed URL, return as is
            if (url && url.includes('youtube.com/embed/')) {
                return url;
            }
            
            return url; // Return original if not a YouTube URL
        } catch (error) {
            console.error("Error parsing video URL:", error);
            return '';
        }
    };
    
    // Get the proper embed URL
    const embedUrl = getEmbedUrl(videoUrl);
    
    // Render component
    return (
        <main className="flex-1 p-6 overflow-y-auto relative">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>

                <div className="aspect-w-16 aspect-h-9 mb-6" style={{ height: '500px' }}>
                    {embedUrl ? (
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={embedUrl}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Video not available</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default LectureViewer;