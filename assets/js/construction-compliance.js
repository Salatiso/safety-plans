// assets/js/construction-compliance.js

import { showStep, addHeaderFooter } from './common.js';

// Check for jsPDF
const jsPDF = window.jspdf?.jsPDF;
if (!jsPDF) {
    console.error("jsPDF not loaded. Please check script inclusion.");
}

// Sample Compliance Database (expand as needed)
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
                requirement: "Circuit Isolation",
                description: "Lockout/tagout procedures followed for electrical work",
                legal: "OHSA Electrical Installation Regulations, SANS 10142",
                suggested: ["electrical"]
            }
        ]
    },
    {
        group: "Excavation Safety",
        requirements: [
            {
                requirement: "Trench Shoring",
                description: "Shoring or benching for trenches deeper than 1.5 meters",
                legal: "Construction Regulation 13",
                suggested: ["excavation"]
            }
        ]
    }
];

// Debug: Confirm script loading and DOM elements on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("construction-compliance.js loaded");
    console.log("Project Form Container:", document.getElementById("project-form-container"));
    console.log("Compliance Form:", document.getElementById("compliance-form"));
    console.log("Role Buttons:", {
        clientBtn: document.getElementById("client-btn"),
        contractorBtn: document.getElementById("contractor-btn"),
        hnsProBtn: document.getElementById("hns-pro-btn")
    });
    console.log("Compliance Form Steps:", document.querySelectorAll("#compliance-form .step"));
});

// Role Selection
document.getElementById("client-btn")?.addEventListener("click", () => {
    console.log("Client selected, redirecting to Risk Assessment");
    window.location.href = "/safety-plans/pages/risk-assessment.html?type=baseline";
});

document.getElementById("contractor-btn")?.addEventListener("click", () => {
    console.log("Contractor selected, showing Compliance Checklist");
    const complianceForm = document.getElementById("compliance-form");
    const projectFormContainer = document.getElementById("project-form-container");
    if (complianceForm && projectFormContainer) {
        console.log("Toggling visibility: Showing compliance-form, hiding project-form-container");
        complianceForm.classList.remove("hidden");
        projectFormContainer.classList.add("hidden");
        showStep("step-1");
    } else {
        console.error("Compliance form or project form container not found");
    }
});

document.getElementById("hns-pro-btn")?.addEventListener("click", () => {
    console.log("OHS Professional selected, showing OHS Specification form");
    const projectFormContainer = document.getElementById("project-form-container");
    const complianceForm = document.getElementById("compliance-form");
    if (projectFormContainer && complianceForm) {
        console.log("Toggling visibility: Showing project-form-container, hiding compliance-form");
        projectFormContainer.classList.remove("hidden");
        complianceForm.classList.add("hidden");
        showSpecForm("Health & Safety Professional");
    } else {
        console.error("Project form container or compliance form not found");
    }
});

// OHS Specification Form Logic
function showSpecForm(role) {
    console.log(`showSpecForm called with role: ${role}`);
    const formContainer = document.getElementById("project-form-container");
    const form = document.getElementById("project-form");
    const dynamicFields = document.getElementById("dynamic-fields");
    if (!formContainer || !form || !dynamicFields) {
        console.error("Form container, form, or dynamic fields element missing.");
        return;
    }
    formContainer.classList.remove("hidden");
    dynamicFields.innerHTML = "";

    // Role-specific fields
    if (role === "Health & Safety Professional") {
        console.log("Adding SACPCMP field for Health & Safety Professional");
        dynamicFields.innerHTML += `
            <div class="form-group">
                <label for="sacpcmp-reg">SACPCMP Registration Number:</label>
                <input type="text" id="sacpcmp-reg" name="sacpcmpReg" aria-label="SACPCMP Registration">
            </div>
        `;
    }

    // Activity-based fields
    const activityCheckboxes = document.querySelectorAll('input[name="activities"]');
    console.log(`Found ${activityCheckboxes.length} activity checkboxes`);
    activityCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            console.log(`Activity checkbox changed: ${checkbox.value}, checked: ${checkbox.checked}`);
            // Clear activity-specific fields
            dynamicFields.innerHTML = dynamicFields.innerHTML.split('<div class="form-group"><label for="sacpcmp-reg">')[0];
            if (document.getElementById("scaffolding")?.checked) {
                console.log("Adding Scaffold Supervisor field");
                dynamicFields.innerHTML += `
                    <div class="form-group">
                        <label for="scaffold-supervisor">Scaffold Supervisor Name:</label>
                        <input type="text" id="scaffold-supervisor" name="scaffoldSupervisor" aria-label="Scaffold Supervisor">
                    </div>
                `;
            }
            if (document.getElementById("asbestos")?.checked) {
                console.log("Adding Asbestos Coordinator field");
                dynamicFields.innerHTML += `
                    <div class="form-group">
                        <label for="asbestos-coordinator">Asbestos Coordinator Name:</label>
                        <input type="text" id="asbestos-coordinator" name="asbestosCoordinator" aria-label="Asbestos Coordinator">
                    </div>
                `;
            }
        });
    });

    console.log(`${role} form displayed`);
}

// Save OHS Specification Form Progress
document.getElementById("project-form")?.addEventListener("input", () => {
    console.log("OHS Specification form input detected, saving to localStorage");
    const form = document.getElementById("project-form");
    if (form) {
        const formData = new FormData(form);
        localStorage.setItem("projectForm", JSON.stringify(Object.fromEntries(formData)));
        console.log("Form data saved:", Object.fromEntries(formData));
    } else {
        console.error("Project form not found for saving progress");
    }
});

// Load Saved OHS Specification Data
window.addEventListener("load", () => {
    console.log("Window loaded, checking for saved OHS Specification data");
    const saved = localStorage.getItem("projectForm");
    if (saved) {
        const data = JSON.parse(saved);
        console.log("Loading saved form data:", data);
        Object.entries(data).forEach(([key, value]) => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === "checkbox") {
                    input.checked = value === "on";
                } else {
                    input.value = value;
                }
            }
        });
        document.querySelectorAll('input[name="activities"]:checked').forEach((cb) => cb.dispatchEvent(new Event("change")));
    } else {
        console.log("No saved form data found");
    }
});

// Generate OHS Specification PDF
function generateOHSSpecPDF(formData, isPreview = false) {
    console.log("Generating OHS Specification PDF with formData:", formData);
    if (!jsPDF) {
        alert("PDF generation failed: Required library not loaded. Please try again or contact support.");
        console.error("jsPDF unavailable.");
        return;
    }

    try {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        // Page 1: Cover
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, "F");
        addHeaderFooter(doc, 1, formData.projectName);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(`OHS Specifications: ${formData.projectName}`, 105, 50, { align: "center" });
        doc.autoTable({
            startY: 80,
            head: [["Field", "Details"]],
            body: [
                ["Document No", "OHS-2025-001"],
                ["Revision", "1.0"],
                ["Date Issued", formData.dateCompiled],
                ["Client Name", formData.clientName],
                ["Contractor Name", formData.contractorName],
                ["Project Name", formData.projectName],
            ],
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [26, 37, 38], textColor: [255, 255, 255] },
        });
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(
            "This document complies with Construction Regulation 5(1)(b). Verify applicability with a qualified professional.",
            105,
            280,
            { align: "center" }
        );

        // Page 2: Client Details
        doc.addPage();
        addHeaderFooter(doc, 2, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Client Details", 10, 20);
        doc.autoTable({
            startY: 30,
            head: [["Field", "Details"]],
            body: [
                ["Company Name", formData.clientName],
                ["Contact Person", formData.contractsManager || "N/A"],
                ["Role", "Contracts Manager"],
                ["Contact Details", formData.emergencyContact || "N/A"],
                ["OHS Contact Person", formData.contractsManager || "N/A"],
                ["Role", "OHS Representative"],
                ["SACPCMP Registration", formData.sacpcmpReg || "N/A"],
            ],
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
        });

        // Page 3: Scope & Contractor Details
        doc.addPage();
        addHeaderFooter(doc, 3, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Scope of Work & Contractor Details", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Scope of Work", 10, 30);
        doc.text(formData.scopeDetails, 10, 40, { maxWidth: 190 });
        doc.autoTable({
            startY: 60,
            head: [["Field", "Details"]],
            body: [
                ["Company Name", formData.contractorName],
                ["Contact Person", formData.managingDirector || "N/A"],
                ["Role", "Managing Director"],
                ["Contact Details", formData.emergencyContact || "N/A"],
                ["COIDA Registration Number", formData.workmansComp || "N/A"],
                ["OHS Contact Person", formData.managingDirector || "N/A"],
                ["Role", "OHS Representative"],
                ["SACPCMP Registration", formData.sacpcmpReg || "N/A"],
            ],
            theme: "grid",
            styles: { fontSize: 10, cellPadding: 3 },
        });

        // Page 4: Contents
        doc.addPage();
        addHeaderFooter(doc, 4, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Contents", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const contents = [
            "1. Purpose",
            "2. Interpretation",
            "   2.1 Scope",
            "   2.2 References",
            "   2.3 Definitions",
            "3. Administrative Requirements",
            "   3.1 Notification and Permits",
            "   3.2 Registration with the Compensation Commissioner",
            "   3.3 Statutory Appointments",
            "   3.4 Risk Management",
            "   3.5 Incident and Accident Management",
            "   3.6 Health and Safety Plan",
            "   3.7 Health and Safety File",
            "   3.8 Audit and Inspection",
            "   3.9 Records",
            "   3.10 Non-Compliance and Penalties",
            "4. Designer Responsibilities",
            "5. Operational Requirements",
            "   5.1 Training",
            "   5.2 Supervision, Discipline, and Reporting",
            "   5.3 OHS Committee",
            "   5.4 Occupational Health",
            "   5.5 Safety and Security",
            "   5.6 Emergency Preparedness",
            "   5.7 Work Procedures",
            "   5.8 Welfare Facilities",
            "   5.9 Cooperation",
            "   5.10 Subcontractors",
            "   5.11 Public and Site Visitor Health & Safety",
            "   5.12 Access to Site",
            "   5.13 Housekeeping",
            "   5.14 Intoxication",
            "   5.15 Environmental Impact and Sustainability",
            "6. Physical Requirements",
            "   6.1 Specific Physical Requirements",
            "   6.2 Edge Protection and Barricading",
            "   6.3 Vessels under Pressure and Gas Bottles",
            "   6.4 Lifting Machines, Tackle, and Lifting Operations",
            "   6.5 Fall Protection",
            "   6.6 Severe Weather Plan",
            "   6.7 Ladders",
            "   6.8 Electrical Installations and Portable Electrical Tools",
            "   6.9 Lockout: Electrical & Mechanical",
            "   6.10 Waste Chutes",
            "   6.11 Hazardous Chemical Substances",
            "   6.12 Traffic Management",
            "   6.13 Excavations",
            "   6.14 Scaffolding",
            "7. General Contract Requirements",
            "   7.1 Contractor Employer in His Own Right",
            "   7.2 Mandatary Agreement",
            "   7.3 No Usage of the Client’s Equipment",
            "   7.4 Duration of Agreement",
            "   7.5 Headings",
            "8. Responsibilities Table",
            "9. Acknowledgement",
        ];
        contents.forEach((line, i) => doc.text(line, 10, 30 + i * 4));

        // Page 5: Purpose
        doc.addPage();
        addHeaderFooter(doc, 5, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("1. Purpose", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
            `This Health and Safety Specification establishes the minimum occupational health and safety (OHS) requirements for contractors performing construction work on ${formData.clientName}'s premises. It ensures compliance with the Occupational Health and Safety Act No. 85 of 1993, Construction Regulations 2014, Compensation for Occupational Injuries and Diseases Act No. 130 of 1993, and other applicable legislation. The specification aims to safeguard workers, visitors, and the public from workplace hazards while promoting a safe, healthy, and sustainable work environment.`,
            10,
            30,
            { maxWidth: 190, lineHeightFactor: 1.2 }
        );

        // Page 6: Interpretation - Scope
        doc.addPage();
        addHeaderFooter(doc, 6, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("2. Interpretation", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("2.1 Scope", 15, 30);
        doc.text(
            `This specification applies to all contractors, subcontractors, designers, and their employees engaged in construction activities on ${formData.clientName}'s premises. It encompasses all project phases, including planning, execution, temporary works, and maintenance activities.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 7: Interpretation - References
        doc.addPage();
        addHeaderFooter(doc, 7, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("2. Interpretation (Continued)", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("2.2 References", 15, 30);
        const references = [
            "- Occupational Health and Safety Act No. 85 of 1993 and its regulations.",
            "- Construction Regulations 2014.",
            "- Compensation for Occupational Injuries and Diseases Act No. 130 of 1993.",
            "- SANS 10400 (National Building Regulations).",
            "- SANS 10085 (Scaffolding).",
            "- SANS 10147 (Fire Safety).",
            "- ISO 45001:2018 (Occupational Health and Safety Management Systems, voluntary).",
            "- South African Council for the Project and Construction Management Professions (SACPCMP) Guidelines.",
            "- National Environmental Management Act No. 107 of 1998.",
            "- Applicable municipal by-laws.",
        ];
        references.forEach((ref, i) => doc.text(ref, 15, 40 + i * 10, { maxWidth: 185 }));

        // Page 8: Interpretation - Definitions
        doc.addPage();
        addHeaderFooter(doc, 8, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("2. Interpretation (Continued)", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("2.3 Definitions", 15, 30);
        const definitions = [
            `- Client: ${formData.clientName}, the entity commissioning the construction work.`,
            "- Contractor: The principal contractor or subcontractor appointed to perform work.",
            "- Designer: A competent person responsible for designing structures, per Construction Regulation 6.",
            "- Competent Person: An individual with the training, experience, and qualifications to perform a task safely, per Construction Regulation 1.",
            "- Health and Safety Plan: A contractor’s plan addressing hazards and risks, per Construction Regulation 7.",
            "- Health and Safety File: A documented record of OHS activities, per Construction Regulation 7(1)(b).",
            "- SACPCMP: South African Council for the Project and Construction Management Professions.",
            "- Baseline Risk Assessment: An initial client assessment identifying project hazards, per Construction Regulation 5(1)(a).",
        ];
        definitions.forEach((def, i) => doc.text(def, 15, 40 + i * 10, { maxWidth: 185 }));

        // Page 9: Administrative Requirements - Notification and Permits
        doc.addPage();
        addHeaderFooter(doc, 9, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("3. Administrative Requirements", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.1 Notification and Permits", 15, 30);
        doc.text(
            `${formData.clientName} will submit Form CR Annexure 1 before work begins for projects requiring permits, per Construction Regulation 4. For projects exceeding 180 days or 1,800 person-days, ${formData.clientName} will obtain a construction work permit, per Construction Regulation 3. Contractors shall provide relevant documentation.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 10: Administrative Requirements - Compensation Commissioner
        doc.addPage();
        addHeaderFooter(doc, 10, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.2 Registration with the Compensation Commissioner", 15, 30);
        doc.text(
            `${formData.contractorName} shall register with the Compensation Fund or a licensed insurer, provide a valid Letter of Good Standing (COIDA No: ${formData.workmansComp}) before commencing work, and submit annual Return of Earnings.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 11: Administrative Requirements - Statutory Appointments
        doc.addPage();
        addHeaderFooter(doc, 11, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.3 Statutory Appointments", 15, 30);
        doc.text(
            `${formData.contractorName} shall appoint competent persons for Construction Manager (per Construction Regulation 8(1)), Construction Health and Safety Officer (SACPCMP-registered: ${formData.sacpcmpReg || "N/A"}), Risk Assessor, Fall Protection Planner, Excavation Supervisor, and SHE Representatives for sites with over 20 employees (OHSA Section 17).`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 12: Administrative Requirements - Risk Management
        doc.addPage();
        addHeaderFooter(doc, 12, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.4 Risk Management", 15, 30);
        doc.text("3.4.1 Baseline Risk Assessment", 20, 40);
        doc.text(
            `${formData.clientName} will provide a Baseline Risk Assessment identifying hazards for ${formData.projectName} (e.g., ${formData.activities.join(", ") || "general hazards"}). Contractors shall use this to develop their Health and Safety Plan.`,
            20,
            50,
            { maxWidth: 180 }
        );
        doc.text("3.4.2 Hazard Identification and Risk Assessment (HIRA)", 20, 70);
        const hiraContent = formData.activities.length
            ? formData.activities
                .map((activity) => {
                    if (activity === "Scaffolding") {
                        return "Risk: Falling from height. Controls: Harnesses, guardrails per SANS 10085, weekly inspections.";
                    } else if (activity === "Asbestos Removal") {
                        return "Risk: Inhalation of fibers. Controls: Respiratory PPE, sealed containment, per Asbestos Regulations.";
                    } else if (activity === "Multi-Storey Construction") {
                        return "Risk: Structural collapse. Controls: Engineering designs per SANS 10400, regular inspections.";
                    }
                    return "";
                })
                .filter(Boolean)
            : ["General Risk: Workplace incidents. Controls: Training, PPE, and regular audits."];
        doc.text(hiraContent.join("\n"), 20, 80, { maxWidth: 180 });

        // Page 13: Administrative Requirements - Risk Control
        doc.addPage();
        addHeaderFooter(doc, 13, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.4.3 Hazard & Risk Control", 20, 30);
        doc.text(
            `${formData.contractorName} shall implement controls following the hierarchy: elimination, substitution, engineering, administrative, PPE. Controls shall be documented in the Health and Safety File.`,
            20,
            40,
            { maxWidth: 180 }
        );

        // Page 14: Administrative Requirements - Incident Management
        doc.addPage();
        addHeaderFooter(doc, 14, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.5 Incident and Accident Management", 15, 30);
        doc.text(
            `${formData.contractorName} shall report serious incidents to DoL within 7 days (OHSA Section 24), submit COIDA claims, investigate root causes, and maintain an incident register.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 15: Administrative Requirements - Health and Safety Plan
        doc.addPage();
        addHeaderFooter(doc, 15, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.6 Health and Safety Plan", 15, 30);
        doc.text(
            `${formData.contractorName} shall submit a Health and Safety Plan for ${formData.projectName}, including risk assessments, safe work procedures, emergency procedures, and training records, per Construction Regulation 7.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 16: Administrative Requirements - Health and Safety File
        doc.addPage();
        addHeaderFooter(doc, 16, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.7 Health and Safety File", 15, 30);
        doc.text(
            `${formData.contractorName} shall maintain a Health and Safety File containing the Health and Safety Plan, risk assessments, appointment letters, inspection registers, incident reports, COIDA submissions, and Letter of Good Standing (COIDA No: ${formData.workmansComp}).`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 17: Administrative Requirements - Audit and Inspection
        doc.addPage();
        addHeaderFooter(doc, 17, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.8 Audit and Inspection", 15, 30);
        doc.text(
            `${formData.contractorName} shall conduct weekly inspections and monthly audits, facilitate ${formData.clientName} or DoL inspections, and address non-conformances promptly.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 18: Administrative Requirements - Records
        doc.addPage();
        addHeaderFooter(doc, 18, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.9 Records", 15, 30);
        doc.text(
            `${formData.contractorName} shall retain records of training, appointments, medical fitness, equipment inspections, incident investigations, and COIDA claims for at least 5 years post-completion.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 19: Administrative Requirements - Non-Compliance
        doc.addPage();
        addHeaderFooter(doc, 19, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("3.10 Non-Compliance and Penalties", 15, 30);
        doc.text(
            `Non-compliance with this specification constitutes a breach of the main project contract for ${formData.projectName}. Penalties shall be enforced as per contractual clauses. ${formData.clientName} reserves the right to report criminal offenses to authorities under OHSA.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 20: Designer Responsibilities
        doc.addPage();
        addHeaderFooter(doc, 20, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("4. Designer Responsibilities", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
            `Designers appointed for ${formData.projectName} shall comply with Construction Regulation 6 and ensure designs prioritize safety, identifying and mitigating hazards (e.g., unstable structures, hazardous materials). They shall provide a safety report to ${formData.clientName}, inform contractors of design-related hazards, verify temporary works meet SANS 10400, and update designs if new risks arise.`,
            10,
            30,
            { maxWidth: 190 }
        );

        // Page 21: Operational Requirements - Training
        doc.addPage();
        addHeaderFooter(doc, 21, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("5. Operational Requirements", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.1 Training", 15, 30);
        doc.text("5.1.1 Induction", 20, 40);
        doc.text(
            `${formData.contractorName} shall provide site-specific induction training for all workers, covering hazards, emergency procedures, and site rules.`,
            20,
            50,
            { maxWidth: 180 }
        );
        doc.text("5.1.2 Awareness", 20, 70);
        doc.text(
            `${formData.contractorName} shall conduct weekly toolbox talks to reinforce safety awareness.`,
            20,
            80,
            { maxWidth: 180 }
        );
        doc.text("5.1.3 Competence", 20, 100);
        doc.text(
            `${formData.contractorName} shall ensure workers are trained and competent for tasks (e.g., scaffolding, crane operation). Training certificates shall be stored in the Health and Safety File.`,
            20,
            110,
            { maxWidth: 180 }
        );

        // Page 22: Operational Requirements - Supervision
        doc.addPage();
        addHeaderFooter(doc, 22, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.2 Supervision, Discipline, and Reporting", 15, 30);
        doc.text(
            `${formData.contractorName} shall appoint competent supervisors, enforce safety rules, and report hazards and incidents to ${formData.clientName} promptly.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 23: Operational Requirements - OHS Committee
        doc.addPage();
        addHeaderFooter(doc, 23, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.3 OHS Committee", 15, 30);
        doc.text(
            `For sites with over 20 employees, ${formData.contractorName} shall establish an OHS committee to discuss safety concerns, review incidents, and recommend improvements, per OHSA Section 19.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 24: Operational Requirements - Occupational Health
        doc.addPage();
        addHeaderFooter(doc, 24, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.4 Occupational Health", 15, 30);
        doc.text("5.4.1 Occupational Medicine/Medical Surveillance", 20, 40);
        doc.text(
            `${formData.contractorName} shall conduct medical fitness assessments for workers exposed to hazards (e.g., noise, dust), per Construction Regulation 7(1)(g).`,
            20,
            50,
            { maxWidth: 180 }
        );
        doc.text("5.4.2 Occupational Hygiene", 20, 70);
        doc.text(
            `${formData.contractorName} shall monitor workplace conditions (e.g., ventilation, noise) and implement controls per OHSA Regulations.`,
            20,
            80,
            { maxWidth: 180 }
        );
        doc.text("5.4.3 Mental Health and Well-being", 20, 100);
        doc.text(
            `${formData.contractorName} shall promote mental health awareness, provide counseling access where feasible, and manage fatigue.`,
            20,
            110,
            { maxWidth: 180 }
        );

        // Page 25: Operational Requirements - Safety and Security
        doc.addPage();
        addHeaderFooter(doc, 25, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.5 Safety and Security", 15, 30);
        doc.text(
            `${formData.contractorName} shall secure the site, provide adequate lighting, safety signage, and enforce PPE usage (e.g., hard hats, safety boots).`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 26: Operational Requirements - Emergency Preparedness
        doc.addPage();
        addHeaderFooter(doc, 26, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.6 Emergency Preparedness", 15, 30);
        doc.text("5.6.1 First Aid", 20, 40);
        doc.text(
            `${formData.contractorName} shall appoint trained first aiders and provide accessible first aid kits, per General Safety Regulations.`,
            20,
            50,
            { maxWidth: 180 }
        );
        doc.text("5.6.2 Fire Equipment", 20, 70);
        doc.text(
            `${formData.contractorName} shall install and maintain fire extinguishers per SANS 10147 and conduct regular fire drills.`,
            20,
            80,
            { maxWidth: 180 }
        );
        doc.text("5.6.3 Emergency Response Plan", 20, 100);
        doc.text(
            `${formData.contractorName} shall develop an emergency plan covering evacuation, medical emergencies, and fire response, with contact numbers displayed.`,
            20,
            110,
            { maxWidth: 180 }
        );

        // Page 27: Operational Requirements - Work Procedures
        doc.addPage();
        addHeaderFooter(doc, 27, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.7 Work Procedures", 15, 30);
        doc.text(
            `${formData.contractorName} shall develop safe work procedures for high-risk tasks (e.g., ${formData.activities.join(", ") || "excavations, lifting"}) based on HIRAs.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 28: Operational Requirements - Welfare Facilities
        doc.addPage();
        addHeaderFooter(doc, 28, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.8 Welfare Facilities", 15, 30);
        doc.text(
            `${formData.contractorName} shall provide clean toilets, drinking water, and rest areas, per Construction Regulation 30.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 29: Operational Requirements - Cooperation
        doc.addPage();
        addHeaderFooter(doc, 29, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.9 Cooperation", 15, 30);
        doc.text(
            `${formData.contractorName} shall cooperate with ${formData.clientName}, safety officers, designers, and other contractors to ensure compliance.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 30: Operational Requirements - Subcontractors
        doc.addPage();
        addHeaderFooter(doc, 30, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.10 Subcontractors", 15, 30);
        doc.text(
            `${formData.contractorName} shall ensure subcontractors comply with this specification and submit approved Health and Safety Plans.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 31: Operational Requirements - Public and Visitor Safety
        doc.addPage();
        addHeaderFooter(doc, 31, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.11 Public and Site Visitor Health & Safety", 15, 30);
        doc.text(
            `${formData.contractorName} shall restrict public access to hazardous areas and provide inductions and PPE for visitors.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 32: Operational Requirements - Access to Site
        doc.addPage();
        addHeaderFooter(doc, 32, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.12 Access to Site", 15, 30);
        doc.text(
            `${formData.contractorName} shall control site access through sign-in procedures and identification checks.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 33: Operational Requirements - Housekeeping
        doc.addPage();
        addHeaderFooter(doc, 33, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.13 Housekeeping", 15, 30);
        doc.text(
            `${formData.contractorName} shall maintain a tidy site with daily clean-ups to prevent tripping hazards and fire risks.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 34: Operational Requirements - Intoxication
        doc.addPage();
        addHeaderFooter(doc, 34, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.14 Intoxication", 15, 30);
        doc.text(
            `${formData.contractorName} shall prohibit alcohol and drugs on site and conduct random testing if necessary.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 35: Operational Requirements - Environmental Impact
        doc.addPage();
        addHeaderFooter(doc, 35, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("5.15 Environmental Impact and Sustainability", 15, 30);
        doc.text(
            `${formData.contractorName} shall minimize environmental harm (e.g., dust, noise, waste) per National Environmental Management Act and implement sustainable practices.`,
            15,
            40,
            { maxWidth: 185 }
        );

        // Page 36: Physical Requirements
        doc.addPage();
        addHeaderFooter(doc, 36, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("6. Physical Requirements", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("6.1 Specific Physical Requirements", 15, 30);
        doc.text(
            `${formData.contractorName} shall comply with task-specific regulations (e.g., Construction Regulations 9-29) for activities such as ${formData.activities.join(", ") || "excavations, scaffolding"}.`,
            15,
            40,
            { maxWidth: 185 }
        );
        doc.text("6.2 Edge Protection and Barricading", 15, 60);
        doc.text(
            `${formData.contractorName} shall install guardrails or netting for edges over 2 meters, per Construction Regulation 10, and use barricades to isolate hazardous areas.`,
            15,
            70,
            { maxWidth: 185 }
        );
        doc.text("6.3 Vessels under Pressure and Gas Bottles", 15, 90);
        doc.text(
            `${formData.contractorName} shall inspect and store vessels per Pressure Equipment Regulations, securing gas bottles upright.`,
            15,
            100,
            { maxWidth: 185 }
        );
        doc.text("6.4 Lifting Machines, Tackle, and Lifting Operations", 15, 120);
        doc.text(
            `${formData.contractorName} shall use certified equipment and trained operators, per Driven Machinery Regulations, maintaining inspection records.`,
            15,
            130,
            { maxWidth: 185 }
        );
        doc.text("6.5 Fall Protection (Working in Elevated Positions)", 15, 150);
        doc.text(
            `${formData.contractorName} shall develop a fall protection plan by a competent person, per Construction Regulation 10, using harnesses and anchor points.`,
            15,
            160,
            { maxWidth: 185 }
        );
        doc.text("6.6 Severe Weather Plan", 15, 180);
        doc.text(
            `${formData.contractorName} shall suspend work during extreme weather and secure loose materials.`,
            15,
            190,
            { maxWidth: 185 }
        );
        doc.text("6.7 Ladders", 15, 210);
        doc.text(
            `${formData.contractorName} shall use ladders compliant with SANS 10085, inspected daily.`,
            15,
            220,
            { maxWidth: 185 }
        );
        doc.text("6.8 Electrical Installations and Portable Electrical Tools", 15, 240);
        doc.text(
            `${formData.contractorName} shall comply with Electrical Installation Regulations, inspecting tools monthly.`,
            15,
            250,
            { maxWidth: 185 }
        );

        // Page 37: Physical Requirements (Continued)
        doc.addPage();
        addHeaderFooter(doc, 37, formData.projectName);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("6.9 Lockout: Electrical & Mechanical", 15, 30);
        doc.text(
            `${formData.contractorName} shall implement lockout/tagout procedures to prevent unauthorized activation.`,
            15,
            40,
            { maxWidth: 185 }
        );
        doc.text("6.10 Waste Chutes", 15, 60);
        doc.text(
            `${formData.contractorName} shall secure waste chutes to scaffolds, discharging into enclosed areas, with daily inspections.`,
            15,
            70,
            { maxWidth: 185 }
        );
        doc.text("6.11 Hazardous Chemical Substances (HCS)", 15, 90);
        doc.text(
            `${formData.contractorName} shall maintain an HCS register with MSDS, train workers, and appoint a coordinator${formData.activities.includes("Asbestos Removal") ? ` (e.g., ${formData.asbestosCoordinator || "TBD"} for asbestos handling per Asbestos Regulations).` : "."}`,
            15,
            100,
            { maxWidth: 185 }
        );
        doc.text("6.12 Traffic Management", 15, 120);
        doc.text(
            `${formData.contractorName} shall develop a traffic management plan with signage and flagmen, per Construction Regulation 7.`,
            15,
            130,
            { maxWidth: 185 }
        );
        doc.text("6.13 Excavations", 15, 150);
        doc.text(
            `${formData.contractorName} shall appoint a competent excavation supervisor, shore excavations over 1.5 meters, and inspect daily, per Construction Regulation 13.`,
            15,
            160,
            { maxWidth: 185 }
        );
        doc.text("6.14 Scaffolding", 15, 180);
        doc.text(
            `${formData.contractorName} shall comply with Construction Regulation 16 and SANS 10085, appointing a competent supervisor${formData.scaffoldSupervisor ? ` (${formData.scaffoldSupervisor})` : ""}, inspecting weekly, and using trained erectors.`,
            15,
            190,
            { maxWidth: 185 }
        );

        // Page 38: General Contract Requirements
        doc.addPage();
        addHeaderFooter(doc, 38, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("7. General Contract Requirements", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("7.1 Contractor Employer in His Own Right", 15, 30);
        doc.text(
            `${formData.contractorName} is deemed an employer under OHSA Section 8 and 9, responsible for the safety of workers and the public.`,
            15,
            40,
            { maxWidth: 185 }
        );
        doc.text("7.2 Mandatary Agreement", 15, 60);
        doc.text(
            `${formData.contractorName} shall sign a Section 37(2) agreement, accepting full OHS responsibilities.`,
            15,
            70,
            { maxWidth: 185 }
        );
        doc.text("7.3 No Usage of the Client’s Equipment", 15, 90);
        doc.text(
            `${formData.contractorName} shall use their own equipment, maintained to legal standards.`,
            15,
            100,
            { maxWidth: 185 }
        );
        doc.text("7.4 Duration of Agreement", 15, 120);
        doc.text(
            `This specification applies for the duration of ${formData.projectName} (${formData.duration} days), unless amended in writing.`,
            15,
            130,
            { maxWidth: 185 }
        );
        doc.text("7.5 Headings", 15, 150);
        doc.text(
            "Headings are for reference only and do not affect interpretation.",
            15,
            160,
            { maxWidth: 185 }
        );

        // Page 39: Responsibilities Table
        doc.addPage();
        addHeaderFooter(doc, 39, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("8. Responsibilities Table", 10, 20);
        doc.autoTable({
            startY: 30,
            head: [["Party", "Responsibility", "Reference"]],
            body: [
                [
                    "Client",
                    `Submit DoL notifications and provide Baseline Risk Assessment for ${formData.projectName}`,
                    "Construction Regulation 3, 5(1)(a)",
                ],
                [
                    "Contractor",
                    `Develop and implement Health and Safety Plan for ${formData.projectName}`,
                    "Construction Regulation 7",
                ],
                [
                    "Designer",
                    "Design structures to minimize safety risks, providing a safety report",
                    "Construction Regulation 6(1)(a)",
                ],
                [
                    "Client",
                    `Appoint competent designers and contractors for ${formData.projectName}`,
                    "Construction Regulation 5(1)(k)",
                ],
                [
                    "Contractor",
                    `Compile and maintain a Health and Safety File`,
                    "Construction Regulation 7(1)(b)",
                ],
                [
                    "Contractor",
                    `Appoint competent persons (e.g., Construction Manager, Safety Officer)`,
                    "Construction Regulation 8",
                ],
                [
                    "Contractor",
                    `Conduct HIRAs and implement controls for all tasks`,
                    "Construction Regulation 9",
                ],
                [
                    "Contractor",
                    `Report incidents to DoL and submit COIDA claims`,
                    "OHSA Section 24, COIDA",
                ],
                [
                    "Contractor",
                    `Ensure subcontractor compliance with this specification`,
                    "Construction Regulation 7(1)(c)",
                ],
                [
                    "Designer",
                    `Inform contractors of design-related hazards`,
                    "Construction Regulation 6(1)(f)",
                ],
                [
                    "Designer",
                    `Verify temporary works meet safety standards`,
                    "Construction Regulation 6(2)",
                ],
            ],
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [26, 37, 38], textColor: [255, 255, 255] },
        });

        // Page 40: Acknowledgement
        doc.addPage();
        addHeaderFooter(doc, 40, formData.projectName);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("9. Acknowledgement", 10, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
            `Thus done and signed by the respective parties as follows:`,
            10,
            30,
            { maxWidth: 190 }
        );
        doc.text(
            `For: Contractor\nName: ${formData.contractorName}\nSignature: ________________\nDate: ${formData.dateCompiled}\nPlace: ${formData.location}`,
            10,
            40,
            { maxWidth: 90 }
        );
        doc.text(
            `For: Client\nName: ${formData.clientName}\nSignature: ________________\nDate: ${formData.dateCompiled}\nPlace: ${formData.location}`,
            110,
            40,
            { maxWidth: 90 }
        );

        // Output
        if (isPreview) {
            console.log("Opening PDF preview");
            doc.output("dataurlnewwindow");
        } else {
            console.log("Saving PDF");
            doc.save(`OHS_Specifications_${formData.projectName.replace(/\s+/g, "_")}.pdf`);
        }
        return doc;
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please check your inputs and try again.");
    }
}

// OHS Specification Form Submission
document.getElementById("project-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("OHS Specification form submitted");

    // Validation
    const cost = parseFloat(document.getElementById("cost")?.value || "0");
    const duration = parseInt(document.getElementById("duration")?.value || "0", 10);
    const scopeDetails = document.getElementById("scope-details")?.value || "";
    const emergencyContact = document.getElementById("emergency-contact")?.value || "";

    if (!emergencyContact.match(/^\+?\d{10,}$/)) {
        console.log("Validation failed: Invalid emergency contact");
        alert("Please enter a valid phone number for emergency contact (e.g., +27123456789).");
        return;
    }
    if (scopeDetails.length < 50) {
        console.log("Validation failed: Scope details too short");
        alert("Scope details must be at least 50 characters to ensure sufficient detail.");
        return;
    }
    if (cost <= 0 || isNaN(cost)) {
        console.log("Validation failed: Invalid cost");
        alert("Cost must be a positive number.");
        return;
    }
    if (duration <= 0 || isNaN(duration)) {
        console.log("Validation failed: Invalid duration");
        alert("Duration must be a positive number.");
        return;
    }

    // Form Data
    const formData = {
        clientName: document.getElementById("client-name")?.value || "Unknown Client",
        contractorName: document.getElementById("contractor-name")?.value || "Unknown Contractor",
        siteAddress: document.getElementById("site-address")?.value || "N/A",
        contractsManager: document.getElementById("contracts-manager")?.value || "N/A",
        managingDirector: document.getElementById("managing-director")?.value || "N/A",
        typeOfWork: document.getElementById("type-of-work")?.value || "N/A",
        workArea: document.getElementById("work-area")?.value || "N/A",
        emergencyContact,
        workmansComp: document.getElementById("workmans-comp")?.value || "N/A",
        projectName: document.getElementById("project-name")?.value || "Unnamed Project",
        location: document.getElementById("location")?.value || "N/A",
        scopeDetails,
        cost,
        duration,
        activities: Array.from(document.querySelectorAll('input[name="activities"]:checked')).map((input) => input.value),
        cidbGrade: document.getElementById("cidb-grade")?.value || "Not Applicable",
        dateCompiled: "April 14, 2025",
        sacpcmpReg: document.getElementById("sacpcmp-reg")?.value || "",
        scaffoldSupervisor: document.getElementById("scaffold-supervisor")?.value || "",
        asbestosCoordinator: document.getElementById("asbestos-coordinator")?.value || "",
    };
    console.log("Form data prepared for PDF generation:", formData);

    // Generate PDF and Update Cart
    const doc = generateOHSSpecPDF(formData);
    if (doc) {
        const cartItems = document.getElementById("cart-items");
        const cartContainer = document.getElementById("cart-container");
        if (cartItems && cartContainer) {
            console.log("Adding OHS Specification to cart");
            cartContainer.classList.remove("hidden");
            const row = document.createElement("tr");
            row.innerHTML = `<td>OHS Specifications - ${formData.projectName}</td><td>R250</td>`;
            cartItems.appendChild(row);
        } else {
            console.error("Cart items or container not found");
        }
    }
});

// Compliance Checklist Logic (for Contractors)
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing Compliance Checklist");

    const steps = document.querySelectorAll("#compliance-form .step");
    const checklistTypeForm = document.getElementById("checklist-type-form");
    const requirementsForm = document.getElementById("requirements-form");
    const statusForm = document.getElementById("status-form");
    const reviewForm = document.getElementById("review-form");
    const requirementSearch = document.getElementById("requirement-search");
    const requirementGroups = document.getElementById("requirement-groups");
    const statusTableBody = document.getElementById("status-table-body");
    const reviewTableBody = document.getElementById("review-table-body");
    const complianceNote = document.querySelector(".compliance-note");
    let selectedRequirements = [];
    let statuses = {};
    let checklistDetails = {};

    console.log("Compliance Checklist elements:", {
        steps: steps.length,
        checklistTypeForm,
        requirementsForm,
        statusForm,
        reviewForm,
        requirementSearch,
        requirementGroups,
        statusTableBody,
        reviewTableBody,
        complianceNote
    });

    // Step 1: Checklist Type
    if (checklistTypeForm) {
        checklistTypeForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const checklistType = document.getElementById("checklist-type").value;
            console.log(`Selected checklist type: ${checklistType}`);
            if (!checklistType) {
                console.log("Validation failed: No checklist type selected");
                alert("Please select a checklist type.");
                return;
            }
            checklistDetails.checklistType = checklistType;
            populateRequirements(checklistType);
            showStep("step-2");
        });
    } else {
        console.error("Checklist type form not found");
    }

    function populateRequirements(checklistType) {
        console.log(`Populating requirements for: ${checklistType}`);
        if (!requirementGroups) {
            console.error("Requirement groups container not found");
            return;
        }
        requirementGroups.innerHTML = "";
        const filteredGroups = complianceDatabase.filter(group => {
            return group.requirements.some(req => req.suggested.includes(checklistType));
        });

        if (!filteredGroups.length) {
            console.log("No requirements found for this checklist type");
            requirementGroups.innerHTML = "<p>No requirements available for this checklist type.</p>";
            requirementsForm.querySelector("button[type='submit']").disabled = true;
            return;
        }

        filteredGroups.forEach(group => {
            const groupDiv = document.createElement("div");
            groupDiv.className = "requirement-group";
            groupDiv.innerHTML = `
                <h4>${group.group}</h4>
                <ul>
                    ${group.requirements.map(req => `
                        <li class="${req.suggested.includes(checklistType) ? 'suggested' : ''}">
                            <label>
                                <input type="checkbox" name="requirement" value="${req.requirement}" 
                                    data-description="${req.description}" 
                                    data-legal="${req.legal}"
                                    ${req.suggested.includes(checklistType) ? 'checked' : ''}>
                                ${req.requirement} (${req.description})
                                ${req.suggested.includes(checklistType) ? '<span class="suggested-label">Suggested</span>' : ''}
                            </label>
                        </li>
                    `).join("")}
                </ul>
            `;
            requirementGroups.appendChild(groupDiv);
        });

        // Collapsible groups
        document.querySelectorAll(".requirement-group h4").forEach(header => {
            header.addEventListener("click", () => {
                console.log(`Toggling requirement group: ${header.textContent}`);
                header.parentElement.classList.toggle("open");
            });
        });

        // Enable/disable Next button
        const updateNextButton = () => {
            const checked = document.querySelectorAll('input[name="requirement"]:checked').length;
            console.log(`Update Next button: ${checked} requirements selected`);
            requirementsForm.querySelector("button[type='submit']").disabled = !checked;
        };
        document.querySelectorAll('input[name="requirement"]').forEach(checkbox => {
            checkbox.addEventListener("change", updateNextButton);
        });
        updateNextButton();

        // Search requirements
        requirementSearch.addEventListener("input", () => {
            const query = requirementSearch.value.toLowerCase();
            console.log(`Searching requirements with query: ${query}`);
            document.querySelectorAll(".requirement-group li").forEach(li => {
                const text = li.textContent.toLowerCase();
                li.style.display = query && !text.includes(query) ? "none" : "block";
            });
        });
    }

    // Step 2: Requirements
    if (requirementsForm) {
        requirementsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Requirements form submitted");
            selectedRequirements = Array.from(document.querySelectorAll('input[name="requirement"]:checked')).map(cb => ({
                requirement: cb.value,
                description: cb.dataset.description,
                legal: cb.dataset.legal
            }));
            console.log("Selected requirements:", selectedRequirements);
            if (!selectedRequirements.length) {
                console.log("Validation failed: No requirements selected");
                alert("Please select at least one requirement.");
                return;
            }
            populateStatus();
            showStep("step-3");
        });

        requirementsForm.querySelector(".back-btn")?.addEventListener("click", () => {
            console.log("Back button clicked from Requirements step");
            showStep("step-1");
        });
    } else {
        console.error("Requirements form not found");
    }

    function populateStatus() {
        console.log("Populating status table");
        if (!statusTableBody) {
            console.error("Status table body not found");
            return;
        }
        statusTableBody.innerHTML = "";
        selectedRequirements.forEach((item, index) => {
            statusTableBody.innerHTML += `
                <tr>
                    <td>${item.requirement}</td>
                    <td>${item.description}</td>
                    <td>${item.legal}</td>
                    <td>
                        <select name="status-${index}" required>
                            <option value="">Select Status</option>
                            <option value="Compliant">Compliant</option>
                            <option value="Non-Compliant">Non-Compliant</option>
                            <option value="Pending">Pending</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" name="notes-${index}" placeholder="Add evidence/notes" aria-label="Evidence or notes for ${item.requirement}">
                    </td>
                </tr>
            `;
        });

        // Enable/disable Next button
        const updateStatusButton = () => {
            const selects = document.querySelectorAll('select[name^="status-"]');
            const allSelected = Array.from(selects).every(select => select.value);
            console.log(`Update Status Next button: All statuses selected: ${allSelected}`);
            statusForm.querySelector("button[type='submit']").disabled = !allSelected;
        };
        document.querySelectorAll('select[name^="status-"]').forEach(select => {
            select.addEventListener("change", updateStatusButton);
        });
        updateStatusButton();
    }

    // Step 3: Status
    if (statusForm) {
        statusForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Status form submitted");
            statuses = {};
            selectedRequirements.forEach((item, index) => {
                statuses[item.requirement] = {
                    status: document.querySelector(`select[name="status-${index}"]`).value,
                    notes: document.querySelector(`input[name="notes-${index}"]`).value || "N/A"
                };
            });
            console.log("Statuses:", statuses);
            populateReview();
            showStep("step-4");
        });

        statusForm.querySelector(".back-btn")?.addEventListener("click", () => {
            console.log("Back button clicked from Status step");
            showStep("step-2");
        });
    } else {
        console.error("Status form not found");
    }

    function populateReview() {
        console.log("Populating review table");
        if (!reviewTableBody) {
            console.error("Review table body not found");
            return;
        }
        reviewTableBody.innerHTML = "";
        selectedRequirements.forEach(item => {
            reviewTableBody.innerHTML += `
                <tr>
                    <td>${item.requirement}</td>
                    <td>${item.description}</td>
                    <td>${item.legal}</td>
                    <td>${statuses[item.requirement].status}</td>
                    <td>${statuses[item.requirement].notes}</td>
                </tr>
            `;
        });

        // Show compliance note for large projects
        const cost = parseFloat(document.getElementById("cost")?.value || "0");
        const duration = parseInt(document.getElementById("duration")?.value || "0", 10);
        if (cost > 40000 || duration > 180) {
            console.log("Showing compliance note for large project");
            complianceNote.classList.remove("hidden");
        }
    }

    // Step 4: Review and Generate
    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Review form submitted");
            checklistDetails = {
                ...checklistDetails,
                siteName: document.getElementById("site-name")?.value || "Unnamed Site",
                siteAddress: document.getElementById("site-address")?.value || "N/A",
                siteLocation: document.getElementById("site-location")?.value || "N/A",
                conductorName: document.getElementById("conductor-name")?.value || "N/A",
                conductorRole: document.getElementById("conductor-role")?.value || "N/A",
                conductorEmail: document.getElementById("conductor-email")?.value || "N/A",
                conductorPhone: document.getElementById("conductor-phone")?.value || "N/A",
                companyName: document.getElementById("company-name")?.value || "N/A",
                companyContact: document.getElementById("company-contact")?.value || "N/A",
                companyRole: document.getElementById("company-role")?.value || "N/A",
                companyDetails: document.getElementById("company-details")?.value || "N/A",
                customNotes: document.getElementById("custom-notes")?.value || "N/A",
                dateCompiled: "April 14, 2025"
            };
            console.log("Checklist details prepared:", checklistDetails);
            generateCompliancePDF();
            showStep("step-5");
        });

        reviewForm.querySelector(".back-btn")?.addEventListener("click", () => {
            console.log("Back button clicked from Review step");
            showStep("step-3");
        });
    } else {
        console.error("Review form not found");
    }

    // Generate Compliance Checklist PDF
    function generateCompliancePDF() {
        console.log("Generating Compliance Checklist PDF");
        if (!jsPDF) {
            alert("PDF generation failed: Required library not loaded.");
            console.error("jsPDF unavailable for Compliance Checklist.");
            return;
        }

        try {
            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

            // Page 1: Cover
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 210, 297, "F");
            addHeaderFooter(doc, 1, checklistDetails.siteName);
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text(`Compliance Checklist: ${checklistDetails.siteName}`, 105, 50, { align: "center" });
            doc.autoTable({
                startY: 80,
                head: [["Field", "Details"]],
                body: [
                    ["Document No", "CMP-2025-001"],
                    ["Revision", "1.0"],
                    ["Date Issued", checklistDetails.dateCompiled],
                    ["Site Name", checklistDetails.siteName],
                    ["Checklist Type", checklistDetails.checklistType.charAt(0).toUpperCase() + checklistDetails.checklistType.slice(1)],
                    ["Conducted By", checklistDetails.conductorName],
                    ["Company", checklistDetails.companyName],
                ],
                theme: "grid",
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [26, 37, 38], textColor: [255, 255, 255] },
            });
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.text(
                "This checklist ensures compliance with OHSA and Construction Regulations.",
                105,
                280,
                { align: "center" }
            );

            // Page 2: Details
            doc.addPage();
            addHeaderFooter(doc, 2, checklistDetails.siteName);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Checklist Details", 10, 20);
            doc.autoTable({
                startY: 30,
                head: [["Field", "Details"]],
                body: [
                    ["Site Address", checklistDetails.siteAddress],
                    ["Location", checklistDetails.siteLocation],
                    ["Conductor Role", checklistDetails.conductorRole],
                    ["Conductor Email", checklistDetails.conductorEmail],
                    ["Conductor Phone", checklistDetails.conductorPhone],
                    ["Company Contact", checklistDetails.companyContact],
                    ["Company Role", checklistDetails.companyRole],
                    ["Company Details", checklistDetails.companyDetails],
                    ["Custom Notes", checklistDetails.customNotes],
                ],
                theme: "grid",
                styles: { fontSize: 10, cellPadding: 3 },
            });

            // Page 3: Compliance Status
            doc.addPage();
            addHeaderFooter(doc, 3, checklistDetails.siteName);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Compliance Status", 10, 20);
            doc.autoTable({
                startY: 30,
                head: [["Requirement", "Description", "Legal Reference", "Status", "Evidence/Notes"]],
                body: selectedRequirements.map(item => [
                    item.requirement,
                    item.description,
                    item.legal,
                    statuses[item.requirement].status,
                    statuses[item.requirement].notes
                ]),
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [26, 37, 38], textColor: [255, 255, 255] },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 40 },
                },
            });

            // Save PDF
            console.log("Saving Compliance Checklist PDF");
            doc.save(`Compliance_Checklist_${checklistDetails.siteName.replace(/\s+/g, "_")}.pdf`);

            // Update Cart
            const cartItems = document.getElementById("cart-items");
            const cartContainer = document.getElementById("cart-container");
            if (cartItems && cartContainer) {
                console.log("Adding Compliance Checklist to cart");
                cartContainer.classList.remove("hidden");
                const row = document.createElement("tr");
                row.innerHTML = `<td>Compliance Checklist - ${checklistDetails.siteName}</td><td>R150</td>`;
                cartItems.appendChild(row);
            } else {
                console.error("Cart items or container not found for Compliance Checklist");
            }
        } catch (error) {
            console.error("Compliance PDF generation error:", error);
            alert("Failed to generate Compliance Checklist PDF. Please try again.");
        }
    }

    // Step 5: Guidance Actions
    document.getElementById("download-again")?.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Download Again button clicked");
        generateCompliancePDF();
    });

    document.getElementById("start-new")?.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Start New Checklist button clicked");
        selectedRequirements = [];
        statuses = {};
        checklistDetails = {};
        reviewTableBody.innerHTML = "";
        statusTableBody.innerHTML = "";
        requirementGroups.innerHTML = "";
        requirementsForm.querySelector("button[type='submit']").disabled = true;
        statusForm.querySelector("button[type='submit']").disabled = true;
        complianceNote.classList.add("hidden");
        document.getElementById("checklist-type").value = "";
        document.getElementById("requirement-search").value = "";
        reviewForm.reset();
        showStep("step-1");
    });
});

// Checkout
document.getElementById("checkout-btn")?.addEventListener("click", () => {
    console.log("Checkout button clicked");
    const promoCode = document.getElementById("promo-code")?.value;
    if (promoCode === "SAFETYFREE2025") {
        console.log("Valid promo code applied");
        alert("Promo code applied! Document downloaded.");
    } else {
        console.log("Invalid promo code, proceeding to payment");
        alert("Invalid promo code. Proceed to payment.");
        setTimeout(() => alert("Payment successful!"), 1000);
    }
});
