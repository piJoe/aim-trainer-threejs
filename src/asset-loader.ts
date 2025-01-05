import {
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Texture,
  WebGLRenderer,
} from "three";
import { loadTexture } from "./texture";

export enum TEXTURE_IDS {
  ENV_AUTOSHOP = "env_autoshop",
  DARK_FLOOR = "dark_floor",
  DARK_WALL = "dark_wall",
}

export enum MATERIAL_IDS {
  WALL = "wall",
  FLOOR = "floor",
  TARGET = "target",
  HP_BAR_BG = "hp_bg",
  HP_BAR_FG = "hp_fg",
}

export const TEXTURES = new Map<TEXTURE_IDS, Texture>();
export const MATERIALS = new Map<MATERIAL_IDS, Material>();

async function createMaterials() {
  MATERIALS.set(
    MATERIAL_IDS.WALL,
    new MeshStandardMaterial({
      color: 0xdddddd,
      map: TEXTURES.get(TEXTURE_IDS.DARK_WALL),
    })
  );

  MATERIALS.set(
    MATERIAL_IDS.FLOOR,
    new MeshStandardMaterial({
      color: 0x888888,
      map: TEXTURES.get(TEXTURE_IDS.DARK_FLOOR),
    })
  );

  MATERIALS.set(
    MATERIAL_IDS.TARGET,
    new MeshStandardMaterial({
      color: 0x851066,
      // color: 0x00ffc6,
      // color: 0xff007a,
      roughness: 0.3,
      metalness: 0.01,
    })
  );

  MATERIALS.set(
    MATERIAL_IDS.HP_BAR_BG,
    new MeshBasicMaterial({
      color: 0x3c7c6e,
    })
  );

  MATERIALS.set(
    MATERIAL_IDS.HP_BAR_FG,
    new MeshBasicMaterial({
      color: 0x00ffc6,
    })
  );
}

async function loadTextures(renderer: WebGLRenderer) {
  const promises = [
    loadTexture(
      TEXTURE_IDS.ENV_AUTOSHOP,
      "/assets/textures/env/metro.exr",
      {},
      renderer
    ),
    loadTexture(TEXTURE_IDS.DARK_FLOOR, "assets/textures/dark/texture_04.png"),
    loadTexture(TEXTURE_IDS.DARK_WALL, "assets/textures/dark/texture_13.png"),
  ];

  const textureEntries = await Promise.all(promises);
  textureEntries.forEach((e) => {
    TEXTURES.set(e.id as TEXTURE_IDS, e.texture);
  });
}

export async function loadAssets(renderer: WebGLRenderer) {
  // load textures
  await loadTextures(renderer);

  // then setup materials
  await createMaterials();

  // await new Promise<void>((res) => {
  //   window.setTimeout(() => {
  //     res();
  //   }, 6000);
  // });
}
