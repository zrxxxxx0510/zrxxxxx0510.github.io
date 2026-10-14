document.addEventListener('DOMContentLoaded', () => {
  const destinations = [
    'projects/adstudio.html',
    'projects/tfsc.html',
    null
  ];

  const publicationSection = document.getElementById('publications');
  if (!publicationSection) return;

  const cards = publicationSection.querySelectorAll('.paper-box');

  cards.forEach((card, index) => {
    const destination = destinations[index];
    if (!destination) return;

    // Remove the previous journal/news link while preserving the title text.
    const title = card.querySelector('.paper-text h3');
    if (title) {
      const oldLink = title.querySelector('a');
      if (oldLink) title.textContent = oldLink.textContent.trim();
    }

    card.classList.add('clickable-publication');
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Open research details: ${title ? title.textContent.trim() : 'publication'}`);

    const openDetails = () => {
      window.location.href = destination;
    };

    card.addEventListener('click', openDetails);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetails();
      }
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    .clickable-publication {
      cursor: pointer;
      border-radius: 10px;
      transition: background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
    }
    .clickable-publication:hover,
    .clickable-publication:focus-visible {
      background: #f8fbff;
      box-shadow: 0 6px 20px rgba(26, 71, 128, 0.09);
      transform: translateY(-2px);
      outline: none;
    }
    .clickable-publication .paper-text h3 {
      color: inherit;
      text-decoration: none;
    }
  `;
  document.head.appendChild(style);
});
