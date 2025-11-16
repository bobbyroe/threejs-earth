import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();

// Camera: useremo una posizione iniziale che verrà poi regolata
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
// camera.position.z = 5; // Questa riga verrà commentata o rimossa

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);

const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail); // Il raggio è 1
const material = new THREE.MeshPhongMaterial({
    map: loader.load("./textures/00_earthmap1k.jpg"),
    specularMap: loader.load("./textures/02_earthspec1k.jpg"),
    bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
    bumpScale: 0.04,
});
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
    map: loader.load("./textures/03_earthlights1k.jpg"),
    blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
    map: loader.load("./textures/04_earthcloudmap.jpg"),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const stars = getStarfield({numStars: 2000});
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// --- Nuova funzione per calcolare la posizione Z della camera ---
function setCameraDistance() {
    // Definiamo una dimensione "ideale" per la Terra nella viewport.
    // Ad esempio, vogliamo che occupi circa il 60% dell'altezza dello schermo su una risoluzione "base".
    // Il raggio della geometria è 1.
    const objectRadius = 1;
    const fov = camera.fov * (Math.PI / 180); // Converti FOV in radianti
    const targetVisualHeightRatio = 0.6; // La Terra dovrebbe occupare il 60% dell'altezza dello schermo

    // Calcola la distanza necessaria
    // Questo è un'approssimazione che funziona bene per oggetti al centro dello schermo.
    let distance = objectRadius / Math.tan(fov / 2);

    // Ajusta la distanza in base all'altezza della viewport per mantenere la dimensione visiva
    // Questo è il punto chiave. Se l'altezza della viewport raddoppia, vogliamo raddoppiare anche la distanza
    // per mantenere l'oggetto della stessa dimensione percepita rispetto alla viewport.
    // Possiamo definire una "altezza di riferimento" e una distanza "di riferimento".
    const referenceHeight = 768; // Esempio: altezza in pixel per cui camera.position.z = 5 era ok
    const referenceDistance = 5; // Corrispondente distanza z

    // Calcola la nuova distanza in proporzione all'altezza attuale della finestra
    // Se l'altezza attuale è maggiore della referenceHeight, la distanza sarà maggiore,
    // allontanando la camera e mantenendo l'oggetto della stessa dimensione relativa.
    distance = referenceDistance * (window.innerHeight / referenceHeight);

    // Imposta un limite minimo e massimo per evitare che la camera si avvicini troppo o si allontani troppo
    distance = Math.max(2.5, Math.min(distance, 20)); // Esempio: tra 2.5 e 20 unità

    camera.position.z = distance;
    camera.updateProjectionMatrix(); // Importante aggiornare la matrice di proiezione
}

// Chiama la funzione una volta all'inizio per impostare la posizione iniziale della camera
setCameraDistance();

function animate() {
    requestAnimationFrame(animate);

    earthMesh.rotation.y += 0.002;
    lightsMesh.rotation.y += 0.002;
    cloudsMesh.rotation.y += 0.0023;
    glowMesh.rotation.y += 0.002;
    stars.rotation.y -= 0.0002;
    renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    setCameraDistance(); // Chiama questa funzione anche al ridimensionamento
}
window.addEventListener('resize', handleWindowResize, false);
