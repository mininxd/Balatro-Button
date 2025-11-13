import "./bg.js";
import "./sprites.js";
import "./style.css";

import Balatro from "../dist/index.js";
import "../dist/style.css"

function randomHexColor() {
  const hex = () => Math.floor(Math.random() * 256)
                      .toString(16)
                      .padStart(2, "0");
  return `#${hex()}${hex()}${hex()}`;
}

const balatroBtn = new Balatro ({
  selector: '.balatroBtn',
  power: () =>  10000,
  duration: 0,
  colorStart : randomHexColor(),
    colorMid : randomHexColor(),
    colorEnd : randomHexColor(),
})


let i = 0
const balatroBtnInterval = setInterval(() => {
  i += 250
  balatroBtn.setPower(i)
  if (i === 5000) clearInterval(balatroBtnInterval)
}, 50)




document.querySelectorAll('.copy').forEach(el => {
  el.addEventListener('click', () => {
    const text = el.textContent.trim()
    navigator.clipboard.writeText(text)
  })
})


if(!navigator.userAgent.includes("Mobile")){
  body.classList.add("px-32")
  balatroLogo.classList.add("px-12")
}