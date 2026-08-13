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

function mostrarPeliculas(listaDePeliculas) {
    contenedorPeliculas.innerHTML = '';
    const fragment = document.createDocumentFragment(); 

    listaDePeliculas.forEach(pelicula => {
        const card = crearTarjetaPelicula(pelicula); 
        fragment.appendChild(card); 
    });

    contenedorPeliculas.appendChild(fragment); 
}

function crearTarjetaPelicula(pelicula) {
    const urlImagen = pelicula.poster_path
        ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`
        : 'https://via.placeholder.com/500x750?text=Sin+Poster';

    const card = document.createElement('div');
    card.className = 'movie__card';

    const img = document.createElement('img');
    img.src = urlImagen;
    img.alt = `Póster de ${pelicula.title}`;
    img.dataset.sinopsis = pelicula.overview;
    img.dataset.fecha = pelicula.release_date;
    img.dataset.puntaje = pelicula.vote_average;
    img.dataset.titulo = pelicula.title;

    const h3 = document.createElement('h3');
    h3.textContent = pelicula.title;

    const btnGuardar = document.createElement('button');
    btnGuardar.className = 'btn-guardar';
    btnGuardar.textContent = 'Marcar como vista';
    btnGuardar.dataset.id = pelicula.id;
    btnGuardar.dataset.titulo = pelicula.title;
    btnGuardar.dataset.poster = urlImagen;

    card.appendChild(img);
    card.appendChild(h3);
    card.appendChild(btnGuardar);

    return card;
}

logo.addEventListener('click', () => {
    cargarPopulares();
    busquedas.value = '';
    formulario.classList.remove("menu-activo");
    menuOverlay.classList.add("hidden");
    btnMenu.textContent = "☰";
});

btnMiLista.addEventListener('click', (e) => {
    e.preventDefault();
    formulario.classList.remove("menu-activo");
    menuOverlay.classList.add("hidden");
    btnMenu.textContent = "☰";

    let miLista = JSON.parse(localStorage.getItem('matiboxd_vistas')) || [];
    contenedorPeliculas.innerHTML = '';

    if (miLista.length === 0) {
        contenedorPeliculas.innerHTML = `
            <h2 style="grid-column: 1 / -1; text-align: center; margin-top: 50px;">
                Todavía no guardaste ninguna película 🍿
            </h2>`;
        return;
    }

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
    let miLista = JSON.parse(localStorage.getItem('matiboxd_vistas')) || [];

    if (e.target.classList.contains('btn-guardar')) {
        const id = e.target.getAttribute('data-id');
        const titulo = e.target.getAttribute('data-titulo');
        const poster = e.target.getAttribute('data-poster');

        const peliculaParaGuardar = { id, titulo, poster };
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
        modalTitle.textContent = e.target.getAttribute("data-titulo");
        modalDate.textContent = e.target.getAttribute("data-fecha");
        modalImg.src = e.target.src;
        modalOverview.textContent = e.target.getAttribute("data-sinopsis");
        modalRating.textContent = e.target.getAttribute("data-puntaje"); 
        modal.classList.remove("hidden");
    } else if (e.target.classList.contains("btn-eliminar")) {
        const idCapturado = e.target.getAttribute("data-id");
        miLista = miLista.filter(pelicula => pelicula.id !== idCapturado);
        localStorage.setItem('matiboxd_vistas', JSON.stringify(miLista));
        btnMiLista.click();
    }
});

btnCerrarModal.addEventListener("click", () => {
    modal.classList.add("hidden");
});

cargarPopulares();