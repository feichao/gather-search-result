(function() {
  const engines = {
    'google.com': function(key) {
      return `https://www.google.com.hk/search?q=${key}`;
    },
    'baidu.com': function(key) {
      return `https://www.baidu.com/s?wd=${key}`;
    },
    'bing.com': function(key) {
      return `https://bing.com/search?q=${key}`;
    },
    'sogou.com': function(key) {
      return `https://www.sogou.com/web?query=${key}`;
    },
    'so.com': function(key) {
      return `https://www.so.com/s?q=${key}`;
    },
    'yahoo.com': function(key) {
      return `https://search.yahoo.com/search?p=${key}`;
    },
    'yandex.com': function(key) {
      return `https://yandex.com/search/?text=${key}`;
    },
    'duckduckgo.com': function(key) {
      return `https://duckduckgo.com/?q=${key}`;
    },
  };

  const url = new URL(window.location.href);
  const GSRParams = url.searchParams.get('__gsr_params');
  if (GSRParams) {
    const params = decodeURI(GSRParams).split('^');
    const engine = params[0];
    const keys = params[1];
    const engineRE = new RegExp(engine);
    const hrefFuns = Object.keys(engines).filter(eg => engineRE.test(eg));
    if (hrefFuns.length > 0) {
      const fun = engines[hrefFuns[0]];
      const div = document.createElement('div');
      const fav = chrome.runtime.getURL('fav.png');
      const close = chrome.runtime.getURL('assets/close.png');
      div.innerHTML = `
        <div id="--gather-search-result-continue--" class="--gather-search-result-continue--">
          <a href="${fun(keys)}" target="_blank">
            <img src="${fav}" alt="FavIcon">
            <span>continue search "<span class="--gather-search-result-continue--keys">${keys}</span>" with ${engine}</span>
          </a>
          <div id="--gather-search-result-continue--close" class="--gather-search-result-continue--close">
            <img src="${close}" alt="close">
          </div>
        </div>
      `;
      document.body.append(div);
      setTimeout(() => {
        document.getElementById('--gather-search-result-continue--close').addEventListener('click', function(event) {
          event.stopPropagation();

          const wrap = document.getElementById('--gather-search-result-continue--');
          wrap.remove();
        });
      }, 1000);
    }
  }
})();