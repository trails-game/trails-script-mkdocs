(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://cdn.trails-game.com/gtmr.js?ver=1&id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PMVWJ68');

location$.subscribe(function (url) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event: 'pageview'});
});

function updateLightBox() {
  const productImageGroups = [];
    $('.imgLightbox').each(function() {
      const productImageSource = $(this).attr('src');
      const productImageTag = 't' + $(this).attr('tag');
      let productImageTitle = $(this).attr('title');
      productImageTitle = productImageTitle ? 'title="' + productImageTitle + '" ' : '';

      $(this).wrap('<a class="' + productImageTag + '" ' + productImageTitle +
                   'href="' + productImageSource + '"></a>');
      productImageGroups.push('.' + productImageTag);
    });
    jQuery.unique( productImageGroups );
    productImageGroups.forEach(value => GLightbox({selector: value}));
}

document$.subscribe(function (url) {
  updateLightBox();
});
