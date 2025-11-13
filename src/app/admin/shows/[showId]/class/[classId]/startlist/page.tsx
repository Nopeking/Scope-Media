'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Download, Plus, Trash2, Edit, ArrowLeft, Save } from 'lucide-react';

interface StartlistEntry {
  id: string;
  class_id: string;
  rider_name: string;
  rider_id: string;
  horse_name: string;
  horse_id: string | null;
  team_name: string | null;
  club_name: string | null;
  start_order: number;
  created_at: string;
  updated_at: string;
}

interface Class {
  id: string;
  class_name: string;
  show_id: string;
  shows: {
    name: string;
  };
}

export default function StartlistPage({
  params,
}: {
  params: Promise<{ showId: string; classId: string }>;
}) {
  const unwrappedParams = use(params);
  const { showId, classId } = unwrappedParams;
  const router = useRouter();

  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [startlist, setStartlist] = useState<StartlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<StartlistEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for adding/editing entries
  const [formData, setFormData] = useState({
    rider_name: '',
    rider_id: '',
    horse_name: '',
    horse_id: '',
    team_name: '',
    club_name: '',
    start_order: '',
  });

  useEffect(() => {
    fetchClassInfo();
    fetchStartlist();
  }, [classId]);

  const fetchClassInfo = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassInfo(data);
      }
    } catch (error) {
      console.error('Error fetching class info:', error);
    }
  };

  const fetchStartlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/startlist?class_id=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setStartlist(data);
      }
    } catch (error) {
      console.error('Error fetching startlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/startlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          class_id: classId,
          start_order: parseInt(formData.start_order),
        }),
      });

      if (response.ok) {
        await fetchStartlist();
        setShowAddForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    // For now, delete and recreate since we don't have PUT endpoint for startlist
    try {
      await fetch(`/api/startlist?id=${editingEntry.id}`, {
        method: 'DELETE',
      });

      await fetch('/api/startlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          class_id: classId,
          start_order: parseInt(formData.start_order),
        }),
      });

      await fetchStartlist();
      setEditingEntry(null);
      resetForm();
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/startlist?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStartlist();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEditClick = (entry: StartlistEntry) => {
    setEditingEntry(entry);
    setFormData({
      rider_name: entry.rider_name,
      rider_id: entry.rider_id,
      horse_name: entry.horse_name,
      horse_id: entry.horse_id || '',
      team_name: entry.team_name || '',
      club_name: entry.club_name || '',
      start_order: entry.start_order.toString(),
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      rider_name: '',
      rider_id: '',
      horse_name: '',
      horse_id: '',
      team_name: '',
      club_name: '',
      start_order: '',
    });
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For Excel upload, you'll need to install xlsx package
    // npm install xlsx
    const XLSX = await import('xlsx');
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Map Excel columns to our format
        const entries = jsonData.map((row: any, index: number) => ({
          class_id: classId,
          rider_name: row['Rider Name'] || row['rider_name'] || row['RIDER NAME'] || '',
          // FEI ID mapping
          fei_id: row['FEI ID'] || row['fei_id'] || row['Rider FEI ID'] || row['rider_fei_id'] || null,
          // License/Rider ID mapping
          license: row['Rider ID'] || row['rider_id'] || row['RIDER ID'] || row['License'] || row['license'] || null,
          // Legacy rider_id field (for backwards compatibility)
          rider_id: row['Rider ID'] || row['rider_id'] || row['FEI ID'] || row['fei_id'] || null,
          horse_name: row['Horse Name'] || row['horse_name'] || row['HORSE NAME'] || '',
          horse_id: row['Horse ID'] || row['horse_id'] || row['HORSE ID'] || null,
          team_name: row['Team Name'] || row['team_name'] || row['TEAM NAME'] || null,
          club_name: row['Club Name'] || row['club_name'] || row['CLUB NAME'] || null,
          start_order: row['S.No'] || row['s.no'] || row['S.NO'] || row['Start Order'] || row['start_order'] || index + 1,
        }));

        // Bulk insert
        const response = await fetch('/api/startlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entries),
        });

        if (response.ok) {
          await fetchStartlist();
          alert('Excel file uploaded successfully!');
        } else {
          alert('Error uploading Excel file');
        }
      } catch (error) {
        console.error('Error processing Excel file:', error);
        alert('Error processing Excel file');
      }
    };

    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = `S.No,Rider Name,FEI ID,Rider ID,Horse Name,Horse ID,Team Name,Club Name
1,John Smith,10204650,LIC123,Thunder,H12345,Team A,Dubai Equestrian Club
2,Jane Doe,10305751,LIC456,Lightning,H67890,Team A,Abu Dhabi Riding Club`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'startlist-template.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/admin/shows`)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold">Startlist Management</h1>
              {classInfo && (
                <p className="text-gray-400 mt-2">
                  {classInfo.shows.name} - {classInfo.class_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              Template
            </button>

            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition cursor-pointer">
              <Upload className="w-5 h-5" />
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingEntry(null);
                resetForm();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>

            <button
              onClick={() => router.push(`/admin/shows/${showId}/class/${classId}/scoring`)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition"
            >
              Go to Scoring
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6"
          >
            <h2 className="text-2xl font-bold mb-4">
              {editingEntry ? 'Edit Entry' : 'Add New Entry'}
            </h2>
            <form onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rider Name *
                  </label>
                  <input
                    type="text"
                    value={formData.rider_name}
                    onChange={(e) =>
                      setFormData({ ...formData, rider_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rider ID (FEI/Licence) *
                  </label>
                  <input
                    type="text"
                    value={formData.rider_id}
                    onChange={(e) =>
                      setFormData({ ...formData, rider_id: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Horse Name *
                  </label>
                  <input
                    type="text"
                    value={formData.horse_name}
                    onChange={(e) =>
                      setFormData({ ...formData, horse_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Horse ID
                  </label>
                  <input
                    type="text"
                    value={formData.horse_id}
                    onChange={(e) =>
                      setFormData({ ...formData, horse_id: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={formData.team_name}
                    onChange={(e) =>
                      setFormData({ ...formData, team_name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={formData.club_name}
                    onChange={(e) =>
                      setFormData({ ...formData, club_name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Order (S.No) *
                  </label>
                  <input
                    type="number"
                    value={formData.start_order}
                    onChange={(e) =>
                      setFormData({ ...formData, start_order: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition"
                >
                  <Save className="w-5 h-5" />
                  {editingEntry ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Startlist Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : startlist.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No entries yet. Add entries manually or upload an Excel file.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-3 text-left">S.No</th>
                  <th className="px-6 py-3 text-left">Rider Name</th>
                  <th className="px-6 py-3 text-left">Rider ID</th>
                  <th className="px-6 py-3 text-left">Horse Name</th>
                  <th className="px-6 py-3 text-left">Team</th>
                  <th className="px-6 py-3 text-left">Club</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {startlist.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="px-6 py-4">{entry.start_order}</td>
                    <td className="px-6 py-4">{entry.rider_name}</td>
                    <td className="px-6 py-4">{entry.rider_id}</td>
                    <td className="px-6 py-4">{entry.horse_name}</td>
                    <td className="px-6 py-4">{entry.team_name || '-'}</td>
                    <td className="px-6 py-4">{entry.club_name || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(entry)}
                          className="p-2 hover:bg-blue-600/20 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 hover:bg-red-600/20 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
