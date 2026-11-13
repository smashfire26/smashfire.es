/* ==========================================================================
   SMASHFIRE — JAVASCRIPT DE MARCA (BRASAS, CENIZAS, CALCULADORA & SCROLLSPY)
   - Sistema de Brasas Ardientes y Cenizas Flotantes en Canvas
   - Calculadora Interactiva de Tiempos y Plancha Smash
   - Sistema de Acordeón FAQ
   - Visor Modal de Certificado Protegido (Solo Visualización)
   - Selector de Idioma (ES / PT / EN)
   - Scrollspy sin saltos (100% fluido en móvil y desktop)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CANVAS DE BRASAS ARDIENTES Y CENIZAS FLOTANTES
   -------------------------------------------------------------------------- */
const canvas = document.getElementById('embers-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const particles = [];
const isMobileDevice = window.innerWidth < 768;
// Densidad calibrada: chispas incandescentes + cenizas oscuras flotantes
const totalParticles = isMobileDevice ? 32 : 70;

class EmberParticle {
  constructor(x, y, isExplosion = false) {
    this.reset(x, y, isExplosion);
  }

  reset(x, y, isExplosion = false) {
    this.x = x || Math.random() * width;
    this.y = y || height + Math.random() * 25;
    
    // 80% chispas de fuego brillantes, 20% cenizas flotantes oscuras
    this.isAsh = Math.random() < 0.22;
    
    if (this.isAsh) {
      this.size = Math.random() * 3.5 + 1.5;
      this.speedY = isExplosion ? (Math.random() * -3 - 1) : (Math.random() * -0.9 - 0.3);
      this.speedX = (Math.random() - 0.5) * 1.6;
      this.alpha = Math.random() * 0.4 + 0.15;
      this.color = `rgba(180, 140, 110, ${this.alpha})`;
    } else {
      this.size = Math.random() * 2.5 + 1.0;
      this.speedY = isExplosion ? (Math.random() * -6 - 2) : (Math.random() * -1.8 - 0.5);
      this.speedX = (Math.random() - 0.5) * (isExplosion ? 5 : 1.2);
      this.alpha = Math.random() * 0.75 + 0.25;
      this.hue = Math.random() * 38 + 14; // Gradiente de rojo puro a amarillo dorado
    }

    this.life = 0;
    this.maxLife = Math.random() * 120 + 80;
  }

  update() {
    this.x += this.speedX + Math.sin(this.life * 0.05) * 0.6;
    this.y += this.speedY;
    this.life++;

    if (this.life >= this.maxLife || this.y < -15) {
      this.reset();
    }
  }

  draw() {
    const fade = 1 - (this.life / this.maxLife);
    const currentAlpha = Math.max(0, this.alpha * fade);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

    if (this.isAsh) {
      ctx.fillStyle = `rgba(160, 120, 95, ${currentAlpha * 0.6})`;
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = `hsla(${this.hue}, 100%, 55%, ${currentAlpha})`;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, 0.9)`;
      ctx.shadowBlur = 8;
    }

    ctx.fill();
  }
}

for (let i = 0; i < totalParticles; i++) {
  const p = new EmberParticle();
  p.y = Math.random() * height;
  particles.push(p);
}

// Explosión interactiva de chispas al hacer clic en Desktop
window.addEventListener('click', (e) => {
  if (window.innerWidth < 768) return;
  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.modal-overlay')) return;
  
  for (let i = 0; i < 12; i++) {
    particles.push(new EmberParticle(e.clientX, e.clientY, true));
  }
  if (particles.length > 100) particles.splice(0, 12);
});

function renderEmbers() {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }
  requestAnimationFrame(renderEmbers);
}
renderEmbers();


/* --------------------------------------------------------------------------
   2. CALCULADORA INTERACTIVA DE SMASH BURGERS
   -------------------------------------------------------------------------- */
const burgerSpecs = {
  single: {
    temp: '240°C - 250°C',
    smash: '10 Segundos',
    maillard: '90 - 100 Seg',
    cloche: '12 - 15 Seg'
  },
  double: {
    temp: '230°C - 250°C',
    smash: '10 Segundos',
    maillard: '110 - 120 Seg',
    cloche: '15 - 20 Seg'
  },
  triple: {
    temp: '250°C (Máx)',
    smash: '8 - 10 Seg',
    maillard: '80 - 90 Seg',
    cloche: '20 - 25 Seg'
  }
};

function setCalcBurger(type, button) {
  // Actualizar botones
  document.querySelectorAll('.btn-calc-choice').forEach(btn => btn.classList.remove('active'));
  if (button) button.classList.add('active');

  const data = burgerSpecs[type] || burgerSpecs.double;
  
  const elTemp = document.getElementById('calc-temp');
  const elSmash = document.getElementById('calc-smash');
  const elMaillard = document.getElementById('calc-maillard');
  const elCloche = document.getElementById('calc-cloche');

  if (elTemp) elTemp.textContent = data.temp;
  if (elSmash) elSmash.textContent = data.smash;
  if (elMaillard) elMaillard.textContent = data.maillard;
  if (elCloche) elCloche.textContent = data.cloche;

  // Pequeña explosión de chispas en la calculadora
  const rect = button ? button.getBoundingClientRect() : null;
  if (rect) {
    for (let i = 0; i < 8; i++) {
      particles.push(new EmberParticle(rect.left + rect.width / 2, rect.top, true));
    }
  }
}


/* --------------------------------------------------------------------------
   3. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
   -------------------------------------------------------------------------- */
function toggleFaq(button) {
  const item = button.parentElement;
  const answer = item.querySelector('.faq-answer');
  const isActive = item.classList.contains('active');

  // Cerrar todos los demás
  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.remove('active');
    const a = el.querySelector('.faq-answer');
    if (a) a.style.maxHeight = null;
  });

  if (!isActive) {
    item.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}


/* --------------------------------------------------------------------------
   5. MODAL DEL CERTIFICADO (SOLO VISUALIZACIÓN, NO DESCARGABLE)
   -------------------------------------------------------------------------- */
function openCertModal() {
  const modal = document.getElementById('cert-modal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCertModal(event) {
  if (event && event.target !== event.currentTarget && !event.target.classList.contains('btn-close-modal')) {
    return;
  }
  const modal = document.getElementById('cert-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}


/* --------------------------------------------------------------------------
   6. MODAL DE TEXTOS LEGALES
   -------------------------------------------------------------------------- */
const legalTexts = {
  aviso: {
    title: 'AVISO LEGAL',
    content: `
      <p><strong>Titular del sitio web:</strong> SmashFire Brand Europe</p>
      <p><strong>Contacto oficial:</strong> info@smashfire.es</p>
      <p><strong>Finalidad de esta página:</strong> La URL smashfire.es/qr/ es un espacio exclusivo postcompra habilitado únicamente para los clientes que han adquirido el Kit SmashFire oficial a través de los canales autorizados. Su propósito es exclusivamente divulgativo, formativo y de atención al cliente.</p>
      <p><strong>Propiedad Intelectual:</strong> Todos los contenidos, imágenes, marcas y textos mostrados en este portal están protegidos por derechos de autor y propiedad industrial correspondientes a SmashFire.</p>
    `
  },
  privacidad: {
    title: 'POLÍTICA DE PRIVACIDAD',
    content: `
      <p>En SmashFire respetamos tu privacidad de forma estricta. Esta landing page postcompra:</p>
      <ul style="margin: 10px 0 10px 20px; line-height: 1.6;">
        <li>No recopila datos personales sin tu consentimiento.</li>
        <li>No contiene formularios de captación de datos invasivos en esta versión inicial.</li>
        <li>Cualquier comunicación iniciada a través de nuestro correo oficial (info@smashfire.es) será tratada confidencialmente exclusivamente para resolver tus dudas de uso, mantenimiento o recetas.</li>
      </ul>
      <p>No cedemos ni vendemos ningún tipo de información a terceros.</p>
    `
  },
  cookies: {
    title: 'POLÍTICA DE COOKIES',
    content: `
      <p>Esta landing page utiliza únicamente cookies técnicas indispensables para el correcto funcionamiento de la interfaz (como la preferencia de idioma seleccionada).</p>
      <p>No se emplean cookies de seguimiento publicitario invasivas de terceros ni cookies de perfilado comercial.</p>
    `
  }
};

function openLegalModal(type) {
  const modal = document.getElementById('legal-modal');
  const title = document.getElementById('legal-modal-title');
  const content = document.getElementById('legal-modal-content');

  const data = legalTexts[type] || legalTexts.aviso;
  if (title) title.textContent = data.title;
  if (content) content.innerHTML = data.content;

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeLegalModal(event) {
  if (event && event.target !== event.currentTarget && !event.target.classList.contains('btn-close-modal')) {
    return;
  }
  const modal = document.getElementById('legal-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Cerrar modales con tecla Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCertModal();
    closeLegalModal();
  }
});


/* --------------------------------------------------------------------------
   7. SELECTOR Y ARQUITECTURA MULTI-IDIOMA (ES / PT / EN)
   -------------------------------------------------------------------------- */
const langFlags = {
  es: '🇪🇸',
  pt: '🇵🇹',
  en: '🇬🇧'
};

function toggleLangMenu() {
  const menu = document.getElementById('lang-menu');
  if (menu) menu.classList.toggle('show');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.lang-dropdown')) {
    const menu = document.getElementById('lang-menu');
    if (menu) menu.classList.remove('show');
  }
});

function switchLanguage(lang) {
  const currentText = document.getElementById('current-lang-text');
  const currentFlag = document.getElementById('current-lang-flag');
  const menu = document.getElementById('lang-menu');

  if (currentText) currentText.textContent = lang.toUpperCase();
  if (currentFlag) currentFlag.textContent = langFlags[lang];
  if (menu) menu.classList.remove('show');

  document.querySelectorAll('.lang-menu button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.lang-menu button')).find(b => b.textContent.toLowerCase().includes(lang === 'es' ? 'español' : lang === 'pt' ? 'português' : 'english'));
  if (activeBtn) activeBtn.classList.add('active');

  if (lang === 'pt') {
    alert('🇵🇹 Versão em Português em preparação. A página completa estará disponível em breve!');
  } else if (lang === 'en') {
    alert('🇬🇧 English version in preparation. The full translated guide will be available shortly!');
  }
}


/* --------------------------------------------------------------------------
   8. SCROLLSPY FLUIDO (SIN INTERFERENCIA DE SCROLL VERTICAL)
   -------------------------------------------------------------------------- */
const navLinks = document.querySelectorAll('.quick-nav-item');
const quickNavContainer = document.querySelector('.quick-nav-bar');
const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

let isManualScroll = false;

window.addEventListener('scroll', () => {
  if (isManualScroll) return;

  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  let currentId = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 160;
    const sectionHeight = section.offsetHeight;
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      currentId = '#' + section.getAttribute('id');
    }
  });

  if (currentId) {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentId) {
        if (!link.classList.contains('active')) {
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');

          if (quickNavContainer) {
            const containerWidth = quickNavContainer.offsetWidth;
            const linkLeft = link.offsetLeft;
            const linkWidth = link.offsetWidth;
            quickNavContainer.scrollTo({
              left: linkLeft - (containerWidth / 2) + (linkWidth / 2),
              behavior: 'smooth'
            });
          }
        }
      }
    });
  }
}, { passive: true });

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    isManualScroll = true;
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    setTimeout(() => {
      isManualScroll = false;
    }, 700);
  });
});