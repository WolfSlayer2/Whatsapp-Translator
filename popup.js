document.getElementById('saveSettings').addEventListener('click', () => {
    const langFrom = document.getElementById('langFrom').value;
    const langTo = document.getElementById('langTo').value;

    chrome.storage.sync.set({ langFrom, langTo }, () => {
        alert('Language settings saved!');
    });
});
