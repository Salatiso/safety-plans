// assets/js/chatbot.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDlzylJ0WF_WMZQA2bJeqbzkEMhihYcZW0",
    authDomain: "safety-first-chatbot.firebaseapp.com",
    projectId: "safety-first-chatbot",
    storageBucket: "safety-first-chatbot.firebasestorage.app",
    messagingSenderId: "741489856541",
    appId: "1:741489856541:web:0833fa5deb60dd54c9b6f4",
    measurementId: "G-04Y1PQDYVD"
};

// Predefined responses for common OHS queries
const predefinedResponses = {
    'health and safety specification': {
        response: 'wizard.chatbot.responses.hs_spec',
        link: '/safety-plans/resources/ohs-act-construction-regulations.pdf'
    },
    'health and safety plan': {
        response: 'wizard.chatbot.responses.hs_plan',
        link: '/safety-plans/resources/ohs-act-construction-regulations.pdf'
    },
    'risk assessment': {
        response: 'wizard.chatbot.responses.risk_assessment',
        link: '/safety-plans/resources/risk-assessment-guide.pdf'
    },
    'sacpcmp': {
        response: 'wizard.chatbot.responses.sacpcmp',
        link: 'https://www.sacpcmp.org.za'
    },
    'coida': {
        response: 'wizard.chatbot.responses.coida',
        link: '/safety-plans/resources/coida-guide.pdf'
    }
};

// Initialize Firebase
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    const chatOutput = document.getElementById('chat-output');
    if (chatOutput) {
        chatOutput.innerHTML = `<p><strong>${i18next.t('wizard.chatbot.error')}:</strong> ${i18next.t('wizard.chatbot.unavailable')}</p>`;
    }
}

// Sanitize user input to prevent XSS
const sanitizeInput = (input) => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// Track unrecognized queries for escalation
let unrecognizedCount = 0;
const MAX_UNRECOGNIZED = 3;

// Send and display messages
async function sendMessage(input) {
    const chatOutput = document.getElementById('chat-output');
    if (!input || !chatOutput) {
        console.error("Chat input or output not found");
        return;
    }

    const sanitizedInput = sanitizeInput(input);
    chatOutput.innerHTML += `<p><strong>${i18next.t('wizard.chatbot.you')}:</strong> ${sanitizedInput}</p>`;

    try {
        if (!db) throw new Error("Firestore not initialized");

        // Store message in Firestore
        await addDoc(collection(db, 'messages'), {
            userId: window.currentUser?.id || 'anonymous',
            email: window.currentUser?.email || 'anonymous',
            message: sanitizedInput,
            timestamp: serverTimestamp()
        });

        // Check predefined responses
        const query = sanitizedInput.toLowerCase();
        let response = null;
        for (const [keyword, data] of Object.entries(predefinedResponses)) {
            if (query.includes(keyword)) {
                response = i18next.t(data.response);
                if (data.link) {
                    response += ` <a href="${data.link}" target="_blank">${i18next.t('wizard.chatbot.see_more')}</a>`;
                }
                unrecognizedCount = 0;
                break;
            }
        }

        // Fallback to Firestore query
        if (!response) {
            const snapshot = await db.collection('ohs-knowledge').get();
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.content && data.content.toLowerCase().includes(query)) {
                    response = `${i18next.t('wizard.chatbot.from', { book: data.book, chapter: data.chapter })}<br>${data.content.substring(0, 200)}... `;
                    if (data.file) {
                        response += `<a href="/safety-plans/resources/${data.file}" target="_blank">${i18next.t('wizard.chatbot.full_chapter')}</a>`;
                    }
                    unrecognizedCount = 0;
                }
            });
        }

        // Handle unrecognized queries
        if (!response) {
            unrecognizedCount++;
            response = i18next.t('wizard.chatbot.no_match');
            if (unrecognizedCount >= MAX_UNRECOGNIZED) {
                response += ` ${i18next.t('wizard.chatbot.escalate')} <a href="/safety-plans/contact" target="_blank">${i18next.t('wizard.chatbot.contact_support')}</a>`;
                unrecognizedCount = 0;
            }
        }

        chatOutput.innerHTML += `<p><strong>${i18next.t('wizard.chatbot.bot')}:</strong> ${response}</p>`;
    } catch (error) {
        console.error("Firestore operation failed:", error);
        chatOutput.innerHTML += `<p><strong>${i18next.t('wizard.chatbot.bot')}:</strong> ${i18next.t('wizard.chatbot.error_generic')}</p>`;
    }

    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Listen for real-time message updates
function listenForMessages() {
    const chatOutput = document.getElementById('chat-output');
    if (!chatOutput || !db) return;

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const data = change.doc.data();
                if (data.userId === (window.currentUser?.id || 'anonymous')) {
                    // Only display messages for the current user
                    chatOutput.innerHTML += `<p><strong>${data.email === 'anonymous' ? i18next.t('wizard.chatbot.you') : data.email}:</strong> ${sanitizeInput(data.message)}</p>`;
                    chatOutput.scrollTop = chatOutput.scrollHeight;
                }
            }
        });
    });
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');

    // Handle send button click
    chatSend?.addEventListener('click', () => {
        const input = chatInput?.value.trim();
        if (input) {
            sendMessage(input);
            chatInput.value = '';
        }
    });

    // Handle Enter key press
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const input = chatInput.value.trim();
            if (input) {
                sendMessage(input);
                chatInput.value = '';
            }
        }
    });

    // Synchronize with construction-compliance.js UI logic
    const chatbotWindow = document.querySelector('.chatbot-window');
    const chatCloseBtn = document.querySelector('.chat-close-btn');
    const chatToggleBtn = document.querySelector('.chatbot-toggle');
    let inactivityTimer;

    if (!chatbotWindow || !chatCloseBtn || !chatToggleBtn) {
        console.error("Chatbot UI elements not found");
        return;
    }

    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            chatbotWindow.classList.add('minimized');
        }, 30000);
    };

    chatToggleBtn.addEventListener('click', () => {
        chatbotWindow.classList.toggle('minimized');
        if (!chatbotWindow.classList.contains('minimized')) {
            resetInactivityTimer();
        }
    });

    chatCloseBtn.addEventListener('click', () => {
        chatbotWindow.classList.add('minimized');
        clearTimeout(inactivityTimer);
    });

    chatbotWindow.addEventListener('click', resetInactivityTimer);
    chatbotWindow.addEventListener('keydown', resetInactivityTimer);

    // Start minimized
    chatbotWindow.classList.add('minimized');

    // Start listening for messages
    listenForMessages();
});
