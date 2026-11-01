import { useEffect, useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCcw, X, Printer, CircleCheck, CircleAlert } from 'lucide-react';
import { ACTIVITIES, SPHERES, LAYERS, ITEMS, DISCOVER_QUESTIONS, SCENES, CHALLENGE_LABELS } from '../shared/content.js';
import { ItemIcon, Spinner, Dialog } from './components';
import { Cutaway, SceneDrawing } from './Illustrations';

export function Choices({ value, onChange, multiple = false }) {
  return <div className="choices" role="group" aria-label={multiple ? 'Elige dos componentes' : 'Elige un componente'}>{SPHERES.map(id => {
    const selected = multiple ? value.includes(id) : value === id;
    return <button key={id} className={`choice ${selected ? 'chosen' : ''}`} onClick={() => onChange(id)} aria-pressed={selected}><ItemIcon id={id}/><span>{ITEMS[id].name}</span><span className="choice-check" aria-hidden="true">{selected && <Check size={15}/>}</span></button>;
  })}</div>;
}

export function LayerBuilder({ value, onChange, compact = false }) {
  const move = (i, offset) => { const next = [...value]; [next[i], next[i + offset]] = [next[i + offset], next[i]]; onChange(next); };
  return <div className={`layer-builder ${compact ? 'compact' : ''}`}>
    <div className="build-slots">{[0, 1, 2].map((i) => <div className={`build-slot ${value[i] ? 'filled' : ''}`} key={i} style={{ '--layer-color': ITEMS[value[i]]?.color || '#b8b4a9' }}>
      <span className="slot-number">{i + 1}</span><div><span className="slot-position">{['Más externa', 'Intermedia', 'Más interna'][i]}</span><strong>{value[i] ? ITEMS[value[i]].name : 'Elige una capa'}</strong></div>
      {value[i] && <div className="slot-controls"><button className="icon-button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Mover ${ITEMS[value[i]].name} hacia el exterior`}><ChevronUp size={17}/></button><button className="icon-button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Mover ${ITEMS[value[i]].name} hacia el centro`}><ChevronDown size={17}/></button><button className="icon-button" onClick={() => onChange(value.filter((_, n) => n !== i))} aria-label={`Quitar ${ITEMS[value[i]].name}`}><X size={16}/></button></div>}
    </div>)}</div>
    <div className="layer-pieces">{LAYERS.filter(id => !value.includes(id)).map(id => <button key={id} onClick={() => onChange([...value, id])} className="layer-piece" style={{ '--layer-color': ITEMS[id].color }}><span className="label-dot"/>{ITEMS[id].name}<span aria-hidden="true">+</span></button>)}</div>
    {value.length > 0 && <button className="text-button reset-order" onClick={() => onChange([])}><RotateCcw size={15}/>Empezar de nuevo</button>}
  </div>;
}

export function ActivityPanel({ activity, draft, update, index, setIndex, onSubmit, busy, error, onClose, viewChange, attempts }) {
  const panel = useRef(null);
  useEffect(() => { const question = panel.current?.querySelector('.question'); if (question) { question.tabIndex = -1; question.focus({ preventScroll: true }); } }, [index]);
  const item = ACTIVITIES[activity];
  const totalSteps = activity === 'discover' ? 4 : activity === 'connect' || activity === 'challenge' ? 3 : 1;
  const canNext = activity === 'discover' ? !!draft[index] : activity === 'connect' ? draft[index]?.length === 2 : activity === 'challenge' ? index === 0 ? draft.surface.every(Boolean) : index === 1 ? draft.inside.length === 3 : draft.sentences.every(s => s.trim().length >= 20) : draft.length === 3;
  const complete = activity === 'discover' ? draft.every(Boolean) : activity === 'connect' ? draft.every(a => a.length === 2) : activity === 'build' ? draft.length === 3 : draft.surface.every(Boolean) && draft.inside.length === 3 && draft.sentences.every(s => s.trim().length >= 20);
  function step(next) { setIndex(next); if (activity === 'challenge') viewChange(next === 1 ? 'interior' : 'surface'); requestAnimationFrame(() => panel.current?.scrollIntoView({ block: 'start', behavior: 'instant' })); }
  return <section className="side-panel activity-panel" aria-labelledby="activity-title" ref={panel}>
    <button className="icon-button panel-close" onClick={onClose} aria-label="Volver a la exploración"><X size={21}/></button>
    <span className="eyebrow">{activity === 'challenge' ? 'Integra lo aprendido' : `Punto ${['discover', 'build', 'connect'].indexOf(activity) + 1} de 3`}{attempts > 0 ? ` · Reintento ${attempts}` : ''}</span>
    <h2 id="activity-title">{item.title}</h2>
    {totalSteps > 1 && <div className="step-indicator"><span>{activity === 'challenge' ? ['Planeta', 'Interior', 'Explica'][index] : `Observación ${index + 1} de ${totalSteps}`}</span><div aria-hidden="true">{Array.from({ length: totalSteps }, (_, i) => <i key={i} className={i <= index ? 'filled' : ''}/>)}</div></div>}
    {activity === 'discover' && <><p className="question">{DISCOVER_QUESTIONS[index].prompt}</p><p className="activity-hint">Elige una de las cuatro opciones. Después pulsa «Siguiente».</p><Choices value={draft[index]} onChange={id => update(draft.map((v, i) => i === index ? id : v))}/></>}
    {activity === 'build' && <><p className="question">Reconstruye la geósfera, desde la superficie hasta el centro.</p><p className="activity-hint">Pulsa las piezas en el orden que elijas. Las flechas permiten corregirlo.</p><LayerBuilder value={draft} onChange={update}/></>}
    {activity === 'connect' && <><SceneDrawing type={SCENES[index].id}/><p className="question">{SCENES[index].title}</p><p className="activity-hint">{SCENES[index].question} Elige dos componentes.</p><Choices multiple value={draft[index]} onChange={id => update(draft.map((v, i) => i !== index ? v : v.includes(id) ? v.filter(x => x !== id) : v.length < 2 ? [...v, id] : [v[1], id]))}/><span className="selected-count">{draft[index].length} de 2 seleccionados</span></>}
    {activity === 'challenge' && index === 0 && <><p className="question">Una ficha para explicar nuestro planeta a otro curso.</p><p className="activity-hint">Relaciona cada descripción con su componente.</p><div className="label-fields">{CHALLENGE_LABELS.map((label, i) => <label key={label}>{label}<select aria-label={label} value={draft.surface[i] || ''} onChange={e => update({ ...draft, surface: draft.surface.map((v, n) => n === i ? e.target.value || null : v) })}><option value="">Elige un componente</option>{SPHERES.map(id => <option key={id} value={id}>{ITEMS[id].name}</option>)}</select></label>)}</div></>}
    {activity === 'challenge' && index === 1 && <><p className="question">Añade el corte del interior.</p><p className="activity-hint">Ubica las tres capas principales de la geósfera.</p><LayerBuilder compact value={draft.inside} onChange={value => update({ ...draft, inside: value })}/></>}
    {activity === 'challenge' && index === 2 && <><p className="question">Ahora explícalo con tus palabras.</p><p className="activity-hint">Explica tus ideas con una frase completa en cada respuesta (entre 20 y 280 caracteres). Tu docente podrá leerlas.</p><div className="reflection-fields">{['¿Qué diferencia hay entre los componentes del planeta y sus capas internas?', '¿Qué observaste en el modelo que te ayudó a comprender el interior de la Tierra?'].map((label, i) => <label key={i}>{label}<textarea aria-label={label} rows={3} minLength={20} maxLength={280} value={draft.sentences[i]} onChange={e => update({ ...draft, sentences: draft.sentences.map((v, n) => n === i ? e.target.value : v) })}/><span className="character-count">{draft.sentences[i].length}/280</span></label>)}</div></>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="activity-actions">{index > 0 && <button className="icon-button back-step" onClick={() => step(index - 1)} aria-label="Observación anterior"><ChevronLeft size={22}/></button>}
      {index < totalSteps - 1 ? <button className="primary" onClick={() => step(index + 1)} disabled={!canNext}>Siguiente<ChevronRight size={19}/></button> : <button className="primary" onClick={onSubmit} disabled={!complete || busy}>{busy ? <><Spinner/>Guardando…</> : <>{activity === 'challenge' ? 'Entregar mi ficha' : 'Comprobar'}<Check size={18}/></>}</button>}
    </div>
    <p className="fineprint">{activity === 'challenge' ? 'Las selecciones se comprueban aquí; tus explicaciones requieren revisión docente.' : 'Puedes consultar el modelo y cambiar tu elección antes de comprobar.'}</p>
  </section>;
}

export function ResultPanel({ attempt, attemptCount, onRetry, onNext, onClose, onArtifact, isGuest }) {
  const result = attempt.result, perfect = result.score === result.total;
  return <section className="side-panel result-panel" aria-labelledby="result-title">
    <button className="icon-button panel-close" onClick={onClose} aria-label="Volver al modelo"><X size={21}/></button>
    <span className="eyebrow">{ACTIVITIES[attempt.activity].title} · Intento {attemptCount}</span>
    <div className={`result-symbol ${perfect ? 'success' : ''}`}>{perfect ? <CircleCheck size={30}/> : <CircleAlert size={30}/>}</div>
    <h2 id="result-title">{perfect ? ({ discover: 'Componentes reconocidos', build: 'Capas en orden', connect: 'Relaciones claras', challenge: 'Tu ficha está preparada' })[attempt.activity] : 'Vamos a revisarlo'}</h2>
    <p className="result-score"><strong>{result.score}</strong><span>de {result.total} {attempt.activity === 'connect' ? 'relaciones' : 'selecciones'} correctas</span></p>
    <p className="result-intro">{perfect ? 'Tu respuesta coincide con lo observado en el modelo.' : 'Revisa las pistas del modelo y corrige lo que necesites. Tu primer intento se conserva.'}</p>
    <div className="feedback-list">{result.checks.map((check, i) => <details key={i} className={check.correct ? 'correct' : 'incorrect'}><summary>{check.correct ? <Check size={17}/> : <RotateCcw size={16}/>}<span>{check.label}</span><ChevronDown size={15}/></summary><p>{check.explanation}</p></details>)}</div>
    {result.needsReview && !attempt.review && <p className="review-note">{isGuest ? 'Estas explicaciones necesitan revisión docente. Puedes incluirlas en tu ficha impresa.' : 'Tus dos explicaciones están disponibles para revisión docente.'}</p>}
    {attempt.review && <div className="review-message"><strong>Tu docente te comenta</strong><p>{attempt.review.feedback}</p></div>}
    <p className="saved-note">{isGuest ? 'Conservado en este navegador. Ingresa para trabajar con una cuenta.' : 'Intento guardado en tu cuenta.'}</p>
    {attempt.activity === 'challenge' ? <button className="primary" disabled={!perfect} onClick={onArtifact}><Printer size={18}/>Ver mi ficha</button> : <button className="primary" onClick={onNext}>Continuar</button>}
    {attempt.activity === 'challenge' && !perfect && <p className="fineprint">Revisa las selecciones para preparar una ficha correcta antes de imprimirla.</p>}
    <button className="text-button retry-activity" onClick={onRetry}><RotateCcw size={16}/>{perfect ? 'Volver a practicar' : 'Revisar mi respuesta'}</button>
  </section>;
}

export function ArtifactDialog({ attempt, user, onClose }) {
  return <Dialog title="Mi ficha científica" onClose={onClose} className="artifact-dialog">
    <article className="print-artifact">
      <div className="artifact-heading"><img src="/favicon.svg" alt="" width="36"/><div><span>Terra · Ciencias Naturales</span><h3>La Tierra, por fuera y por dentro</h3></div></div>
      <p className="artifact-author">{user?.alias || 'Exploración libre'}</p>
      <div className="artifact-grid"><section><h4>Componentes del planeta</h4>{SPHERES.map((id, i) => <div className="artifact-row" key={id}><ItemIcon id={id}/><p><strong>{ITEMS[attempt.answers.surface[i]].name}</strong><span>{CHALLENGE_LABELS[i]}</span></p></div>)}</section><section><h4>Interior de la geósfera</h4><Cutaway/>{attempt.answers.inside.map((id, i) => <p className="artifact-layer" key={id}><span>{i + 1}</span>{ITEMS[id].name}</p>)}</section></div>
      <div className="artifact-reflections">{attempt.answers.sentences.map((text, i) => <section key={i}><h4>{i === 0 ? 'Mi explicación' : 'Lo que descubrí'}</h4><p>{text}</p></section>)}</div>
      <p className="artifact-footnote">Representación educativa con proporciones simplificadas. Base escolar: Ciencias Naturales 5 EGB, unidad 4, p. 92. Las explicaciones del estudiante requieren revisión docente.</p>
    </article>
    <button className="primary full" onClick={() => window.print()}><Printer size={18}/>Imprimir o guardar como PDF</button>
  </Dialog>;
}
