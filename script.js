/* ==========================================================================
   SMASHFIRE — JAVASCRIPT DE MARCA (BRASAS, CENIZAS, CLASSIC SMASH & SCROLLSPY)
   - Sistema de Brasas Ardientes y Cenizas Flotantes en Canvas
   - Selector Dinámico Single / Doble para "La Classic Smash"
   - Acordeón Interactivo de Consejos Pro (12 Consejos)
   - Acordeón Interactivo de Preguntas Frecuentes (FAQ)
   - Modales Legales (Aviso Legal, Privacidad, Cookies)
   - Selector de Idioma (ES / PT / EN)
   - Scrollspy sin saltos (100% fluido en móvil y desktop)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CANVAS DE BRASAS ARDIENTES Y CENIZAS FLOTANTES
   -------------------------------------------------------------------------- */
const canvas = document.getElementById('embers-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  // Solo reasignar si cambia el ancho (rotación) o cambio vertical significativo (evita parpadeo por la barra móvil)
  if (newWidth !== width || Math.abs(newHeight - height) > 100) {
    width = canvas.width = newWidth;
    height = canvas.height = newHeight;
  }
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
}


/* --------------------------------------------------------------------------
   2. SELECTOR DINÁMICO SINGLE / DOBLE (LA CLASSIC SMASH)
   -------------------------------------------------------------------------- */
function setClassicBurgerMode(mode, button) {
  document.querySelectorAll('.burger-mode-toggle .btn-mode').forEach(b => b.classList.remove('active'));
  if (button) button.classList.add('active');

  const meatDesc = document.getElementById('ing-meat-desc');
  const cheeseDesc = document.getElementById('ing-cheese-desc');

  if (mode === 'double') {
    if (meatDesc) meatDesc.textContent = '2 bolas de carne picada de vacuno de 80–90 g cada una (80 % carne / 20 % grasa)';
    if (cheeseDesc) cheeseDesc.textContent = '2 lonchas de queso americano (1 sobre cada smash)';
  } else {
    if (meatDesc) meatDesc.textContent = '1 bola de carne picada de vacuno de 80–90 g (80 % carne / 20 % grasa)';
    if (cheeseDesc) cheeseDesc.textContent = '1 loncha de queso americano';
  }

  // Pequeña chispa decorativa
  if (button) {
    const rect = button.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      particles.push(new EmberParticle(rect.left + rect.width / 2, rect.top, true));
    }
  }
}


/* --------------------------------------------------------------------------
   3. ACORDEÓN DE CONSEJOS PRO SMASHFIRE (12 CONSEJOS)
   -------------------------------------------------------------------------- */
function toggleTip(button) {
  const item = button.closest('.tip-accordion-item');
  if (!item) return;
  const answer = item.querySelector('.tip-accordion-answer');
  const isActive = item.classList.contains('active');

  // Si no está activo, cerramos los demás y abrimos este
  if (!isActive) {
    document.querySelectorAll('.tip-accordion-item').forEach(el => {
      el.classList.remove('active');
      const a = el.querySelector('.tip-accordion-answer');
      if (a) a.style.maxHeight = null;
    });
    item.classList.add('active');
    if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
  } else {
    item.classList.remove('active');
    if (answer) answer.style.maxHeight = null;
  }
}


/* --------------------------------------------------------------------------
   4. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
   -------------------------------------------------------------------------- */
function toggleFaq(button) {
  const item = button.closest('.faq-item');
  if (!item) return;
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
    if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}


/* --------------------------------------------------------------------------
   5. MODAL DE TEXTOS LEGALES (AVISO LEGAL, PRIVACIDAD, COOKIES)
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
    closeLegalModal();
  }
});


/* --------------------------------------------------------------------------
   6. SELECTOR Y ARQUITECTURA MULTI-IDIOMA (ES / PT / EN)
   -------------------------------------------------------------------------- */
const langFlags = {
  es: 'ES',
  pt: 'PT',
  en: 'EN'
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
    alert('Versão em Português em preparação. A página completa estará disponível em breve!');
  } else if (lang === 'en') {
    alert('English version in preparation. The full translated guide will be available shortly!');
  }
}


/* --------------------------------------------------------------------------
   7. SCROLLSPY FLUIDO (SIN INTERFERENCIA DE SCROLL VERTICAL)
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
    const sectionTop = section.offsetTop - 140;
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


/* --------------------------------------------------------------------------
   8. MENÚ MÓVIL PRINCIPAL (SITIO WEB MULTIPÁGINA)
   -------------------------------------------------------------------------- */
const mobileToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('main-nav');
if (mobileToggle && mainNav) {
  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    mainNav.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
      mainNav.classList.remove('open');
    }
  });

  mainNav.querySelectorAll('.main-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
    });
  });
}


/* --------------------------------------------------------------------------
   9. DETECCIÓN DE RETORNO A QR (?from=qr O REFERRER)
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isFromQr = urlParams.get('from') === 'qr' || (document.referrer && document.referrer.includes('/qr'));
  const qrBanner = document.getElementById('qr-return-banner');
  if (isFromQr && qrBanner) {
    qrBanner.classList.remove('hidden');
    qrBanner.style.display = 'block';
  }
});


/* --------------------------------------------------------------------------
   10. GALERÍA INTERACTIVA DE TIENDA (PRODUCT THUMBNAILS)
   -------------------------------------------------------------------------- */
function changeProductImage(thumb, newSrc, altText) {
  const mainImg = document.getElementById('main-product-img');
  if (mainImg) {
    mainImg.style.opacity = '0.4';
    setTimeout(() => {
      mainImg.src = newSrc;
      if (altText) mainImg.alt = altText;
      mainImg.style.opacity = '1';
    }, 150);
  }
  document.querySelectorAll('.product-thumb-btn').forEach(btn => btn.classList.remove('active'));
  if (thumb) thumb.classList.add('active');
}

function updateQuantity(change) {
  const input = document.getElementById('product-qty-input');
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(10, val + change));
  input.value = val;
}


/* --------------------------------------------------------------------------
   11. VISOR PROTEGIDO DE CERTIFICADOS (SOLO VISUALIZACIÓN, NO DESCARGA)
   -------------------------------------------------------------------------- */
function openCertViewer(certId) {
  const viewerModal = document.getElementById('cert-viewer-modal');
  const viewerTitle = document.getElementById('cert-viewer-title');
  const certSheets = document.querySelectorAll('.cert-sheet');
  
  certSheets.forEach(sheet => sheet.classList.remove('active'));
  const targetSheet = document.getElementById('sheet-' + certId);
  if (targetSheet) targetSheet.classList.add('active');

  const titles = {
    'aisi304': 'CERTIFICADO DE COMPOSICIÓN QUÍMICA Y METALÚRGICA AISI 304',
    'alimentario': 'DECLARACIÓN DE CONFORMIDAD REGLAMENTO CE 1935/2004 (CONTACTO ALIMENTARIO)',
    'corrosion': 'INFORME TÉCNICO DE RESISTENCIA A LA CORROSIÓN Y TEMPERATURA'
  };
  if (viewerTitle) viewerTitle.textContent = titles[certId] || 'CERTIFICADO TÉCNICO OFICIAL';

  if (viewerModal) {
    viewerModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCertViewer(event) {
  if (event && event.target !== event.currentTarget && !event.target.classList.contains('btn-close-modal') && !event.target.closest('.btn-close-modal')) {
    return;
  }
  const viewerModal = document.getElementById('cert-viewer-modal');
  if (viewerModal) {
    viewerModal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Bloqueo de descarga y click derecho en visor de certificados
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.cert-protected-container')) {
    e.preventDefault();
  }
});


/* --------------------------------------------------------------------------
   12. FILTRADO DE RECETAS EN BIBLIOTECA
   -------------------------------------------------------------------------- */
function filterRecipes(category, btn) {
  document.querySelectorAll('.recipe-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('.recipe-card');
  cards.forEach(card => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.style.display = 'flex';
      card.classList.add('fade-in');
    } else {
      card.style.display = 'none';
      card.classList.remove('fade-in');
    }
  });
}


/* --------------------------------------------------------------------------
   13. COPIAR CORREO AL PORTAPAPELES
   -------------------------------------------------------------------------- */
function copyContactEmail() {
  const email = 'info@smashfire.es';
  navigator.clipboard.writeText(email).then(() => {
    const tooltip = document.getElementById('copy-feedback');
    if (tooltip) {
      tooltip.textContent = '¡Copiado al portapapeles!';
      tooltip.classList.add('visible');
      setTimeout(() => {
        tooltip.textContent = 'Copiar correo oficial';
        tooltip.classList.remove('visible');
      }, 2500);
    }
  }).catch(() => {
    window.location.href = 'mailto:' + email;
  });
}


/* --------------------------------------------------------------------------
   14. PESTAÑAS INTERACTIVAS DE PRODUCTO (TABS)
   -------------------------------------------------------------------------- */
function switchProductTab(tabId, btn) {
  document.querySelectorAll('.product-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.product-tab-content-panel').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
}

/* --------------------------------------------------------------------------
   15. ACORDEÓN DE PREGUNTAS FRECUENTES (HOME & TIENDA)
   -------------------------------------------------------------------------- */
function toggleHomeFaq(button) {
  const item = button.closest('.faq-card-item');
  if (!item) return;
  const body = item.querySelector('.faq-card-body');
  const isActive = item.classList.contains('active');

  document.querySelectorAll('.faq-card-item').forEach(el => {
    el.classList.remove('active');
    const b = el.querySelector('.faq-card-body');
    if (b) b.style.maxHeight = null;
  });

  if (!isActive) {
    item.classList.add('active');
    if (body) body.style.maxHeight = body.scrollHeight + 'px';
  }
}


/* --------------------------------------------------------------------------
   16. ROTADOR DE MENSAJES EN LA BARRA DE AVISO SUPERIOR (MÓVIL)
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const rotator = document.getElementById('notice-bar-rotator');
  if (!rotator) return;
  const messages = rotator.querySelectorAll('.notice-msg');
  if (messages.length <= 1) return;

  let currentIndex = 0;
  setInterval(() => {
    messages[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % messages.length;
    messages[currentIndex].classList.add('active');
  }, 3200);
});
