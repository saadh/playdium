import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePartnerStore } from '@/stores/partnerStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const GAME_MODES = [
  {
    id: 'finish',
    name: 'Finish My Drawing',
    emoji: '✏️',
    description: 'One starts, other completes the masterpiece!',
    color: 'from-purple-400 to-violet-500',
  },
  {
    id: 'guess',
    name: 'Guess My Doodle',
    emoji: '🤔',
    description: 'Draw clues, guess the word - Pictionary style!',
    color: 'from-pink-400 to-rose-500',
  },
  {
    id: 'copy',
    name: 'Copy Cat Challenge',
    emoji: '🐱',
    description: 'Try to replicate a reference image!',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'collab',
    name: 'Collaborative Canvas',
    emoji: '🎨',
    description: 'Build a masterpiece together over time!',
    color: 'from-teal-400 to-cyan-500',
  },
];

const BRUSH_COLORS = [
  '#000000',
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#95E1D3',
  '#A8D8EA',
  '#DDA0DD',
  '#98D8C8',
];

export default function DoodleDuoPage() {
  const navigate = useNavigate();
  const { partnership, isPartnerOnline } = usePartnerStore();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);

  if (!partnership) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <span className="text-5xl">🎨</span>
        <h1 className="font-display font-bold text-2xl text-gray-900 mt-4">
          Connect with a Partner First
        </h1>
        <p className="text-gray-500 mt-2">
          You need a partner to draw and play Doodle Duo together!
        </p>
        <Button className="mt-4" onClick={() => navigate('/partnership')}>
          Find a Partner
        </Button>
      </div>
    );
  }

  const handleStartGame = (modeId: string) => {
    setSelectedMode(modeId);
    setIsDrawing(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 flex items-center">
            <span className="mr-2">🎨</span>
            Doodle Duo
          </h1>
          <p className="text-gray-500">
            Draw, guess, and create together!
          </p>
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

      {/* Game mode selection */}
      {!isDrawing ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {GAME_MODES.map((mode) => (
              <motion.div
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  variant="hover"
                  className="overflow-hidden"
                  onClick={() => handleStartGame(mode.id)}
                >
                  <div className={`h-20 bg-gradient-to-r ${mode.color} flex items-center justify-center`}>
                    <span className="text-4xl">{mode.emoji}</span>
                  </div>
                  <CardContent>
                    <h3 className="font-display font-semibold text-lg text-gray-900">
                      {mode.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{mode.description}</p>
                    <Button variant="ghost" size="sm" className="mt-3">
                      Play Now →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Gallery section */}
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg text-gray-900">
                  🖼️ Your Gallery
                </h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center"
                  >
                    <span className="text-2xl text-gray-400">🖼️</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-3 text-center">
                {(partnership.doodleGallery?.drawingIds as string[])?.length || 0} drawings saved
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Drawing canvas */
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setIsDrawing(false)}>
                  ← Back
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  {GAME_MODES.find((m) => m.id === selectedMode)?.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {BRUSH_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      brushColor === color
                        ? 'border-gray-800 scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Canvas area */}
            <div className="aspect-[4/3] bg-white flex items-center justify-center">
              <div className="text-center text-gray-400">
                <span className="text-6xl">🎨</span>
                <p className="mt-4">Canvas drawing will be implemented here</p>
                <p className="text-sm mt-2">Using Konva.js or Fabric.js</p>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg">
                  <span className="text-xl">↩️</span>
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg">
                  <span className="text-xl">🗑️</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">{brushSize}px</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Save
                </Button>
                <Button size="sm">Done</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
