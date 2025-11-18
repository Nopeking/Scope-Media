'use client';

import { useState, useEffect } from 'react';
import type { Rider, UserRider } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';

interface LinkedRider extends UserRider {
  riders: Rider;
}

export default function LinkRiderPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [feiRegistration, setFeiRegistration] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [linkedRiders, setLinkedRiders] = useState<LinkedRider[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdditionalDetailsModal, setShowAdditionalDetailsModal] = useState(false);
  const [feiRiderData, setFeiRiderData] = useState<{ full_name: string; fei_registration: string } | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState({
    first_name: '',
    last_name: '',
    licence: 'EEF-SJR-',
    country: '',
    club_name: ''
  });

  useEffect(() => {
    if (user && !authLoading) {
      fetchLinkedRiders(user.id);
    } else if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  const fetchLinkedRiders = async (uid: string) => {
    try {
      const response = await fetch(`/api/riders/link?user_id=${uid}`);
      const data = await response.json();

      if (data.success) {
        setLinkedRiders(data.links || []);
      }
    } catch (error) {
      console.error('Error fetching linked riders:', error);
    }
  };

  const handleLinkRider = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to link a rider' });
      setShowAuthModal(true);
      return;
    }

    if (!feiRegistration.trim()) {
      setMessage({ type: 'error', text: 'Please enter your FEI Registration number' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // First, try to link rider from local database
      const response = await fetch('/api/riders/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fei_registration: feiRegistration,
          user_id: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Rider linked successfully!' });
        setFeiRegistration('');
        // Refresh linked riders
        fetchLinkedRiders(user.id);
      } else if (response.status === 404) {
        // Rider not found locally, fetch from FEI
        console.log('Rider not found locally, fetching from FEI...');
        await fetchRiderFromFEI(feiRegistration);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to link rider' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while linking rider' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiderFromFEI = async (feiReg: string) => {
    // FEI website is protected by Cloudflare, so we'll ask user to enter details manually
    setFeiRiderData({ full_name: '', fei_registration: feiReg });
    setAdditionalDetails({ first_name: '', last_name: '', licence: 'EEF-SJR-', country: '', club_name: '' });
    setShowAdditionalDetailsModal(true);
  };

  const handleLicenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prefix = 'EEF-SJR-';

    // Always maintain the prefix
    if (value.startsWith(prefix)) {
      setAdditionalDetails({ ...additionalDetails, licence: value });
    } else {
      setAdditionalDetails({ ...additionalDetails, licence: prefix });
    }
  };

  const handleCreateRiderWithDetails = async () => {
    if (!user || !feiRiderData) return;

    // Validate required fields
    if (!additionalDetails.first_name.trim()) {
      setMessage({ type: 'error', text: 'Please enter the first name' });
      return;
    }

    if (!additionalDetails.last_name.trim()) {
      setMessage({ type: 'error', text: 'Please enter the last name' });
      return;
    }

    if (!additionalDetails.licence.trim() || additionalDetails.licence === 'EEF-SJR-') {
      setMessage({ type: 'error', text: 'Please enter the rider licence number' });
      return;
    }

    if (!additionalDetails.country.trim()) {
      setMessage({ type: 'error', text: 'Please enter the country' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/riders/create-from-fei', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: additionalDetails.first_name,
          last_name: additionalDetails.last_name,
          fei_registration: feiRiderData.fei_registration,
          licence: additionalDetails.licence,
          country: additionalDetails.country,
          club_name: additionalDetails.club_name,
          user_id: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Rider created and linked successfully!' });
        setFeiRegistration('');
        setShowAdditionalDetailsModal(false);
        setFeiRiderData(null);
        setAdditionalDetails({ first_name: '', last_name: '', licence: 'EEF-SJR-', country: '', club_name: '' });
        // Refresh linked riders
        fetchLinkedRiders(user.id);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create rider' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while creating rider' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkRider = async (linkId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to unlink this rider?')) {
      return;
    }

    try {
      const response = await fetch(`/api/riders/link?link_id=${linkId}&user_id=${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Rider unlinked successfully' });
        fetchLinkedRiders(user.id);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to unlink rider' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while unlinking rider' });
      console.error('Error:', error);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <>
        <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <svg
                  className="h-16 w-16 text-blue-500 mx-auto"
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
              <h1 className="text-3xl font-bold text-slate-800 mb-4">Link Your Rider Profile</h1>
              <p className="text-slate-600 mb-6">
                Please sign in to link your rider profile and access your competition information.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // Main content - user is logged in
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Link Your Rider Profile</h1>
          <p className="text-slate-600">
            Welcome back, {userProfile?.full_name || user?.email}! Link your FEI rider profile to your account.
          </p>
        </div>

        {/* Link New Rider Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Link New Rider</h2>
          <p className="text-slate-600 mb-4">
            Enter your FEI Registration number to link your rider profile to your account.
          </p>

          <form onSubmit={handleLinkRider} className="space-y-4">
            <div>
              <label htmlFor="fei_registration" className="block text-sm font-medium text-slate-700 mb-1">
                FEI Registration Number
              </label>
              <input
                type="text"
                id="fei_registration"
                value={feiRegistration}
                onChange={(e) => setFeiRegistration(e.target.value)}
                placeholder="e.g., 10012345"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                disabled={loading}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${
                loading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Linking...' : 'Link Rider'}
            </button>
          </form>
        </div>

        {/* Linked Riders List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Linked Riders</h2>

          {linkedRiders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-slate-500">
                No riders linked yet. Enter your FEI Registration number above to link your profile.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {linkedRiders.map((link) => (
                <div
                  key={link.id}
                  className="border border-slate-200 rounded-lg p-4 flex items-start justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800">{link.riders.full_name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium">FEI Registration:</span> {link.riders.fei_registration || 'N/A'}</p>
                      <p><span className="font-medium">Licence:</span> {link.riders.licence || 'N/A'}</p>
                      <p><span className="font-medium">Club:</span> {link.riders.club_name || 'N/A'}</p>
                      <p><span className="font-medium">Country:</span> {link.riders.country || 'N/A'}</p>
                      {link.riders.email && (
                        <p><span className="font-medium">Email:</span> {link.riders.email}</p>
                      )}
                      {link.riders.phone && (
                        <p><span className="font-medium">Phone:</span> {link.riders.phone}</p>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-slate-500">
                        Linked on {new Date(link.linked_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnlinkRider(link.id)}
                    className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Unlink
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Your FEI Registration number can be found on your FEI rider card or profile</li>
            <li>• If you can&apos;t find your rider profile, make sure the database is synced with the latest data</li>
            <li>• Linked profiles may require admin verification before being fully activated</li>
            <li>• Contact support if you&apos;re having trouble finding or linking your profile</li>
          </ul>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />

        {/* Additional Details Modal */}
        {showAdditionalDetailsModal && feiRiderData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Create Rider Profile</h2>
                <p className="text-slate-600 mb-4">
                  Rider not found in our database. Please enter the rider details to create the profile.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Check{' '}
                    <a
                      href={`https://www.fei.org/athlete/${feiRiderData.fei_registration}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      FEI profile
                    </a>{' '}
                    for rider details.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      FEI Registration
                    </label>
                    <input
                      type="text"
                      value={feiRiderData.fei_registration}
                      disabled
                      className="w-full px-4 py-2 border border-slate-300 rounded-md bg-slate-100 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={additionalDetails.first_name}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, first_name: e.target.value })}
                      placeholder="e.g., John"
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={additionalDetails.last_name}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, last_name: e.target.value })}
                      placeholder="e.g., Smith"
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Rider Licence Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={additionalDetails.licence}
                      onChange={handleLicenceChange}
                      placeholder="EEF-SJR-XXXXXXX"
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={additionalDetails.country}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, country: e.target.value })}
                      placeholder="e.g., Ireland or IRL"
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Enter full country name (e.g., &quot;United Kingdom&quot;) or 3-letter code (e.g., &quot;GBR&quot;)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Club Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={additionalDetails.club_name}
                      onChange={(e) => setAdditionalDetails({ ...additionalDetails, club_name: e.target.value })}
                      placeholder="e.g., Equestrian Club"
                      className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAdditionalDetailsModal(false);
                      setFeiRiderData(null);
                      setAdditionalDetails({ first_name: '', last_name: '', licence: 'EEF-SJR-', country: '', club_name: '' });
                    }}
                    disabled={loading}
                    className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRiderWithDetails}
                    disabled={loading}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                      loading
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create & Link Rider'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
