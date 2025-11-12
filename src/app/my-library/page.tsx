'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Video, Image, FileText, Eye, Download, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserLibraryItem } from '@/types';
import AuthModal from '@/components/AuthModal';
import { useHydrationFix } from '@/hooks/useHydrationFix';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MyLibraryContent() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [libraryItems, setLibraryItems] = useState<UserLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'video' | 'photo' | 'document'>('all');
  const [selectedItem, setSelectedItem] = useState<UserLibraryItem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [hasLinkedRider, setHasLinkedRider] = useState<boolean | null>(null);
  const [checkingRiderLink, setCheckingRiderLink] = useState(true);
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get('userId');

  useHydrationFix();

  // Check if user has linked a rider profile
  useEffect(() => {
    const checkLinkedRider = async () => {
      if (!user || userIdParam) {
        // Skip check if not logged in or viewing another user's library (admin)
        setCheckingRiderLink(false);
        setHasLinkedRider(true); // Allow admins to bypass
        return;
      }

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('Rider check timed out - allowing access');
        setHasLinkedRider(false); // Show linking requirement on timeout
        setCheckingRiderLink(false);
      }, 5000); // 5 second timeout

      try {
        const response = await fetch(`/api/riders/link?user_id=${user.id}`);
        clearTimeout(timeoutId);

        if (!response.ok) {
          // If API fails, show linking requirement
          console.error('Failed to check rider link:', response.statusText);
          setHasLinkedRider(false);
          setCheckingRiderLink(false);
          return;
        }

        const data = await response.json();

        if (data.success && data.links && data.links.length > 0) {
          setHasLinkedRider(true);
        } else {
          setHasLinkedRider(false);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error checking linked rider:', error);
        // On error, show linking requirement instead of blocking
        setHasLinkedRider(false);
      } finally {
        setCheckingRiderLink(false);
      }
    };

    if (user && !authLoading) {
      checkLinkedRider();
    } else if (!authLoading && !user && !userIdParam) {
      setCheckingRiderLink(false);
      setShowAuthModal(true);
    } else if (userIdParam && !authLoading) {
      setCheckingRiderLink(false);
      setHasLinkedRider(true); // Admin viewing
    }
  }, [user, authLoading, userIdParam]);

  useEffect(() => {
    if (user && !authLoading && hasLinkedRider === true) {
      fetchLibraryItems();
    } else if (userIdParam && !authLoading) {
      // If viewing another user's library (admin access)
      fetchLibraryItems(userIdParam);
    }
  }, [user, authLoading, userIdParam, hasLinkedRider]);

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
      // Fetch library items from rider_library based on linked riders
      const response = await fetch(`/api/rider-library?userId=${userId}`);
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

  const handleView = (item: UserLibraryItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDownload = (item: UserLibraryItem) => {
    // Open the file URL in a new tab - browser will handle download based on file type
    window.open(item.file_url, '_blank');
  };

  const handleDelete = async (item: UserLibraryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/rider-library?id=${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the item from the local state
        setLibraryItems(libraryItems.filter(i => i.id !== item.id));
        alert('Library item deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting library item:', error);
      alert('Error deleting library item');
    }
  };

  // Check if current user is an admin
  // If viewing another user's library (userIdParam), they're an admin
  // OR if their subscription plan is enterprise
  const isAdmin = !!userIdParam || userProfile?.subscription_plan === 'enterprise';

  // Debug logging
  console.log('🔍 Admin Check:', {
    userProfile,
    subscription_plan: userProfile?.subscription_plan,
    userIdParam,
    isAdmin,
    email: user?.email
  });

  if (authLoading || checkingRiderLink || loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {checkingRiderLink ? 'Checking rider profile...' : userIdParam ? 'Loading library...' : 'Loading your library...'}
          </p>
        </div>
      </div>
    );
  }

  // Show rider linking requirement
  if (user && hasLinkedRider === false && !userIdParam) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <svg
                className="h-20 w-20 text-blue-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
              Link Your Rider Profile
            </h1>
            <p className="text-slate-600 mb-6">
              To access your library, you need to link your rider profile using your FEI Registration number first.
            </p>
            <div className="space-y-3">
              <Link
                href="/profile/link-rider"
                className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Link Rider Profile Now
              </Link>
              <p className="text-sm text-slate-500">
                This helps us verify your identity and provide personalized content.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Why is this required?</h3>
              <ul className="text-xs text-slate-600 space-y-1 text-left">
                <li>✓ Access to your personal content library</li>
                <li>✓ Personalized competition information</li>
                <li>✓ Secure access to your rider data</li>
                <li>✓ Automatic updates from federation</li>
              </ul>
            </div>
          </div>
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
            <div className="h-16 w-16 text-slate-400 mx-auto mb-4 flex items-center justify-center">
              <Video className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {filter === 'all' ? 'No items in your library yet' : `No ${filter}s found`}
            </h3>
            <p className="text-slate-600">
              {filter === 'all' 
                ? 'Your personal library will appear here once content is available'
                : `No ${filter}s available at the moment`
              }
            </p>
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
                    <button
                      onClick={() => handleView(item)}
                      className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        title="Delete (Admin only)"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedItem && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setShowViewModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">{selectedItem.title}</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                {selectedItem.content_type === 'video' && (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={selectedItem.file_url}
                      title={selectedItem.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}
                {selectedItem.content_type === 'photo' && (
                  <div className="flex items-center justify-center">
                    <img
                      src={selectedItem.file_url}
                      alt={selectedItem.title}
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>
                )}
                {selectedItem.description && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Description</h4>
                    <p className="text-slate-600">{selectedItem.description}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleDownload(selectedItem)}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleDelete(selectedItem);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
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
