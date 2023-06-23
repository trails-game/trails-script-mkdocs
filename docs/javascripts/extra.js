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

const authorInfo = {
  "冰镇南瓜汁": {
    name: "冰镇南瓜汁",
    avatar: "/images/contributors/冰镇南瓜汁.webp",
    link: "https://trails-game.com/about/team/"
  },
  "CC": {
    name: "C.C.",
    avatar: "/images/contributors/cc.webp",
    link: "https://trails-game.com/about/team/"
  },
  "Winston": {
    name: "Winston",
    avatar: "/images/contributors/winston.webp",
    link: "https://space.bilibili.com/392143020"
  },
  "Rieveldt": {
    name: "Rieveldt624",
    avatar: "/images/contributors/Rieveldt624.webp",
    link: "https://trails-game.com/about/team/"
  },
  "linsage": {
    name: "linsage",
    avatar: "/images/contributors/linsage.webp",
    link: "https://trails-game.com/about/team/"
  },
  "XDi": {
    name: "XDi",
    avatar: "/images/contributors/XDi.webp",
    link: "https://space.bilibili.com/10822381"
  },
  "Flytutu": {
    name: "Flytutu",
    avatar: "/images/contributors/flytutu.webp",
    link: "https://trails-game.com/about/team/"
  },
  "无始无过亦无终": {
    name: "无始无过亦无终",
    avatar: "/images/contributors/无始无过亦无终.webp",
    link: "https://space.bilibili.com/13364946"
  },
};

function renderAuthorBlock() {
  $('.authors').each(function() {
    try {
      const authors = JSON.parse($(this).attr('authorList'));
      
      var listStr = "";
      for (let user of authors) {
        const currAuthor = authorInfo[user];
        listStr += `<li><a href="${currAuthor.link}" target="__blank"><img class="avatar" src="${currAuthor.avatar}"/>${currAuthor.name}</a></li>\n`;
      }

      $(this).replaceWith(`
    <ul class="metadata page-metadata">
      <li class="contributors">
      <span class="contributors-text">本页面由以下成员整理提供:</span>
      <ul class="contributors">
        ${listStr}
      </ul>
      </li>
    </ul>
    `);
  } catch (e) {
    $(this).replaceWith(`
    <div class="metadata page-metadata">
      <span class="contributors-text">If you see this message, make sure you have properly defined the author name in javascripts/extra.js. Also make sure you have no space in authorList attribute.</span>
    </div>
    `);
  }
  })
}

document$.subscribe(function (url) {
  updateLightBox();
  renderAuthorBlock();
});
