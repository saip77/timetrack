document.addEventListener('DOMContentLoaded', () => {
    const websiteList = document.getElementById('website-list');
  
    // Fetch data from storage
    chrome.storage.local.get('websiteData', (data) => {
      const websiteData = data.websiteData || {};
      websiteList.innerHTML = ''; 
  
      if (Object.keys(websiteData).length === 0) {
        websiteList.textContent = 'No data available';
        return;
      }
  
      // Populate the list with website data
      for (const [domain, timeSpent] of Object.entries(websiteData)) {
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
  
        const websiteElement = document.createElement('div');
        websiteElement.className = 'website';
        websiteElement.innerHTML = `
          <span>${domain}</span>
          <span>${minutes}m ${seconds}s</span>
        `;
  
        websiteList.appendChild(websiteElement);
      }
    });
  });
  