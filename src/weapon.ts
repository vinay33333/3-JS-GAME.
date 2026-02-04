import * as THREE from 'three';

export class Weapon {
    public mesh: THREE.Group;
    private camera: THREE.Camera;
    private isShooting = false;
    private laserBeams: { mesh: THREE.Line; age: number }[] = [];

    constructor(camera: THREE.Camera) {
        this.camera = camera;
        this.mesh = this.createWeaponModel();

        // Attach weapon to camera
        this.mesh.position.set(0.5, -0.4, -1);
        this.mesh.rotation.y = -Math.PI / 12;
        this.camera.add(this.mesh);

        // Click to shoot
        window.addEventListener('mousedown', () => this.shoot());
    }

    private createWeaponModel(): THREE.Group {
        const group = new THREE.Group();

        // Body
        const bodyGeo = new THREE.BoxGeometry(0.2, 0.2, 0.6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Barrel
        const barrelGeo = new THREE.BoxGeometry(0.1, 0.1, 0.5);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.position.z = -0.4;
        group.add(barrel);

        // Handle
        const handleGeo = new THREE.BoxGeometry(0.15, 0.4, 0.15);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.y = -0.2;
        handle.rotation.x = -Math.PI / 4;
        group.add(handle);

        return group;
    }

    public targets: THREE.Object3D[] = [];

    private shoot() {
        if (this.isShooting) return;

        // Crosshair Animation
        const crosshair = document.getElementById('crosshair');
        crosshair?.classList.add('shooting');
        setTimeout(() => crosshair?.classList.remove('shooting'), 100);

        // Recoil animation
        const initialZ = this.mesh.position.z;
        this.mesh.position.z += 0.2;
        setTimeout(() => {
            this.mesh.position.z = initialZ;
        }, 100);

        // Raycast
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        // Create Laser Visual
        const points = [];
        points.push(this.mesh.getWorldPosition(new THREE.Vector3()));

        // Default endpoint far away
        let endPoint = raycaster.ray.at(100, new THREE.Vector3());

        // Check collisions
        if (this.targets.length > 0) {
            const intersects = raycaster.intersectObjects(this.targets);
            if (intersects.length > 0) {
                endPoint = intersects[0].point;
                // Basic hit response
                const target = intersects[0].object;
                if (target instanceof THREE.Mesh) {
                    (target.material as THREE.MeshStandardMaterial).emissive.setHex(0xffffff);
                    setTimeout(() => {
                        (target.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0055);
                    }, 100);

                    // Hit Marker Visual
                    const hitMarker = document.getElementById('hit-marker');
                    hitMarker?.classList.add('hit');
                    setTimeout(() => hitMarker?.classList.remove('hit'), 100);

                    // Mark for removal (simple hack for now, ideally use an event system)
                    target.userData.hit = true;
                }
            }
        }

        // Start beam from barrel
        const barrelPos = new THREE.Vector3();
        // Approximate barrel end in world space
        this.mesh.children[1].getWorldPosition(barrelPos);

        const geometry = new THREE.BufferGeometry().setFromPoints([barrelPos, endPoint]);
        const material = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 2, transparent: true, opacity: 1 });
        const laser = new THREE.Line(geometry, material);

        // We need to add laser to the scene, not the camera
        this.camera.parent?.add(laser); // Add to scene assuming camera is child of scene or similar, essentially World Space

        this.laserBeams.push({ mesh: laser, age: 0 });
    }

    public update(scene: THREE.Scene, delta: number) {
        // Update lasers
        for (let i = this.laserBeams.length - 1; i >= 0; i--) {
            const laser = this.laserBeams[i];
            laser.age += delta;

            const mat = laser.mesh.material as THREE.LineBasicMaterial;
            mat.opacity = 1 - (laser.age / 0.2);
            mat.needsUpdate = true;

            if (laser.age > 0.2) {
                scene.remove(laser.mesh);
                this.laserBeams.splice(i, 1);
            }
        }
    }
}
