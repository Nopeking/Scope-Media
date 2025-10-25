'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

export default function LivePage() {
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/streams');
        const streams = await response.json();
        setLiveStreams(streams);
      } catch (error) {
        console.error('Error fetching live streams:', error);
      }
    };
    
    fetchData();
  }, []);

  // Handle video selection
  const handleVideoClick = (stream: any) => {
    setSelectedVideo(stream);
    setShowVideoModal(true);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[400px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 40%), url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3")'
          }}
        />
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-bold text-white md:text-6xl mb-6">
                Live Streams
              </h1>
              <p className="text-xl text-slate-200 max-w-2xl">
                Watch live events and streams happening right now. Experience real-time content 
                with our premium streaming quality.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Currently Live</h2>
          
          {liveStreams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16 bg-white rounded-xl shadow-sm"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">No Live Streams</h2>
                <p className="text-slate-700">
                  There are currently no live streams available. 
                  Check back later for new live content.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {liveStreams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="aspect-video">
                  <VideoPlayer
                    url={stream.url}
                    thumbnail={stream.thumbnail}
                    autoplay={index === 0}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-slate-800">{stream.title}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="font-semibold">LIVE</span>
                      </div>
                      <div className="text-slate-600">
                        {stream.viewers?.toLocaleString()} viewers
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600">
                    Join thousands of viewers watching this live stream right now. 
                    Don't miss out on this exclusive content.
                  </p>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">{selectedVideo.title}</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <VideoPlayer
                url={selectedVideo.url}
                thumbnail={selectedVideo.thumbnail}
                autoplay={true}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
