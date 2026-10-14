import * as THREE from 'three';

export class Track {
  constructor(scene) {
    this.innerRadius = 13;
    this.outerRadius = 27;
    this.checkpointCount = 8;
    this.createMeshes(scene);
  }

  createMeshes(scene) {
    const grass = new THREE.Mesh(new THREE.CircleGeometry(46, 64), new THREE.MeshStandardMaterial({ color: 0x273d36, roughness: 1 }));
    grass.rotation.x = -Math.PI / 2;
    scene.add(grass);
    const road = new THREE.Mesh(new THREE.RingGeometry(this.innerRadius, this.outerRadius, 96), new THREE.MeshStandardMaterial({ color: 0x30383a, roughness: .95 }));
    road.rotation.x = -Math.PI / 2;
    road.position.y = .02;
    scene.add(road);
    const innerLine = new THREE.Mesh(new THREE.RingGeometry(this.innerRadius - .12, this.innerRadius + .12, 96), new THREE.MeshBasicMaterial({ color: 0xef8354 }));
    innerLine.rotation.x = -Math.PI / 2;
    innerLine.position.y = .04;
    scene.add(innerLine);
    const outerLine = new THREE.Mesh(new THREE.RingGeometry(this.outerRadius - .12, this.outerRadius + .12, 96), new THREE.MeshBasicMaterial({ color: 0xf5f2eb }));
    outerLine.rotation.x = -Math.PI / 2;
    outerLine.position.y = .04;
    scene.add(outerLine);
    this.addStartGrid(scene);
    this.addBarriers(scene);
  }

  addStartGrid(scene) {
    for (let index = 0; index < 6; index += 1) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(2.4, .025, .5), new THREE.MeshBasicMaterial({ color: index % 2 ? 0x101820 : 0xf5f2eb }));
      marker.position.set((index % 2 ? -1.4 : 1.4), .06, 22 - Math.floor(index / 2) * 1.3);
      scene.add(marker);
    }
  }

  addBarriers(scene) {
    const material = new THREE.MeshStandardMaterial({ color: 0xd85d48, roughness: .65 });
    for (let index = 0; index < 48; index += 1) {
      const angle = index / 48 * Math.PI * 2;
      for (const radius of [this.innerRadius - .7, this.outerRadius + .7]) {
        const barrier = new THREE.Mesh(new THREE.BoxGeometry(1.2, .65, .6), material);
        barrier.position.set(Math.sin(angle) * radius, .32, Math.cos(angle) * radius);
        barrier.rotation.y = angle;
        scene.add(barrier);
      }
    }
  }

  isOnRoad(position) {
    const radius = Math.hypot(position.x, position.z);
    return radius > this.innerRadius && radius < this.outerRadius;
  }

  checkpointFor(position) {
    let angle = Math.atan2(position.x, position.z);
    if (angle < 0) angle += Math.PI * 2;
    return Math.floor(angle / (Math.PI * 2) * this.checkpointCount) % this.checkpointCount;
  }

  clampToTrack(position) {
    const radius = Math.hypot(position.x, position.z);
    if (radius < this.innerRadius - 1 || radius > this.outerRadius + 1) {
      const safeRadius = THREE.MathUtils.clamp(radius, this.innerRadius + .8, this.outerRadius - .8);
      const scale = safeRadius / Math.max(radius, .001);
      position.x *= scale;
      position.z *= scale;
    }
  }
}
