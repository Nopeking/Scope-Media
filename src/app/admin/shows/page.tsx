'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, Calendar, MapPin, Trophy, ChevronRight,
  Users, List, Upload, BarChart3, Clock, Target
} from 'lucide-react';
import { Show, Class } from '@/types';
import Link from 'next/link';

const CLASS_RULES = [
  { value: 'one_round_against_clock', label: 'Competition - One Round Against the Clock' },
  { value: 'one_round_not_against_clock', label: 'Competition - One Round Not Against the Clock' },
  { value: 'optimum_time', label: 'Optimum Time' },
  { value: 'special_two_phases', label: 'Special Two Phases' },
  { value: 'two_phases', label: 'Two Phases' },
  { value: 'one_round_with_jumpoff', label: 'One Round with Jump-off' },
  { value: 'two_rounds_with_tiebreaker', label: 'Two Rounds with Tie-Breaker' },
  { value: 'two_rounds_team_with_tiebreaker', label: 'Two Rounds Team with Tie-Breaker' },
  { value: 'accumulator', label: 'Accumulator' },
  { value: 'speed_and_handiness', label: 'Speed and Handiness' },
  { value: 'six_bars', label: '6 Bars' },
];

export default function ShowsManagementPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [showClasses, setShowClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const [showFormData, setShowFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    show_type: 'national' as 'national' | 'international',
    location: '',
    description: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  });

  const [classFormData, setClassFormData] = useState({
    class_name: '',
    class_rule: 'one_round_against_clock',
    class_type: '',
    height: '',
    price: '',
    currency: 'AED',
    class_date: '',
    start_time: '',
    time_allowed: '',
    time_allowed_round2: '',
    optimum_time: '',
  });

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shows');
      if (response.ok) {
        const data = await response.json();
        setShows(data);
      }
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesForShow = async (showId: string) => {
    try {
      const response = await fetch(`/api/classes?show_id=${showId}`);
      if (response.ok) {
        const data = await response.json();
        setShowClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleCreateShow = async () => {
    try {
      const response = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showFormData),
      });

      if (response.ok) {
        await fetchShows();
        setShowModal(false);
        resetShowForm();
        alert('Show created successfully!');
      } else {
        alert('Failed to create show');
      }
    } catch (error) {
      console.error('Error creating show:', error);
      alert('Error creating show');
    }
  };

  const handleUpdateShow = async () => {
    if (!editingShow) return;

    try {
      const response = await fetch(`/api/shows/${editingShow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showFormData),
      });

      if (response.ok) {
        await fetchShows();
        setShowModal(false);
        setEditingShow(null);
        resetShowForm();
        alert('Show updated successfully!');
      } else {
        alert('Failed to update show');
      }
    } catch (error) {
      console.error('Error updating show:', error);
      alert('Error updating show');
    }
  };

  const handleDeleteShow = async (showId: string) => {
    if (!confirm('Are you sure you want to delete this show? This will also delete all associated classes and scores.')) {
      return;
    }

    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchShows();
        if (selectedShow?.id === showId) {
          setSelectedShow(null);
        }
        alert('Show deleted successfully!');
      } else {
        alert('Failed to delete show');
      }
    } catch (error) {
      console.error('Error deleting show:', error);
      alert('Error deleting show');
    }
  };

  const handleCreateClass = async () => {
    if (!selectedShow) return;

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...classFormData,
          show_id: selectedShow.id,
          price: classFormData.price && classFormData.price.trim() !== '' ? parseFloat(classFormData.price) : null,
          time_allowed: classFormData.time_allowed && classFormData.time_allowed.trim() !== '' ? parseInt(classFormData.time_allowed) : null,
          time_allowed_round2: classFormData.time_allowed_round2 && classFormData.time_allowed_round2.trim() !== '' ? parseInt(classFormData.time_allowed_round2) : null,
          optimum_time: classFormData.optimum_time && classFormData.optimum_time.trim() !== '' ? parseInt(classFormData.optimum_time) : null,
        }),
      });

      if (response.ok) {
        await fetchClassesForShow(selectedShow.id);
        setClassModal(false);
        resetClassForm();
        alert('Class created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to create class:', errorData);
        alert(`Failed to create class: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class');
    }
  };

  const resetShowForm = () => {
    setShowFormData({
      name: '',
      start_date: '',
      end_date: '',
      show_type: 'national',
      location: '',
      description: '',
      status: 'upcoming',
    });
  };

  const resetClassForm = () => {
    setClassFormData({
      class_name: '',
      class_rule: 'one_round_against_clock',
      class_type: '',
      height: '',
      price: '',
      currency: 'AED',
      class_date: '',
      start_time: '',
      time_allowed: '',
      time_allowed_round2: '',
      optimum_time: '',
    });
  };

  const openEditShow = (show: Show) => {
    setEditingShow(show);
    setShowFormData({
      name: show.name,
      start_date: show.start_date,
      end_date: show.end_date,
      show_type: show.show_type,
      location: show.location || '',
      description: show.description || '',
      status: show.status,
    });
    setShowModal(true);
  };

  const openEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setClassFormData({
      class_name: classItem.class_name,
      class_rule: classItem.class_rule,
      class_type: classItem.class_type || '',
      height: classItem.height || '',
      price: classItem.price?.toString() || '',
      currency: classItem.currency || 'AED',
      class_date: classItem.class_date || '',
      start_time: classItem.start_time || '',
      time_allowed: classItem.time_allowed?.toString() || '',
      time_allowed_round2: classItem.time_allowed_round2?.toString() || '',
      optimum_time: classItem.optimum_time?.toString() || '',
    });
    setClassModal(true);
  };

  const handleUpdateClass = async () => {
    if (!editingClass) return;

    try {
      const response = await fetch(`/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...classFormData,
          price: classFormData.price && classFormData.price.trim() !== '' ? parseFloat(classFormData.price) : null,
          time_allowed: classFormData.time_allowed && classFormData.time_allowed.trim() !== '' ? parseInt(classFormData.time_allowed) : null,
          time_allowed_round2: classFormData.time_allowed_round2 && classFormData.time_allowed_round2.trim() !== '' ? parseInt(classFormData.time_allowed_round2) : null,
          optimum_time: classFormData.optimum_time && classFormData.optimum_time.trim() !== '' ? parseInt(classFormData.optimum_time) : null,
        }),
      });

      if (response.ok) {
        if (selectedShow) {
          await fetchClassesForShow(selectedShow.id);
        }
        setClassModal(false);
        setEditingClass(null);
        resetClassForm();
        alert('Class updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to update class:', errorData);
        alert(`Failed to update class: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Error updating class');
    }
  };

  const selectShow = async (show: Show) => {
    setSelectedShow(show);
    await fetchClassesForShow(show.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <Link href="/admin/dashboard" className="hover:text-blue-600">Admin Dashboard</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900 font-medium">Shows Management</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Show Jumping Competitions</h1>
              <p className="text-slate-600 mt-1">Manage shows, classes, startlists, and live scoring</p>
            </div>
            <button
              onClick={() => {
                setEditingShow(null);
                resetShowForm();
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create New Show
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shows List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">All Shows</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : shows.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No shows yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create your first show to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shows.map((show) => (
                    <motion.div
                      key={show.id}
                      onClick={() => selectShow(show)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedShow?.id === show.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-800">{show.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          show.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                          show.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                          show.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {show.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(show.start_date).toLocaleDateString()} - {new Date(show.end_date).toLocaleDateString()}
                        </div>
                        {show.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {show.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {show.show_type === 'national' ? 'National' : 'International'}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditShow(show);
                          }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShow(show.id);
                          }}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Show Details & Classes */}
          <div className="lg:col-span-2">
            {selectedShow ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedShow.name}</h2>
                  {selectedShow.description && (
                    <p className="text-slate-600">{selectedShow.description}</p>
                  )}
                </div>

                {/* Classes Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Classes</h3>
                    <button
                      onClick={() => {
                        setEditingClass(null);
                        resetClassForm();
                        setClassModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Class
                    </button>
                  </div>

                  {showClasses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                      <List className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No classes yet</p>
                      <p className="text-xs text-slate-400 mt-1">Add your first class to this show</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {showClasses.map((classItem) => (
                        <div key={classItem.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{classItem.class_name}</h4>
                              <p className="text-xs text-slate-600 mt-1">
                                {CLASS_RULES.find(r => r.value === classItem.class_rule)?.label}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              classItem.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                              classItem.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                              classItem.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {classItem.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                            {classItem.height && (
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Height: {classItem.height}
                              </div>
                            )}
                            {classItem.price && (
                              <div>Price: {classItem.currency || 'AED'} {classItem.price}</div>
                            )}
                            {classItem.time_allowed && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Time: {classItem.time_allowed}s
                              </div>
                            )}
                            {classItem.class_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(classItem.class_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={`/admin/shows/${selectedShow.id}/class/${classItem.id}/startlist`}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <Users className="h-3 w-3" />
                              Startlist
                            </Link>
                            <Link
                              href={`/admin/shows/${selectedShow.id}/class/${classItem.id}/scoring`}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <BarChart3 className="h-3 w-3" />
                              Scoring
                            </Link>
                            <button
                              onClick={() => openEditClass(classItem)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded text-xs font-medium transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a Show</h3>
                <p className="text-slate-600">Choose a show from the list to view and manage its classes</p>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Show Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  {editingShow ? 'Edit Show' : 'Create New Show'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Show Name *</label>
                    <input
                      type="text"
                      value={showFormData.name}
                      onChange={(e) => setShowFormData({ ...showFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Spring Championship 2025"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={showFormData.start_date}
                        onChange={(e) => setShowFormData({ ...showFormData, start_date: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">End Date *</label>
                      <input
                        type="date"
                        value={showFormData.end_date}
                        onChange={(e) => setShowFormData({ ...showFormData, end_date: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Show Type *</label>
                      <select
                        value={showFormData.show_type}
                        onChange={(e) => setShowFormData({ ...showFormData, show_type: e.target.value as 'national' | 'international' })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="national">National</option>
                        <option value="international">International</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={showFormData.status}
                        onChange={(e) => setShowFormData({ ...showFormData, status: e.target.value as any })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={showFormData.location}
                      onChange={(e) => setShowFormData({ ...showFormData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Dubai Equestrian Club"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={showFormData.description}
                      onChange={(e) => setShowFormData({ ...showFormData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Brief description of the show..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingShow(null);
                      resetShowForm();
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingShow ? handleUpdateShow : handleCreateShow}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingShow ? 'Update Show' : 'Create Show'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Class Modal */}
        {classModal && selectedShow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setClassModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Class Name *</label>
                    <input
                      type="text"
                      value={classFormData.class_name}
                      onChange={(e) => setClassFormData({ ...classFormData, class_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Grand Prix Class A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Class Rule *</label>
                    <select
                      value={classFormData.class_rule}
                      onChange={(e) => setClassFormData({ ...classFormData, class_rule: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CLASS_RULES.map((rule) => (
                        <option key={rule.value} value={rule.value}>
                          {rule.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Class Type</label>
                      <input
                        type="text"
                        value={classFormData.class_type}
                        onChange={(e) => setClassFormData({ ...classFormData, class_type: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Senior, Junior"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Height</label>
                      <input
                        type="text"
                        value={classFormData.height}
                        onChange={(e) => setClassFormData({ ...classFormData, height: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 1.40m"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={classFormData.price}
                        onChange={(e) => setClassFormData({ ...classFormData, price: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                      <select
                        value={classFormData.currency}
                        onChange={(e) => setClassFormData({ ...classFormData, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="AED">AED (د.إ)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CHF">CHF (Fr)</option>
                        <option value="AUD">AUD ($)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="CNY">CNY (¥)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Class Date</label>
                      <input
                        type="date"
                        value={classFormData.class_date}
                        onChange={(e) => setClassFormData({ ...classFormData, class_date: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={classFormData.start_time}
                        onChange={(e) => setClassFormData({ ...classFormData, start_time: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Time Allowed (seconds)</label>
                      <input
                        type="number"
                        value={classFormData.time_allowed}
                        onChange={(e) => setClassFormData({ ...classFormData, time_allowed: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="76"
                      />
                    </div>
                    {(classFormData.class_rule.includes('two_phases') || classFormData.class_rule.includes('jumpoff')) && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Round 2 Time (seconds)</label>
                        <input
                          type="number"
                          value={classFormData.time_allowed_round2}
                          onChange={(e) => setClassFormData({ ...classFormData, time_allowed_round2: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="60"
                        />
                      </div>
                    )}
                    {classFormData.class_rule === 'optimum_time' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Optimum Time (seconds)</label>
                        <input
                          type="number"
                          value={classFormData.optimum_time}
                          onChange={(e) => setClassFormData({ ...classFormData, optimum_time: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="82"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setClassModal(false);
                      setEditingClass(null);
                      resetClassForm();
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingClass ? handleUpdateClass : handleCreateClass}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingClass ? 'Update Class' : 'Add Class'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
