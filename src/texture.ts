import { RepeatWrapping, Texture, TextureLoader } from "three";

const loader = new TextureLoader();
const textures = new Map<string, Texture>();

export async function loadTexture(url: string): Promise<Texture> {
  if (textures.has(url)) {
    return textures.get(url)!;
  }

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        textures.set(url, texture);
        resolve(texture);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}
