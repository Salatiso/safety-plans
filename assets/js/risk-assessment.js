// assets/js/risk-assessment.js

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDlzylJ0WF_WMZQA2bJeqbzkEMhihYcZW0",
    authDomain: "safety-first-chatbot.firebaseapp.com",
    projectId: "safety-first-chatbot",
    storageBucket: "safety-first-chatbot.firebasestorage.app",
    messagingSenderId: "741489856541",
    appId: "1:741489856541:web:0833fa5deb60dd54c9b6f4",
    measurementId: "G-04Y1PQDYVD"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
} catch (error) {
    console.error("Firebase initialization failed:", error);
    document.getElementById('chat-output').innerHTML = "<p><strong>Error:</strong> Chatbot unavailable. Please try again later.</p>";
}

// Baseline Risk Assessment Database (Full with Suggested Flags)
const riskDatabase = [
    {
        group: "Site Preparation and Access",
        activities: [
            {
                activity: "Site Access",
                hazard: "Unauthorized entry",
                risk: "Delays, security threats, traffic/emergency interference",
                controls: "Require positive ID, conduct site induction, provide designated parking with signage",
                legal: "OHSA Section 8(2)(e), Construction Regulation 4",
                suggested: ["small-construction", "large-construction"]
            },
            {
                activity: "Site Access",
                hazard: "Lack of induction",
                risk: "Safety violations, entering restricted areas",
                controls: "Induct all workers on site rules, emergency plans, restricted zones",
                legal: "OHSA Section 8(2)(f)",
                suggested: ["small-construction", "large-construction"]
            },
            {
                activity: "Site Clearing",
                hazard: "Vegetation/debris",
                risk: "Trips, cuts, biological exposure (insects)",
                controls: "Clear debris, wear PPE (gloves, boots), use insect repellent",
                legal: "OHSA Section 8(2)(a)",
                suggested: ["small-construction"]
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
                legal: "Construction Regulation 13",
                suggested: ["large-construction"]
            },
            {
                activity: "Excavation",
                hazard: "Underground services",
                risk: "Electrocution, gas leaks",
                controls: "Use utility plans, scan before digging, isolate services",
                legal: "OHSA Section 10, Construction Regulation 5(1)(f)",
                suggested: ["large-construction"]
            },
            {
                activity: "Foundation: Concrete Pouring",
                hazard: "Cement dust",
                risk: "Respiratory issues, eye damage",
                controls: "Use wet methods, wear masks/goggles",
                legal: "OHSA HCS Regulations",
                suggested: ["small-construction", "large-construction"]
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
                legal: "Construction Regulation 16",
                suggested: ["small-construction", "large-construction"]
            },
            {
                activity: "Scaffolding",
                hazard: "Improper use",
                risk: "Falls from height",
                controls: "Use trained erectors, wear harnesses, secure tools",
                legal: "Construction Regulation 10",
                suggested: ["small-construction", "large-construction"]
            },
            {
                activity: "Bricklaying/Wall Construction",
                hazard: "Unstable structures",
                risk: "Collapse, injuries",
                controls: "Follow SANS 10400, use competent masons",
                legal: "Construction Regulation 11",
                suggested: ["small-construction"]
            },
            {
                activity: "Bricklaying/Wall Construction",
                hazard: "Cement dust",
                risk: "Respiratory issues, dermatitis",
                controls: "Use wet methods, wear masks, gloves",
                legal: "OHSA HCS Regulations"
            },
            {
                activity: "Bricklaying/Wall Construction",
                hazard: "Manual handling",
                risk: "Ergonomic injuries",
                controls: "Lift bricks in pairs, use proper techniques",
                legal: "OHSA ERW Regulations"
            },
            {
                activity: "Roofing",
                hazard: "Working at height",
                risk: "Falls, head injuries",
                controls: "Use fall protection (harnesses, guardrails), wear helmets",
                legal: "Construction Regulation 10",
                suggested: ["large-construction"]
            },
            {
                activity: "Roofing",
                hazard: "Falling materials",
                risk: "Injuries, property damage",
                controls: "Secure materials, use debris nets, wear PPE",
                legal: "OHSA Section 8(2)(c)"
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
                legal: "OHSA EIR Regulations",
                suggested: ["maintenance"]
            },
            {
                activity: "Plumbing: Wall Chasing",
                hazard: "Dust",
                risk: "Respiratory issues",
                controls: "Use dust extraction, wear masks/goggles",
                legal: "OHSA HCS Regulations"
            },
            {
                activity: "Plumbing: Sanitary Installation",
                hazard: "Heavy appliances",
                risk: "Back strain",
                controls: "Lift in pairs, use lifting aids",
                legal: "OHSA ERW Regulations",
                suggested: ["maintenance"]
            },
            {
                activity: "Electrical Installation (Low Voltage)",
                hazard: "Live circuits",
                risk: "Shocks, burns",
                controls: "Isolate circuits, use competent electricians, test installations",
                legal: "OHSA EIR, SANS 10142",
                suggested: ["electrical"]
            },
            {
                activity: "Electrical Installation (Low Voltage)",
                hazard: "Faulty wiring",
                risk: "Fires, power trips",
                controls: "Follow SANS 10142, keep fire extinguishers nearby",
                legal: "Construction Regulation 24"
            },
            {
                activity: "Electrical: High Voltage Work",
                hazard: "High voltage",
                risk: "Electrocution, arc flash",
                controls: "Use certified HV electricians, lockout/tagout, wear arc-rated PPE",
                legal: "OHSA EIR, SANS 10142",
                suggested: ["electrical"]
            },
            {
                activity: "Electrical: High Voltage Work",
                hazard: "Electromagnetic fields",
                risk: "Health effects (long-term)",
                controls: "Limit exposure time, maintain safe distances",
                legal: "OHSA Section 8(2)(b)"
            },
            {
                activity: "HVAC Installation",
                hazard: "Confined spaces",
                risk: "Asphyxiation, heat stress",
                controls: "Ventilate spaces, use confined space permits, monitor workers",
                legal: "OHSA GSR 5"
            },
            {
                activity: "HVAC Installation",
                hazard: "Heavy units",
                risk: "Ergonomic injuries",
                controls: "Use cranes/lifting aids, work in teams",
                legal: "Construction Regulation 22"
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
                legal: "OHSA HCS Regulations",
                suggested: ["small-construction"]
            },
            {
                activity: "Plastering",
                hazard: "Skin contact",
                risk: "Dermatitis",
                controls: "Wear gloves, long sleeves",
                legal: "OHSA Section 8(2)(d)"
            },
            {
                activity: "Plastering",
                hazard: "High walls",
                risk: "Falls from height",
                controls: "Use stable scaffolding, wear harnesses",
                legal: "Construction Regulation 10"
            },
            {
                activity: "Tiling (Floor/Wall)",
                hazard: "Adhesive dust",
                risk: "Respiratory issues",
                controls: "Use wet methods, wear masks",
                legal: "OHSA HCS Regulations",
                suggested: ["small-construction"]
            },
            {
                activity: "Tiling (Floor/Wall)",
                hazard: "Tile cutting",
                risk: "Cuts, noise",
                controls: "Use PPE (gloves, ear protection), competent workers",
                legal: "OHSA NIR Regulations"
            },
            {
                activity: "Tiling (Floor/Wall)",
                hazard: "Heavy tiles",
                risk: "Back strain",
                controls: "Lift in pairs, use proper techniques",
                legal: "OHSA ERW Regulations"
            },
            {
                activity: "Painting",
                hazard: "Paint fumes",
                risk: "Asphyxiation, nausea",
                controls: "Ensure ventilation, take breaks, use low-VOC paints",
                legal: "OHSA HCS Regulations",
                suggested: ["small-construction"]
            },
            {
                activity: "Painting",
                hazard: "Flammable solvents",
                risk: "Fires",
                controls: "No smoking, store rags safely, follow manufacturer’s instructions",
                legal: "OHSA GSR 4"
            },
            {
                activity: "Painting",
                hazard: "Slippery surfaces",
                risk: "Slips, falls",
                controls: "Clean spills immediately, demarcate wet areas",
                legal: "OHSA FSR Regulations"
            },
            {
                activity: "Ceiling Installation",
                hazard: "Working at height",
                risk: "Falls, head injuries",
                controls: "Use scaffolding, wear helmets, work in pairs",
                legal: "Construction Regulation 10"
            },
            {
                activity: "Ceiling Installation",
                hazard: "Falling debris",
                risk: "Eye injuries",
                controls: "Wear goggles, secure materials",
                legal: "OHSA Section 8(2)(c)"
            },
            {
                activity: "Window Installation",
                hazard: "Glass handling",
                risk: "Cuts, bruises",
                controls: "Wear leather gloves, use competent installers",
                legal: "OHSA Section 8(2)(a)"
            },
            {
                activity: "Window Installation",
                hazard: "Falling windows",
                risk: "Injuries, property damage",
                controls: "Work in pairs, secure during mounting",
                legal: "Construction Regulation 7"
            },
            {
                activity: "Door Installation",
                hazard: "Falling doors",
                risk: "Physical injuries",
                controls: "Use three workers (two holding, one fitting), wear PPE",
                legal: "OHSA Section 8(2)(c)"
            },
            {
                activity: "Door Installation",
                hazard: "Dust (sanding)",
                risk: "Respiratory issues",
                controls: "Wear masks, use dust extraction",
                legal: "OHSA HCS Regulations"
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
                legal: "OHSA Section 8(2)(i)",
                suggested: ["maintenance"]
            },
            {
                activity: "Plumbing Maintenance",
                hazard: "Confined spaces",
                risk: "Asphyxiation",
                controls: "Use permits, ventilate areas, monitor workers",
                legal: "OHSA GSR 5",
                suggested: ["maintenance"]
            },
            {
                activity: "Electrical Maintenance",
                hazard: "Live circuits",
                risk: "Shocks, burns",
                controls: "Lockout/tagout, use competent electricians, test circuits",
                legal: "OHSA EIR Regulations",
                suggested: ["maintenance"]
            },
            {
                activity: "Electrical Maintenance",
                hazard: "Faulty equipment",
                risk: "Fires, injuries",
                controls: "Inspect tools, maintain equipment logs",
                legal: "OHSA Section 10"
            },
            {
                activity: "General Repairs",
                hazard: "Hand tools",
                risk: "Cuts, bruises",
                controls: "Use well-maintained tools, wear gloves",
                legal: "OHSA Section 8(2)(a)",
                suggested: ["maintenance"]
            },
            {
                activity: "General Repairs",
                hazard: "Dust",
                risk: "Respiratory issues",
                controls: "Wear masks, use dust extraction",
                legal: "OHSA HCS Regulations"
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
                legal: "OHSA ERW Regulations",
                suggested: ["office"]
            },
            {
                activity: "Office Ergonomics",
                hazard: "Repetitive tasks",
                risk: "Strain injuries",
                controls: "Take breaks, use ergonomic tools (e.g., wrist rests)",
                legal: "OHSA Section 8(2)(d)",
                suggested: ["office"]
            },
            {
                activity: "Document Handling",
                hazard: "Paper cuts",
                risk: "Minor injuries",
                controls: "Wear gloves for bulk handling, maintain tidy desks",
                legal: "OHSA Section 8(2)(a)"
            },
            {
                activity: "Document Handling",
                hazard: "Heavy files",
                risk: "Back strain",
                controls: "Use trolleys, limit lifting weight",
                legal: "OHSA ERW Regulations"
            },
            {
                activity: "Office Equipment",
                hazard: "Electrical faults",
                risk: "Shocks, fires",
                controls: "Regular inspections, use surge protectors",
                legal: "OHSA EIR Regulations",
                suggested: ["office"]
            },
            {
                activity: "Office Equipment",
                hazard: "Noise (printers)",
                risk: "Hearing discomfort",
                controls: "Place equipment in separate rooms, use ear protection",
                legal: "OHSA NIR Regulations"
            },
            {
                activity: "Office Environment",
                hazard: "Poor lighting",
                risk: "Eye strain, headaches",
                controls: "Ensure adequate lighting, adjust screens",
                legal: "OHSA FSR Regulations",
                suggested: ["office"]
            },
            {
                activity: "Office Environment",
                hazard: "Slips/trips",
                risk: "Falls, injuries",
                controls: "Keep floors clear, repair uneven surfaces",
                legal: "OHSA FSR Regulations"
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
                legal: "OHSA Asbestos Regulations",
                suggested: ["general"]
            },
            {
                activity: "Asbestos Removal",
                hazard: "Improper handling",
                risk: "Environmental contamination",
                controls: "Train workers, appoint coordinator",
                legal: "Construction Regulation 7",
                suggested: ["general"]
            },
            {
                activity: "Biological Agents",
                hazard: "Bacteria, viruses",
                risk: "Illness (diarrhea, fever)",
                controls: "Provide sanitation, wear PPE (masks, gloves), clean regularly",
                legal: "OHSA Section 8(2)(b)",
                suggested: ["general"]
            },
            {
                activity: "Hazardous Chemicals",
                hazard: "Spills, exposure",
                risk: "Burns, poisoning",
                controls: "Store in labeled containers, use PPE, maintain MSDS",
                legal: "OHSA HCS Regulations"
            },
            {
                activity: "Fire Hazards",
                hazard: "Flammable materials",
                risk: "Burns, property damage",
                controls: "Install extinguishers, train staff, conduct drills",
                legal: "OHSA GSR 4, SANS 10147",
                suggested: ["large-construction", "general"]
            },
            {
                activity: "Weather Conditions",
                hazard: "Heat stress",
                risk: "Dehydration, collapse",
                controls: "Provide water, schedule breaks, wear light clothing",
                legal: "OHSA Section 8(2)(b)"
            },
            {
                activity: "Weather Conditions",
                hazard: "Storms/wind",
                risk: "Falling objects, structural damage",
                controls: "Secure materials, suspend work in extreme weather",
                legal: "Construction Regulation 7"
            },
            {
                activity: "Emergency Response",
                hazard: "Inadequate planning",
                risk: "Delayed evacuation, injuries",
                controls: "Develop ERP, train staff, display contact numbers",
                legal: "OHSA GSR 3, Construction Regulation 5",
                suggested: ["large-construction", "general"]
            }
        ]
    }
];

// Form Navigation and Logic
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing risk assessment");

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

    if (!projectTypeForm) {
        console.error("Error: #project-type-form not found");
        return;
    }

    // Show/hide steps
    function showStep(stepId) {
        console.log(`Showing step: ${stepId}`);
        steps.forEach(step => step.classList.add("hidden"));
        document.getElementById(stepId).classList.remove("hidden");
        window.scrollTo(0, 0);
    }

    // Step 1: Project Type
    projectTypeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Project type form submitted");
        const projectType = document.getElementById("project-type").value;
        console.log(`Selected project type: ${projectType}`);
        if (!projectType) {
            alert("Please select a project type.");
            console.warn("No project type selected");
            return;
        }
        populateActivities(projectType);
        showStep("step-2");
    });

    // Fallback: Button click handler
    const nextButton = projectTypeForm.querySelector("button[type='submit']");
    if (nextButton) {
        nextButton.addEventListener("click", (e) => {
            console.log("Next button clicked");
            if (!projectTypeForm.checkValidity()) {
                console.warn("Form validation failed");
                alert("Please select a project type.");
                return;
            }
            // Trigger submit manually
            projectTypeForm.dispatchEvent(new Event("submit"));
        });
    }

    // Populate activities based on project type
    function populateActivities(projectType) {
        console.log(`Populating activities for: ${projectType}`);
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

        if (!filteredGroups.length) {
            activityGroups.innerHTML = "<p>No activities available for this project type.</p>";
            activitiesForm.querySelector("button[type='submit']").disabled = true;
            console.warn("No activities found for project type");
            return;
        }

        filteredGroups.forEach(group => {
            const groupDiv = document.createElement("div");
            groupDiv.className = "activity-group";
            groupDiv.innerHTML = `
                <h4>${group.group}</h4>
                <ul>
                    ${group.activities.map(activity => `
                        <li class="${activity.suggested?.includes(projectType) ? 'suggested' : ''}">
                            <label>
                                <input type="checkbox" name="activity" value="${activity.activity}" 
                                    data-hazard="${activity.hazard}" 
                                    data-risk="${activity.risk}" 
                                    data-controls="${activity.controls}" 
                                    data-legal="${activity.legal}"
                                    ${activity.suggested?.includes(projectType) ? 'checked' : ''}>
                                ${activity.activity} (${activity.hazard})
                                ${activity.suggested?.includes(projectType) ? '<span class="suggested-label">Suggested</span>' : ''}
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
        const updateNextButton = () => {
            const checked = document.querySelectorAll('input[name="activity"]:checked').length;
            activitiesForm.querySelector("button[type='submit']").disabled = !checked;
            console.log(`Next button state: ${!checked ? 'disabled' : 'enabled'}, checked: ${checked}`);
        };
        document.querySelectorAll('input[name="activity"]').forEach(checkbox => {
            checkbox.addEventListener("change", updateNextButton);
        });
        updateNextButton(); // Initial check for pre-selected activities
    }

    // Search activities
    activitySearch.addEventListener("input", () => {
        const query = activitySearch.value.toLowerCase();
        console.log(`Search query: ${query}`);
        document.querySelectorAll(".activity-group li").forEach(li => {
            const text = li.textContent.toLowerCase();
            li.style.display = query && !text.includes(query) ? "none" : "block";
        });
    });

    // Step 2: Activities
    activitiesForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Activities form submitted");
        selectedActivities = Array.from(document.querySelectorAll('input[name="activity"]:checked')).map(cb => ({
            activity: cb.value,
            hazard: cb.dataset.hazard,
            risk: cb.dataset.risk,
            controls: cb.dataset.controls,
            legal: cb.dataset.legal
        }));
        if (!selectedActivities.length) {
            alert("Please select at least one activity.");
            console.warn("No activities selected");
            return;
        }
        console.log("Selected activities:", selectedActivities);
        populateRatings();
        showStep("step-3");
    });

    // Back button for Step 2
    activitiesForm.querySelector(".back-btn").addEventListener("click", () => {
        console.log("Back to step-1");
        showStep("step-1");
    });

    // Populate ratings table
    function populateRatings() {
        console.log("Populating ratings table");
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
                        <select name="rating-${index}" required aria-label="Risk rating for ${item.activity}">
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
            console.log(`Ratings next button: ${allRated ? 'enabled' : 'disabled'}`);
        });
    }

    // Step 3: Ratings
    ratingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Ratings form submitted");
        ratings = {};
        Array.from(ratingsForm.querySelectorAll("select")).forEach(select => {
            const index = select.name.split("-")[1];
            ratings[selectedActivities[index].activity + "-" + selectedActivities[index].hazard] = select.value;
        });
        console.log("Ratings:", ratings);
        populateReview();
        showStep("step-4");
    });

    // Back button for Step 3
    ratingsForm.querySelector(".back-btn").addEventListener("click", () => {
        console.log("Back to step-2");
        showStep("step-2");
    });

    // Populate review table
    function populateReview() {
        console.log("Populating review table");
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
            console.log("Showing compliance note");
        } else {
            complianceNote.classList.add("hidden");
        }
    }

    // Step 4: Review
    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Review form submitted");
        projectDetails = {
            name: document.getElementById("project-name").value.trim(),
            location: document.getElementById("project-location").value.trim(),
            contractor: document.getElementById("contractor-name").value.trim(),
            start: document.getElementById("project-start").value,
            duration: document.getElementById("project-duration").value.trim(),
            notes: document.getElementById("custom-notes").value.trim()
        };
        if (!projectDetails.name) {
            alert("Please enter a project name.");
            console.warn("No project name provided");
            return;
        }
        console.log("Project details:", projectDetails);
        generatePDF();
        showStep("step-5");
    });

    // Back button for Step 4
    reviewForm.querySelector(".back-btn").addEventListener("click", () => {
        console.log("Back to step-3");
        showStep("step-3");
    });

    // Generate PDF
    function generatePDF() {
        console.log("Generating PDF");
        if (!window.jspdf?.jsPDF) {
            alert("PDF generation failed. Please try again later.");
            console.error("jsPDF not loaded");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Baseline Risk Assessment", 10, 10);
        doc.setFontSize(12);
        doc.text(`Project: ${projectDetails.name}`, 10, 20);
        doc.text(`Location: ${projectDetails.location || "N/A"}`, 10, 28);
        doc.text(`Contractor: ${projectDetails.contractor || "N/A"}`, 10, 36);
        doc.text(`Start Date: ${projectDetails.start || "N/A"}`, 10, 44);
        doc.text(`Duration: ${projectDetails.duration || "N/A"}`, 10, 52);
        doc.autoTable({
            startY: 60,
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
        doc.save(`Risk_Assessment_${projectDetails.name.replace(/\s+/g, "_")}.pdf`);
        console.log("PDF generated");
    }

    // Step 5: Guidance
    document.getElementById("download-again").addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Download again clicked");
        generatePDF();
    });

    document.getElementById("start-new").addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Start new assessment");
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

    // Chatbot Logic
    document.getElementById('chat-toggle').addEventListener('click', () => {
        console.log("Toggling chatbot");
        document.getElementById('chat-window').classList.toggle('chat-hidden');
    });

    document.getElementById('chat-send').addEventListener('click', async () => {
        console.log("Chat send clicked");
        const input = document.getElementById('chat-input').value.trim();
        const output = document.getElementById('chat-output');
        if (!input) return;

        output.innerHTML += `<p><strong>You:</strong> ${input}</p>`;
        const query = input.toLowerCase();

        try {
            const snapshot = await db.collection('ohs-knowledge').get();
            let response = "Sorry, I couldn’t find an exact match. Try rephrasing!";
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.content && data.content.toLowerCase().includes(query)) {
                    response = `<strong>From ${data.book}, Chapter ${data.chapter}:</strong><br>${data.content.substring(0, 200)}... (See <a href="/safety-plans/resources/${data.file}">full chapter</a>)`;
                }
            });
            output.innerHTML += `<p><strong>Chatbot:</strong> ${response}</p>`;
        } catch (error) {
            console.error("Firestore query failed:", error);
            output.innerHTML += `<p><strong>Chatbot:</strong> Oops, something went wrong. Please try again!</p>`;
        }

        document.getElementById('chat-input').value = '';
        output.scrollTop = output.scrollHeight;
    });

    // Layout Adjustment
    function adjustLayout() {
        console.log("Adjusting layout");
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

    // Initial layout adjustment
    adjustLayout();
});
