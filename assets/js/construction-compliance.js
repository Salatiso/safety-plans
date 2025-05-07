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
    // Do not alert here to avoid interrupting the flow
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
let currentStep = 0; // Start at 0 (wizard hidden)
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
    doc.text(`Role: ${compiledBy.role}${compiledBy.sacpcmpReg && compiledBy.sacpcmpReg !== "N/A" ? ` (SACPCMP Reg: ${compiledBy.sacpcmpReg})` : ''}`, 10, y);
    y += 10;
    doc.text(`Contact: ${compiledBy.number}, ${compiledBy.email}`, 10, y);
    y += 20;

    doc.text("Compiled For:", 10, y);
    y += 10;
    doc.text(`Name: ${compiledFor.name}`, 10, y);
    y += 10;
    doc.text(`Role: ${compiledFor.role}${compiledFor.specify && compiledFor.specify !== "N/A" ? ` (${compiledFor.specify})` : ''}`, 10, y);
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

    // Wizard State
    const wizardContainer = document.getElementById('wizard-content');
    const wizardSidebar = document.getElementById('wizard-sidebar');

    // Sidebar Content for Each Step
    const sidebarContent = [
        // Step 0: Hidden State
        `
            <h4>📜 OHS Compliance</h4>
            <p>Start by selecting a service to ensure compliance with the Occupational Health and Safety Act.</p>
            <p class="fun-fact">⚡ Fun Fact: Did you know that proper OHS documentation can cut workplace incidents by up to 30%? Let’s get started!</p>
        `,
        // Step 1: Document Selection
        `
            <h4>📋 Legislation</h4>
            <p>Construction Regulation 5(1)(b) requires a Health and Safety Specification for all projects, while 7(1)(b) mandates an H&S File.</p>
            <p class="fun-fact">🛡️ Fun Fact: A solid H&S Spec can reduce accidents by 30%! It’s like a safety shield for your project.</p>
        `,
        // Step 2: Client Details
        `
            <h4>📋 Legislation</h4>
            <p>Construction Regulation 5: Clients must provide a Health & Safety Specification and ensure contractors comply.</p>
            <p class="fun-fact">💼 Fun Fact: Clients who stay on top of COIDA registration can avoid hefty fines—keep that number handy!</p>
        `,
        // Step 3: Contractor Appointed
        `
            <h4>📜 Legislation</h4>
            <p>Construction Regulation 7(1)(a): Contractors must develop a Health & Safety Plan based on the client’s specification.</p>
            <p class="fun-fact">🤝 Fun Fact: Appointing a contractor early can speed up compliance—teamwork makes the safety dream work!</p>
        `,
        // Step 4: Contractor Details
        `
            <h4>📋 Legislation</h4>
            <p>Construction Regulation 7(1)(b): Contractors must maintain an on-site Health & Safety File with all required documents.</p>
            <p class="fun-fact">📞 Fun Fact: Having a contractor’s contact details ready can save the day during an emergency—stay connected!</p>
        `,
        // Step 5: Project Details
        `
            <h4>📜 Legislation</h4>
            <p>Construction Regulation 3(1): A permit is required for projects over R40,000 or lasting more than 180 days.</p>
            <p class="fun-fact">🚧 Fun Fact: Clear site addresses help emergency crews find you faster—don’t let a typo slow down help!</p>
        `,
        // Step 6: Scope of the Project
        `
            <h4>📋 Legislation</h4>
            <p>Construction Regulation 9: Task-specific Hazard Identification and Risk Assessments (HIRAs) are mandatory for all activities.</p>
            <p class="fun-fact">🔍 Fun Fact: Spotting high-risk activities early can cut risks by 25%—it’s like giving your project a safety superpower!</p>
        `,
        // Step 7: Compiled By
        `
            <h4>📜 Legislation</h4>
            <p>SACPCMP Guidelines: CHSOs and PrCHSAs must maintain registration and CPD to ensure compliance.</p>
            <p class="fun-fact">🧑‍💼 Fun Fact: A registered SACPCMP pro can slash legal risks—your project’s safety MVP!</p>
        `,
        // Step 8: Compiled For
        `
            <h4>📋 Legislation</h4>
            <p>Construction Regulation 5(1)(l): Clients must approve the contractor’s H&S Plan before work begins.</p>
            <p class="fun-fact">📝 Fun Fact: Clear accountability in docs can boost project transparency—everyone knows their role!</p>
        `,
        // Step 9: Review and Add to Cart
        `
            <h4>📜 Legislation</h4>
            <p>Occupational Health and Safety Act: Proper documentation ensures compliance and protects all stakeholders.</p>
            <p class="fun-fact">🛒 Fun Fact: Your cart is your safety toolkit—each doc you add makes your project safer!</p>
        `
    ];

    // Step Definitions
    const steps = [
        // Step 0: Hidden State (Initial State)
        () => `
            <p>Please select an action to begin the process.</p>
        `,

        // Step 1: Document Selection
        () => `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 11%;"></div>
            </div>
            <h3>Step 1 of 9: What Would You Like to Do?</h3>
            <div class="form-group">
                <label>Select Documents to Compile (Select all that apply):</label>
                <table class="document-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Document</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="document-name"><span class="emoji">📋</span> Health and Safety Specification</td>
                            <td><input type="checkbox" id="hs-spec" name="documentTypes" value="hs-spec" ${formData.documentTypes.includes('hs-spec') ? 'checked' : ''}></td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td class="document-name"><span class="emoji">🛡️</span> Health and Safety Plan</td>
                            <td><input type="checkbox" id="hs-plan" name="documentTypes" value="hs-plan" ${formData.documentTypes.includes('hs-plan') ? 'checked' : ''}></td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td class="document-name"><span class="emoji">⚠️</span> Risk Assessment</td>
                            <td><input type="checkbox" id="risk-assessment" name="documentTypes" value="risk-assessment" ${formData.documentTypes.includes('risk-assessment') ? 'checked' : ''}></td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td class="document-name"><span class="emoji">🎓</span> Conduct Training</td>
                            <td><input type="checkbox" id="training" name="documentTypes" value="training" ${formData.documentTypes.includes('training') ? 'checked' : ''}></td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td class="document-name"><span class="emoji">📜</span> Make Legal Appointments</td>
                            <td><input type="checkbox" id="appointments" name="documentTypes" value="appointments" ${formData.documentTypes.includes('appointments') ? 'checked' : ''}></td>
                        </tr>
                        <tr>
                            <td>6</td>
                            <td class="document-name"><span class="emoji">🔍</span> Conduct Inspections/Audits</td>
                            <td><input type="checkbox" id="inspections" name="documentTypes" value="inspections" ${formData.documentTypes.includes('inspections') ? 'checked' : ''}></td>
                        </tr>
                        <tr>
                            <td>7</td>
                            <td class="document-name"><span class="emoji">🚑</span> Manage Incidents</td>
                            <td><input type="checkbox" id="incidents" name="documentTypes" value="incidents" ${formData.documentTypes.includes('incidents') ? 'checked' : ''}></td>
                        </tr>
                        <tr>
                            <td>8</td>
                            <td class="document-name"><span class="emoji">📊</span> Compile Reports</td>
                            <td><input type="checkbox" id="reports" name="documentTypes" value="reports" ${formData.documentTypes.includes('reports') ? 'checked' : ''}></td>
                        </tr>
                        <tr>
                            <td>9</td>
                            <td class="document-name"><span class="emoji">📁</span> Health and Safety File</td>
                            <td><input type="checkbox" id="hs-file" name="documentTypes" value="hs-file" ${formData.documentTypes.includes('hs-file') ? 'checked' : ''}></td>
                        </tr>
                    </tbody>
                </table>
                <p id="document-types-error" class="error hidden">Please select at least one document to compile.</p>
            </div>
            <div class="nav-buttons">
                <button id="back-btn" disabled>Back</button>
                <button id="next-btn">Next</button>
            </div>
        `,

        // Step 2: Client Details
        () => `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 22%;"></div>
            </div>
            <h3>Step 2 of 9: Client Details</h3>
            <div class="form-group">
                <label for="client-name">Client Company Name:</label>
                <input type="text" id="client-name" name="clientName" value="${formData.client.clientName || ''}" required aria-label="Client Company Name" aria-describedby="client-name-error">
                <p id="client-name-error" class="error hidden">Please enter a client company name.</p>
            </div>
            <div class="form-group">
                <label for="client-address">Client Address:</label>
                <input type="text" id="client-address" name="clientAddress" value="${formData.client.clientAddress || ''}" required aria-label="Client Address" aria-describedby="client-address-error">
                <p id="client-address-error" class="error hidden">Please enter a client address.</p>
            </div>
            <div class="form-group">
                <label for="client-contact-person">Client Contact Person:</label>
                <input type="text" id="client-contact-person" name="clientContactPerson" value="${formData.client.clientContactPerson || ''}" required aria-label="Client Contact Person" aria-describedby="client-contact-person-error">
                <p id="client-contact-person-error" class="error hidden">Please enter a client contact person.</p>
            </div>
            <div class="form-group">
                <label for="client-contact-role">Client Contact Role:</label>
                <input type="text" id="client-contact-role" name="clientContactRole" value="${formData.client.clientContactRole || ''}" required aria-label="Client Contact Role" aria-describedby="client-contact-role-error">
                <p id="client-contact-role-error" class="error hidden">Please enter a client contact role.</p>
            </div>
            <div class="form-group">
                <label for="client-contact-number">Client Contact Number:</label>
                <input type="tel" id="client-contact-number" name="clientContactNumber" value="${formData.client.clientContactNumber || ''}" required pattern="\+?[0-9\s\-()]{10,}" aria-label="Client Contact Number" aria-describedby="client-contact-number-error">
                <p id="client-contact-number-error" class="error hidden">Please enter a valid phone number (e.g., +27123456789).</p>
            </div>
            <div class="form-group">
                <label for="client-email">Client Email:</label>
                <input type="email" id="client-email" name="clientEmail" value="${formData.client.clientEmail || ''}" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" aria-label="Client Email" aria-describedby="client-email-error">
                <p id="client-email-error" class="error hidden">Please enter a valid email address.</p>
            </div>
            <div class="form-group">
                <label for="client-coida">COIDA Registration Number:</label>
                <input type="text" id="client-coida" name="clientCoida" value="${formData.client.clientCoida || ''}" required aria-label="COIDA Registration Number" aria-describedby="client-coida-error">
                <p id="client-coida-error" class="error hidden">Please enter a COIDA registration number.</p>
            </div>
            <div class="nav-buttons">
                <button id="back-btn">Back</button>
                <button id="next-btn">Next</button>
            </div>
        `,

        // Step 3: Contractor Appointed
        () => `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 33%;"></div>
            </div>
            <h3>Step 3 of 9: Has a Contractor Been Appointed?</h3>
            <div class="form-group">
                <label for="contractor-appointed">Contractor Appointed:</label>
                <select id="contractor-appointed" name="contractorAppointed" required aria-label="Contractor Appointed" aria-describedby="contractor-appointed-error">
                    <option value="yes" ${formData.contractorAppointed === "yes" ? "selected" : ""}>Yes</option>
                    <option value="no" ${formData.contractorAppointed === "no" ? "selected" : ""}>No</option>
                    <option value="not-applicable" ${formData.contractorAppointed === "not-applicable" ? "selected" : ""}>Not Applicable</option>
                </select>
                <p id="contractor-appointed-error" class="error hidden">Please select an option.</p>
            </div>
            <div class="nav-buttons">
                <button id="back-btn">Back</button>
                <button id="next-btn">Next</button>
            </div>
        `,

        // Step 4: Contractor Details
        () => `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 44%;"></div>
            </div>
            <h3>Step 4 of 9: Contractor Details</h3>
            <div class="form-group">
                <label for="contractor-name">Contractor Company Name:</label>
                <input type="text" id="contractor-name" name="contractorName" value="${formData.contractor.contractorName || ''}" required aria-label="Contractor Company Name" aria-describedby="contractor-name-error">
                <p id="contractor-name-error" class="error hidden">Please enter a contractor company name.</p>
            </div>
            <div class="form-group">
                <label for="contractor-address">Contractor Address:</label>
                <input type="text" id="contractor-address" name="contractorAddress" value="${formData.contractor.contractorAddress || ''}" required aria-label="Contractor Address" aria-describedby="contractor-address-error">
                <p id="contractor-address-error" class="error hidden">Please enter a contractor address.</p>
            </div>
            <div class="form-group">
                <label for="contractor-contact-person">Contractor Contact Person:</label>
                <input type="text" id="contractor-contact-person" name="contractorContactPerson" value="${formData.contractor.contractorContactPerson || ''}" required aria-label="Contractor Contact Person" aria-describedby="contractor-contact-person-error">
                <p id="contractor-contact-person-error" class="error hidden">Please enter a contractor contact person.</p>
            </div>
            <div class="form-group">
                <label for="contractor-contact-role">Contractor Contact Role:</label>
                <input type="text" id="contractor-contact-role" name="contractorContactRole" value="${formData.contractor.contractorContactRole || ''}" required aria-label="Contractor Contact Role" aria-describedby="contractor-contact-role-error">
                <p id="contractor-contact-role-error" class="error hidden">Please enter a contractor contact role.</p>
            </div>
            <div class="form-group">
                <label for="contractor-contact-number">Contractor Contact Number:</label>
                <input type="tel" id="contractor-contact-number" name="contractorContactNumber" value="${formData.contractor.contractorContactNumber || ''}" required pattern="\+?[0-9\s\-()]{10,}" aria-label="Contractor Contact Number" aria-describedby="contractor-contact-number-error">
                <p id="contractor-contact-number-error" class="error hidden">Please enter a valid phone number (e.g., +27123456789).</p>
            </div>
            <div class="form-group">
                <label for="contractor-email">Contractor Email:</label>
                <input type="email" id="contractor-email" name="contractorEmail" value="${formData.contractor.contractorEmail || ''}" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" aria-label="Contractor Email" aria-describedby="contractor-email-error">
                <p id="contractor-email-error" class="error hidden">Please enter a valid email address.</p>
            </div>
            <div class="form-group">
                <label for="contractor-coida">COIDA Registration Number:</label>
                <input type="text" id="contractor-coida" name="contractorCoida" value="${formData.contractor.contractorCoida || ''}" required aria-label="COIDA Registration Number" aria-describedby="contractor-coida-error">
                <p id="contractor-coida-error" class="error hidden">Please enter a COIDA registration number.</p>
            </div>
            <div class="nav-buttons">
                <button id="back-btn">Back</button>
                <button id="next-btn">Next</button>
            </div>
        `,

        // Step 5: Project Details
        () => {
            // Generate project reference number in the format: client/projectname/16date/09month/82year/
            const now = new Date();
            const date = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);
            const clientName = (formData.client.clientName || '').replace(/[^a-zA-Z0-9]/g, '');
            const projectName = (formData.project.projectName || '').replace(/[^a-zA-Z0-9]/g, '');
            formData.project.referenceNumber = `${clientName}/${projectName}/${date}date/${month}month/${year}year/`;

            return `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 55%;"></div>
                </div>
                <h3>Step 5 of 9: Project Details</h3>
                <div class="form-group">
                    <label for="project-reference">Project Reference Number:</label>
                    <input type="text" id="project-reference" name="projectReference" value="${formData.project.referenceNumber}" readonly aria-label="Project Reference Number">
                </div>
                <div class="form-group">
                    <label for="project-name">Project Name:</label>
                    <input type="text" id="project-name" name="projectName" value="${formData.project.projectName || ''}" required aria-label="Project Name" aria-describedby="project-name-error">
                    <p id="project-name-error" class="error hidden">Please enter a project name.</p>
                </div>
                <div class="form-group">
                    <label for="site-address">Site Address:</label>
                    <input type="text" id="site-address" name="siteAddress" value="${formData.project.siteAddress || ''}" required aria-label="Site Address" aria-describedby="site-address-error">
                    <p id="site-address-error" class="error hidden">Please enter a site address.</p>
                </div>
                <div class="form-group">
                    <label for="site-supervisor-name">Site Supervisor Name:</label>
                    <input type="text" id="site-supervisor-name" name="siteSupervisorName" value="${formData.project.siteSupervisorName || ''}" required aria-label="Site Supervisor Name" aria-describedby="site-supervisor-name-error">
                    <p id="site-supervisor-name-error" class="error hidden">Please enter a site supervisor name.</p>
                </div>
                <div class="form-group">
                    <label for="site-supervisor-number">Site Supervisor Contact Number:</label>
                    <input type="tel" id="site-supervisor-number" name="siteSupervisorNumber" value="${formData.project.siteSupervisorNumber || ''}" required pattern="\+?[0-9\s\-()]{10,}" aria-label="Site Supervisor Contact Number" aria-describedby="site-supervisor-number-error">
                    <p id="site-supervisor-number-error" class="error hidden">Please enter a valid phone number (e.g., +27123456789).</p>
                </div>
                <div class="form-group">
                    <label for="site-supervisor-email">Site Supervisor Email:</label>
                    <input type="email" id="site-supervisor-email" name="siteSupervisorEmail" value="${formData.project.siteSupervisorEmail || ''}" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" aria-label="Site Supervisor Email" aria-describedby="site-supervisor-email-error">
                    <p id="site-supervisor-email-error" class="error hidden">Please enter a valid email address.</p>
                </div>
                <div class="nav-buttons">
                    <button id="back-btn">Back</button>
                    <button id="next-btn">Next</button>
                </div>
            `;
        },

        // Step 6: Scope of the Project
        () => `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 66%;"></div>
            </div>
            <h3>Step 6 of 9: Scope of the Project</h3>
            <div class="form-group">
                <label for="type-of-work">Type of Work to be Done:</label>
                <input type="text" id="type-of-work" name="typeOfWork" value="${formData.scope.typeOfWork || ''}" required aria-label="Type of Work" aria-describedby="type-of-work-error">
                <p id="type-of-work-error" class="error hidden">Please enter the type of work.</p>
            </div>
            <div class="form-group">
                <label for="cidb-grade">CIDB Grading:</label>
                <select id="cidb-grade" name="cidbGrade" required aria-label="CIDB Grading" aria-describedby="cidb-grade-error">
                    <option value="Not Applicable" ${formData.scope.cidbGrade === "Not Applicable" ? "selected" : ""}>Not Applicable</option>
                    <option value="1" ${formData.scope.cidbGrade === "1" ? "selected" : ""}>Grade 1</option>
                    <option value="2" ${formData.scope.cidbGrade === "2" ? "selected" : ""}>Grade 2</option>
                    <option value="3" ${formData.scope.cidbGrade === "3" ? "selected" : ""}>Grade 3</option>
                    <option value="4" ${formData.scope.cidbGrade === "4" ? "selected" : ""}>Grade 4</option>
                    <option value="5" ${formData.scope.cidbGrade === "5" ? "selected" : ""}>Grade 5</option>
                    <option value="6" ${formData.scope.cidbGrade === "6" ? "selected" : ""}>Grade 6</option>
                    <option value="7" ${formData.scope.cidbGrade === "7" ? "selected" : ""}>Grade 7</option>
                    <option value="8" ${formData.scope.cidbGrade === "8" ? "selected" : ""}>Grade 8</option>
                    <option value="9" ${formData.scope.cidbGrade === "9" ? "selected" : ""}>Grade 9</option>
                </select>
                <p id="cidb-grade-error" class="error hidden">Please select a CIDB grading.</p>
            </div>
            <div class="form-group">
                <label for="cost">Cost (R):</label>
                <input type="number" id="cost" name="cost" value="${formData.scope.cost || ''}" min="0" step="1" required aria-label="Project Cost" aria-describedby="cost-error">
                <p id="cost-error" class="error hidden">Please enter a valid project cost (R).</p>
            </div>
            <div class="form-group">
                <label for="duration">Duration (Days):</label>
                <input type="number" id="duration" name="duration" value="${formData.scope.duration || ''}" min="1" step="1" required aria-label="Project Duration" aria-describedby="duration-error">
                <p id="duration-error" class="error hidden">Please enter a valid duration (days).</p>
            </div>
            <div class="form-group">
                <label>Activities Involved (Select all that apply):</label>
                <div class="activities-categories">
                    <details>
                        <summary>Security Guards</summary>
                        <div class="category-content">
                            <div class="checkbox-item">
                                <input type="checkbox" id="night-work" name="activities" value="Night Work" ${formData.scope.activities && formData.scope.activities.includes('Night Work') ? 'checked' : ''}>
                                <label for="night-work">Night Work</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="moving-traffic" name="activities" value="Working in Moving Traffic" ${formData.scope.activities && formData.scope.activities.includes('Working in Moving Traffic') ? 'checked' : ''}>
                                <label for="moving-traffic">Working in Moving Traffic</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="vibration-exposure" name="activities" value="Vibration Exposure" ${formData.scope.activities && formData.scope.activities.includes('Vibration Exposure') ? 'checked' : ''}>
                                <label for="vibration-exposure">Vibration Exposure</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="noise-exposure" name="activities" value="Noise Exposure" ${formData.scope.activities && formData.scope.activities.includes('Noise Exposure') ? 'checked' : ''}>
                                <label for="noise-exposure">Noise Exposure</label>
                            </div>
                        </div>
                    </details>
                    <details>
                        <summary>Welders</summary>
                        <div class="category-content">
                            <div class="checkbox-item">
                                <input type="checkbox" id="welding" name="activities" value="Welding" ${formData.scope.activities && formData.scope.activities.includes('Welding') ? 'checked' : ''}>
                                <label for="welding">Welding</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="hot-work" name="activities" value="Hot Work (e.g., Cutting, Grinding)" ${formData.scope.activities && formData.scope.activities.includes('Hot Work (e.g., Cutting, Grinding)') ? 'checked' : ''}>
                                <label for="hot-work">Hot Work (e.g., Cutting, Grinding)</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="combustible-materials" name="activities" value="Combustible Materials" ${formData.scope.activities && formData.scope.activities.includes('Combustible Materials') ? 'checked' : ''}>
                                <label for="combustible-materials">Combustible Materials</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="hazardous-substances" name="activities" value="Handling Hazardous Substances" ${formData.scope.activities && formData.scope.activities.includes('Handling Hazardous Substances') ? 'checked' : ''}>
                                <label for="hazardous-substances">Handling Hazardous Substances</label>
                            </div>
                        </div>
                    </details>
                    <details>
                        <summary>Office Fit-Out</summary>
                        <div class="category-content">
                            <div class="checkbox-item">
                                <input type="checkbox" id="sensitive-it-equipment" name="activities" value="Sensitive IT Equipment" ${formData.scope.activities && formData.scope.activities.includes('Sensitive IT Equipment') ? 'checked' : ''}>
                                <label for="sensitive-it-equipment">Sensitive IT Equipment</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="manual-handling" name="activities" value="Manual Handling" ${formData.scope.activities && formData.scope.activities.includes('Manual Handling') ? 'checked' : ''}>
                                <label for="manual-handling">Manual Handling</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="working-electricity" name="activities" value="Working with Electricity" ${formData.scope.activities && formData.scope.activities.includes('Working with Electricity') ? 'checked' : ''}>
                                <label for="working-electricity">Working with Electricity</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="dust-exposure" name="activities" value="Dust Exposure" ${formData.scope.activities && formData.scope.activities.includes('Dust Exposure') ? 'checked' : ''}>
                                <label for="dust-exposure">Dust Exposure</label>
                            </div>
                        </div>
                    </details>
                    <details>
                        <summary>Civil Contractors</summary>
                        <div class="category-content">
                            <div class="checkbox-item">
                                <input type="checkbox" id="excavation" name="activities" value="Excavation" ${formData.scope.activities && formData.scope.activities.includes('Excavation') ? 'checked' : ''}>
                                <label for="excavation">Excavation</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="crane-operations" name="activities" value="Crane Operations" ${formData.scope.activities && formData.scope.activities.includes('Crane Operations') ? 'checked' : ''}>
                                <label for="crane-operations">Crane Operations</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="working-near-water" name="activities" value="Working Near Water" ${formData.scope.activities && formData.scope.activities.includes('Working Near Water') ? 'checked' : ''}>
                                <label for="working-near-water">Working Near Water</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="pile-driving" name="activities" value="Pile Driving" ${formData.scope.activities && formData.scope.activities.includes('Pile Driving') ? 'checked' : ''}>
                                <label for="pile-driving">Pile Driving</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="working-tunnels" name="activities" value="Working in Tunnels" ${formData.scope.activities && formData.scope.activities.includes('Working in Tunnels') ? 'checked' : ''}>
                                <label for="working-tunnels">Working in Tunnels</label>
                            </div>
                        </div>
                    </details>
                    <details>
                        <summary>General Construction</summary>
                        <div class="category-content">
                            <div class="checkbox-item">
                                <input type="checkbox" id="working-from-heights" name="activities" value="Working from Heights" ${formData.scope.activities && formData.scope.activities.includes('Working from Heights') ? 'checked' : ''}>
                                <label for="working-from-heights">Working from Heights</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="scaffolding" name="activities" value="Scaffolding" ${formData.scope.activities && formData.scope.activities.includes('Scaffolding') ? 'checked' : ''}>
                                <label for="scaffolding">Scaffolding</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="multi-storey" name="activities" value="Multi-Storey Construction" ${formData.scope.activities && formData.scope.activities.includes('Multi-Storey Construction') ? 'checked' : ''}>
                                <label for="multi-storey">Multi-Storey Construction</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="asbestos" name="activities" value="Asbestos Removal" ${formData.scope.activities && formData.scope.activities.includes('Asbestos Removal') ? 'checked' : ''}>
                                <label for="asbestos">Asbestos Removal</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="confined-space" name="activities" value="Confined Space Entry" ${formData.scope.activities && formData.scope.activities.includes('Confined Space Entry') ? 'checked' : ''}>
                                <label for="confined-space">Confined Space Entry</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="demolition" name="activities" value="Demolition" ${formData.scope.activities && formData.scope.activities.includes('Demolition') ? 'checked' : ''}>
                                <label for="demolition">Demolition</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="roof-work" name="activities" value="Roof Work" ${formData.scope.activities && formData.scope.activities.includes('Roof Work') ? 'checked' : ''}>
                                <label for="roof-work">Roof Work</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="temporary-works" name="activities" value="Temporary Works" ${formData.scope.activities && formData.scope.activities.includes('Temporary Works') ? 'checked' : ''}>
                                <label for="temporary-works">Temporary Works</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="live-voltage" name="activities" value="Working with Live Voltage" ${formData.scope.activities && formData.scope.activities.includes('Working with Live Voltage') ? 'checked' : ''}>
                                <label for="live-voltage">Working with Live Voltage</label>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
            <div class="form-group">
                <label for="scope-details">Scope Details:</label>
                <textarea id="scope-details" name="scopeDetails" rows="4" required aria-label="Scope Details" aria-describedby="scope-details-error">${formData.scope.scopeDetails || ''}</textarea>
                <p id="scope-details-error" class="error hidden">Please enter scope details.</p>
            </div>
            <div class="nav-buttons">
                <button id="back-btn">Back</button>
                <button id="next-btn">Next</button>
            </div>
        `,

        // Step 7: Compiled By
        () => `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 77%;"></div>
            </div>
            <h3>Step 7 of 9: Compiled By</h3>
            <div class="form-group">
                <label for="compiled-by-name">Name:</label>
                <input type="text" id="compiled-by-name" name="compiledByName" value="${formData.compiledBy.name || ''}" required aria-label="Compiled By Name" aria-describedby="compiled-by-name-error">
                <p id="compiled-by-name-error" class="error hidden">Please enter your name.</p>
            </div>
            <div class="form-group">
                <label for="compiled-by-number">Contact Number:</label>
                <input type="tel" id="compiled-by-number" name="compiledByNumber" value="${formData.compiledBy.number || ''}" required pattern="\+?[0-9\s\-()]{10,}" aria-label="Compiled By Contact Number" aria-describedby="compiled-by-number-error">
                <p id="compiled-by-number-error" class="error hidden">Please enter a valid phone number (e.g., +27123456789).</p>
            </div>
            <div class="form-group">
                <label for="compiled-by-email">Email:</label>
                <input type="email" id="compiled-by-email" name="compiledByEmail" value="${formData.compiledBy.email || ''}" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" aria-label="Compiled By Email" aria-describedby="compiled-by-email-error">
                <p id="compiled-by-email-error" class="error hidden">Please enter a valid email address.</p>
            </div>
            <div class="form-group">
                <label for="compiled-by-role">Role:</label>
                <select id="compiled-by-role" name="compiledByRole" required aria-label="Compiled By Role" aria-describedby="compiled-by-role-error">
                    <option value="trainee" ${formData.compiledBy.role === "trainee" ? "selected" : ""}>OHS Trainee</option>
                    <option value="ohs-rep" ${formData.compiledBy.role === "ohs-rep" ? "selected" : ""}>OHS Representative</option>
                    <option value="sacpcmp-officer" ${formData.compiledBy.role === "sacpcmp-officer" ? "selected" : ""}>SACPCMP Officer (CHSO)</option>
                    <option value="sacpcmp-agent" ${formData.compiledBy.role === "sacpcmp-agent" ? "selected" : ""}>SACPCMP Agent (PrCHSA)</option>
                    <option value="other" ${formData.compiledBy.role && formData.compiledBy.role !== "trainee" && formData.compiledBy.role !== "ohs-rep" && formData.compiledBy.role !== "sacpcmp-officer" && formData.compiledBy.role !== "sacpcmp-agent" ? "selected" : ""}>Other</option>
                </select>
                <p id="compiled-by-role-error" class="error hidden">Please select a role.</p>
            </div>
            <div class="form-group" id="sacpcmp-reg-container">
                <label for="sacpcmp-reg">SACPCMP Registration Number:</label>
                <input type="text" id="sacpcmp-reg" name="sacpcmpReg" value="${formData.compiledBy.sacpcmpReg || 'N/A'}" aria-label="SACPCMP Registration Number" aria-describedby="sacpcmp-reg-error">
                <p id="sacpcmp-reg-error" class="error hidden">Please enter a SACPCMP registration number.</p>
            </div>
            <div class="form-group" id="compiled-by-role-other-container">
                <label for="compiled-by-role-other">Specify Role:</label>
                <input type="text" id="compiled-by-role-other" name="compiledByRoleOther" value="${formData.compiledBy.specifiedRole || 'N/A'}" aria-label="Specify Role" aria-describedby="compiled-by-role-other-error">
                <p id="compiled-by-role-other-error" class="error hidden">Please specify your role.</p>
            </div>
            <div class="nav-buttons">
                <button id="back-btn">Back</button>
                <button id="next-btn">Next</button>
            </div>
        `,

        // Step 8: Compiled For
        () => `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 88%;"></div>
            </div>
            <h3>Step 8 of 9: Compiled For</h3>
            <div class="form-group">
                <label for="compiled-for">Compiled For:</label>
                <select id="compiled-for" name="compiledFor" required aria-label="Compiled For" aria-describedby="compiled-for-error">
                    <option value="client" ${formData.compiledFor.role === "client" ? "selected" : ""}>Client</option>
                    <option value="contractor" ${formData.compiledFor.role === "contractor" ? "selected" : ""}>Contractor</option>
                    <option value="other" ${formData.compiledFor.role && formData.compiledBy.role !== "client" && formData.compiledBy.role !== "contractor" ? "selected" : ""}>Other</option>
                </select>
                <p id="compiled-for-error" class="error hidden">Please select an option.</p>
            </div>
            <div class="form-group" id="compiled-for-other-container">
                <label for="compiled-for-other">Specify:</label>
                <input type="text" id="compiled-for-other" name="compiledForOther" value="${formData.compiledFor.specify || 'N/A'}" aria-label="Specify Compiled For" aria-describedby="compiled-for-other-error">
                <p id="compiled-for-other-error" class="error hidden">Please specify who the document is compiled for.</p>
            </div>
            <div class="nav-buttons">
                <button id="back-btn">Back</button>
                <button id="next-btn">Next</button>
            </div>
        `,

        // Step 9: Review and Add to Cart
        () => `
            <div class="progress-bar">
                <div class="progress-fill" style="width: 100%;"></div>
            </div>
            <h3>Step 9 of 9: Review and Add to Cart</h3>
            <p>Review your selections and add the documents to your cart for checkout.</p>
            <div class="form-group">
                <label>Selected Documents:</label>
                <ul id="selected-documents">
                    ${formData.documentTypes.map(type => `
                        <li>${
                            {
                                'hs-spec': 'Health and Safety Specification',
                                'hs-plan': 'Health and Safety Plan',
                                'risk-assessment': 'Risk Assessment',
                                'training': 'Conduct Training',
                                'appointments': 'Legal Appointments',
                                'inspections': 'Inspections/Audits',
                                'incidents': 'Incident Management',
                                'reports': 'Compliance Reports',
                                'hs-file': 'Health and Safety File'
                            }[type]
                        }</li>
                    `).join('')}
                </ul>
            </div>
            <div class="nav-buttons">
                <button id="back-btn">Back</button>
                <button id="next-btn">Add to Cart</button>
            </div>
        `
    ];

    // Function to Start the Wizard with a Pre-Selected Document
    window.startWizard = (documentType) => {
        // Reset form data to start fresh
        formData = {
            documentTypes: [documentType], // Pre-select the document
            client: {},
            contractorAppointed: '',
            contractor: {},
            project: {},
            scope: {},
            compiledBy: {},
            compiledFor: {},
            additionalSignatories: []
        };
        renderStep(1); // Start the wizard at Step 1
    };

    // Render Step
    const renderStep = (stepNumber) => {
        currentStep = stepNumber;
        wizardContainer.innerHTML = steps[stepNumber]();
        wizardSidebar.innerHTML = sidebarContent[stepNumber];

        // Attach event listeners for the current step
        const backBtn = document.getElementById('back-btn');
        const nextBtn = document.getElementById('next-btn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (currentStep === 1) {
                    renderStep(0); // Return to hidden state
                    cart = []; // Clear the cart when going back to start
                    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
                    updateCartDisplay();
                } else if (currentStep === 5 && formData.contractorAppointed !== "yes") {
                    renderStep(currentStep - 2); // Skip Step 4
                } else {
                    renderStep(currentStep - 1);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentStep === 1) {
                    // Step 1: Document Selection
                    const documentTypes = Array.from(document.querySelectorAll('input[name="documentTypes"]:checked'))
                        .map(input => input.value);
                    const error = document.getElementById('document-types-error');
                    if (documentTypes.length === 0) {
                        error.classList.remove('hidden');
                        return;
                    }
                    error.classList.add('hidden');
                    formData.documentTypes = documentTypes;

                    // Clear cart and add selected documents
                    cart = [];
                    documentTypes.forEach(type => {
                        if (type === "hs-spec") {
                            addToCart("Health and Safety Specification", 50.00, "hs-spec", formData);
                        } else if (type === "hs-plan") {
                            addToCart("Health and Safety Plan", 50.00, "hs-plan", formData);
                        } else if (type === "hs-file") {
                            addToCart("Health and Safety File", 100.00, "hs-file", formData);
                        } else if (type === "risk-assessment") {
                            addToCart("Risk Assessment", 0.00, "risk-assessment", formData);
                        } else if (type === "training") {
                            addToCart("Conduct Training", 0.00, "training", formData);
                        } else if (type === "appointments") {
                            addToCart("Legal Appointments", 0.00, "appointments", formData);
                        } else if (type === "inspections") {
                            addToCart("Inspections/Audits", 0.00, "inspections", formData);
                        } else if (type === "incidents") {
                            addToCart("Incident Management", 0.00, "incidents", formData);
                        } else if (type === "reports") {
                            addToCart("Compliance Reports", 0.00, "reports", formData);
                        }
                    });

                    renderStep(currentStep + 1);
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

                    renderStep(currentStep + 1);
                } else if (currentStep === 3) {
                    // Step 3: Contractor Appointed
                    const contractorAppointed = document.getElementById('contractor-appointed').value;
                    formData.contractorAppointed = contractorAppointed;

                    if (contractorAppointed === "yes") {
                        renderStep(currentStep + 1);
                    } else {
                        renderStep(currentStep + 2); // Skip Step 4
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

                    renderStep(currentStep + 1);
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
                    const now = new Date();
                    const date = String(now.getDate()).padStart(2, '0');
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const year = String(now.getFullYear()).slice(-2);
                    const clientName = (formData.client.clientName || '').replace(/[^a-zA-Z0-9]/g, '');
                    formData.project.referenceNumber = `${clientName}/${projectName.replace(/[^a-zA-Z0-9]/g, '')}/${date}date/${month}month/${year}year/`;
                    saveWithExpiry(PROJECT_STORAGE_KEY, formData.project);

                    renderStep(currentStep + 1);
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

                    renderStep(currentStep + 1);
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
                        { id: 'sacpcmp-reg', value: sacpcmpReg, error: 'sacpcmp-reg-error', message: "Please enter a SACPCMP registration number.", condition: () => (compiledByRole === "sacpcmp-officer" || compiledByRole === "sacpcmp-agent") && sacpcmpReg === "N/A" },
                        { id: 'compiled-by-role-other', value: compiledByRoleOther, error: 'compiled-by-role-other-error', message: "Please specify your role.", condition: () => compiledByRole === "other" && compiledByRoleOther === "N/A" }
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
                        role: compiledByRole,
                        sacpcmpReg: (compiledByRole === "sacpcmp-officer" || compiledByRole === "sacpcmp-agent") ? sacpcmpReg : "N/A",
                        specifiedRole: compiledByRole === "other" ? compiledByRoleOther : "N/A"
                    };

                    renderStep(currentStep + 1);
                } else if (currentStep === 8) {
                    // Step 8: Compiled For
                    const compiledFor = document.getElementById('compiled-for').value;
                    const compiledForOther = document.getElementById('compiled-for-other').value;

                    const validations = [
                        { id: 'compiled-for', value: compiledFor, error: 'compiled-for-error', message: "Please select an option." },
                        { id: 'compiled-for-other', value: compiledForOther, error: 'compiled-for-other-error', message: "Please specify who the document is compiled for.", condition: () => compiledFor === "other" && compiledForOther === "N/A" }
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
                            email: formData.client.clientEmail,
                            specify: "N/A"
                        };
                    } else if (compiledFor === "contractor" && formData.contractorAppointed === "yes") {
                        compiledForData = {
                            name: formData.contractor.contractorName,
                            role: "Contractor",
                            number: formData.contractor.contractorContactNumber,
                            email: formData.contractor.contractorEmail,
                            specify: "N/A"
                        };
                    } else {
                        compiledForData = {
                            name: compiledForOther,
                            role: compiledForOther,
                            number: formData.compiledBy.number, // Fallback to compiled by
                            email: formData.compiledBy.email,
                            specify: compiledForOther
                        };
                    }

                    formData.compiledFor = compiledForData;

                    renderStep(currentStep + 1);
                } else if (currentStep === 9) {
                    // Step 9: Review and Add to Cart
                    // Documents are already in the cart from Step 1
                    // Proceed to checkout or redirect for non-PDF documents
                    formData.documentTypes.forEach(type => {
                        if (type === "risk-assessment") {
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

                    renderStep(0); // Return to hidden state
                }
            });
        }

        // Step 3: Contractor Appointed - Update form data on change
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
        const sacpcmpRegInput = document.getElementById('sacpcmp-reg');
        const compiledByRoleOtherInput = document.getElementById('compiled-by-role-other');
        if (compiledByRoleSelect && sacpcmpRegContainer && compiledByRoleOtherContainer && sacpcmpRegInput && compiledByRoleOtherInput) {
            const updateFields = () => {
                const role = compiledByRoleSelect.value;
                const requiresSacpcmp = role === "sacpcmp-officer" || role === "sacpcmp-agent";
                sacpcmpRegContainer.style.display = requiresSacpcmp ? 'block' : 'none';
                sacpcmpRegInput.required = requiresSacpcmp;
                sacpcmpRegInput.disabled = !requiresSacpcmp;
                if (!requiresSacpcmp) {
                    sacpcmpRegInput.value = "N/A";
                    formData.compiledBy.sacpcmpReg = "N/A";
                } else {
                    sacpcmpRegInput.value = formData.compiledBy.sacpcmpReg || '';
                }

                const isOtherRole = role === "other";
                compiledByRoleOtherContainer.style.display = isOtherRole ? 'block' : 'none';
                compiledByRoleOtherInput.required = isOtherRole;
                compiledByRoleOtherInput.disabled = !isOtherRole;
                if (!isOtherRole) {
                    compiledByRoleOtherInput.value = "N/A";
                    formData.compiledBy.specifiedRole = "N/A";
                } else {
                    compiledByRoleOtherInput.value = formData.compiledBy.specifiedRole || '';
                }
            };
            compiledByRoleSelect.addEventListener('change', updateFields);
            updateFields(); // Initial update based on formData
        }

        // Step 8: Compiled For - Show/Hide Other Field
        const compiledForSelect = document.getElementById('compiled-for');
        const compiledForOtherContainer = document.getElementById('compiled-for-other-container');
        const compiledForOtherInput = document.getElementById('compiled-for-other');
        if (compiledForSelect && compiledForOtherContainer && compiledForOtherInput) {
            const updateCompiledForFields = () => {
                const value = compiledForSelect.value;
                const isOther = value === "other";
                compiledForOtherContainer.style.display = 'block'; // Always show the field for consistency
                compiledForOtherInput.required = isOther;
                compiledForOtherInput.disabled = !isOther;
                if (!isOther) {
                    compiledForOtherInput.value = "N/A";
                    formData.compiledFor.specify = "N/A";
                } else {
                    compiledForOtherInput.value = formData.compiledFor.specify || '';
                }
            };
            compiledForSelect.addEventListener('change', updateCompiledForFields);
            updateCompiledForFields(); // Initial update based on formData
        }
    };

    // Initial Render (Hidden State)
    renderStep(0);

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
