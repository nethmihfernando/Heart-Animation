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