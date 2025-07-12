import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, Form } from '@remix-run/react';
import { useWeather } from '../hooks/useWeather';
import { useGlobalAudio } from '../hooks/useGlobalAudio';
import { useScrollNavigation } from '../hooks/useScrollNavigation';
import { 
  getWeatherIcon, 
  getWeatherGradient, 
  formatTemperature,
  formatWindSpeed,
  formatHumidity 
} from '@pokemon-battle/shared';

import type { User } from '@pokemon-battle/shared';

interface QuickActionsNavbarProps {
  user?: User;
}

const QuickActionsNavbar: React.FC<QuickActionsNavbarProps> = ({ user }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const { weather, loading: weatherLoading, fetchWeatherByLocation } = useWeather();
  const { 
    isPlaying, 
    currentTrack, 
    volume, 
    pause,
    resume,
    setVolume
  } = useGlobalAudio();
  const { isVisible } = useScrollNavigation();

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && dropdownRefs.current[activeDropdown]) {
        const dropdown = dropdownRefs.current[activeDropdown];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Calculer la position optimale pour les dropdowns
  const getDropdownPosition = (dropdownKey: string) => {
    const button = buttonRefs.current[dropdownKey];
    if (!button) return {};

    const buttonRect = button.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Largeurs des dropdowns
    const dropdownWidths = {
      weather: 320, // 80 * 4 = 320px
      music: 288,   // 72 * 4 = 288px  
      profile: 256  // 64 * 4 = 256px
    };
    
    const dropdownWidth = dropdownWidths[dropdownKey as keyof typeof dropdownWidths] || 300;
    const dropdownHeight = 400; // Hauteur estimée
    
    let position: any = {};
    
    // Position horizontale
    if (buttonRect.left + dropdownWidth > windowWidth - 20) {
      // Dropdown sort à droite, l'aligner à droite
      position.right = '0';
      position.left = 'auto';
    } else {
      // Assez de place à gauche
      position.left = '0';
      position.right = 'auto';
    }
    
    // Position verticale
    if (buttonRect.bottom + dropdownHeight > windowHeight - 20) {
      // Dropdown sort en bas, l'afficher au-dessus
      position.bottom = '100%';
      position.top = 'auto';
      position.marginBottom = '8px';
      position.marginTop = '0';
    } else {
      // Assez de place en bas
      position.top = '100%';
      position.bottom = 'auto';
      position.marginTop = '8px';
      position.marginBottom = '0';
    }
    
    return position;
  };

  // Charger la météo au montage
  useEffect(() => {
    if (!weather) {
      fetchWeatherByLocation();
    }
  }, [weather, fetchWeatherByLocation]);

  const toggleDropdown = (dropdown: string) => {
    const newActiveDropdown = activeDropdown === dropdown ? null : dropdown;
    setActiveDropdown(newActiveDropdown);
    
    // Forcer un recalcul de la position après que le dropdown soit rendu
    if (newActiveDropdown) {
      setTimeout(() => {
        // Déclencher un re-render pour recalculer la position
        setActiveDropdown(newActiveDropdown);
      }, 0);
    }
  };



  const WeatherDropdown = () => {
    const position = getDropdownPosition('weather');
    return (
      <div 
        className="absolute w-80 bg-white quick-actions-dropdown rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
        style={position}
      >
      <div className={`p-4 ${getWeatherGradient(weather?.description || 'clear')}`}>
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-semibold">{weather?.location || 'Chargement...'}</h3>
            <p className="text-sm opacity-90">{weather?.country}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {weather ? formatTemperature(weather.temperature) : '--°C'}
            </div>
            <div className="text-sm opacity-90">
              {weather?.icon && (
                <span className="text-2xl mr-2">
                  {getWeatherIcon(weather.description, weather.temperature)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
        <div className="p-4 bg-white">
          {weatherLoading && !weather && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <p className="text-sm text-blue-700">Récupération des données météo...</p>
              </div>
            </div>
          )}
          
          {weather && (
            <>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{weather.description}</p>
                {weather.effects && (
                  <p className="text-xs text-blue-600 mt-1">
                    🎮 {weather.effects.description}
                  </p>
                )}
              </div>
            </>
          )}
          
          <button
            onClick={() => fetchWeatherByLocation()}
            className="mt-3 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            disabled={weatherLoading}
          >
            {weatherLoading ? 'Actualisation...' : '🔄 Actualiser'}
          </button>
        </div>
      </div>
    );
  };

  const MusicDropdown = () => {
    const position = getDropdownPosition('music');
    return (
      <div 
        className="absolute w-72 bg-white quick-actions-dropdown rounded-lg shadow-xl border border-gray-200 z-50"
        style={position}
      >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🎵 Lecteur Audio</h3>
        
        {currentTrack ? (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">En cours:</div>
            <div className="font-medium text-gray-800 truncate">
              {currentTrack.includes('Opening') ? 'Musique d\'ouverture' : 
               currentTrack.includes('battle') ? 'Musique de combat' : 
               'Musique Pokémon'}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 mb-4">Aucune musique en cours</div>
        )}

        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={isPlaying ? pause : resume}
            className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Volume:</span>
            <span className="text-sm font-medium">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="text-xs text-gray-500 text-center">
          Musique d'ambiance Pokémon
        </div>
      </div>
      </div>
    );
  };

  const ProfileDropdown = () => {
    const position = getDropdownPosition('profile');
    return (
      <div 
        className="absolute w-64 bg-white quick-actions-dropdown rounded-lg shadow-xl border border-gray-200 z-50"
        style={position}
      >
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-800">{user?.username || 'Utilisateur'}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            to="/dashboard/profile"
            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setActiveDropdown(null)}
          >
            👤 Mon Profil
          </Link>
          <Link
            to="/dashboard/settings"
            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setActiveDropdown(null)}
          >
            ⚙️ Paramètres
          </Link>
          <Link
            to="/dashboard/teams"
            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setActiveDropdown(null)}
          >
            ⚔️ Mes Équipes
          </Link>
          <Link
            to="/dashboard/friends"
            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setActiveDropdown(null)}
          >
            👥 Mes Amis
          </Link>
        </div>

        <div className="border-t border-gray-200 mt-3 pt-3">
          <Form method="post" action="/logout" className="w-full">
            <button
              type="submit"
              onClick={() => {
                // Nettoyer le localStorage côté client avant la soumission
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('backendToken');
                }
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              🚪 Déconnexion
            </button>
          </Form>
        </div>
      </div>
      </div>
    );
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-40 p-4 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-white quick-actions-navbar rounded-lg shadow-lg border border-gray-200 px-4 py-2 hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center justify-between">
          {/* Logo/Titre */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl">⚡</span>
            <span className="font-semibold text-gray-800 hidden sm:inline">Pokémon Battle</span>
          </Link>

          {/* Actions rapides */}
          <div className="flex items-center space-x-2">
            {/* Météo */}
            <div className="relative" ref={el => dropdownRefs.current['weather'] = el}>
              <button
                ref={el => buttonRefs.current['weather'] = el}
                onClick={() => toggleDropdown('weather')}
                className={`p-2 rounded-lg transition-colors ${
                  activeDropdown === 'weather' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Météo"
              >
                <span className="text-lg">
                  {weather ? getWeatherIcon(weather.description, weather.temperature) : '🌤️'}
                </span>
                {weather && (
                  <span className="ml-1 text-sm font-medium hidden sm:inline">
                    {formatTemperature(weather.temperature)}
                  </span>
                )}
              </button>
              {activeDropdown === 'weather' && <WeatherDropdown />}
            </div>

            {/* Musique */}
            <div className="relative" ref={el => dropdownRefs.current['music'] = el}>
              <button
                ref={el => buttonRefs.current['music'] = el}
                onClick={() => toggleDropdown('music')}
                className={`p-2 rounded-lg transition-colors ${
                  activeDropdown === 'music' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Musique"
              >
                <span className="text-lg">{isPlaying ? '🎵' : '🎶'}</span>
              </button>
              {activeDropdown === 'music' && <MusicDropdown />}
            </div>

            {/* Profil */}
            <div className="relative" ref={el => dropdownRefs.current['profile'] = el}>
              <button
                ref={el => buttonRefs.current['profile'] = el}
                onClick={() => toggleDropdown('profile')}
                className={`p-2 rounded-lg transition-colors ${
                  activeDropdown === 'profile' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Profil"
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </button>
              {activeDropdown === 'profile' && <ProfileDropdown />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsNavbar; 