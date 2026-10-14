(() => {
  const projects = [
    ["AdStudio: A Strategy-Guided System for Controllable Human-AI Co-Creation of Short Video Ads", "projects/adstudio.html"],
    ["Is more human-like better? The impact of virtual streamer language naturalness on user engagement", "projects/virtual-streamer.html"]
  ];

  const candidates = [...document.querySelectorAll("a, h1, h2, h3, h4, p")];
  projects.forEach(([title, href]) => {
    const target = candidates.find(
      (element) => element.textContent.replace(/\s+/g, " ").trim() === title
    );
    if (!target) return;

    if (target.tagName === "A") {
      target.href = href;
      target.removeAttribute("target");
      target.removeAttribute("rel");
      return;
    }

    const link = document.createElement("a");
    link.href = href;
    link.textContent = title;
    link.style.color = "#174f9d";
    link.style.textDecoration = "underline";
    target.replaceChildren(link);
  });
})();
