/**
 * Construction Compliance JavaScript
 * Handles OHS Specification form, Compliance Checklist, role selection, and PDF generation.
 * Implements temporary data storage and cart functionality.
 */

// Mock common.js functions (replace with actual imports if common.js is available)
function showStep(stepId) {
    document.querySelectorAll('.step').forEach(step => step.classList.add('hidden'));
    document.getElementById(stepId).classList.remove('hidden');
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

// Sample Compliance Database
const complianceDatabase = [
    {
        group: "General Site Safety",
        requirements: [
            {
                requirement: "PPE Provision",
                description: "All workers have appropriate PPE (hard hats, safety boots, gloves, etc.)",
                legal: "OHSA Section 8, Construction Regulation 5",
                suggested: ["general"]
            },
            {
                requirement: "Site Induction",
                description: "All personnel trained on site-specific hazards and safety procedures",
                legal: "Construction Regulation 7",
                suggested: ["general"]
            }
        ]
    },
    {
        group: "Scaffolding Safety",
        requirements: [
            {
                requirement: "Scaffold Inspection",
                description: "Weekly inspections by a competent person",
                legal: "Construction Regulation 16, SANS 10085",
                suggested: ["scaffolding"]
            },
            {
                requirement: "Guardrails",
                description: "Guardrails installed at heights above 2 meters",
                legal: "Construction Regulation 16",
                suggested: ["scaffolding"]
            }
        ]
    },
    {
        group: "Electrical Safety",
        requirements: [
            {
                requirement: "Electrical Inspections",
                description: "Regular checks of electrical installations",
                legal: "Construction Regulation 24",
                suggested: ["electrical"]
            }
        ]
    },
    {
        group: "Excavation Safety",
        requirements: [
            {
                requirement: "Shoring Systems",
                description: "Proper shoring to prevent collapses",
                legal: "Construction Regulation 13",
                suggested: ["excavation"]
            }
        ]
    }
];

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

const addToCart = (documentName, price) => {
    cart.push({ documentName, price });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
};

const updateCartDisplay = () => {
    const cartItems = document.getElementById('cart-items');
    const cartContainer = document.getElementById('cart-container');
    if (!cartItems || !cartContainer) return;
    
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

    // Initialize Carousel
    const items = document.querySelectorAll(".carousel-item");
    if (items.length > 0) {
        let currentIndex = 0;
        items[currentIndex].classList.add("active");
        const nextBtn = document.querySelector(".carousel-next");
        const prevBtn = document.querySelector(".carousel-prev");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                items[currentIndex].classList.remove("active");
                currentIndex = (currentIndex + 1) % items.length;
                items[currentIndex].classList.add("active");
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                items[currentIndex].classList.remove("active");
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                items[currentIndex].classList.add("active");
            });
        }
        // Auto-rotate every 5 seconds
        setInterval(() => {
            items[currentIndex].classList.remove("active");
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].classList.add("active");
        }, 5000);
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
    }

    // Role Selection
    const clientBtn = document.getElementById("client-btn");
    const contractorBtn = document.getElementById("contractor-btn");
    const hnsProBtn = document.getElementById("hns-pro-btn");
    const projectFormContainer = document.getElementById("project-form-container");
    const complianceForm = document.getElementById("compliance-form");

    if (clientBtn) {
        clientBtn.addEventListener("click", () => {
            document.getElementById("client-legal-note").classList.remove("hidden");
            document.getElementById("contractor-legal-note").classList.add("hidden");
            document.getElementById("hns-pro-legal-note").classList.add("hidden");
            projectFormContainer.classList.remove("hidden");
            complianceForm.classList.add("hidden");
        });
    }

    if (contractorBtn) {
        contractorBtn.addEventListener("click", () => {
            document.getElementById("client-legal-note").classList.add("hidden");
            document.getElementById("contractor-legal-note").classList.remove("hidden");
            document.getElementById("hns-pro-legal-note").classList.add("hidden");
            projectFormContainer.classList.add("hidden");
            complianceForm.classList.remove("hidden");
            showStep("step-1");
        });
    }

    if (hnsProBtn) {
        hnsProBtn.addEventListener("click", () => {
            document.getElementById("client-legal-note").classList.add("hidden");
            document.getElementById("contractor-legal-note").classList.add("hidden");
            document.getElementById("hns-pro-legal-note").classList.remove("hidden");
            projectFormContainer.classList.remove("hidden");
            complianceForm.classList.add("hidden");
        });
    }

    // OHS Specification Form
    const projectForm = document.getElementById("project-form");
    if (projectForm) {
        projectForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(projectForm);
            const data = Object.fromEntries(formData);
            
            // Validation
            if (!data.projectName || !data.clientName || !data.contractorName || !data.siteAddress) {
                alert("Please fill in all required fields.");
                return;
            }
            if (!data.emergencyContact.match(/^\+?[0-9\s\-()]{10,}$/)) {
                alert("Please enter a valid phone number for emergency contact (e.g., +27123456789).");
                return;
            }
            if ((data.accreditationLevel === "sacpcmp-officer" || data.accreditationLevel === "sacpcmp-agent") && !data.sacpcmpReg) {
                alert("SACPCMP Registration Number is required for Officer or Agent roles.");
                return;
            }

            // Generate PDF
            generateOHSSpecPDF(data);

            // Save Data
            const referenceNumber = saveTempData(data);
            alert(`OHS Specification generated! Reference Number: ${referenceNumber} (valid for 7 days)`);
            addToCart("OHS Specification", 50.00); // Example price
        });

        // SACPCMP Registration Field Visibility
        const accreditationLevel = document.getElementById("accreditation-level");
        const sacpcmpRegContainer = document.getElementById("sacpcmp-reg-container");
        if (accreditationLevel && sacpcmpRegContainer) {
            accreditationLevel.addEventListener("change", () => {
                const showReg = accreditationLevel.value === "sacpcmp-officer" || accreditationLevel.value === "sacpcmp-agent";
                sacpcmpRegContainer.classList.toggle("hidden", !showReg);
            });
        }
    }

    // Compliance Checklist Form
    let selectedRequirements = [];
    let checklistData = {};

    // Step 1: Select Checklist Type
    const checklistTypeForm = document.getElementById("checklist-type-form");
    if (checklistTypeForm) {
        checklistTypeForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const checklistType = document.getElementById("checklist-type").value;
            if (!checklistType) {
                alert("Please select a checklist type.");
                return;
            }
            checklistData.checklistType = checklistType;
            populateRequirements(checklistType);
            showStep("step-2");
        });
    }

    // Step 2: Select Requirements
    function populateRequirements(checklistType) {
        const requirementGroups = document.getElementById("requirement-groups");
        if (!requirementGroups) return;
        requirementGroups.innerHTML = '';

        complianceDatabase.forEach(group => {
            const groupDiv = document.createElement("div");
            groupDiv.className = "requirement-group";
            groupDiv.innerHTML = `<h4>${group.group}</h4>`;
            const ul = document.createElement("ul");
            group.requirements.forEach(req => {
                if (req.suggested.includes(checklistType)) {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <input type="checkbox" name="requirements" value="${req.requirement}" data-description="${req.description}" data-legal="${req.legal}">
                        ${req.requirement} <span class="suggested-label">(Suggested)</span>
                    `;
                    ul.appendChild(li);
                }
            });
            groupDiv.appendChild(ul);
            requirementGroups.appendChild(groupDiv);
        });

        // Search Requirements
        const requirementSearch = document.getElementById("requirement-search");
        if (requirementSearch) {
            requirementSearch.addEventListener("input", () => {
                const searchTerm = requirementSearch.value.toLowerCase();
                document.querySelectorAll(".requirement-group li").forEach(li => {
                    const text = li.textContent.toLowerCase();
                    li.style.display = text.includes(searchTerm) ? "block" : "none";
                });
            });
        }
    }

    // Step 2: Submit Requirements
    const requirementsForm = document.getElementById("requirements-form");
    if (requirementsForm) {
        requirementsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            selectedRequirements = [];
            requirementsForm.querySelectorAll('input[name="requirements"]:checked').forEach(input => {
                selectedRequirements.push({
                    requirement: input.value,
                    description: input.dataset.description,
                    legal: input.dataset.legal,
                    status: "Not Started",
                    evidence: ""
                });
            });
            if (selectedRequirements.length === 0) {
                alert("Please select at least one requirement.");
                return;
            }
            populateStatusTable();
            showStep("step-3");
        });

        // Back Button
        requirementsForm.querySelector(".back-btn").addEventListener("click", () => {
            showStep("step-1");
        });
    }

    // Step 3: Assign Status
    function populateStatusTable() {
        const statusTableBody = document.getElementById("status-table-body");
        if (!statusTableBody) return;
        statusTableBody.innerHTML = '';

        selectedRequirements.forEach(req => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${req.requirement}</td>
                <td>${req.description}</td>
                <td>${req.legal}</td>
                <td>
                    <select name="status" data-requirement="${req.requirement}">
                        <option value="Not Started" ${req.status === "Not Started" ? "selected" : ""}>Not Started</option>
                        <option value="In Progress" ${req.status === "In Progress" ? "selected" : ""}>In Progress</option>
                        <option value="Completed" ${req.status === "Completed" ? "selected" : ""}>Completed</option>
                    </select>
                </td>
                <td>
                    <input type="text" name="evidence" value="${req.evidence}" data-requirement="${req.requirement}" placeholder="Enter evidence/notes">
                </td>
            `;
            statusTableBody.appendChild(row);
        });
    }

    const statusForm = document.getElementById("status-form");
    if (statusForm) {
        statusForm.addEventListener("submit", (e) => {
            e.preventDefault();
            selectedRequirements.forEach(req => {
                const statusSelect = statusForm.querySelector(`select[data-requirement="${req.requirement}"]`);
                const evidenceInput = statusForm.querySelector(`input[data-requirement="${req.requirement}"]`);
                req.status = statusSelect.value;
                req.evidence = evidenceInput.value;
            });
            populateReviewTable();
            showStep("step-4");
        });

        statusForm.querySelector(".back-btn").addEventListener("click", () => {
            showStep("step-2");
        });
    }

    // Step 4: Review and Details
    function populateReviewTable() {
        const reviewTableBody = document.getElementById("review-table-body");
        if (!reviewTableBody) return;
        reviewTableBody.innerHTML = '';

        selectedRequirements.forEach(req => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${req.requirement}</td>
                <td>${req.description}</td>
                <td>${req.legal}</td>
                <td>${req.status}</td>
                <td>${req.evidence}</td>
            `;
            reviewTableBody.appendChild(row);
        });
    }

    const reviewForm = document.getElementById("review-form");
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(reviewForm);
            checklistData.details = Object.fromEntries(formData);

            // Validation
            if (!checklistData.details.siteName || !checklistData.details.siteAddress || !checklistData.details.conductorName) {
                alert("Please fill in all required fields.");
                return;
            }

            // Generate PDF
            generateComplianceChecklistPDF(checklistData, selectedRequirements);

            // Save Data
            const referenceNumber = saveTempData({ checklistData, selectedRequirements });
            document.getElementById("ref-number").textContent = referenceNumber;
            showStep("step-5");
            addToCart("Compliance Checklist", 30.00); // Example price
        });

        reviewForm.querySelector(".back-btn").addEventListener("click", () => {
            showStep("step-3");
        });
    }

    // Step 5: Download & Next Steps
    const downloadAgainBtn = document.getElementById("download-again");
    if (downloadAgainBtn) {
        downloadAgainBtn.addEventListener("click", () => {
            generateComplianceChecklistPDF(checklistData, selectedRequirements);
        });
    }

    const startNewBtn = document.getElementById("start-new");
    if (startNewBtn) {
        startNewBtn.addEventListener("click", () => {
            checklistData = {};
            selectedRequirements = [];
            reviewForm.reset();
            showStep("step-1");
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
            alert("Checkout complete! Documents will be emailed to you (mock implementation).");
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        });
    }

    // Placeholder Functionality for Additional Buttons
    const actionButtons = [
        { id: "compile-bra-btn", action: () => window.location.href = "/safety-plans/pages/risk-assessment.html?type=baseline" },
        { id: "compile-hs-plan-btn", action: () => alert("Health & Safety Plan compilation coming soon!") },
        { id: "manage-hs-file-btn", action: () => alert("Health & Safety File management coming soon!") },
        { id: "conduct-hira-btn", action: () => window.location.href = "/safety-plans/pages/risk-assessment.html?type=hira" },
        { id: "manage-appointments-btn", action: () => alert("Appointment management coming soon!") },
        { id: "manage-incidents-btn", action: () => alert("Incident management coming soon!") }
    ];

    actionButtons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
            element.addEventListener("click", btn.action);
        }
    });

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
    }

    if (chatSend && chatInput && chatOutput) {
        chatSend.addEventListener("click", () => {
            const message = chatInput.value.trim();
            if (!message) return;
            chatOutput.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
            chatOutput.innerHTML += `<p><strong>Bot:</strong> This is a placeholder response. Ask about OHS compliance!</p>`;
            chatInput.value = "";
            chatOutput.scrollTop = chatOutput.scrollHeight;
        });
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

// Generate Compliance Checklist PDF
function generateComplianceChecklistPDF(checklistData, requirements) {
    if (!jsPDF) return;
    try {
        const doc = new jsPDF();
        addHeaderFooter(doc, "Compliance Checklist");

        doc.setFontSize(12);
        doc.text(`Checklist Type: ${checklistData.checklistType}`, 10, 30);
        doc.text(`Site Name: ${checklistData.details.siteName}`, 10, 40);
        doc.text(`Site Address: ${checklistData.details.siteAddress}`, 10, 50);
        doc.text(`Conducted By: ${checklistData.details.conductorName}`, 10, 60);
        doc.text(`Company: ${checklistData.details.companyName}`, 10, 70);

        const tableData = requirements.map(req => [
            req.requirement,
            req.description,
            req.legal,
            req.status,
            req.evidence
        ]);

        doc.autoTable({
            startY: 80,
            head: [['Requirement', 'Description', 'Legal Reference', 'Status', 'Evidence/Notes']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10 },
            columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 50 }, 2: { cellWidth: 30 }, 3: { cellWidth: 20 }, 4: { cellWidth: 50 } }
        });

        doc.save("Compliance_Checklist.pdf");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}
