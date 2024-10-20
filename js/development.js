document.querySelectorAll('button.load-stock').forEach(button => {
  button.addEventListener('click', async () => {
    const dealerIdInput = button.previousElementSibling; // Get the input field before the button
    const dealerId = dealerIdInput.value; // Get the dealer ID from the input field
    const stockItemsList = button.nextElementSibling; // Define the corresponding item list (sibling div)
    const template = document.querySelector('.stock-item-template'); // Define the template

    if (!dealerId) {
      window.alert('Please enter a valid Dealer ID.');
      return; // Exit if no dealer ID is provided
    }

    try {
      const response = await fetch(`https://s3.ap-southeast-2.amazonaws.com/stock.publish/dealer_${dealerId}/stock.json`);
      const data = await response.json(); // Assuming the API returns JSON

      // Clear existing items
      stockItemsList.innerHTML = '';

      // Check if data is empty
      if (!data || data.length === 0) {
        window.alert('No data available for this Dealer ID.');
        return; // Exit if no data is available
      }

      // Loop through the fetched data and create list items
      data.forEach(item => {
        const clone = document.importNode(template.content, true); // Clone the template content

        // Populate the cloned template with data
        clone.querySelector('.stock-item-make').textContent = item.make || 'Unknown Make';
        clone.querySelector('.stock-item-model').textContent = item.model || 'Unknown Model';
        clone.querySelector('.stock-item-price').textContent = `$${(item.price || 0).toFixed(2)}`; // Fallback for price

        // Append the cloned item to the list
        stockItemsList.appendChild(clone);
      });
    } catch (error) {
      console.error('Error fetching data: There is no data file for this dealer.', error);
      window.alert('There is no data available for this Dealer ID.'); // Alert on fetch error
    }
  });
});