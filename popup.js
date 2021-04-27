(function () {
  const MAX_RESULTS = 1000;

  function getGatherKeys() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('gatherKeys', function(data) {
        const keys = Array.isArray(data.gatherKeys) ? data.gatherKeys : [];
        resolve(keys);
      });
    });
  }

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

  function setGatherResults(gatherResults) {
    console.log('gatherResults => ', gatherResults);
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ gatherResults }, function(data) {
        resolve();
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function (event) {
    const confirmEle = document.getElementById('confirm');
    const gotoGatherList = document.getElementById('goto-gather-list');
    const searchKeyEle = document.getElementById('keys-input');
    const searchRateEle = document.getElementById('rates-input');
    const searchKeyList = document.getElementById('keys-list');

    chrome.storage.onChanged.addListener(function(data) {
      getGatherKeys().then(keys => {
        searchKeyList.innerHTML = keys.map((key) => `<li>${key}</li>`).join('');
      })
    });
    
    getGatherKeys().then(keys => {
      searchKeyList.innerHTML = keys.map((key) => `<li>${key}</li>`).join('');
    })

    document.body.addEventListener('click', function() {
      searchKeyList.style.display = 'none';
    });

    confirmEle.addEventListener('click', function(event) {
      const searchKey = searchKeyEle.value;
      const searchRate = searchRateEle.value;
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        if (Array.isArray(tabs) && tabs.length > 0) {
          const resultURL = tabs[0].url;
          getGatherResults().then(function(rets) {
            const r = {
              rate: searchRate,
              resultURL,
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
          })
        }
      });
    });

    gotoGatherList.addEventListener('click', function(event) {
      event.preventDefault();
      chrome.runtime.openOptionsPage(function() {});
    });

    searchKeyEle.addEventListener('click', function(event) {
      event.stopPropagation();
      searchKeyList.style.display = 'block';
    });

    searchKeyList.addEventListener('click', function(event) {
      const target = event.target;
      searchKeyEle.value = target.innerHTML;
      searchKeyList.style.display = 'none';
    });
  });
})();