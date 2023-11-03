// Referencias del HTML
const resultsDiv = document.getElementById( 'results' );
const searchInput = document.getElementById( 'searchInput' );
const loadingModal = document.getElementById( 'loadingModal' );
const $interfaz = document.querySelector( '#interfaz' );
const errorSearch = document.querySelector( '#error-search' );
const $searchContainer = document.querySelector( '#searchContainer' );
const $resetButton = document.querySelector( '#resetButton' );

//URL de la API
const apiURL = 'https://rickandmortyapi.com/api/character/';

let allCharacters = [];
let charactersToObserve = [];
let isLastPage = false;
let currentPage = 1;
let isLoading = false;

// Función para manejar la carga de personajes desde la API
async function fetchCharacters() {
 isLoading = true;
 loadingModal.style.opacity = 1;
 try {
  while ( !isLastPage ) {
   const response = await fetch( `${apiURL}?page=${currentPage}` );
   if ( !response.ok ) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Ha ocurrido un error de conexión. Por favor, verifica tu conexión a Internet.';
    throw new Error( 'Network response was not ok.' );
   }
   const data = await response.json();
   allCharacters = allCharacters.concat( data.results );
   isLoading = false;
   if ( currentPage === data.info.pages ) {
    isLastPage = true;
   }
   currentPage++;
  }
  charactersToObserve = allCharacters.slice();
  loadingModal.style.display = 'none';
  $interfaz.style.display = 'block';
  createCharacterDiv( 0 );
  return allCharacters;
 } catch ( error ) {
  console.log( 'Rick y Morty Error' );
  console.error( 'Error de conexión:', error );
  const errorMessage = document.getElementById( 'error-message' );
  errorMessage.style.display = 'block';
  errorMessage.textContent = 'Ha ocurrido un error de conexión. Por favor, verifica tu conexión a Internet.';
 }
}

//Creación de los personajes
function createCharacterDiv( index ) {
 if ( index < charactersToObserve.length ) {
  const character = charactersToObserve[index];
  const characterDiv = document.createElement( 'div' );
  characterDiv.classList.add( 'character' );

  const characterImageContainer = document.createElement( "div" );
  characterImageContainer.classList.add( "character-image-container" );

  const characterImage = document.createElement( "img" );
  characterImage.classList.add( "lazy-load-img" );
  characterImage.dataset.src = character.image;
  characterImage.title = character.name;
  characterImage.alt = character.name;

  characterImageContainer.appendChild( characterImage );

  const characterInfoDiv = document.createElement( "div" );
  characterInfoDiv.classList.add( "character-info" );

  const characterId = document.createElement( "h2" );
  characterId.textContent = `ID: ${character.id}`;

  const characterName = document.createElement( "h3" );
  characterName.textContent = `${character.name}`;

  const characterSpecies = document.createElement( "p" );
  characterSpecies.textContent = `${character.species}`;

  const characterOrigin = document.createElement( "p" );
  characterOrigin.textContent = `${character.origin.name}`;

  characterInfoDiv.appendChild( characterName );
  characterInfoDiv.appendChild( characterSpecies );
  characterInfoDiv.appendChild( characterOrigin );

  characterDiv.appendChild( characterImageContainer );
  characterDiv.appendChild( characterInfoDiv );

  resultsDiv.appendChild( characterDiv );

  observer.observe( characterDiv );
  LazyLoadImgObserver.observe( characterImage );
 }
}

function handleSearch() {
 const searchTerm = searchInput.value.trim().toLowerCase();
 if ( searchTerm.length < 3 ) {
  showError( 'Este campo debe tener al menos 3 caracteres', 'red' );
  return;
 }
 errorSearch.innerHTML = '';
 charactersToObserve = allCharacters.filter( ( character ) =>
  character.name.toLowerCase().includes( searchTerm )
 );
 if ( charactersToObserve.length === 0 ) {
  showError( `El personaje "${searchTerm}" no existe en la serie`, 'red' );
  return;
 }
 resetButton.style.display = 'block';
 showError( '', '#bdd066' );
 resultsDiv.innerHTML = '';
 createCharacterDiv( 0 );
}

// Función para mostrar errores
function showError( message, borderColor ) {
 errorSearch.innerHTML = message;
 errorSearch.style.display = message ? 'block' : 'none';
 $searchContainer.style.borderColor = borderColor;
 $searchContainer.style.boxShadow = borderColor ? `0px 0px 8px 4px ${borderColor}` : 'none';
}

searchInput.addEventListener( 'keyup', function ( event ) {
 if ( event.key === 'Escape' ) {
  showError( '', '#bdd066' );
  searchInput.value = '';
  return;
 }
 if ( event.key === 'Enter' ) {
  handleSearch();
 }
} );

searchInput.addEventListener( "focus", () => $searchContainer.style.boxShadow = "0px 0px 8px 4px #bdd066" );

searchInput.addEventListener( "focusout", () => {
 searchInput.value = '';
 $searchContainer.style.boxShadow = "none";
 errorSearch.innerHTML = '';
 errorSearch.style.display = 'none';
 $searchContainer.style.borderColor = "#bdd066";
} );

resetButton.addEventListener( 'click', function () {
 searchInput.value = '';
 charactersToObserve = allCharacters.slice();
 resultsDiv.innerHTML = '';
 createCharacterDiv( 0 );
 resetButton.style.display = 'none';
 errorSearch.style.display = 'none';
} );

//Observer para los personajes
const callback = ( entries, observer ) => {
 entries.forEach( entry => {
  if ( entry.isIntersecting ) {
   const characterDiv = entry.target;
   const index = Array.from( characterDiv.parentNode.children ).indexOf( characterDiv );
   createCharacterDiv( index + 1 ); // Carga el siguiente personaje
   observer.unobserve( entry.target );
  }
 } );
};
const options = {
 root: null,
 rootMargin: '0px',
 threshold: 0.1,
};
const observer = new IntersectionObserver( callback, options );

//Observer para las imágenes
const callbackLazyLoadImg = ( entries, LazyLoadImgObserver ) => {
 entries.forEach( ( entry ) => {
  if ( entry.isIntersecting ) {
   entry.target.src = entry.target.dataset.src;
   entry.target.classList.add( 'fade-lazy-load-img' );
   LazyLoadImgObserver.unobserve( entry.target );
  }
 } );
};
const optionsLazyLoadImg = {
 rootMargin: '0px',
 threshold: 0.1,
};
const LazyLoadImgObserver = new IntersectionObserver( callbackLazyLoadImg, optionsLazyLoadImg );

fetchCharacters();