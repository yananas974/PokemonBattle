// 🎨 POKEMON BATTLE COMPONENT SYSTEM
// Modern component architecture with backward compatibility

// ===== CORE COMPONENTS (Existing) =====
export { PokemonCard } from './PokemonCard';
export { PokemonFilters } from './PokemonFilters';
export { StatusIndicator } from './StatusIndicator';
export { VintageCard } from './VintageCard';
export { VintageButton } from './VintageButton';
export { VintageInput } from './VintageInput';
export { VintageTitle } from './VintageTitle';
export { StatCard } from './StatCard';
export { QuickActions } from './QuickActions';
export { default as QuickActionsNavbar } from './QuickActionsNavbar';
export { TeamCard } from './TeamCard';
export { PokemonAudioPlayer } from './PokemonAudioPlayer';

// ===== MODERN COMPONENTS =====
export { ModernDashboard } from './ModernDashboard';
export { ModernTeamBuilder } from './ModernTeamBuilder';
export { ModernBattleInterface } from './ModernBattleInterface';
export { ModernPokemonCard } from './ModernPokemonCard';

// ===== BATTLE COMPONENTS =====
export { HealthBar } from './HealthBar';
export { MoveSelector } from './MoveSelector';
export { BattleLog } from './BattleLog';
export { InteractiveBattle } from './InteractiveBattle';
export { default as TurnBasedBattleWidget } from './TurnBasedBattleWidget';
export { default as TeamBattleWidget } from './TeamBattleWidget';
export { BattleResultModal } from './BattleResultModal';
export { HackChallengeModal } from './HackChallengeModal';

// ===== UTILITY COMPONENTS =====
export { PokemonSprite } from './PokemonSprite';
export { WeatherEffect } from './WeatherEffect';

// ===== DEFAULT EXPORTS =====
export { default as ClientOnly } from './ClientOnly';
export { default as SimpleWeatherWidget } from './SimpleWeatherWidget';
export { ModernWeatherWidget } from './ModernWeatherWidget';
export { default as BottomNavigation } from './BottomNavigation';

// ===== TYPES =====
export type { QuickAction } from './QuickActions';
