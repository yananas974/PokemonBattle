import React, { useState } from 'react';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { TRACKS } from '~/utils/globalAudioManager';

export function PokemonAudioPlayer() {
  const { isPlaying, currentTrack, volume, playDashboard, playBattle, pause, resume, stop, setVolume } = useGlobalAudio();
  const [showControls, setShowControls] = useState(false);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const switchToBattle = () => {
    playBattle();
  };

  const switchToDashboard = () => {
    playDashboard();
  };

  const trackName = currentTrack === TRACKS.BATTLE ? '⚔️ Musique de Combat' : 
                   currentTrack === TRACKS.DASHBOARD ? '🏠 Thème Principal' : 
                   '🎵 Aucune piste';
                   
  const trackColor = currentTrack === TRACKS.BATTLE 
    ? 'from-red-500 to-red-700' 
    : 'from-blue-500 to-blue-700';

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-3 min-w-[320px]">
        <div className="flex items-center space-x-3">
          {/* Icône */}
          <div className={`w-10 h-10 bg-gradient-to-br ${trackColor} rounded-full flex items-center justify-center text-white text-lg font-bold`}>
            {currentTrack === TRACKS.BATTLE ? '⚔️' : '♪'}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-800">{trackName}</div>
            <div className={`text-xs flex items-center space-x-1 ${isPlaying ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}></div>
              <span>{isPlaying ? 'En cours' : 'En pause'}</span>
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex items-center space-x-1">
            <button
              onClick={togglePlay}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm transition-all ${
                isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <button
              onClick={stop}
              className="w-8 h-8 rounded-full bg-gray-500 hover:bg-gray-600 flex items-center justify-center text-white text-sm transition-all"
              title="Stop"
            >
              ⏹️
            </button>

            <button
              onClick={() => setShowControls(!showControls)}
              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white text-xs transition-all"
              title="Paramètres"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Contrôles avancés */}
        {showControls && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
            {/* Volume */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 w-12">Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-600 w-8">{Math.round(volume * 100)}%</span>
            </div>

            {/* Sélecteur de piste avec debug */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('🔄 Clic manuel: Dashboard');
                  switchToDashboard();
                }}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                  currentTrack === TRACKS.DASHBOARD
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🏠 Dashboard
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Clic manuel: Combat');
                  switchToBattle();
                }}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                  currentTrack === TRACKS.BATTLE
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⚔️ Combat
              </button>
            </div>

            {/* ✅ NOUVEAU : Affichage du fichier actuel pour debug */}
            <div className="text-xs text-gray-400 text-center">
              {currentTrack === TRACKS.BATTLE ? '🎵 23 Battle (VS Trainer).mp3' : 
               currentTrack === TRACKS.DASHBOARD ? '🎵 02 Opening (part 2).mp3' : 
               '🎵 Aucun fichier'}
            </div>

            <div className="text-xs text-gray-500 text-center">
              🎵 Audio persistant - Survit aux changements de page
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 