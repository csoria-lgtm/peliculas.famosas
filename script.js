/*
  script.js - Comportamientos para la revista
  - IntersectionObserver para revelar piezas cuando aparecen en pantalla
  - Smooth scroll para enlaces (si se agregan)
  - Manejo simple del formulario con comentarios para principiantes
*/

document.addEventListener('DOMContentLoaded', function(){
  // Smooth scroll para cualquier enlace interno
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor){
    anchor.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Reveal on scroll: animación suave para elementos con clase .reveal
  const reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.12});
    reveals.forEach(r=>io.observe(r));
  } else {
    // Fallback simple
    reveals.forEach(r=>r.classList.add('visible'));
  }

  // Nota: la búsqueda local ahora está integrada en la barra compacta
  // ubicada dentro de la sección de películas. Se gestiona más abajo
  // junto al filtro y ordenamiento (función applyFilterAndOrder).

  // Manejo sencillo del formulario de contacto
  window.handleContact = function(event){
    event.preventDefault();
    const form = event.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if(!name || !email || !message){
      alert('Por favor completa todos los campos.');
      return;
    }

    // Aquí se podría enviar mediante fetch a una API.
    alert('Gracias, ' + name + '. Tu mensaje ha sido recibido.');
    form.reset();
  };

  /* ======================================================
     FILTRADO Y ORDENAMIENTO EDITORIAL (sin cambiar textos)
     - Mantiene la estructura visual y las sinopsis intactas.
     - No recarga la página: todo se hace en DOM con JS.
     - Comentarios en español para principiantes.
     ====================================================== */

  // Metadata removed: restoring original behavior without genre rendering.
  // Previous genre-related logic caused visible metadata and layout issues.
  // Keeping DOM-driven titles/years and basic ordering/search functionality only.
  const metadata = [];

  // Elementos del DOM
  const peliculasSection = document.getElementById('peliculas');
  const controls = document.querySelector('.controls-filter');
  const orderSelect = document.getElementById('orderSelect');

  if(controls && peliculasSection){
    // Tomar todas las tarjetas (figures) y crear una estructura en memoria
    const items = Array.from(peliculasSection.querySelectorAll('.mag-item'))
      .map(el => {
        // Obtener el título tal como aparece (sin el <span class="year">)
        const h3 = el.querySelector('h3');
        let rawTitle = '';
        if(h3){
          // El primer nodo de texto del h3 contiene el título sin el span
          rawTitle = (h3.childNodes[0] && h3.childNodes[0].textContent) ? h3.childNodes[0].textContent.trim() : h3.textContent.trim();
        }
        const year = parseInt(el.querySelector('.year')?.textContent || '') || null;
        // Buscar metadato por coincidencia de clave o título (fuzzy)
        // Restore simple item model derived from DOM only (no genres/metadata rendered)
        return { el, title: rawTitle, year: year, genres: [], score: 0, popularity: 0 };
      });

    const showMoreBtn = document.getElementById('showMoreBtn');
    const showMoreWrapper = showMoreBtn?.parentElement;
    const initialVisibleCount = 6; // Cambia este valor si quieres mostrar más/menos tarjetas inicialmente
    const hiddenItems = items.slice(initialVisibleCount);
    let collectionExpanded = false;

    // Oculta las películas extra y mantiene solo las primeras 6 visibles
    // Esta parte añade la clase que las esconde con CSS.
    function hideExtraItems(){
      console.log('Ocultando películas extra:', hiddenItems.length);
      hiddenItems.forEach(item => {
        item.el.classList.add('hidden-movie');
        item.el.classList.remove('shown');
        item.el.classList.remove('visible');
        item.el.style.display = 'none';
      });
    }

    // Muestra suavemente las películas ocultas
    // Aquí quitamos la clase de oculto y forzamos una transición suave.
    function showExtraItems(){
      console.log('Mostrando películas ocultas:', hiddenItems.length);
      hiddenItems.forEach(item => {
        item.el.classList.remove('hidden-movie');
        item.el.classList.remove('filtered-out');
        item.el.classList.add('show-more-reveal');
        item.el.classList.add('shown');
        item.el.style.display = '';
        requestAnimationFrame(() => {
          item.el.classList.add('visible');
          item.el.classList.remove('show-more-reveal');
        });
      });
    }

    function updateShowMoreButton(){
      if(!showMoreBtn) return;
      showMoreBtn.textContent = collectionExpanded ? 'Mostrar menos' : 'Ver más';
      showMoreBtn.setAttribute('aria-expanded', collectionExpanded ? 'true' : 'false');
    }

    if(showMoreBtn){
      showMoreBtn.addEventListener('click', function(){
        console.log('Botón Ver más / Mostrar menos clickeado. expanded=', collectionExpanded);
        collectionExpanded = !collectionExpanded;
        if(collectionExpanded){
          showExtraItems();
          hiddenItems[0]?.el?.scrollIntoView({behavior:'smooth', block:'start'});
        } else {
          hideExtraItems();
          showMoreBtn.scrollIntoView({behavior:'smooth', block:'nearest'});
        }
        updateShowMoreButton();
      });
    }

    hideExtraItems();
    updateShowMoreButton();

    // Función para aplicar orden y búsqueda, reordenando los nodos en DOM
    function applyFilterAndOrder(){
      const order = orderSelect.value;

        // Obtener la consulta de búsqueda (pequeña barra)
        const query = (miniSearch && miniSearch.value) ? miniSearch.value.trim().toLowerCase() : '';

      // Filtrar en memoria por texto de búsqueda únicamente, sin modificar las sinopsis.
      const visible = items.filter(item => {
        if(hiddenItems.includes(item) && !item.el.classList.contains('shown')){
          return false;
        }
        const matchesQuery = !query || (item.title || '').toLowerCase().includes(query);
        return matchesQuery;
      });

      const orderedItems = [...items];

      // Ordenar según opción
      switch(order){
        case 'popular':
          orderedItems.sort((a,b) => b.popularity - a.popularity || b.score - a.score || (b.year||0) - (a.year||0));
          break;
        case 'recommended':
          orderedItems.sort((a,b) => b.score - a.score || b.popularity - a.popularity);
          break;
        case 'year-desc':
          orderedItems.sort((a,b) => (b.year||0) - (a.year||0) || b.score - a.score);
          break;
        case 'year-asc':
          orderedItems.sort((a,b) => (a.year||0) - (b.year||0) || b.score - a.score);
          break;
        case 'az':
          orderedItems.sort((a,b) => a.title.localeCompare(b.title));
          break;
        case 'za':
          orderedItems.sort((a,b) => b.title.localeCompare(a.title));
          break;
        default:
          break;
      }

      // Reinsertar todos los elementos en el orden calculado usando appendChild
      orderedItems.forEach((item) => {
        item.el.classList.add('reorder-anim');
        peliculasSection.appendChild(item.el);
        requestAnimationFrame(() => item.el.classList.remove('reorder-anim'));
      });

      // Mantener el botón siempre al final de la colección
      if(showMoreWrapper){
        peliculasSection.appendChild(showMoreWrapper);
      }

      // Ajustar visibilidad y estilos de cada tarjeta según la búsqueda, el orden y el estado expandido
      orderedItems.forEach(item => {
        const shouldBeVisible = visible.includes(item);
        if(shouldBeVisible){
          item.el.classList.remove('filtered-out');
          item.el.style.display = '';
          item.el.classList.remove('hidden-movie');
        } else {
          item.el.classList.add('filtered-out');
          item.el.style.display = 'none';
        }
      });
    }

    // Obtener el campo de búsqueda pequeño dentro de la barra compacta
    const miniSearch = document.getElementById('miniSearch');

    // Pequeña función debounce para evitar recalcular en cada pulsación
    function debounce(fn, wait){
      let t;
      return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); };
    }

    // Event listener para selects, búsqueda y filtro de género
    orderSelect.addEventListener('change', applyFilterAndOrder);
    if(miniSearch){
      miniSearch.addEventListener('input', debounce(applyFilterAndOrder, 180));
    }

    // Estado inicial: aplicar orden por defecto
    orderSelect.value = 'recommended';
    applyFilterAndOrder();
  }

});

/* Fin de script.js */
