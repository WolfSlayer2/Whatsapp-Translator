console.log("WhatsApp Translator loaded");

const sourceLang = localStorage.getItem("sourceLang") || "en";
const targetLang = localStorage.getItem("targetLang") || "es";
console.log(`Initial source language: ${sourceLang}, target language: ${targetLang}`);

const cache = {}; // Cache to store previous translations

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to translate text
async function translateText(text, sourceLang, targetLang) {
    console.log("Attempting to translate:", text);
    const apiKey = 'c5d4d8b4d1msh98309bcbc90d8c0p13e47cjsn278c112d2263'; // API key
    const url = 'https://deep-translate1.p.rapidapi.com/language/translate/v2';

    // Check if translation is already in the cache
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    if (cache[cacheKey]) {
        console.log("Returning cached translation:", cache[cacheKey]);
        return cache[cacheKey];
    }

    try {
        // Detect language first
        const detectUrl = 'https://deep-translate1.p.rapidapi.com/language/translate/v2/detect';
        const detectionOptions = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: text })
        };

        const detectResponse = await fetch(detectUrl, detectionOptions);
        if (!detectResponse.ok) {
            console.error("Language detection error:", detectResponse.status);
            return text;
        }

        const detectionResult = await detectResponse.json();
        const detectedLang = detectionResult.data.detections[0].language;

        // Prepare translation request
        const translationOptions = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'deep-translate1.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: text,
                source: detectedLang,
                target: targetLang,
                format: "text"
            })
        };

        const response = await fetch(url, translationOptions);
        if (!response.ok) {
            if (response.status === 429) {
                const errorResult = await response.json();
                if (errorResult.message.includes("exceeded the MONTHLY quota")) {
                    alert("You have exceeded the MONTHLY quota. Upgrade your plan.");
                } else {
                    console.error("Translation API error:", response.status);
                }
            }
            return text;
        }

        const result = await response.json();
        const translatedText = result.data.translations.translatedText || text;

        // Store result in cache
        cache[cacheKey] = translatedText;
        console.log("Translation successful:", translatedText);
        return translatedText;
    } catch (error) {
        console.error("Error during translation:", error);
        return text;
    }
}

// Function to modify WhatsApp messages and translate them
const modifyWhatsAppMessages = debounce(function () {
    const messages = document.querySelectorAll('.copyable-text');
    console.log(`Found ${messages.length} messages to process.`);

    messages.forEach((message) => {
        const originalText = message.innerText;
        console.log("Original message text:", originalText);

        translateText(originalText, sourceLang, targetLang).then((translatedText) => {
            if (translatedText !== originalText) {
                console.log("Updating message with translated text");
                message.innerText = translatedText;
            } else {
                console.log("No need to update, text is already in the target language or translation failed.");
            }
        });
    });
}, 500); // debounce delay

// Monitor new messages of chat
const observer = new MutationObserver(() => {
    console.log("Mutation detected - new messages might have been added");
    modifyWhatsAppMessages();
});

// Function to observe the chat container
function waitForChatContainer() {
    const chatContainer = document.querySelector('#pane-side');
    if (chatContainer) {
        console.log("Starting MutationObserver: ");
        observer.observe(chatContainer, { childList: true, subtree: true });

        // Initialize by modifying existing messages
        modifyWhatsAppMessages();
    } else {
        console.log("Chat container not found yet, retrying...");
        setTimeout(waitForChatContainer, 1000); // Retry after 1 second if not found
    }
}

// Start checking for the chat container
waitForChatContainer();