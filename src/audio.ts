import { Camera, AudioListener, Audio, AudioLoader } from "three";

export class AudioHandler {
  listener = new AudioListener();
  miss: Audio;
  hit: Audio;
  kill: Audio;

  constructor() {
    this.miss = new Audio(this.listener);
    this.hit = new Audio(this.listener);
    this.kill = new Audio(this.listener);

    const audioLoader = new AudioLoader();
    audioLoader.load("/assets/audio/miss.ogg", (buffer) => {
      this.miss.setBuffer(buffer);
      this.miss.setVolume(0.1);
    });

    audioLoader.load("/assets/audio/hit.ogg", (buffer) => {
      this.hit.setBuffer(buffer);
      this.hit.setVolume(0.2);
    });

    // TODO: replace with true free sound or make proper attribution file
    // frozen wind chime ding by ChrisReierson -- https://freesound.org/s/383979/ -- License: Attribution 4.0
    audioLoader.load("/assets/audio/kill_confirm.ogg", (buffer) => {
      this.kill.setBuffer(buffer);
      this.kill.setVolume(0.3);
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
