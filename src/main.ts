import './style.css';
import * as THREE from 'three';
import { createScene } from './scene';
import { PlayerController } from './player';

import { Weapon } from './weapon';
import { World } from './world';

import { Radar } from './radar';

const { scene, camera, composer } = createScene();

const player = new PlayerController(camera, document.body);
scene.add(player.controls.object);

const world = new World(scene);
const weapon = new Weapon(camera);
const radar = new Radar(camera, world.targets);

let score = 0;
const scoreEl = document.getElementById('score');

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  player.update(delta);
  world.update(delta);

  // Update weapon targets
  weapon.targets = world.targets;
  weapon.update(scene, delta);

  radar.update();

  // Cleanup hit targets
  for (let i = world.targets.length - 1; i >= 0; i--) {
    if (world.targets[i].userData.hit) {
      world.removeTarget(world.targets[i]);
      score += 100;
      if (scoreEl) scoreEl.innerText = `${score}`;
    }
  }

  composer.render();
}


animate();

