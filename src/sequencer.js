/* @flow */
import type { Track, ToneLoop } from "./types";

import Tone from "tone";


const velocities = [
  1, .5, .75, .5,
  1, .5, .75, .5,
  1, .5, .75, .5,
  1, .5, .75, .5,
];

export function create(tracks: Track[]): ToneLoop {
  const loop = new Tone.Sequence(
    loopProcessor(tracks),
    new Array(16).fill(0).map((_, i) => i),
    "16n"
  );

  Tone.Transport.bpm.value = 120;
  Tone.Transport.start();

  return loop;
}

export function update(loop: ToneLoop, tracks: Track[]): ToneLoop {
  loop.callback = loopProcessor(tracks);
  return loop;
}

function loopProcessor(tracks) {
  const urls = tracks.reduce((acc, track) => {
    return {...acc, [track.name]: track.sample};
  }, {});

  const keys = new Tone.MultiPlayer({urls}).toMaster();

  return (time, index) => {
    tracks.forEach(({name, vol, muted, beats}) => {
      if (beats[index]) {
        // XXX "1n" should be set via some "resolution" track prop
        keys.start(name, time, 0, "1n", 0, muted ? 0 : velocities[index] * vol);
      }
    });
  };
}