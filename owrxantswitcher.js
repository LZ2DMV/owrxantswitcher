// Antenna switch UI plugin for OpenWebRX+
// License: MIT
// Original Example File Copyright (c) 2023 Stanislav Lechev [0xAF], LZ2SLL
// Modified by DL9UL to provide UI buttons used to call a WebAPI
// Re-written by Dimitar Milkov, LZ2DMV to a more optimized and clean state

// Init function of the plugin
Plugins.owrxantswitcher.init = function () {

  const apiEndpoint = `http://${window.location.hostname}:5001/antennaswitch`;
  const buttons = [];

  // Function to send a command via POST
  function sendCommand(command) {
    fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => updateButtonState(data.payload.response))
    .catch(error => console.error('Error:', error));
  }

  // Function to update the button state based on the active antenna
  function updateButtonState(activeAntenna) {
    buttons.forEach((button, index) => {
      button.classList.toggle('highlighted', (index + 1).toString() === activeAntenna);
    });
  }

  // Create buttons and add them to the container
  function createButton(i) {
    const button = document.createElement('div');
    button.id = `owrx-ant-button-${i}`;
    button.classList.add('openwebrx-button');
    button.textContent = `ANT ${i}`;
    button.onclick = () => sendCommand(String(i));
    return button;
  }

  // Create antenna section
  const antSection = document.createElement('div');
  antSection.classList.add('openwebrx-section');

  const antPanelLine = document.createElement('div');
  antPanelLine.classList.add('openwebrx-ant', 'openwebrx-panel-line');
  antSection.appendChild(antPanelLine);

  const antGrid = document.createElement('div');
  antGrid.classList.add('openwebrx-ant-grid');
  antPanelLine.appendChild(antGrid);

  for (let i = 1; i <= 4; i++) {
    const button = createButton(i);
    buttons.push(button);
    antGrid.appendChild(button);
  }

  // Section Divider to hide ANT panel
  const antSectionDivider = document.createElement('div');
  antSectionDivider.id = 'openwebrx-section-ant';
  antSectionDivider.classList.add('openwebrx-section-divider');
  antSectionDivider.onclick = () => UI.toggleSection(antSectionDivider);
  antSectionDivider.innerHTML = "&blacktriangledown;&nbsp;Antenna";

  // Append the container above the "openwebrx-section-modes"
  const targetElement = document.getElementById('openwebrx-section-modes');
  targetElement.parentNode.insertBefore(antSectionDivider, targetElement);
  targetElement.parentNode.insertBefore(antSection, targetElement);

  // Retrieve initial button configuration and schedule updates
  sendCommand("s");
  setInterval(() => sendCommand('s'), 2000);

  return true;
};
