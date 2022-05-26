(function (global) {
  global.__GatherSearchResultUtils = global.__GatherSearchResultUtils || {
    getKeySource,
    setKeySource,
    getGatherKeys,
    getGatherResults,
    setGatherResults,
    deleteGatherResultsByKey,
    deleteGatherResultsItem,
    getTargetElement
  };

  function getKeySource() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('gatherKeySource', function(result) {
        resolve(result.gatherKeySource);
      });
    })
  }

  function setKeySource(value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({gatherKeySource: value}, function() {
        resolve(true);
      });
    });
  }

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
   *        resultFavIcon
   *        resultTitle
   *        resultURL
   *        engine
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
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ gatherResults }, function(data) {
        resolve();
      });
    });
  };

  function deleteGatherResultsByKey(key) {
    return getGatherResults().then(gatherResults => {
      delete gatherResults[key];
      return setGatherResults(gatherResults);
    });
  };

  function deleteGatherResultsItem(key, itemIndex) {
    return getGatherResults().then(gatherResults => {
      const r = gatherResults[key];
      if (Array.isArray(r.results)) {
        r.results.splice(itemIndex, 1);
        if (r.results.length > 0) {
          return setGatherResults(gatherResults).then(() => false);
        }
      }
      delete gatherResults[key];
      return setGatherResults(gatherResults).then(() => true);
    });
  };  

  function getTargetElement(target, callback) {
    while(true) {
      if(target === null || callback(target)) {
        break;
      }
      target = target.parentElement;
    }
    return target;
  }
})(window);