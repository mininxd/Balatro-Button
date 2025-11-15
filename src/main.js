import "./bg.js";
import "./sprites.js";
import "./style.css";
import code from "./code.js";
import Balatro from "balatrobutton";
function hex() {
  const hex = () => Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0");
  return `#${hex()}${hex()}${hex()}`;
}
const hex1 = hex();
const hex2 = hex();
const hex3 = hex();

const balatroBtn = new Balatro({
  selector: '.balatroBtn',
  power: () =>  0,
  colorStart : hex1,
    colorMid : hex2,
    colorEnd : hex3,
  gpu: false
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

document.querySelectorAll("code").forEach(codeEl => {
  codeEl.classList.add("whitespace-pre-wrap");
});


quickStartCode.innerHTML = code(`import Balatro from "balatrobutton";
const element = new Balatro({options});

// Available Options
{
  // your element classes
  selector: '.className',
  // flame duration
  duration: 0, // 0 = infinite
  // flame power
  power: () => 500,
  // GPU render 
  gpu: false, 
  // Low power
  colorStart: "#f00",
  // Medium power
  colorMid: "#f50",
  // High power
  colorEnd: "#ff0"
};`);

moreCode.innerHTML = code(`// Get fire colors
console.log(elementBtn.getColors());
// Change power
elementBtn.setPower(5000);
// Stop animation
elementBtn.stopAll();`)
  
cdnCode.innerHTML = code(`import Balatro from "https://unpkg.com/balatrobutton@latest/dist/index.js";`)


app_version.append(APP_VER);