const MAX_KEYS = 10;

const engines = {
  'google.com': function(url) {
    return {
      engine: 'google',
      key: getSearchKeywords(url, 'q')
    };
  },
  'baidu.com': function(url) {
    return {
      engine: 'baidu',
      key: getSearchKeywords(url, 'wd')
    };
  },
  'bing.com': function(url) {
    return {
      engine: 'bing',
      key: getSearchKeywords(url, 'q')
    };
  },
  'sogou.com': function(url) {
    return {
      engine: 'sogou',
      key: getSearchKeywords(url, 'query')
    };
  },
  'so.com': function(url) {
    return {
      engine: 'so.com',
      key: getSearchKeywords(url, 'q')
    };
  },
  'yahoo.com': function(url) {
    return {
      engine: 'yahoo',
      key: getSearchKeywords(url, 'p')
    };
  },
  'yandex.com': function(url) {
    return {
      engine: 'yandex',
      key: getSearchKeywords(url, 'text')
    };
  },
  'duckduckgo.com': function(url) {
    return {
      engine: 'duckduckgo',
      key: getSearchKeywords(url, 'q')
    };
  },
};

const enginesKey = Object.keys(engines);
const enginesKeyRE = enginesKey.map(k => new RegExp(k, 'i'));

const getSearchKeys = function() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('gatherKeys', function(data) {
      const keys = Array.isArray(data.gatherKeys) ? data.gatherKeys : [];
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
  const searchs = urlO.searchParams;
  return searchs.get(key);
}

function updateSearchKeywords(url) {
  const fun = getSearchKeysFun(url);
  const r = fun(url);
  if (!r) return;
  const { engine, key } = r;
  if (key) {
    getSearchKeys().then(keys => {
      const set = new Set([`${engine}^${key}`, ...keys]);
      setSearchKeys(Array.from(set).slice(0, MAX_KEYS));
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
  updateSearchKeywords(tab.url);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  updateSearchKeywords(changeInfo.url);
});

