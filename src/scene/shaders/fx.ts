import { NOISE } from './noise'

/** satellites: each point follows its own inclined circular orbit, computed on the GPU */
export const dustVertex = /* glsl */ `
attribute vec4 aOrbit; // radius, start angle, inclination, angular speed
attribute float aNode;
attribute float aSeed;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
varying float vTwinkle;
void main() {
  float a = aOrbit.y + uTime * aOrbit.w;
  vec3 q = vec3(cos(a) * aOrbit.x, 0.0, sin(a) * aOrbit.x);
  // tilt about x by the inclination, then rotate about y to the ascending node
  q = vec3(q.x, q.z * sin(aOrbit.z), q.z * cos(aOrbit.z));
  float cn = cos(aNode);
  float sn = sin(aNode);
  vec3 pos = vec3(q.x * cn + q.z * sn, q.y, -q.x * sn + q.z * cn);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vTwinkle = 0.6 + 0.4 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 40.0);
  gl_PointSize = uSize * uPixelRatio * (0.5 + aSeed) * (6.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

export const pointFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vTwinkle;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor * a * vTwinkle * 1.6, a * vTwinkle * uOpacity);
  #include <colorspace_fragment>
}
`

export const starVertex = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
varying float vTwinkle;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vTwinkle = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.4 + aSeed) + aSeed * 90.0));
  gl_PointSize = uSize * uPixelRatio * (0.4 + aSeed * aSeed * 1.6);
  gl_Position = projectionMatrix * mv;
}
`

export const crystalVertex = /* glsl */ `
uniform float uTime;
attribute float aSeed;
varying vec3 vWorld;
varying vec3 vLocal;
varying float vSeed;
void main() {
  vec4 local = instanceMatrix * vec4(position, 1.0);
  local.y += sin(uTime * 0.6 + aSeed * 30.0) * 0.06;
  vec4 w = modelMatrix * local;
  vWorld = w.xyz;
  vLocal = position;
  vSeed = aSeed;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

export const crystalFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uWarm;
uniform vec3 uLightDir;
uniform float uFade;
uniform float uTime;
varying vec3 vWorld;
varying vec3 vLocal;
varying float vSeed;
void main() {
  // flat facets from screen-space derivatives
  vec3 N = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 V = normalize(cameraPosition - vWorld);
  if (dot(N, V) < 0.0) N = -N;
  vec3 L = normalize(uLightDir);
  float diff = max(dot(N, L), 0.0);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  float spec = pow(max(dot(reflect(-L, N), V), 0.0), 60.0);
  float core = smoothstep(0.6, 0.0, abs(vLocal.y)) * (0.5 + 0.5 * sin(uTime * 1.3 + vSeed * 20.0));
  vec3 col = vec3(0.02, 0.01, 0.05) + uColor * (diff * 0.35 + fres * 1.4) + uWarm * core * 0.5 + vec3(spec) * 1.2;
  gl_FragColor = vec4(col * uFade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export const latticeVertex = /* glsl */ `
attribute float aT;
attribute float aSeed;
varying float vT;
varying float vSeed;
void main() {
  vT = aT;
  vSeed = aSeed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const latticeFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uWarm;
uniform float uTime;
uniform float uFade;
varying float vT;
varying float vSeed;
void main() {
  float head = fract(uTime * (0.18 + vSeed * 0.25) + vSeed * 7.0);
  float pulse = 1.0 - smoothstep(0.0, 0.12, abs(vT - head));
  vec3 col = uColor * 0.22 + uWarm * pulse * 1.8;
  float a = (0.16 + pulse * 0.9) * uFade;
  gl_FragColor = vec4(col * a, a);
  #include <colorspace_fragment>
}
`

export const nebulaVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const nebulaFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uCool;
uniform vec3 uWarm;
uniform float uFade;
uniform float uTime;
varying vec3 vDir;
${NOISE}
void main() {
  vec3 d = vDir * 1.6;
  vec3 w = vec3(fbm(d + uTime * 0.004, 3), 0.0, 0.0);
  w.y = w.x * 0.7 - 0.1;
  float n = fbm(d * 1.3 + w * 1.5, 4);
  float dens = smoothstep(-0.1, 0.7, n);
  vec3 col = mix(uCool, uColor, smoothstep(0.0, 0.6, w.x + 0.3));
  col = mix(col, uWarm, smoothstep(0.45, 0.85, n) * 0.6);
  // keep it faint: atmosphere, not a wallpaper
  gl_FragColor = vec4(col * dens * 0.22 * uFade, dens * uFade * 0.35);
  #include <colorspace_fragment>
}
`
