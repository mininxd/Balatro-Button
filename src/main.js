import flameEffect from './effect.js'

import './style.css'

import './fonts/m6x11plus.woff'
import './fonts/m6x11plus.woff2'


export default class FlameButton {
  constructor({
    selector = '.btn-flame',
    duration = 0,
    power = () => 500,
    score = 0,
    textAlign = "center",
    colorStart = "#f00",
    colorMid = "#f50",
    colorEnd = "ff0",
  } = {}) {
    this.instances = []

    document.querySelectorAll(selector).forEach((origBtn) => {
      const wrapper = document.createElement('div')
      wrapper.className = 'flame-wrapper relative z-10 pt-12 inline-block'

      const button = origBtn.cloneNode(true)
      button.classList.add(
        'btn',
        'rounded',
        'px-2',
        'z-[11]',
        'relative',
        'border-0',
        'text-2xl',
        'text-balatro',
        'text-white',
        'text-sd',
        'text-right',
      )
      button.style.backgroundColor =  colorStart;

      if (!button.textContent.trim()) {
        button.textContent = score
      }

      const canvas = document.createElement('canvas')
      canvas.className = 'flame-canvas'

      wrapper.appendChild(canvas)
      wrapper.appendChild(button)
      origBtn.replaceWith(wrapper)

      const effect = flameEffect(canvas, power, duration, {
       colorStart: hexToVec4(colorStart),
       colorMid: hexToVec4(colorMid),
       colorEnd: hexToVec4(colorEnd),
      })
      effect.render()

      const updateBackground = () => {
        const colors = effect.getColor()
        button.style.backgroundColor = colors.css.colour1
        requestAnimationFrame(updateBackground)
      }
      updateBackground()

      this.instances.push({ wrapper, canvas, button, effect })
    })
  }

  setScore(score, power) {
    const instance = this.instances[0]
    if (!instance) return

    let currentScore = parseInt(instance.button.textContent) || 0
    const newScore = currentScore + score
    instance.button.textContent = newScore

    if (power !== undefined) {
      instance.effect.power = power
    }
  }

  stopAll() {
    this.instances.forEach(({ effect }) => effect.stop())
  }

  getColors() {
    return this.instances.map(({ effect }) => effect.getColor())
  }
}






 export function hexToVec4(hex, alpha = 1) {
  let r, g, b;

  if (hex.startsWith('#')) {
    hex = hex.slice(1);
    if (hex.length === 3) {
      // shorthand #F80 -> #FF8800
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return "invalid HEX"
    }
  } else if (hex.startsWith('rgb')) {
    // Parse "rgb(255, 136, 0)" or "rgba(255,136,0,0.5)"
    const nums = hex.match(/\d+\.?\d*/g).map(Number);
    [r, g, b] = nums;
    if (nums.length === 4) alpha = nums[3];
  } else {
    return "invalid RGB"
  }

  return [
    (r / 255),
    (g / 255),
    (b / 255),
    alpha
    ];
}