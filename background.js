const engines = {
  'google.com': function(url) {
    return getSearchKeywords(url, 'q');
  },
  'baidu.com': function(url) {
    return getSearchKeywords(url, 'wd');
  },
  'bing.com': function(url) {
    return getSearchKeywords(url, 'q');
  }
};

const enginesKey = Object.keys(engines);
const enginesKeyRE = enginesKey.map(k => new RegExp(k, 'i'));

const getSearchKeys = function() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('gatherKeys', function(data) {
      const keys = Array.isArray(data.gatherKeys) ? data.gatherKeys : [];
      console.log('keys => ', keys);
      resolve(keys);
    });
  });
};
const setSearchKeys = function(gatherKeys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ gatherKeys }, function(data) {
      resolve();
    });
  });
};

function getSearchKeywords(url, key) {
  const urlO = new URL(url);
  const searchs = new URLSearchParams(urlO.search);
  return searchs.get(key);
}

function updateSearchKeywords(url) {
  const fun = getSearchKeysFun(url);
  const searchKey = fun(url);
  if (searchKey) {
    getSearchKeys().then(keys => {
      setSearchKeys(keys.unshift(searchKey));
    });
  }
}

function getSearchKeysFun(url) {
  const _ = () => {};
  try {
    if (!url) {
      return _;
    }

    const urlHost = new URL(url).host;
    for(let i = 0; i < enginesKeyRE.length; i++) {
      if (enginesKeyRE[i].test(urlHost)) {
        return engines[enginesKey[i]];
      }
    }
    return _;
  } catch(exception) {
    console.error('getSearchKeysFun => ', exception);
    return _;
  }
}

chrome.tabs.onCreated.addListener(function(tab) {
  updateSearchKeywords(tab.url)
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  updateSearchKeywords(changeInfo.url)
});

