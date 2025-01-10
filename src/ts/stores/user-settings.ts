import { persistentMap } from "@nanostores/persistent";
import { calculateSensitivityByCmPer360 } from "src/ts/maths/sensitivity";

interface UserMouseSettings {
  cmPer360: number;
  dpi: number;
  sensitivity: number;
}

interface UserAudioSettings {
  volumeMiss: number;
  volumeHit: number;
  volumeKill: number;
}

export const userMouseSettings = persistentMap<UserMouseSettings>(
  "mouseSettings:",
  {
    cmPer360: 35,
    dpi: 800,
    sensitivity: calculateSensitivityByCmPer360(35, 800),
  },
  {
    encode(value) {
      return JSON.stringify(value);
    },
    decode(value) {
      return JSON.parse(value);
    },
  }
);

export const userAudioSettings = persistentMap<UserAudioSettings>(
  "audioSettings:",
  {
    volumeMiss: 0.1,
    volumeHit: 0.2,
    volumeKill: 0.2,
  },
  {
    encode(value) {
      return JSON.stringify(value);
    },
    decode(value) {
      return JSON.parse(value);
    },
  }
);
