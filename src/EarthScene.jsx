import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ITEMS } from '../shared/content.js';
import { SoftwareRenderer } from './SoftwareRenderer';

const interiorIds = ['crust', 'mantle', 'core'];
const surfaceIds = ['atmosphere', 'geosphere', 'hydrosphere', 'biosphere'];

export default function EarthScene({ view, selected, onSelect, resetKey, cameraAction, interactive = false, onInteractionChange, onFailure }) {
  const host = useRef(null), state = useRef(null), props = useRef({ view, selected, onSelect, onFailure, interactive, onInteractionChange });
  props.current = { view, selected, onSelect, onFailure, interactive, onInteractionChange };
  const [labels, setLabels] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = host.current;
    let renderer, disposed = false, frame, observer;
    const geometries = [], materials = [], textures = [];
    try {
      const canvas = document.createElement('canvas');
      let context = null;
      try { context = canvas.getContext('webgl2', { antialias: true, alpha: true, powerPreference: 'low-power' }); } catch { /* Software renderer below. */ }
      renderer = context ? new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: true, powerPreference: 'low-power' }) : new SoftwareRenderer();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.domElement.setAttribute('aria-label', 'Modelo tridimensional de la Tierra. Usa las etiquetas para seleccionar una capa.');
      renderer.domElement.setAttribute('role', 'img');
      renderer.domElement.setAttribute('aria-hidden', 'true');
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0.65, 0.85, 6.2);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false; controls.enableDamping = !renderer.isSoftware; controls.dampingFactor = 0.12;
      controls.enableZoom = false; controls.minDistance = 5.6; controls.maxDistance = 8.1;
      controls.minPolarAngle = 0.88; controls.maxPolarAngle = 1.85;
      controls.target.set(0, 0.02, 0);
      controls.rotateSpeed = 0.42; controls.zoomSpeed = 0.65;
      // Wheel zoom is enabled only after intentional interaction; normal page scroll remains available.
      renderer.domElement.style.touchAction = 'pan-y';
      controls.touches.ONE = THREE.TOUCH.PAN;
      scene.add(new THREE.AmbientLight(0xcbd9f4, 2.15));
      const sun = new THREE.DirectionalLight(0xffeed8, 3.0); sun.position.set(-3.5, 5, 6); scene.add(sun);
      const rim = new THREE.DirectionalLight(0x729ecc, 1.0); rim.position.set(4, -1, 0); scene.add(rim);
      const interior = new THREE.Group(), surface = new THREE.Group(); scene.add(interior, surface);
      const layerMeshes = [];
      const loader = new THREE.TextureLoader();
      const map = loader.load('/assets/earth-day.jpg', () => {
        if (disposed) return;
        // Adapt the ocean color for legibility; preserve the source coastline.
        const paint = document.createElement('canvas'); paint.width = map.image.width; paint.height = map.image.height;
        const context = paint.getContext('2d'); context.drawImage(map.image, 0, 0);
        const pixels = context.getImageData(0, 0, paint.width, paint.height);
        for (let i = 0; i < pixels.data.length; i += 4) {
          const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
          if (b > r * 1.3 && b > g * 1.12 && r + g + b < 190) {
            pixels.data[i] = 57 + b * 0.17; pixels.data[i + 1] = 120 + b * 0.22; pixels.data[i + 2] = 152 + b * 0.30;
          }
        }
        context.putImageData(pixels, 0, 0); map.image = paint; map.needsUpdate = true;
        needRender = true; state.current?.invalidate(); setReady(true);
      }, undefined, () => { if (!disposed) props.current.onFailure('No se pudo cargar la textura. La vista ilustrada conserva todas las actividades.'); });
      map.colorSpace = THREE.SRGBColorSpace; map.offset.x = 0.15; map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); textures.push(map);
      const bump = loader.load('/assets/earth-elevation.jpg', () => { needRender = true; state.current?.invalidate(); }); bump.wrapS = THREE.RepeatWrapping; bump.offset.x = 0.15; textures.push(bump);
      function mesh(geometry, material, id, group) {
        geometries.push(geometry);
        const object = new THREE.Mesh(geometry, material); object.userData.layer = id; group.add(object); layerMeshes.push(object); return object;
      }
      function material(color, extra = {}) { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0.02, side: THREE.DoubleSide, ...extra }); materials.push(m); return m; }
      const earth = material('#f4f0e6', { map, bumpMap: bump, bumpScale: 0.019, roughness: 0.88 });
      const segments = renderer.isSoftware ? 44 : 96, rows = renderer.isSoftware ? 28 : 64;
      mesh(new THREE.SphereGeometry(1.82, segments, rows), earth, 'geosphere', surface);
      const partialGeometry = (radius, horizontal, vertical) => {
        const geometry = new THREE.SphereGeometry(radius, horizontal, vertical, Math.PI, Math.PI * 1.5);
        const uv = geometry.getAttribute('uv');
        for (let i = 0; i < uv.count; i++) uv.setX(i, 0.5 + uv.getX(i) * 0.75);
        return geometry;
      };
      map.wrapS = THREE.RepeatWrapping;
      mesh(partialGeometry(1.82, segments, rows), earth, 'crust', interior);
      const crust = material('#9d724b'), mantle = material('#d66b38'), outer = material('#e8a43a'), inner = material('#f5d977', { emissive: '#6b410b', emissiveIntensity: 0.11 });
      const layerDefs = [{ id: 'crust', outer: 1.82, inner: 1.755, mat: crust }, { id: 'mantle', outer: 1.755, inner: 0.97, mat: mantle }, { id: 'core', outer: 0.97, inner: 0.47, mat: outer }];
      for (const layer of layerDefs) {
        if (layer.id !== 'crust') mesh(partialGeometry(layer.outer, renderer.isSoftware ? 32 : 80, renderer.isSoftware ? 20 : 48), layer.mat, layer.id, interior);
        for (const phi of [Math.PI / 2, Math.PI]) {
          const cut = mesh(new THREE.RingGeometry(layer.inner, layer.outer, 100, 1, -Math.PI / 2, Math.PI), layer.mat, layer.id, interior);
          const radial = new THREE.Vector3(-Math.cos(phi), 0, Math.sin(phi)), y = new THREE.Vector3(0, 1, 0), normal = new THREE.Vector3().crossVectors(radial, y);
          cut.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(radial, y, normal));
        }
      }
      mesh(new THREE.SphereGeometry(0.47, renderer.isSoftware ? 48 : 64, renderer.isSoftware ? 32 : 48), inner, 'core', interior);
      const haloMat = new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color('#6291b0') } },
        vertexShader: 'varying vec3 vNormal; varying vec3 vPosition; void main(){ vNormal=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.0); vPosition=p.xyz; gl_Position=projectionMatrix*p; }',
        fragmentShader: 'uniform vec3 color; varying vec3 vNormal; varying vec3 vPosition; void main(){ float a=pow(1.0-abs(dot(normalize(vNormal),normalize(-vPosition))),3.0); gl_FragColor=vec4(color,a*0.2); }',
        side: THREE.FrontSide, transparent: true, depthWrite: false,
      }); materials.push(haloMat);
      const haloGeometry = new THREE.SphereGeometry(1.86, 72, 48); geometries.push(haloGeometry);
      surface.add(new THREE.Mesh(haloGeometry, haloMat));
      const anchors = {
        crust: new THREE.Vector3(1.05, 1.47, 0), mantle: new THREE.Vector3(1.37, 0.54, 0), core: new THREE.Vector3(0.56, -0.22, 0),
        atmosphere: new THREE.Vector3(0.05, 1.86, 0.42), geosphere: new THREE.Vector3(-1.24, 0.57, 1.12), hydrosphere: new THREE.Vector3(0.15, -0.47, 1.69), biosphere: new THREE.Vector3(-1.20, -0.88, 0.96),
      };
      let width = 0, height = 0, needRender = true, lastLabels = '', lastTime = 0;
      const updateSize = () => { const box = element.getBoundingClientRect(); width = box.width; height = box.height; if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); needRender = true; state.current?.invalidate(); };
      observer = new ResizeObserver(updateSize); observer.observe(element); updateSize();
      controls.addEventListener('change', () => { needRender = true; });
      const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
      let start;
      const down = event => { start = { x: event.clientX, y: event.clientY }; if (event.pointerType === 'mouse' && event.button === 0) props.current.onInteractionChange?.(true); };
      const cancel = () => { start = null; };
      const wheelGate = event => { if (!props.current.interactive) event.stopImmediatePropagation(); };
      const up = event => {
        if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7) return;
        const box = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(props.current.view === 'surface' ? surface.children : interior.children, false).filter(hit => hit.object.userData.layer);
        if (hits.length) {
          let id = hits[0].object.userData.layer;
          if (props.current.view === 'surface' && hits[0].uv && map.image?.getContext) {
            const uv = hits[0].uv, x = Math.floor(((uv.x + map.offset.x) % 1 + 1) % 1 * map.image.width), y = Math.min(map.image.height - 1, Math.max(0, Math.floor((1 - uv.y) * map.image.height)));
            const p = map.image.getContext('2d').getImageData(x, y, 1, 1).data;
            if (p[2] > p[0] * 1.2 && p[2] > p[1] * 1.08 || p[0] + p[1] + p[2] > 690) id = 'hydrosphere';
          }
          props.current.onSelect(id);
        }
      };
      renderer.domElement.addEventListener('pointerdown', down);
      renderer.domElement.addEventListener('pointerup', up);
      renderer.domElement.addEventListener('pointercancel', cancel);
      renderer.domElement.addEventListener('wheel', wheelGate, { capture: true, passive: true });
      const lost = event => { event.preventDefault(); props.current.onFailure('Los gráficos 3D se detuvieron. Puedes seguir con la vista ilustrada.'); };
      renderer.domElement.addEventListener('webglcontextlost', lost);
      const render = time => {
        if (disposed) return;
        frame = requestAnimationFrame(render);
        if (document.hidden && !needRender) return;
        const changed = controls.update();
        if (!needRender && !changed) return;
        const mode = props.current.view;
        interior.visible = mode === 'interior'; surface.visible = mode === 'surface';
        controls.minAzimuthAngle = mode === 'interior' ? -0.25 : -Infinity;
        controls.maxAzimuthAngle = mode === 'interior' ? 0.65 : Infinity;
        const selection = ['innerCore', 'outerCore'].includes(props.current.selected) ? 'core' : props.current.selected;
        for (const m of [crust, mantle, outer]) { m.emissive.set('#000000'); m.emissiveIntensity = 0; }
        const activeMat = { crust, mantle, core: outer }[selection];
        if (activeMat) { activeMat.emissive.copy(activeMat.color); activeMat.emissiveIntensity = 0.11; }
        renderer.render(scene, camera); needRender = false;
        if (time - lastTime > 45 && width && height) {
          const ids = mode === 'interior' ? interiorIds : surfaceIds;
          const values = ids.map((id, index) => {
            const v = anchors[id].clone().project(camera);
            const x = (v.x + 1) * width / 2, y = (-v.y + 1) * height / 2;
            const leftSide = mode === 'surface' && ['geosphere', 'biosphere'].includes(id);
            const labelX = Math.max(8, Math.min(width - 120, x + (leftSide ? -155 : 48)));
            const labelY = Math.max(25, Math.min(height - 48, y - (id === 'core' ? -20 : 22)));
            return { id, x, y, labelX, labelY, leftSide };
          });
          const key = JSON.stringify(values.map(v => [v.id, Math.round(v.x), Math.round(v.y), Math.round(v.labelX), Math.round(v.labelY)]));
          if (key !== lastLabels) { setLabels(values); lastLabels = key; } lastTime = time;
        }
      };
      state.current = { camera, controls, invalidate: () => { needRender = true; if (document.hidden) { cancelAnimationFrame(frame); render(performance.now()); } } };
      render(performance.now());
      setReady(true);
      return () => {
        disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); controls.dispose();
        renderer.domElement.removeEventListener('pointerdown', down); renderer.domElement.removeEventListener('pointerup', up); renderer.domElement.removeEventListener('pointercancel', cancel); renderer.domElement.removeEventListener('wheel', wheelGate, true); renderer.domElement.removeEventListener('webglcontextlost', lost);
        geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); renderer.dispose();
        renderer.domElement.remove(); state.current = null;
      };
    } catch {
      disposed = true; renderer?.dispose(); props.current.onFailure('Este equipo no tiene gráficos 3D disponibles. La vista ilustrada conserva el recorrido completo.');
      return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
    }
  }, []);
  useEffect(() => { state.current?.invalidate(); }, [view, selected]);
  useEffect(() => {
    const s = state.current; if (!s) return;
    s.controls.enableZoom = interactive;
    s.controls.touches.ONE = interactive ? THREE.TOUCH.ROTATE : THREE.TOUCH.PAN;
    s.controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    s.controls.domElement.style.touchAction = interactive ? 'none' : 'pan-y';
  }, [interactive]);
  useEffect(() => { const s = state.current; if (s) { s.camera.position.set(0.65, 0.85, 6.2); s.controls.target.set(0, 0.02, 0); s.controls.update(); s.invalidate(); } }, [resetKey, view]);
  useEffect(() => {
    const s = state.current; if (!s || !cameraAction) return;
    if (cameraAction.type === 'left' || cameraAction.type === 'right') s.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAction.type === 'left' ? -0.15 : 0.15);
    else s.camera.position.multiplyScalar(cameraAction.type === 'in' ? 0.91 : 1.1);
    s.controls.update(); s.invalidate();
  }, [cameraAction]);

  return <div className="earth-scene">
    <div className="webgl-host" ref={host} />
    {!ready && <span className="model-loading">Preparando el modelo…</span>}
    <svg className="leader-lines" aria-hidden="true">{labels.map(l => <g key={l.id}><path d={`M${l.x},${l.y} L${l.labelX + (l.leftSide ? 100 : 4)},${l.labelY + 22}`} /><circle cx={l.x} cy={l.y} r="4" /></g>)}</svg>
    {labels.map(l => { const active = selected === l.id || l.id === 'core' && ['innerCore', 'outerCore'].includes(selected); return <button className={`earth-label ${active ? 'selected' : ''}`} key={l.id} style={{ left: l.labelX, top: l.labelY, '--layer-color': ITEMS[l.id].color }} onClick={() => onSelect(l.id)} aria-pressed={active}><span className="label-dot" />{ITEMS[l.id].name}</button>; })}
  </div>;
}
