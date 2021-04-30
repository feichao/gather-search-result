(function() {
  const {
    getGatherResults,
    deleteGatherResultsByKey,
    deleteGatherResultsItem,
    getTargetElement
  } = window.__GatherSearchResultUtils;

  const container = document.getElementById('container');
  const emptyContainer = document.getElementById('empty-container');
  const searchKeyEl = document.getElementById('search-keys');
  const keysListEl = document.getElementById('keys-list');
  const resultsKeysEl = document.getElementById('results-keys');
  const resultsListEl = document.getElementById('results-list');

  container.style.display = 'none';
  emptyContainer.style.display = 'none';

  let selectedKey = null;
  let searchKey = '';
  let inputTimer = null;

  function prefixNum(num) {
    return ('0' + num).substr(-2);
  }

  function formatDate(d) {
    return [prefixNum(d.getMonth() + 1) , prefixNum(d.getDate()), d.getFullYear()].join('/') 
      + ' ' 
      + [prefixNum(d.getHours()), prefixNum(d.getMinutes()), prefixNum(d.getSeconds())].join(':');
  }

  function render() {
    const keyReg = new RegExp(searchKey, 'ig');
    getGatherResults().then(gatherResults => {
      const resultsArray = Object.keys(gatherResults).map(key => ({
        key,
        ...gatherResults[key]
      })).sort((r1, r2) => r2.createDate - r1.createDate).filter(r => !searchKey || keyReg.test(r.key));

      if (resultsArray.length > 0) {
        container.style.display = 'flex';
        emptyContainer.style.display = 'none';
        selectedKey = selectedKey || resultsArray[0].key;
        keysListEl.innerHTML = renderKeysHtml(selectedKey, resultsArray);
        resultsKeysEl.innerText = selectedKey;
        resultsListEl.innerHTML = renderResultsHtml(selectedKey, gatherResults[selectedKey].results);
      } else {
        container.style.display = 'none';
        emptyContainer.style.display = 'flex';
      }
    });
  }

  const renderKeysHtml = function(selectedKey, resultsArray) {
    return resultsArray.map(r => `
      <li data-key="${r.key}" class="${r.key === selectedKey ? 'selected' : ''}">
        <div class="key">${r.key}</div>
        <div class="create-date">${formatDate(new Date(r.createDate))}</div>
        <div class="delete" data-key="${selectedKey}"><img src="assets/delete.png" alt="DEL"></div>
      </li>
    `).join('');
  };

  const renderResultsHtml = function(selectedKey, results) {
    return results.sort((r1, r2) => r2.rate - r1.rate).map((r, i) => {
      const _gatherParam = window.encodeURI(`${r.engine}^${selectedKey}`);
      const url = new URL(r.resultURL);
      url.searchParams.set('__gsr_params', _gatherParam);
      return `<li>
        <div class="title">
          <img src="${/^http/.test(r.resultFavIcon) ? r.resultFavIcon : 'assets/browser.png'}" alt="ICON">
          <div>${r.resultTitle}</div>
        </div>
        <div class="url">
          <a href="${url.href}" target="_blank">${r.resultURL}</a>
        </div>
        <div class="rate">${
          new Array(10).fill(0).map((_, i) => {
            return i <= r.rate 
              ? `<img src="assets/star-good.png" alt="" class="star-good">`
              : `<img src="assets/star-normal.png" alt="" class="star-normal">`;
          }).join('')
        }</div>
        <div>
          <span class="engine">${r.engine || 'google'}</span>
          <span class="create-date">${formatDate(new Date(r.createDate))}</span>
        </div>
        <div class="delete" data-key="${selectedKey}" data-index="${i}"><img src="assets/delete.png" alt="DEL"></div>
      </li>
    `}).join('');
  };

  chrome.storage.onChanged.addListener(function(cahnges, area) {
    if (area === 'sync') {
      render();
    }
  });

  searchKeyEl.addEventListener('input', (event) => {
    const key = searchKeyEl.value;
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      selectedKey = null;
      searchKey = key;
      render();
    }, 500);
  });

  keysListEl.addEventListener('click', (event) => {
    let target;
    
    // delete
    target = getTargetElement(event.target, target => /delete/.test(target.className));
    if (target) {
      event.stopPropagation();
      const key = target.dataset['key'];
      if (key === selectedKey) { // delete selected item
        selectedKey = null;
      }
      deleteGatherResultsByKey(key).then(render);
      return;
    }

    // select
    target = getTargetElement(event.target, target => (target.tagName || '').toUpperCase() === 'LI');
    if (target) {
      selectedKey = target.dataset['key'];
      render();
      return;
    }
  });

  resultsListEl.addEventListener('click', (event) => {
    let target = getTargetElement(event.target, target => /delete/.test(target.className));
    if (target) {
      event.stopPropagation();
      const key = target.dataset['key'];
      const index = target.dataset['index'];
      deleteGatherResultsItem(key, index).then(isDeleteKey => {
        if (isDeleteKey) {
          selectedKey = null;
        }
        render();
      });
    }
  });

  render();
})();