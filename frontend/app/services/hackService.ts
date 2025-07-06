export const hackService = {
  async solveHackChallenge(battleId: string, answer: string, token: string) {
    const response = await fetch('/api/interactive-battle/solve-hack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        battleId,
        answer,
        token
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la résolution du hack');
    }

    return response.json();
  }
}; 