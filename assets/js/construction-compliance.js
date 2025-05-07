document.addEventListener('DOMContentLoaded', () => {
  // Initialize i18next
  i18next
    .use(i18nextBrowserLanguageDetector) // Detects user's browser language
    .init({
      fallbackLng: 'en', // Default language if detection fails
      resources: {
        en: { translation: { /* English translations from artifact_id: c822079d-0a4f-4181-941c-5d6b2f8ff1d9 */ } },
        xh: { translation: { /* Xhosa translations from artifact_id: 9b5f6d43-1a2b-4c3d-8e4f-0a1b2c3d4e5f */ } },
        af: { translation: { /* Afrikaans translations from artifact_id: 2c7e8f54-3b4c-5d6e-9f0a-1b2c3d4e5f6g */ } },
        nd: { translation: { /* Ndebele translations from artifact_id: 4e9g0h65-5c6d-7e8f-0a1b-2c3d4e5f6g7h */ } },
        nso: { translation: { /* Northern Sotho translations from artifact_id: c6ba2d58-4187-41e3-9c1a-21de6e1012c7 */ } },
        st: { translation: { /* Sotho translations from artifact_id: 47f72c8a-6c06-4d5b-b014-2b9a8588c257 */ } },
        ss: { translation: { /* Swazi translations from artifact_id: 8caee2d8-3fa5-4d04-a452-74d9f7d413e5 */ } },
        ts: { translation: { /* Tsonga translations from artifact_id: 5242e578-f315-4a2d-8fea-744bfd172871 */ } },
        tn: { translation: { /* Tswana translations from artifact_id: 928d954e-b3ca-49a8-96c5-2249ed754514 */ } },
        ve: { translation: { /* Venda translations from artifact_id: b56300e3-dbf2-4b49-ad65-533a3b3a1dc3 */ } },
        zu: { translation: { /* Zulu translations from artifact_id: 0d1ca7a2-7346-4152-8526-33e877089867 */ } },
        fr: { translation: { /* French translations from artifact_id: 1dac614f-d75f-4667-9931-6aee50b48031 */ } },
        zh: { translation: { /* Mandarin translations from artifact_id: 4d6d15b9-66b3-45e3-a905-759cd6066e1f */ } },
        es: { translation: { /* Spanish translations from artifact_id: e7020bfc-b17a-408c-8aea-bc569d8e6b27 */ } },
        sn: { translation: { /* Shona translations from artifact_id: 61053566-56d6-4c1a-a764-d6307e148a74 */ } },
        sw: { translation: { /* Swahili translations from artifact_id: a9e7a186-ddcf-421f-95f3-e2c3429897cc */ } }
      }
    }, (err, t) => {
      if (err) return console.error('i18next initialization error:', err);
      // Apply translations to the page
      updateContent();
    });

  // Function to update page content with translations
  function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.innerHTML = i18next.t(key);
    });
  }

  // Language switcher
  const languageSelect = document.createElement('select');
  languageSelect.id = 'language-switcher';
  const languages = ['en', 'xh', 'af', 'nd', 'nso', 'st', 'ss', 'ts', 'tn', 've', 'zu', 'fr', 'zh', 'es', 'sn', 'sw'];
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.text = lang.toUpperCase();
    languageSelect.appendChild(option);
  });
  languageSelect.addEventListener('change', (e) => {
    i18next.changeLanguage(e.target.value, () => {
      updateContent();
    });
  });
  document.body.prepend(languageSelect);

  // Existing Wizard Logic
  let currentStep = 0;
  const steps = document.querySelectorAll('.wizard-step');
  const sidebarContent = document.querySelector('.sidebar-content');
  const wizardContent = document.querySelector('.wizard-content');

  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.style.display = index === stepIndex ? 'block' : 'none';
    });

    const backBtn = document.querySelector('#wizard-back');
    const nextBtn = document.querySelector('#wizard-next');
    const addToCartBtn = document.querySelector('#wizard-add-to-cart');

    backBtn.style.display = stepIndex === 0 ? 'none' : 'inline-block';
    nextBtn.style.display = stepIndex === steps.length - 1 ? 'none' : 'inline-block';
    addToCartBtn.style.display = stepIndex === steps.length - 1 ? 'inline-block' : 'none';

    updateSidebar(stepIndex);
    updateSelectedDocumentsDisplay();
  }

  function updateSidebar(stepIndex) {
    const sidebarItems = sidebarContent.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => item.style.display = 'none');

    const activeSidebarItem = sidebarContent.querySelector(`.sidebar-step-${stepIndex}`);
    if (activeSidebarItem) {
      activeSidebarItem.style.display = 'block';
    }
  }

  function validateStep(stepIndex) {
    const step = steps[stepIndex];
    const inputs = step.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
      const errorMessage = step.querySelector(`#${input.id}-error`);
      if (!input.value.trim()) {
        isValid = false;
        errorMessage.style.display = 'block';
        input.classList.add('error');
      } else {
        errorMessage.style.display = 'none';
        input.classList.remove('error');
      }

      if (input.type === 'tel' && input.value.trim()) {
        const phonePattern = /^\+\d{11}$/;
        if (!phonePattern.test(input.value)) {
          isValid = false;
          errorMessage.style.display = 'block';
          errorMessage.textContent = i18next.t('wizard.step_2.client_contact_number_error');
          input.classList.add('error');
        }
      }

      if (input.type === 'email' && input.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value)) {
          isValid = false;
          errorMessage.style.display = 'block';
          errorMessage.textContent = i18next.t('wizard.step_2.client_email_error');
          input.classList.add('error');
        }
      }
    });

    const checkboxes = step.querySelectorAll('input[type="checkbox"][required]');
    if (checkboxes.length > 0) {
      const checked = Array.from(checkboxes).some(checkbox => checkbox.checked);
      const errorMessage = step.querySelector('#checkbox-error');
      if (!checked) {
        isValid = false;
        errorMessage.style.display = 'block';
      } else {
        errorMessage.style.display = 'none';
      }
    }

    return isValid;
  }

  function updateSelectedDocumentsDisplay() {
    const selectedDocsList = document.querySelector('#selected-documents');
    if (!selectedDocsList) return;

    const checkboxes = document.querySelectorAll('input[name="documents"]:checked');
    const selectedDocs = Array.from(checkboxes).map(checkbox => i18next.t(`wizard.step_1.${checkbox.value}`));
    selectedDocsList.innerHTML = selectedDocs.length > 0 ? selectedDocs.join(', ') : i18next.t('wizard.step_9.selected_documents_label') + ': None';
  }

  document.querySelector('#wizard-back').addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  document.querySelector('#wizard-next').addEventListener('click', () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });

  document.querySelector('#wizard-add-to-cart').addEventListener('click', () => {
    if (validateStep(currentStep)) {
      const selectedDocs = Array.from(document.querySelectorAll('input[name="documents"]:checked'))
        .map(checkbox => ({ name: i18next.t(`wizard.step_1.${checkbox.value}`), price: 150 }));
      updateCart(selectedDocs);
      alert(i18next.t('wizard.nav.add_to_cart') + ' success!');
      currentStep = 0;
      showStep(currentStep);
    }
  });

  function updateCart(documents) {
    const cartTableBody = document.querySelector('#cart-table tbody');
    cartTableBody.innerHTML = '';

    documents.forEach(doc => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${doc.name}</td><td>R${doc.price}</td>`;
      cartTableBody.appendChild(row);
    });

    const invoiceRefNumber = document.querySelector('#invoice-ref-number');
    if (invoiceRefNumber) {
      invoiceRefNumber.textContent = `INV-${Math.floor(Math.random() * 1000000)}`;
    }
  }

  document.querySelector('#cart-checkout').addEventListener('click', () => {
    const promoCode = document.querySelector('#promo-code').value;
    if (promoCode === 'SAFETYFIRST25') {
      alert('Promo code applied! Proceeding to checkout...');
    } else {
      alert('Invalid promo code. Please try again.');
    }
  });

  // Chatbot Functionality
  const chatInput = document.querySelector('#chat-input');
  const chatMessages = document.querySelector('#chat-messages');
  const chatSendBtn = document.querySelector('#chat-send');

  chatSendBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
      const userMessage = document.createElement('div');
      userMessage.classList.add('chat-message', 'user-message');
      userMessage.textContent = message;
      chatMessages.appendChild(userMessage);

      const botMessage = document.createElement('div');
      botMessage.classList.add('chat-message', 'bot-message');
      botMessage.textContent = i18next.t('chatbot.response', { defaultValue: "I'm here to help! For detailed OHS advice, please consult a professional." });
      chatMessages.appendChild(botMessage);

      chatMessages.scrollTop = chatMessages.scrollHeight;
      chatInput.value = '';
    }
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      chatSendBtn.click();
    }
  });

  showStep(currentStep);
});
