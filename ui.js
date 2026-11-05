import { PlayerStorage, DEFAULT_CHARACTER } from './storage.js';
import { formatCredits, formatDate, getInitial, validatePlayerName } from './account.js';
import { CharacterRenderer } from './character.js';
import { Navigation } from './navigation.js';

const storage = new PlayerStorage();
const renderer = new CharacterRenderer();
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function toast(message, type = 'success') {
  const region = $('#toastRegion');
  if (!region) return;
  const element = document.createElement('div');
  element.className = `toast${type === 'error' ? ' error' : ''}`;
  element.textContent = message;
  region.append(element);
  window.setTimeout(() => element.remove(), 3400);
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function setError(selector, message) {
  const element = $(selector);
  if (!element) return;
  element.textContent = message;
  element.hidden = !message;
}

function updateNameCount(value) {
  setText('#nameCount', `${value.length} / 16`);
}

function updateView(profile) {
  const { player, character, stats, settings } = profile;
  const credits = formatCredits(player.balance);
  const initial = getInitial(player.name);
  setText('#sidebarPlayerName', player.name);
  setText('#sidebarPlayerId', `ID: ${player.id}`);
  setText('#topPlayerName', player.name);
  setText('#topInitial', initial);
  setText('#topBalance', credits);
  setText('#heroPlayerName', player.name);
  setText('#statBalance', credits);
  setText('#statGames', formatCredits(stats.gamesPlayed));
  setText('#statWins', formatCredits(stats.wins));
  setText('#statSince', formatDate(player.createdAt));
  setText('#previewPlayerName', player.name);
  setText('#profileDisplayName', player.name);
  setText('#profileId', `PLAYER ID · ${player.id}`);
  setText('#profileBalance', credits);
  setText('#profileCreated', formatDate(player.createdAt));
  setText('#profileGames', formatCredits(stats.gamesPlayed));
  setText('#profileWins', formatCredits(stats.wins));
  setText('#profileLosses', formatCredits(stats.losses));
  const input = $('#characterName');
  if (input && document.activeElement !== input) input.value = player.name;
  updateNameCount(input?.value ?? player.name);
  const profileName = $('#profileNameInput');
  if (profileName && document.activeElement !== profileName) profileName.value = player.name;
  const avatar = $('#sidebarAvatar');
  if (avatar) {
    avatar.style.background = `linear-gradient(145deg, ${character.outfitColor}, #172942)`;
    avatar.textContent = initial;
  }
  renderer.setAppearance(character);
  const toggles = { soundEnabled: '#soundToggle', reducedMotion: '#motionToggle', screenShake: '#shakeToggle' };
  for (const [key, selector] of Object.entries(toggles)) {
    const toggle = $(selector);
    if (toggle) toggle.checked = settings[key];
  }
  renderer.setReducedMotion(settings.reducedMotion);
  document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
  if (!storage.storageAvailable) {
    toast('Browser storage is unavailable. Your changes may not persist.', 'error');
  }
}

function saveName(inputSelector, errorSelector) {
  const input = $(inputSelector);
  const result = validatePlayerName(input?.value ?? '');
  if (!result.valid) {
    setError(errorSelector, result.message);
    input?.focus();
    return false;
  }
  setError(errorSelector, '');
  storage.updatePlayer({ name: result.name });
  toast('Player name saved.');
  return true;
}

function bindCharacterControls() {
  const nameInput = $('#characterName');
  nameInput?.addEventListener('input', () => {
    updateNameCount(nameInput.value);
    setError('#nameError', '');
  });
  nameInput?.addEventListener('change', () => saveName('#characterName', '#nameError'));
  nameInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveName('#characterName', '#nameError');
      nameInput.blur();
    }
  });

  $$('.style-option').forEach(button => {
    button.addEventListener('click', () => {
      storage.updateCharacter({ style: button.dataset.style });
      $$('.style-option').forEach(option => {
        const selected = option === button;
        option.classList.toggle('selected', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
    });
  });

  $$('[data-color-group]').forEach(group => {
    const key = group.dataset.colorGroup;
    $$('.swatch', group).forEach(button => {
      button.addEventListener('click', () => {
        storage.updateCharacter({ [key]: button.dataset.color });
        $$('.swatch', group).forEach(swatch => {
          const selected = swatch === button;
          swatch.classList.toggle('selected', selected);
          swatch.setAttribute('aria-pressed', String(selected));
        });
      });
    });
  });

  $('#resetCharacter')?.addEventListener('click', () => {
    storage.resetCharacter();
    syncCharacterControls(storage.data.character);
    toast('Character appearance reset.');
  });
}

function syncCharacterControls(character) {
  $$('.style-option').forEach(button => {
    const selected = button.dataset.style === character.style;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $$('[data-color-group]').forEach(group => {
    const value = character[group.dataset.colorGroup];
    $$('.swatch', group).forEach(button => {
      const selected = button.dataset.color.toUpperCase() === value.toUpperCase();
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  });
}

function bindProfileControls() {
  $('#saveProfileName')?.addEventListener('click', () => saveName('#profileNameInput', '#profileNameError'));
  $('#profileNameInput')?.addEventListener('input', () => setError('#profileNameError', ''));
  $('#profileNameInput')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveName('#profileNameInput', '#profileNameError');
    }
  });
}

function bindSettings() {
  const bindings = {
    soundEnabled: '#soundToggle',
    reducedMotion: '#motionToggle',
    screenShake: '#shakeToggle'
  };
  for (const [key, selector] of Object.entries(bindings)) {
    $(selector)?.addEventListener('change', event => {
      storage.updateSettings({ [key]: event.currentTarget.checked });
      toast('Settings saved.');
    });
  }
  $('#resetAccount')?.addEventListener('click', () => {
    const confirmed = window.confirm('Reset your local Orbit Arcade profile? This deletes the saved name, character, settings, statistics, and balance on this browser. A new profile will start with 1,000 virtual credits.');
    if (!confirmed) return;
    storage.resetProfile();
    syncCharacterControls(storage.data.character);
    setError('#nameError', '');
    setError('#profileNameError', '');
    toast('Your local profile has been reset.');
  });
}

function bindCopyPlayerId() {
  const idElement = $('#profileId');
  idElement?.addEventListener('click', async () => {
    const id = storage.data.player.id;
    try {
      await navigator.clipboard.writeText(id);
      toast('Player ID copied.');
    } catch {
      toast(`Your Player ID is ${id}`, 'error');
    }
  });
  if (idElement) {
    idElement.tabIndex = 0;
    idElement.setAttribute('role', 'button');
    idElement.setAttribute('aria-label', 'Copy player ID');
    idElement.title = 'Click to copy your player ID';
    idElement.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        idElement.click();
      }
    });
  }
}

function setupCanvases() {
  ['#heroCharacterCanvas', '#customCharacterCanvas', '#profileCharacterCanvas'].forEach(selector => {
    const canvas = $(selector);
    if (canvas) renderer.register(canvas);
  });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => renderer.draw());
    ['#heroCharacterCanvas', '#customCharacterCanvas', '#profileCharacterCanvas'].forEach(selector => {
      const canvas = $(selector);
      if (canvas) observer.observe(canvas);
    });
  } else {
    window.addEventListener('resize', () => renderer.draw(), { passive: true });
  }
  renderer.start();
}

function bindKeyboardShortcuts() {
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const active = document.activeElement;
    if (active instanceof HTMLInputElement) active.blur();
  });
}

function init() {
  setupCanvases();
  syncCharacterControls(storage.data.character);
  updateView(storage.data);
  storage.subscribe(profile => {
    updateView(profile);
    syncCharacterControls(profile.character);
  });
  new Navigation({ onNavigate: () => window.scrollTo({ top: 0, behavior: storage.data.settings.reducedMotion ? 'auto' : 'smooth' }) });
  bindCharacterControls();
  bindProfileControls();
  bindSettings();
  bindCopyPlayerId();
  bindKeyboardShortcuts();

  if (!storage.storageAvailable) {
    toast('LocalStorage could not be accessed. Profile data may reset when you leave.', 'error');
  }
  if (storage.data.player.name === 'Player') {
    // The profile is ready immediately; the name can be personalized at any time.
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

window.addEventListener('beforeunload', () => renderer.destroy(), { once: true });
