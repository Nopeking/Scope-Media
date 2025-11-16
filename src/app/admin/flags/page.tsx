'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Trash2, Edit, Save, X, ArrowLeft, Flag } from 'lucide-react';

interface Flag {
  id: string;
  country_code: string;
  flag_url: string;
  created_at: string;
  updated_at: string;
}

export default function FlagsManagementPage() {
  const router = useRouter();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlag, setEditingFlag] = useState<Flag | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    country_code: '',
    flag_url: '',
  });

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flags');
      if (response.ok) {
        const data = await response.json();
        setFlags(data);
      }
    } catch (error) {
      console.error('Error fetching flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would upload to Supabase Storage here
    // For now, we'll use a placeholder URL or data URL
    setUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // In production, upload to Supabase Storage and get the public URL
        // For now, we'll use data URL as placeholder
        setFormData({ ...formData, flag_url: base64String });
        setUploading(false);
        alert('Flag image loaded. In production, this would be uploaded to Supabase Storage.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setUploading(false);
      alert('Error loading image file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.country_code || !formData.flag_url) {
      alert('Please fill in all fields');
      return;
    }

    // Validate country code format
    if (!/^[A-Z]{3}$/.test(formData.country_code.toUpperCase())) {
      alert('Country code must be 3 uppercase letters (e.g., "JOR", "UAE")');
      return;
    }

    try {
      const url = editingFlag ? '/api/flags' : '/api/flags';
      const method = editingFlag ? 'PUT' : 'POST';
      const body = editingFlag
        ? { country_code: editingFlag.country_code, flag_url: formData.flag_url }
        : { country_code: formData.country_code.toUpperCase(), flag_url: formData.flag_url };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchFlags();
        resetForm();
        setEditingFlag(null);
        setShowAddForm(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save flag'}`);
      }
    } catch (error) {
      console.error('Error saving flag:', error);
      alert('Error saving flag');
    }
  };

  const handleEdit = (flag: Flag) => {
    setEditingFlag(flag);
    setFormData({
      country_code: flag.country_code,
      flag_url: flag.flag_url,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (countryCode: string) => {
    if (!confirm(`Are you sure you want to delete the flag for ${countryCode}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/flags?country_code=${countryCode}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchFlags();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete flag'}`);
      }
    } catch (error) {
      console.error('Error deleting flag:', error);
      alert('Error deleting flag');
    }
  };

  const resetForm = () => {
    setFormData({
      country_code: '',
      flag_url: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading flags...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Flag Management
              </h1>
              <p className="text-gray-400">Manage country flags for international shows</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingFlag(null);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
          >
            <Flag className="w-5 h-5" />
            {showAddForm ? 'Cancel' : 'Add Flag'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editingFlag ? 'Edit Flag' : 'Add New Flag'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country Code (e.g., JOR, UAE, GBR) *
                  </label>
                  <input
                    type="text"
                    value={formData.country_code}
                    onChange={(e) =>
                      setFormData({ ...formData, country_code: e.target.value.toUpperCase() })
                    }
                    required
                    maxLength={3}
                    pattern="[A-Z]{3}"
                    placeholder="JOR"
                    disabled={!!editingFlag}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">3 uppercase letters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Flag Image URL *
                  </label>
                  <input
                    type="text"
                    value={formData.flag_url}
                    onChange={(e) =>
                      setFormData({ ...formData, flag_url: e.target.value })
                    }
                    required
                    placeholder="https://example.com/flag.jpg or upload file"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <div className="mt-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg cursor-pointer transition w-fit">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
                  </div>
                </div>
              </div>

              {formData.flag_url && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img
                    src={formData.flag_url}
                    alt={`Flag for ${formData.country_code}`}
                    className="w-32 h-20 object-contain border border-white/20 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
                >
                  <Save className="w-5 h-5" />
                  {editingFlag ? 'Update Flag' : 'Add Flag'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingFlag(null);
                    resetForm();
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Flags List */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
          {flags.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No flags yet. Add a flag to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {flags.map((flag) => (
                <motion.div
                  key={flag.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{flag.country_code}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(flag)}
                        className="p-2 hover:bg-blue-600/20 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(flag.country_code)}
                        className="p-2 hover:bg-red-600/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center bg-white/5 rounded-lg p-4 mb-3">
                    <img
                      src={flag.flag_url}
                      alt={`Flag of ${flag.country_code}`}
                      className="w-24 h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-flag.png';
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Updated: {new Date(flag.updated_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

