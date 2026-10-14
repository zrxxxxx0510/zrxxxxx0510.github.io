(() => {
  const contents = document.querySelector('.page-contents');
  const nav = contents.querySelector('.toc-nav');
  const openButton = document.querySelector('.toc-open-button');
  const closeButton = document.querySelector('.toc-close-button');
  const backdrop = document.querySelector('.toc-backdrop');
  const page = [...document.querySelectorAll('body > .top, body > main')];
  const desktop = matchMedia('(min-width:1280px)');
  const list = document.createElement('ul');
  const addLink = (parent, target, label, className = '') => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${target.id}`;
    link.textContent = label;
    link.className = className;
    item.append(link);
    parent.append(item);
    target.classList.add('toc-target');
    target.tabIndex = -1;
    return item;
  };
  addLink(list, document.querySelector('#paper-overview'), 'Overview');
  ['overview', 'why-adstudio', 'key-features', 'evaluation'].forEach(id => {
    const section = document.getElementById(id);
    const heading = section.querySelector('h2');
    const group = addLink(list, heading, heading.textContent, 'toc-part');
    group.className = 'toc-group';
    const children = document.createElement('ul');
    section.querySelectorAll('h3[id]').forEach(subheading => addLink(children, subheading, subheading.textContent));
    group.append(children);
  });
  nav.append(list);
  const links = [...nav.querySelectorAll('a')];
  const targets = links.map(link => document.getElementById(link.hash.slice(1)));
  let isOpen = false;
  let desktopOpen = true;
  let frame = 0;
  let activeIndex = -1;
  const revealActive = () => {
    const active = nav.querySelector('[aria-current="location"]');
    if (!isOpen || !active) return;
    const bounds = nav.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.top < bounds.top) nav.scrollTop -= bounds.top - item.top + 12;
    else if (item.bottom > bounds.bottom) nav.scrollTop += item.bottom - bounds.bottom + 12;
  };
  const setOpen = (open, focus = false) => {
    isOpen = open;
    const modal = open && !desktop.matches;
    contents.hidden = !open;
    openButton.hidden = open;
    openButton.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !modal;
    page.forEach(element => { element.inert = modal; });
    document.body.classList.toggle('toc-expanded', open && desktop.matches);
    document.body.classList.toggle('toc-modal', modal);
    if (modal) {
      contents.setAttribute('role', 'dialog');
      contents.setAttribute('aria-modal', 'true');
    } else {
      contents.removeAttribute('role');
      contents.removeAttribute('aria-modal');
    }
    if (desktop.matches) desktopOpen = open;
    if (focus) (open ? closeButton : openButton).focus({ preventScroll: true });
    if (open) requestAnimationFrame(revealActive);
  };
  const update = () => {
    frame = 0;
    let index = 0;
    targets.forEach((target, i) => {
      if (target.getBoundingClientRect().top <= (desktop.matches ? 56 : 100)) index = i;
    });
    if (scrollY > 0 && innerHeight + scrollY >= document.documentElement.scrollHeight - 2) index = targets.length - 1;
    if (index === activeIndex) return;
    activeIndex = index;
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    nav.querySelectorAll('.toc-group').forEach(group => group.classList.remove('is-current'));
    links[index].closest('.toc-group')?.classList.add('is-current');
    revealActive();
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  document.body.classList.add('toc-ready');
  setOpen(desktop.matches);
  openButton.addEventListener('click', () => setOpen(true, true));
  closeButton.addEventListener('click', () => setOpen(false, true));
  backdrop.addEventListener('click', () => setOpen(false, true));
  desktop.addEventListener('change', () => { setOpen(desktop.matches && desktopOpen); schedule(); });
  contents.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!desktop.matches) setOpen(false);
    document.getElementById(link.hash.slice(1)).focus({ preventScroll: true });
  }));
  document.addEventListener('keydown', event => {
    if (!isOpen || document.querySelector('.video-viewer')?.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
    } else if (event.key === 'Tab' && !desktop.matches) {
      const focusable = [...contents.querySelectorAll('a, button')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  update();
})();
