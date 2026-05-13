const STORAGE_KEY = 'app_categorias_v1';

function getCategorias(){
    try{
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }catch(e){
        console.error('Error leyendo categorias desde storage', e);
        return [];
    }
}

function saveCategorias(cats){
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
    }catch(e){
        console.error('Error guardando categorias en storage', e);
    }
}

function crearCategoriaObjeto(nombre, color){
    return {
        id: Date.now().toString(),
        nombre: nombre,
        color: color
    };
}

function renderCategorias(){
    const cont = document.getElementById('lista-categorias');
    if(!cont) return;
    const cats = getCategorias();
    cont.innerHTML = '';
    if(cats.length === 0){
        cont.innerHTML = '<div style="color: #666;">No hay categorías aún</div>';
        return;
    }

    cats.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'categoria-item';

        const left = document.createElement('div');
        left.className = 'categoria-left';

        const swatch = document.createElement('div');
        swatch.className = 'categoria-swatch';
        swatch.style.backgroundColor = cat.color;

        const nombre = document.createElement('div');
        nombre.className = 'categoria-nombre';
        nombre.textContent = cat.nombre;

        left.appendChild(swatch);
        left.appendChild(nombre);

        const btn = document.createElement('button');
        btn.className = 'btn-eliminar-categoria';
        btn.textContent = 'Eliminar';
        btn.addEventListener('click', () =>{
            eliminarCategoria(cat.id);
        });

        item.appendChild(left);
        item.appendChild(btn);

        cont.appendChild(item);
    });
}

function agregarCategoria(nombre, color){
    if(!nombre || !nombre.trim()) return;
    const cats = getCategorias();
    const nuevo = crearCategoriaObjeto(nombre.trim(), color);
    cats.push(nuevo);
    saveCategorias(cats);
    renderCategorias();
}

function eliminarCategoria(id){
    let cats = getCategorias();
    cats = cats.filter(c => c.id !== id);
    saveCategorias(cats);
    renderCategorias();
}

document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('form-categoria');
    const inputNombre = document.getElementById('input-nombre-categoria');
    const inputColor = document.getElementById('input-color-categoria');

    if(form){
        form.addEventListener('submit', (e)=>{
            e.preventDefault();
            agregarCategoria(inputNombre.value, inputColor.value);
            inputNombre.value = '';
        });
    }

    renderCategorias();
});

window.__categorias = {
    get: getCategorias,
    add: agregarCategoria,
    remove: eliminarCategoria
};
