const $toTop = document.querySelector( '.scroll-top-btn' );
window.addEventListener( 'scroll', () => {
 if ( window.pageYOffset > 100 ) {
  $toTop.classList.remove( 'hidden' );
 } else {
  $toTop.classList.add( 'hidden' );
 };
} );