const API_KEY = "8d79725bdfff0156fea3564a664caeba";

const formulario = document.querySelector('.navbar__sexo');
const busquedas = document.querySelector('#search');
const contenedorPeliculas = document.querySelector('.movies__container');
const modal = document.querySelector("#movie-modal");
const btnCerrarModal = document.querySelector("#modal-close");
const modalImg = document.querySelector("#modal-img");
const modalTitle = document.querySelector("#modal-title");
const modalDate = document.querySelector("#modal-date");
const modalRating = document.querySelector("#modal-rating");
const modalOverview = document.querySelector("#modal-overview");

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

formulario.addEventListener('submit', async (e) => {
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