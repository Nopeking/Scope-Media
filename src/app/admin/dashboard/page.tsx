'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Play, Pause, Upload, Users, Eye, Settings } from 'lucide-react';
import { LiveStream, ArchivedVideo } from '@/types';

// Initial data arrays - will be populated when content is added
const initialLiveStreams: LiveStream[] = [];
const initialArchivedVideos: ArchivedVideo[] = [];
const initialCustomTitles: string[] = ['Tech Conferences', 'Cooking Shows', 'Music Events'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('content'); // 'content', 'stream', 'video', 'title'
  
  // State for managing content
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(initialLiveStreams);
  const [archivedVideos, setArchivedVideos] = useState<ArchivedVideo[]>(initialArchivedVideos);
  const [customTitles, setCustomTitles] = useState<string[]>(initialCustomTitles);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    customTitle: '',
    thumbnail: ''
  });
  
  // File upload state
  const [uploadedThumbnail, setUploadedThumbnail] = useState<string | null>(null);

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [streamsRes, videosRes, titlesRes] = await Promise.all([
          fetch('/api/streams'),
          fetch('/api/videos'),
          fetch('/api/titles')
        ]);
        
        const streams = await streamsRes.json();
        const videos = await videosRes.json();
        const titles = await titlesRes.json();
        
        setLiveStreams(streams);
        setArchivedVideos(videos);
        setCustomTitles(titles);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'live-streams', label: 'Live Streams', icon: Play },
    { id: 'archived-videos', label: 'Archived Videos', icon: Pause },
    { id: 'custom-titles', label: 'Custom Titles', icon: Settings },
    { id: 'users', label: 'Users', icon: Users },
  ];

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedThumbnail(result);
        setFormData(prev => ({
          ...prev,
          thumbnail: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to add new content
  const handleAddContent = async () => {
    // Validate based on modal type
    if (modalType === 'stream') {
      if (!formData.title || !formData.url) {
        alert('Please fill in all required fields for the live stream.');
        return;
      }
    } else if (modalType === 'video') {
      if (!formData.title || !formData.url || !formData.customTitle) {
        alert('Please fill in all required fields for the archived video.');
        return;
      }
    } else if (modalType === 'title') {
      if (!formData.title.trim()) {
        alert('Please enter a custom title name.');
        return;
      }
    }

    try {
    if (modalType === 'stream') {
      const newStream = {
        id: Date.now().toString(),
        title: formData.title,
        url: formData.url,
        thumbnail: formData.thumbnail || `https://img.youtube.com/vi/${extractYouTubeId(formData.url)}/hqdefault.jpg`,
        status: 'live',
        viewers: Math.floor(Math.random() * 1000) + 100,
        date: new Date().toLocaleDateString()
      };
      
        const response = await fetch('/api/streams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStream)
        });
        
        if (response.ok) {
          setLiveStreams((prev: LiveStream[]) => [...prev, newStream]);
        }
    } else if (modalType === 'video') {
      const newVideo = {
        id: Date.now().toString(),
        title: formData.title,
        url: formData.url,
        thumbnail: formData.thumbnail || `https://img.youtube.com/vi/${extractYouTubeId(formData.url)}/hqdefault.jpg`,
        duration: '00:00', // Placeholder, ideally fetched from YouTube API
        uploadDate: new Date().toLocaleDateString(),
        customTitle: formData.customTitle,
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
      
        const response = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVideo)
        });
        
        if (response.ok) {
          setArchivedVideos((prev: ArchivedVideo[]) => [...prev, newVideo]);
        }
    } else if (modalType === 'title') {
      if (formData.title.trim() && !customTitles.includes(formData.title.trim())) {
          const response = await fetch('/api/titles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: formData.title.trim() })
          });
          
          if (response.ok) {
            const updatedTitles = await response.json();
            setCustomTitles(updatedTitles);
          }
        }
    }

    // Reset form and close modal
    setFormData({ title: '', url: '', customTitle: '', thumbnail: '' });
    setUploadedThumbnail(null);
    setShowAddModal(false);
    } catch (error) {
      console.error('Error adding content:', error);
      alert('Failed to add content. Please try again.');
    }
  };

  // Function to extract YouTube video ID from URL
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Function to delete content
  const handleDeleteContent = async (id: string, type: 'stream' | 'video' | 'title') => {
    try {
    if (type === 'stream') {
        const response = await fetch(`/api/streams?id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setLiveStreams((prev: LiveStream[]) => prev.filter(item => item.id !== id));
        }
    } else if (type === 'video') {
        const response = await fetch(`/api/videos?id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setArchivedVideos((prev: ArchivedVideo[]) => prev.filter(item => item.id !== id));
        }
    } else if (type === 'title') {
        const response = await fetch(`/api/titles?title=${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setCustomTitles((prev: string[]) => prev.filter(title => title !== id));
        }
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200" suppressHydrationWarning>
        <div className="container mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="flex items-center justify-between gap-2" suppressHydrationWarning>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0" suppressHydrationWarning>
              <img 
                src="/logo.png" 
                alt="Scope Media Logo" 
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain flex-shrink-0"
              />
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-slate-800 truncate">
                Scope Media - Admin Dashboard
              </h1>
            </div>
            <button className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors flex-shrink-0">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8" suppressHydrationWarning>
          {/* Sidebar */}
          <aside className="lg:w-64" suppressHydrationWarning>
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 lg:gap-3 px-3 py-2 lg:px-4 lg:py-3 rounded-lg text-left transition-colors whitespace-nowrap flex-shrink-0 lg:w-full text-sm lg:text-base ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1" suppressHydrationWarning>
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" suppressHydrationWarning>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Overview</h2>
                  <button
                    onClick={() => {
                      setModalType('content');
                      setShowAddModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    suppressHydrationWarning
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Add Content
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" suppressHydrationWarning>
                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm" suppressHydrationWarning>
                    <div className="flex items-center gap-3" suppressHydrationWarning>
                      <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0" suppressHydrationWarning>
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div suppressHydrationWarning>
                        <p className="text-xs sm:text-sm text-slate-600">Active Streams</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800">{liveStreams.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm" suppressHydrationWarning>
                    <div className="flex items-center gap-3" suppressHydrationWarning>
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0" suppressHydrationWarning>
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                          <div suppressHydrationWarning>
                        <p className="text-xs sm:text-sm text-slate-600">Total Viewers</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800">{liveStreams.reduce((sum: number, stream) => sum + (stream.viewers || 0), 0)}</p>
                          </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm" suppressHydrationWarning>
                    <div className="flex items-center gap-3" suppressHydrationWarning>
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0" suppressHydrationWarning>
                        <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                          <div suppressHydrationWarning>
                        <p className="text-xs sm:text-sm text-slate-600">Archived Videos</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800">{archivedVideos.length}</p>
                          </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm" suppressHydrationWarning>
                    <div className="flex items-center gap-3" suppressHydrationWarning>
                      <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0" suppressHydrationWarning>
                        <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                          <div suppressHydrationWarning>
                        <p className="text-xs sm:text-sm text-slate-600">Custom Titles</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800">{customTitles.length}</p>
                          </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'live-streams' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" suppressHydrationWarning>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Live Streams</h2>
                  <button 
                    onClick={() => {
                      console.log('Add Stream button clicked!');
                      setModalType('stream');
                      setShowAddModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    suppressHydrationWarning
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Add Stream
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Mobile Card View */}
                  <div className="block md:hidden">
                    {liveStreams.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        No live streams yet. Click "Add Stream" to create one.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200">
                        {liveStreams.map((stream) => (
                          <div key={stream.id} className="p-4">
                            <div className="flex items-start gap-3">
                              <img 
                                src={stream.thumbnail} 
                                alt={stream.title}
                                className="w-20 h-14 object-cover rounded flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-900 truncate">{stream.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    stream.status === 'live' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {stream.status}
                                  </span>
                                  <span className="text-xs text-slate-500">{(stream.viewers || 0).toLocaleString()} viewers</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 truncate">{stream.url}</p>
                              </div>
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <button className="text-blue-500 hover:text-blue-700 p-1">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteContent(stream.id, 'stream')}
                                  className="text-red-600 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Viewers</th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RTMP URL</th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                          <tbody className="divide-y divide-slate-200">
                        {liveStreams.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                              No live streams yet. Click "Add Stream" to create one.
                            </td>
                          </tr>
                        ) : (
                          liveStreams.map((stream) => (
                          <tr key={stream.id}>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={stream.thumbnail} 
                                  alt={stream.title}
                                  className="w-12 h-8 object-cover rounded"
                                />
                                {stream.title}
                              </div>
                            </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                stream.status === 'live' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {stream.status}
                              </span>
                            </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                {(stream.viewers || 0).toLocaleString()}
                            </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-500 max-w-xs truncate">
                              {stream.url}
                            </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              <div className="flex items-center gap-2">
                                <button className="text-blue-500 hover:text-blue-700">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteContent(stream.id, 'stream')}
                                  className="text-red-600 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'archived-videos' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" suppressHydrationWarning>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Archived Videos</h2>
                  <button 
                    onClick={() => {
                      console.log('Upload Video button clicked!');
                      setModalType('video');
                      setShowAddModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    suppressHydrationWarning
                  >
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                    Upload Video
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {archivedVideos.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm text-center text-slate-500">
                      No archived videos yet. Click "Upload Video" to add one.
                    </div>
                  ) : (
                    archivedVideos.map((video) => (
                      <div key={video.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-20 h-14 sm:w-24 sm:h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">{video.title}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-600">
                              <span>Duration: {video.duration}</span>
                              <span>Uploaded: {video.uploadDate}</span>
                              <span className="truncate">Group: {video.customTitle}</span>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                            <button className="text-blue-500 hover:text-blue-700 p-1">
                              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteContent(video.id, 'video')}
                              className="text-red-600 hover:text-red-500 p-1"
                        >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'custom-titles' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between" suppressHydrationWarning>
                  <h2 className="text-3xl font-bold text-slate-800">Custom Titles</h2>
                  <button 
                    onClick={() => {
                      setModalType('title');
                      setShowAddModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    suppressHydrationWarning
                  >
                    <Plus className="h-5 w-5" />
                    Add Title
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customTitles.map((title, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                        <div className="flex items-center gap-2">
                          <button className="text-blue-500 hover:text-blue-700">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteContent(title, 'title')}
                            className="text-red-600 hover:text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-slate-800">User Management</h2>
                  <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add User
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-slate-600">User management features will be available in future updates.</p>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" suppressHydrationWarning>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                  {modalType === 'content' && 'Add Content'}
                  {modalType === 'stream' && 'Add Live Stream'}
                  {modalType === 'video' && 'Upload Video'}
                  {modalType === 'title' && 'Add Custom Title'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {modalType === 'stream' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Stream Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter stream title"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">RTMP URL or YouTube URL</label>
                      <input
                        type="url"
                        name="url"
                        value={formData.url}
                        onChange={handleInputChange}
                        placeholder="rtmp://example.com/live or https://youtube.com/watch?v=..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Thumbnail (Optional)</label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {uploadedThumbnail && (
                          <div className="relative">
                            <img 
                              src={uploadedThumbnail} 
                              alt="Uploaded thumbnail preview" 
                              className="w-full h-32 object-cover rounded-lg border border-slate-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedThumbnail(null);
                                setFormData(prev => ({ ...prev, thumbnail: '' }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-slate-500">
                          Upload a custom thumbnail image (JPG, PNG, GIF - max 5MB). 
                          If not provided, YouTube thumbnail will be used.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'video' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Video Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter video title"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">YouTube URL</label>
                          <input
                            type="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="mt-2 text-xs text-slate-500">
                            <p>Example URLs:</p>
                            <p>• https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
                            <p>• https://youtu.be/dQw4w9WgXcQ</p>
                            <p>• https://youtube.com/live/uR2vU5AxZMk (Live)</p>
                          </div>
                        </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Title Group</label>
                      <select 
                        name="customTitle"
                        value={formData.customTitle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a group</option>
                        {customTitles.map(title => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Thumbnail (Optional)</label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {uploadedThumbnail && (
                          <div className="relative">
                            <img 
                              src={uploadedThumbnail} 
                              alt="Uploaded thumbnail preview" 
                              className="w-full h-32 object-cover rounded-lg border border-slate-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedThumbnail(null);
                                setFormData(prev => ({ ...prev, thumbnail: '' }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-slate-500">
                          Upload a custom thumbnail image (JPG, PNG, GIF - max 5MB). 
                          If not provided, YouTube thumbnail will be used.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'title' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Title Name</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter custom title name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                )}

                {modalType === 'content' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setModalType('stream')}
                      className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Add Live Stream</div>
                          <div className="text-sm text-slate-600">Add a new RTMP live stream</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setModalType('video')}
                      className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Upload Video</div>
                          <div className="text-sm text-slate-600">Add archived video content</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setModalType('title')}
                      className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="font-medium">Add Custom Title</div>
                          <div className="text-sm text-slate-600">Create a new content group</div>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContent}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {modalType === 'content' ? 'Continue' : 'Add'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
