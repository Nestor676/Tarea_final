(function(){
  const STORAGE_TASKS_KEY = 'app_tareas_v1';
  const STORAGE_CATS_KEY = 'app_categorias_v1';

  function readLocal(key){
    try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : []; }catch(e){ return []; }
  }

  function writeLocal(key, data){
    try{ localStorage.setItem(key, JSON.stringify(data)); }catch(e){ console.error('Error escribiendo', key, e); }
  }

  function findCategoriaByName(name){
    const cats = readLocal(STORAGE_CATS_KEY);
    return cats.find(c => (c.nombre||'').toLowerCase() === (name||'').toLowerCase()) || null;
  }

  function ensureCategoria(nombre, color){
    const cats = readLocal(STORAGE_CATS_KEY);
    let existing = cats.find(c => (c.nombre||'').toLowerCase() === (nombre||'').toLowerCase());
    if(existing) return existing;
    const nuevo = { id: 'cat-' + Date.now() + '-' + Math.floor(Math.random()*1000), nombre: nombre, color: color || '#ddd' };
    cats.push(nuevo);
    writeLocal(STORAGE_CATS_KEY, cats);
    
    try{
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_CATS_KEY, newValue: JSON.stringify(cats) }));
    }catch(e){}
    return nuevo;
  }

  function importFromFile(filename){
    if(!filename) return Promise.reject(new Error('Nombre de archivo vacío'));
    const path = './datos/' + filename;
    return fetch(path).then(r => {
      if(!r.ok) throw new Error('No se pudo cargar ' + path);
      return r.json();
    }).then(items => {
      if(!Array.isArray(items)) throw new Error('Formato inválido');

      const existingTasks = readLocal(STORAGE_TASKS_KEY);
      const existingIds = new Set(existingTasks.map(t => t.id));
      let added = 0;

      items.forEach(it => {
        
        const id = it.id || ('imp-' + Date.now() + '-' + Math.floor(Math.random()*1000));
        if(existingIds.has(id)) return; 

        
        const catName = it.categoria && (it.categoria.nom || it.categoria.nombre) ? (it.categoria.nom || it.categoria.nombre) : 'Sin categoría';
        const catColor = it.categoria && (it.categoria.color) ? it.categoria.color : '#ddd';
        const catObj = ensureCategoria(catName, catColor);

        const tarea = {
          id: id,
          titulo: it.titol || it.titulo || 'Sin título',
          descripcion: it.descripcio || it.descripcion || '',
          fecha: it.data || it.fecha || '',
          categoriaId: catObj.id,
          prioridad: (it.prioritat || it.prioridad || it.prioritat || it.prioridad || 'media').toString(),
          completada: !!it.realitzada || !!it.realizada || false,
          creadaEn: new Date().toISOString()
        };

        existingTasks.push(tarea);
        existingIds.add(id);
        added++;
      });

      writeLocal(STORAGE_TASKS_KEY, existingTasks);
      
      try{
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_TASKS_KEY, newValue: JSON.stringify(existingTasks) }));
      }catch(e){}
      return { added, total: existingTasks.length };
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const input = document.querySelector('.input_archivo');
    const btn = document.querySelector('.subir_archivo');
    if(!input || !btn) return;
    btn.addEventListener('click', ()=>{
      const filename = input.value.trim();
      if(!filename){ alert('Escribe el nombre del archivo (por ejemplo actividades_001.json)'); return; }
      importFromFile(filename).then(res => {
        alert('Importadas ' + res.added + ' tareas. Total: ' + res.total);
        window.dispatchEvent(new Event('tareas-updated'));
      }).catch(err => { alert('Error al importar: ' + err.message); console.error(err); });
    });
  });

})();
