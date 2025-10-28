'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LivePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [liveStreams, setLiveStreams] = useState<any[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/live');
    }
  }, [user, loading, router]);

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

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/live\/)([^&\n?#]+)/,
      /(?:v=|v\/|embed\/)([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  // Handle video selection - navigate to player page
  const handleVideoClick = (stream: any) => {
    const videoId = extractYouTubeId(stream.url);
    const params = new URLSearchParams({
      videoId: videoId || stream.url,
      title: stream.title
    });
    router.push(`/player?${params.toString()}`);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[400px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url("/live-hero-card.webp")'
          }}
        />
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-bold text-white md:text-6xl mb-6 drop-shadow-lg">
                Live Streams
              </h1>
              <p className="text-xl text-slate-200 max-w-2xl drop-shadow-md">
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
          <h2 className="text-3xl font-bold text-white dark:text-white mb-8">Currently Live</h2>
          
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
            <div className="flex justify-center items-center">
              <div className="w-full max-w-5xl space-y-12">
                {liveStreams.map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => handleVideoClick(stream)}
                    onContextMenu={(e) => { e.preventDefault(); return false; }}
                    className="mx-auto bg-slate-800 dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <div className="relative aspect-video overflow-hidden" onContextMenu={(e) => { e.preventDefault(); return false; }}>
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        draggable={false}
                        onContextMenu={(e) => { e.preventDefault(); return false; }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="w-28 h-28 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-2xl">
                          <svg className="w-14 h-14 text-slate-800 ml-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute top-6 right-6 flex items-center gap-3 bg-green-600 text-white px-6 py-3 rounded-full text-xl font-bold shadow-2xl">
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">
                        {stream.title}
                      </h3>
                      <p className="text-xl text-slate-300 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Click to watch now
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
