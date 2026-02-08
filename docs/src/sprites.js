import "./sprites.css";

function getSprite(x, y, scale = 0.25) {
  const spriteW = 142;
  const spriteH = 190;
  return {
    position: `${-x * spriteW * scale}px ${-y * spriteH * scale}px`,
    size: `${1420 * scale}px ${3040 * scale}px`,
    width: `${spriteW * scale}px`,
    height: `${spriteH * scale}px`
  };
}

document.querySelectorAll('.joker-sprite').forEach(el => {
  const x = el.dataset.x !== undefined ? +el.dataset.x : Math.floor(Math.random() * 10);
  const y = el.dataset.y !== undefined ? +el.dataset.y : Math.floor(Math.random() * 16);
  const s = getSprite(x, y);

  el.style.backgroundPosition = s.position;
  el.style.backgroundSize = s.size;
  el.style.width = s.width;
  el.style.height = s.height;
});
