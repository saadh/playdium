import { useState, useEffect } from 'react';
import { usePartnerStore } from '@/stores/partnerStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function PartnershipPage() {
  const { partnership, isPartnerOnline, isLoading, error, createInvite, joinWithInvite } =
    usePartnerStore();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [inviteCode, setInviteCode] = useState('');
  const [createdCode, setCreatedCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreateInvite = async () => {
    try {
      const result = await createInvite();
      setCreatedCode(result);
    } catch {
      // Error handled by store
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter an invite code');
      return;
    }

    setJoinError('');
    try {
      await joinWithInvite(joinCode.trim());
    } catch (error: any) {
      setJoinError(error.response?.data?.error || 'Failed to join');
    }
  };

  const copyToClipboard = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode.code);
    }
  };

  if (partnership) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Your Partnership</h1>

        <Card>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-teal-200 flex items-center justify-center text-3xl font-bold text-teal-700">
                  {partnership.partner.displayName.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white ${
                    isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">
                  {partnership.partner.displayName}
                </h2>
                <p className="text-gray-500">@{partnership.partner.username}</p>
                <p className="text-sm mt-1">
                  {isPartnerOnline ? (
                    <span className="text-green-600 font-medium">Online now</span>
                  ) : partnership.partner.lastSeenAt ? (
                    <span className="text-gray-500">
                      Last seen{' '}
                      {new Date(partnership.partner.lastSeenAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Offline</span>
                  )}
                </p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">
                  {Math.floor(
                    (Date.now() - new Date(partnership.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </p>
                <p className="text-sm text-gray-500">Days Together</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">
                  {partnership.stats.sharedAchievements}
                </p>
                <p className="text-sm text-gray-500">Shared Achievements</p>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-400">
                Partnership started on{' '}
                {new Date(partnership.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Game stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {partnership.sharedGarden && (
            <Card>
              <CardContent className="text-center py-4">
                <span className="text-3xl">🌱</span>
                <h3 className="font-semibold text-gray-900 mt-2">Secret Garden</h3>
                <p className="text-sm text-gray-500">
                  Level {partnership.sharedGarden.gardenLevel}
                </p>
                <p className="text-xs text-gray-400">
                  {partnership.sharedGarden.totalPlants} plants
                </p>
              </CardContent>
            </Card>
          )}

          {partnership.doodleGallery && (
            <Card>
              <CardContent className="text-center py-4">
                <span className="text-3xl">🎨</span>
                <h3 className="font-semibold text-gray-900 mt-2">Doodle Duo</h3>
                <p className="text-sm text-gray-500">
                  {(partnership.doodleGallery.drawingIds as string[]).length} drawings
                </p>
                <p className="text-xs text-gray-400">in gallery</p>
              </CardContent>
            </Card>
          )}

          {partnership.treasureMap && (
            <Card>
              <CardContent className="text-center py-4">
                <span className="text-3xl">🗺️</span>
                <h3 className="font-semibold text-gray-900 mt-2">Treasure Hunters</h3>
                <p className="text-sm text-gray-500">
                  {partnership.treasureMap.totalTreasures} treasures
                </p>
                <p className="text-xs text-gray-400">found together</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // No partnership - show create/join UI
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <span className="text-5xl">🤝</span>
        <h1 className="font-display font-bold text-2xl text-gray-900 mt-4">
          Connect with Your Partner
        </h1>
        <p className="text-gray-500 mt-2">
          DuoPlay is all about playing together. Create an invite or enter a code to connect!
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            mode === 'create'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Create Invite
        </button>
        <button
          onClick={() => setMode('join')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            mode === 'join'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Join Partner
        </button>
      </div>

      <Card>
        <CardContent>
          {mode === 'create' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Create an invite code and share it with your partner. The code will be valid for 7
                days.
              </p>

              {createdCode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-coral-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 mb-2">Your Invite Code</p>
                    <p className="text-2xl font-mono font-bold text-coral-600 tracking-wider">
                      {createdCode.code}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Expires: {new Date(createdCode.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button onClick={copyToClipboard} variant="outline" className="w-full">
                    Copy Code
                  </Button>
                </div>
              ) : (
                <Button onClick={handleCreateInvite} isLoading={isLoading} className="w-full">
                  Generate Invite Code
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the invite code your partner shared with you.
              </p>

              {joinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {joinError}
                </div>
              )}

              <Input
                label="Invite Code"
                placeholder="PLAY-XXXX-XXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="font-mono tracking-wider text-center"
              />

              <Button onClick={handleJoin} isLoading={isLoading} className="w-full">
                Join Partnership
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
