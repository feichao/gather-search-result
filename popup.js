(function () {
  document.addEventListener('DOMContentLoaded', function (event) {
    const searchKeys = [
      'CSS height',
      'input select',
      '语雀商业逻辑',
      'CSS height',
      'input select',
      '语雀商业逻辑',
      'CSS height',
      'input select',
      '语雀商业逻辑'
    ];

    const confirmEle = document.getElementById('confirm');
    const searchKeyEle = document.getElementById('keys-input');
    const searchRateEle = document.getElementById('rates-input');
    const searchKeyList = document.getElementById('keys-list');
    
    searchKeyList.innerHTML = searchKeys.map((key, index) => `<li data-index="${index}">${key}</li>`).join('');

    document.body.addEventListener('click', function() {
      searchKeyList.style.display = 'none';
    });
    confirmEle.addEventListener('click', function(event) {
      const searchKey = searchKeyEle.value;
      const searchRate = searchRateEle.value;
      console.log('key + rate => ', searchKey, searchRate);
    });

    searchKeyEle.addEventListener('click', function(event) {
      event.stopPropagation();
      searchKeyList.style.display = 'block';
    });

    searchKeyList.addEventListener('click', function(event) {
      const target = event.target;
      const index = target.dataset.index;
      const searchKey = searchKeys[index];
      searchKeyEle.value = searchKey;
      searchKeyList.style.display = 'none';
    });
  });
})();