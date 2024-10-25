class StockLoader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        /* Add your styles here */
      </style>
      <div class="stockLoaderItemWrapper">
        <label>Dealer Id</label>
        <input type="number" class="dealer-id-input" placeholder="e.g. 2343" min="1" />
        <button class="load-stock">Load Stock Items</button>
        <div class="stockLoaderListWrapper"></div>
      </div>
    `;
  }

  connectedCallback() {
    this.shadowRoot.querySelector('.load-stock').addEventListener('click', () => this.loadStock());
  }

  async loadStock() {
    const dealerIdInput = this.shadowRoot.querySelector('.dealer-id-input');
    const dealerId = dealerIdInput.value;
    const stockItemsListWrapper = this.shadowRoot.querySelector('.stockLoaderListWrapper');

    // Access templates from the main document
    const itemTemplate = document.getElementById('stock-item-template');
    const countTemplate = document.getElementById('stock-content-template');

    if (!dealerId) {
      alert('Please enter a valid Dealer ID.');
      return;
    }

    try {
      const response = await fetch(`https://s3.ap-southeast-2.amazonaws.com/stock.publish/dealer_${dealerId}/stock.json`);
      const data = await response.json();

      stockItemsListWrapper.innerHTML = '';

      if (!data || data.length === 0) {
        alert('There is stock data but it\'s empty.');
        return;
      }

      const contentClone = document.importNode(countTemplate.content, true);
      contentClone.querySelector('.number-of-stock').textContent = `(${data.length}) Stock Items`;
      stockItemsListWrapper.appendChild(contentClone.querySelector('.template-content-wrapper'));

      const stockItemsListEl = stockItemsListWrapper.querySelector('.stock-items-list');

      data.forEach(item => {
        const itemClone = document.importNode(itemTemplate.content, true);
        itemClone.querySelector('.stock-item-make').textContent = item.make || 'Unknown Make';
        itemClone.querySelector('.stock-item-model').textContent = item.model || 'Unknown Model';
        itemClone.querySelector('.stock-item-price').textContent = `$${(item.price || 0).toFixed(2)}`;
        stockItemsListEl.appendChild(itemClone);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('There is no data available for this Dealer ID.');
    }
  }
}

customElements.define('stock-loader', StockLoader);