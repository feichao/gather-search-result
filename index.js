(function() {
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

   /**
   * gatherResults
   * {
   *    [key]: {
   *      createDate
   *      results: [{
   *        rate
   *        resultFavIcon
   *        resultTitle
   *        resultURL
   *        createDate
   *      }]
   *    }
   */
   function getGatherResults() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('gatherResults', function(data) {
        resolve(data.gatherResults || {});
      });
    });
  };

  function formatDate(d) {
    return [d.getFullYear(), d.getMonth() + 1 , d.getDate()].join('/') + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
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
        resultsListEl.innerHTML = renderResultsHtml(gatherResults[selectedKey].results);
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
      </li>
    `).join('');
  };

  const renderResultsHtml = function(results) {
    return results.sort((r1, r2) => r2.rate - r1.rate).map(r => `
      <li>
        <div class="title">
          <img src="${/^http/.test(r.resultFavIcon) ? r.resultFavIcon : 'assets/browser.png'}" alt="ICON">
          <div>${r.resultTitle}</div>
        </div>
        <div class="url">
          <a href="${r.resultURL}" target="_blank">${r.resultURL}</a>
        </div>
        <div class="rate">${
          new Array(10).fill(0).map((_, i) => {
            return i <= r.rate 
              ? `<img src="assets/star-good.png" alt="" class="star-good">`
              : `<img src="assets/star-normal.png" alt="" class="star-normal">`;
          }).join('')
        }</div>
        <div class="create-date">${formatDate(new Date(r.createDate))}</di>
      </li>
    `).join('');
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
    let target = event.target;
    while(true) {
      if(target === null || (target.tagName || '').toUpperCase() === 'LI') {
        break;
      }
      target = target.parentElement;
    }

    if (target) {
      selectedKey = target.dataset['key'];
      render();
    }
  });

  render();
})();