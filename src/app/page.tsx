'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LiveFeatureBox from '@/components/LiveFeatureBox';
import VideoPlayer from '@/components/VideoPlayer';
import NoSSR from '@/components/NoSSR';

export default function Home() {
  const router = useRouter();
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streamsRes, videosRes] = await Promise.all([
          fetch('/api/streams'),
          fetch('/api/videos')
        ]);
        
        const streams = await streamsRes.json();
        const videos = await videosRes.json();
        
        setLiveStreams(streams);
        // Get the 4 most recent videos
        setRecentVideos(videos.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle video selection
  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  // Handle hero button clicks
  const handleWatchLiveClick = () => {
    router.push('/live');
  };

  const handleBrowseVideosClick = () => {
    router.push('/past-shows');
  };

  if (isLoading) {
    return (
      <NoSSR fallback={
        <div className="w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading content...</p>
          </div>
        </div>
      }>
        <div className="w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading content...</p>
          </div>
        </div>
      </NoSSR>
    );
  }

  return (
    <div className="w-full" suppressHydrationWarning>
      {/* Hero Section */}
      <section className="relative min-h-[500px] w-full overflow-hidden" suppressHydrationWarning>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 40%), url("https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3")'
          }}
        />
        <div className="container mx-auto px-4 py-12 sm:py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                    Welcome to Scope Media
                  </h1>
              <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mb-6 sm:mb-8 leading-relaxed">
                Your one-stop destination for the best live streams and video content.
                Experience premium quality streaming with our custom video player.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <button 
                  onClick={handleWatchLiveClick}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 sm:px-8 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                >
                  Watch Live Now
                </button>
                <button 
                  onClick={handleBrowseVideosClick}
                  className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-6 py-3 sm:px-8 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                >
                  Browse Videos
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
            <NoSSR fallback={
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Loading Content...</h2>
                  <p className="text-slate-700 mb-6">
                    Please wait while we load the latest content for you.
                  </p>
                </div>
              </div>
            }>
              {liveStreams.length === 0 && recentVideos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-16 bg-white rounded-xl shadow-sm"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">No Content Available</h2>
                    <p className="text-slate-700">
                      Content will appear here once it's available. 
                      Check back later for live streams and archived videos.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <LiveFeatureBox 
                  liveStreams={liveStreams}
                  recentVideos={recentVideos}
                  onVideoClick={handleVideoClick}
                />
              )}
            </NoSSR>
          </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <NoSSR>
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
        </NoSSR>
      )}
    </div>
  );
}