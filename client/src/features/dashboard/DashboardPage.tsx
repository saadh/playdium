import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { usePartnerStore } from '@/stores/partnerStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { partnership, isPartnerOnline, fetchPartnership } = usePartnerStore();

  useEffect(() => {
    fetchPartnership();
  }, []);

  const games = [
    {
      id: 'garden',
      name: 'Secret Garden',
      emoji: '🌱',
      description: 'Grow a magical garden together',
      path: '/games/garden',
      color: 'from-green-400 to-emerald-600',
      bgColor: 'bg-green-50',
      stats: partnership?.sharedGarden
        ? `Level ${partnership.sharedGarden.gardenLevel} - ${partnership.sharedGarden.totalPlants} plants`
        : 'Start planting!',
    },
    {
      id: 'doodle',
      name: 'Doodle Duo',
      emoji: '🎨',
      description: 'Draw, guess, and create together',
      path: '/games/doodle',
      color: 'from-purple-400 to-violet-600',
      bgColor: 'bg-purple-50',
      stats: partnership?.doodleGallery
        ? `${(partnership.doodleGallery.drawingIds as string[]).length} drawings`
        : 'Start drawing!',
    },
    {
      id: 'treasure',
      name: 'Treasure Hunters',
      emoji: '🗺️',
      description: 'Explore worlds and find treasures',
      path: '/games/treasure',
      color: 'from-amber-400 to-orange-600',
      bgColor: 'bg-amber-50',
      stats: partnership?.treasureMap
        ? `${partnership.treasureMap.totalTreasures} treasures found`
        : 'Start exploring!',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold text-3xl text-gray-900"
          >
            Hey, {user?.displayName}! 👋
          </motion.h1>
          <p className="text-gray-500 mt-1">Ready to play today?</p>
        </div>

        {partnership && (
          <div className="flex items-center space-x-3 px-4 py-2 bg-white rounded-2xl shadow-soft">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-teal-200 flex items-center justify-center text-lg font-medium">
                {partnership.partner.displayName.charAt(0).toUpperCase()}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                  isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">{partnership.partner.displayName}</p>
              <p className="text-sm text-gray-500">
                {isPartnerOnline ? (
                  <span className="text-green-600">Online now</span>
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* No partnership notice */}
      {!partnership && (
        <Card className="border-2 border-dashed border-coral-300 bg-coral-50">
          <CardContent className="text-center py-8">
            <span className="text-5xl">🤝</span>
            <h2 className="font-display font-bold text-xl text-gray-900 mt-4">
              Find a Partner to Play With
            </h2>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              DuoPlay is designed for two players. Create an invite code or enter one to connect
              with your partner!
            </p>
            <Link to="/partnership">
              <Button className="mt-4">Set Up Partnership</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Games grid */}
      <div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Choose a Game</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={game.path}>
                <Card variant="game" className={`${game.bgColor} group`}>
                  <div
                    className={`h-32 bg-gradient-to-br ${game.color} rounded-t-3xl flex items-center justify-center`}
                  >
                    <motion.span
                      className="text-6xl"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: 'spring' }}
                    >
                      {game.emoji}
                    </motion.span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-gray-900">{game.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{game.description}</p>
                    {partnership && (
                      <p className="text-xs text-gray-400 mt-2">{game.stats}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-coral-500 group-hover:text-coral-600">
                        Play Now
                      </span>
                      <svg
                        className="w-5 h-5 text-coral-500 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      {partnership && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {partnership.stats.sharedAchievements}
                </p>
                <p className="text-sm text-gray-500">Achievements</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {partnership.stats.activityFeedItems}
                </p>
                <p className="text-sm text-gray-500">Activities</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-golden-100 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(
                    (Date.now() - new Date(partnership.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                  )}
                </p>
                <p className="text-sm text-gray-500">Days Together</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
