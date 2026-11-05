const DEFAULTS = {
  style: 'runner',
  outfitColor: '#8B5CF6',
  skinColor: '#F1C5A5',
  hairColor: '#30243D',
  accentColor: '#F8D36B'
};

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function shade(hex, amount = -22) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255].map(channel => Math.max(0, Math.min(255, channel + amount)));
  return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
}

function drawCharacter(ctx, width, height, appearance = DEFAULTS, motion = 0) {
  const a = { ...DEFAULTS, ...appearance };
  const scale = Math.min(width / 300, height / 350);
  const cx = width / 2;
  const cy = height / 2 + 14 * scale;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const bob = Math.sin(motion) * 2.2;

  // Soft ground shadow and stage glint.
  ctx.save();
  ctx.translate(0, 126);
  ctx.scale(1, .28);
  const shadow = ctx.createRadialGradient(0, 0, 10, 0, 0, 86);
  shadow.addColorStop(0, 'rgba(4, 7, 18, .55)');
  shadow.addColorStop(1, 'rgba(4, 7, 18, 0)');
  ctx.fillStyle = shadow;
  ctx.beginPath(); ctx.arc(0, 0, 86, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Legs and shoes.
  ctx.fillStyle = shade(a.outfitColor, -28);
  roundedRect(ctx, -43, 54 + bob, 34, 68, a.style === 'pixel' ? 3 : 12); ctx.fill();
  roundedRect(ctx, 9, 54 - bob, 34, 68, a.style === 'pixel' ? 3 : 12); ctx.fill();
  ctx.fillStyle = '#171c2c';
  roundedRect(ctx, -49, 108 + bob, 45, 18, 8); ctx.fill();
  roundedRect(ctx, 5, 108 - bob, 45, 18, 8); ctx.fill();
  ctx.fillStyle = a.accentColor;
  roundedRect(ctx, -39, 112 + bob, 22, 4, 2); ctx.fill();
  roundedRect(ctx, 15, 112 - bob, 22, 4, 2); ctx.fill();

  // Arms behind the torso.
  ctx.save();
  ctx.translate(-68, -5 + bob);
  ctx.rotate(-.13);
  ctx.fillStyle = a.outfitColor;
  roundedRect(ctx, -12, -8, 28, 76, a.style === 'pixel' ? 3 : 13); ctx.fill();
  ctx.fillStyle = a.skinColor;
  roundedRect(ctx, -10, 54, 23, 28, 10); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(68, -5 - bob);
  ctx.rotate(.13);
  ctx.fillStyle = a.outfitColor;
  roundedRect(ctx, -16, -8, 28, 76, a.style === 'pixel' ? 3 : 13); ctx.fill();
  ctx.fillStyle = a.skinColor;
  roundedRect(ctx, -13, 54, 23, 28, 10); ctx.fill();
  ctx.restore();

  // Torso.
  ctx.fillStyle = shade(a.outfitColor, -15);
  ctx.beginPath();
  ctx.moveTo(-48, -49); ctx.quadraticCurveTo(-59, -43, -56, -18);
  ctx.lineTo(-46, 62); ctx.quadraticCurveTo(0, 75, 46, 62);
  ctx.lineTo(56, -18); ctx.quadraticCurveTo(59, -43, 48, -49);
  ctx.quadraticCurveTo(0, -63, -48, -49); ctx.fill();
  ctx.fillStyle = a.outfitColor;
  ctx.beginPath();
  ctx.moveTo(-39, -48); ctx.quadraticCurveTo(0, -59, 39, -48);
  ctx.lineTo(35, 48); ctx.quadraticCurveTo(0, 60, -35, 48); ctx.closePath(); ctx.fill();
  ctx.fillStyle = a.accentColor;
  roundedRect(ctx, -28, -22, 56, 7, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  roundedRect(ctx, -28, -8, 6, 41, 3); ctx.fill();

  // Ranger has a short shoulder cape and pixel has blockier detailing.
  if (a.style === 'ranger') {
    ctx.fillStyle = shade(a.outfitColor, -42);
    ctx.beginPath(); ctx.moveTo(-45, -43); ctx.lineTo(-62, 32); ctx.lineTo(-43, 42); ctx.lineTo(-31, -30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(45, -43); ctx.lineTo(62, 32); ctx.lineTo(43, 42); ctx.lineTo(31, -30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = a.accentColor; ctx.beginPath(); ctx.arc(0, -25, 5, 0, Math.PI * 2); ctx.fill();
  } else if (a.style === 'pixel') {
    ctx.fillStyle = a.accentColor;
    ctx.fillRect(-33, 5, 9, 9); ctx.fillRect(24, 5, 9, 9);
    ctx.fillStyle = shade(a.outfitColor, 20); ctx.fillRect(-22, 36, 44, 7);
  }

  // Neck and head.
  ctx.fillStyle = shade(a.skinColor, -13);
  roundedRect(ctx, -13, -74, 26, 31, 7); ctx.fill();
  ctx.fillStyle = a.skinColor;
  ctx.beginPath(); ctx.ellipse(0, -103, 43, 50, 0, 0, Math.PI * 2); ctx.fill();
  // Ears.
  ctx.beginPath(); ctx.ellipse(-42, -101, 8, 12, -.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(42, -101, 8, 12, .1, 0, Math.PI * 2); ctx.fill();

  // Hair silhouette and fringe.
  ctx.fillStyle = a.hairColor;
  ctx.beginPath();
  if (a.style === 'pixel') {
    ctx.moveTo(-43, -109); ctx.lineTo(-43, -143); ctx.lineTo(-24, -143); ctx.lineTo(-24, -151);
    ctx.lineTo(14, -151); ctx.lineTo(14, -143); ctx.lineTo(39, -143); ctx.lineTo(43, -108);
    ctx.lineTo(26, -116); ctx.lineTo(13, -105); ctx.lineTo(-2, -117); ctx.lineTo(-18, -105); ctx.closePath();
  } else if (a.style === 'ranger') {
    ctx.moveTo(-43, -105); ctx.quadraticCurveTo(-56, -147, -20, -155);
    ctx.quadraticCurveTo(19, -169, 43, -137); ctx.quadraticCurveTo(50, -125, 42, -103);
    ctx.lineTo(28, -119); ctx.quadraticCurveTo(8, -104, -5, -116);
    ctx.quadraticCurveTo(-28, -98, -43, -105); ctx.closePath();
  } else {
    ctx.moveTo(-43, -105); ctx.quadraticCurveTo(-57, -151, -20, -156);
    ctx.quadraticCurveTo(20, -169, 43, -138); ctx.quadraticCurveTo(52, -122, 40, -104);
    ctx.quadraticCurveTo(25, -118, 14, -128); ctx.quadraticCurveTo(-5, -108, -19, -119);
    ctx.quadraticCurveTo(-32, -108, -43, -105); ctx.closePath();
  }
  ctx.fill();
  // Face, eyes and smile.
  ctx.fillStyle = '#29263a';
  ctx.beginPath(); ctx.ellipse(-15, -101, 3.2, 4.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(15, -101, 3.2, 4.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(123,65,68,.72)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -84, 8, .18, Math.PI - .18); ctx.stroke();
  // Accent headband / cap mark.
  if (a.style === 'runner') {
    ctx.fillStyle = a.accentColor;
    ctx.beginPath(); ctx.moveTo(-37, -131); ctx.quadraticCurveTo(0, -147, 38, -130); ctx.lineTo(35, -121); ctx.quadraticCurveTo(0, -137, -35, -120); ctx.closePath(); ctx.fill();
  } else if (a.style === 'ranger') {
    ctx.strokeStyle = a.accentColor; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, -111, 44, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  } else {
    ctx.fillStyle = a.accentColor; ctx.fillRect(-8, -151, 16, 7);
  }
  // Small chest emblem.
  ctx.fillStyle = a.accentColor;
  ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(8, 7); ctx.lineTo(0, 17); ctx.lineTo(-8, 7); ctx.closePath(); ctx.fill();

  ctx.restore();
}

export class CharacterRenderer {
  constructor() {
    this.canvases = new Map();
    this.appearance = { ...DEFAULTS };
    this.motion = 0;
    this.animationFrame = null;
    this.lastTimestamp = 0;
    this.reducedMotion = false;
  }

  register(canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.canvases.set(canvas, ctx);
    this.#resize(canvas);
    this.draw();
  }

  setAppearance(appearance) {
    this.appearance = { ...DEFAULTS, ...appearance };
    this.draw();
  }

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    if (this.reducedMotion) this.stop();
    else this.start();
    this.draw();
  }

  #resize(canvas) {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round((rect.width || canvas.width) * ratio));
    const height = Math.max(1, Math.round((rect.height || canvas.height) * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  draw() {
    for (const [canvas, ctx] of this.canvases) {
      this.#resize(canvas);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      drawCharacter(ctx, width, height, this.appearance, this.reducedMotion ? 0 : this.motion);
    }
  }

  start() {
    if (this.animationFrame || this.reducedMotion || this.canvases.size === 0) return;
    const tick = timestamp => {
      if (timestamp - this.lastTimestamp > 45) {
        this.motion += .055;
        this.draw();
        this.lastTimestamp = timestamp;
      }
      this.animationFrame = requestAnimationFrame(tick);
    };
    this.animationFrame = requestAnimationFrame(tick);
  }

  stop() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  destroy() {
    this.stop();
    this.canvases.clear();
  }
}

export { DEFAULTS as DEFAULT_CHARACTER_APPEARANCE };
