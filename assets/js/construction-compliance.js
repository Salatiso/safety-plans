/**
 * Construction Compliance JavaScript
 * Handles OHS Specification form, role selection, and cart-based document generation.
 * Implements temporary data storage and cart functionality.
 */

// Mock common.js functions (replace with actual imports if common.js is available)
function showStep(stepId) {
    const step = document.getElementById(stepId);
    if (!step) {
        console.error(`Step element #${stepId} not found.`);
        return;
    }
    document.querySelectorAll('.step').forEach(s => s.classList.add('hidden'));
    step.classList.remove('hidden');
}

function addHeaderFooter(doc, title) {
    doc.setFontSize(10);
    doc.text("Compiled with safetyfirst.help", 10, 10);
    doc.text("Disclaimer: This document is for informational purposes only.", 10, 290);
    doc.setFontSize(16);
    doc.text(title, 10, 20);
}

// Check for jsPDF
const jsPDF = window.jspdf?.jsPDF;
if (!jsPDF) {
    console.error("jsPDF not loaded. Please check script inclusion.");
    alert("PDF generation library (jsPDF) not loaded. Please contact support.");
}

// Simulated User Authentication
let currentUser = null; // { id: string, role: string, email: string, projects: string[] }
const loggedIn = () => !!currentUser;

// Temporary Data Storage
const TEMP_STORAGE_KEY = "tempProjectData";
const EXPIRY_DAYS = 7;

const generateReferenceNumber = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const saveTempData = (data) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + EXPIRY_DAYS);
    const tempData = {
        referenceNumber: generateReferenceNumber(),
        data,
        expiry: expiry.getTime(),
        created: new Date().getTime()
    };
    localStorage.setItem(TEMP_STORAGE_KEY, JSON.stringify(tempData));
    return tempData.referenceNumber;
};

const getTempData = (referenceNumber) => {
    const stored = localStorage.getItem(TEMP_STORAGE_KEY);
    if (!stored) return null;
    const tempData = JSON.parse(stored);
    if (tempData.referenceNumber !== referenceNumber) return null;
    const now = new Date().getTime();
    if (now > tempData.expiry) {
        localStorage.removeItem(TEMP_STORAGE_KEY);
        return null;
    }
    return tempData.data;
};

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const addToCart = (documentName, price, type, data) => {
    cart.push({ documentName, price, type, data });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    alert(`${documentName} added to cart!`);
};

const updateCartDisplay = () => {
    const cartItems = document.getElementById('cart-items');
    const cartContainer = document.getElementById('cart-container');
    if (!cartItems || !cartContainer) {
        console.error("Cart elements not found. Ensure #cart-items and #cart-container exist in the DOM.");
        return;
    }
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.documentName}</td>
            <td>R ${item.price.toFixed(2)}</td>
        `;
        cartItems.appendChild(row);
    });
    cartContainer.classList.toggle('hidden', cart.length === 0);
};

// Initialize on Page Load
document.addEventListener("DOMContentLoaded", () => {
    console.log("construction-compliance.js loaded");

    // Check if critical layout elements exist
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    if (!sidebar || !mainContent) {
        console.error("Critical layout elements missing: .sidebar or .main-content not found.");
        return;
    }

    // Simulate Login
    const loginLink = document.getElementById("login-link");
    if (loginLink) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (loggedIn()) {
                currentUser = null;
                alert("Logged out");
                loginLink.textContent = "Login";
            } else {
                const email = prompt("Enter your email to login (for demo purposes):");
                if (email) {
                    currentUser = { id: "user1", role: "client", email, projects: [] };
                    alert(`Logged in as ${email}`);
                    loginLink.textContent = "Logout";
                }
            }
        });
    } else {
        console.error("Login link not found.");
    }

    // Role Selection
    const clientBtn = document.getElementById("client-btn");
    const contractorBtn = document.getElementById("contractor-btn");
    const hnsProBtn = document.getElementById("hns-pro-btn");
    const projectFormContainer = document.getElementById("project-form-container");
    const formTitle = document.getElementById("form-title");

    if (!projectFormContainer || !formTitle) {
        console.error("Form container or title not found: #project-form-container or #form-title missing.");
        return;
    }

    if (clientBtn) {
        clientBtn.addEventListener("click", () => {
            const clientNote = document.getElementById("client-legal-note");
            const contractorNote = document.getElementById("contractor-legal-note");
            const hnsProNote = document.getElementById("hns-pro-legal-note");
            if (clientNote && contractorNote && hnsProNote) {
                clientNote.classList.remove("hidden");
                contractorNote.classList.add("hidden");
                hnsProNote.classList.add("hidden");
            }
            formTitle.textContent = "OHS Actions (Client)";
            projectFormContainer.classList.remove("hidden");
        });
    }

    if (contractorBtn) {
        contractorBtn.addEventListener("click", () => {
            const clientNote = document.getElementById("client-legal-note");
            const contractorNote = document.getElementById("contractor-legal-note");
            const hnsProNote = document.getElementById("hns-pro-legal-note");
            if (clientNote && contractorNote && hnsProNote) {
                clientNote.classList.add("hidden");
                contractorNote.classList.remove("hidden");
                hnsProNote.classList.add("hidden");
            }
            formTitle.textContent = "OHS Actions (Contractor)";
            projectFormContainer.classList.remove("hidden");
        });
    }

    if (hnsProBtn) {
        hnsProBtn.addEventListener("click", () => {
            const clientNote = document.getElementById("client-legal-note");
            const contractorNote = document.getElementById("contractor-legal-note");
            const hnsProNote = document.getElementById("hns-pro-legal-note");
            if (clientNote && contractorNote && hnsProNote) {
                clientNote.classList.add("hidden");
                contractorNote.classList.add("hidden");
                hnsProNote.classList.remove("hidden");
            }
            formTitle.textContent = "OHS Actions (H&S Professional)";
            projectFormContainer.classList.remove("hidden");
        });
    }

    // OHS Specification Form (Available to All Roles)
    const projectForm = document.getElementById("project-form");
    if (projectForm) {
        // Update Scope Details with Selected Activities
        const activitiesInputs = projectForm.querySelectorAll('input[name="activities"]');
        const scopeDetails = document.getElementById("scope-details");
        activitiesInputs.forEach(input => {
            input.addEventListener("change", () => {
                const selectedActivities = Array.from(activitiesInputs)
                    .filter(input => input.checked)
                    .map(input => input.value);
                const activitiesText = selectedActivities.length > 0 ? `Key Activities: ${selectedActivities.join(", ")}` : "";
                scopeDetails.value = activitiesText;
            });
        });

        // Validate Form and Add to Cart
        const validateAndAddToCart = (documentName, price, type) => {
            const formData = new FormData(projectForm);
            const data = Object.fromEntries(formData);
            
            // Validation
            let valid = true;
            const validations = [
                { id: "accreditation-level", value: data.accreditationLevel, error: "accreditation-level-error", message: "Please select an accreditation level." },
                { id: "project-name", value: data.projectName, error: "project-name-error", message: "Please enter a project name." },
                { id: "client-name", value: data.clientName, error: "client-name-error", message: "Please enter a client company name." },
                { id: "contractor-name", value: data.contractorName, error: "contractor-name-error", message: "Please enter a contractor company name." },
                { id: "site-address", value: data.siteAddress, error: "site-address-error", message: "Please enter a site address." },
                { id: "type-of-work", value: data.typeOfWork, error: "type-of-work-error", message: "Please enter the type of work." },
                { id: "location", value: data.location, error: "location-error", message: "Please enter a location." },
                { id: "cost", value: data.cost, error: "cost-error", message: "Please enter a valid project cost (R)." },
                { id: "duration", value: data.duration, error: "duration-error", message: "Please enter a valid duration (days)." },
                { id: "emergency-contact", value: data.emergencyContact, pattern: /^\+?[0-9\s\-()]{10,}$/, error: "emergency-contact-error", message: "Please enter a valid phone number (e.g., +27123456789)." },
                { id: "workmans-comp", value: data.workmansComp, error: "workmans-comp-error", message: "Please enter a COIDA registration number." },
                { id: "cidb-grade", value: data.cidbGrade, error: "cidb-grade-error", message: "Please select a CIDB grading." },
                { id: "scope-details", value: data.scopeDetails, error: "scope-details-error", message: "Please enter scope details." },
                { id: "sacpcmp-reg", value: data.sacpcmpReg, error: "sacpcmp-reg-error", message: "SACPCMP Registration Number is required for Officer or Agent roles.", condition: () => data.accreditationLevel === "sacpcmp-officer" || data.accreditationLevel === "sacpcmp-agent" }
            ];

            validations.forEach(v => {
                const errorEl = document.getElementById(v.error);
                if (!errorEl) return;
                if (v.condition && !v.condition()) {
                    errorEl.classList.add("hidden");
                    return;
                }
                if (!v.value || (v.pattern && !v.pattern.test(v.value))) {
                    errorEl.classList.remove("hidden");
                    errorEl.textContent = v.message;
                    valid = false;
                } else {
                    errorEl.classList.add("hidden");
                }
            });

            if (!valid) return null;

            // Add to cart
            addToCart(documentName, price, type, data);
            return data;
        };

        // SACPCMP Registration Field Visibility
        const accreditationLevel = document.getElementById("accreditation-level");
        const sacpcmpRegContainer = document.getElementById("sacpcmp-reg-container");
        if (accreditationLevel && sacpcmpRegContainer) {
            accreditationLevel.addEventListener("change", () => {
                const showReg = accreditationLevel.value === "sacpcmp-officer" || accreditationLevel.value === "sacpcmp-agent";
                sacpcmpRegContainer.classList.toggle("hidden", !showReg);
            });
        }

        // Button Actions
        const actionButtons = [
            { id: "compile-hs-spec-btn", action: () => validateAndAddToCart("Health and Safety Specification", 50.00, "hs-spec") },
            { id: "compile-hs-plan-btn", action: () => validateAndAddToCart("Health and Safety Plan", 50.00, "hs-plan") },
            { id: "compile-bra-btn", action: () => window.location.href = "/safety-plans/pages/risk-assessment.html?type=baseline" },
            { id: "conduct-training-btn", action: () => window.location.href = "https://salatiso.github.io/safety-plans/pages/general-induction.html" },
            { id: "make-legal-appointments-btn", action: () => window.location.href = "https://salatiso.github.io/safety-plans/pages/legal-appointments.html" },
            { id: "conduct-inspections-audits-btn", action: () => window.location.href = "https://salatiso.github.io/safety-plans/pages/inspections-audits.html" },
            { id: "manage-incidents-btn", action: () => window.location.href = "https://salatiso.github.io/safety-plans/pages/incident-management.html" },
            { id: "compile-reports-btn", action: () => alert("Report compilation coming soon!") },
            { id: "compile-hs-file-btn", action: () => validateAndAddToCart("Health and Safety File", 100.00, "hs-file") }
        ];

        actionButtons.forEach(btn => {
            const element = document.getElementById(btn.id);
            if (element) {
                element.addEventListener("click", btn.action);
            }
        });
    } else {
        console.error("Project form not found.");
    }

    // Checkout
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            const promoCode = document.getElementById("promo-code").value;
            if (promoCode === "SAFETYFIRST25") {
                alert("Promo code applied! 25% discount (mock implementation).");
            }

            // Generate PDFs for all items in the cart
            cart.forEach(item => {
                if (item.type === "hs-spec") {
                    generateOHSSpecPDF(item.data);
                } else if (item.type === "hs-plan") {
                    generateHSPlanPDF(item.data);
                } else if (item.type === "hs-file") {
                    generateHSFilePDF(item.data);
                }
            });

            alert("Checkout complete! Documents have been generated and downloaded.");
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        });
    }

    // Chatbot Placeholder
    const chatToggle = document.getElementById("chat-toggle");
    const chatWindow = document.getElementById("chat-window");
    const chatSend = document.getElementById("chat-send");
    const chatInput = document.getElementById("chat-input");
    const chatOutput = document.getElementById("chat-output");

    if (chatToggle && chatWindow) {
        chatToggle.addEventListener("click", () => {
            chatWindow.classList.toggle("chat-hidden");
        });
    } else {
        console.error("Chatbot elements not found.");
    }

    if (chatSend && chatInput && chatOutput) {
        chatSend.addEventListener("click", () => {
            const message = chatInput.value.trim();
            if (!message) return;
            chatOutput.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
            const query = message.toLowerCase();
            let response = "This is a placeholder response. Ask about OHS compliance!";
            if (query.includes("ohs specification")) {
                response = "An OHS Specification outlines project-specific requirements per Construction Regulation 5(1)(b). Use the 'Compile Health and Safety Specification' button to add it to your cart.";
            } else if (query.includes("risk assessment")) {
                response = "Risk Assessments identify hazards and risks. Use the 'Compile Risk Assessment' button to start one.";
            }
            chatOutput.innerHTML += `<p><strong>Bot:</strong> ${response}</p>`;
            chatInput.value = "";
            chatOutput.scrollTop = chatOutput.scrollHeight;
        });
    } else {
        console.error("Chatbot input/output elements not found.");
    }

    // Initialize Cart Display
    updateCartDisplay();
});

// Generate OHS Specification PDF
function generateOHSSpecPDF(data) {
    if (!jsPDF) return;
    try {
        const doc = new jsPDF();
        addHeaderFooter(doc, "OHS Specification");

        let y = 30;
        doc.setFontSize(12);
        doc.text(`Project Name: ${data.projectName}`, 10, y); y += 10;
        doc.text(`Client: ${data.clientName}`, 10, y); y += 10;
        doc.text(`Contractor: ${data.contractorName}`, 10, y); y += 10;
        doc.text(`Site Address: ${data.siteAddress}`, 10, y); y += 10;
        doc.text(`Type of Work: ${data.typeOfWork}`, 10, y); y += 10;
        doc.text(`Location: ${data.location}`, 10, y); y += 10;
        doc.text(`Cost: R ${data.cost}`, 10, y); y += 10;
        doc.text(`Duration: ${data.duration} days`, 10, y); y += 10;
        doc.text(`Emergency Contact: ${data.emergencyContact}`, 10, y); y += 10;
        doc.text(`COIDA Registration: ${data.workmansComp}`, 10, y); y += 10;
        doc.text(`CIDB Grading: ${data.cidbGrade}`, 10, y); y += 10;
        doc.text(`Scope Details: ${data.scopeDetails}`, 10, y, { maxWidth: 180 }); y += 20;

        const activities = data.activities ? (Array.isArray(data.activities) ? data.activities.join(", ") : data.activities) : "None";
        doc.text(`Activities: ${activities}`, 10, y); y += 10;

        if (data.accreditationLevel !== "none") {
            doc.text(`Accreditation Level: ${data.accreditationLevel}`, 10, y); y += 10;
            if (data.sacpcmpReg) {
                doc.text(`SACPCMP Registration: ${data.sacpcmpReg}`, 10, y); y += 10;
            }
        }

        doc.save("OHS_Specification.pdf");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}

// Generate Health and Safety Plan PDF
function generateHSPlanPDF(data) {
    if (!jsPDF) return;
    try {
        const doc = new jsPDF();
        addHeaderFooter(doc, "Health and Safety Plan");

        let y = 30;
        doc.setFontSize(12);
        doc.text(`Project Name: ${data.projectName}`, 10, y); y += 10;
        doc.text(`Client: ${data.clientName}`, 10, y); y += 10;
        doc.text(`Contractor: ${data.contractorName}`, 10, y); y += 10;
        doc.text(`Site Address: ${data.siteAddress}`, 10, y); y += 10;
        doc.text(`Type of Work: ${data.typeOfWork}`, 10, y); y += 10;
        doc.text(`Location: ${data.location}`, 10, y); y += 10;
        doc.text(`Cost: R ${data.cost}`, 10, y); y += 10;
        doc.text(`Duration: ${data.duration} days`, 10, y); y += 10;
        doc.text(`Emergency Contact: ${data.emergencyContact}`, 10, y); y += 10;
        doc.text(`COIDA Registration: ${data.workmansComp}`, 10, y); y += 10;
        doc.text(`CIDB Grading: ${data.cidbGrade}`, 10, y); y += 10;
        doc.text(`Scope Details: ${data.scopeDetails}`, 10, y, { maxWidth: 180 }); y += 20;

        const activities = data.activities ? (Array.isArray(data.activities) ? data.activities.join(", ") : data.activities) : "None";
        doc.text(`Activities: ${activities}`, 10, y); y += 10;

        doc.save("Health_and_Safety_Plan.pdf");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}

// Generate Health and Safety File PDF (Placeholder)
function generateHSFilePDF(data) {
    if (!jsPDF) return;
    try {
        const doc = new jsPDF();
        addHeaderFooter(doc, "Health and Safety File");

        let y = 30;
        doc.setFontSize(12);
        doc.text(`Project Name: ${data.projectName}`, 10, y); y += 10;
        doc.text(`Client: ${data.clientName}`, 10, y); y += 10;
        doc.text(`Contractor: ${data.contractorName}`, 10, y); y += 10;
        doc.text(`Site Address: ${data.siteAddress}`, 10, y); y += 10;
        doc.text(`Type of Work: ${data.typeOfWork}`, 10, y); y += 10;
        doc.text(`Location: ${data.location}`, 10, y); y += 10;
        doc.text(`Note: This is a placeholder Health and Safety File.`, 10, y); y += 10;

        doc.save("Health_and_Safety_File.pdf");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}
