(function() {
  const searchKeyEl = document.getElementById('search-keys');
  const keysListEl = document.getElementById('keys-list');
  const resultsListEl = document.getElementById('results-list');

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

  function render() {
    const keyReg = new RegExp(searchKey, 'ig');
    getGatherResults().then(gatherResults => {
      const resultsArray = Object.keys(gatherResults).map(key => ({
        key,
        ...gatherResults[key]
      })).sort((r1, r2) => r1.createDate < r2.createDate).filter(r => !searchKey || keyReg.test(r.key));

      if (resultsArray.length > 0) {
        selectedKey = selectedKey || resultsArray[0].key;
        keysListEl.innerHTML = renderKeysHtml(selectedKey, resultsArray);
        resultsListEl.innerHTML = renderResultsHtml(gatherResults[selectedKey].results);
      }
    });
  }

  const renderKeysHtml = function(selectedKey, resultsArray) {
    return resultsArray.map(r => `
      <li data-key="${r.key}" class="${r.key === selectedKey ? 'selected' : ''}">
        <div class="key">${r.key}</div>
        <div class="create-date">${new Date(r.createDate)}</div>
      </li>
    `).join('');
  };

  const renderResultsHtml = function(results) {
    return results.map(r => `
      <li>
        <div class="url">${r.resultURL}</div>
        <div class="date">${r.rate}</div>
        <div class="create-date">${new Date(r.createDate)}</di>
      </li>
    `).join('');
  };

  chrome.storage.onChanged.addListener(function(cahnges, area) {
    if (area === 'sync') {
      render();
    }
  });

  searchKeyEl.addEventListener('change', (event) => {
    const key = searchKeyEl.value;
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      searchKey = key;
      render();
    }, 300);
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