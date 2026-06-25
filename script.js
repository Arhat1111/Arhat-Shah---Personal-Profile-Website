(() => {
  const doc = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const progressThrough = (element) => {
    const rect = element.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    return travel <= 0 ? 0 : clamp(-rect.top / travel);
  };

  const hero = document.querySelector('.hero');
  const projects = document.querySelector('.projects');
  const track = document.querySelector('.project-track');
  const manifesto = document.querySelector('.manifesto');
  const contact = document.querySelector('.contact');
  const projectCurrent = document.querySelector('#project-current');
  const projectTotalElement = document.querySelector('#project-total');
  const projectCards = [...document.querySelectorAll('.project-card')];
  const projectTotal = projectCards.length;
  const progressBar = document.querySelector('.page-progress span');
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];

  let ticking = false;

  function setProjectSceneHeight() {
    if (!projects) return;
    projects.style.height = window.innerWidth > 760
      ? `${Math.max(470, 120 + projectTotal * 100)}vh`
      : '';
  }

  if (projectTotalElement) {
    projectTotalElement.textContent = String(projectTotal).padStart(2, '0');
  }
  setProjectSceneHeight();

  function updateScrollScene() {
    const scrollY = window.scrollY;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const pageProgress = scrollY / maxScroll;

    doc.style.setProperty('--scroll', pageProgress.toFixed(4));
    progressBar.style.transform = `scaleX(${pageProgress})`;

    if (hero) {
      const p = progressThrough(hero);
      hero.style.setProperty('--hero-p', p.toFixed(4));
    }

    if (projects && track && window.innerWidth > 760) {
      const p = progressThrough(projects);
      const startPad = window.innerWidth * 0.09;
      const maxX = Math.max(track.scrollWidth - window.innerWidth + startPad, 0);
      track.style.transform = `translate3d(${-p * maxX}px, 0, 0)`;
      const current = Math.min(projectTotal, Math.floor(p * projectTotal) + 1);
      if (projectCurrent) projectCurrent.textContent = String(current).padStart(2, '0');
    }

    if (manifesto) manifesto.style.setProperty('--manifesto-p', progressThrough(manifesto).toFixed(4));
    if (contact) {
      const rect = contact.getBoundingClientRect();
      const p = clamp(1 - rect.top / window.innerHeight);
      contact.style.setProperty('--contact-p', p.toFixed(4));
    }

    if (!reducedMotion) {
      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < -150 || rect.top > window.innerHeight + 150) return;
        const speed = Number(item.dataset.parallax || 0);
        const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        item.style.transform = `translate3d(0, ${centerOffset * speed}px, 0)`;
      });
    }

    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateScrollScene);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', () => {
    setProjectSceneHeight();
    requestScrollUpdate();
  });
  updateScrollScene();

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal, .split-reveal').forEach((element, index) => {
    element.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
    revealObserver.observe(element);
  });

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    body.classList.toggle('menu-open', open);
  };

  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  const copyButton = document.querySelector('.copy-email');
  copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    const label = copyButton.querySelector('small');
    try {
      await navigator.clipboard.writeText(email);
      label.textContent = 'Copied';
    } catch {
      const temporary = document.createElement('textarea');
      temporary.value = email;
      temporary.style.position = 'fixed';
      temporary.style.opacity = '0';
      body.appendChild(temporary);
      temporary.select();
      document.execCommand('copy');
      temporary.remove();
      label.textContent = 'Copied';
    }
    window.setTimeout(() => { label.textContent = 'Copy email'; }, 1800);
  });

  document.querySelector('#year').textContent = new Date().getFullYear();

  if (finePointer && !reducedMotion) {
    const dot = document.querySelector('.cursor--dot');
    const ring = document.querySelector('.cursor--ring');
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    window.addEventListener('pointermove', (event) => {
      mx = event.clientX;
      my = event.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      doc.style.setProperty('--mouse-x', `${(mx / window.innerWidth) * 100}%`);
      doc.style.setProperty('--mouse-y', `${(my / window.innerHeight) * 100}%`);
    }, { passive: true });

    const animateCursor = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll('a, button, .project-card').forEach((element) => {
      element.addEventListener('pointerenter', () => ring.classList.add('is-active'));
      element.addEventListener('pointerleave', () => ring.classList.remove('is-active'));
    });

    document.querySelectorAll('.magnetic').forEach((element) => {
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    });

    document.querySelectorAll('.project-preview').forEach((preview) => {
      preview.addEventListener('pointermove', (event) => {
        const rect = preview.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        preview.style.transform = `perspective(1100px) rotateX(${-y * 2.3}deg) rotateY(${x * 3}deg) scale(.99)`;
      });
      preview.addEventListener('pointerleave', () => { preview.style.transform = ''; });
    });
  }
})();
