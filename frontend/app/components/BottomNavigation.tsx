import { Link, useLocation } from '@remix-run/react';

const navItems = [
  {
    id: 'dashboard',
    label: 'Accueil',
    icon: '🏠',
    href: '/dashboard',
    end: true
  },
  {
    id: 'pokemon',
    label: 'Pokémon',
    icon: '🔴',
    href: '/dashboard/pokemon'
  },
  {
    id: 'teams',
    label: 'Équipes',
    icon: '👥',
    href: '/dashboard/teams'
  },
  {
    id: 'battle',
    label: 'Combat',
    icon: '⚔️',
    href: '/dashboard/battle',
    isPrimary: true
  },
  {
    id: 'friends',
    label: 'Amis',
    icon: '🤝',
    href: '/dashboard/friends'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: '👤',
    href: '/dashboard/profile'
  }
];

export default function BottomNavigation() {
  const location = useLocation();

  const isActive = (item: typeof navItems[0]) => {
    if (item.end) {
      return location.pathname === item.href;
    }
    return location.pathname.startsWith(item.href);
  };

  return (
    <nav style={{
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      background: '#374151',
      border: '4px solid #1e3a8a',
      borderRadius: '12px 12px 0 0',
      boxShadow: 'inset 0 2px 0px rgba(255,255,255,0.1), 0 -4px 8px rgba(0,0,0,0.3)',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      minHeight: '70px'
    }}>
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                transform: item.isPrimary ? 'scale(1.2)' : (active ? 'scale(1.1)' : 'scale(1)'),
                cursor: 'pointer',
                minHeight: '50px',
                minWidth: '50px',
                padding: item.isPrimary ? '12px' : '8px',
                background: item.isPrimary 
                  ? 'linear-gradient(145deg, #fca5a5 0%, #dc2626 100%)'
                  : (active ? '#fbbf24' : 'rgba(255,255,255,0.1)'),
                border: '3px solid',
                borderColor: item.isPrimary ? '#374151' : (active ? '#fbbf24' : 'transparent'),
                borderRadius: '12px',
                color: item.isPrimary ? 'white' : (active ? '#374151' : '#fbbf24'),
                textDecoration: 'none',
                boxShadow: active || item.isPrimary ? 'inset 1px 1px 2px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              <span className={`${item.isPrimary ? 'text-xl' : 'text-lg'}`}>
                {item.icon}
              </span>
              
              {!item.isPrimary && (
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  marginTop: '2px',
                  fontWeight: 'bold',
                  opacity: active ? 1 : 0.8
                }}>
                  {item.label.toUpperCase()}
                </span>
              )}
              
              {/* Indicateur actif vintage */}
              {active && !item.isPrimary && (
                <div style={{
                  position: 'absolute' as const,
                  bottom: '4px',
                  width: '8px',
                  height: '3px',
                  background: '#dc2626',
                  borderRadius: '2px'
                }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Styles CSS à ajouter dans votre fichier global CSS
export const bottomNavigationStyles = `
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  
  @media (max-width: 640px) {
    body {
      padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px));
    }
  }
`; 