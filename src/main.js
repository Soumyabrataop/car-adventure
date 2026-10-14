import * as THREE from 'three';
import './style.css';
import { InputController } from './game/InputController.js';
import { Vehicle } from './game/Vehicle.js';
import { Track } from './game/Track.js';
import { RaceManager } from './game/RaceManager.js';

const canvas = document.querySelector('#game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101820);
scene.fog = new THREE.Fog(0x101820, 42, 90);
const camera = new THREE.PerspectiveCamera(52, 1, .1, 150);
const clock = new THREE.Clock();
const input = new InputController();
const track = new Track(scene);
const vehicle = new Vehicle(scene);
const race = new RaceManager(3);
const fixedStep = 1 / 60;
let accumulator = 0;
let countdown = 3;
let countdownElapsed = 0;
let lastCheckpoint = 0;

scene.add(new THREE.HemisphereLight(0xb6d1d4, 0x16211e, 2.2));
const sun = new THREE.DirectionalLight(0xffd3a8, 2.7);
sun.position.set(-18, 34, 12);
sun.castShadow = true;
scene.add(sun);

const hud = document.querySelector('#hud');
const menu = document.querySelector('#menu');
const pausePanel = document.querySelector('#pause-panel');
const finishPanel = document.querySelector('#finish-panel');
const touchControls = document.querySelector('#touch-controls');
const lapValue = document.querySelector('#lap-value');
const speedValue = document.querySelector('#speed-value');
const timerValue = document.querySelector('#timer-value');
const finishTime = document.querySelector('#finish-time');

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${remainder}`;
}

function showRace() {
  menu.hidden = true;
  pausePanel.hidden = true;
  finishPanel.hidden = true;
  hud.hidden = false;
  touchControls.hidden = false;
}

function resetRace() {
  race.reset();
  vehicle.reset();
  countdown = 3;
  countdownElapsed = 0;
  lastCheckpoint = 0;
  showRace();
  race.start();
}

function startRace() {
  resetRace();
}

document.querySelector('#start-button').addEventListener('click', startRace);
document.querySelector('#resume-button').addEventListener('click', () => { race.resume(); pausePanel.hidden = true; });
document.querySelector('#restart-button').addEventListener('click', resetRace);
document.querySelector('#finish-restart-button').addEventListener('click', resetRace);
document.querySelector('#pause-button').addEventListener('click', () => { if (race.state === 'racing') { race.pause(); pausePanel.hidden = false; } });
window.addEventListener('resize', resize);
resize();

function update(delta) {
  const controls = input.sample();
  if (controls.pausePressed && race.state === 'racing') { race.pause(); pausePanel.hidden = false; }
  else if (controls.pausePressed && race.state === 'paused') { race.resume(); pausePanel.hidden = true; }
  if (controls.resetPressed && ['racing', 'paused'].includes(race.state)) vehicle.reset();
  if (race.state === 'countdown') {
    countdownElapsed += delta;
    if (countdownElapsed >= countdown) race.beginRace();
  }
  if (race.state === 'racing') {
    vehicle.update(controls, delta, track.isOnRoad(vehicle.position));
    track.clampToTrack(vehicle.position);
    const checkpoint = track.checkpointFor(vehicle.position);
    if (checkpoint !== lastCheckpoint) {
      if (checkpoint === 0) race.observeStartLine(track.checkpointCount);
      else race.observeCheckpoint(checkpoint, track.checkpointCount);
      lastCheckpoint = checkpoint;
    }
    race.update(delta);
  }
  lapValue.textContent = `Lap ${Math.min(race.currentLap, race.totalLaps)} / ${race.totalLaps}`;
  speedValue.textContent = Math.round(vehicle.speed).toString();
  timerValue.textContent = formatTime(race.elapsedTime);
  if (race.state === 'finished') {
    finishPanel.hidden = false;
    finishTime.textContent = formatTime(race.finishTime);
  }
}

function render() {
  const follow = new THREE.Vector3(0, 7.5, -11).applyAxisAngle(new THREE.Vector3(0, 1, 0), vehicle.rotation);
  const target = vehicle.position.clone().add(new THREE.Vector3(0, .7, 0));
  camera.position.lerp(vehicle.position.clone().add(follow), .1);
  camera.lookAt(target);
  renderer.render(scene, camera);
}

function frame() {
  const delta = Math.min(clock.getDelta(), .1);
  accumulator += delta;
  while (accumulator >= fixedStep) {
    update(fixedStep);
    accumulator -= fixedStep;
  }
  render();
  requestAnimationFrame(frame);
}

frame();
