const MAX_KEYS = 20;

// 初始化搜索引擎及搜索关键词
const engines = {
  'google.com': function(url) {
    return {
      engine: 'google',
      key: getSearchKeyFromURL(url, 'q')
    };
  },
  'baidu.com': function(url) {
    return {
      engine: 'baidu',
      key: getSearchKeyFromURL(url, 'wd')
    };
  },
  'bing.com': function(url) {
    return {
      engine: 'bing',
      key: getSearchKeyFromURL(url, 'q')
    };
  },
  'sogou.com': function(url) {
    return {
      engine: 'sogou',
      key: getSearchKeyFromURL(url, 'query')
    };
  },
  'so.com': function(url) {
    return {
      engine: 'so.com',
      key: getSearchKeyFromURL(url, 'q')
    };
  },
  'yahoo.com': function(url) {
    return {
      engine: 'yahoo',
      key: getSearchKeyFromURL(url, 'p')
    };
  },
  'yandex.com': function(url) {
    return {
      engine: 'yandex',
      key: getSearchKeyFromURL(url, 'text')
    };
  },
  'duckduckgo.com': function(url) {
    return {
      engine: 'duckduckgo',
      key: getSearchKeyFromURL(url, 'q')
    };
  },
};

const enginesKey = Object.keys(engines);
const enginesKeyRE = enginesKey.map(k => new RegExp(k, 'i'));

// 每个搜索引擎搜索的关键词都不一样，此函数根据关键词从 URL 提取搜索词
function getSearchKeyFromURL(url, key) {
  const urlO = new URL(url);
  const searchs = urlO.searchParams;
  return searchs.get(key);
}

// 获取 chrome storage 中的搜索词
const getSearchWordsFromStorage = function() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('gatherKeys', function(data) {
      const keys = Array.isArray(data.gatherKeys) ? data.gatherKeys : [];
      resolve(keys);
    });
  });
};

// 存储搜索词到 chrome storage
const setSearchWordsFromStorage = function(gatherKeys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ gatherKeys }, function(data) {
      resolve();
    });
  });
};

function updateSearchWords(url) {
  const fun = getMethodToGetWordsFromURL(url);
  const r = fun(url);
  if (!r) return;
  const { engine, key } = r;
  if (key) {
    getSearchWordsFromStorage().then(keys => {
      const set = new Set([`${engine}^${key}`, ...keys]);
      setSearchWordsFromStorage(Array.from(set).slice(0, MAX_KEYS));
    });
  }
}

function getMethodToGetWordsFromURL(url) {
  const _ = () => {};
  try {
    if (!url) {
      return _;
    }

    // 从预置列表中获取提取搜索词的方法
    const urlHost = new URL(url).host;
    for(let i = 0; i < enginesKeyRE.length; i++) {
      if (enginesKeyRE[i].test(urlHost)) {
        return engines[enginesKey[i]];
      }
    }
    return _;
  } catch(exception) {
    console.error('getMethodToGetWordsFromURL => ', exception);
    return _;
  }
}

chrome.tabs.onCreated.addListener(function(tab) {
  updateSearchWords(tab.url);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  updateSearchWords(changeInfo.url);
});

