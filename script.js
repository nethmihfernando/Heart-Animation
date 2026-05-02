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