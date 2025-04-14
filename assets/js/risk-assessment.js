// js/risk-assessment.js

// Baseline Risk Assessment Database
const riskDatabase = [
    {
        group: "Site Preparation and Access",
        activities: [
            {
                activity: "Site Access",
                hazard: "Unauthorized entry",
                risk: "Delays, security threats, traffic/emergency interference",
                controls: "Require positive ID, conduct site induction, provide designated parking with signage",
                legal: "OHSA Section 8(2)(e), Construction Regulation 4"
            },
            {
                activity: "Site Access",
                hazard: "Lack of induction",
                risk: "Safety violations, entering restricted areas",
                controls: "Induct all workers on site rules, emergency plans, restricted zones",
                legal: "OHSA Section 8(2)(f)"
            },
            {
                activity: "Site Clearing",
                hazard: "Vegetation/debris",
                risk: "Trips, cuts, biological exposure (insects)",
                controls: "Clear debris, wear PPE (gloves, boots), use insect repellent",
                legal: "OHSA Section 8(2)(a)"
            },
            {
                activity: "Site Clearing",
                hazard: "Heavy equipment",
                risk: "Crush injuries, noise exposure",
                controls: "Use competent operators, wear ear protection, maintain equipment",
                legal: "Construction Regulation 23, OHSA GSR 2"
            }
        ]
    },
    {
        group: "Construction and Structural Work",
        activities: [
            {
                activity: "Excavation",
                hazard: "Trench collapse",
                risk: "Burial, suffocation",
                controls: "Shore trenches >1.5m, appoint competent supervisor, inspect daily",
                legal: "Construction Regulation 13"
            },
            {
                activity: "Excavation",
                hazard: "Underground services",
                risk: "Electrocution, gas leaks",
                controls: "Use utility plans, scan before digging, isolate services",
                legal: "OHSA Section 10, Construction Regulation 5(1)(f)"
            },
            {
                activity: "Foundation: Concrete Pouring",
                hazard: "Cement dust",
                risk: "Respiratory issues, eye damage",
                controls: "Use wet methods, wear masks/goggles",
                legal: "OHSA HCS Regulations"
            },
            {
                activity: "Foundation: Concrete Pouring",
                hazard: "Manual handling",
                risk: "Back/neck strain",
                controls: "Train in lifting techniques, use PPE (gloves)",
                legal: "OHSA Section 8(2)(d)"
            },
            {
                activity: "Foundation: Mesh Installation",
                hazard: "Sharp mesh",
                risk: "Cuts, bruises",
                controls: "Wear gloves, clear sharp remnants",
                legal: "OHSA Section 8(2)(a)"
            },
            {
                activity: "Scaffolding",
                hazard: "Structural failure",
                risk: "Falls, collapse injuries",
                controls: "Comply with SANS 10085, appoint competent supervisor, inspect weekly",
                legal: "Construction Regulation 16"
            },
            {
                activity: "Scaffolding",
                hazard: "Improper use",
                risk: "Falls from height",
                controls: "Use trained erectors, wear harnesses, secure tools",
                legal: "Construction Regulation 10"
            },
            {
                activity: "Bricklaying/Wall Construction",
                hazard: "Unstable structures",
                risk: "Collapse, injuries",
                controls: "Follow SANS 10400, use competent masons",
                legal: "Construction Regulation 11"
            },
            {
                activity: "Bricklaying/Wall Construction",
                hazard: "Cement dust",
                risk: "Respiratory issues, dermatitis",
                controls: "Use wet methods, wear masks, gloves",
                legal: "OHSA HCS Regulations"
            },
            {
                activity: "Roofing",
                hazard: "Working at height",
                risk: "Falls, head injuries",
                controls: "Use fall protection (harnesses, guardrails), wear helmets",
                legal: "Construction Regulation 10"
            }
        ]
    },
    {
        group: "Mechanical and Electrical Work",
        activities: [
            {
                activity: "Plumbing: Wall Chasing",
                hazard: "Electrical tools",
                risk: "Shocks, burns, fires",
                controls: "Inspect tools, isolate circuits, use competent workers",
                legal: "OHSA EIR Regulations"
            },
            {
                activity: "Plumbing: Sanitary Installation",
                hazard: "Heavy appliances",
                risk: "Back strain",
                controls: "Lift in pairs, use lifting aids",
                legal: "OHSA ERW Regulations"
            },
            {
                activity: "Electrical Installation (Low Voltage)",
                hazard: "Live circuits",
                risk: "Shocks, burns",
                controls: "Isolate circuits, use competent electricians, test installations",
                legal: "OHSA EIR, SANS 10142"
            },
            {
                activity: "Electrical: High Voltage Work",
                hazard: "High voltage",
                risk: "Electrocution, arc flash",
                controls: "Use certified HV electricians, lockout/tagout, wear arc-rated PPE",
                legal: "OHSA EIR, SANS 10142"
            },
            {
                activity: "HVAC Installation",
                hazard: "Confined spaces",
                risk: "Asphyxiation, heat stress",
                controls: "Ventilate spaces, use confined space permits, monitor workers",
                legal: "OHSA GSR 5"
            }
        ]
    },
    {
        group: "Finishing and Installation",
        activities: [
            {
                activity: "Plastering",
                hazard: "Cement dust",
                risk: "Respiratory issues, eye damage",
                controls: "Use wet methods, wear masks/goggles",
                legal: "OHSA HCS Regulations"
            },
            {
                activity: "Tiling (Floor/Wall)",
                hazard: "Adhesive dust",
                risk: "Respiratory issues",
                controls: "Use wet methods, wear masks",
                legal: "OHSA HCS Regulations"
            },
            {
                activity: "Painting",
                hazard: "Paint fumes",
                risk: "Asphyxiation, nausea",
                controls: "Ensure ventilation, take breaks, use low-VOC paints",
                legal: "OHSA HCS Regulations"
            },
            {
                activity: "Ceiling Installation",
                hazard: "Working at height",
                risk: "Falls, head injuries",
                controls: "Use scaffolding, wear helmets, work in pairs",
                legal: "Construction Regulation 10"
            },
            {
                activity: "Window Installation",
                hazard: "Glass handling",
                risk: "Cuts, bruises",
                controls: "Wear leather gloves, use competent installers",
                legal: "OHSA Section 8(2)(a)"
            },
            {
                activity: "Door Installation",
                hazard: "Falling doors",
                risk: "Physical injuries",
                controls: "Use three workers (two holding, one fitting), wear PPE",
                legal: "OHSA Section 8(2)(c)"
            }
        ]
    },
    {
        group: "Maintenance and Repair",
        activities: [
            {
                activity: "Plumbing Maintenance",
                hazard: "Leaking pipes",
                risk: "Slips, water damage",
                controls: "Isolate water supply, use absorbent mats, wear boots",
                legal: "OHSA Section 8(2)(i)"
            },
            {
                activity: "Electrical Maintenance",
                hazard: "Live circuits",
                risk: "Shocks, burns",
                controls: "Lockout/tagout, use competent electricians, test circuits",
                legal: "OHSA EIR Regulations"
            },
            {
                activity: "General Repairs",
                hazard: "Hand tools",
                risk: "Cuts, bruises",
                controls: "Use well-maintained tools, wear gloves",
                legal: "OHSA Section 8(2)(a)"
            }
        ]
    },
    {
        group: "Office/Administrative",
        activities: [
            {
                activity: "Office Ergonomics",
                hazard: "Poor workstations",
                risk: "Musculoskeletal disorders",
                controls: "Use adjustable chairs/desks, train in posture, rotate tasks",
                legal: "OHSA ERW Regulations"
            },
            {
                activity: "Document Handling",
                hazard: "Paper cuts",
                risk: "Minor injuries",
                controls: "Wear gloves for bulk handling, maintain tidy desks",
                legal: "OHSA Section 8(2)(a)"
            },
            {
                activity: "Office Equipment",
                hazard: "Electrical faults",
                risk: "Shocks, fires",
                controls: "Regular inspections, use surge protectors",
                legal: "OHSA EIR Regulations"
            }
        ]
    },
    {
        group: "General/Environmental Risks",
        activities: [
            {
                activity: "Asbestos Removal",
                hazard: "Asbestos fibers",
                risk: "Lung diseases, cancer",
                controls: "Use respiratory PPE, sealed containment, licensed disposal",
                legal: "OHSA Asbestos Regulations"
            },
            {
                activity: "Biological Agents",
                hazard: "Bacteria, viruses",
                risk: "Illness (diarrhea, fever)",
                controls: "Provide sanitation, wear PPE (masks, gloves), clean regularly",
                legal: "OHSA Section 8(2)(b)"
            },
            {
                activity: "Fire Hazards",
                hazard: "Flammable materials",
                risk: "Burns, property damage",
                controls: "Install extinguishers, train staff, conduct drills",
                legal: "OHSA GSR 4, SANS 10147"
            }
        ]
    }
];

// Form Navigation and Logic
document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".step");
    const projectTypeForm = document.getElementById("project-type-form");
    const activitiesForm = document.getElementById("activities-form");
    const ratingsForm = document.getElementById("ratings-form");
    const reviewForm = document.getElementById("review-form");
    const activitySearch = document.getElementById("activity-search");
    const activityGroups = document.getElementById("activity-groups");
    const ratingsTableBody = document.getElementById("ratings-table-body");
    const reviewTableBody = document.getElementById("review-table-body");
    const complianceNote = document.querySelector(".compliance-note");
    let selectedActivities = [];
    let ratings = {};
    let projectDetails = {};

    // Show/hide steps
    function showStep(stepId) {
        steps.forEach(step => step.classList.add("hidden"));
        document.getElementById(stepId).classList.remove("hidden");
    }

    // Step 1: Project Type
    projectTypeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const projectType = document.getElementById("project-type").value;
        if (!projectType) {
            alert("Please select a project type.");
            return;
        }
        populateActivities(projectType);
        showStep("step-2");
    });

    // Populate activities based on project type
    function populateActivities(projectType) {
        activityGroups.innerHTML = "";
        const filteredGroups = projectType === "general"
            ? riskDatabase
            : riskDatabase.filter(group => {
                return (
                    (projectType === "maintenance" && group.group === "Maintenance and Repair") ||
                    (projectType === "small-construction" && ["Site Preparation and Access", "Construction and Structural Work", "Finishing and Installation"].includes(group.group)) ||
                    (projectType === "large-construction" && ["Site Preparation and Access", "Construction and Structural Work", "Mechanical and Electrical Work", "Finishing and Installation", "General/Environmental Risks"].includes(group.group)) ||
                    (projectType === "electrical" && group.group === "Mechanical and Electrical Work") ||
                    (projectType === "office" && group.group === "Office/Administrative")
                );
            });

        filteredGroups.forEach(group => {
            const groupDiv = document.createElement("div");
            groupDiv.className = "activity-group";
            groupDiv.innerHTML = `
                <h4>${group.group}</h4>
                <ul>
                    ${group.activities.map(activity => `
                        <li>
                            <label>
                                <input type="checkbox" name="activity" value="${activity.activity}" data-hazard="${activity.hazard}" data-risk="${activity.risk}" data-controls="${activity.controls}" data-legal="${activity.legal}">
                                ${activity.activity} (${activity.hazard})
                            </label>
                        </li>
                    `).join("")}
                </ul>
            `;
            activityGroups.appendChild(groupDiv);
        });

        // Toggle group visibility
        document.querySelectorAll(".activity-group h4").forEach(header => {
            header.addEventListener("click", () => {
                header.parentElement.classList.toggle("open");
            });
        });

        // Enable/disable next button
        activitiesForm.querySelector("button[type='submit']").disabled = true;
        document.querySelectorAll('input[name="activity"]').forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                const checked = document.querySelectorAll('input[name="activity"]:checked').length;
                activitiesForm.querySelector("button[type='submit']").disabled = !checked;
            });
        });
    }

    // Search activities
    activitySearch.addEventListener("input", () => {
        const query = activitySearch.value.toLowerCase();
        document.querySelectorAll(".activity-group li").forEach(li => {
            const text = li.textContent.toLowerCase();
            li.style.display = query && !text.includes(query) ? "none" : "block";
        });
    });

    // Step 2: Activities
    activitiesForm.addEventListener("submit", (e) => {
        e.preventDefault();
        selectedActivities = Array.from(document.querySelectorAll('input[name="activity"]:checked')).map(cb => ({
            activity: cb.value,
            hazard: cb.dataset.hazard,
            risk: cb.dataset.risk,
            controls: cb.dataset.controls,
            legal: cb.dataset.legal
        }));
        if (!selectedActivities.length) {
            alert("Please select at least one activity.");
            return;
        }
        populateRatings();
        showStep("step-3");
    });

    // Back button for Step 2
    activitiesForm.querySelector(".back-btn").addEventListener("click", () => showStep("step-1"));

    // Populate ratings table
    function populateRatings() {
        ratingsTableBody.innerHTML = "";
        selectedActivities.forEach((item, index) => {
            ratingsTableBody.innerHTML += `
                <tr>
                    <td>${item.activity}</td>
                    <td>${item.hazard}</td>
                    <td>${item.risk}</td>
                    <td>${item.controls}</td>
                    <td>${item.legal}</td>
                    <td>
                        <select name="rating-${index}" required>
                            <option value="" disabled selected>Select rating</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </td>
                </tr>
            `;
        });

        // Enable/disable next button
        ratingsForm.querySelector("button[type='submit']").disabled = true;
        ratingsForm.addEventListener("change", () => {
            const allRated = Array.from(ratingsForm.querySelectorAll("select")).every(select => select.value);
            ratingsForm.querySelector("button[type='submit']").disabled = !allRated;
        });
    }

    // Step 3: Ratings
    ratingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        ratings = {};
        Array.from(ratingsForm.querySelectorAll("select")).forEach(select => {
            const index = select.name.split("-")[1];
            ratings[selectedActivities[index].activity + "-" + selectedActivities[index].hazard] = select.value;
        });
        populateReview();
        showStep("step-4");
    });

    // Back button for Step 3
    ratingsForm.querySelector(".back-btn").addEventListener("click", () => showStep("step-2"));

    // Populate review table
    function populateReview() {
        reviewTableBody.innerHTML = "";
        selectedActivities.forEach(item => {
            reviewTableBody.innerHTML += `
                <tr>
                    <td>${item.activity}</td>
                    <td>${item.hazard}</td>
                    <td>${item.risk}</td>
                    <td>${item.controls}</td>
                    <td>${item.legal}</td>
                    <td>${ratings[item.activity + "-" + item.hazard]}</td>
                </tr>
            `;
        });

        // Show compliance note for large construction
        if (document.getElementById("project-type").value === "large-construction") {
            complianceNote.classList.remove("hidden");
        }
    }

    // Step 4: Review
    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        projectDetails = {
            name: document.getElementById("project-name").value,
            location: document.getElementById("project-location").value,
            contractor: document.getElementById("contractor-name").value,
            start: document.getElementById("project-start").value,
            duration: document.getElementById("project-duration").value,
            notes: document.getElementById("custom-notes").value
        };
        generatePDF();
        showStep("step-5");
    });

    // Back button for Step 4
    reviewForm.querySelector(".back-btn").addEventListener("click", () => showStep("step-3"));

    // Generate PDF
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Baseline Risk Assessment", 10, 10);
        if (projectDetails.name) {
            doc.setFontSize(12);
            doc.text(`Project: ${projectDetails.name}`, 10, 20);
            doc.text(`Location: ${projectDetails.location || "N/A"}`, 10, 28);
            doc.text(`Contractor: ${projectDetails.contractor || "N/A"}`, 10, 36);
            doc.text(`Start Date: ${projectDetails.start || "N/A"}`, 10, 44);
            doc.text(`Duration: ${projectDetails.duration || "N/A"}`, 10, 52);
        }
        doc.autoTable({
            startY: projectDetails.name ? 60 : 20,
            head: [["Activity", "Hazard", "Risk", "Control Measures", "Legal Reference", "Rating"]],
            body: selectedActivities.map(item => [
                item.activity,
                item.hazard,
                item.risk,
                item.controls,
                item.legal,
                ratings[item.activity + "-" + item.hazard]
            ]),
            theme: "grid",
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 30 },
                2: { cellWidth: 30 },
                3: { cellWidth: 40 },
                4: { cellWidth: 30 },
                5: { cellWidth: 20 }
            }
        });
        if (projectDetails.notes) {
            doc.addPage();
            doc.setFontSize(12);
            doc.text("Custom Notes", 10, 10);
            doc.setFontSize(10);
            doc.text(projectDetails.notes, 10, 20, { maxWidth: 190 });
        }
        doc.save(`Risk_Assessment_${projectDetails.name || "Document"}.pdf`);
    }

    // Step 5: Guidance
    document.getElementById("download-again").addEventListener("click", (e) => {
        e.preventDefault();
        generatePDF();
    });

    document.getElementById("start-new").addEventListener("click", (e) => {
        e.preventDefault();
        selectedActivities = [];
        ratings = {};
        projectDetails = {};
        projectTypeForm.reset();
        activitiesForm.reset();
        ratingsForm.reset();
        reviewForm.reset();
        activitySearch.value = "";
        activityGroups.innerHTML = "";
        ratingsTableBody.innerHTML = "";
        reviewTableBody.innerHTML = "";
        complianceNote.classList.add("hidden");
        showStep("step-1");
    });

    // Adjust layout (existing function)
    adjustLayout();
});

// Existing layout adjustment (moved from inline script)
function adjustLayout() {
    const headerHeight = document.querySelector("header").offsetHeight || 0;
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    if (sidebar && mainContent) {
        sidebar.style.top = `${headerHeight}px`;
        sidebar.style.height = `calc(100vh - ${headerHeight}px)`;
        mainContent.style.marginLeft = `${sidebar.offsetWidth}px`;
        mainContent.style.paddingTop = `${headerHeight}px`;
        mainContent.style.minHeight = `calc(100vh - ${headerHeight}px)`;
    }
}
window.addEventListener("load", adjustLayout);
window.addEventListener("resize", adjustLayout);
