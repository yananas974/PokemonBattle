// Import des fonctions serveur depuis le dossier server/
export { loader, action } from './server/dashboard.settings.server';

import type { MetaFunction } from '@remix-run/react';
import { useLoaderData, Form, useActionData, useNavigation, Link } from '@remix-run/react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Paramètres - Pokemon Battle' },
    { name: 'description', content: 'Configurez vos paramètres' },
  ];
};



export default function Settings() {
  const { user } = useLoaderData() as any;
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  
  const isSaving = navigation.state === 'submitting';

  // Mock settings state - in real app, this would come from user preferences
  const [settings, setSettings] = useState({
    notifications: {
      battles: true,
      teams: true,
      friends: false,
      achievements: true
    },
    audio: {
      masterVolume: 80,
      musicVolume: 70,
      sfxVolume: 90,
      muteAll: false
    },
    display: {
      theme: 'modern',
      language: 'fr',
      animations: true,
      reducedMotion: false
    },
    privacy: {
      profilePublic: true,
      showOnline: true,
      allowFriendRequests: true
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-pulse">⚙️</div>
        <div className="absolute top-40 right-20 text-4xl animate-bounce delay-300">🔧</div>
        <div className="absolute bottom-32 left-20 text-5xl animate-pulse delay-700">🎛️</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-bounce delay-1000">📱</div>
        <div className="absolute top-1/3 left-1/4 text-3xl animate-pulse delay-500">⭐</div>
        <div className="absolute top-2/3 right-1/3 text-3xl animate-bounce delay-1200">💎</div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <ModernCard variant="glass" className="backdrop-blur-xl bg-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-2xl font-bold text-white">
                    ⚙️
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Paramètres
                    </h1>
                    <p className="text-white/70">
                      Configurez votre expérience de jeu, <span className="font-semibold text-purple-300">{user.username}</span>
                    </p>
                  </div>
                </div>
                
                <Link to="/dashboard/profile">
                  <ModernButton variant="secondary" size="sm">
                    <span className="mr-2">👤</span>
                    Retour au Profil
                  </ModernButton>
                </Link>
              </div>
            </div>
          </ModernCard>

          {/* Success/Error Message */}
          {actionData?.message && (
            <ModernCard 
              variant="glass" 
              className={`border-l-4 ${actionData.success ? 'border-green-400 bg-green-500/20' : 'border-red-400 bg-red-500/20'}`}
            >
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{actionData.success ? '✅' : '❌'}</span>
                  <div>
                    <h3 className={`font-bold mb-2 ${actionData.success ? 'text-green-200' : 'text-red-200'}`}>
                      {actionData.success ? 'Succès' : 'Erreur'}
                    </h3>
                    <p className={`${actionData.success ? 'text-green-100' : 'text-red-100'}`}>
                      {actionData.message}
                    </p>
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Notifications Settings */}
            <ModernCard variant="glass" size="lg" className="shadow-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <span>🔔</span>
                  <span>Notifications</span>
                </h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'battles', label: 'Invitations aux combats', description: 'Recevoir des notifications pour les défis' },
                    { key: 'teams', label: 'Équipes', description: 'Changements dans vos équipes' },
                    { key: 'friends', label: 'Amis', description: 'Demandes d\'amitié et activités' },
                    { key: 'achievements', label: 'Succès', description: 'Nouveaux succès débloqués' }
                  ].map((notification) => (
                    <div key={notification.key} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{notification.label}</div>
                          <div className="text-white/60 text-sm">{notification.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[notification.key as keyof typeof settings.notifications]}
                            onChange={(e) => updateSetting('notifications', notification.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Audio Settings */}
            <ModernCard variant="glass" size="lg" className="shadow-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <span>🔊</span>
                  <span>Audio</span>
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Couper le son</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.audio.muteAll}
                          onChange={(e) => updateSetting('audio', 'muteAll', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>

                  {[
                    { key: 'masterVolume', label: 'Volume général', icon: '🔊' },
                    { key: 'musicVolume', label: 'Musique', icon: '🎵' },
                    { key: 'sfxVolume', label: 'Effets sonores', icon: '💥' }
                  ].map((volume) => (
                    <div key={volume.key} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-xl">{volume.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium">{volume.label}</div>
                          <div className="text-white/60 text-sm">{settings.audio[volume.key as keyof typeof settings.audio]}%</div>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.audio[volume.key as keyof typeof settings.audio] as number}
                        onChange={(e) => updateSetting('audio', volume.key, parseInt(e.target.value))}
                        disabled={settings.audio.muteAll}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer bg-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Display Settings */}
            <ModernCard variant="glass" size="lg" className="shadow-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <span>🎨</span>
                  <span>Affichage</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white font-medium block mb-2">Thème</label>
                    <select
                      value={settings.display.theme}
                      onChange={(e) => updateSetting('display', 'theme', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="modern">Moderne</option>
                      <option value="vintage">Vintage</option>
                      <option value="dark">Sombre</option>
                    </select>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <label className="text-white font-medium block mb-2">Langue</label>
                    <select
                      value={settings.display.language}
                      onChange={(e) => updateSetting('display', 'language', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  {[
                    { key: 'animations', label: 'Animations', description: 'Activer les animations dans l\'interface' },
                    { key: 'reducedMotion', label: 'Mouvement réduit', description: 'Réduire les animations pour l\'accessibilité' }
                  ].map((display) => (
                    <div key={display.key} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{display.label}</div>
                          <div className="text-white/60 text-sm">{display.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.display[display.key as keyof typeof settings.display] as boolean}
                            onChange={(e) => updateSetting('display', display.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ModernCard>

            {/* Privacy Settings */}
            <ModernCard variant="glass" size="lg" className="shadow-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <span>🔒</span>
                  <span>Confidentialité</span>
                </h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'profilePublic', label: 'Profil public', description: 'Permettre aux autres de voir votre profil' },
                    { key: 'showOnline', label: 'Statut en ligne', description: 'Afficher quand vous êtes connecté' },
                    { key: 'allowFriendRequests', label: 'Demandes d\'amitié', description: 'Autoriser les demandes d\'amitié' }
                  ].map((privacy) => (
                    <div key={privacy.key} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{privacy.label}</div>
                          <div className="text-white/60 text-sm">{privacy.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy[privacy.key as keyof typeof settings.privacy]}
                            onChange={(e) => updateSetting('privacy', privacy.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <Form method="post" className="w-full max-w-md">
              <input type="hidden" name="action" value="save-settings" />
              <ModernButton
                type="submit"
                variant="pokemon"
                size="lg"
                disabled={isSaving}
                loading={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  "Sauvegarde en cours..."
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Sauvegarder les Paramètres
                  </>
                )}
              </ModernButton>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
} 