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