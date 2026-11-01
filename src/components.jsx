import { useEffect, useId, useRef, useState } from 'react';
import { X, Check, LoaderCircle, Wind, Droplets, Mountain, Leaf, Layers, Circle, Eye, EyeOff, Download } from 'lucide-react';
import { ITEMS, LAYERS, SPHERES } from '../shared/content.js';
import { LEARNING, QUICK_CHECKS } from '../shared/learning.js';
import { api } from './useSession';
import { Cutaway } from './Illustrations';

export function ItemIcon({ id, size = 22, ...rest }) { const Icon = ({ wind: Wind, water: Droplets, mountain: Mountain, leaf: Leaf, layers: Layers, circle: Circle })[ITEMS[id]?.icon] || Layers; return <Icon size={size} strokeWidth={1.7} {...rest}/>; }
export function Spinner() { return <LoaderCircle size={19} className="spin" aria-hidden="true"/>; }
export function Dialog({ title, onClose, children, className = '' }) {
  const titleId = useId();
  const ref = useRef(null), callback = useRef(onClose); callback.current = onClose;
  useEffect(() => {
    const element = ref.current, previousFocus = document.activeElement; element.showModal();
    const cancel = event => { event.preventDefault(); callback.current(); };
    element.addEventListener('cancel', cancel);
    requestAnimationFrame(() => (element.querySelector('[data-autofocus]') || element.querySelector('h2')).focus());
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { element.removeEventListener('cancel', cancel); element.close(); document.body.style.overflow = previous; if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby={titleId} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <button className="icon-button close-dialog" onClick={onClose} aria-label="Cerrar ventana"><X size={22}/></button>
    <h2 id={titleId} tabIndex={-1}>{title}</h2>{children}
  </dialog>;
}

export function LayerPanel({ selected, onStart, onSelect }) {
  const item = ITEMS[selected] || ITEMS.mantle, reading = LEARNING[selected] || LEARNING.mantle;
  const check = QUICK_CHECKS[selected] || QUICK_CHECKS.mantle;
  const [tab, setTab] = useState('essential'), [answer, setAnswer] = useState(null);
  useEffect(() => { setTab('essential'); setAnswer(null); }, [selected]);
  const ids = LAYERS.includes(selected) || ['outerCore','innerCore'].includes(selected) ? LAYERS : SPHERES;
  return <section className="side-panel layer-panel" aria-labelledby="layer-title" style={{'--topic-color':item.color}}>
    <div className="layer-tabs" role="group" aria-label="Elegir una capa">{ids.map(id=><button key={id} aria-pressed={id===selected || id==='core'&&['outerCore','innerCore'].includes(selected)} onClick={()=>onSelect(id)}>{ITEMS[id].name}</button>)}</div>
    <div className="layer-title-row"><div className="layer-swatch" style={{ '--swatch': item.color }}><ItemIcon id={selected} size={25}/></div><span className="eyebrow">{item.short}</span></div>
    <h2 id="layer-title">{item.name}</h2><p className="layer-description">{item.description}</p>
    <div className="info-tabs" role="group" aria-label="Contenido de la ficha">{[['essential','Lo esencial'],['example','Un ejemplo'],['check','Pruébate']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</div>
    <div className="info-card-body">
      {tab==='essential'&&<dl className="layer-properties"><div><dt>Material</dt><dd>{reading.material}</dd></div><div><dt>Ubicación</dt><dd>{reading.location}</dd></div></dl>}
      {tab==='example'&&<div className="card-example"><span className="eyebrow">CONECTA CON TU ENTORNO</span><p>{reading.example}</p></div>}
      {tab==='check'&&<div className="quick-check"><p>{check.statement}</p><div className="check-options" role="group" aria-label="Verdadero o falso">{[[true,'Verdadero'],[false,'Falso']].map(([value,label])=><button key={label} aria-pressed={answer===value} onClick={()=>setAnswer(value)}>{label}</button>)}</div>{answer===null?<small>Elige una respuesta para comprobar tu idea.</small>:<p className={`quick-feedback ${answer===check.answer?'correct':'incorrect'}`} role="status"><strong>{answer===check.answer?'¡Bien observado!':'Revisa esta idea.'}</strong>{check.explanation}</p>}</div>}
    </div>
    {['core','outerCore','innerCore'].includes(selected)&&<div className="core-options"><span>Las dos partes del núcleo</span><div>{[['core','General'],['outerCore','Externo'],['innerCore','Interno']].map(([id,label])=><button key={id} className={selected===id?'small-button active':'small-button'} aria-pressed={selected===id} onClick={()=>onSelect(id)}>{label}</button>)}</div></div>}
    <button className="primary" onClick={onStart}>Ponerlo en práctica</button><a href="#reading-title" className="read-more">Leer más sobre esta capa</a>
  </section>;
}

export function AuthDialog({ teacher = false, session, onClose, onSuccess }) {
  const [isTeacher, setIsTeacher] = useState(teacher);
  const [mode, setMode] = useState(() => new URLSearchParams(location.search).has('clase') ? 'register' : 'login'), [error, setError] = useState(''), [busy, setBusy] = useState(false), [show, setShow] = useState(false);
  const [created, setCreated] = useState(null);
  const [form, setForm] = useState(() => { let remembered = {}; try { remembered = JSON.parse(localStorage.getItem('terra_access_hint') || '{}'); } catch {} return { alias: remembered.alias || '', classCode: new URLSearchParams(location.search).get('clase')?.slice(0,8).toUpperCase() || '', accessCode: '', key: '' }; });
  const field = (name, value) => setForm(old => ({ ...old, [name]: value }));
  async function send(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try {
      const result = await api(isTeacher ? '/teacher/login' : mode === 'register' ? '/register' : '/login', isTeacher ? { key: form.key } : { alias: form.alias, accessCode: form.accessCode, ...(mode === 'register' && form.classCode ? { classCode: form.classCode } : {}) });
      session.applySession(result);
      if (!isTeacher) try { localStorage.setItem('terra_access_hint', JSON.stringify({ alias: form.alias.trim() })); } catch {}
      if (result.accessCode) setCreated({ ...result.user, accessCode: result.accessCode }); else onSuccess(isTeacher);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function downloadCode() {
    const text = `TERRA · Mi acceso\nAlias: ${created.alias}\nCódigo personal: ${created.accessCode}\nSitio: ${location.origin}\n\nGuárdalo en privado. Tu docente puede restablecerlo si lo pierdes.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'Terra_mi_acceso.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
  }
  return <Dialog title={created ? 'Tu acceso está listo' : isTeacher ? 'Bienvenido, docente' : mode === 'register' ? 'Crea tu cuenta.' : 'Continúa tu exploración.'} onClose={() => created ? onSuccess(false) : onClose()} className="auth-dialog">
    {created ? <><p>Este código te permite recuperar tu avance. Guárdalo en un lugar privado.</p><div className="access-card"><span>{created.alias}</span><strong>{created.accessCode}</strong></div><button className="secondary full" onClick={downloadCode}><Download size={18}/>Descargar mi acceso</button><button className="primary full" onClick={() => onSuccess(false)}>Ya guardé mi código<Check size={19}/></button><p className="fineprint">Tu cuenta está lista para guardar tus descubrimientos.</p></> : <>
      <div className="auth-role-tabs" role="group" aria-label="Elegir tipo de cuenta"><button aria-pressed={!isTeacher} disabled={busy} onClick={()=>{setIsTeacher(false);setError('');}}>Estudiante</button><button aria-pressed={isTeacher} disabled={busy} onClick={()=>{setIsTeacher(true);setError('');}}>Docente</button></div><p>{isTeacher ? 'Consulta el avance y acompaña a tus estudiantes.' : 'Tu avance estará disponible en cualquier dispositivo.'}</p>
      {!isTeacher && <div className="auth-tabs" role="group" aria-label="Tipo de acceso"><button className={mode === 'login' ? 'active' : ''} disabled={busy} onClick={() => { setMode('login'); setError(''); }}>Ingresar</button><button className={mode === 'register' ? 'active' : ''} disabled={busy} onClick={() => { setMode('register'); setError(''); }}>Crear mi acceso</button></div>}
      <form onSubmit={send}>
        {isTeacher ? <label>Clave docente<div className="password-field"><input aria-label="Clave docente" data-autofocus autoComplete="current-password" type={show ? 'text' : 'password'} required maxLength={200} value={form.key} onChange={e => field('key', e.target.value)}/><button type="button" className="icon-button" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar clave' : 'Mostrar clave'}>{show ? <EyeOff size={20}/> : <Eye size={20}/>}</button></div></label> : <>
          <label>Tu alias<small>{mode === 'register' ? 'Elige un nombre corto sin datos personales.' : 'El alias que elegiste al crear tu cuenta.'}</small><input data-autofocus autoComplete="username" placeholder="Ej. Explorador7" required minLength={2} maxLength={24} value={form.alias} onChange={e => field('alias', e.target.value)}/></label>
          {mode === 'login' && <label>Código personal<small>El código privado que recibiste al crear tu acceso.</small><div className="password-field"><input aria-label="Código personal" type={show ? 'text' : 'password'} autoComplete="current-password" autoCapitalize="characters" placeholder="XXXX-XXXX-XXXX" required maxLength={18} value={form.accessCode} onChange={e => field('accessCode', e.target.value.toUpperCase())}/><button type="button" className="icon-button" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar código personal' : 'Mostrar código personal'}>{show ? <EyeOff size={20}/> : <Eye size={20}/>}</button></div></label>}
        </>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="primary full" disabled={busy} type="submit">{busy ? <><Spinner/>Conectando…</> : isTeacher ? 'Entrar al panel' : mode === 'register' ? 'Crear mi acceso' : 'Ingresar'}</button>
      </form>
      <p className="fineprint">{isTeacher ? 'Un espacio para acompañar el aprendizaje de tu clase.' : mode === 'register' ? 'Elige un alias, sin usar tu nombre completo. Recibirás un código personal para volver a entrar.' : 'Si perdiste tu código personal, pídele a tu docente que lo restablezca.'}</p>
      {!isTeacher && mode === 'login' && <p className="fineprint">Al ingresar se abre el avance de tu cuenta. Tus respuestas de invitado permanecen en este dispositivo.</p>}
    </>}
  </Dialog>;
}
