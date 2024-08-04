Plugins.owrxantswitcher.API_URL ??= `http://${window.location.hostname}:8073/antenna_switch`;

Plugins.owrxantswitcher.init = function () {

  let antennaNum = 0;
  const buttons = [];

  const suffixes = [
    { text: "East", index: 1 },
    { text: "West", index: 2 },
    { text: "South", index: 3 }
  ];

  function sendCommand(command) {
    fetch(Plugins.owrxantswitcher.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      const response = data.payload.response;
      const match = response.match(/^n:(\d)$/);
      if (match) {
        antennaNum = parseInt(match[1], 10);
        if (!buttonsCreated) createButtons();
      } else {
        updateButtonState(response);
      }
    })
    .catch(error => console.error('Error:', error));
  }

  function updateButtonState(activeAntenna) {
    buttons.forEach((button, index) => {
      button.classList.toggle('highlighted', (index + 1).toString() === activeAntenna);
    });
  }

  function createButtons() {
    const antSection = document.createElement('div');
    antSection.classList.add('openwebrx-section');

    const antPanelLine = document.createElement('div');
    antPanelLine.classList.add('openwebrx-ant', 'openwebrx-panel-line');
    antSection.appendChild(antPanelLine);

    const antGrid = document.createElement('div');
    antGrid.classList.add('openwebrx-ant-grid');
    antPanelLine.appendChild(antGrid);

    for (let i = 1; i <= antennaNum; i++) {
      const button = createButton(i);
      buttons.push(button);
      antGrid.appendChild(button);
    }

    const antSectionDivider = document.createElement('div');
    antSectionDivider.id = 'openwebrx-section-ant';
    antSectionDivider.classList.add('openwebrx-section-divider');
    antSectionDivider.onclick = () => UI.toggleSection(antSectionDivider);
    antSectionDivider.innerHTML = "&blacktriangledown; Antenna";

    const targetElement = document.getElementById('openwebrx-section-modes');
    targetElement.parentNode.insertBefore(antSectionDivider, targetElement);
    targetElement.parentNode.insertBefore(antSection, targetElement);

    buttonsCreated = true;
  }

  function createButton(i) {
    const button = document.createElement('div');
    button.id = `owrx-ant-button-${i}`;
    button.classList.add('openwebrx-button');
    const suffix = suffixes[i - 1];
    button.textContent = `${suffix.text}`;
    button.onclick = () => sendCommand(suffix.index);
    return button;
  }

  let buttonsCreated = false;

  sendCommand('n');
  sendCommand('s');

  setInterval(() => sendCommand('s'), 2000);

  return true;
};
