import { Camera, AudioListener, Audio, AudioLoader } from "three";

import assetsAudioHit from "assets/audio/hit.ogg?url";
import assetsAudioMiss from "assets/audio/miss.ogg?url";
import assetsAudioKill from "assets/audio/kill_confirm.ogg?url";
import { userAudioSettings } from "src/ts/stores/user-settings";

export class AudioHandler {
  listener = new AudioListener();
  miss: Audio;
  hit: Audio;
  kill: Audio;

  constructor() {
    this.miss = new Audio(this.listener);
    this.hit = new Audio(this.listener);
    this.kill = new Audio(this.listener);

    userAudioSettings.subscribe((audioSettings) => {
      this.miss.setVolume(audioSettings.volumeMiss);
      this.hit.setVolume(audioSettings.volumeHit);
      this.kill.setVolume(audioSettings.volumeKill);
    });

    const audioLoader = new AudioLoader();
    audioLoader.load(assetsAudioMiss, (buffer) => {
      this.miss.setBuffer(buffer);
    });

    audioLoader.load(assetsAudioHit, (buffer) => {
      this.hit.setBuffer(buffer);
    });

    // TODO: replace with true free sound or make proper attribution file
    // frozen wind chime ding by ChrisReierson -- https://freesound.org/s/383979/ -- License: Attribution 4.0
    audioLoader.load(assetsAudioKill, (buffer) => {
      this.kill.setBuffer(buffer);
    });
  }

  setCamera(camera: Camera) {
    camera.add(this.listener);
  }

  playMiss() {
    this.miss.stop();
    this.miss.play();
  }

  playHit() {
    this.hit.stop();
    this.hit.play();
  }

  playKill() {
    this.kill.stop();
    this.kill.play();
  }
}
