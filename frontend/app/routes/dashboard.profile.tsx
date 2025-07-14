import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';

export const meta: MetaFunction = () => {
  return [
    { title: 'Mon Profil - Pokemon Battle' },
    { name: 'description', content: 'Gérez votre profil utilisateur' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUserFromSession } = await import('~/sessions.server');
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return json({ user });
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  // Mock data for demonstration - in real app this would come from the backend
  const userStats = {
    teamsCreated: 3,
    battlesWon: 12,
    battlesLost: 8,
    favoriteType: 'Electric',
    totalBattles: 20,
    winRate: 60,
    joinDate: new Date(2024, 0, 15).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  const achievements = [
    { icon: '🏆', title: 'Premier Combat', description: 'Remportez votre premier combat' },
    { icon: '⚡', title: 'Maître Électrique', description: 'Remportez 10 combats avec des Pokémon Électrique' },
    { icon: '🔥', title: 'Série de Victoires', description: 'Remportez 5 combats consécutifs' },
    { icon: '👑', title: 'Collectionneur', description: 'Créez 5 équipes différentes' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
     
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">

          <ModernCard variant="glass" className="backdrop-blur-xl bg-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      👤 Mon Profil
                    </h1>
                    <p className="text-white/70">
                      Bienvenue, <span className="font-semibold text-purple-300">{user.username}</span> !
                    </p>
                  </div>
                </div>
                
                <Link to="/dashboard/settings">
                  <ModernButton variant="secondary" size="sm">
                    <span className="mr-2">⚙️</span>
                    Paramètres
                  </ModernButton>
                </Link>
              </div>
            </div>
          </ModernCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">            
            <div className="lg:col-span-2 space-y-8">
              <ModernCard variant="glass" size="lg" className="shadow-2xl">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                    <span>📋</span>
                    <span>Informations du Dresseur</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <label className="text-white/70 text-sm">Nom d'utilisateur</label>
                        <div className="text-white font-semibold text-lg">{user.username}</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <label className="text-white/70 text-sm">Email</label>
                        <div className="text-white font-semibold">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <label className="text-white/70 text-sm">Date d'inscription</label>
                        <div className="text-white font-semibold">{userStats.joinDate}</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <label className="text-white/70 text-sm">Type favori</label>
                        <div className="text-white font-semibold flex items-center space-x-2">
                          <span>⚡</span>
                          <span>{userStats.favoriteType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Battle Statistics */}
              <ModernCard variant="glass" size="lg" className="shadow-2xl">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                    <span>📊</span>
                    <span>Statistiques de Combat</span>
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-white/5 rounded-lg p-4">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="text-2xl font-bold text-green-400">{userStats.battlesWon}</div>
                      <div className="text-white/70 text-sm">Victoires</div>
                    </div>
                    
                    <div className="text-center bg-white/5 rounded-lg p-4">
                      <div className="text-3xl mb-2">💔</div>
                      <div className="text-2xl font-bold text-red-400">{userStats.battlesLost}</div>
                      <div className="text-white/70 text-sm">Défaites</div>
                    </div>
                    
                    <div className="text-center bg-white/5 rounded-lg p-4">
                      <div className="text-3xl mb-2">⚔️</div>
                      <div className="text-2xl font-bold text-blue-400">{userStats.totalBattles}</div>
                      <div className="text-white/70 text-sm">Total</div>
                    </div>
                    
                    <div className="text-center bg-white/5 rounded-lg p-4">
                      <div className="text-3xl mb-2">📈</div>
                      <div className="text-2xl font-bold text-purple-400">{userStats.winRate}%</div>
                      <div className="text-white/70 text-sm">Taux de victoire</div>
                    </div>
                  </div>
                  
                  {/* Win Rate Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-white/70 text-sm mb-2">
                      <span>Progression</span>
                      <span>{userStats.winRate}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${userStats.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Quick Stats */}
              <ModernCard variant="glass" className="bg-blue-500/20">
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Statistiques Rapides</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-white/80">
                      <span>Équipes créées</span>
                      <span className="font-semibold">{userStats.teamsCreated}</span>
                    </div>
                    
                    <div className="flex justify-between text-white/80">
                      <span>Niveau</span>
                      <span className="font-semibold text-yellow-400">Champion</span>
                    </div>
                    
                    <div className="flex justify-between text-white/80">
                      <span>Rang</span>
                      <span className="font-semibold text-purple-400">#47</span>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Achievements */}
              <ModernCard variant="glass" className="bg-yellow-500/20">
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <span>🏅</span>
                    <span>Succès</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-3 bg-white/5 rounded-lg p-3">
                        <span className="text-xl">{achievement.icon}</span>
                        <div>
                          <div className="text-white font-medium text-sm">{achievement.title}</div>
                          <div className="text-white/60 text-xs">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ModernCard>

              {/* Quick Actions */}
              <ModernCard variant="glass" className="bg-green-500/20">
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Actions Rapides</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <Link to="/dashboard/teams/create" className="block">
                      <ModernButton variant="pokemon" size="sm" className="w-full">
                        <span className="mr-2">➕</span>
                        Créer une équipe
                      </ModernButton>
                    </Link>
                    
                    <Link to="/dashboard/battle" className="block">
                      <ModernButton variant="secondary" size="sm" className="w-full">
                        <span className="mr-2">⚔️</span>
                        Lancer un combat
                      </ModernButton>
                    </Link>
                    
                    <Link to="/dashboard/pokemon" className="block">
                      <ModernButton variant="secondary" size="sm" className="w-full">
                        <span className="mr-2">🔍</span>
                        Explorer Pokémon
                      </ModernButton>
                    </Link>
                  </div>
                </div>
              </ModernCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 