export class RaceManager {
  constructor(totalLaps = 3) {
    this.totalLaps = totalLaps;
    this.reset();
  }

  reset() {
    this.state = 'menu';
    this.currentLap = 1;
    this.nextCheckpoint = 1;
    this.elapsedTime = 0;
    this.lapStartTime = 0;
    this.lastLapTime = null;
    this.finishTime = null;
    this.previousCheckpoint = 0;
  }

  start() {
    this.state = 'countdown';
    this.currentLap = 1;
    this.nextCheckpoint = 1;
    this.elapsedTime = 0;
    this.lapStartTime = 0;
    this.finishTime = null;
  }

  beginRace() { this.state = 'racing'; }
  pause() { if (this.state === 'racing') this.state = 'paused'; }
  resume() { if (this.state === 'paused') this.state = 'racing'; }

  update(delta) {
    if (this.state === 'racing') this.elapsedTime += delta;
  }

  observeCheckpoint(checkpoint, checkpointCount) {
    if (this.state !== 'racing' || checkpoint !== this.nextCheckpoint) return;
    this.previousCheckpoint = checkpoint;
    this.nextCheckpoint = (checkpoint + 1) % checkpointCount;
  }

  observeStartLine(checkpointCount) {
    if (this.state !== 'racing' || this.nextCheckpoint !== 0) return;
    this.lastLapTime = this.elapsedTime - this.lapStartTime;
    this.lapStartTime = this.elapsedTime;
    if (this.currentLap >= this.totalLaps) {
      this.finishTime = this.elapsedTime;
      this.state = 'finished';
      return;
    }
    this.currentLap += 1;
    this.nextCheckpoint = 1 % checkpointCount;
  }

  snapshot() {
    return { state: this.state, currentLap: this.currentLap, totalLaps: this.totalLaps, elapsedTime: this.elapsedTime, finishTime: this.finishTime };
  }
}
