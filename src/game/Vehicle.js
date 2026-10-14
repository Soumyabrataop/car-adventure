import * as THREE from 'three';

export const vehicleTuning = {
  maxSpeed: 28,
  reverseSpeed: 8,
  acceleration: 18,
  braking: 24,
  steeringRate: 2.25,
  rollingDrag: 1.7,
  lateralGrip: 8
};

export class Vehicle {
  constructor(scene) {
    this.position = new THREE.Vector3(0, 0.55, 19);
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.mesh = this.createMesh();
    scene.add(this.mesh);
  }

  createMesh() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, .55, 3.5), new THREE.MeshStandardMaterial({ color: 0xef8354, roughness: .42, metalness: .15 }));
    body.position.y = .45;
    group.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.35, .45, 1.35), new THREE.MeshStandardMaterial({ color: 0x162c38, roughness: .2, metalness: .5 }));
    cabin.position.set(0, .88, -.25);
    group.add(cabin);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111417, roughness: .85 });
    for (const x of [-.98, .98]) for (const z of [-1.1, 1.1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .24, 16), wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, .3, z);
      group.add(wheel);
    }
    return group;
  }

  reset(position = new THREE.Vector3(0, 0.55, 19), rotation = 0) {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.rotation = rotation;
    this.syncMesh();
  }

  update(input, delta, onRoad) {
    const forward = new THREE.Vector3(Math.sin(this.rotation), 0, Math.cos(this.rotation));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);
    const forwardSpeed = this.velocity.dot(forward);
    const acceleration = onRoad ? vehicleTuning.acceleration : vehicleTuning.acceleration * .35;
    const grip = onRoad ? vehicleTuning.lateralGrip : 2.2;
    this.velocity.addScaledVector(forward, (input.throttle * acceleration - input.brake * vehicleTuning.braking) * delta);
    const speedRatio = Math.min(Math.abs(forwardSpeed) / vehicleTuning.maxSpeed, 1);
    this.rotation += input.steering * vehicleTuning.steeringRate * (0.2 + speedRatio) * delta * (forwardSpeed >= -.1 ? 1 : -1);
    const lateralSpeed = this.velocity.dot(right);
    this.velocity.addScaledVector(right, -lateralSpeed * Math.min(grip * delta, 1));
    this.velocity.multiplyScalar(Math.max(0, 1 - vehicleTuning.rollingDrag * delta));
    const maxSpeed = forwardSpeed < 0 ? vehicleTuning.reverseSpeed : vehicleTuning.maxSpeed;
    const clampedForward = THREE.MathUtils.clamp(this.velocity.dot(forward), -vehicleTuning.reverseSpeed, maxSpeed);
    this.velocity.addScaledVector(forward, clampedForward - this.velocity.dot(forward));
    this.position.addScaledVector(this.velocity, delta);
    this.position.y = .55;
    this.syncMesh();
  }

  syncMesh() {
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
  }

  get speed() { return this.velocity.length() * 3.6; }
}
