const STORAGE_KEY = 'orbit-arcade.player.v1';
const DEFAULT_CHARACTER = Object.freeze({
  style: 'runner',
  outfitColor: '#8B5CF6',
  skinColor: '#F1C5A5',
  hairColor: '#30243D',
  accentColor: '#F8D36B'
});
const DEFAULT_SETTINGS = Object.freeze({
  soundEnabled: true,
  reducedMotion: false,
  screenShake: true
});

function makePlayerId() {
  const randomPart = () => Math.random().toString(36).slice(2, 7).toUpperCase();
  const source = globalThis.crypto?.randomUUID?.().replaceAll('-', '').slice(0, 8).toUpperCase();
  return `ORB-${source || `${randomPart()}${randomPart()}`}`;
}

function createDefaultProfile() {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    player: {
      id: makePlayerId(),
      name: 'Player',
      balance: 1000,
      createdAt: now,
      lastSeenAt: now
    },
    character: { ...DEFAULT_CHARACTER },
    stats: { gamesPlayed: 0, wins: 0, losses: 0 },
    settings: { ...DEFAULT_SETTINGS }
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safeNumber(value, fallback = 0) {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function safeName(value) {
  if (typeof value !== 'string') return 'Player';
  const clean = value.trim().replace(/[<>]/g, '').slice(0, 16);
  return clean.length >= 3 ? clean : 'Player';
}

function safeHex(value, fallback) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value.toUpperCase() : fallback;
}

function normalizeProfile(raw) {
  const fresh = createDefaultProfile();
  if (!isPlainObject(raw)) return fresh;
  const player = isPlainObject(raw.player) ? raw.player : {};
  const character = isPlainObject(raw.character) ? raw.character : {};
  const stats = isPlainObject(raw.stats) ? raw.stats : {};
  const settings = isPlainObject(raw.settings) ? raw.settings : {};
  const validDate = (value, fallback) => typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback;
  const styles = ['runner', 'ranger', 'pixel'];
  return {
    schemaVersion: 1,
    player: {
      id: typeof player.id === 'string' && /^ORB-[A-Z0-9]{6,12}$/.test(player.id) ? player.id : fresh.player.id,
      name: safeName(player.name),
      balance: safeNumber(player.balance, 1000),
      createdAt: validDate(player.createdAt, fresh.player.createdAt),
      lastSeenAt: validDate(player.lastSeenAt, fresh.player.lastSeenAt)
    },
    character: {
      style: styles.includes(character.style) ? character.style : DEFAULT_CHARACTER.style,
      outfitColor: safeHex(character.outfitColor, DEFAULT_CHARACTER.outfitColor),
      skinColor: safeHex(character.skinColor, DEFAULT_CHARACTER.skinColor),
      hairColor: safeHex(character.hairColor, DEFAULT_CHARACTER.hairColor),
      accentColor: safeHex(character.accentColor, DEFAULT_CHARACTER.accentColor)
    },
    stats: {
      gamesPlayed: safeNumber(stats.gamesPlayed),
      wins: safeNumber(stats.wins),
      losses: safeNumber(stats.losses)
    },
    settings: {
      soundEnabled: typeof settings.soundEnabled === 'boolean' ? settings.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
      reducedMotion: typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
      screenShake: typeof settings.screenShake === 'boolean' ? settings.screenShake : DEFAULT_SETTINGS.screenShake
    }
  };
}

export class PlayerStorage {
  constructor() {
    this.profile = this.#read();
    this.listeners = new Set();
    this.storageAvailable = true;
    this.save();
  }

  #read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeProfile(JSON.parse(raw)) : createDefaultProfile();
    } catch (error) {
      console.warn('Could not read the saved Orbit Arcade profile. A fresh profile will be created.', error);
      return createDefaultProfile();
    }
  }

  get data() {
    return structuredCloneSafe(this.profile);
  }

  save() {
    this.profile.player.lastSeenAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      this.storageAvailable = true;
    } catch (error) {
      this.storageAvailable = false;
      console.error('Could not save the Orbit Arcade profile to LocalStorage.', error);
    }
    this.#emit();
    return this.storageAvailable;
  }

  updatePlayer(patch) {
    if (!isPlainObject(patch)) throw new TypeError('Player updates must be an object.');
    if (Object.hasOwn(patch, 'name')) this.profile.player.name = safeName(patch.name);
    if (Object.hasOwn(patch, 'balance')) this.profile.player.balance = safeNumber(patch.balance, this.profile.player.balance);
    return this.save();
  }

  updateCharacter(patch) {
    if (!isPlainObject(patch)) throw new TypeError('Character updates must be an object.');
    const allowed = ['style', 'outfitColor', 'skinColor', 'hairColor', 'accentColor'];
    for (const key of allowed) {
      if (!Object.hasOwn(patch, key)) continue;
      if (key === 'style' && ['runner', 'ranger', 'pixel'].includes(patch[key])) this.profile.character.style = patch[key];
      if (key.endsWith('Color')) this.profile.character[key] = safeHex(patch[key], this.profile.character[key]);
    }
    return this.save();
  }

  updateSettings(patch) {
    if (!isPlainObject(patch)) throw new TypeError('Settings updates must be an object.');
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (typeof patch[key] === 'boolean') this.profile.settings[key] = patch[key];
    }
    return this.save();
  }

  resetCharacter() {
    this.profile.character = { ...DEFAULT_CHARACTER };
    return this.save();
  }

  resetProfile() {
    this.profile = createDefaultProfile();
    return this.save();
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('Listener must be a function.');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  #emit() {
    const snapshot = this.data;
    for (const listener of this.listeners) {
      try { listener(snapshot, this.storageAvailable); }
      catch (error) { console.error('A profile listener failed.', error); }
    }
  }
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export { DEFAULT_CHARACTER, DEFAULT_SETTINGS, STORAGE_KEY };
