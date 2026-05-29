export const storage = {
  getPlayerName: (): string | null => {
    return localStorage.getItem('know_player_name');
  },
  setPlayerName: (name: string) => {
    localStorage.setItem('know_player_name', name);
  },
  clearPlayerName: () => {
    localStorage.removeItem('know_player_name');
  }
};
