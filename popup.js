document.getElementById("save-languages").addEventListener("click", () => {
  const sourceLanguage = document.getElementById("langFrom").value;
  const targetLanguage = document.getElementById("langTo").value;

  chrome.storage.sync.set({ sourceLang: sourceLanguage, targetLang: targetLanguage }, () => {
      console.log("Preferred languages saved:", sourceLanguage, targetLanguage);
      alert("Preferred languages saved successfully!"); // Confirmation popup
  });
});

// Load the saved languages
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(['sourceLang', 'targetLang'], (data) => {
      document.getElementById("langFrom").value = data.sourceLang || 'en'; // Default Spanish
      document.getElementById("langTo").value = data.targetLang || 'es'; // Default English
      console.log("Loaded saved languages:", data.sourceLang, data.targetLang);
  });
});