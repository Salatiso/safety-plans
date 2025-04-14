// assets/js/construction-compliance.js

import { showStep, addHeaderFooter } from './common.js';

const jsPDF = window.jspdf?.jsPDF;
if (!jsPDF) {
    console.error("jsPDF not loaded.");
}

const complianceDatabase = [
    {
        group: "General Site Safety",
        requirements: [
            {
                requirement: "PPE Provision",
                description: "All workers have appropriate PPE",
                legal: "OHSA Section 8, Construction Regulation 5",
                suggested: ["general"]
            },
            {
                requirement: "Site Induction",
                description: "All personnel trained on site hazards",
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
                description: "Weekly checks by competent person",
                legal: "Construction Regulation 16, SANS 10085",
                suggested: ["scaffolding"]
            },
            {
                requirement: "Guardrails",
                description: "Installed at heights >2m",
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
                description: "Lockout/tagout procedures followed",
                legal: "OHSA EIR, SANS 10142",
                suggested: ["electrical"]
            }
        ]
    },
    {
        group: "Excavation Safety",
        requirements: [
            {
                requirement: "Trench Shoring",
                description: "Shoring for trenches >1.5m",
                legal: "Construction Regulation 13",
                suggested: ["excavation"]
            }
        ]
    }
];

// Role selection
document.getElementById("client-btn")?.addEventListener("click", () => {
    window.location.href = "/safety-plans/pages/risk-assessment.html?type=baseline";
});

document.getElementById("contractor-btn")?.addEventListener("click", () => {
    showStep("step-1"); // Show compliance checklist form
});

document.getElementById("hns-pro-btn")?.addEventListener("click", () => {
    document.getElementById("project-form-container").classList.remove("hidden");
});

// OHS Specification Form
function showSpecForm(role) {
    const formContainer = document.getElementById("project-form-container");
    const form = document.getElementById("project-form");
    const dynamicFields = document.getElementById("dynamic-fields");
    if (!formContainer || !dynamicFields) {
        console.error("Form container or dynamic fields missing.");
        return;
    }
    dynamicFields.innerHTML = "";

    if (role === "Health & Safety Professional") {
        dynamicFields.innerHTML += `
            <label for="sacpcmp-reg">SACPCMP Registration Number:</label>
            <input type="text" id="sacpcmp-reg" name="sacpcmpReg" aria-label="SACPCMP Registration">
        `;
    }

    const activityCheckboxes = document.querySelectorAll('input[name="activities"]');
    activityCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            dynamicFields.innerHTML = dynamicFields.innerHTML.split('<label for="scaffolding">')[0];
            if (document.getElementById("scaffolding")?.checked) {
                dynamicFields.innerHTML += `
                    <label for="scaffold-supervisor">Scaffold Supervisor Name:</label>
                    <input type="text" id="scaffold-supervisor" name="scaffoldSupervisor" aria-label="Scaffold Supervisor">
                `;
            }
            if (document.getElementById("asbestos")?.checked) {
                dynamicFields.innerHTML += `
                    <label for="asbestos-coordinator">Asbestos Coordinator Name:</label>
                    <input type="text" id="asbestos-coordinator" name="asbestosCoordinator" aria-label="Asbestos Coordinator">
                `;
            }
        });
    });

    console.log(`${role} form displayed`);
}

document.getElementById("project-form")?.addEventListener("input", () => {
    const form = document.getElementById("project-form");
    if (form) {
        const formData = new FormData(form);
        localStorage.setItem("projectForm", JSON.stringify(Object.fromEntries(formData)));
    }
});

window.addEventListener("load", () => {
    const saved = localStorage.getItem("projectForm");
    if (saved) {
        const data = JSON.parse(saved);
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
    }
});

function generateOHSSpecPDF(formData, isPreview = false) {
    if (!jsPDF) {
        alert("PDF generation failed: Required library not loaded.");
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
        add
