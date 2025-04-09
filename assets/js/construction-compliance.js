// construction-compliance.js

import ohsData from './ohs-data.js'; // Import the data

// Cart array to store generated documents
let cart = [];

// Function to show/hide elements based on role selection
function showForm(role) {
    const formCartWrapper = document.querySelector('.form-cart-wrapper');
    formCartWrapper.classList.remove('hidden'); // Show the wrapper

    const formContainer = document.getElementById('project-form-container');
    formContainer.classList.remove('hidden');
    formContainer.dataset.role = role; // Store selected role
    document.getElementById('client-project-form').reset(); // Reset form
    document.getElementById('cart-container').classList.add('hidden'); // Hide cart
    cart = []; // Clear cart

    // Show or hide the Client-specific form elements
    const clientFormElements = document.querySelectorAll('#client-project-form label, #client-project-form input, #client-project-form select, #client-project-form textarea, #client-project-form button');
    clientFormElements.forEach(element => {
        element.style.display = (role === 'Client') ? 'block' : 'none';
    });

    // Handle 'Other' Activity input
    const otherActivityCheckbox = document.getElementById('other-activity');
    const otherActivityDetailsInput = document.getElementById('other-activity-details');
    if (otherActivityCheckbox) {
        otherActivityDetailsInput.style.display = otherActivityCheckbox.checked ? 'block' : 'none';
        otherActivityCheckbox.addEventListener('change', () => {
            otherActivityDetailsInput.style.display = otherActivityCheckbox.checked ? 'block' : 'none';
        });
    }

    // Populate Legal Requirements
    const legalRequirementsDiv = document.getElementById('legal-requirements-group');
    if (legalRequirementsDiv) {
        legalRequirementsDiv.innerHTML = ''; // Clear previous options
        ohsData.legalRequirements.forEach(req => {
            const label = document.createElement('label');
            label.textContent = req.text;
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = req.id;
            input.name = 'legal-requirements';
            input.value = req.id;

            legalRequirementsDiv.appendChild(input);
            legalRequirementsDiv.appendChild(label);
            legalRequirementsDiv.appendChild(document.createElement('br'));

            if (req.requiresDetails) {
                const detailsInput = document.createElement('input');
                detailsInput.type = 'text';
                detailsInput.name = `${req.id}-details`;
                detailsInput.placeholder = req.detailsLabel;
                detailsInput.style.display = 'none'; // Initially hidden
                detailsInput.classList.add('details-input'); // Class for easy selection
                legalRequirementsDiv.appendChild(detailsInput);
            }
        });

        // Handle Bylaws Input
        legalRequirementsDiv.addEventListener('change', (event) => {
            if (event.target.id === 'municipal-bylaws') {
                const bylawsDetailsInput = document.querySelector('input[name="municipal-bylaws-details"]');
                if (bylawsDetailsInput) {
                    bylawsDetailsInput.style.display = event.target.checked ? 'block' : 'none';
                }
            }
        });
    }

    // Populate roles
    const roleSelect = document.getElementById('legal-appointments');
    if (roleSelect) {
        roleSelect.innerHTML = '';
        ohsData.roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.value;
            option.textContent = role.text;
            roleSelect.appendChild(option);
        });
    }

    // Populate training topics
    const trainingTopicsDiv = document.getElementById('training-requirements-group');
    if (trainingTopicsDiv) {
        trainingTopicsDiv.innerHTML = '';
        ohsData.trainingTopics.forEach(topic => {
            const label = document.createElement('label');
            label.textContent = topic.text;
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = topic.id;
            input.name = 'training-topics';
            input.value = topic.id;

            trainingTopicsDiv.appendChild(input);
            trainingTopicsDiv.appendChild(label);
            trainingTopicsDiv.appendChild(document.createElement('br'));

            if (topic.requiresDetails) {
                const detailsInput = document.createElement('input');
                detailsInput.type = 'text';
                detailsInput.name = `${topic.id}-details`;
                detailsInput.placeholder = topic.detailsLabel;
                detailsInput.style.display = 'none';
                detailsInput.classList.add('details-input');
                trainingTopicsDiv.appendChild(detailsInput);
            }
        });

        // Handle HCS Training input
        trainingTopicsDiv.addEventListener('change', (event) => {
            if (event.target.id === 'hcs-training') {
                const hcsDetailsInput = document.querySelector('input[name="hcs-training-details"]');
                if (hcsDetailsInput) {
                    hcsDetailsInput.style.display = event.target.checked ? 'block' : 'none';
                }
            }
        });
    }

    // Populate PPE types
    const ppeTypesDiv = document.getElementById('ppe-requirements-group');
    if (ppeTypesDiv) {
        ppeTypesDiv.innerHTML = '';
        ohsData.ppeTypes.forEach(ppe => {
            const label = document.createElement('label');
            label.textContent = ppe.text;
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = ppe.id;
            input.name = 'ppe-types';
            input.value = ppe.id;

            ppeTypesDiv.appendChild(input);
            ppeTypesDiv.appendChild(label);
            ppeTypesDiv.appendChild(document.createElement('br'));

            if (ppe.requiresDetails) {
                const detailsInput = document.createElement('input');
                detailsInput.type = 'text';
                detailsInput.name = `${ppe.id}-details`;
                detailsInput.placeholder = ppe.detailsLabel;
                detailsInput.style.display = 'none';
                detailsInput.classList.add('details-input');
                ppeTypesDiv.appendChild(detailsInput);
            }
        });

        // Handle Respirators input
        ppeTypesDiv.addEventListener('change', (event) => {
            if (event.target.id === 'respirators') {
                const respiratorsDetailsInput = document.querySelector('input[name="respirators-details"]');
                if (respiratorsDetailsInput) {
                    respiratorsDetailsInput.style.display = event.target.checked ? 'block' : 'none';
                }
            }
        });

        // Handle Gloves input
        ppeTypesDiv.addEventListener('change', (event) => {
            if (event.target.id === 'gloves') {
                const glovesDetailsInput = document.querySelector('input[name="gloves-details"]');
                if (glovesDetailsInput) {
                    glovesDetailsInput.style.display = event.target.checked ? 'block' : 'none';
                }
            }
        });
    }

    // Populate activities
    const activitiesDiv = document.getElementById('risk-assessment-activities-group');
    if (activitiesDiv) {
        activitiesDiv.innerHTML = '';
        ohsData.riskAssessmentActivities.forEach(activity => {
            const label = document.createElement('label');
            label.textContent = activity.text;
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = activity.value;
            input.name = 'risk-assessment-activities';
            input.value = activity.value;

            activitiesDiv.appendChild(input);
            activitiesDiv.appendChild(label);
            activitiesDiv.appendChild(document.createElement('br'));

            if (activity.requiresDetails) {
                const detailsInput = document.createElement('input');
                detailsInput.type = 'text';
                detailsInput.name = `${activity.value}-details`;
                detailsInput.placeholder = activity.detailsLabel;
                detailsInput.style.display = 'none';
                detailsInput.classList.add('details-input');
                activitiesDiv.appendChild(detailsInput);
            }
        });

        // Handle Other Activity input
        activitiesDiv.addEventListener('change', (event) => {
            if (event.target.id === 'Other') {
                const otherActivityDetailsInput = document.querySelector('input[name="Other-details"]');
                if (otherActivityDetailsInput) {
                    otherActivityDetailsInput.style.display = event.target.checked ? 'block' : 'none';
                }
            }
        });
    }
}

// Form Submission (Modified)
document.getElementById('client-project-form').addEventListener('submit', (e) => { // Updated ID
    e.preventDefault();
    const formData = new FormData(e.target);
    const project = {
        name: formData.get('projectName'),
        location: formData.get('location'),
        clientName: formData.get('clientName'),
        clientContactName: formData.get('clientContactName'),
        clientContactTitle: formData.get('clientContactTitle'),
        clientContactPhone: formData.get('clientContactPhone'),
        clientContactEmail: formData.get('clientContactEmail'),
        cost: parseInt(formData.get('cost')),
        duration: parseInt(formData.get('duration')),
        activities: formData.getAll('activities'),
        cidbGrade: formData.get('cidbGrade'),
        scopeDetails: formData.get('scopeDetails'),
        legalRequirements: Array.from(document.querySelectorAll('input[name="legal-requirements"]:checked')).map(input => input.value),
        legalRequirementsDetails: document.querySelector('input[name="municipal-bylaws-details"]')?.value,
        legalAppointments: getLegalAppointmentsData(),
        trainingRequirements: Array.from(document.querySelectorAll('input[name="training-topics"]:checked')).map(input => input.value),
        trainingDetails: document.querySelector('input[name="training-details"]')?.value,
        ppeRequirements: Array.from(document.querySelectorAll('input[name="ppe-types"]:checked')).map(input => input.value),
        ppeDetails: document.querySelector('input[name="ppe-details"]')?.value,
        emergencyProcedures: Array.from(document.querySelectorAll('input[name="emergency-procedures"]:checked')).map(input => input.value),
        emergencyDetails: document.querySelector('input[name="emergency-details"]')?.value,
        riskAssessmentActivities: Array.from(document.querySelectorAll('input[name="risk-assessment-activities"]:checked')).map(input => input.value),
        riskAssessmentOtherDetails: document.querySelector('input[name="Other-details"]')?.value
    };

    const score = calculateRiskScore(project);
    const docs = generateDocuments(project, score);
    addToCart(docs);
    showCart();
});

// Function to gather data from dynamically added legal appointments
function getLegalAppointmentsData() {
    const appointments = [];
    const roleElements = document.querySelectorAll('select[name^="legal-appointments"]');
    roleElements.forEach((roleElement, index) => {
        appointments.push({
            role: roleElement.value,
            appointeeName: document.querySelector(`input[name="legal-appointments[${index}][appointee-name]"]`).value,
            qualifications: document.querySelector(`input[name="legal-appointments[${index}][qualifications]"]`).value,
            responsibilities: document.querySelector(`textarea[name="legal-appointments[${index}][responsibilities]"]`).value
        });
    });
    return appointments;
}

// Risk Scoring (unchanged)
function calculateRiskScore(project) {
    let score = 0;
    if (project.cost > 13000000) score += 20; // R13M threshold
    if (project.duration > 365) score += 20; // 365 days threshold
    score += project.activities.length * 10; // 10 points per high-risk activity
    if (['7', '8', '9'].includes(project.cidbGrade)) score += 10; // High CIDB grades
    return score;
}

// Document Generation (Modified)
function generateDocuments(project, score) {
    const { jsPDF } = window.jspdf;
    const docs = [];

    // Health and Safety Specifications
    const specsDoc = new jsPDF();
    specsDoc.text(`Health and Safety Specifications for ${project.name}`, 10, 10);
    specsDoc.text(`Client: ${project.clientName}`, 10, 30);
    specsDoc.text(`Client Contact: <span class="math-inline">\{project\.clientContactName\} \(</span>{project.clientContactTitle})`, 10, 40);
    specsDoc.text(`Location: ${project.location}`, 10, 50);
    specsDoc.text(`Scope: ${project.scopeDetails}`, 10, 60);

    let y = 70;
    specsDoc.text('Legal and Regulatory Requirements:', 10, y);
    y += 10;
    project.legalRequirements.forEach(req => {
        specsDoc.text(`- ${ohsData.legalRequirements.find(r => r.id === req).text}`, 10, y);
        y += 10;
    });
    if (project.legalRequirementsDetails) {
        specsDoc.text(`    Details: ${project.legalRequirementsDetails}`, 20, y);
        y += 10;
    }

    specsDoc.text('OHS Plan Requirements:', 10, y);
    y += 10;
    specsDoc.text('- Develop and implement a site-specific Health and Safety Plan.', 10, y);
    y += 10;

    specsDoc.text('Legal Appointments:', 10, y);
    y += 10;
    project.legalAppointments.forEach(appt => {
        specsDoc.text(`- ${ohsData.roles.find(r => r.value === appt.role).text}: ${appt.appointeeName}`, 10, y);
        y += 10;
        specsDoc.text(`    Responsibilities: ${appt.responsibilities}`, 20, y);
        y += 10;
    });

    specsDoc.text('Training Requirements:', 10, y);
    y += 10;
    project.trainingRequirements.forEach(topic => {
        specsDoc.text(`- ${ohsData.trainingTopics.find(t => t.id === topic).text}`, 10, y);
        y += 10;
    });
    if (project.trainingDetails) {
        specsDoc.text(`    Details: ${project.trainingDetails}`, 20, y);
        y += 10;
    }

    specsDoc.text('PPE Requirements:', 10, y);
    y += 10;
    project.ppeRequirements.forEach(ppe => {
        specsDoc.text(`- ${ohsData.ppeTypes.find(p => p.id === ppe).text}`, 10, y);
        y += 10;
    });
    if (project.ppeDetails) {
        specsDoc.text(`    Details: ${project.ppeDetails}`, 20, y);
        y += 10;
    }

    specsDoc.text('Emergency Procedures:', 10, y);
    y += 10;
    project.emergencyProcedures.forEach(procedure => {
        specsDoc.text(`- ${ohsData.emergencyProcedures.find(ep => ep.id === procedure).text}`, 10, y);
        y += 10;
    });
    if (project.emergencyDetails) {
        specsDoc.text(`    Details: ${project.emergencyDetails}`, 20, y);
        y += 10;
    }

    specsDoc.addPage();
    specsDoc.text('Risk Assessment:', 10, 10);
    y = 20;
    project.riskAssessmentActivities.forEach(activity => {
        specsDoc.text(`Activity: ${ohsData.riskAssessmentActivities.find(a => a.value === activity).text}`, 10, y);
        y += 10;
        const hazards = ohsData.hazards[activity];
        if (hazards) {
            hazards.forEach(hazard => {
                specsDoc.text(`    - Hazard: ${hazard.name}, Risk: ${hazard.risk}, Control: ${hazard.control}`, 20, y);
                y += 10;
            });
        } else {
            specsDoc.text('    No specific hazards defined.', 20, y);
            y += 10;
        }
    });

    docs.push({ name: 'H&S Specifications', pdf: specsDoc, price: 0 });

    // Baseline Risk Assessment (Simplified for now)
    const raDoc = new jsPDF();
    raDoc.text(`Baseline Risk Assessment for ${project.name}`, 10, 10);
    raDoc.text(`Client: ${project.clientName}`, 10, 20);
    raDoc.text('Identified Hazards:', 10, 30);
    project.riskAssessmentActivities.forEach((activity, index) => {
        raDoc.text(`- ${ohsData.riskAssessmentActivities.find(a => a.value === activity).text}`, 10, 40 + index * 10);
    });
    docs.push({ name: 'Baseline Risk Assessment', pdf: raDoc, price: 0 });

    // Construction Work Permit Application (if required)
    if (score > 50) { // Threshold for permit requirement
        const permitDoc = new jsPDF();
        permitDoc.text(`Construction Work Permit Application`, 10, 10);
        permitDoc.text(`Project: ${project.name}`, 10, 20);
        permitDoc.
