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
      <section className="mt-8 sm:mt-12 mb-12 sm:mb-16">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-1 h-6 sm:h-8 bg-red-500 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Live Now</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {liveStreams.map((stream) => (
            <motion.div key={stream.id} className="group flex flex-col gap-3" variants={itemVariants}>
              <div
                className="block cursor-pointer"
                onClick={() => onVideoClick ? onVideoClick(stream) : (stream.url && window.open(stream.url, '_blank'))}
                onContextMenu={(e) => { e.preventDefault(); return false; }}
              >
                <div
                  className="relative w-full overflow-hidden rounded-lg aspect-video bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  onContextMenu={(e) => { e.preventDefault(); return false; }}
                >
                  <Image
                    src={stream.thumbnail}
                    alt={stream.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    draggable={false}
                    onContextMenu={(e) => { e.preventDefault(); return false; }}
                  />
                  {stream.isLive && (
                    <div className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold uppercase text-white">
                      Live
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
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center my-6 sm:my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
        <div className="mx-4 px-3 py-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">• • •</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
      </div>

      <section className="mt-6 sm:mt-8 mb-8 sm:mb-12">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-1 h-6 sm:h-8 bg-primary rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Recently Added Videos</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recentVideos.map((video) => (
            <motion.div key={video.id} className="group flex flex-col gap-3" variants={itemVariants}>
              <div
                className="block cursor-pointer"
                onClick={() => onVideoClick ? onVideoClick(video) : (video.url && window.open(video.url, '_blank'))}
                onContextMenu={(e) => { e.preventDefault(); return false; }}
              >
                <div
                  className="relative w-full overflow-hidden rounded-lg aspect-video bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  onContextMenu={(e) => { e.preventDefault(); return false; }}
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    draggable={false}
                    onContextMenu={(e) => { e.preventDefault(); return false; }}
                  />
                  {/* Duration removed as requested */}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{video.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Click to watch</p>
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default LiveFeatureBox;