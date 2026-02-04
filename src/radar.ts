import * as THREE from 'three';

export class Radar {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private player: THREE.Camera;
    private targets: THREE.Object3D[];
    private size = 200;
    private range = 40;

    constructor(playerCamera: THREE.Camera, targets: THREE.Object3D[]) {
        this.player = playerCamera;
        this.targets = targets;

        // Create Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.id = 'radar-canvas';

        // Style properties
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '40px'; // Align with padding
        this.canvas.style.left = '40px';
        this.canvas.style.borderRadius = '50%';
        this.canvas.style.border = '2px solid #00ffff';
        this.canvas.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
        this.canvas.style.background = 'radial-gradient(circle, rgba(0,20,40,0.9) 0%, rgba(0,10,20,0.9) 100%)';
        this.canvas.style.opacity = '0.8';
        this.canvas.style.zIndex = '50';

        document.getElementById('ui-layer')?.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d')!;
    }

    public update() {
        // Clear
        this.ctx.clearRect(0, 0, this.size, this.size);

        const center = this.size / 2;

        // Draw Grid Lines
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // Circles
        for (let r = 1; r <= 3; r++) {
            this.ctx.arc(center, center, (this.size / 2) * (r / 3), 0, Math.PI * 2);
        }
        // Lines
        this.ctx.moveTo(0, center); this.ctx.lineTo(this.size, center);
        this.ctx.moveTo(center, 0); this.ctx.lineTo(center, this.size);
        this.ctx.stroke();

        // Radar Sweep Animation
        const time = Date.now() * 0.002;
        this.ctx.save();
        this.ctx.translate(center, center);
        this.ctx.rotate(time);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, this.size / 2, 0, 0.5); // Pie slice
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.fill();
        this.ctx.restore();

        // Draw Player (Triangle)
        this.ctx.save();
        this.ctx.translate(center, center);
        // Player is always facing "Up" on the radar, so we rotate the WORLD around the player
        // Actually, simple FPS radars often keep North up, OR Player Up.
        // Let's do Player Fixed (Center) + World Rotates.
        // But `player.rotation.y` is our yaw.

        this.ctx.fillStyle = '#00ffff';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -5);
        this.ctx.lineTo(4, 5);
        this.ctx.lineTo(-4, 5);
        this.ctx.fill();
        this.ctx.restore();

        // Draw Targets
        this.targets.forEach(target => {
            // Relative position
            const dx = target.position.x - this.player.position.x;
            const dz = target.position.z - this.player.position.z;

            // Rotate by player yaw to align with radar "up"
            // Player rotation Y is counter-clockwise usually in Three.js?
            // We need to rotate OPPOISITE to player rotation to keep player facing up
            // Player usually looks down -Z. 

            // Simplified: Just position relative to player, no rotation (North-up radar?)
            // User asked for "direction", usually implies rotating radar.

            // Actually simpler: just use rotation.y
            // Note: Three.js rotation.y is in radians.

            const angle = -this.player.rotation.y; // Invert for canvas

            const rx = dx * Math.cos(angle) - dz * Math.sin(angle);
            const rz = dx * Math.sin(angle) + dz * Math.cos(angle);

            // Map to canvas
            // rz corresponds to Up/Down on canvas (Y), rx to Left/Right (X)
            // Canvas Y is down, so -rz (forward) should be Up (-Y)

            const mapX = center + (rx / this.range) * (this.size / 2);
            const mapY = center - (rz / this.range) * (this.size / 2); // Flip Z

            // Check bounds (circular)
            const dist = Math.sqrt(Math.pow(mapX - center, 2) + Math.pow(mapY - center, 2));
            if (dist < this.size / 2) {
                this.ctx.fillStyle = '#ff0055';
                if (dist > (this.size / 2) - 5) this.ctx.globalAlpha = 0.5;
                else this.ctx.globalAlpha = 1;

                this.ctx.beginPath();
                this.ctx.arc(mapX, mapY, 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        });
    }
}
