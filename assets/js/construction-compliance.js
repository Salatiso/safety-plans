// construction-compliance.js

import ohsData from './ohs-data.js';

// Cart array (if you haven't already defined it elsewhere)
let cart = [];
let appointmentCounter = 0; // Counter for unique IDs

// Function to show/hide elements based on role selection and populate form
function showForm(role) {
    // ... (Your existing showForm function code - keep this)

    // Populate Legal Appointments
    const legalAppointmentsDiv = document.getElementById('legal-appointments');
    if (legalAppointmentsDiv) {
        legalAppointmentsDiv.innerHTML = ''; // Clear previous appointments
        addAppointmentFields(); // Add initial appointment fields
        document.getElementById('add-appointment').addEventListener('click', addAppointmentFields);
    }

    // ... (rest of your showForm function)
}

function addAppointmentFields() {
    const appointmentsDiv = document.getElementById('legal-appointments');
    const appointmentDiv = document.createElement('div');
    appointmentDiv.classList.add('repeatable-section');
    appointmentDiv.innerHTML = `
        <h4>Appointment ${++appointmentCounter}</h4>
        <label for="legal-appointments[${appointmentCounter}][role]">Role:</label>
        <select id="legal-appointments[${appointmentCounter}][role]" name="legal-appointments[${appointmentCounter}][role]" required>
            ${ohsData.roles.map(role => `<option value="${role.value}">${role.text}</option>`).join('')}
        </select>
        <label for="legal-appointments[${appointmentCounter}][appointee-name]">Appointee Name:</label>
        <input type="text" id="legal-appointments[${appointmentCounter}][appointee-name]" name="legal-appointments[${appointmentCounter}][appointee-name]" required>
        <label for="legal-appointments[${appointmentCounter}][qualifications]">Qualifications:</label>
        <input type="text" id="legal-appointments[${appointmentCounter}][qualifications]" name="legal-appointments[${appointmentCounter}][qualifications]">
        <label for="legal-appointments[${appointmentCounter}][responsibilities]">Responsibilities:</label>
        <textarea id="legal-appointments[${appointmentCounter}][responsibilities]" name="legal-appointments[${appointmentCounter}][responsibilities]"></textarea>
    `;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.type = 'button';
    removeButton.classList.add('remove-btn');
    removeButton.addEventListener('click', () => appointmentDiv.remove());
    appointmentDiv.appendChild(removeButton);
    appointmentsDiv.appendChild(appointmentDiv);

    // Pre-fill responsibilities (Event Delegation)
    appointmentDiv.addEventListener('change', (event) => {
        if (event.target.name === `legal-appointments[${appointmentCounter}][role]`) {
            const selectedRole = ohsData.roles.find(role => role.value === event.target.value);
            if (selectedRole) {
                const responsibilitiesTextarea = appointmentDiv.querySelector(`textarea[name="legal-appointments[${appointmentCounter}][responsibilities]"]`);
                if (responsibilitiesTextarea) {
                    responsibilitiesTextarea.value = selectedRole.responsibilities;
                }
            }
        }
    });

    // Trigger change event on initial role select
    appointmentDiv.querySelector(`select[name="legal-appointments[${appointmentCounter}][role]"]`).dispatchEvent(new Event('change'));
}

// Form Submission (Adjusted to include legal appointments data)
document.getElementById('client-project-form').addEventListener('submit', (e) => {
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
        legalAppointments: getLegalAppointmentsData(), // Function to collect data
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

// ... (Rest of your JavaScript code: calculateRiskScore, generateDocuments, addToCart, showCart, checkout)
