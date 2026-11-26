/* JANO — JOHN MERWIN ALVA PORTFOLIO */
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    });
  });
}

// Each of the four portfolio categories has its own carousel.
const categoryCards = [...document.querySelectorAll('.category-card')];
const carousels = new Map();

categoryCards.forEach(card => {
  const images = JSON.parse(card.dataset.images || '[]');
  const image = card.querySelector('.carousel-image-button img');
  const imageButton = card.querySelector('.carousel-image-button');
  const dots = card.querySelector('.carousel-dots');
  const count = card.querySelector('.slide-count');
  let index = 0;

  const render = () => {
    if (!images.length) return;
    image.src = images[index];
    image.alt = `${card.dataset.title} design ${index + 1}`;
    imageButton.setAttribute('aria-label', `Open ${card.dataset.title} image ${index + 1} in large view`);
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;

    [...dots.children].forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  };

  images.forEach((_, dotIndex) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Show ${card.dataset.title} image ${dotIndex + 1}`);
    dot.addEventListener('click', () => {
      index = dotIndex;
      render();
    });
    dots.appendChild(dot);
  });

  const move = direction => {
    index = (index + direction + images.length) % images.length;
    render();
  };

  card.querySelector('.carousel-prev')?.addEventListener('click', () => move(-1));
  card.querySelector('.carousel-next')?.addEventListener('click', () => move(1));
  imageButton?.addEventListener('click', () => openLightbox(card, index));

  carousels.set(card, {
    images,
    getIndex: () => index,
    setIndex: value => {
      index = (value + images.length) % images.length;
      render();
    },
    move
  });

  render();
});

// Large image viewer: click an image, then browse the same category.
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxTitle = lightbox?.querySelector('.lightbox-title');
const lightboxCounter = lightbox?.querySelector('.lightbox-counter');
let activeCarousel = null;
let activeCard = null;

function renderLightbox() {
  if (!activeCarousel || !lightboxImage) return;
  const index = activeCarousel.getIndex();
  const images = activeCarousel.images;

  lightboxImage.src = images[index];
  lightboxImage.alt = `${activeCard?.dataset.title || 'Portfolio'} design ${index + 1}`;
  if (lightboxTitle) lightboxTitle.textContent = activeCard?.dataset.title || 'Portfolio project';
  if (lightboxCounter) {
    lightboxCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
  }
}

function openLightbox(card, index) {
  if (!lightbox || !lightboxImage) return;
  activeCard = card;
  activeCarousel = carousels.get(card);
  activeCarousel?.setIndex(index);
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close')?.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  if (lightboxImage) lightboxImage.src = '';
  document.body.style.overflow = '';
  activeCarousel = null;
  activeCard = null;
}

function moveLightbox(direction) {
  if (!activeCarousel) return;
  activeCarousel.move(direction);
  renderLightbox();
}

lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => moveLightbox(-1));
lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => moveLightbox(1));
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', event => {
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});

// Swipe left/right in the full-size viewer on phones and tablets.
let touchStartX = 0;
lightbox?.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

lightbox?.addEventListener('touchend', event => {
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 45) return;
  moveLightbox(delta > 0 ? -1 : 1);
}, { passive: true });

// Current year in the footer.
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Highlight the current navigation section as the page scrolls.
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => observer.observe(section));
}
