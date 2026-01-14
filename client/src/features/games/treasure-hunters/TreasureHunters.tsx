import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePartnerStore } from '@/stores/partnerStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const WORLDS = [
  {
    id: 'enchanted_forest',
    name: 'Enchanted Forest',
    emoji: '🌲',
    description: 'A magical forest filled with ancient secrets',
    unlocked: true,
    progress: 45,
    color: 'from-green-400 to-emerald-600',
  },
  {
    id: 'sunken_ship',
    name: 'Sunken Ship',
    emoji: '🚢',
    description: 'Explore the depths of an ancient pirate vessel',
    unlocked: true,
    progress: 20,
    color: 'from-blue-400 to-cyan-600',
  },
  {
    id: 'crystal_caves',
    name: 'Crystal Caves',
    emoji: '💎',
    description: 'Venture into sparkling caverns of crystals',
    unlocked: false,
    progress: 0,
    color: 'from-purple-400 to-violet-600',
  },
];

const COLLECTION_ITEMS = [
  { id: 'coin', emoji: '🪙', name: 'Gold Coin', count: 15 },
  { id: 'gem', emoji: '💎', name: 'Gem', count: 8 },
  { id: 'key', emoji: '🗝️', name: 'Ancient Key', count: 3 },
  { id: 'map', emoji: '🗺️', name: 'Map Piece', count: 2 },
  { id: 'feather', emoji: '🪶', name: 'Silver Feather', count: 5 },
];

export default function TreasureHuntersPage() {
  const navigate = useNavigate();
  const { partnership, isPartnerOnline } = usePartnerStore();
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [isExploring, setIsExploring] = useState(false);

  if (!partnership) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <span className="text-5xl">🗺️</span>
        <h1 className="font-display font-bold text-2xl text-gray-900 mt-4">
          Connect with a Partner First
        </h1>
        <p className="text-gray-500 mt-2">
          You need a partner to explore and hunt treasures together!
        </p>
        <Button className="mt-4" onClick={() => navigate('/partnership')}>
          Find a Partner
        </Button>
      </div>
    );
  }

  const handleExplore = (worldId: string) => {
    setSelectedWorld(worldId);
    setIsExploring(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 flex items-center">
            <span className="mr-2">🗺️</span>
            Treasure Hunters
          </h1>
          <p className="text-gray-500">
            Explore worlds and discover hidden treasures!
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="px-3 py-1.5 bg-golden-100 rounded-full">
            <span className="text-sm font-medium text-golden-700">
              🏆 {partnership.treasureMap?.totalTreasures || 0} treasures
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-600">
              {partnership.partner.displayName} is {isPartnerOnline ? 'online' : 'offline'}
            </span>
          </div>
        </div>
      </div>

      {!isExploring ? (
        <>
          {/* World selection */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg text-gray-900">Choose a World</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {WORLDS.map((world) => (
                <motion.div
                  key={world.id}
                  whileHover={world.unlocked ? { scale: 1.02 } : undefined}
                  whileTap={world.unlocked ? { scale: 0.98 } : undefined}
                >
                  <Card
                    variant={world.unlocked ? 'hover' : 'default'}
                    className={`overflow-hidden ${!world.unlocked ? 'opacity-60' : ''}`}
                    onClick={() => world.unlocked && handleExplore(world.id)}
                  >
                    <div
                      className={`h-24 bg-gradient-to-r ${world.color} flex items-center justify-center relative`}
                    >
                      <span className="text-5xl">{world.emoji}</span>
                      {!world.unlocked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-3xl">🔒</span>
                        </div>
                      )}
                    </div>
                    <CardContent>
                      <h3 className="font-display font-semibold text-gray-900">{world.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{world.description}</p>
                      {world.unlocked && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{world.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${world.color}`}
                              style={{ width: `${world.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Collection book */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg text-gray-900">
                  📖 Collection Book
                </h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {COLLECTION_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="text-center p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <p className="text-xs font-medium text-gray-600 mt-1">x{item.count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hide treasure section */}
          <Card className="border-2 border-dashed border-golden-300 bg-golden-50">
            <CardContent className="text-center py-6">
              <span className="text-4xl">🎁</span>
              <h3 className="font-display font-semibold text-lg text-gray-900 mt-3">
                Hide a Treasure for Your Partner!
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Leave clues, voice messages, and surprises for them to find
              </p>
              <Button variant="secondary" className="mt-4">
                Hide a Treasure
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Exploration view */
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => setIsExploring(false)}>
                  ← Back
                </Button>
                <span className="font-medium text-gray-900">
                  {WORLDS.find((w) => w.id === selectedWorld)?.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">🧭 Exploring...</span>
              </div>
            </div>

            {/* Exploration area */}
            <div className="aspect-video bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <span className="text-6xl">
                  {WORLDS.find((w) => w.id === selectedWorld)?.emoji}
                </span>
                <p className="mt-4">Exploration scene will be rendered here</p>
                <p className="text-sm mt-2">Point-and-click adventure interface</p>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg" title="Map">
                  <span className="text-xl">🗺️</span>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg" title="Inventory">
                  <span className="text-xl">🎒</span>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg" title="Markers">
                  <span className="text-xl">📍</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {isPartnerOnline && (
                  <Button variant="secondary" size="sm">
                    🎤 Voice Chat
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Leave Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
