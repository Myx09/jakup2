const VALID_SECTIONS = new Set(['overview', 'character', 'profile', 'settings']);
const TITLES = { overview: 'Overview', character: 'Character', profile: 'My profile', settings: 'Settings' };

export class Navigation {
  constructor({ onNavigate } = {}) {
    this.onNavigate = onNavigate;
    this.links = [...document.querySelectorAll('[data-section]')];
    this.sections = [...document.querySelectorAll('.page-section')];
    this.title = document.getElementById('pageTitle');
    this.handleClick = this.handleClick.bind(this);
    this.handleHash = this.handleHash.bind(this);
    document.addEventListener('click', this.handleClick);
    window.addEventListener('hashchange', this.handleHash);
    this.navigate(this.#sectionFromHash(), false);
  }

  #sectionFromHash() {
    const requested = window.location.hash.replace(/^#/, '');
    return VALID_SECTIONS.has(requested) ? requested : 'overview';
  }

  handleClick(event) {
    const target = event.target.closest('[data-go]');
    if (!target) return;
    const section = target.dataset.go;
    if (!VALID_SECTIONS.has(section)) return;
    event.preventDefault();
    this.navigate(section);
  }

  handleHash() {
    this.navigate(this.#sectionFromHash(), false);
  }

  navigate(section, updateHash = true) {
    if (!VALID_SECTIONS.has(section)) section = 'overview';
    this.sections.forEach(element => {
      const active = element.id === `section-${section}`;
      element.classList.toggle('active', active);
      element.hidden = !active;
    });
    this.links.forEach(link => {
      const active = link.dataset.section === section;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (this.title) this.title.textContent = TITLES[section];
    if (updateHash && window.location.hash !== `#${section}`) window.location.hash = section;
    this.onNavigate?.(section);
  }

  destroy() {
    document.removeEventListener('click', this.handleClick);
    window.removeEventListener('hashchange', this.handleHash);
  }
}
