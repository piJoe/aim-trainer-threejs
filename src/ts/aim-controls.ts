import m from "mithril";
import { userMouseSettingsSensC } from "src/ts/stores/user-settings";
import { Camera, Euler, Quaternion, Vector3 } from "three";

const PI_2 = Math.PI / 2;

export enum ClickEventType {
  HOLD = "hold",
  RELEASE = "release",
  CLICK = "click",
}

interface ClickEvent {
  cameraPosition: Vector3;
  cameraQuaternion: Quaternion;
  eventType: ClickEventType;
}

export class AimControls {
  private camera?: Camera;
  public locked = false;
  private minPolarAngle = 0;
  private maxPolarAngle = Math.PI;
  private euler = new Euler(0, 0, 0, "YXZ");
  private mouseSensitivity = userMouseSettingsSensC.get();
  private pointerUpdateEvent: EventListener;
  private useRegularPointerEvents = false;
  private mouseMoveLast5Ticks: number[] = [];
  private clickEventQueue: ClickEvent[] = [];
  private mouseDown = false;

  constructor(private domElement: HTMLElement) {
    document.addEventListener(
      "pointerlockchange",
      this.onPointerLockChange.bind(this) as EventListener
    );
    document.addEventListener(
      "pointerdown",
      this.onPointerDownEvent.bind(this)
    );
    document.addEventListener("pointerup", this.onPointerUpEvent.bind(this));

    this.pointerUpdateEvent = this.onPointerUpdateEvent.bind(
      this
    ) as EventListener;

    if (this.useRegularPointerEvents) {
      document.addEventListener("pointermove", this.pointerUpdateEvent);
    } else {
      document.addEventListener("pointerrawupdate", this.pointerUpdateEvent);
    }

    userMouseSettingsSensC.subscribe((sens) => {
      this.mouseSensitivity = sens;
    });
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  onPointerUpdateEvent(event: PointerEvent) {
    const { movementX, movementY } = event;

    // check if mouse movement (movementX/Y non zero) gets picked up by the event handler (firefox 140 bug)
    if (!this.useRegularPointerEvents) {
      this.mouseMoveLast5Ticks.push(Math.abs(movementX) + Math.abs(movementY));
      if (this.mouseMoveLast5Ticks.length > 5) {
        this.mouseMoveLast5Ticks.shift();
        const calcTotalMove = this.mouseMoveLast5Ticks.reduce(
          (total, move) => (total += move),
          0
        );
        if (calcTotalMove < 1) {
          console.log("swichting to use legacy mouse events");
          // zero movement detected in lasts 5 events, auto-change to use regular input events
          this.useRegularPointerEvents = true;

          document.removeEventListener(
            "pointerrawupdate",
            this.pointerUpdateEvent
          );
          document.addEventListener("pointermove", this.pointerUpdateEvent);
        }
      }
    }

    if (!this.isLocked || !this.camera) return;

    this.euler.setFromQuaternion(this.camera?.quaternion);

    this.euler.y -= movementX * this.mouseSensitivity;
    this.euler.x -= movementY * this.mouseSensitivity;

    this.euler.x = Math.max(
      PI_2 - this.maxPolarAngle,
      Math.min(PI_2 - this.minPolarAngle, this.euler.x)
    );

    this.camera?.quaternion.setFromEuler(this.euler);
  }

  onPointerDownEvent(event: PointerEvent) {
    if (!this.camera) return;

    const { buttons } = event;
    if (buttons === 1) {
      if (!this.mouseDown) {
        this.clickEventQueue.push({
          cameraPosition: this.camera.position.clone(),
          cameraQuaternion: this.camera.quaternion.clone(),
          eventType: ClickEventType.CLICK,
        });
      }
      this.mouseDown = true;
      // this.fireEventQueue.push(FireEvents.HOLD);
    }
  }
  onPointerUpEvent(event: PointerEvent) {
    if (!this.camera) return;

    const { buttons } = event;
    if (buttons === 0) {
      this.mouseDown = false;
      this.clickEventQueue.push({
        cameraPosition: this.camera.position.clone(),
        cameraQuaternion: this.camera.quaternion.clone(),
        eventType: ClickEventType.RELEASE,
      });
    }
  }

  get isLocked() {
    return this.locked;
  }

  hasClickEvents() {
    return this.clickEventQueue.length > 0;
  }

  nextClickEvent() {
    return this.clickEventQueue.shift();
  }

  onPointerLockChange() {
    this.locked = document.pointerLockElement === this.domElement;
    m.redraw();
  }

  lock() {
    this.domElement.requestPointerLock({
      unadjustedMovement: true,
    });
  }

  unlock() {
    document.exitPointerLock();
  }
}
