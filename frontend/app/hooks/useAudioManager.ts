// ❌ OBSOLÈTE - REMPLACÉ PAR useGlobalAudio
// Ce hook est conservé pour compatibilité mais ne devrait plus être utilisé
// Utilisez useGlobalAudio à la place

import { useGlobalAudio } from './useGlobalAudio';

/**
 * @deprecated Utilisez useGlobalAudio à la place
 * Ce hook redirige vers le nouveau système audio unifié
 */
export function useAudioManager() {
  console.warn('⚠️ useAudioManager est obsolète. Utilisez useGlobalAudio à la place.');
  return useGlobalAudio();
}