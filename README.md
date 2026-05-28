# Neon Morphing Particle System
A visually stunning, interactive 3D particle simulation built with Three.js. This project renders thousands of glowing, animated particles that seamlessly morph between geometric shapes, featuring dynamic real-time disintegration effects, procedural color shifting, and high-fidelity post-processing bloom.


---

## 🚀 Features

* **Fluid Shape Morphing:** Seamlessly transitions `10,000` individual particles between a **Star** and a complex parametric **Heart** using custom mathematical paths.
* **Dynamic Disintegration:** Cyclic entropy system where particles spontaneously break apart into a chaotic 3D cloud and reconstruct themselves automatically.
* **Real-Time Theming:** Switch instantly between three beautifully curated neon color palettes with responsive UI updates:
    * 🔥 **Molten:** Energetic fiery oranges and gold.
    * 🌌 **Cosmic:** Deep space purples, violets, and magentas.
    * 🌿 **Emerald:** Vibrant, electric sea-greens.
* **Cinematic Post-Processing:** Powered by Three.js `EffectComposer` and `UnrealBloomPass` to generate an authentic neon glow effect.
* **Interactive Controls:** Built-in `OrbitControls` allowing users to rotate, pan, and zoom around the system, alongside a sleek frosted-glass control UI panel.

---

## 🛠️ Tech Stack

* **HTML5 & CSS3:** Semantics and a modern UI featuring glassmorphism backdrop blurs.
* **JavaScript (ES6+):** Modular structures using native import maps.
* **Three.js (r162):** Core 3D engine handling `BufferGeometry`, custom canvas particle textures, and additive blending modes for the ultimate brightness effect.

---

## 📖 How It Works Under the Hood

### Parametric Formulas

The particle layout structures are calculated purely with mathematics:

* **Heart Shape:** Driven by the classic parametric 2D heart formula scaled dynamically across the Z-axis:
    $$x = 16 \cdot \sin^3(t)$$
    $$y = 13 \cdot \cos(t) - 5 \cdot \cos(2t) - 2 \cdot \cos(3t) - \cos(4t)$$
* **Star Shape:** Alternates polar coordinates sequentially between an inner and outer radius across 5 distinct points to map clean vector lines.

### Disintegration Mechanics

Every single particle is assigned a random spherical offset vector upon initialization. During the animation loop, a sinusoidal timeline calculates the displacement based on a cyclic window, pushing the particle away from its "home" coordinate and bringing it smoothly back.

---