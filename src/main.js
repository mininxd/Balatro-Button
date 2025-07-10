import "./bg.js";
import "./sprites.js";
import "./style.css";

import Balatro from "balatrobutton";
// import "/node_modules/balatrobutton/dist/style.css"
const balatroBtn = new Balatro ({
  selector: '.balatroBtn',
  power: () =>  0,
  colorStart : "#eceeee",
    colorMid : "#fcd6a9",
    colorEnd : "#c10cf7",
})


let i = 0
const balatroBtnInterval = setInterval(() => {
  i += 250
  balatroBtn.setPower(i)
  if (i === 10000) clearInterval(balatroBtnInterval)
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