import { Camera, Euler, Quaternion, Vector3 } from "three";
import { calculateSensitivityByCmPer360 } from "./maths/sensitivity";

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
  public locked = false;
  private minPolarAngle = 0;
  private maxPolarAngle = Math.PI;
  private euler = new Euler(0, 0, 0, "YXZ");
  private mouseSensitivity = calculateSensitivityByCmPer360(25, 800);
  private clickEventQueue: ClickEvent[] = [];
  private mouseDown = false;

  constructor(private camera: Camera, private domElement: HTMLElement) {
    this.domElement.ownerDocument.addEventListener(
      "pointerrawupdate",
      this.onPointerRawEvent.bind(this) as EventListener
    );
    this.domElement.ownerDocument.addEventListener(
      "pointerlockchange",
      this.onPointerLockChange.bind(this) as EventListener
    );
    this.domElement.ownerDocument.addEventListener(
      "pointerdown",
      this.onPointerDownEvent.bind(this)
    );
    this.domElement.ownerDocument.addEventListener(
      "pointerup",
      this.onPointerUpEvent.bind(this)
    );
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  onPointerRawEvent(event: PointerEvent) {
    if (!this.isLocked) return;

    const { movementX, movementY } = event;

    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= movementX * this.mouseSensitivity;
    this.euler.x -= movementY * this.mouseSensitivity;

    this.euler.x = Math.max(
      PI_2 - this.maxPolarAngle,
      Math.min(PI_2 - this.minPolarAngle, this.euler.x)
    );

    this.camera.quaternion.setFromEuler(this.euler);
  }

  onPointerDownEvent(event: PointerEvent) {
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
  }

  lock() {
    this.domElement.requestPointerLock({
      unadjustedMovement: true,
    });
  }

  unlock() {
    this.domElement.ownerDocument.exitPointerLock();
  }

  setMouseSensitivity(cmPer360: number, dpi: number) {
    this.mouseSensitivity = calculateSensitivityByCmPer360(cmPer360, dpi);
  }
}
