import { describe, expect, it } from 'vitest';
import { RaceManager } from './RaceManager.js';

describe('RaceManager', () => {
  it('requires checkpoints in order before completing a lap', () => {
    const race = new RaceManager(2);
    race.start();
    race.beginRace();

    race.update(12);
    race.observeCheckpoint(2, 4);
    race.observeStartLine(4);
    expect(race.currentLap).toBe(1);

    race.observeCheckpoint(1, 4);
    race.observeCheckpoint(2, 4);
    race.observeCheckpoint(3, 4);
    race.observeStartLine(4);
    expect(race.currentLap).toBe(2);
    expect(race.lastLapTime).toBe(12);
  });

  it('finishes after the configured number of valid laps', () => {
    const race = new RaceManager(1);
    race.start();
    race.beginRace();
    race.observeCheckpoint(1, 2);
    race.observeStartLine(2);
    expect(race.state).toBe('finished');
    expect(race.finishTime).toBe(0);
  });
});