'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Video, Image, FileText, Trash2, Edit, Share2, Eye, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserLibraryItem } from '@/types';
import AuthModal from '@/components/AuthModal';
import { useHydrationFix } from '@/hooks/useHydrationFix';
import { useSearchParams } from 'next/navigation';

function MyLibraryContent() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [libraryItems, setLibraryItems] = useState<UserLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'video' | 'photo' | 'document'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get('userId');

  useHydrationFix();

  useEffect(() => {
    if (user && !authLoading) {
      fetchLibraryItems();
    } else if (userIdParam && !authLoading) {
      // If viewing another user's library (admin access)
      fetchLibraryItems(userIdParam);
    } else if (!authLoading && !user && !userIdParam) {
      setShowAuthModal(true);
    }
  }, [user, authLoading, userIdParam]);

  // Handle the case where we're viewing another user's library
  useEffect(() => {
    if (userIdParam && !authLoading && !user) {
      fetchLibraryItems(userIdParam);
    }
  }, [userIdParam, authLoading, user]);

  const fetchLibraryItems = async (targetUserId?: string) => {
    const userId = targetUserId || user?.id;
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/user-library?userId=${userId}`);
      if (response.ok) {
        const items = await response.json();
        setLibraryItems(items);
      }
    } catch (error) {
      console.error('Error fetching library items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = libraryItems.filter(item => 
    filter === 'all' || item.content_type === filter
  );

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'photo': return <Image className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (authLoading || loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {userIdParam ? 'Loading library...' : 'Loading your library...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user && !userIdParam) {
    return (
      <>
        <div className="w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">My Library</h1>
            <p className="text-slate-600 mb-6">Please sign in to access your personal library</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {userIdParam ? 'User Library' : 'My Library'}
            </h1>
            <p className="text-slate-600">
              {userIdParam 
                ? `Viewing library for user: ${userIdParam.substring(0, 8)}...`
                : `Welcome back, ${userProfile?.full_name || user?.email}!`
              }
            </p>
          </div>
          {!userIdParam && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 sm:mt-0 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Content
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'all', label: 'All Items', count: libraryItems.length },
            { key: 'video', label: 'Videos', count: libraryItems.filter(item => item.content_type === 'video').length },
            { key: 'photo', label: 'Photos', count: libraryItems.filter(item => item.content_type === 'photo').length },
            { key: 'document', label: 'Documents', count: libraryItems.filter(item => item.content_type === 'document').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Library Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {filter === 'all' ? 'No items in your library yet' : `No ${filter}s found`}
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === 'all' 
                ? 'Start by uploading your first piece of content'
                : `Try uploading some ${filter}s or check other categories`
              }
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Upload Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail/Preview */}
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400">
                      {getContentIcon(item.content_type)}
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 truncate flex-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      {getContentIcon(item.content_type)}
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Size: {formatFileSize(item.file_size)}</div>
                    {item.duration && <div>Duration: {item.duration}</div>}
                    <div>Uploaded: {new Date(item.created_at).toLocaleDateString()}</div>
                    {item.uploaded_by_admin && (
                      <div className="text-blue-600 font-medium">Uploaded by Admin</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button className="flex-1 bg-slate-100 text-slate-600 px-3 py-1 rounded text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Modal Placeholder */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Upload Content</h3>
              <p className="text-slate-600 mb-6">Upload functionality coming soon!</p>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    </div>
  );
}

export default function MyLibraryPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading library...</p>
        </div>
      </div>
    }>
      <MyLibraryContent />
    </Suspense>
  );
}
