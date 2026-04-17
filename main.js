import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. Setup (scene, Camera, Renderer[const cont..], Control, Load Model, ...)
const scene = new THREE.Scene();

// 2. Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;
camera.fov = 20;

camera.updateProjectionMatrix();


// 3. Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

const container = document.getElementById("container");

const width = container.clientWidth;
const height = container.clientHeight;

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

camera.aspect = width / height;
camera.updateProjectionMatrix();

container.appendChild(renderer.domElement);



// 4. Controls

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.enableZoom = false;

controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;

let triggered = false;
let resetting = false;

controls.addEventListener('change', () => {
  triggered = true;
});

// + mouse

const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) - 0.5;
  mouse.y = (event.clientY / window.innerHeight) - 0.5;
});


// 5. Cube
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshStandardMaterial({ color: "tomato" });

// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);
// cube.position.set(0, 0, 0);
// cube.rotation.x = THREE.MathUtils.degToRad(30);
// cube.rotation.y = THREE.MathUtils.degToRad(45);

const loader = new GLTFLoader();

let model;

loader.load('./myclock.glb', function (gltf) {
  model = gltf.scene;
  scene.add(model);
});



// 6. Light
const ambient = new THREE.AmbientLight("white", 0.7);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight("white", 5);
keyLight.position.set(1, 3, 2);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
fillLight.position.set(-3, 2, -2);
scene.add(fillLight);

let waiting = false;

const initPos = camera.position.clone();
const initTarget = controls.target.clone();

// 7. Animate
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    const sensitivity = 1.5;

    const targetY = mouse.x * sensitivity;
    const targetX = mouse.y * sensitivity;

    model.rotation.y += (targetY - model.rotation.y) * 0.1;
    model.rotation.x += (targetX - model.rotation.x) * 0.1;

  }

  model.rotation.z += 0.01

  controls.update()

  if (triggered && !waiting) {
    waiting = true;

    setTimeout(() => {
      const duration = 1000;
      const start = performance.now();

      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();

      function animateReset(time) {
        const t = Math.min((time - start) / duration, 1);

        const k = 1 - Math.pow(1 - t, 3); // smooth easing

        camera.position.lerpVectors(startPos, initPos, k);
        controls.target.lerpVectors(startTarget, initTarget, k);

        controls.update();

        if (t < 1) {
          requestAnimationFrame(animateReset);
        } else {
          triggered = false;
          waiting = false;
        }
      }

      requestAnimationFrame(animateReset);
    }, 2000);
  }

  renderer.render(scene, camera);
}




animate();