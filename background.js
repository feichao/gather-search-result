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

function getSearchKeywords(url, key) {
  const urlO = new URL(url);
  const searchs = new URLSearchParams(urlO.search);
  console.log(searchs, searchs.get(key));
  return searchs.get(key);
}

function updateSearchKeywords(url) {
  if(url) {
    const urlO = new URL(url);
    const engineKeys = enginesKey.filter(k => urlO.origin.match(new RegExp(k)));
    if(engineKeys.length > 0) {
      console.log('engines[engineKeys[0]](url) => ', engines[engineKeys[0]](url));
      return engines[engineKeys[0]](url);
    }
  }
}

chrome.tabs.onCreated.addListener(function(tab) {
  console.log(updateSearchKeywords(tab.url));
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  console.log(updateSearchKeywords(changeInfo.url));
});

