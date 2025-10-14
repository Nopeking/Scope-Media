'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, AlertCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, thumbnail, autoplay = false }) => {
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string) => {
    console.log('Extracting YouTube ID from URL:', url);
    
    // Handle various YouTube URL formats including Live streams
    const patterns = [
      // Regular YouTube videos: youtube.com/watch?v=VIDEO_ID
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      // Short YouTube URLs: youtu.be/VIDEO_ID
      /(?:youtu\.be\/)([^&\n?#]+)/,
      // YouTube embed URLs: youtube.com/embed/VIDEO_ID
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      // YouTube Live URLs: youtube.com/live/VIDEO_ID
      /(?:youtube\.com\/live\/)([^&\n?#]+)/,
      // Generic patterns
      /(?:v=|v\/|embed\/)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        // YouTube video IDs are typically 11 characters, but live streams might be different
        if (videoId.length >= 10) {
          console.log('Found YouTube ID:', videoId);
          return videoId;
        }
      }
    }
    
    console.log('No valid YouTube ID found');
    return null;
  };

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
    console.log('Is YouTube URL:', isYoutube, 'for URL:', url);
    return isYoutube;
  };

  // Get embed URL for YouTube
  const getEmbedUrl = (url: string) => {
    const videoId = extractYouTubeId(url);
    console.log('Getting embed URL for video ID:', videoId);
    if (videoId) {
      // Check if it's a live stream URL
      const isLiveStream = url.includes('/live/');
      const embedUrl = isLiveStream 
        ? `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1&live=1`
        : `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1`;
      console.log('Generated embed URL:', embedUrl);
      console.log('Is live stream:', isLiveStream);
      return embedUrl;
    }
    console.log('No embed URL generated');
    return null;
  };

  // Debug logging
  useEffect(() => {
    console.log('=== VideoPlayer Debug ===');
    console.log('VideoPlayer props:', { url, thumbnail, autoplay });
    console.log('URL type:', typeof url);
    console.log('URL length:', url?.length);
    console.log('Is YouTube URL:', isYouTubeUrl(url));
    console.log('Video ID:', extractYouTubeId(url));
    console.log('Embed URL:', getEmbedUrl(url));
    console.log('========================');
  }, [url, thumbnail, autoplay]);

  const handlePlayPause = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowControls(false);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {!url ? (
        <div className="flex items-center justify-center h-full bg-gray-900 text-white">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-semibold">No Video URL</p>
            <p className="text-sm text-gray-400">Please provide a video URL</p>
          </div>
        </div>
      ) : !isYouTubeUrl(url) ? (
        <div className="flex items-center justify-center h-full bg-gray-900 text-white">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg font-semibold">Non-YouTube URL</p>
            <p className="text-sm text-gray-400 mb-4">This player currently supports YouTube videos only</p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </a>
          </div>
        </div>
      ) : !extractYouTubeId(url) ? (
        <div className="flex items-center justify-center h-full bg-gray-900 text-white">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-semibold">Invalid YouTube URL</p>
            <p className="text-sm text-gray-400 mb-4">Please provide a valid YouTube URL</p>
            <p className="text-xs text-gray-500 mb-4">URL provided: {url}</p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Try Opening in New Tab
            </a>
          </div>
        </div>
      ) : (
        <>
          <iframe
            src={getEmbedUrl(url)}
            title="Video Player"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setError('Failed to load video')}
          />
          
          {/* Overlay with custom play button */}
          {!playing && !autoplay && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity hover:bg-black/20"
              onClick={handlePlayPause}
            >
          <motion.div
                className="bg-black/50 rounded-full p-6 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play className="h-16 w-16 text-white ml-1" />
          </motion.div>
        </div>
      )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-lg font-semibold">Error Loading Video</p>
                <p className="text-sm text-gray-400 mb-4">{error}</p>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </a>
                  </div>
                </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
