import "./sprites.css";

function getSprite(x, y, scale = 0.25) {
  const spriteW = 142;
  const spriteH = 190;
  return {
    position: `${-x * spriteW}px ${-y * spriteH}px`,
    size: `${1420 * scale}px ${3040 * scale}px`,
    width: `${spriteW * scale}px`,
    height: `${spriteH * scale}px`
  };
}

function getRandomOrder(length) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const randomized = getRandomOrder(3);

document.querySelectorAll('.joker-sprite').forEach(el => {
  const x = +el.dataset.x || randomized[0];
  const y = +el.dataset.y || randomized[0];
  const s = getSprite(x, y);

  el.style.backgroundPosition = s.position;
  el.style.backgroundSize = s.size;
  el.style.width = s.width;
  el.style.height = s.height;
});
