(function () {
  const {
    getKeySource,
    setKeySource,
    getGatherKeys,
    getGatherResults,
    setGatherResults,
    getTargetElement
  } = window.__GatherSearchResultUtils;

  const MAX_RESULTS = 1000;
  const header = document.getElementById('header');
  const confirmEle = document.getElementById('confirm');
  const gotoGatherList = document.getElementById('goto-gather-list');
  const searchKeyEle = document.getElementById('keys-input');
  const searchRateEle = document.getElementById('rates-star-list');
  const searchKeySource = document.getElementById('keys-source');
  const searchKeyList = document.getElementById('keys-list');
  const KEY_SOURCE = {
    SEARCH: 'SEARCH',
    SAVED: 'SAVED'
  };

  let rate = 6;
  let resultURL = '';
  let resultTitle = '';
  let resultFavIcon = '';
  let isSaved = false;
  let searchKeys = [];
  let searchResultKeys = [];
  let keysSource = KEY_SOURCE.SEARCH;

  getKeySource().then(s => {
    keysSource = s || KEY_SOURCE.SEARCH;
    searchKeySource.checked = keysSource === KEY_SOURCE.SAVED;
    Promise.all([getGatherKeys(), getGatherResults()]).then(([a1, a2]) => {
      searchKeys = a1;
      searchResultKeys = Object.keys(a2);
    }).then(() => setKeysList());
  });

  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function(tabs) {
    if (Array.isArray(tabs) && tabs.length > 0) {
      resultURL = tabs[0].url;
      resultTitle = tabs[0].title;
      resultFavIcon = /^http/.test(tabs[0].favIconUrl) ? tabs[0].favIconUrl : 'assets/browser.png';
      document.getElementById('loading').className = 'loading';
      document.getElementById('result-content').innerHTML = `
        <img src="${resultFavIcon}" alt="">
        <span>${resultTitle}</span>
      `;
    }
  });

  function setSatrRate(rate) {
    const lis = searchRateEle.children;
    for(let i = 0; i < lis.length; i++) {
      lis[i].className = i <= rate ? 'active' : '';
    }
  }

  function getHoverRate(target) {
    const lis = searchRateEle.children;
    const li = getTargetElement(target, target => (target.tagName || '').toUpperCase() === 'LI');
    return Array.from(lis).indexOf(li);
  }

  function setKeysList() {
    const isKeySourceSearch = keysSource === KEY_SOURCE.SEARCH;
    keys = isKeySourceSearch ? searchKeys : searchResultKeys;
    searchKeyList.innerHTML = (Array.isArray(keys) ? keys : [])
      // .filter(k => new String(k).match(searchKeyEle.value))
      .map((key) => {
        const temp = key.indexOf('^');
        const engine = key.substr(0, temp);
        const _key = key.substr(temp + 1);
        return `<li data-engine="${engine}" data-key="${_key}">
          <span class="engine">${isKeySourceSearch ? engine : 'Saved'}</span>
          <span>${_key}</span>
        </li>`;
      }).join('');
  }

  chrome.storage.onChanged.addListener(function(data) {
    getGatherKeys().then(keys => {
      searchKeys = keys;
      setKeysList();
    });
    getGatherResults().then(results => {
      searchResultKeys = Object.keys(results);
    });
  });

  document.body.addEventListener('click', function() {
    searchKeyList.style.display = 'none';
  });

  searchRateEle.addEventListener('mouseover', function(event) {
    setSatrRate(getHoverRate(event.target));
  });
  searchRateEle.addEventListener('mouseleave', function(event) {
    setSatrRate(rate);
  });
  searchRateEle.addEventListener('click', function(event) {
    rate = getHoverRate(event.target);
    setSatrRate(rate);
  });

  confirmEle.addEventListener('click', function(event) {
    const searchKey = searchKeyEle.value;
    const engine = searchKeyEle.dataset['engine'] || 'google';
    if (!searchKey || isSaved) {
      return;
    }

    getGatherResults().then(function(rets) {
      const r = {
        rate,
        engine,
        resultURL,
        resultTitle,
        resultFavIcon,
        createDate: +new Date,
      };
      if (rets[searchKey] && Array.isArray(rets[searchKey].results)) {
        let isExist = false;

        const rs = rets[searchKey].results;
        for (let i = 0; i < rs.length; i++) {
          if (resultURL === rs[i].resultURL) {
            rets[searchKey].results.splice(i, 1, r);
            isExist = true;
            break;
          }
        }
        
        if (!isExist) {
          rets[searchKey].results.push(r);
        }
      } else {
        rets[searchKey] = {
          createDate: +new Date,
          results: [r]
        };
      }
      setGatherResults(rets);

      isSaved = true;
      confirmEle.innerText = 'Saved!'
      confirmEle.className = 'saved';
      setTimeout(() => {
        isSaved = false;
        confirmEle.innerText = 'Save';
        confirmEle.className = '';
      }, 3000);
    });
  });

  gotoGatherList.addEventListener('click', function(event) {
    event.preventDefault();
    chrome.runtime.openOptionsPage(function() {});
  });

  let inputTimer;
  searchKeyEle.addEventListener('keyup', () => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      setKeysList();
    }, 150);
  });

  searchKeySource.addEventListener('change', () => {
    keysSource = searchKeySource.checked ? KEY_SOURCE.SAVED : KEY_SOURCE.SEARCH;
    setKeySource(keysSource);
    setKeysList();
  });

  searchKeyEle.addEventListener('click', function(event) {
    event.stopPropagation();
    searchKeyList.style.display = 'block';
  });

  searchKeyList.addEventListener('click', function(event) {
    const target = getTargetElement(event.target, target => (target.tagName || '').toUpperCase() === 'LI');
    searchKeyEle.dataset['engine'] = target.dataset['engine'];
    searchKeyEle.value = target.dataset['key'];
    searchKeyList.style.display = 'none';
  });

  header.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  setSatrRate(rate);
})();