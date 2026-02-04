import * as THREE from 'three';

export class World {
    public targets: THREE.Mesh[] = [];
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.createTargets();
        this.createDecorations();
    }

    private createTargets() {
        const geometry = new THREE.TetrahedronGeometry(1);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0055,
            emissive: 0xff0055,
            emissiveIntensity: 0.5,
            roughness: 0.1,
            metalness: 0.8
        });

        for (let i = 0; i < 10; i++) {
            const mesh = new THREE.Mesh(geometry, material.clone());
            mesh.position.set(
                (Math.random() - 0.5) * 40,
                2 + Math.random() * 3,
                (Math.random() - 0.5) * 40 - 10
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

            // Add some floating animation data to the mesh userData
            mesh.userData = {
                floatSpeed: 0.5 + Math.random(),
                floatOffset: Math.random() * Math.PI * 2,
                rotationSpeed: new THREE.Vector3(Math.random() * 2, Math.random() * 2, Math.random() * 2)
            };

            this.scene.add(mesh);
            this.targets.push(mesh);
        }
    }

    private createDecorations() {
        // Add some varying height columns
        const geo = new THREE.BoxGeometry(1, 10, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x001133 });

        for (let i = 0; i < 20; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 80,
                0, // Center is at 0, so it sticks up 5 units
                (Math.random() - 0.5) * 80
            );
            mesh.position.y = 2.5 + Math.random() * 5; // Raise it up
            mesh.scale.set(1 + Math.random(), 1 + Math.random(), 1 + Math.random());
            this.scene.add(mesh);
        }
    }

    public update(delta: number) {
        this.targets.forEach(target => {
            if (target.userData) {
                target.rotation.x += target.userData.rotationSpeed.x * delta;
                target.rotation.y += target.userData.rotationSpeed.y * delta;

                target.position.y += Math.sin(Date.now() * 0.002 + target.userData.floatOffset) * 0.01;
            }
        });
    }

    public removeTarget(target: THREE.Object3D) {
        const index = this.targets.indexOf(target as THREE.Mesh);
        if (index > -1) {
            this.scene.remove(target);
            this.targets.splice(index, 1);

            // Spawn particle effect? (TODO)
        }
    }
}
