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
    compiledFor: {}
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
                const email
