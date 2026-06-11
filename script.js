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

    
    alert('Gracias, ' + name + '. Tu mensaje ha sido recibido.');
    form.reset();
  };

  const metadata = [
    { key: 'camino salvaje', title: 'Camino Salvaje', year: 2007, genres: ['drama'], score: 9, popularity: 78 },
    { key: 'intelestelar', title: 'Intelestelar', year: 2014, genres: ['ciencia ficción', 'drama'], score: 10, popularity: 94 },
    { key: 'amelie', title: 'Amelie', year: 2001, genres: ['comedia', 'romance'], score: 9, popularity: 81 },
    { key: 'notting hill', title: 'Un Lugar Llamado Notting Hill', year: 1999, genres: ['comedia', 'romance'], score: 7, popularity: 72 },
    { key: 'aftersun', title: 'Aftersun', year: 2022, genres: ['drama'], score: 8, popularity: 63 },
    { key: 'el club de la pelea', title: 'El Club de la Pelea', year: 1999, genres: ['drama', 'thriller'], score: 9, popularity: 88 },
    { key: 'lalaland', title: 'La La Land', year: 2016, genres: ['romance', 'comedia'], score: 8, popularity: 86 },
    { key: 'el origen', title: 'El Origen', year: 2010, genres: ['ciencia ficción', 'thriller'], score: 9, popularity: 90 },
    { key: 'maria antonieta', title: 'Maria Antonieta', year: 2006, genres: ['drama'], score: 7, popularity: 58 },
    { key: 'pequeñas grandes amigas', title: 'Pequeñas Grandes Amigas', year: 2003, genres: ['coming of age', 'comedia'], score: 7, popularity: 46 },
    { key: 'el grand hotel budapest', title: 'El Grand Hotel Budapest', year: 2014, genres: ['comedia', 'drama'], score: 9, popularity: 80 },
    { key: 'la sociedad de los poetas muertos', title: 'La Sociedad de los Poetas Muertos', year: 1989, genres: ['drama'], score: 10, popularity: 75 },
    { key: 'las ventajas de ser invisible', title: 'Las Ventajas de Ser Invisible', year: 2012, genres: ['coming of age', 'drama'], score: 8, popularity: 64 },
    { key: 'yo antes de ti', title: 'Yo Antes de Ti', year: 2016, genres: ['romance', 'drama'], score: 6, popularity: 55 },
    { key: 'eterno resplandor', title: 'Eterno Resplandor de una Mente sin Recuerdos', year: 2004, genres: ['romance', 'drama'], score: 10, popularity: 89 },
    { key: 'pequeña miss sunshine', title: 'Pequeña Miss Sunshine', year: 2006, genres: ['comedia', 'drama'], score: 8, popularity: 70 },
    { key: 'vidas pasadas', title: 'Vidas Pasadas', year: 2023, genres: ['drama', 'romance'], score: 9, popularity: 50 },
    { key: 'forrest gump', title: 'Forrest Gump', year: 1994, genres: ['comedia', 'drama'], score: 10, popularity: 95 },
    { key: 'casi famosos', title: 'Casi Famosos', year: 2000, genres: ['coming of age', 'comedia'], score: 8, popularity: 60 },
    { key: 'comer rezar amar', title: 'Comer Rezar Amar', year: 2010, genres: ['romance', 'drama'], score: 6, popularity: 52 },
    { key: 'expacion', title: 'Expacion, Deseo y Pecado', year: 2007, genres: ['drama'], score: 6, popularity: 44 }
  ];

 
  const peliculasSection = document.getElementById('peliculas');
  const controls = document.querySelector('.controls-filter');
  const orderSelect = document.getElementById('orderSelect');
  const genreSelect = document.getElementById('genreSelect');

  if(controls && peliculasSection){
    
    const items = Array.from(peliculasSection.querySelectorAll('.mag-item'))
      .map(el => {
        
        const h3 = el.querySelector('h3');
        let rawTitle = '';
        if(h3){
          
          rawTitle = (h3.childNodes[0] && h3.childNodes[0].textContent) ? h3.childNodes[0].textContent.trim() : h3.textContent.trim();
        }
        const year = parseInt(el.querySelector('.year')?.textContent || '') || null;
        
        const key = rawTitle.toLowerCase();
        const meta = metadata.find(m => key.includes(m.key) || m.title.toLowerCase().includes(key)) || null;
        
        const dataGenero = el.dataset.genero ? el.dataset.genero.split(',').map(g => g.trim().toLowerCase()) : [];
        const genres = dataGenero.length ? dataGenero : ((meta && meta.genres) || []).map(g => g.toLowerCase());

        return { el, title: rawTitle, year: (meta && meta.year) || year, genres, score: (meta && meta.score) || 0, popularity: (meta && meta.popularity) || 0 };
      });

    const showMoreBtn = document.getElementById('showMoreBtn');
    const showMoreWrapper = showMoreBtn?.parentElement;
    const initialVisibleCount = 6; // Cambia este valor si quieres mostrar más/menos tarjetas inicialmente
    const hiddenItems = items.slice(initialVisibleCount);
    let collectionExpanded = false;

    
    function hideExtraItems(){
      console.log('Ocultando películas extra:', hiddenItems.length);
      hiddenItems.forEach(item => {
        item.el.classList.add('hidden-movie');
        item.el.classList.remove('shown');
        item.el.classList.remove('visible');
        item.el.style.display = 'none';
      });
    }

    
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

    
    function applyFilterAndOrder(){
      const order = orderSelect.value;

        
        const query = (miniSearch && miniSearch.value) ? miniSearch.value.trim().toLowerCase() : '';

      const selectedGenre = genreSelect ? genreSelect.value : 'all';
     
      const visible = items.filter(item => {
        if(hiddenItems.includes(item) && !item.el.classList.contains('shown')){
          return false;
        }
        const matchesGenre = selectedGenre === 'all' || item.genres.some(g => g.toLowerCase() === selectedGenre);
        const matchesQuery = !query || (item.title || '').toLowerCase().includes(query);
        return matchesGenre && matchesQuery;
      });

      const orderedItems = [...items];

      
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

      
      orderedItems.forEach((item) => {
        item.el.classList.add('reorder-anim');
        peliculasSection.appendChild(item.el);
        requestAnimationFrame(() => item.el.classList.remove('reorder-anim'));
      });

      
      if(showMoreWrapper){
        peliculasSection.appendChild(showMoreWrapper);
      }

     
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

    
    const miniSearch = document.getElementById('miniSearch');

    
    function debounce(fn, wait){
      let t;
      return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); };
    }

    
    orderSelect.addEventListener('change', applyFilterAndOrder);
    if(genreSelect){
      genreSelect.addEventListener('change', applyFilterAndOrder);
    }
    if(miniSearch){
      miniSearch.addEventListener('input', debounce(applyFilterAndOrder, 180));
    }

    
    orderSelect.value = 'recommended';
    applyFilterAndOrder();
  }

});


