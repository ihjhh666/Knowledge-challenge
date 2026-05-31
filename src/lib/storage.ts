export const storage = {
  getPlayerName: (): string | null => {
    return localStorage.getItem('know_player_name');
  },
  setPlayerName: (name: string) => {
    localStorage.setItem('know_player_name', name);
  },
  clearPlayerName: () => {
    localStorage.removeItem('know_player_name');
  },
  getPlayerId: (): string => {
    let id = localStorage.getItem('know_player_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('know_player_id', id);
    }
    return id;
  }
};
