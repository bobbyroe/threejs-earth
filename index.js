import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";
import { getEarthMat } from "./src/getEarthMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0.2, 0, 3);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const loader = new THREE.TextureLoader();

const sunDirection = new THREE.Vector3(-2, 0.5, 1.5);

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);
const detail = 32;

const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = getEarthMat(sunDirection);
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const atmosphereMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, atmosphereMat);
glowMesh.scale.setScalar(1.02);
earthGroup.add(glowMesh);

// add twinkle
const stars = getStarfield({numStars: 2000});
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 4.0);
sunLight.position.copy(sunDirection);
scene.add(sunLight);
const sunGeo = new THREE.SphereGeometry(1, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.copy(sunDirection).multiplyScalar(5);
scene.add(sunMesh);

const moonGroup = new THREE.Group();
scene.add(moonGroup);
const moonMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/06_moonmap4k.jpg"),
  bumpMap: loader.load("./textures/07_moonbump4k.jpg"),
  bumpScale: 2,
});
const moonMesh = new THREE.Mesh(geometry, moonMat);
moonMesh.position.set(2, 0, 0);
moonMesh.scale.setScalar(0.27);
moonGroup.add(moonMesh);

function animate(t = 0) {
  requestAnimationFrame(animate);
  earthMesh.rotation.y += 0.002;
  glowMesh.rotation.y += 0.002;
  stars.userData.update(t);
  moonGroup.rotation.y += 0.01;
  renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);