export interface UserSettings {
  soundEnabled: boolean;
  sfxEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  theme: 'light' | 'dark';
  showVFX: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  sfxEnabled: true,
  graphicsQuality: 'high',
  theme: 'dark',
  showVFX: true
};

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
    if (!id || id.length < 30) {
      // Generate a valid UUID fallback if missing or it was the old 8-digit format
      id = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
      localStorage.setItem('know_player_id', id);
    }
    return id;
  },
  setPlayerId: (id: string) => {
    localStorage.setItem('know_player_id', id);
  },
  getPlayerAvatar: (): string => {
    let avatar = localStorage.getItem('know_player_avatar');
    if (!avatar) {
      // Default avatar based on id
      const id = storage.getPlayerId();
      avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`;
      localStorage.setItem('know_player_avatar', avatar);
    }
    return avatar;
  },
  setPlayerAvatar: (avatarUrl: string) => {
    localStorage.setItem('know_player_avatar', avatarUrl);
  },
  getSettings: (): UserSettings => {
    const s = localStorage.getItem('know_settings');
    if (s) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  },
  setSettings: (settings: Partial<UserSettings>) => {
    const current = storage.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('know_settings', JSON.stringify(updated));
    return updated;
  }
};
