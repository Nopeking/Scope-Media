'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Play, X } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';

export default function PastShowsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [pastShows, setPastShows] = useState<any[]>([]);
  const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVideos = localStorage.getItem('archivedVideos');
      if (storedVideos) {
        const videos = JSON.parse(storedVideos);
        setPastShows(videos);
        
        // Extract unique months
        const months = [...new Set(videos.map(video => video.month))].sort((a, b) => {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateB.getTime() - dateA.getTime();
        });
        setUniqueMonths(months);
      }
    }
  }, []);

  // Handle video selection
  const handleVideoClick = (show: any) => {
    setSelectedVideo(show);
    setShowVideoModal(true);
  };

  // Filter shows based on selected month
  const filteredShows = selectedMonth === 'All' 
    ? pastShows 
    : pastShows.filter(show => show.month === selectedMonth);

  // Group filtered shows by custom title
  const groupedShows = filteredShows.reduce((acc, show) => {
    if (!acc[show.customTitle]) {
      acc[show.customTitle] = [];
    }
    acc[show.customTitle].push(show);
    return acc;
  }, {} as Record<string, typeof pastShows>);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[300px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent 40%), url("https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3")'
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
                Past Shows
              </h1>
              <p className="text-xl text-slate-200 max-w-2xl">
                Explore our archive of past live streams and video content. 
                Watch at your own pace with our premium video library.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-white bg-slate-900/80 px-4 py-2 rounded-lg">Filter by Month</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedMonth('All')}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                selectedMonth === 'All'
                  ? 'bg-primary text-white'
                  : 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
              }`}
            >
              All
            </button>
            {uniqueMonths.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedMonth === month
                    ? 'bg-primary text-white'
                    : 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Shows Grid */}
        <div className="space-y-12">
          {Object.entries(groupedShows).map(([customTitle, shows], groupIndex) => (
            <motion.section
              key={customTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: groupIndex * 0.1 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 bg-slate-900/80 px-4 py-2 rounded-lg">{customTitle}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shows.map((show, index) => (
                  <motion.div
                    key={show.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: (groupIndex * 0.1) + (index * 0.05) }}
                    className="group flex flex-col gap-3 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVideoClick(show)}
                  >
                    <div className="relative w-full overflow-hidden rounded-lg aspect-video bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                         style={{ backgroundImage: `url(${show.thumbnail})` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      {/* Removed duration badge as requested */}

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div
                          className="bg-black/50 rounded-full p-4 backdrop-blur-sm"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Play className="h-12 w-12 text-white ml-1" />
                        </motion.div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-primary transition-colors mb-2 bg-slate-900/80 px-3 py-2 rounded-lg">
                        {show.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/80 px-3 py-2 rounded-lg">
                        <Calendar className="h-4 w-4" />
                        {new Date(show.uploadDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Empty State */}
        {filteredShows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No shows found</h3>
            <p className="text-slate-500">Try selecting a different month or check back later for new content.</p>
          </motion.div>
        )}
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
