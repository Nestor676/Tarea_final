const STORAGE_TASKS_KEY = 'app_tareas_v1';
const STORAGE_CATS_KEY = 'app_categorias_v1';

function getTareas(){
  try{
    const raw = localStorage.getItem(STORAGE_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Error leyendo tareas', e);
    return [];
  }
}

function getCategorias(){
  try{
    const raw = localStorage.getItem(STORAGE_CATS_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    return [];
  }
}

function findCategoriaById(id){
  const cats = getCategorias();
  return cats.find(c => c.id === id) || null;
}

function prioridadToClass(prio){
  switch((prio||'').toLowerCase()){
    case 'alta': return 'tarea-prioridad-alta';
    case 'media': return 'tarea-prioridad-media';
    case 'baja': return 'tarea-prioridad-baja';
    default: return 'tarea-prioridad-baja';
  }
}

function renderTareas(){
  const contPending = document.querySelector('#tareas-pendientes');
  const contDone = document.querySelector('#tareas-acabadas');
  if(!contPending && !contDone) return;
  const tareas = getTareas();
  if(contPending) contPending.innerHTML = '';
  if(contDone) contDone.innerHTML = '';

  const pendientes = tareas.filter(x => !x.completada);
  const acabadas = tareas.filter(x => x.completada);

  if((pendientes.length === 0) && contPending){
    contPending.innerHTML = '<div style="color:#666">No hay tareas pendientes</div>';
  }
  if((acabadas.length === 0) && contDone){
    contDone.innerHTML = '<div style="color:#666">No hay tareas acabadas</div>';
  }

  function makeCard(t){
    const card = document.createElement('div');
    card.className = 'tarea-card ' + prioridadToClass(t.prioridad);
    if(t.completada){ card.classList.add('tarea-completada'); }

    const titulo = document.createElement('div');
    titulo.className = 'tarea-titulo';
    titulo.textContent = t.titulo;

    const categoria = findCategoriaById(t.categoriaId);
    const catEl = document.createElement('div');
    catEl.className = 'tarea-categoria';
    catEl.textContent = categoria ? categoria.nombre : 'Sin categoría';
    if(categoria && categoria.color){
      catEl.style.backgroundColor = categoria.color;
      catEl.style.color = '#000';
      catEl.style.padding = '4px 8px';
      catEl.style.borderRadius = '6px';
      catEl.style.display = 'inline-block';
    }

    const fecha = document.createElement('div');
    fecha.className = 'tarea-fecha';
    fecha.textContent = t.fecha || '';

    const desc = document.createElement('div');
    desc.className = 'tarea-descripcion';
    desc.textContent = t.descripcion || '';

    const actions = document.createElement('div');
    actions.className = 'tarea-actions';

    const btnDelete = document.createElement('button');
    btnDelete.className = 'tarea-btn tarea-btn-delete';
    btnDelete.title = 'Eliminar tarea';
    btnDelete.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
      </svg>
    `;

    const btnDone = document.createElement('button');
    btnDone.className = 'tarea-btn tarea-btn-done';
    btnDone.title = t.completada ? 'Marcar como pendiente' : 'Marcar como hecha';
    btnDone.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    actions.appendChild(btnDone);
    actions.appendChild(btnDelete);

    btnDelete.addEventListener('click', ()=>{
      if(!confirm('¿Eliminar esta tarea?')) return;
      const all = getTareas();
      const remaining = all.filter(x => x.id !== t.id);
      try{ localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(remaining)); }catch(e){ console.error('Error al borrar tarea', e); }
      window.dispatchEvent(new Event('tareas-updated'));
      renderTareas();
    });

    btnDone.addEventListener('click', ()=>{
      const all = getTareas();
      const updated = all.map(x => x.id === t.id ? Object.assign({}, x, { completada: !x.completada }) : x);
      try{ localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updated)); }catch(e){ console.error('Error al actualizar tarea', e); }

      window.dispatchEvent(new Event('tareas-updated'));
      renderTareas();
    });

    card.appendChild(titulo);
    card.appendChild(catEl);
    card.appendChild(fecha);

    const row = document.createElement('div');
    row.className = 'tarea-row';
    row.appendChild(desc);
    row.appendChild(actions);
    card.appendChild(row);

    return card;
  }

  pendientes.forEach(t => { if(contPending) contPending.appendChild(makeCard(t)); });
  acabadas.forEach(t => { if(contDone) contDone.appendChild(makeCard(t)); });
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderTareas();
  window.addEventListener('tareas-updated', ()=>renderTareas());
  window.addEventListener('storage', (e)=>{
    if(e.key === STORAGE_TASKS_KEY || e.key === STORAGE_CATS_KEY) renderTareas();
  });
});

window.__tareas = { render: renderTareas };
