import fragSource from './shaders/flame.fs?raw'

export default function flame(canvas, initialPowerFn, duration = 0, colors = {}) {
  const gl = canvas.getContext('webgl2', { alpha: true })
  if (!gl) return console.warn('WebGL 2.0 not supported')

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  const vertSource = `#version 300 es
    in vec2 a_position;
    in vec2 a_texcoord;
    out vec2 v_texcoord;
    void main() {
      v_texcoord = a_texcoord;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `

  const compile = (type, src) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      return null
    }
    return shader
  }

  const vs = compile(gl.VERTEX_SHADER, vertSource)
  const fs = compile(gl.FRAGMENT_SHADER, fragSource)
  if (!vs || !fs) return

  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return
  }

  gl.useProgram(program)

  const quad = new Float32Array([
    -1, -1, 0, 0,
     1, -1, 1, 0,
    -1,  1, 0, 1,
    -1,  1, 0, 1,
     1, -1, 1, 0,
     1,  1, 1, 1,
  ])

  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)

  const a_position = gl.getAttribLocation(program, 'a_position')
  const a_texcoord = gl.getAttribLocation(program, 'a_texcoord')

  gl.enableVertexAttribArray(a_position)
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 16, 0)

  gl.enableVertexAttribArray(a_texcoord)
  gl.vertexAttribPointer(a_texcoord, 2, gl.FLOAT, false, 16, 8)

  const u = name => gl.getUniformLocation(program, name)

  const lerp = (a, b, t) => a + (b - a) * t
  const lerpColor = (c1, c2, t) => c1.map((v, i) => lerp(v, c2[i], t))

  // Use passed colors or defaults
  const {
    colorStart = [1.0, 0.2, 0.0, 1.0],
    colorMid = [1.0, 1.0, 0.3, 1.0],
    colorEnd = [0.3, 0.6, 1.0, 1.0],
  } = colors

  function getFlameColors(p) {
    const t = Math.min(p / 7000, 1)
    let c1, c2, blend
    if (t < 0.5) {
      c1 = colorStart
      c2 = colorMid
      blend = t / 0.5
    } else {
      c1 = colorMid
      c2 = colorEnd
      blend = (t - 0.5) / 0.5
    }
    return {
      colour1: lerpColor(c1, c2, blend),
      colour2: lerpColor(c1, c2, blend * 0.75 + 0.25),
    }
  }

  let frameId = null
  let running = false
  let startTime = 0

  let _powerFn = initialPowerFn

  function draw() {
    if (!running) return

    const now = performance.now()
    const elapsed = now - startTime
    const time = elapsed * 0.001

    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const p = Math.min(_powerFn(), 7000)
    const { colour1, colour2 } = getFlameColors(p)

    let powerMultiplier = 1.0
    if (duration > 0) {
      powerMultiplier = Math.max(0.0, 1.0 - elapsed / duration)
    }

    gl.useProgram(program)
    gl.bindVertexArray(vao)

    gl.uniform1f(u('time'), time)
    gl.uniform1f(u('amount'), p / 1000)
    gl.uniform4f(u('texture_details'), 0, 0, 1, 1)
    gl.uniform2f(u('image_details'), 1, 1)
    gl.uniform4f(u('colour_1'), ...colour1)
    gl.uniform4f(u('colour_2'), ...colour2)
    gl.uniform1f(u('id'), 1)
    gl.uniform1f(u('power_multiplier'), powerMultiplier)

    gl.drawArrays(gl.TRIANGLES, 0, 6)

    if (duration === 0 || elapsed < duration) {
      frameId = requestAnimationFrame(draw)
    } else {
      stop()
    }
  }

  function render() {
    if (running) return
    running = true
    startTime = performance.now()
    canvas.style.display = 'block'
    draw()
  }

  function stop() {
    running = false
    cancelAnimationFrame(frameId)
    canvas.style.display = 'none'
  }

  function toCssRGB([r, g, b]) {
    return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`
  }

  function getColor() {
    const p = Math.min(_powerFn(), 7000)
    const { colour1, colour2 } = getFlameColors(p)
    return {
      raw: { colour1, colour2 },
      css: {
        colour1: toCssRGB(colour1),
        colour2: toCssRGB(colour2),
      }
    }
  }

  return {
    render,
    stop,
    getColor,
    get power() {
      return _powerFn()
    },
    set power(fn) {
      if (typeof fn === 'function') _powerFn = fn
      else _powerFn = () => fn
    },
  }
}
