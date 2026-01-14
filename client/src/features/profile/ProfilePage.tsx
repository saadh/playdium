import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name cannot be empty' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.patch('/users/me', { displayName });
      setUser(response.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const avatarColors = [
    'bg-coral-200',
    'bg-teal-200',
    'bg-golden-200',
    'bg-purple-200',
    'bg-pink-200',
    'bg-blue-200',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display font-bold text-2xl text-gray-900">Your Profile</h1>

      {message && (
        <div
          className={`p-3 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-600'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardContent className="space-y-6">
          {/* Avatar section */}
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-coral-200 flex items-center justify-center text-4xl font-bold text-coral-700">
              {user?.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-gray-900">
                {user?.displayName}
              </h2>
              <p className="text-gray-500">@{user?.username}</p>
              {user?.isChild && (
                <span className="inline-block mt-2 px-2 py-1 bg-golden-100 text-golden-700 text-xs font-medium rounded-full">
                  Child Account
                </span>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Profile details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              {isEditing ? (
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              ) : (
                <p className="text-gray-900">{user?.displayName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <p className="text-gray-900">@{user?.username}</p>
              <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{user?.email}</p>
              <div className="flex items-center mt-1">
                {user?.emailVerified ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="text-xs text-amber-600">Not verified</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
              <p className="text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user?.displayName || '');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} isLoading={isSaving}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Avatar customization placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm mb-4">Choose your avatar color:</p>
          <div className="flex space-x-3">
            {avatarColors.map((color, index) => (
              <button
                key={index}
                className={`w-10 h-10 rounded-full ${color} border-2 border-transparent hover:border-gray-300 transition-colors`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            More customization options coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
