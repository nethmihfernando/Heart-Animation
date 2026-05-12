import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, particles, composer, controls;
let time = 0;
let isAnimationEnabled = true;
let currentTheme = 'molten';
let morphTarget = 0;
let morphProgress = 0;

const particleCount = 10000;

const themes = {
  molten: {
    name: 'Molten',
    colors: [
      new THREE.Color(0xff4800),
      new THREE.Color(0xff8c00),
      new THREE.Color(0xd73a00),
      new THREE.Color(0x3d1005),
      new THREE.Color(0xffc600)
    ],
    bloom: { strength: 0.35, radius: 0.45, threshold: 0.7 }
  },
  cosmic: {
    name: 'Cosmic',
    colors: [
      new THREE.Color(0x6a0dad),
      new THREE.Color(0x9370db),
      new THREE.Color(0x4b0082),
      new THREE.Color(0x8a2be2),
      new THREE.Color(0xdda0dd)
    ],
    bloom: { strength: 0.4, radius: 0.5, threshold: 0.65 }
  },
  emerald: {
    name: 'Emerald',
    colors: [
      new THREE.Color(0x00ff7f),
      new THREE.Color(0x3cb371),
      new THREE.Color(0x2e8b57),
      new THREE.Color(0x00fa9a),
      new THREE.Color(0x98fb98)
    ],
    bloom: { strength: 0.3, radius: 0.6, threshold: 0.75 }
  }
};

document.addEventListener('DOMContentLoaded', init);

function createStarPath(particleIndex, totalParticles) {
  const numStarPoints = 5;
  const outerRadius = 35;
  const innerRadius = 15;
  const scale = 1.0;
  const zDepth = 4;
  
  const starVertices = [];
  for (let i = 0; i < numStarPoints; i++) {
    let angle = (i / numStarPoints) * Math.PI * 2 - Math.PI / 2;
    starVertices.push(new THREE.Vector2(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle)));
    angle += Math.PI / numStarPoints;
    starVertices.push(new THREE.Vector2(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle)));
  }

  const numSegments = starVertices.length;
  const t_path = (particleIndex / totalParticles) * numSegments;
  const segmentIndex = Math.floor(t_path) % numSegments;
  const segmentProgress = t_path - Math.floor(t_path);

  const startVertex = starVertices[segmentIndex];
  const endVertex = starVertices[(segmentIndex + 1) % numSegments];

  const x = THREE.MathUtils.lerp(startVertex.x, endVertex.x, segmentProgress);
  const y = THREE.MathUtils.lerp(startVertex.y, endVertex.y, segmentProgress);
  const z = Math.sin((particleIndex / totalParticles) * Math.PI * 4) * (zDepth / 2);

  const jitterStrength = 0.2;
  return new THREE.Vector3(
    x * scale + (Math.random() - 0.5) * jitterStrength,
    y * scale + (Math.random() - 0.5) * jitterStrength,
    z + (Math.random() - 0.5) * jitterStrength * 0.5
  );
}

function createHeartPath(particleIndex, totalParticles) {
  const t = (particleIndex / totalParticles) * Math.PI * 2;
  const scale = 2.2;

  let x = 16 * Math.pow(Math.sin(t), 3);
  let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 *
   Math.cos(3 * t) - Math.cos(4 * t);

  const finalX = x * scale;
  const finalY = y * scale;
  const z = Math.sin(t * 4) * 2;

  const jitterStrength = 0.2;
  return new THREE.Vector3(
    finalX + (Math.random() - 0.5) * jitterStrength,
    finalY + (Math.random() - 0.5) * jitterStrength,
    z + (Math.random() - 0.5) * jitterStrength * 0.5
  );
}

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
  camera.position.z = 90;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('container').appendChild(renderer.domElement);

  createUI();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.rotateSpeed = 0.3;
  controls.minDistance = 30;
  controls.maxDistance = 300;
  controls.enablePan = false;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.15;

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  scene.userData.bloomPass = bloomPass;

  createParticleSystem();

  window.addEventListener('resize', onWindowResize);

  setTheme(currentTheme);
  animate();
}

function createUI() {
  const controlsDiv = document.getElementById('controls');
  controlsDiv.innerHTML = '';

  const themeSelector = document.createElement('div');
  themeSelector.id = 'theme-selector';
  Object.keys(themes).forEach((themeKey) => {
    const button = document.createElement('button');
    button.className = 'theme-btn';
    button.dataset.theme = themeKey;
    button.textContent = themes[themeKey].name;
    button.addEventListener('click', () => setTheme(themeKey));
    themeSelector.appendChild(button);
  });
  controlsDiv.appendChild(themeSelector);

  const separator1 = document.createElement('div');
  separator1.className = 'separator';
  controlsDiv.appendChild(separator1);

  const actionSelector = document.createElement('div');
  actionSelector.id = 'action-selector';

  const morphBtn = document.createElement('button');
  morphBtn.className = 'action-btn';
  morphBtn.textContent = 'Morph';
  morphBtn.addEventListener('click', () => {
    morphBtn.classList.toggle('active');
    morphTarget = morphTarget === 0 ? 1 : 0;
  });
  actionSelector.appendChild(morphBtn);
  controlsDiv.appendChild(actionSelector);

  const separator2 = document.createElement('div');
  separator2.className = 'separator';
  controlsDiv.appendChild(separator2);

  const toggleOption = document.createElement('div');
  toggleOption.className = 'toggle-option';

  const toggleLabel = document.createElement('label');
  toggleLabel.className = 'toggle-switch';

  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.id = 'animateToggle';
  toggleInput.checked = true;
  toggleInput.addEventListener('change', (e) => {
    isAnimationEnabled = e.target.checked;
  });

  const toggleSlider = document.createElement('span');
  toggleSlider.className = 'toggle-slider';

  toggleLabel.appendChild(toggleInput);
  toggleLabel.appendChild(toggleSlider);

  const labelForToggle = document.createElement('label');
  labelForToggle.htmlFor = 'animateToggle';
  labelForToggle.textContent = 'Animate';

  toggleOption.appendChild(toggleLabel);
  toggleOption.appendChild(labelForToggle);
  controlsDiv.appendChild(toggleOption);
}

function createParticleSystem() {
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const starPositions = new Float32Array(particleCount * 3);
  const heartPositions = new Float32Array(particleCount * 3);
  const disintegrationOffsets = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    const starPos = createStarPath(i, particleCount);
    const heartPos = createHeartPath(i, particleCount);

    positions[i3] = starPos.x;
    positions[i3 + 1] = starPos.y;
    positions[i3 + 2] = starPos.z;

    starPositions[i3] = starPos.x;
    starPositions[i3 + 1] = starPos.y;
    starPositions[i3 + 2] = starPos.z;

    heartPositions[i3] = heartPos.x;
    heartPositions[i3 + 1] = heartPos.y;
    heartPositions[i3 + 2] = heartPos.z;

    const { color, size } = getAttributesForParticle(i);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    sizes[i] = size;

    const offsetStrength = 30 + Math.random() * 40;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);

    disintegrationOffsets[i3] = Math.sin(theta) * Math.cos(phi) * offsetStrength;
    disintegrationOffsets[i3 + 1] = Math.sin(theta) * Math.sin(phi) * offsetStrength;
    disintegrationOffsets[i3 + 2] = Math.cos(theta) * offsetStrength * 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('starPosition', new THREE.BufferAttribute(starPositions, 3));
  geometry.setAttribute('heartPosition', new THREE.BufferAttribute(heartPositions, 3));
  geometry.setAttribute('disintegrationOffset', new THREE.BufferAttribute(disintegrationOffsets, 3));

  const texture = createParticleTexture();
  const material = new THREE.PointsMaterial({
    size: 2.8,
    map: texture,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    alphaTest: 0.01
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function getAttributesForParticle(i) {
  const t = i / particleCount;
  const colorPalette = themes[currentTheme].colors;

  const colorProgress = (t * colorPalette.length * 1.5 + time * 0.05) % colorPalette.length;
  const colorIndex1 = Math.floor(colorProgress);
  const colorIndex2 = (colorIndex1 + 1) % colorPalette.length;
  const blendFactor = colorProgress - colorIndex1;

  const color1 = colorPalette[colorIndex1];
  const color2 = colorPalette[colorIndex2];
  const baseColor = new THREE.Color().lerpColors(color1, color2, blendFactor);

  const color = baseColor.clone().multiplyScalar(0.65 + Math.random() * 0.55);
  const size = 0.65 + Math.random() * 0.6;

  return { color, size };
}

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.2;
  const numPoints = 5;

  context.beginPath();
  context.moveTo(centerX, centerY - outerRadius);
  for (let i = 0; i < numPoints; i++) {
    const outerAngle = (i / numPoints) * Math.PI * 2 - Math.PI / 2;
    context.lineTo(centerX + outerRadius * Math.cos(outerAngle), centerY + outerRadius * Math.sin(outerAngle));
    const innerAngle = outerAngle + Math.PI / numPoints;
    context.lineTo(centerX + innerRadius * Math.cos(innerAngle), centerY + innerRadius * Math.sin(innerAngle));
  }
  context.closePath();