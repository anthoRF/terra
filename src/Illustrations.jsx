import { ITEMS, SPHERES, LAYERS } from '../shared/content.js';
import { useId } from 'react';

export function Cutaway({ className = '', simple = false }) {
  const unique = useId().replaceAll(':', '');
  const water = `water-${unique}`, rock = `rock-${unique}`, clip = `globe-clip-${unique}`;
  return <svg className={`cutaway ${className}`} viewBox="0 0 480 420" role="img" aria-label="Corte esquemático: corteza por fuera, manto en medio y núcleo en el centro.">
    <defs><radialGradient id={water}><stop stopColor="#78bdd0"/><stop offset="1" stopColor="#31799d"/></radialGradient><linearGradient id={rock}><stop stopColor="#f29251"/><stop offset="1" stopColor="#bf552e"/></linearGradient><clipPath id={clip}><circle cx="231" cy="208" r="171"/></clipPath></defs>
    <circle cx="231" cy="208" r="178" fill="none" stroke="#6eafc4" strokeWidth="2" opacity=".25"/>
    <circle cx="231" cy="208" r="171" fill={`url(#${water})`}/>
    <g clipPath={`url(#${clip})`} fill="#91ac77"><path d="m106 91 45-19 28 10-2 32-29 20 9 24-13 25-39-7-18-30Z"/><path d="m148 190 40 21 15 37-19 41-11 37-17-7-8-43-24-38Z"/><path d="m197 54 28-10 8 31-21 15-21-12Z"/></g>
    <path d="M231 37a171 171 0 0 1 0 342Z" fill="#a5784c"/>
    <path d="M235 44a164 164 0 0 1 0 328Z" fill={`url(#${rock})`}/>
    <path d="M235 113a95 95 0 0 1 0 190Z" fill="#efb64a"/>
    <path d="M235 165a43 43 0 0 1 0 86Z" fill="#ffe29a"/>
    <path d="M231 37V379" stroke="#13213d" strokeOpacity=".2" strokeWidth="2"/>
  </svg>;
}

export function IllustratedEarth({ view, selected, onSelect }) {
  const ids = view === 'interior' ? LAYERS : SPHERES;
  const active = ['innerCore', 'outerCore'].includes(selected) ? 'core' : selected;
  return <div className="illustrated-earth">
    {view === 'interior' ? <Cutaway /> : <svg viewBox="0 0 480 420" role="img" aria-label="Planeta con aire, agua, rocas y seres vivos relacionados entre sí.">
      <circle cx="240" cy="210" r="184" fill="#77adca" opacity=".12" stroke="#8fbcd4" strokeWidth="2"/>
      <circle cx="240" cy="210" r="168" fill="#4386a5"/>
      <path d="m111 139 45-46 50-13 39 31-20 30-51 8-9 37-40-7Z M173 209l47 7 37 49-16 53-27 32-18-35-26-59Z M284 108l55 3 35 49-24 40-46-18-19 51-30-10 13-45Z M310 281l43-14 21 28-13 34-47 7Z" fill="#90ad7c"/>
      <g fill="#f7f3e7"><path d="m185 62 28-13 39-4 41 10-28 17-47 2Z"/><path d="m188 360 105-6-22 20-47 1Z"/></g>
      <path d="M165 230v-35m0 13q-29-21-25-35 28 1 25 35Zm0-6q29-23 28-39-29 2-28 39Z" stroke="#e6efd4" strokeWidth="5" fill="#a8bd88"/>
      <path d="M316 228q15-17 31 0-16 17-31 0Zm30 0 12-12v24Z" fill="#f4d98b"/>
    </svg>}
    <div className="illustrated-labels">{ids.map(id => <button key={id} className={`illustrated-label ${active === id ? 'selected' : ''}`} style={{ '--layer-color': ITEMS[id].color }} onClick={() => onSelect(id)} aria-pressed={active === id}><span className="label-dot"/>{ITEMS[id].name}</button>)}</div>
  </div>;
}

export function SceneDrawing({ type }) {
  return <svg className="scene-drawing" viewBox="0 0 300 126" aria-label={type === 'fish' ? 'Un pez en el agua de un río' : type === 'tree' ? 'Un árbol junto a rocas' : 'Un ave en el aire'} role="img">
    <rect width="300" height="126" rx="12" fill="#e3e9e4"/>
    {type === 'fish' ? <><path d="M0 48q75-20 150 0t150 0v78H0Z" fill="#83b3c6"/><path d="M0 78q75-20 150 0t150 0M0 103q75-20 150 0t150 0" stroke="#e2f1ed" strokeWidth="2" fill="none"/><path d="M105 77q35-35 70 0-35 35-70 0Zm66 0 28-24v48Z" fill="#dc965c"/><circle cx="120" cy="73" r="3" fill="#203c48"/></> : type === 'tree' ? <><path d="M0 96q150-27 300 0v30H0Z" fill="#9aac88"/><path d="m145 55-4 51h12l-3-54" fill="#8b6b4f"/><path d="M111 58q-22-22 5-33 4-31 34-17 33-4 34 25 29 24-4 38l-50-3Z" fill="#5f8768"/><path d="m195 108 16-28 30 2 19 26Z" fill="#8c9290"/><path d="m73 107 8-17 22 1 10 17Z" fill="#adb1a8"/></> : <><path d="M0 105q100-30 184 0t116 0v21H0Z" fill="#bec8aa"/><path d="M63 34q12-16 25-1 28-10 35 8H54Z M204 18q13-15 27-1 24-8 33 10h-66Z" fill="#fcfbf3"/><path d="M147 56q-31-33-49-28 7 35 39 43 29 20 46 5l29-36q-40-4-65 16Z" fill="#5d7684"/><path d="m189 73 16 1-12 7" fill="#deab55"/></>}
  </svg>;
}
