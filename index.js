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

    const html = `
      <div id="--plugin-gather-search-result--">
        <iframe name="--PGSR-iframe-invisible--"></iframe>
        <form action="#" target="--PGSR-iframe-invisible--" autocomplete="off">
          <div class="--PGSR-item-wrapper--">
            <label for="--PGSR-keys-input--">Keys</label>
            <div class="--PGSR-keys-content--">
              <input id="--PGSR-keys-input--" required placeholder="search keys">
              <ul id="--PGSR-keys-list--">
                ${searchKeys.map((key, index) => `<li data-index="${index}">${key}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="--PGSR-item-wrapper--">
            <label for="--PGSR-rates-input--">Rate</label>
            <div class="--PGSR-rates-content--">
              <input id="--PGSR-rates-input--" type="number" required min="1" max="5" value="3" placeholder="rate of result">
            </div>
          </div>
          <div class="--PGSR-item-wrapper-- --PGSR-item-actions-wrapper--">
            <button id="--PGSR-confirm--" submit>Confirm</button>
          </div>
        </form>
      </div>`;
    const wrapper = document.createElement('div');
    wrapper.id = '--plugin-gather-result-wrapper--'
    wrapper.innerHTML = html;
    document.body.append(wrapper);
    wrapper.addEventListener('click', function() {
      searchKeyList.style.display = 'none';
    });

    const confirmEle = document.getElementById('--PGSR-confirm--');
    const searchKeyEle = document.getElementById('--PGSR-keys-input--');
    const searchRateEle = document.getElementById('--PGSR-rates-input--');
    const searchKeyList = document.getElementById('--PGSR-keys-list--');
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