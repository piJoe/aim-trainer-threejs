import {
  EquirectangularReflectionMapping,
  PMREMGenerator,
  RepeatWrapping,
  Texture,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { EXRLoader } from "three/addons";

const loader = new TextureLoader();
const exrLoader = new EXRLoader();

interface TextureEntry {
  id: string;
  texture: Texture;
}

export async function loadTexture(
  id: string,
  url: string,
  params: Partial<Texture> = {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
  },
  renderer?: WebGLRenderer
): Promise<TextureEntry> {
  return new Promise((resolve, reject) => {
    // handle env maps differently
    if (url.endsWith(".exr") && renderer) {
      const pmremGen = new PMREMGenerator(renderer);
      exrLoader.load(
        url,
        (texture) => {
          texture.mapping = EquirectangularReflectionMapping;
          Object.assign(texture, params);
          const envTex = pmremGen.fromEquirectangular(texture).texture;
          pmremGen.dispose();
          resolve({ id, texture: envTex });
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
      return;
    }

    loader.load(
      url,
      (texture) => {
        Object.assign(texture, params);
        resolve({ id, texture });
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}
