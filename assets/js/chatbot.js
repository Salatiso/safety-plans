// assets/js/chatbot.js

const firebaseConfig = {
    apiKey: "AIzaSyDlzylJ0WF_WMZQA2bJeqbzkEMhihYcZW0",
    authDomain: "safety-first-chatbot.firebaseapp.com",
    projectId: "safety-first-chatbot",
    storageBucket: "safety-first-chatbot.firebasestorage.app",
    messagingSenderId: "741489856541",
    appId: "1:741489856541:web:0833fa5deb60dd54c9b6f4",
    measurementId: "G-04Y1PQDYVD"
};

try {
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    const chatOutput = document.getElementById('chat-output');
    if (chatOutput) {
        chatOutput.innerHTML = "<p><strong>Error:</strong> Chatbot unavailable. Please try again later.</p>";
    }
}

document.getElementById('chat-toggle')?.addEventListener('click', () => {
    console.log("Toggling chatbot");
    document.getElementById('chat-window').classList.toggle('chat-hidden');
});

document.getElementById('chat-send')?.addEventListener('click', async () => {
    console.log("Chat send clicked");
    const input = document.getElementById('chat-input')?.value.trim();
    const output = document.getElementById('chat-output');
    if (!input || !output) return;

    output.innerHTML += `<p><strong>You:</strong> ${input}</p>`;
    const query = input.toLowerCase();

    try {
        if (!window.db) throw new Error("Firestore not initialized");
        const snapshot = await window.db.collection('ohs-knowledge').get();
        let response = "Sorry, I couldn’t find an exact match. Try rephrasing!";
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.content && data.content.toLowerCase().includes(query)) {
                response = `<strong>From ${data.book}, Chapter ${data.chapter}:</strong><br>${data.content.substring(0, 200)}... (See <a href="/safety-plans/resources/${data.file}">full chapter</a>)`;
            }
        });
        output.innerHTML += `<p><strong>Chatbot:</strong> ${response}</p>`;
    } catch (error) {
        console.error("Firestore query failed:", error);
        output.innerHTML += `<p><strong>Chatbot:</strong> Oops, something went wrong. Please try again!</p>`;
    }

    document.getElementById('chat-input').value = '';
    output.scrollTop = output.scrollHeight;
});
