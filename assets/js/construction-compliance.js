/**
 * Construction Compliance JavaScript
 * Implements a step-by-step wizard for document compilation, cart-based checkout,
 * and professional PDF generation with storage for clients, contractors, and projects.
 */

// Check for jsPDF
const jsPDF = window.jspdf?.jsPDF;
if (!jsPDF) {
    console.error("jsPDF not loaded. Please check script inclusion.");
    alert("PDF generation library (jsPDF) not loaded. Please contact support.");
}

// Simulated User Authentication
let currentUser = null; // { id: string, email: string, clients: [], contractors: [] }
const loggedIn = () => !!currentUser;

// Storage Keys and Expiry
const CLIENT_STORAGE_KEY = "safetyHelpClients";
const CONTRACTOR_STORAGE_KEY = "safetyHelpContractors";
const PROJECT_STORAGE_KEY = "safetyHelpProjects";
const CART_STORAGE_KEY = "cart";
const INVOICE_STORAGE_KEY = "safetyHelpInvoice";
const EXPIRY_DAYS = 7;

// Utility Functions
const generateReferenceNumber = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const saveWithExpiry = (key, data, expiryDays = EXPIRY_DAYS) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);
    const storedData = {
        referenceNumber: generateReferenceNumber(),
        data,
        expiry: expiry.getTime(),
        created: new Date().getTime()
    };
    localStorage.setItem(key, JSON.stringify(storedData));
    return storedData.referenceNumber;
};

const getWithExpiry = (key, referenceNumber) => {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const storedData = JSON.parse(stored);
    if (storedData.referenceNumber !== referenceNumber) return null;
    const now = new Date().getTime();
    if (now > storedData.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return storedData.data;
};

// Cart Management
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

const addToCart = (documentName, price, type, data) => {
    cart.push({ documentName, price, type, data });
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartDisplay();
    alert(`${documentName} added to cart!`);

    // Generate and store invoice reference number
    const invoiceData = {
        referenceNumber: generateReferenceNumber(),
        cart
    };
    saveWithExpiry(INVOICE_STORAGE_KEY, invoiceData);
};

const updateCartDisplay = () => {
    const cartItems = document.getElementById('cart-items');
    const cartContainer = document.getElementById('cart-container');
    const invoiceRef = document.getElementById('invoice-reference');
    const invoiceRefNumber = document.getElementById('invoice-ref-number');
    if (!cartItems || !cartContainer || !invoiceRef || !invoiceRefNumber) {
        console.error("Cart elements not found.");
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
    invoiceRef.classList.toggle('hidden', cart.length === 0);
    if (cart.length > 0) {
        const invoiceData = JSON.parse(localStorage.getItem(INVOICE_STORAGE_KEY)) || {};
        invoiceRefNumber.textContent = invoiceData.referenceNumber || "N/A";
    }
};

// Wizard State
let currentStep = 1;
let formData = {
    documentTypes: [],
    client: {},
    contractorAppointed: '',
    contractor: {},
    project: {},
    scope: {},
    compiledBy: {},
    compiledFor: {},
    additionalSignatories: []
};

// High-Risk Activities (for SACPCMP recommendation)
const highRiskActivities = [
    "Working from Heights",
    "Asbestos Removal",
    "Confined Space Entry",
    "Demolition",
    "Working with Live Voltage",
    "Crane Operations",
    "Excavation",
    "Working Near Water",
    "Working in Tunnels"
];

// PDF Utility Functions
function addHeaderFooter(doc, title, pageNumber, totalPages) {
    // Header
    doc.setFontSize(10);
    doc.setTextColor(26, 37, 38); // #1a2526
    doc.text("[SafetyHelp Logo Placeholder]", 10, 10);
    doc.setFontSize(16);
    doc.text(title, 10, 20);
    doc.setFontSize(10);
    doc.text(`Reference: ${formData.project.referenceNumber || 'N/A'}`, 10, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 35);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(26, 37, 38); // #1a2526
    doc.text(`Powered by SafetyHelp – Ensuring Compliance, Enhancing Safety`, 10, 290);
    doc.text(`Page ${pageNumber} of ${totalPages}`, 190, 290, { align: "right" });

    // Watermark
    doc.setFontSize(50);
    doc.setTextColor(255, 111, 97, 0.2); // #ff6f61 at 20% opacity
    doc.text("SafetyHelp", 105, 148, { angle: 45, align: "center" });
}

function addCoverPage(doc, documentName, compiledBy, compiledFor) {
    doc.addPage();
    addHeaderFooter(doc, documentName, 1, 1);

    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51); // #333
    let y = 50;

    doc.text("Compiled By:", 10, y);
    y += 10;
    doc.text(`Name: ${compiledBy.name}`, 10, y);
    y += 10;
    doc.text(`Role: ${compiledBy.role}${compiledBy.sacpcmpReg ? ` (SACPCMP Reg: ${compiledBy.sacpcmpReg})` : ''}`, 10, y);
    y += 10;
    doc.text(`Contact: ${compiledBy.number}, ${compiledBy.email}`, 10, y);
    y += 20;

    doc.text("Compiled For:", 10, y);
    y += 10;
    doc.text(`Name: ${compiledFor.name}`, 10, y);
    y += 10;
    doc.text(`Role: ${compiledFor.role}`, 10, y);
    y += 10;
    doc.text(`Contact: ${compiledFor.number}, ${compiledFor.email}`, 10, y);
    y += 20;

    doc.text("Project Details:", 10, y);
    y += 10;
    doc.text(`Project Name: ${formData.project.projectName}`, 10, y);
    y += 10;
    doc.text(`Site Address: ${formData.project.siteAddress}`, 10, y);
    y += 10;
    doc.text(`Client Ref: ${formData.client.referenceNumber || 'N/A'}`, 10, y);
    y += 10;
    doc.text(`Project Ref: ${formData.project.referenceNumber || 'N/A'}`, 10, y);
}

function addMetadataAndDisclaimer(doc) {
    doc.addPage();
    addHeaderFooter(doc, "Metadata and Disclaimer", 1, 1);

    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51); // #333
    let y = 50;

    doc.text("Document Version:", 10, y);
    y += 10;
    doc.text("Version 1.0", 10, y);
    y += 20;

    doc.text("Disclaimer:", 10, y);
    y += 10;
    doc.setFontSize(10);
    doc.text("While SafetyHelp provides tools to assist in creating this document, the completeness and accuracy of the final document are the responsibility of the document owner. It is the owner’s duty to ensure compliance with all applicable laws and regulations, including the Occupational Health and Safety Act and Construction Regulations. Where a project scope requires a SACPCMP-accredited professional (e.g., PrCHSA or CHSO), SafetyHelp recommends engaging such a professional to ensure compliance.", 10, y, { maxWidth: 190 });
    y += 40;

    // Check for high-risk activities
    const hasHighRisk = formData.scope.activities ? formData.scope.activities.some(activity => highRiskActivities.includes(activity)) : false;
    if (hasHighRisk) {
        doc.setTextColor(255, 215, 0); // #FFD700
        doc.text("Recommendation:", 10, y);
        y += 10;
        doc.setTextColor(51, 51, 51); // #333
        doc.text("This project involves high-risk activities. SafetyHelp recommends engaging a SACPCMP-accredited professional (PrCHSA or CHSO) to oversee compliance.", 10, y, { maxWidth: 190 });
    }
}

function addSignaturePage(doc, compiledBy, compiledFor, additionalSignatories = []) {
    doc.addPage();
    addHeaderFooter(doc, "Signatures", 1, 1);

    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51); // #333
    let y = 50;

    doc.text("Signatures", 10, y);
    y += 10;

    const tableData = [
        ["Compiled By", compiledBy.name, "[Signature Placeholder]", new Date().toLocaleDateString()],
        ["Compiled For", compiledFor.name, "[Signature Placeholder]", new Date().toLocaleDateString()]
    ];

    additionalSignatories.forEach(sig => {
        tableData.push(["Additional Signatory", sig.name, "[Signature Placeholder]", new Date().toLocaleDateString()]);
    });

    doc.autoTable({
        startY: y,
        head: [['Role', 'Name', 'Signature', 'Date']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 40 }, 2: { cellWidth: 60 }, 3: { cellWidth: 40 } }
    });
}

function addServicesPage(doc) {
    doc.addPage();
    addHeaderFooter(doc, "Explore More with SafetyHelp", 1, 1);

    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51); // #333
    let y = 50;

    doc.text("Explore More with SafetyHelp", 10, y);
    y += 10;

    const services = [
        "[Icon] Health and Safety Specifications",
        "[Icon] Health and Safety Plans",
        "[Icon] Risk Assessments",
        "[Icon] Training and Induction",
        "[Icon] Legal Appointments",
        "[Icon] Inspections and Audits",
        "[Icon] Incident Management",
        "[Icon] Compliance Reports",
        "[Icon] Health and Safety File Compilation"
    ];

    services.forEach(service => {
        doc.text(service, 10, y);
        y += 10;
    });

    y += 10;
    doc.text("Visit safetyhelp.com to learn more and register for permanent document storage!", 10, y);
}

// Generate Invoice PDF
function generateInvoicePDF() {
    if (!jsPDF) return;
    try {
        const doc = new jsPDF();
        addHeaderFooter(doc, "Invoice", 1, 1);

        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        let y = 50;

        doc.text("Client Details:", 10, y);
        y += 10;
        doc.text(`Name: ${formData.client.clientName}`, 10, y);
        y += 10;
        doc.text(`Contact: ${formData.client.clientContactNumber}, ${formData.client.clientEmail}`, 10, y);
        y += 20;

        doc.text("Invoice Details:", 10, y);
        y += 10;

        const tableData = cart.map(item => [item.documentName, `R ${item.price.toFixed(2)}`]);
        doc.autoTable({
            startY: y,
            head: [['Document', 'Price']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10 },
            columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60 } }
        });

        y = doc.lastAutoTable.finalY + 20;
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        const discount = document.getElementById("promo-code").value === "SAFETYFIRST25" ? 0.25 : 0;
        const finalPrice = totalPrice * (1 - discount);
        doc.text(`Total Price: R ${totalPrice.toFixed(2)}`, 10, y);
        if (discount > 0) {
            y += 10;
            doc.text(`Discount (25%): R ${(totalPrice * discount).toFixed(2)}`, 10, y);
            y += 10;
            doc.text(`Final Price: R ${finalPrice.toFixed(2)}`, 10, y);
        }

        y += 20;
        doc.setFontSize(10);
        doc.text("Note: Your invoice reference number allows you to retrieve documents for 7 days. Register at safetyhelp.com to store them indefinitely.", 10, y, { maxWidth: 190 });

        doc.save("Invoice.pdf");
    } catch (error) {
        console.error("Invoice PDF generation error:", error);
        alert("Failed to generate invoice PDF. Please try again.");
    }
}

// Document-Specific PDF Generation
function generateOHSSpecPDF(data) {
    if (!jsPDF) return;
    try {
        const doc = new jsPDF();

        // Cover Page
        addCoverPage(doc, "Health and Safety Specification", data.compiledBy, data.compiledFor);

        // Metadata and Disclaimer
        addMetadataAndDisclaimer(doc);

        // Content
        doc.addPage();
        addHeaderFooter(doc, "Health and Safety Specification", 1, 1);

        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        let y = 50;

        doc.text("Client Details:", 10, y);
        y += 10;
        doc.text(`Name: ${data.client.clientName}`, 10, y);
        y += 10;
        doc.text(`Address: ${data.client.clientAddress}`, 10, y);
        y += 10;
        doc.text(`Contact: ${data.client.clientContactPerson} (${data.client.clientContactRole})`, 10, y);
        y += 10;
        doc.text(`Phone: ${data.client.clientContactNumber}, Email: ${data.client.clientEmail}`, 10, y);
        y += 10;
        doc.text(`COIDA Registration: ${data.client.clientCoida}`, 10, y);
        y += 20;

        doc.text("Contractor Details:", 10, y);
        y += 10;
        if (data.contractorAppointed === "yes") {
            doc.text(`Name: ${data.contractor.contractorName}`, 10, y);
            y += 10;
            doc.text(`Address: ${data.contractor.contractorAddress}`, 10, y);
            y += 10;
            doc.text(`Contact: ${data.contractor.contractorContactPerson} (${data.contractor.contractorContactRole})`, 10, y);
            y += 10;
            doc.text(`Phone: ${data.contractor.contractorContactNumber}, Email: ${data.contractor.contractorEmail}`, 10, y);
            y += 10;
            doc.text(`COIDA Registration: ${data.contractor.contractorCoida}`, 10, y);
        } else {
            doc.text(`Contractor: ${data.contractorAppointed === "no" ? "Not Appointed" : "Not Applicable"}`, 10, y);
        }
        y += 20;

        doc.text("Project Scope:", 10, y);
        y += 10;
        doc.text(`Type of Work: ${data.scope.typeOfWork}`, 10, y);
        y += 10;
        doc.text(`CIDB Grading: ${data.scope.cidbGrade}`, 10, y);
        y += 10;
        doc.text(`Cost: R ${data.scope.cost}`, 10, y);
        y += 10;
        doc.text(`Duration: ${data.scope.duration} days`, 10, y);
        y += 10;
        const activities = data.scope.activities ? (Array.isArray(data.scope.activities) ? data.scope.activities.join(", ") : data.scope.activities) : "None";
        doc.text(`Activities: ${activities}`, 10, y);
        y += 20;
        doc.text("Scope Details:", 10, y);
        y += 10;
        doc.text(data.scope.scopeDetails, 10, y, { maxWidth: 190 });

        // Signature Page
        addSignaturePage(doc, data.compiledBy, data.compiledFor, data.additionalSignatories);

        // Services Page
        addServicesPage(doc);

        doc.save("Health_and_Safety_Specification.pdf");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}

function generateHSPlanPDF(data) {
    if (!jsPDF) return;
    try {
        const doc = new jsPDF();

        // Cover Page
        addCoverPage(doc, "Health and Safety Plan", data.compiledBy, data.compiledFor);

        // Metadata and Disclaimer
        addMetadataAndDisclaimer(doc);

        // Content
        doc.addPage();
        addHeaderFooter(doc, "Health and Safety Plan", 1, 1);

        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        let y = 50;

        doc.text("Client Details:", 10, y);
        y += 10;
        doc.text(`Name: ${data.client.clientName}`, 10, y);
        y += 10;
        doc.text(`Address: ${data.client.clientAddress}`, 10, y);
        y += 10;
        doc.text(`Contact: ${data.client.clientContactPerson} (${data.client.clientContactRole})`, 10, y);
        y += 10;
        doc.text(`Phone: ${data.client.clientContactNumber}, Email: ${data.client.clientEmail}`, 10, y);
        y += 10;
        doc.text(`COIDA Registration: ${data.client.clientCoida}`, 10, y);
        y += 20;

        doc.text("Contractor Details:", 10, y);
        y += 10;
        if (data.contractorAppointed === "yes") {
            doc.text(`Name: ${data.contractor.contractorName}`, 10, y);
            y += 10;
            doc.text(`Address: ${data.contractor.contractorAddress}`, 10, y);
            y += 10;
            doc.text(`Contact: ${data.contractor.contractorContactPerson} (${data.contractor.contractorContactRole})`, 10, y);
            y += 10;
            doc.text(`Phone: ${data.contractor.contractorContactNumber}, Email: ${data.contractor.contractorEmail}`, 10, y);
            y += 10;
            doc.text(`COIDA Registration: ${data.contractor.contractorCoida}`, 10, y);
        } else {
            doc.text(`Contractor: ${data.contractorAppointed === "no" ? "Not Appointed" : "Not Applicable"}`, 10, y);
        }
        y += 20;

        doc.text("Project Scope:", 10, y);
        y += 10;
        doc.text(`Type of Work: ${data.scope.typeOfWork}`, 10, y);
        y += 10;
        doc.text(`CIDB Grading: ${data.scope.cidbGrade}`, 10, y);
        y += 10;
        doc.text(`Cost: R ${data.scope.cost}`, 10, y);
        y += 10;
        doc.text(`Duration: ${data.scope.duration} days`, 10, y);
        y += 10;
        const activities = data.scope.activities ? (Array.isArray(data.scope.activities) ? data.scope.activities.join(", ") : data.scope.activities) : "None";
        doc.text(`Activities: ${activities}`, 10, y);
        y += 20;
        doc.text("Scope Details:", 10, y);
        y += 10;
        doc.text(data.scope.scopeDetails, 10, y, { maxWidth: 190 });

        // Placeholder for Safety Policies and Emergency Procedures
        doc.addPage();
        addHeaderFooter(doc, "Safety Policies and Procedures", 1, 1);
        y = 50;
        doc.text("Safety Policies:", 10, y);
        y += 10;
        doc.text("[Placeholder for Safety Policies]", 10, y);
        y += 20;
        doc.text("Emergency Procedures:", 10, y);
        y += 10;
        doc.text("[Placeholder for Emergency Procedures]", 10, y);

        // Signature Page
        addSignaturePage(doc, data.compiledBy, data.compiledFor, data.additionalSignatories);

        // Services Page
        addServicesPage(doc);

        doc.save("Health_and_Safety_Plan.pdf");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}

function generateHSFilePDF(data) {
    if (!jsPDF) return;
    try {
        const doc = new jsPDF();

        // Cover Page for Health and Safety File
        addCoverPage(doc, "Health and Safety File", data.compiledBy, data.compiledFor);

        // Metadata and Disclaimer
        addMetadataAndDisclaimer(doc);

        // Placeholder Content
        doc.addPage();
        addHeaderFooter(doc, "Health and Safety File", 1, 1);

        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51); // #333
        let y = 50;

        doc.text("This Health and Safety File includes all selected documents for the project.", 10, y);
        y += 20;
        doc.text("Documents Included:", 10, y);
        y += 10;
        const documents = cart.filter(item => item.type !== "hs-file").map(item => item.documentName);
        documents.forEach(docName => {
            doc.text(`- ${docName}`, 10, y);
            y += 10;
        });

        // Signature Page
        addSignaturePage(doc, data.compiledBy, data.compiledFor, data.additionalSignatories);

        // Services Page
        addServicesPage(doc);

        doc.save("Health_and_Safety_File.pdf");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}

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
                    currentUser = { id: "user1", email, clients: [], contractors: [] };
                    alert(`Logged in as ${email}`);
                    loginLink.textContent = "Logout";
                }
            }
        });
    } else {
        console.error("Login link not found.");
    }

    // Wizard Navigation
    const steps = Array.from(document.querySelectorAll('.wizard-step'));
    const backButtons = document.querySelectorAll('#back-btn');
    const nextButtons = document.querySelectorAll('#next-btn');

    const showStep = (stepNumber) => {
        steps.forEach((step, index) => {
            step.classList.toggle('hidden', index + 1 !== stepNumber);
        });
        currentStep = stepNumber;
        backButtons.forEach(btn => btn.disabled = currentStep === 1);
    };

    // Step 1: Document Selection
    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep === 1) {
                const documentTypes = Array.from(document.querySelectorAll('input[name="documentTypes"]:checked'))
                    .map(input => input.value);
                const error = document.getElementById('document-types-error');
                if (documentTypes.length === 0) {
                    error.classList.remove('hidden');
                    return;
                }
                error.classList.add('hidden');
                formData.documentTypes = documentTypes;

                // Populate Step 9 (Review)
                const selectedDocs = document.getElementById('selected-documents');
                selectedDocs.innerHTML = '';
                formData.documentTypes.forEach(type => {
                    const li = document.createElement('li');
                    li.textContent = {
                        'hs-spec': 'Health and Safety Specification',
                        'hs-plan': 'Health and Safety Plan',
                        'risk-assessment': 'Risk Assessment',
                        'training': 'Conduct Training',
                        'appointments': 'Legal Appointments',
                        'inspections': 'Inspections/Audits',
                        'incidents': 'Incident Management',
                        'reports': 'Compliance Reports',
                        'hs-file': 'Health and Safety File'
                    }[type];
                    selectedDocs.appendChild(li);
                });

                showStep(currentStep + 1);
            } else if (currentStep === 2) {
                // Step 2: Client Details
                const clientName = document.getElementById('client-name').value;
                const clientAddress = document.getElementById('client-address').value;
                const clientContactPerson = document.getElementById('client-contact-person').value;
                const clientContactRole = document.getElementById('client-contact-role').value;
                const clientContactNumber = document.getElementById('client-contact-number').value;
                const clientEmail = document.getElementById('client-email').value;
                const clientCoida = document.getElementById('client-coida').value;

                const validations = [
                    { id: 'client-name', value: clientName, error: 'client-name-error', message: "Please enter a client company name." },
                    { id: 'client-address', value: clientAddress, error: 'client-address-error', message: "Please enter a client address." },
                    { id: 'client-contact-person', value: clientContactPerson, error: 'client-contact-person-error', message: "Please enter a client contact person." },
                    { id: 'client-contact-role', value: clientContactRole, error: 'client-contact-role-error', message: "Please enter a client contact role." },
                    { id: 'client-contact-number', value: clientContactNumber, pattern: /^\+?[0-9\s\-()]{10,}$/, error: 'client-contact-number-error', message: "Please enter a valid phone number (e.g., +27123456789)." },
                    { id: 'client-email', value: clientEmail, pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, error: 'client-email-error', message: "Please enter a valid email address." },
                    { id: 'client-coida', value: clientCoida, error: 'client-coida-error', message: "Please enter a COIDA registration number." }
                ];

                let valid = true;
                validations.forEach(v => {
                    const errorEl = document.getElementById(v.error);
                    if (!v.value || (v.pattern && !v.pattern.test(v.value))) {
                        errorEl.classList.remove('hidden');
                        errorEl.textContent = v.message;
                        valid = false;
                    } else {
                        errorEl.classList.add('hidden');
                    }
                });

                if (!valid) return;

                formData.client = {
                    clientName,
                    clientAddress,
                    clientContactPerson,
                    clientContactRole,
                    clientContactNumber,
                    clientEmail,
                    clientCoida
                };
                formData.client.referenceNumber = saveWithExpiry(CLIENT_STORAGE_KEY, formData.client);

                showStep(currentStep + 1);
            } else if (currentStep === 3) {
                // Step 3: Contractor Appointed
                const contractorAppointed = document.getElementById('contractor-appointed').value;
                formData.contractorAppointed = contractorAppointed;

                if (contractorAppointed === "yes") {
                    showStep(currentStep + 1);
                } else {
                    showStep(currentStep + 2); // Skip Step 4
                }
            } else if (currentStep === 4) {
                // Step 4: Contractor Details
                const contractorName = document.getElementById('contractor-name').value;
                const contractorAddress = document.getElementById('contractor-address').value;
                const contractorContactPerson = document.getElementById('contractor-contact-person').value;
                const contractorContactRole = document.getElementById('contractor-contact-role').value;
                const contractorContactNumber = document.getElementById('contractor-contact-number').value;
                const contractorEmail = document.getElementById('contractor-email').value;
                const contractorCoida = document.getElementById('contractor-coida').value;

                const validations = [
                    { id: 'contractor-name', value: contractorName, error: 'contractor-name-error', message: "Please enter a contractor company name." },
                    { id: 'contractor-address', value: contractorAddress, error: 'contractor-address-error', message: "Please enter a contractor address." },
                    { id: 'contractor-contact-person', value: contractorContactPerson, error: 'contractor-contact-person-error', message: "Please enter a contractor contact person." },
                    { id: 'contractor-contact-role', value: contractorContactRole, error: 'contractor-contact-role-error', message: "Please enter a contractor contact role." },
                    { id: 'contractor-contact-number', value: contractorContactNumber, pattern: /^\+?[0-9\s\-()]{10,}$/, error: 'contractor-contact-number-error', message: "Please enter a valid phone number (e.g., +27123456789)." },
                    { id: 'contractor-email', value: contractorEmail, pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, error: 'contractor-email-error', message: "Please enter a valid email address." },
                    { id: 'contractor-coida', value: contractorCoida, error: 'contractor-coida-error', message: "Please enter a COIDA registration number." }
                ];

                let valid = true;
                validations.forEach(v => {
                    const errorEl = document.getElementById(v.error);
                    if (!v.value || (v.pattern && !v.pattern.test(v.value))) {
                        errorEl.classList.remove('hidden');
                        errorEl.textContent = v.message;
                        valid = false;
                    } else {
                        errorEl.classList.add('hidden');
                    }
                });

                if (!valid) return;

                formData.contractor = {
                    contractorName,
                    contractorAddress,
                    contractorContactPerson,
                    contractorContactRole,
                    contractorContactNumber,
                    contractorEmail,
                    contractorCoida
                };
                formData.contractor.referenceNumber = saveWithExpiry(CONTRACTOR_STORAGE_KEY, formData.contractor);

                showStep(currentStep + 1);
            } else if (currentStep === 5) {
                // Step 5: Project Details
                const projectName = document.getElementById('project-name').value;
                const siteAddress = document.getElementById('site-address').value;
                const siteSupervisorName = document.getElementById('site-supervisor-name').value;
                const siteSupervisorNumber = document.getElementById('site-supervisor-number').value;
                const siteSupervisorEmail = document.getElementById('site-supervisor-email').value;

                const validations = [
                    { id: 'project-name', value: projectName, error: 'project-name-error', message: "Please enter a project name." },
                    { id: 'site-address', value: siteAddress, error: 'site-address-error', message: "Please enter a site address." },
                    { id: 'site-supervisor-name', value: siteSupervisorName, error: 'site-supervisor-name-error', message: "Please enter a site supervisor name." },
                    { id: 'site-supervisor-number', value: siteSupervisorNumber, pattern: /^\+?[0-9\s\-()]{10,}$/, error: 'site-supervisor-number-error', message: "Please enter a valid phone number (e.g., +27123456789)." },
                    { id: 'site-supervisor-email', value: siteSupervisorEmail, pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, error: 'site-supervisor-email-error', message: "Please enter a valid email address." }
                ];

                let valid = true;
                validations.forEach(v => {
                    const errorEl = document.getElementById(v.error);
                    if (!v.value || (v.pattern && !v.pattern.test(v.value))) {
                        errorEl.classList.remove('hidden');
                        errorEl.textContent = v.message;
                        valid = false;
                    } else {
                        errorEl.classList.add('hidden');
                    }
                });

                if (!valid) return;

                formData.project = {
                    projectName,
                    siteAddress,
                    siteSupervisorName,
                    siteSupervisorNumber,
                    siteSupervisorEmail,
                    clientRef: formData.client.referenceNumber,
                    contractorRef: formData.contractorAppointed === "yes" ? formData.contractor.referenceNumber : null
                };
                formData.project.referenceNumber = saveWithExpiry(PROJECT_STORAGE_KEY, formData.project);

                // Set project reference in the form
                document.getElementById('project-reference').value = formData.project.referenceNumber;

                showStep(currentStep + 1);
            } else if (currentStep === 6) {
                // Step 6: Scope of the Project
                const typeOfWork = document.getElementById('type-of-work').value;
                const cidbGrade = document.getElementById('cidb-grade').value;
                const cost = document.getElementById('cost').value;
                const duration = document.getElementById('duration').value;
                const activities = Array.from(document.querySelectorAll('input[name="activities"]:checked'))
                    .map(input => input.value);
                const scopeDetails = document.getElementById('scope-details').value;

                const validations = [
                    { id: 'type-of-work', value: typeOfWork, error: 'type-of-work-error', message: "Please enter the type of work." },
                    { id: 'cidb-grade', value: cidbGrade, error: 'cidb-grade-error', message: "Please select a CIDB grading." },
                    { id: 'cost', value: cost, error: 'cost-error', message: "Please enter a valid project cost (R)." },
                    { id: 'duration', value: duration, error: 'duration-error', message: "Please enter a valid duration (days)." },
                    { id: 'scope-details', value: scopeDetails, error: 'scope-details-error', message: "Please enter scope details." }
                ];

                let valid = true;
                validations.forEach(v => {
                    const errorEl = document.getElementById(v.error);
                    if (!v.value) {
                        errorEl.classList.remove('hidden');
                        errorEl.textContent = v.message;
                        valid = false;
                    } else {
                        errorEl.classList.add('hidden');
                    }
                });

                if (!valid) return;

                formData.scope = {
                    typeOfWork,
                    cidbGrade,
                    cost,
                    duration,
                    activities,
                    scopeDetails
                };

                showStep(currentStep + 1);
            } else if (currentStep === 7) {
                // Step 7: Compiled By
                const compiledByName = document.getElementById('compiled-by-name').value;
                const compiledByNumber = document.getElementById('compiled-by-number').value;
                const compiledByEmail = document.getElementById('compiled-by-email').value;
                const compiledByRole = document.getElementById('compiled-by-role').value;
                const sacpcmpReg = document.getElementById('sacpcmp-reg').value;
                const compiledByRoleOther = document.getElementById('compiled-by-role-other').value;

                const validations = [
                    { id: 'compiled-by-name', value: compiledByName, error: 'compiled-by-name-error', message: "Please enter your name." },
                    { id: 'compiled-by-number', value: compiledByNumber, pattern: /^\+?[0-9\s\-()]{10,}$/, error: 'compiled-by-number-error', message: "Please enter a valid phone number (e.g., +27123456789)." },
                    { id: 'compiled-by-email', value: compiledByEmail, pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, error: 'compiled-by-email-error', message: "Please enter a valid email address." },
                    { id: 'compiled-by-role', value: compiledByRole, error: 'compiled-by-role-error', message: "Please select a role." },
                    { id: 'sacpcmp-reg', value: sacpcmpReg, error: 'sacpcmp-reg-error', message: "Please enter a SACPCMP registration number.", condition: () => (compiledByRole === "sacpcmp-officer" || compiledByRole === "sacpcmp-agent") },
                    { id: 'compiled-by-role-other', value: compiledByRoleOther, error: 'compiled-by-role-other-error', message: "Please specify your role.", condition: () => compiledByRole === "other" }
                ];

                let valid = true;
                validations.forEach(v => {
                    const errorEl = document.getElementById(v.error);
                    if (v.condition && !v.condition()) {
                        errorEl.classList.add('hidden');
                        return;
                    }
                    if (!v.value || (v.pattern && !v.pattern.test(v.value))) {
                        errorEl.classList.remove('hidden');
                        errorEl.textContent = v.message;
                        valid = false;
                    } else {
                        errorEl.classList.add('hidden');
                    }
                });

                if (!valid) return;

                formData.compiledBy = {
                    name: compiledByName,
                    number: compiledByNumber,
                    email: compiledByEmail,
                    role: compiledByRole === "other" ? compiledByRoleOther : compiledByRole,
                    sacpcmpReg: (compiledByRole === "sacpcmp-officer" || compiledByRole === "sacpcmp-agent") ? sacpcmpReg : null
                };

                showStep(currentStep + 1);
            } else if (currentStep === 8) {
                // Step 8: Compiled For
                const compiledFor = document.getElementById('compiled-for').value;
                const compiledForOther = document.getElementById('compiled-for-other').value;

                const validations = [
                    { id: 'compiled-for', value: compiledFor, error: 'compiled-for-error', message: "Please select an option." },
                    { id: 'compiled-for-other', value: compiledForOther, error: 'compiled-for-other-error', message: "Please specify who the document is compiled for.", condition: () => compiledFor === "other" }
                ];

                let valid = true;
                validations.forEach(v => {
                    const errorEl = document.getElementById(v.error);
                    if (v.condition && !v.condition()) {
                        errorEl.classList.add('hidden');
                        return;
                    }
                    if (!v.value) {
                        errorEl.classList.remove('hidden');
                        errorEl.textContent = v.message;
                        valid = false;
                    } else {
                        errorEl.classList.add('hidden');
                    }
                });

                if (!valid) return;

                let compiledForData = {};
                if (compiledFor === "client") {
                    compiledForData = {
                        name: formData.client.clientName,
                        role: "Client",
                        number: formData.client.clientContactNumber,
                        email: formData.client.clientEmail
                    };
                } else if (compiledFor === "contractor" && formData.contractorAppointed === "yes") {
                    compiledForData = {
                        name: formData.contractor.contractorName,
                        role: "Contractor",
                        number: formData.contractor.contractorContactNumber,
                        email: formData.contractor.contractorEmail
                    };
                } else {
                    compiledForData = {
                        name: compiledForOther,
                        role: compiledForOther,
                        number: formData.compiledBy.number, // Fallback to compiled by
                        email: formData.compiledBy.email
                    };
                }

                formData.compiledFor = compiledForData;

                showStep(currentStep + 1);
            } else if (currentStep === 9) {
                // Step 9: Add to Cart
                formData.documentTypes.forEach(type => {
                    if (type === "hs-spec") {
                        addToCart("Health and Safety Specification", 50.00, "hs-spec", formData);
                    } else if (type === "hs-plan") {
                        addToCart("Health and Safety Plan", 50.00, "hs-plan", formData);
                    } else if (type === "hs-file") {
                        addToCart("Health and Safety File", 100.00, "hs-file", formData);
                    } else if (type === "risk-assessment") {
                        window.location.href = "/safety-plans/pages/risk-assessment.html?type=baseline";
                    } else if (type === "training") {
                        window.location.href = "https://salatiso.github.io/safety-plans/pages/general-induction.html";
                    } else if (type === "appointments") {
                        window.location.href = "https://salatiso.github.io/safety-plans/pages/legal-appointments.html";
                    } else if (type === "inspections") {
                        window.location.href = "https://salatiso.github.io/safety-plans/pages/inspections-audits.html";
                    } else if (type === "incidents") {
                        window.location.href = "https://salatiso.github.io/safety-plans/pages/incident-management.html";
                    } else if (type === "reports") {
                        alert("Report compilation coming soon!");
                    }
                });

                // Reset form data
                formData = {
                    documentTypes: [],
                    client: {},
                    contractorAppointed: '',
                    contractor: {},
                    project: {},
                    scope: {},
                    compiledBy: {},
                    compiledFor: {}
                };
                showStep(1);
                document.querySelectorAll('input, select, textarea').forEach(input => {
                    if (input.type === "checkbox") {
                        input.checked = false;
                    } else {
                        input.value = "";
                    }
                });
            }
        });
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep === 5 && formData.contractorAppointed !== "yes") {
                showStep(currentStep - 2); // Skip Step 4
            } else {
                showStep(currentStep - 1);
            }
        });
    });

    // Step 3: Contractor Appointed - Show/Hide Step 4
    const contractorAppointedSelect = document.getElementById('contractor-appointed');
    if (contractorAppointedSelect) {
        contractorAppointedSelect.addEventListener('change', () => {
            formData.contractorAppointed = contractorAppointedSelect.value;
        });
    }

    // Step 7: Compiled By Role - Show/Hide SACPCMP and Other Fields
    const compiledByRoleSelect = document.getElementById('compiled-by-role');
    const sacpcmpRegContainer = document.getElementById('sacpcmp-reg-container');
    const compiledByRoleOtherContainer = document.getElementById('compiled-by-role-other-container');
    if (compiledByRoleSelect && sacpcmpRegContainer && compiledByRoleOtherContainer) {
        compiledByRoleSelect.addEventListener('change', () => {
            const role = compiledByRoleSelect.value;
            sacpcmpRegContainer.classList.toggle('hidden', !(role === "sacpcmp-officer" || role === "sacpcmp-agent"));
            compiledByRoleOtherContainer.classList.toggle('hidden', role !== "other");
        });
    }

    // Step 8: Compiled For - Show/Hide Other Field
    const compiledForSelect = document.getElementById('compiled-for');
    const compiledForOtherContainer = document.getElementById('compiled-for-other-container');
    if (compiledForSelect && compiledForOtherContainer) {
        compiledForSelect.addEventListener('change', () => {
            compiledForOtherContainer.classList.toggle('hidden', compiledForSelect.value !== "other");
        });
    }

    // Checkout
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            const promoCode = document.getElementById("promo-code").value;
            if (promoCode === "SAFETYFIRST25") {
                alert("Promo code applied! 25% discount (mock implementation).");
            }

            // Generate Invoice PDF
            generateInvoicePDF();

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
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            localStorage.removeItem(INVOICE_STORAGE_KEY);
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
                response = "An OHS Specification outlines project-specific requirements per Construction Regulation 5(1)(b). Start the wizard to compile one and add it to your cart.";
            } else if (query.includes("risk assessment")) {
                response = "Risk Assessments identify hazards and risks. Select 'Compile Risk Assessment' in the wizard to begin.";
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
