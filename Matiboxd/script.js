const API_KEY = "8d79725bdfff0156fea3564a664caeba";

const navLinks = document.querySelector('.navbar__links');
const busquedas = document.querySelector('#search');
const contenedorPeliculas = document.querySelector('.movies__container');
const modal = document.querySelector("#movie-modal");
const btnCerrarModal = document.querySelector("#modal-close");
const modalImg = document.querySelector("#modal-img");
const modalTitle = document.querySelector("#modal-title");
const modalDate = document.querySelector("#modal-date");
const modalRating = document.querySelector("#modal-rating");
const modalOverview = document.querySelector("#modal-overview");
const btnMenu = document.querySelector("#btn-menu");
const formulario = document.querySelector("#formulario");
const menuOverlay = document.querySelector("#menu-overlay");
const btnMiLista = document.querySelector('#btn-mi-lista');
const logo = document.querySelector('#logo');

// 2. Le agregamos el evento de clic
logo.addEventListener('click', () => {
    
    // A. Volvemos a cargar las películas de la pantalla principal
    cargarPopulares();
    
    // B. Limpiamos lo que haya quedado escrito en el buscador
    busquedas.value = '';
    
    // C. Si el usuario estaba en celular y tenía el menú abierto, lo cerramos
    formulario.classList.remove("menu-activo");
    menuOverlay.classList.add("hidden");
    btnMenu.textContent = "☰";
});

btnMiLista.addEventListener('click', (e) => {
    e.preventDefault(); // Evitamos que la página salte

    // 1. Si el menú de celular estaba abierto, lo cerramos
    formulario.classList.remove("menu-activo");
    menuOverlay.classList.add("hidden");
    btnMenu.textContent = "☰";

    // 2. Traemos las películas de tu bóveda
    let miLista = JSON.parse(localStorage.getItem('matiboxd_vistas')) || [];

    // 3. Limpiamos la pantalla principal
    contenedorPeliculas.innerHTML = '';

    // 4. Si la lista está vacía, mostramos un mensaje
    if (miLista.length === 0) {
        contenedorPeliculas.innerHTML = `
            <h2 style="grid-column: 1 / -1; text-align: center; margin-top: 50px;">
                Todavía no guardaste ninguna película 🍿
            </h2>`;
        return; // Cortamos la función acá
    }

    // 5. Si hay películas, las dibujamos una por una
    miLista.forEach(pelicula => {
        const tarjetaHTML = `
            <div class="movie__card">
                <img src="${pelicula.poster}" alt="Póster de ${pelicula.titulo}">
                <h3>${pelicula.titulo}</h3>
                <button class="btn-eliminar" data-id="${pelicula.id}" style="background-color: #ff4d4d; color: white;">
                    Eliminar
                </button>
            </div>
        `;
        contenedorPeliculas.innerHTML += tarjetaHTML;
    });
});

btnMenu.addEventListener("click", (e) => {
    e.preventDefault(); 
    
    formulario.classList.toggle("menu-activo");
    menuOverlay.classList.toggle("hidden");
    
    // Cambiamos el icono según si está abierto o cerrado
    if (formulario.classList.contains("menu-activo")) {
        btnMenu.textContent = "X";
    } else {
        btnMenu.textContent = "☰";
    }
});

menuOverlay.addEventListener("click", () => {
    formulario.classList.remove("menu-activo");
    menuOverlay.classList.add("hidden");
    btnMenu.textContent = "☰"; 
});

// Esta función recibe un array de películas y las dibuja en el HTML
function mostrarPeliculas(listaDePeliculas) {
    contenedorPeliculas.innerHTML = ''; // Limpiamos lo que haya

    listaDePeliculas.forEach(pelicula => {
        const urlImagen = pelicula.poster_path 
            ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=Sin+Poster';

        const tarjetaHTML = `
            <div class="movie__card">
                <img src="${urlImagen}" alt="Póster de ${pelicula.title}" data-sinopsis="${pelicula.overview}" data-fecha="${pelicula.release_date}" data-puntaje="${pelicula.vote_average}" data-titulo="${pelicula.title}">
                <h3>${pelicula.title}</h3>
                <button class="btn-guardar" data-id="${pelicula.id}" data-titulo="${pelicula.title}" data-poster="${urlImagen}">
                    Marcar como vista
                </button>
            </div>
        `;
        contenedorPeliculas.innerHTML += tarjetaHTML;
    });
}

async function cargarPopulares() {
    try {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;

        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        
        mostrarPeliculas(datos.results);
    } catch (error) {
        console.error("Hubo un error cargando las películas populares:", error);
    }
}


cargarPopulares();

navLinks.addEventListener('submit', async (e) => {
    e.preventDefault();
    let busqueda = busquedas.value;

    try {
        const url = `https://api.themoviedb.org/3/search/movie?query=${busqueda}&api_key=${API_KEY}&language=es-ES`;

        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        mostrarPeliculas(datos.results);

    } catch (error) {
        console.error("Hubo un error con la búsqueda:", error);
    }
    
    busquedas.value = ''; 
});

contenedorPeliculas.addEventListener('click', (e) => {
    
    if (e.target.classList.contains('btn-guardar')) {
        
        const id = e.target.getAttribute('data-id');
        const titulo = e.target.getAttribute('data-titulo');
        const poster = e.target.getAttribute('data-poster');

        const peliculaParaGuardar = {
            id: id,
            titulo: titulo,
            poster: poster
        };

        let miLista = JSON.parse(localStorage.getItem('matiboxd_vistas')) || [];

        const peliculaYaExiste = miLista.find(peli => peli.id === id);

        if (!peliculaYaExiste) {
            
            miLista.push(peliculaParaGuardar);
            
            localStorage.setItem('matiboxd_vistas', JSON.stringify(miLista));
            
        
            e.target.textContent = '¡Vista! 🍿';
            e.target.style.backgroundColor = '#E4D5B7';
            e.target.style.color = '#3F3A3A';
            e.target.style.opacity = "70%";
            e.target.style.marginBottom = "5px";
        } else {
            alert('¡Ya marcaste esta película como vista!');
        }
    } else if (e.target.tagName === "IMG") {

        const sinopsis = e.target.getAttribute("data-sinopsis");
        const fecha = e.target.getAttribute("data-fecha");
        const puntaje = e.target.getAttribute("data-puntaje");
        const titulo = e.target.getAttribute("data-titulo");

        modalTitle.textContent = titulo;
        modalDate.textContent = fecha;
        modalImg.src = e.target.src;
        modalOverview.textContent = sinopsis;
        modalRating.textContent = puntaje; 


        modal.classList.remove("hidden");

    }
});

btnCerrarModal.addEventListener("click", () => {
    modal.classList.add("hidden");
})