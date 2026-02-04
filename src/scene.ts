import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export interface GameScene {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer;
}

export function createScene(): GameScene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.02);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.y = 1.6; // Average eye height

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;

    // Post-processing
    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.2;
    bloomPass.strength = 1.2; // High intensity for neon
    bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Add simple grid floor with emmisive color for bloom
    const gridHelper = new THREE.GridHelper(100, 50, 0x00ffff, 0x111111);
    scene.add(gridHelper);

    // Minimal floor plane for shadows
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x050510,
        roughness: 0.1,
        metalness: 0.5,
        emissive: 0x000022
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    document.getElementById('app')!.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, composer };
}
