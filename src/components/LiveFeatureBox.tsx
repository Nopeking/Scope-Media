'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LiveStreamProps {
  id: string;
  title: string;
  thumbnail: string;
  url?: string;
  isLive: boolean;
  viewers?: number;
}

interface RecentVideoProps {
  id: string;
  title: string;
  thumbnail: string;
  url?: string;
  duration: string;
  uploadDate: string;
}

interface LiveFeatureBoxProps {
  liveStreams: LiveStreamProps[];
  recentVideos: RecentVideoProps[];
  onVideoClick?: (video: any) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const LiveFeatureBox: React.FC<LiveFeatureBoxProps> = ({ liveStreams, recentVideos, onVideoClick }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Live Now</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {liveStreams.map((stream) => (
            <motion.div key={stream.id} className="group flex flex-col gap-3" variants={itemVariants}>
              <div 
                className="block cursor-pointer" 
                onClick={() => onVideoClick ? onVideoClick(stream) : (stream.url && window.open(stream.url, '_blank'))}
              >
                <div className="relative w-full overflow-hidden rounded-lg aspect-video bg-cover bg-center transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={stream.thumbnail}
                    alt={stream.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                  {stream.isLive && (
                    <div className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase text-white">
                      Live
                    </div>
                  )}
                  {stream.viewers && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-xs font-semibold text-white">
                      {stream.viewers.toLocaleString()} viewers
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{stream.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Live Stream</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Recently Added Videos</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recentVideos.map((video) => (
            <motion.div key={video.id} className="group flex flex-col gap-3" variants={itemVariants}>
              <div 
                className="block cursor-pointer" 
                onClick={() => onVideoClick ? onVideoClick(video) : (video.url && window.open(video.url, '_blank'))}
              >
                <div className="relative w-full overflow-hidden rounded-lg aspect-video bg-cover bg-center transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                  {/* Duration removed as requested */}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{video.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{video.uploadDate}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default LiveFeatureBox;