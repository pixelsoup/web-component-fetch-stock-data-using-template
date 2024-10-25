class StockLoader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = /* html */`
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

  async connectedCallback() {
    this.shadowRoot.querySelector('.load-stock').addEventListener('click', () => this.loadStock());
    // Load templates dynamically
    const countTemplateResponse = await fetch('./templates/stock-content-template.html');
    const itemTemplateResponse = await fetch('./templates/stock-item-template.html');

    // Return templates as strings
    const countTemplateText = await countTemplateResponse.text();
    const itemTemplateText = await itemTemplateResponse.text();

    // Create DOMParser to convert template strings to nodes
    const parser = new DOMParser();

    // Parse the templates as #document including <html> <head> <body>
    const countTemplateDoc = parser.parseFromString(countTemplateText, 'text/html');
    const itemTemplateDoc = parser.parseFromString(itemTemplateText, 'text/html');

    // Access only the <template> nodes #document
    this.countTemplate = countTemplateDoc.querySelector('template');
    this.itemTemplate = itemTemplateDoc.querySelector('template');
  }

  async loadStock() {
    const dealerIdInput = this.shadowRoot.querySelector('.dealer-id-input');
    const dealerId = dealerIdInput.value;
    const stockItemsListWrapper = this.shadowRoot.querySelector('.stockLoaderListWrapper');

    if (!dealerId) {
      alert('Please enter a valid Dealer ID.');
      return;
    }

    try {
      const response = await fetch(`https://s3.ap-southeast-2.amazonaws.com/stock.publish/dealer_${dealerId}/stock.json`);
      console.log('response: ', response)

      // Log response status and URL
      console.log('Fetching data from:', response.url);
      console.log('Response status:', response.status);

      const data = await response.json();
      // Log fetched data
      console.log('Fetched data:', data);

      stockItemsListWrapper.innerHTML = '';

      if (!data || data.length === 0) {
        alert('There is stock data but it\'s empty.');
        return;
      }

      // Clone and append the count template
      const contentClone = document.importNode(this.countTemplate.content, true);
      contentClone.querySelector('.number-of-stock').textContent = `(${data.length}) Stock Items`;
      stockItemsListWrapper.appendChild(contentClone);

      const stockItemsListEl = stockItemsListWrapper.querySelector('.stock-items-list');

      data.forEach(item => {
        const itemClone = document.importNode(this.itemTemplate.content, true);
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