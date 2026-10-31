

// Hellokin Reels module

export function createReelCard(reel) {
  const card = document.createElement("div");
  card.className = "hellokin-reel";

  const video = document.createElement("video");
  video.src = reel.videoUrl || "";
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";

  const caption = document.createElement("p");
  caption.textContent = reel.caption || "";

  card.appendChild(video);
  card.appendChild(caption);

  return card;
}

export function renderReels(container, reels = []) {
  container.replaceChildren();

  reels.forEach((reel) => {
    container.appendChild(createReelCard(reel));
  });
}
