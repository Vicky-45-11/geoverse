export const planetVertex = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec2 vUv;
void main() {
  vObj = position;
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

/**
 * Earth surface. Day colour, normal-mapped relief, ocean sun-glint from the water mask, city lights on the
 * night side and a fresnel limb. The same maps drive three other looks: night side, an amber/navy atlas and a
 * hologram with coastlines. uFocus lights up a selected region.
 */
export const planetFragment = /* glsl */ `
uniform sampler2D uDay;
uniform sampler2D uNormal;
uniform sampler2D uOcean;
uniform sampler2D uLights;
uniform float uTime;
uniform vec3 uAccent;
uniform vec3 uLightDir;
uniform float uLight;
uniform float uNight;
uniform float uAtlas;
uniform float uHolo;
uniform vec3 uFocusDir;
uniform vec3 uFocusColor;
uniform float uFocus;
uniform vec3 uHoverDir;
uniform float uHover;
varying vec3 vObj;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec2 vUv;

vec3 perturb(vec3 N, vec2 uv, vec3 mapN) {
  vec3 q0 = dFdx(vWorld);
  vec3 q1 = dFdy(vWorld);
  vec2 st0 = dFdx(uv);
  vec2 st1 = dFdy(uv);
  vec3 q1p = cross(q1, N);
  vec3 q0p = cross(N, q0);
  vec3 T = q1p * st0.x + q0p * st1.x;
  vec3 B = q1p * st0.y + q0p * st1.y;
  float det = max(dot(T, T), dot(B, B));
  float sc = det == 0.0 ? 0.0 : inversesqrt(det);
  return normalize(T * (mapN.x * sc) + B * (mapN.y * sc) + N * mapN.z);
}

void main() {
  // equirectangular lookup: longitude 0 faces +z, matching the hotspot and readout maths
  vec2 uv = vec2(vUv.x + 0.25, vUv.y);
  vec3 p = normalize(vObj);
  vec3 day = texture2D(uDay, uv).rgb;
  float water = texture2D(uOcean, uv).r;
  float land = 1.0 - water;
  float city = smoothstep(0.22, 0.75, texture2D(uLights, uv).r);
  // richer ocean blue than the source map
  day = mix(day, day * vec3(0.75, 1.0, 1.45), water * 0.7);

  vec3 Ng = normalize(vNormalW);
  vec3 mapN = texture2D(uNormal, uv).xyz * 2.0 - 1.0;
  mapN.xy *= 0.9;
  vec3 N = perturb(Ng, uv, mapN);

  vec3 V = normalize(cameraPosition - vWorld);
  vec3 L = normalize(mix(uLightDir, -uLightDir, uNight));
  vec3 H = normalize(L + V);
  float ndlG = dot(Ng, L);
  float ndl = dot(N, L);
  // soft terminator, slightly warm at the edge
  float dayAmt = smoothstep(-0.12, 0.28, ndlG);
  float diff = max(ndl, 0.0) * dayAmt * uLight;
  float fres = pow(1.0 - clamp(dot(Ng, V), 0.0, 1.0), 3.0);

  // realistic
  vec3 lit = day * (0.012 + diff * 1.9);
  float spec = pow(max(dot(N, H), 0.0), 90.0) * water * dayAmt * uLight;
  lit += vec3(1.0, 0.93, 0.8) * spec * 1.1;
  lit += vec3(0.18, 0.4, 0.95) * fres * water * 0.18 * dayAmt * uLight;
  // twilight band
  float tw = smoothstep(0.0, 0.18, ndlG + 0.06) * (1.0 - smoothstep(0.18, 0.4, ndlG + 0.06));
  lit += vec3(0.9, 0.35, 0.2) * tw * 0.07 * day * uLight;
  // night lights
  float nightAmt = 1.0 - smoothstep(-0.18, 0.1, ndlG);
  lit += vec3(1.0, 0.74, 0.38) * pow(city, 1.2) * nightAmt * 1.6;

  // atlas: warm land shaded by the photo, deep navy ocean
  float luma = dot(day, vec3(0.299, 0.587, 0.114));
  vec3 atlasCol = mix(vec3(0.015, 0.05, 0.13) + vec3(0.02, 0.06, 0.12) * fres, vec3(0.45, 0.27, 0.1) * (0.55 + luma * 1.4), land);
  vec3 atlas = atlasCol * (0.12 + 1.15 * max(ndl, 0.0) * dayAmt * uLight) + vec3(0.9, 0.55, 0.2) * fres * 0.2 * land;
  atlas += vec3(1.0, 0.7, 0.3) * pow(city, 1.2) * nightAmt * 1.0;

  // hologram: coastlines from the water mask, lat/long grid, scanlines
  float lat = asin(clamp(p.y, -1.0, 1.0));
  float lon = atan(p.x, p.z);
  float gx = smoothstep(0.93, 0.99, abs(fract(lon * 12.0 / 6.2831) - 0.5) * 2.0);
  float gy = smoothstep(0.93, 0.99, abs(fract(lat * 12.0 / 3.1415) - 0.5) * 2.0);
  float coast = smoothstep(0.0, 1.0, length(vec2(dFdx(land), dFdy(land))) * 14.0);
  float scan = 0.5 + 0.5 * sin(vWorld.y * 120.0 - uTime * 6.0);
  vec3 holo = uAccent * 0.0 + vec3(0.25, 0.8, 1.0) * (max(gx, gy) * 0.55 + coast * 1.6 + land * 0.12 + fres * 1.3 + scan * 0.05);

  vec3 col = lit;
  col = mix(col, atlas, uAtlas);
  col = mix(col, holo, uHolo);

  // region focus ring and pointer light
  float fd = dot(p, normalize(uFocusDir));
  float halo = smoothstep(0.93, 0.995, fd);
  float ring = 1.0 - smoothstep(0.0, 0.012, abs(fd - 0.975 - 0.01 * sin(uTime * 3.0)));
  col += uFocusColor * (halo * 0.1 + ring * 0.9) * uFocus;
  float hd = smoothstep(0.9, 1.0, dot(p, normalize(uHoverDir)));
  col += uAccent * hd * hd * 0.25 * uHover;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export const cloudFragment = /* glsl */ `
uniform sampler2D uClouds;
uniform vec3 uLightDir;
uniform float uLight;
uniform float uNight;
uniform float uOpacity;
varying vec3 vWorld;
varying vec3 vNormalW;
varying vec2 vUv;
void main() {
  float d = texture2D(uClouds, vec2(vUv.x + 0.25, vUv.y)).r;
  vec3 N = normalize(vNormalW);
  vec3 L = normalize(mix(uLightDir, -uLightDir, uNight));
  float ndl = dot(N, L);
  float lit = smoothstep(-0.12, 0.3, ndl) * uLight;
  vec3 col = vec3(1.0, 0.98, 0.96) * (0.01 + lit * 1.25);
  gl_FragColor = vec4(col, d * uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export const atmosphereVertex = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

export const atmosphereFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uWarm;
uniform vec3 uLightDir;
uniform float uStrength;
varying vec3 vNormalW;
varying vec3 vWorld;
void main() {
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 N = normalize(vNormalW);
  // back faces: glow strongest right at the limb
  float rim = pow(clamp(-dot(N, V) * 2.3, 0.0, 1.0), 2.2);
  float sun = clamp(dot(-N, normalize(uLightDir)) * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uColor, uWarm, pow(sun, 3.0) * 0.6);
  gl_FragColor = vec4(col * rim * uStrength, rim);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`
