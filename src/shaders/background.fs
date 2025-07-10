#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform float u_time;
uniform float u_spin_time;
uniform float u_contrast;
uniform float u_spin_amount;
uniform vec2 u_resolution;

uniform vec4 u_colour_1;
uniform vec4 u_colour_2;
uniform vec4 u_colour_3;

#define PIXEL_SIZE_FAC 650.0
#define SPIN_EASE 0.55
#define GAMMA 0.95

vec3 gammaCorrect(vec3 color) {
  return pow(color, vec3(1.0 / GAMMA));
}

void main() {
  float pixel_size = length(u_resolution.xy) / PIXEL_SIZE_FAC;
  vec2 screen_coords = v_uv * u_resolution;

  vec2 uv = (floor(screen_coords * (1.0 / pixel_size)) * pixel_size - 0.4 * u_resolution.xy) 
            / length(u_resolution.xy) - vec2(0.10, 0.0);
  float uv_len = length(uv);

  float speed = (u_spin_time * SPIN_EASE * 0.2) + 302.2;
  float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE * 20.0 * (u_spin_amount * uv_len + (1.0 - u_spin_amount));
  vec2 mid = (u_resolution.xy / length(u_resolution.xy)) / 2.0;
  uv = vec2(
    uv_len * cos(new_pixel_angle) + mid.x,
    uv_len * sin(new_pixel_angle) + mid.y
  ) - mid;

  uv *= 30.0;
  speed = u_time * 2.0;
  vec2 uv2 = vec2(uv.x + uv.y);

  for (int i = 0; i < 5; i++) {
    uv2 += sin(max(uv.x, uv.y)) + uv;
    uv += 0.9 * vec2(
      cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
      sin(uv2.x - 0.113 * speed)
    );
    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
  }

  float contrast_mod = (0.25 * u_contrast + 0.5 * u_spin_amount + 1.2);
  float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
  float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
  float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
  float c3p = 1.0 - min(1.0, c1p + c2p);

  vec3 c1 = gammaCorrect(u_colour_1.rgb);
  vec3 c2 = gammaCorrect(u_colour_2.rgb);
  vec3 c3 = gammaCorrect(u_colour_3.rgb);

  vec3 result_rgb = (0.3 / u_contrast) * c1 +
    (1.0 - 0.3 / u_contrast) * (
      c1 * c1p +
      c2 * c2p +
      c3 * c3p
    );

  float result_alpha = u_colour_1.a * (c1p + c2p + c3p);
  fragColor = vec4(result_rgb, result_alpha);
}
