import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePartnerStore } from '@/stores/partnerStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Mock data for demonstration
const PLANT_TYPES = [
  { id: 'rose', name: 'Rose', emoji: '🌹', growTime: 24 },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', growTime: 18 },
  { id: 'tulip', name: 'Tulip', emoji: '🌷', growTime: 12 },
  { id: 'mushroom', name: 'Magic Mushroom', emoji: '🍄', growTime: 8 },
  { id: 'crystal', name: 'Crystal Flower', emoji: '💎', growTime: 48 },
];

const WEATHER_TYPES = ['sunny', 'cloudy', 'rainy', 'windy'];

interface GardenPlot {
  x: number;
  y: number;
  plantType?: string;
  growthStage: number;
  plantedAt?: Date;
  wateredAt?: Date;
}

export default function SecretGardenPage() {
  const navigate = useNavigate();
  const { partnership, isPartnerOnline } = usePartnerStore();
  const [weather, setWeather] = useState('sunny');
  const [selectedTool, setSelectedTool] = useState<'plant' | 'water' | 'view'>('view');
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [gardenGrid, setGardenGrid] = useState<(GardenPlot | null)[][]>([]);

  // Initialize garden grid
  useEffect(() => {
    const grid: (GardenPlot | null)[][] = [];
    for (let y = 0; y < 8; y++) {
      const row: (GardenPlot | null)[] = [];
      for (let x = 0; x < 10; x++) {
        // Add some random plants for demo
        if (Math.random() > 0.7) {
          const randomPlant = PLANT_TYPES[Math.floor(Math.random() * PLANT_TYPES.length)];
          row.push({
            x,
            y,
            plantType: randomPlant.id,
            growthStage: Math.floor(Math.random() * 5),
            plantedAt: new Date(Date.now() - Math.random() * 86400000 * 3),
          });
        } else {
          row.push(null);
        }
      }
      grid.push(row);
    }
    setGardenGrid(grid);
  }, []);

  if (!partnership) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <span className="text-5xl">🌱</span>
        <h1 className="font-display font-bold text-2xl text-gray-900 mt-4">
          Connect with a Partner First
        </h1>
        <p className="text-gray-500 mt-2">
          You need a partner to tend to your Secret Garden together!
        </p>
        <Button className="mt-4" onClick={() => navigate('/partnership')}>
          Find a Partner
        </Button>
      </div>
    );
  }

  const getWeatherEmoji = () => {
    switch (weather) {
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      case 'windy':
        return '💨';
      default:
        return '☀️';
    }
  };

  const getGrowthEmoji = (plantType: string, stage: number) => {
    if (stage === 0) return '🕳️';
    if (stage === 1) return '🌱';
    if (stage === 2) return '🌿';
    const plant = PLANT_TYPES.find((p) => p.id === plantType);
    return plant?.emoji || '🌸';
  };

  const handlePlotClick = (x: number, y: number) => {
    if (selectedTool === 'plant' && selectedPlant) {
      const newGrid = [...gardenGrid];
      newGrid[y][x] = {
        x,
        y,
        plantType: selectedPlant,
        growthStage: 1,
        plantedAt: new Date(),
      };
      setGardenGrid(newGrid);
    } else if (selectedTool === 'water' && gardenGrid[y][x]) {
      const newGrid = [...gardenGrid];
      if (newGrid[y][x]) {
        newGrid[y][x] = {
          ...newGrid[y][x]!,
          wateredAt: new Date(),
          growthStage: Math.min((newGrid[y][x]?.growthStage || 0) + 1, 4),
        };
      }
      setGardenGrid(newGrid);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 flex items-center">
            <span className="mr-2">🌱</span>
            {partnership.sharedGarden?.name || 'Our Secret Garden'}
          </h1>
          <p className="text-gray-500">
            Level {partnership.sharedGarden?.gardenLevel || 1} -{' '}
            {partnership.sharedGarden?.totalPlants || 0} plants
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Weather */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-full shadow-soft">
            <span className="text-xl">{getWeatherEmoji()}</span>
            <span className="text-sm font-medium capitalize">{weather}</span>
          </div>

          {/* Partner status */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-600">
              {partnership.partner.displayName} is {isPartnerOnline ? 'here' : 'away'}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Tool:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedTool('view')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedTool === 'view'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                👁️ View
              </button>
              <button
                onClick={() => setSelectedTool('plant')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedTool === 'plant'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🌱 Plant
              </button>
              <button
                onClick={() => setSelectedTool('water')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedTool === 'water'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                💧 Water
              </button>
            </div>
          </div>

          {selectedTool === 'plant' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Seed:</span>
              <div className="flex space-x-1">
                {PLANT_TYPES.slice(0, 4).map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => setSelectedPlant(plant.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedPlant === plant.id
                        ? 'bg-garden ring-2 ring-garden-dark'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={plant.name}
                  >
                    <span className="text-lg">{plant.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Garden grid */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div
            className="grid gap-1 mx-auto"
            style={{
              gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
              maxWidth: '600px',
            }}
          >
            {gardenGrid.map((row, y) =>
              row.map((plot, x) => (
                <motion.button
                  key={`${x}-${y}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlotClick(x, y)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xl transition-colors ${
                    plot
                      ? 'bg-green-100 hover:bg-green-200'
                      : 'bg-amber-100 hover:bg-amber-200'
                  } ${selectedTool === 'water' && plot ? 'cursor-pointer' : ''} ${
                    selectedTool === 'plant' && !plot ? 'cursor-pointer' : ''
                  }`}
                >
                  {plot ? getGrowthEmoji(plot.plantType || '', plot.growthStage) : ''}
                </motion.button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gift and inventory section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
              🎁 Send a Gift
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Surprise your partner with seeds, decorations, or special items!
            </p>
            <Button variant="secondary" className="w-full">
              Open Gift Shop
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
              🎒 Your Inventory
            </h3>
            <div className="flex flex-wrap gap-2">
              {PLANT_TYPES.map((plant) => (
                <div
                  key={plant.id}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full"
                >
                  <span>{plant.emoji}</span>
                  <span className="text-xs font-medium text-gray-600">
                    x{Math.floor(Math.random() * 10)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
