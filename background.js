// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("WhatsApp Translator Running");
});

// Function to translate text using the provided API
async function translateWithAPI(text, sourceLang, targetLang) {
    console.log(`Translating text: "${text}" from ${sourceLang} to ${targetLang}`);
    const apiKey = 'c5d4d8b4d1msh98309bcbc90d8c0p13e47cjsn278c112d2263'; // Your API key
    const url = `https://api.apilayer.com/language_translation/translate?source=${sourceLang}&target=${targetLang}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        },
        body: JSON.stringify({ text: text }) // Send the text to be translated
    });

    if (!response.ok) {
        console.error('Translation API error:', response.statusText);
        return text; // Return original text in case of error
    }

    const data = await response.json();
    console.log(`Translated text: "${data.translatedText}"`);
    return data.translatedText; // Adjust based on the actual response structure
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received translation request:", request);
    if (request.action === "translate") {
        translateWithAPI(request.text, request.sourceLang, request.targetLang).then(translatedText => {
            sendResponse({ translatedText });
        }).catch(error => {
            console.error('Error during translation:', error);
            sendResponse({ translatedText: request.text }); // Fallback to original text
        });
    }
    return true; // Keep the message channel open for async response
});