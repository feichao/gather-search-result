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
      div.innerHTML = `
        <div class="--gather-search-result-continue--">
          <a href="${fun(keys)}" target="_blank">
            <img id="--gather-search-result-continue--img" src="${fav}" alt="FavIcon">
            <span>continue search "${keys}" with ${engine}</span>
          </a>
        </div>
      `;
      document.body.append(div);
    }
  }
})();