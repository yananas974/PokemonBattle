import React from 'react';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { cn } from '~/utils/cn';

interface PokemonAudioPlayerProps {
  className?: string;
  variant?: 'full' | 'compact' | 'mini';
  position?: 'top' | 'bottom' | 'floating';
}

export const PokemonAudioPlayer: React.FC<PokemonAudioPlayerProps> = ({
  className = '',
  variant = 'full',
  position = 'top'
}) => {
  const {
    isPlaying,
    currentTrack,
    volume,
    autoplayBlocked,
    resume,
    pause,
    stop,
    setVolume,
    playDashboard,
    playBattle
  } = useGlobalAudio();

  const positionClasses = {
    top: 'relative',
    bottom: 'fixed bottom-4 left-4 right-4 z-50',
    floating: 'fixed top-4 right-4 z-50'
  };

  if (variant === 'mini') {
    return (
      <div className={cn(
        'bg-white bg-opacity-10 backdrop-blur-lg rounded-full p-2 shadow-lg',
        positionClasses[position],
        className
      )}>
        <div className="flex items-center space-x-2">
          {autoplayBlocked ? (
            <button
              onClick={() => resume()}
              className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
              title="Cliquez pour démarrer la musique"
            >
              🎵
            </button>
          ) : (
            <button
              onClick={isPlaying ? pause : resume}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200',
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              )}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          )}
          
          {currentTrack && (
            <div className="text-white text-xs font-medium">
              {currentTrack === 'dashboard' ? '🏠' : '⚔️'}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4 shadow-lg',
        positionClasses[position],
        className
      )}>
        <div className="flex items-center space-x-4">
          {/* Status */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              autoplayBlocked ? 'bg-orange-500 animate-pulse' : 
              isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            )} />
            <span className="text-white text-sm font-medium">
              {autoplayBlocked ? 'Cliquez pour démarrer' :
               isPlaying ? 'En lecture' : 'En pause'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {autoplayBlocked ? (
              <button
                onClick={() => resume()}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                🎵 Démarrer
              </button>
            ) : (
              <>
                <button
                  onClick={isPlaying ? pause : resume}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200',
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  )}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                
                <button
                  onClick={stop}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  ⏹️
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={cn(
      'bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20',
      positionClasses[position],
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left: Status and Track Info */}
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-4 h-4 rounded-full shadow-lg',
              autoplayBlocked ? 'bg-orange-500 animate-pulse shadow-orange-500/50' : 
              isPlaying ? 'bg-green-500 animate-pulse shadow-green-500/50' : 'bg-gray-500 shadow-gray-500/50'
            )} />
            
            <div>
              <div className="text-white font-semibold text-sm">
                {autoplayBlocked ? '🎵 Cliquez pour démarrer' :
                 isPlaying ? '🎵 Musique en cours' : '🎵 Musique en pause'}
              </div>
              {currentTrack && (
                <div className="text-white opacity-75 text-xs">
                  {currentTrack === 'dashboard' ? '🏠 Thème Dashboard' : '⚔️ Thème Combat'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center space-x-3">
          {autoplayBlocked ? (
            <button
              onClick={() => resume()}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🎵 Démarrer la musique
            </button>
          ) : (
            <>
              <button
                onClick={isPlaying ? pause : resume}
                className={cn(
                  'px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg',
                  isPlaying 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                )}
              >
                {isPlaying ? '⏸️ Pause' : '▶️ Lecture'}
              </button>
              
              <button
                onClick={stop}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                ⏹️ Stop
              </button>
            </>
          )}
        </div>

        {/* Right: Theme Selection and Volume */}
        <div className="flex items-center space-x-4">
          {/* Theme Selection */}
          <div className="flex items-center space-x-2">
            <button
              onClick={playDashboard}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200',
                currentTrack === 'dashboard'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              )}
            >
              🏠 Dashboard
            </button>
            
            <button
              onClick={playBattle}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200',
                currentTrack === 'battle'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              )}
            >
              ⚔️ Combat
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-2 bg-white bg-opacity-20 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white text-xs font-medium min-w-[2rem]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 