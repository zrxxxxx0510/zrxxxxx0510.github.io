(() => {
  const clips = [
    ['lip-oil-educational', 'Lip Oil', 'Educational'],
    ['serum-stick-talking-head', 'Serum Stick', 'Talking Head'],
    ['face-cream-story', 'Face Cream', 'Storytelling'],
    ['lip-oil-product', 'Lip Oil', 'Product Showcase'],
    ['serum-stick-interview', 'Serum Stick', 'Interview'],
    ['face-cream-product', 'Face Cream', 'Product Showcase'],
    ['lip-oil-story', 'Lip Oil', 'Storytelling'],
    ['serum-stick-educational', 'Serum Stick', 'Educational'],
    ['face-cream-interview', 'Face Cream', 'Interview'],
    ['lip-oil-talking-head', 'Lip Oil', 'Talking Head']
  ];
  const rail = document.querySelector('.video-rail');
  const toggle = document.querySelector('.scroll-toggle');
  const viewer = document.querySelector('.video-viewer');
  const viewerVideo = viewer.querySelector('video');
  const viewerError = viewer.querySelector('.viewer-error');
  let paused = false;
  let dragging = false;
  let resumeAt = 0;
  let lastTime = 0;
  let fractionalStep = 0;
  let pointerStart = 0;
  let scrollStart = 0;
  let pointerHeld = false;
  let suppressClickUntil = 0;
  let playbackRequest = 0;
  const visible = new Set();

  const openVideo = (id, title) => {
    if (performance.now() < suppressClickUntil) return;
    const request = ++playbackRequest;
    viewer.querySelector('h2').textContent = title;
    viewerError.hidden = true;
    viewerVideo.src = `../assets/adstudio-clips/${id}-with-audio.mp4`;
    viewerVideo.poster = `../assets/adstudio-clips/${id}.jpg`;
    viewerVideo.currentTime = 0;
    viewerVideo.muted = false;
    viewerVideo.volume = 1;
    viewer.showModal();
    document.body.classList.add('viewer-open');
    playVisible();
    viewerVideo.play().catch(() => {
      if (request !== playbackRequest || !viewer.open) return;
      viewerError.textContent = 'Playback could not start. Please use the play control to retry.';
      viewerError.hidden = false;
    });
  };
  viewer.querySelector('.viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    const bounds = viewer.getBoundingClientRect();
    if (event.target === viewer && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) viewer.close();
  });
  viewer.addEventListener('close', () => {
    playbackRequest++;
    viewerVideo.pause();
    viewerVideo.removeAttribute('src');
    viewerVideo.load();
    document.body.classList.remove('viewer-open');
    resumeAt = 0;
    playVisible();
  });

  // A second copy keeps the native scroll surface continuous at the loop boundary.
  for (let copy = 0; copy < 2; copy++) {
    for (const [id, product, format] of clips) {
      const item = document.createElement('figure');
      item.className = 'video-item';
      if (copy) item.setAttribute('aria-hidden', 'true');
      const video = document.createElement('video');
      video.src = `../assets/adstudio-clips/${id}.mp4?muted=2`;
      video.poster = `../assets/adstudio-clips/${id}.jpg`;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.setAttribute('muted', '');
      video.setAttribute('aria-label', `${product}: ${format}`);
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'video-open';
      open.setAttribute('aria-label', `Play ${product} - ${format}`);
      open.title = `Play ${product} - ${format}`;
      if (copy) open.tabIndex = -1;
      open.append(video);
      open.addEventListener('click', () => openVideo(id, `${product} - ${format}`));
      const caption = document.createElement('figcaption');
      const name = document.createElement('strong');
      name.textContent = product;
      caption.append(name, format);
      item.append(open, caption);
      rail.append(item);
    }
  }

  document.querySelectorAll('.feature-media, .comparison-media').forEach(button => {
    button.addEventListener('click', () => openVideo(button.dataset.clip, button.dataset.title));
  });
  const previews = document.querySelectorAll('.video-rail video, .feature-video, .comparison-video, .product-input-demo, .retrieval-demo, .strategy-demo, .revision-demo, .segment-demo, .version-demo, .final-demo');
  const playVisible = () => {
    for (const video of previews) {
      video.autoplay = visible.has(video) && !video.closest('[hidden]') && !document.hidden && !viewer.open;
      if (video.autoplay) {
        if (!video.controls) video.muted = true;
        video.play().catch(() => {});
      } else video.pause();
    }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    playVisible();
  }, { threshold: 0.01 });
  previews.forEach(video => observer.observe(video));
  document.addEventListener('visibilitychange', playVisible);
  const updateToggle = () => {
    const label = paused ? 'Resume scrolling' : 'Pause scrolling';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.innerHTML = `<i data-lucide="${paused ? 'play' : 'pause'}"></i>`;
    window.lucide.createIcons();
  };
  toggle.addEventListener('click', () => { paused = !paused; updateToggle(); });
  const loopWidth = () => rail.children[10].offsetLeft - rail.children[0].offsetLeft;
  const move = delta => {
    const width = loopWidth();
    rail.scrollLeft = (rail.scrollLeft + delta + width) % width;
    fractionalStep = 0;
    resumeAt = performance.now() + 2500;
  };
  document.querySelectorAll('[data-direction]').forEach(button => {
    button.addEventListener('click', () => move(Number(button.dataset.direction) * (rail.children[1].offsetLeft - rail.children[0].offsetLeft)));
  });
  rail.addEventListener('wheel', () => { resumeAt = performance.now() + 2500; }, { passive: true });
  rail.addEventListener('pointerdown', event => {
    resumeAt = performance.now() + 2500;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    pointerHeld = true;
    pointerStart = event.clientX;
    scrollStart = rail.scrollLeft;
  });
  rail.addEventListener('pointermove', event => {
    if (pointerHeld && !dragging && Math.abs(event.clientX - pointerStart) > 6) {
      dragging = true;
      rail.setPointerCapture(event.pointerId);
      rail.classList.add('dragging');
    }
    if (dragging) rail.scrollLeft = scrollStart + pointerStart - event.clientX;
  });
  const endDrag = () => {
    if (dragging) suppressClickUntil = performance.now() + 300;
    pointerHeld = false;
    dragging = false;
    rail.classList.remove('dragging');
    resumeAt = performance.now() + 2500;
  };
  window.addEventListener('pointerup', endDrag);
  rail.addEventListener('pointercancel', endDrag);
  rail.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 236 : -236);
    }
  });
  const animate = time => {
    const elapsed = Math.min(time - lastTime, 50);
    lastTime = time;
    if (!paused && !dragging && !viewer.open && !document.hidden && time > resumeAt) {
      // Accumulate subpixels so slow scrolling stays consistent across frame rates.
      fractionalStep += elapsed * 0.018;
      const step = Math.floor(fractionalStep);
      if (step > 0) {
        rail.scrollLeft = (rail.scrollLeft + step) % loopWidth();
        fractionalStep -= step;
      }
    }
    requestAnimationFrame(animate);
  };
  updateToggle();
  requestAnimationFrame(animate);
})();
