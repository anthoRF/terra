import { Vector3, Matrix3, Matrix4, SRGBColorSpace } from 'three';

// Rasterizes the same educational meshes without WebGL. The depth buffer and
// perspective-correct UVs retain correct occlusion while rotating the cutaway.
// Rendering runs only when the camera, size, view or selection changes.
export class SoftwareRenderer {
  constructor() {
    this.domElement = document.createElement('canvas');
    this.context = this.domElement.getContext('2d', { alpha: true });
    if (!this.context) throw new Error('Canvas unavailable');
    this.isSoftware = true;
    this.capabilities = { getMaxAnisotropy: () => 1 };
    this.ratio = 1;
    this.geometryCache = new WeakMap();
    this.imageCache = new WeakMap();
  }
  setPixelRatio(ratio) { this.ratio = Math.min(ratio, 1.35); }
  setSize(width, height) {
    this.domElement.width = Math.round(width * this.ratio);
    this.domElement.height = Math.round(height * this.ratio);
    this.domElement.style.width = `${width}px`;
    this.domElement.style.height = `${height}px`;
    this.frame = this.context.createImageData(this.domElement.width, this.domElement.height);
    this.depth = new Float32Array(this.domElement.width * this.domElement.height);
  }
  dispose() { this.domElement.width = 1; this.domElement.height = 1; this.frame = null; this.depth = null; }
  render(scene, camera) {
    if (!this.frame) return;
    const width = this.domElement.width, height = this.domElement.height, pixels = this.frame.data, depth = this.depth;
    pixels.fill(0); depth.fill(0);
    scene.updateMatrixWorld(); camera.updateMatrixWorld();
    const projection = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const light = new Vector3(-0.4, 0.55, 1).normalize(), eye = new Vector3(); camera.getWorldPosition(eye);
    const objects = [];
    scene.traverseVisible(object => { if (object.isMesh && !object.material.isShaderMaterial) objects.push(object); });
    for (const object of objects) {
      const geometry = object.geometry, material = object.material;
      let cached = this.geometryCache.get(geometry);
      if (!cached) {
        const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal'), uv = geometry.getAttribute('uv');
        cached = {
          vertices: Array.from({ length: p.count }, (_, i) => new Vector3(p.getX(i), p.getY(i), p.getZ(i))),
          normals: Array.from({ length: n.count }, (_, i) => new Vector3(n.getX(i), n.getY(i), n.getZ(i))),
          uv: uv ? Array.from({ length: uv.count }, (_, i) => [uv.getX(i), 1 - uv.getY(i)]) : null,
          indices: geometry.index ? geometry.index.array : Array.from({ length: p.count }, (_, i) => i),
        };
        this.geometryCache.set(geometry, cached);
      }
      const normalMatrix = new Matrix3().getNormalMatrix(object.matrixWorld);
      const world = cached.vertices.map(v => v.clone().applyMatrix4(object.matrixWorld));
      const points = world.map((v, i) => {
        const projected = v.clone().applyMatrix4(projection), cameraZ = v.clone().applyMatrix4(camera.matrixWorldInverse).z;
        const normal = cached.normals[i].clone().applyNormalMatrix(normalMatrix);
        if (normal.dot(eye.clone().sub(v)) < 0 && geometry.type !== 'SphereGeometry') normal.negate();
        return { x: (projected.x + 1) * width / 2, y: (1 - projected.y) * height / 2, iz: -1 / cameraZ, light: 0.76 + 0.30 * Math.max(0, normal.dot(light)), u: cached.uv?.[i][0] || 0, v: cached.uv?.[i][1] || 0 };
      });
      const image = material.map?.image;
      let texture = null;
      if (image?.width) {
        texture = this.imageCache.get(image);
        if (!texture) {
          const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
          const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
          texture = { data: context.getImageData(0, 0, image.width, image.height).data, width: image.width, height: image.height };
          this.imageCache.set(image, texture);
        }
      }
      const hex = material.color.getHex(SRGBColorSpace), base = [hex >> 16 & 255, hex >> 8 & 255, hex & 255];
      for (let i = 0; i < cached.indices.length; i += 3) {
        const ia = cached.indices[i], ib = cached.indices[i + 1], ic = cached.indices[i + 2];
        if (geometry.type === 'SphereGeometry') {
          const a = world[ia], normal = new Vector3().crossVectors(world[ib].clone().sub(a), world[ic].clone().sub(a));
          if (normal.dot(eye.clone().sub(a)) <= 0) continue;
        }
        const p = [points[ia], points[ib], points[ic]];
        let area = (p[1].x - p[0].x) * (p[2].y - p[0].y) - (p[1].y - p[0].y) * (p[2].x - p[0].x);
        if (Math.abs(area) < 0.01 || p.some(v => v.iz <= 0)) continue;
        const sign = Math.sign(area); area *= sign;
        const minX = Math.max(0, Math.floor(Math.min(...p.map(v => v.x)))), maxX = Math.min(width - 1, Math.ceil(Math.max(...p.map(v => v.x))));
        const minY = Math.max(0, Math.floor(Math.min(...p.map(v => v.y)))), maxY = Math.min(height - 1, Math.ceil(Math.max(...p.map(v => v.y))));
        const ax = (p[1].y - p[2].y) * sign, ay = (p[2].x - p[1].x) * sign, ac = (p[1].x * p[2].y - p[2].x * p[1].y) * sign;
        const bx = (p[2].y - p[0].y) * sign, by = (p[0].x - p[2].x) * sign, bc = (p[2].x * p[0].y - p[0].x * p[2].y) * sign;
        const cx = (p[0].y - p[1].y) * sign, cy = (p[1].x - p[0].x) * sign, cc = (p[0].x * p[1].y - p[1].x * p[0].y) * sign;
        for (let y = minY; y <= maxY; y++) {
          let wa = ax * (minX + 0.5) + ay * (y + 0.5) + ac, wb = bx * (minX + 0.5) + by * (y + 0.5) + bc, wc = cx * (minX + 0.5) + cy * (y + 0.5) + cc;
          let offset = y * width + minX;
          for (let x = minX; x <= maxX; x++, offset++, wa += ax, wb += bx, wc += cx) {
            if (wa < -0.001 || wb < -0.001 || wc < -0.001) continue;
            const a = wa / area, b = wb / area, c = wc / area, iz = a * p[0].iz + b * p[1].iz + c * p[2].iz;
            if (iz <= depth[offset]) continue;
            let r = base[0], g = base[1], blue = base[2];
            if (texture) {
              const u = (a * p[0].u * p[0].iz + b * p[1].u * p[1].iz + c * p[2].u * p[2].iz) / iz + (material.map.offset?.x || 0);
              const v = (a * p[0].v * p[0].iz + b * p[1].v * p[1].iz + c * p[2].v * p[2].iz) / iz;
              const tx = Math.floor(((u % 1 + 1) % 1) * texture.width), ty = Math.max(0, Math.min(texture.height - 1, Math.floor(v * texture.height)));
              const t = (ty * texture.width + tx) * 4; r = texture.data[t]; g = texture.data[t + 1]; blue = texture.data[t + 2];
            }
            const lighting = a * p[0].light + b * p[1].light + c * p[2].light;
            const pixel = offset * 4; pixels[pixel] = Math.min(255, r * lighting); pixels[pixel + 1] = Math.min(255, g * lighting); pixels[pixel + 2] = Math.min(255, blue * lighting); pixels[pixel + 3] = 255; depth[offset] = iz;
          }
        }
      }
    }
    this.context.putImageData(this.frame, 0, 0);
  }
}
