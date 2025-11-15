import fragSource from './shaders/flame.fs?raw'

// WebGPU shader code (WGSL)
const webgpuVertShader = `
struct VertexInput {
  @location(0) position: vec2f,
  @location(1) texcoord: vec2f,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) texcoord: vec2f,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = vec4f(input.position, 0.0, 1.0);
  output.texcoord = input.texcoord;
  return output;
}
`;

const webgpuFragShader = `
struct FragmentInput {
  @location(0) texcoord: vec2f,
}

struct Uniforms {
  time: f32,
  amount: f32,
  texture_details: vec4f,
  image_details: vec2f,
  colour_1: vec4f,
  colour_2: vec4f,
  id: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@fragment
fn fs_main(input: FragmentInput) -> @location(0) vec4f {
  let intensity = 1.0 * min(10.0, uniforms.amount);
  if (intensity < 0.1) {
    return vec4f(0.0, 0.0, 0.0, 0.0);
  }

  var uv = ((input.texcoord * uniforms.image_details) - uniforms.texture_details.xy * uniforms.texture_details.zw) / uniforms.texture_details.zw - 0.5;
  var floored_uv = floor(uv * 60.0) / 60.0;
  var uv_scaled_centered = floored_uv;
  uv_scaled_centered += uv_scaled_centered * 0.01 * (
    sin(-1.123 * floored_uv.x + 0.2 * uniforms.time) *
    cos(5.3332 * floored_uv.y + uniforms.time * 0.931)
  );

  var flame_up_vec = vec2f(0.0, uniforms.time * 4.0 - 5000.0 + uniforms.id * 1.781);
  let scale_fac = (7.5 + 3.0 / (2.0 + 2.0 * intensity));
  var sv = uv_scaled_centered * scale_fac + flame_up_vec;
  let speed = uniforms.id * 20.781 + 1.0 * sin(uniforms.time + uniforms.id) * cos(uniforms.time * 0.151 + uniforms.id);
  var sv2 = vec2f(0.0);

  for (var i = 0; i < 5; i++) {
    sv2 += sv + 0.05 * sv2.yx * select(-1.0, 1.0, f32(i) > 1.0) 
           + 0.3 * (cos(length(sv) * 0.411) + 0.3344 * sin(length(sv)) - 0.23 * cos(length(sv)));
    sv += 0.5 * vec2f(
      cos(cos(sv2.y) + speed * 0.0812) * sin(3.22 + sv2.x - speed * 0.1531),
      sin(-sv2.x * 1.21222 + 0.113785 * speed) * cos(sv2.y * 0.91213 - 0.13582 * speed)
    );
  }

  var smoke_res = max(0.0, (
    (length((sv - flame_up_vec) / scale_fac * 5.0) +
    0.1 * (length(uv_scaled_centered) - 0.5)) *
    (2.0 / (2.0 + intensity * 0.2))
  ));

  if (intensity < 0.1) {
    smoke_res = 1.0;
  } else {
    smoke_res += max(0.0, 2.0 - 0.3 * intensity) * max(0.0, 2.0 * pow(uv_scaled_centered.y - 0.5, 2.0));
  }

  if (abs(uv.x) > 0.4) {
    smoke_res += 10.0 * (abs(uv.x) - 0.4);
  }

  if (length((uv - vec2f(0.0, 0.1)) * vec2f(0.19, 1.0)) < min(0.1, intensity * 0.5) && smoke_res > 1.0) {
    smoke_res += min(8.5, intensity * 10.0) * (length((uv - vec2f(0.0, 0.1)) * vec2f(0.19, 1.0)) - 0.1);
  }

  var ret_col = uniforms.colour_1;
  if (smoke_res > 1.0) {
    ret_col.a = 0.0;
  } else {
    if (uv.y < 0.12) {
      ret_col = ret_col * (1.0 - 0.5 * (0.12 - uv.y)) + 2.5 * (0.12 - uv.y) * uniforms.colour_2;
      ret_col += ret_col * (-2.0 + 0.5 * intensity * smoke_res) * (0.12 - uv.y);
    }
    ret_col.a = 1.0;
  }

  return ret_col;
}
`;

export default function flame(canvas, initialPowerFn, duration = 0, colors = {}) {
  const { gpu = false, webgpu = false, ...otherColors } = colors;

  // Try to use WebGPU if requested and available
  // Prioritize WebGPU when either webgpu: true OR gpu: true is set
  if ((webgpu || gpu) && typeof navigator !== 'undefined' && navigator.gpu) {
    return createWebGPUEffect(canvas, initialPowerFn, duration, otherColors);
  } else {
    return createWebGLEffect(canvas, initialPowerFn, duration, otherColors);
  }
}

async function createWebGPUEffect(canvas, initialPowerFn, duration, colors) {
  // Check WebGPU support
  if (!navigator.gpu) {
    console.warn('WebGPU not supported, falling back to WebGL');
    return createWebGLEffect(canvas, initialPowerFn, duration, colors);
  }

  try {
    // Request adapter and device
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.warn('No WebGPU adapter available, falling back to WebGL');
      return createWebGLEffect(canvas, initialPowerFn, duration, colors);
    }
    
    const device = await adapter.requestDevice();
    
    // Configure canvas for WebGPU
    const context = canvas.getContext('webgpu');
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    
    context.configure({
      device: device,
      format: canvasFormat,
      alphaMode: 'premultiplied'
    });

    // Create shader modules
    const vertexModule = device.createShaderModule({
      code: webgpuVertShader
    });
    
    const fragmentModule = device.createShaderModule({
      code: webgpuFragShader
    });

    // Define vertex data for a quad
    const vertices = new Float32Array([
      // x, y, u, v
      -1, -1, 0, 0,
       1, -1, 1, 0,
       1,  1, 1, 1,
      -1, -1, 0, 0,
       1,  1, 1, 1,
      -1,  1, 0, 1,
    ]);

    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    
    new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
    vertexBuffer.unmap();

    // Create uniform buffer
    const uniformBufferSize = 4 * 4 * 7; // 7 vec4s (time, amount + vec4 + vec2 + vec4 + vec4 + id)
    const uniformBuffer = device.createBuffer({
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    // Create bind group layout and pipeline layout
    const bindGroupLayout = device.createBindGroupLayout({
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' }
      }]
    });

    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    });

    // Create render pipeline
    const renderPipeline = device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: vertexModule,
        entryPoint: 'vs_main',
        buffers: [{
          arrayStride: 4 * 4, // 4 floats * 4 bytes each
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x2' }, // position
            { shaderLocation: 1, offset: 8, format: 'float32x2' }  // texcoord
          ]
        }]
      },
      fragment: {
        module: fragmentModule,
        entryPoint: 'fs_main',
        targets: [{ format: canvasFormat }]
      },
      primitive: {
        topology: 'triangle-list'
      }
    });

    // Create bind group
    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{
        binding: 0,
        resource: { buffer: uniformBuffer }
      }]
    });

    const lerp = (a, b, t) => a + (b - a) * t;
    const lerpColor = (c1, c2, t) => c1.map((v, i) => lerp(v, c2[i], t));

    // Use passed colors or defaults
    const {
      colorStart = [1.0, 0.2, 0.0, 1.0],
      colorMid = [1.0, 1.0, 0.3, 1.0],
      colorEnd = [0.3, 0.6, 1.0, 1.0],
    } = colors;

    function getFlameColors(p) {
      const t = Math.min(p / 7000, 1);
      let c1, c2, blend;
      if (t < 0.5) {
        c1 = colorStart;
        c2 = colorMid;
        blend = t / 0.5;
      } else {
        c1 = colorMid;
        c2 = colorEnd;
        blend = (t - 0.5) / 0.5;
      }
      return {
        colour1: lerpColor(c1, c2, blend),
        colour2: lerpColor(c1, c2, blend * 0.75 + 0.25),
      };
    }

    let frameId = null;
    let running = false;
    let startTime = 0;
    let _powerFn = initialPowerFn;

    function toCssRGB([r, g, b]) {
      return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`;
    }

    function getColor() {
      const p = Math.min(_powerFn(), 7000);
      const { colour1, colour2 } = getFlameColors(p);
      return {
        raw: { colour1, colour2 },
        css: {
          colour1: toCssRGB(colour1),
          colour2: toCssRGB(colour2),
        }
      };
    }

    function draw() {
      if (!running) return;

      const now = performance.now();
      const elapsed = now - startTime;
      const time = elapsed * 0.001;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      let p = Math.min(_powerFn(), 7000);
      const fadeDuration = 1000; // ms
      let multiplier = 1.0;
      if (duration > 0 && elapsed > duration) {
        const timeSinceFadeStart = elapsed - duration;
        multiplier = Math.max(0.0, 1.0 - timeSinceFadeStart / fadeDuration);
        p *= multiplier;
      }
      const { colour1, colour2 } = getFlameColors(p);

      // Update uniform buffer
      const uniformData = new Float32Array(uniformBufferSize / 4);
      uniformData.set([time, p / 1000, 0, 0], 0); // time, amount, texture_details.x, texture_details.y
      uniformData.set([1, 1, 0, 0], 4); // texture_details.z, texture_details.w, padding, padding
      uniformData.set([1, 1, 0, 0], 6); // image_details.x, image_details.y, padding, padding
      uniformData.set(colour1, 8); // colour_1 (vec4)
      uniformData.set(colour2, 12); // colour_2 (vec4)
      uniformData[16] = 1; // id
      uniformData[17] = 0; // padding
      uniformData[18] = 0; // padding
      uniformData[19] = 0; // padding

      device.queue.writeBuffer(uniformBuffer, 0, uniformData);

      // Render
      const commandEncoder = device.createCommandEncoder();
      const renderPassDescriptor = {
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store'
        }]
      };

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
      passEncoder.setPipeline(renderPipeline);
      passEncoder.setVertexBuffer(0, vertexBuffer);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.draw(6, 1, 0, 0);
      passEncoder.end();

      device.queue.submit([commandEncoder]);

      if (duration === 0 || elapsed < (duration + fadeDuration)) {
        frameId = requestAnimationFrame(draw);
      } else {
        stop();
      }
    }

    function render() {
      if (running) return;
      running = true;
      startTime = performance.now();
      canvas.style.display = 'block';
      draw();
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frameId);
      canvas.style.display = 'none';
    }

    return {
      render,
      stop,
      getColor,
      get power() {
        return _powerFn();
      },
      set power(fn) {
        if (typeof fn === 'function') _powerFn = fn;
        else _powerFn = () => fn;
      },
    };
  } catch (error) {
    console.error('WebGPU error:', error);
    console.warn('Falling back to WebGL');
    return createWebGLEffect(canvas, initialPowerFn, duration, colors);
  }
}

function createWebGLEffect(canvas, initialPowerFn, duration, colors) {
  // Configure WebGL context for better GPU performance if gpu option is enabled
  const { gpu = false, ...otherColors } = colors;
  const glContextOptions = {
    alpha: true,
    antialias: gpu, // Only enable antialiasing when GPU is enabled
    powerPreference: gpu ? 'high-performance' : 'default',
    preserveDrawingBuffer: false
  };

  const gl = canvas.getContext('webgl2', glContextOptions);
  if (!gl) return console.warn('WebGL 2.0 not supported');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const vertSource = `#version 300 es
    in vec2 a_position;
    in vec2 a_texcoord;
    out vec2 v_texcoord;
    void main() {
      v_texcoord = a_texcoord;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  const vs = compile(gl.VERTEX_SHADER, vertSource);
  const fs = compile(gl.FRAGMENT_SHADER, fragSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  const quad = new Float32Array([
    -1, -1, 0, 0,
     1, -1, 1, 0,
    -1,  1, 0, 1,
    -1,  1, 0, 1,
     1, -1, 1, 0,
     1,  1, 1, 1,
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

  const a_position = gl.getAttribLocation(program, 'a_position');
  const a_texcoord = gl.getAttribLocation(program, 'a_texcoord');

  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 16, 0);

  gl.enableVertexAttribArray(a_texcoord);
  gl.vertexAttribPointer(a_texcoord, 2, gl.FLOAT, false, 16, 8);

  const u = name => gl.getUniformLocation(program, name);

  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpColor = (c1, c2, t) => c1.map((v, i) => lerp(v, c2[i], t));

  // Use passed colors or defaults
  const {
    colorStart = [1.0, 0.2, 0.0, 1.0],
    colorMid = [1.0, 1.0, 0.3, 1.0],
    colorEnd = [0.3, 0.6, 1.0, 1.0],
  } = colors;

  function getFlameColors(p) {
    const t = Math.min(p / 7000, 1);
    let c1, c2, blend;
    if (t < 0.5) {
      c1 = colorStart;
      c2 = colorMid;
      blend = t / 0.5;
    } else {
      c1 = colorMid;
      c2 = colorEnd;
      blend = (t - 0.5) / 0.5;
    }
    return {
      colour1: lerpColor(c1, c2, blend),
      colour2: lerpColor(c1, c2, blend * 0.75 + 0.25),
    };
  }

  let frameId = null;
  let running = false;
  let startTime = 0;

  let _powerFn = initialPowerFn;

  function draw() {
    if (!running) return;

    const now = performance.now();
    const elapsed = now - startTime;
    const time = elapsed * 0.001;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let p = Math.min(_powerFn(), 7000);
    const fadeDuration = 1000; // ms
    if (duration > 0 && elapsed > duration) {
      const timeSinceFadeStart = elapsed - duration;
      const multiplier = Math.max(0.0, 1.0 - timeSinceFadeStart / fadeDuration);
      p *= multiplier;
    }
    const { colour1, colour2 } = getFlameColors(p);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.uniform1f(u('time'), time);
    gl.uniform1f(u('amount'), p / 1000);
    gl.uniform4f(u('texture_details'), 0, 0, 1, 1);
    gl.uniform2f(u('image_details'), 1, 1);
    gl.uniform4f(u('colour_1'), ...colour1);
    gl.uniform4f(u('colour_2'), ...colour2);
    gl.uniform1f(u('id'), 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (duration === 0 || elapsed < (duration + fadeDuration)) {
      frameId = requestAnimationFrame(draw);
    } else {
      stop();
    }
  }

  function render() {
    if (running) return;
    running = true;
    startTime = performance.now();
    canvas.style.display = 'block';
    draw();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frameId);
    canvas.style.display = 'none';
  }

  function toCssRGB([r, g, b]) {
    return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`;
  }

  function getColor() {
    const p = Math.min(_powerFn(), 7000);
    const { colour1, colour2 } = getFlameColors(p);
    return {
      raw: { colour1, colour2 },
      css: {
        colour1: toCssRGB(colour1),
        colour2: toCssRGB(colour2),
      }
    };
  }

  return {
    render,
    stop,
    getColor,
    get power() {
      return _powerFn();
    },
    set power(fn) {
      if (typeof fn === 'function') _powerFn = fn;
      else _powerFn = () => fn;
    },
  };
}