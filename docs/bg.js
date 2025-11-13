import fragSrc from '/shaders/background.fs?url&raw';

const canvas = document.createElement('canvas');
canvas.id = 'glcanvas';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '0';
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl2');

const vertexSrc = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, vsSrc, fsSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

const program = createProgram(gl, vertexSrc, fragSrc);
gl.useProgram(program);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const quad = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
   1,  1,
]);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

const loc = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

// Uniforms locations
const u_time = gl.getUniformLocation(program, 'u_time');
const u_spin_time = gl.getUniformLocation(program, 'u_spin_time');
const u_contrast = gl.getUniformLocation(program, 'u_contrast');
const u_spin_amount = gl.getUniformLocation(program, 'u_spin_amount');
const u_resolution = gl.getUniformLocation(program, 'u_resolution');
const u_colour_1 = gl.getUniformLocation(program, 'u_colour_1');
const u_colour_2 = gl.getUniformLocation(program, 'u_colour_2');
const u_colour_3 = gl.getUniformLocation(program, 'u_colour_3');

gl.uniform4f(u_colour_1, 0.6, 0.0, 0.0, 1.0);
gl.uniform4f(u_colour_2, 0.0, 0.75, 0.0, 1.0);
gl.uniform4f(u_colour_3, 0.0, 0.0, 1.0, 1.0);


function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

const start = performance.now();

function draw() {
  const time = (performance.now() - start) / 1000;

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.uniform1f(u_time, time);
  gl.uniform1f(u_spin_time, time * 0.7);
  gl.uniform2f(u_resolution, canvas.width, canvas.height);
  gl.uniform4f(u_colour_1, 0.72, 0.1, 0.05, 1.0);
  gl.uniform4f(u_colour_2, 0, 0.08, 0.25, 1.0);
  gl.uniform4f(u_colour_3, 0.1, 0.1, 0.98, 1.0);

  gl.uniform1f(u_contrast, 0.6);
  gl.uniform1f(u_spin_amount, 0.8);

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(draw);
}

draw();
