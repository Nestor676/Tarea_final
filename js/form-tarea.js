const STORAGE_CATS = 'app_categorias_v1';
const STORAGE_TASKS = 'app_tareas_v1';

function readCategorias(){
  try { const raw = localStorage.getItem(STORAGE_CATS); return raw ? JSON.parse(raw) : []; } catch(e){ return []; }
}

function readTareas(){
  try { const raw = localStorage.getItem(STORAGE_TASKS); return raw ? JSON.parse(raw) : []; } catch(e){ return []; }
}

function writeTareas(tareas){
  try { localStorage.setItem(STORAGE_TASKS, JSON.stringify(tareas)); } catch(e){ console.error(e); }
}

function poblarSelectCategorias(){
  const select = document.querySelector('.select_categoria');
  if(!select) return;
  const cats = readCategorias();
  select.innerHTML = '';
  if(cats.length === 0){ const o = document.createElement('option'); o.value=''; o.textContent='Sin categorías'; select.appendChild(o); return; }
  cats.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.nombre; o.dataset.color = c.color || ''; select.appendChild(o); });
}

function crearTareaObj(titulo, descripcion, fecha, categoriaId, prioridad){
  return { id: Date.now().toString(), titulo, descripcion, fecha, categoriaId, prioridad, creadaEn: new Date().toISOString() };
}

document.addEventListener('DOMContentLoaded', ()=>{
  poblarSelectCategorias();
  window.addEventListener('storage', (e)=>{
    if(e.key === STORAGE_CATS) poblarSelectCategorias();
    if(e.key === STORAGE_TASKS) window.dispatchEvent(new Event('tareas-updated'));
  });

  const form = document.querySelector('.formulario_tarea');
  if(!form) return;

  form.addEventListener('submit', (evt)=>{
    evt.preventDefault();
    const titulo = document.querySelector('.input_nombre').value.trim();
    const descripcion = document.querySelector('.tarea-textarea').value.trim();
    const fecha = document.querySelector('.input_fecha').value;
    const categoriaId = document.querySelector('.select_categoria').value;
    const prioridad = document.querySelector('.select_prioridad').value;

    if(!titulo){ alert('El título es requerido'); return; }

    const tarea = crearTareaObj(titulo, descripcion, fecha, categoriaId, prioridad);
    const tareas = readTareas();
    tareas.push(tarea);
    writeTareas(tareas);

    form.reset();
    window.dispatchEvent(new Event('tareas-updated'));
  });
});
