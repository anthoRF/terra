import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Plus, RefreshCw, Download, Users, ChevronRight, KeyRound, Trash2, Copy, Check, LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { api } from './useSession';
import { Dialog, Spinner } from './components';
import { ACTIVITIES, ITEMS, SPHERES, LAYERS, CHALLENGE_LABELS, SCENES } from '../shared/content.js';
const date = value => new Date(value).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Guayaquil' });
const latest = (s, id) => s.attempts.filter(a => a.activity === id).at(-1);

function ReadAnswers({ attempt }) {
  const a = attempt.answers;
  if (attempt.activity === 'discover') return <ol className="answer-list">{a.map((id, i) => <li key={i}>{ITEMS[id]?.name}</li>)}</ol>;
  if (attempt.activity === 'build') return <p>{a.map(id => ITEMS[id]?.name).join(' → ')}</p>;
  if (attempt.activity === 'connect') return <ul className="answer-list">{a.map((ids, i) => <li key={i}>{SCENES[i].title}: {ids.map(id => ITEMS[id]?.name).join(' y ')}</li>)}</ul>;
  return <><dl className="answer-definitions">{a.surface.map((id, i) => <div key={i}><dt>{CHALLENGE_LABELS[i]}</dt><dd>{ITEMS[id]?.name}</dd></div>)}</dl><p>{a.inside.map(id => ITEMS[id]?.name).join(' → ')}</p>{a.sentences.map((s, i) => <blockquote key={i}><span>{i === 0 ? 'Diferencias' : 'Mi observación'}</span>{s}</blockquote>)}</>;
}

function ReviewForm({ student, attempt, onSaved }) {
  const [feedback, setFeedback] = useState(attempt.review?.feedback || ''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false);
  async function send(e) {
    e.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try { const data = await api('/teacher/review', { classCode: student.classCode, id: student.id, attemptId: attempt.id, feedback: feedback.trim() }); onSaved(data.attempts); setSaved(true); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <form className="teacher-review-form" onSubmit={send}><span className="review-status">{attempt.review ? `Revisada el ${date(attempt.review.reviewedAt)}` : 'Esta ficha espera tu revisión'}</span><label>Comentario para el estudiante<textarea required minLength={3} maxLength={1000} rows={3} placeholder="Reconoce un acierto y sugiere qué puede mejorar." value={feedback} onChange={e=>{setFeedback(e.target.value);setSaved(false);}}/></label><button className="primary" disabled={busy || feedback.trim().length<3}>{busy?<Spinner/>:<Check size={16}/>} {saved?'Revisión guardada':attempt.review?'Actualizar revisión':'Guardar revisión'}</button>{error&&<p className="form-error" role="alert">{error}</p>}{saved&&<p className="review-status" role="status">Tu comentario está disponible en la cuenta del estudiante.</p>}</form>;
}

export default function Teacher({ onBack, onReauth }) {
  const [classes, setClasses] = useState([]), [selected, setSelected] = useState(''), [students, setStudents] = useState([]);
  const [busy, setBusy] = useState(true), [error, setError] = useState(''), [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(null), [name, setName] = useState(''), [working, setWorking] = useState(false), [operationError, setOperationError] = useState('');
  const [filter, setFilter] = useState('all'), [sort, setSort] = useState('alias');
  const [detail, setDetail] = useState(null), [copied, setCopied] = useState(false), [confirmAlias, setConfirmAlias] = useState('');
  const generation = useRef(0);
  const classroom = classes.find(c => c.code === selected);
  const done = s => ['discover','build','connect','challenge'].filter(id=>latest(s,id)).length;
  const needsPractice = s => ['discover','build','connect','challenge'].some(id=>{const a=latest(s,id);return a && a.result.score<a.result.total;});
  const reviewCount = students.filter(s=>{const a=latest(s,'challenge');return a&&!a.review;}).length;
  const filtered = students.filter(s => s.alias.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es')) && (filter==='all' || filter==='pending'&&done(s)<4 || filter==='complete'&&done(s)===4 || filter==='review'&&latest(s,'challenge')&&!latest(s,'challenge').review || filter==='practice'&&needsPractice(s))).sort((a,b)=>sort==='recent'?b.updatedAt.localeCompare(a.updatedAt):sort==='progress'?done(b)-done(a):a.alias.localeCompare(b.alias,'es'));
  function saveReview(attempts) { setDetail(s=>({...s,attempts})); setStudents(all=>all.map(s=>s.uid===detail.uid?{...s,attempts}:s)); }
  async function loadClasses() {
    setError(''); setBusy(true);
    try { const data = await api('/teacher/classes'); setClasses(data.classes); setSelected(current => data.classes.some(c => c.code === current) ? current : data.classes[0]?.code || ''); }
    catch (e) { setError(e.message); if (e.status === 401 || e.status === 403) { setClasses([]); setStudents([]); } }
    finally { setBusy(false); }
  }
  async function loadStudents(code = selected) {
    if (!code) { setStudents([]); return; }
    const current = ++generation.current;
    setError(''); setBusy(true);
    try { const data = await api(`/teacher/students?class=${encodeURIComponent(code)}`); if (current === generation.current) setStudents(data.students); }
    catch (e) { if (current === generation.current) { setError(e.message); setStudents([]); } }
    finally { if (current === generation.current) setBusy(false); }
  }
  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { if (selected) loadStudents(selected); else setStudents([]); setSearch(''); setFilter('all'); }, [selected]);
  function open(value) { setDialog(value); setOperationError(''); setConfirmAlias(''); setCopied(false); }
  async function createClass(e) {
    e.preventDefault(); setWorking(true); setOperationError('');
    try { const data = await api('/teacher/classes', { name }); setClasses(old => [data.classroom, ...old]); setSelected(data.classroom.code); setName(''); setDialog(null); }
    catch (e) { setOperationError(e.message); } finally { setWorking(false); }
  }
  async function resetCode(student) {
    setWorking(true); setOperationError('');
    try { const data = await api('/teacher/reset', { classCode: selected, id: student.id }); open({ type: 'code', student, accessCode: data.accessCode }); await loadStudents(); }
    catch (e) { setOperationError(e.message); } finally { setWorking(false); }
  }
  async function deleteStudent(student) {
    setWorking(true); setOperationError('');
    try { await api('/teacher/delete', { classCode: selected, id: student.id }); setDialog(null); setDetail(null); await loadStudents(); }
    catch (e) { setOperationError(e.message); } finally { setWorking(false); }
  }
  async function toggleClass() {
    setWorking(true); setError('');
    try { const data = await api('/teacher/class-status', { classCode: selected, closed: !classroom.closed }); setClasses(all => all.map(c => c.code === selected ? data.classroom : c)); }
    catch (e) { setError(e.message); } finally { setWorking(false); }
  }
  async function exportResults() {
    setWorking(true); setError('');
    try {
      const response = await fetch(`/api/teacher/export?class=${encodeURIComponent(selected)}`, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(20000) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error); }
      const object = URL.createObjectURL(await response.blob()); const a = document.createElement('a'); a.href = object; a.download = `Terra_${selected}_resultados.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(object), 1000);
    } catch (e) { setError(e.message || 'No se pudo descargar el archivo. Vuelve a intentarlo.'); } finally { setWorking(false); }
  }
  async function copy(text) { try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setOperationError('No se pudo copiar. Vuelve a intentarlo desde un navegador compatible.'); } }

  return <main className="teacher-page" id="main-content">
    <div className="teacher-heading"><div><button className="text-button on-dark" onClick={onBack}><ArrowLeft size={17}/>Volver al modelo</button><span className="eyebrow">Panel docente</span><h1>Acompaña cada descubrimiento.</h1></div><button className="primary" onClick={() => open({ type: 'class' })}><Plus size={18}/>Nuevo grupo</button></div>
    {error && <div role="alert" className="teacher-error"><p>{error}</p><button className="secondary" onClick={onReauth}>Volver a ingresar</button><button className="secondary" onClick={loadClasses}>Reintentar</button></div>}
    <section className="teacher-workspace">
      {classes.length > 0 && <div className="class-toolbar"><label>Grupo<select value={selected} onChange={e => { setSelected(e.target.value); setDetail(null); }}>{classes.map(c => <option key={c.code} value={c.code}>{c.name}{c.closed ? ' · inscripciones cerradas' : ''}</option>)}</select></label><div className="class-status"><span className="status-dot"/>{classroom?.closed?'Registros cerrados':'Registros abiertos'}</div><button className="secondary" onClick={() => copy(`${location.origin}/?clase=${selected}`)}><Copy size={16}/>{copied ? 'Copiado' : 'Copiar invitación'}</button><button className="secondary" onClick={toggleClass} disabled={working}>{classroom?.closed ? <UnlockKeyhole size={17}/> : <LockKeyhole size={17}/>} {classroom?.closed ? 'Abrir inscripciones' : 'Cerrar inscripciones'}</button></div>}
      {busy ? <div className="teacher-empty"><Spinner/><h2>Cargando tu clase…</h2></div> : classes.length === 0 ? <div className="teacher-empty"><div className="empty-symbol"><Users size={34}/></div><h2>Tu primera clase empieza aquí.</h2><p>Crea una clase y comparte su código. Los estudiantes elegirán un alias y recibirán su acceso personal.</p><button className="primary" onClick={() => open({ type: 'class' })}><Plus size={18}/>Crear mi primera clase</button></div> : <>
        <div className="teacher-stats" aria-label="Resumen de la clase">{[[students.length,'Participantes'],[students.filter(s=>done(s)===4).length,'Recorridos completos'],[reviewCount,'Fichas por revisar'],[students.filter(needsPractice).length,'Necesitan repasar']].map(([value,label])=><div className="teacher-stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="students-heading"><div><h2>{classroom?.name}</h2><p>{students.length} {students.length === 1 ? 'participante' : 'participantes'} · {students.filter(s => latest(s, 'challenge')).length} fichas entregadas</p></div><div className="teacher-tools"><input aria-label="Buscar por alias" placeholder="Buscar alias" value={search} onChange={e => setSearch(e.target.value)}/><button className="icon-button" disabled={working} onClick={() => loadStudents()} aria-label="Actualizar resultados"><RefreshCw size={19}/></button><button className="secondary" onClick={exportResults} disabled={working}><Download size={17}/>Exportar CSV</button></div></div>
        <div className="teacher-filters" aria-label="Filtrar participantes">{[['all','Todos'],['pending','En curso'],['review','Por revisar'],['practice','Para repasar'],['complete','Completados']].map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}<select aria-label="Ordenar participantes" value={sort} onChange={e=>setSort(e.target.value)}><option value="alias">Orden alfabético</option><option value="recent">Actividad reciente</option><option value="progress">Mayor avance</option></select></div>{students.length === 0 ? <div className="teacher-empty compact"><Users size={28}/><h2>Esperando a tus exploradores.</h2><p>Los estudiantes pueden entrar en «Ingresar → Crear mi acceso». Para este grupo también puedes compartir su enlace de invitación.</p></div> : <div className="table-scroll"><table className="students-table"><caption className="sr-only">Avance y últimos resultados de la clase {classroom?.name}</caption><thead><tr><th>Participante</th><th>Avance</th><th>Descubre</th><th>Construye</th><th>Relaciona</th><th>Reto final</th><th><span className="sr-only">Detalle</span></th></tr></thead><tbody>{filtered.map(s => <tr key={s.uid}><th scope="row"><span className="student-avatar">{s.alias[0].toUpperCase()}</span>{s.alias}</th><td><strong>{done(s)}/4</strong><span className="mini-progress"><span style={{width:`${done(s)*25}%`}}/></span></td>{['discover', 'build', 'connect', 'challenge'].map(id => { const a = latest(s, id); return <td key={id}>{a ? <><strong className={a.result.score === a.result.total ? 'score-good' : 'score-review'}>{a.result.score}/{a.result.total}</strong><span>{s.attempts.filter(x => x.activity === id).length} {s.attempts.filter(x => x.activity === id).length === 1 ? 'intento' : 'intentos'}</span>{id === 'challenge' && <small>{a.review?'Revisada':'Por revisar'}</small>}</> : <span className="pending-tag">Pendiente</span>}</td>; })}<td><button className="icon-button" onClick={() => setDetail(s)} aria-label={`Ver intentos de ${s.alias}`}><ChevronRight size={21}/></button></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="no-search">No hay participantes que coincidan con esta búsqueda y filtro.</p>}</div>}
        <p className="table-note">La tabla muestra el último resultado. Abre un participante para comparar el primer intento, los reintentos y sus explicaciones. Las fechas usan la hora de Ecuador.</p>
      </>}
    </section>
    {detail && <Dialog title={detail.alias} onClose={() => setDetail(null)} className="student-dialog"><p>Clase {detail.className} · Inscrito el {date(detail.createdAt)}</p><div className="student-actions"><button className="secondary" onClick={() => open({ type: 'reset', student: detail })}><KeyRound size={17}/>Restablecer código</button><button className="text-button danger" onClick={() => open({ type: 'delete', student: detail })}><Trash2 size={17}/>Eliminar participante</button></div>{detail.attempts.length === 0 ? <p className="empty-message">Aún no ha enviado actividades.</p> : ['discover', 'build', 'connect', 'challenge'].map(id => { const group = detail.attempts.filter(a => a.activity === id); return <section className="student-activity" key={id}><h3>{ACTIVITIES[id].title}</h3>{group.length === 0 ? <p>Pendiente</p> : group.map((a, i) => <details key={a.id}><summary><span>{i === 0 ? 'Primer intento' : `Reintento ${i}`}<small>{date(a.createdAt)}</small></span><strong>{a.result.score}/{a.result.total}</strong><ChevronRight size={17}/></summary><div className="attempt-detail"><ReadAnswers attempt={a}/>{a.result.needsReview && <><p className="review-note">Las selecciones tienen puntuación automática. Aquí puedes revisar y comentar las explicaciones.</p><ReviewForm student={detail} attempt={a} onSaved={saveReview}/></>}<ul className="attempt-checks">{a.result.checks.map((c, n) => <li key={n}>{c.correct ? 'Correcto' : 'Por revisar'}: {c.label}</li>)}</ul></div></details>)}</section>; })}</Dialog>}
    {dialog?.type === 'class' && <Dialog title="Un nuevo grupo" onClose={() => !working && setDialog(null)}><p>Comparte el enlace de invitación si deseas reunir a un grupo específico.</p><form onSubmit={createClass}><label>Nombre del grupo<input data-autofocus required minLength={2} maxLength={60} placeholder="Ej. Quinto EGB · paralelo A" value={name} onChange={e => setName(e.target.value)}/></label>{operationError && <p role="alert" className="form-error">{operationError}</p>}<button className="primary full" disabled={working}>{working ? <Spinner/> : <Plus size={18}/>}Crear clase</button></form></Dialog>}
    {dialog?.type === 'reset' && <Dialog title="Restablecer el acceso" onClose={() => !working && setDialog(null)}><p>Se generará un nuevo código para <strong>{dialog.student.alias}</strong>. Sus actividades se conservan y las sesiones anteriores se cerrarán.</p>{operationError && <p role="alert" className="form-error">{operationError}</p>}<button className="primary full" disabled={working} onClick={() => resetCode(dialog.student)}>{working ? <Spinner/> : <KeyRound size={18}/>}Generar nuevo código</button></Dialog>}
    {dialog?.type === 'code' && <Dialog title="Nuevo código personal" onClose={() => setDialog(null)}><p>Entrega este código de forma privada a <strong>{dialog.student.alias}</strong>.</p><div className="access-card"><span>Clase {selected}</span><strong>{dialog.accessCode}</strong></div><button className="primary full" onClick={() => copy(dialog.accessCode)}>{copied ? <Check size={18}/> : <Copy size={18}/>} {copied ? 'Código copiado' : 'Copiar código'}</button>{operationError && <p role="alert" className="form-error">{operationError}</p>}</Dialog>}
    {dialog?.type === 'delete' && <Dialog title="Eliminar participante" onClose={() => !working && setDialog(null)}><p>Se eliminarán el acceso, los borradores y todos los intentos de <strong>{dialog.student.alias}</strong>. Esta acción no se puede deshacer.</p><label>Escribe su alias para confirmar<input data-autofocus value={confirmAlias} onChange={e => setConfirmAlias(e.target.value)}/></label>{operationError && <p role="alert" className="form-error">{operationError}</p>}<button className="primary full danger-button" disabled={working || confirmAlias !== dialog.student.alias} onClick={() => deleteStudent(dialog.student)}>{working ? <Spinner/> : <Trash2 size={18}/>}Eliminar sus datos</button></Dialog>}
  </main>;
}
