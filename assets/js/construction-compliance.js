// construction-compliance.js

// Cart array to store generated documents
let cart = [];

// Role Selection
document.getElementById('client-btn').addEventListener('click', () => showForm('Client'));
document.getElementById('contractor-btn').addEventListener('click', () => showForm('Contractor'));
document.getElementById('hns-pro-btn').addEventListener('click', () => showForm('Health & Safety Professional'));

function showForm(role) {
    const formContainer = document.getElementById('project-form-container');
    formContainer.classList.remove('hidden');
    formContainer.dataset.role = role; // Store selected role
    document.getElementById('project-form').reset(); // Reset form (fixed ID)
    document.getElementById('cart-container').classList.add('hidden'); // Hide cart
    cart = []; // Clear cart
}

// Form Submission
document.getElementById('project-form').addEventListener('submit', (e) => { // Fixed ID
    e.preventDefault();
    const role = document.getElementById('project-form-container').dataset.role;
    if (role !== 'Client') return; // Only process for Client role

    const formData = new FormData(e.target);
    const project = {
        name: formData.get('projectName'),
        location: formData.get('location'),
        cost: parseInt(formData.get('cost')),
        duration: parseInt(formData.get('duration')),
        activities: formData.getAll('activities'),
        cidbGrade: formData.get('cidbGrade'),
        scopeDetails: formData.get('scopeDetails')
    };

    const score = calculateRiskScore(project);
    const docs = generateDocuments(project, score);
    addToCart(docs);
    showCart();
});

// Risk Scoring (Updated with ohsData)
function calculateRiskScore(project) {
    let score = 0;
    if (project.cost > 13000000) score += 20; // R13M threshold
    if (project.duration > 365) score += 20; // 365 days threshold
    
    // Use ohsData to weigh high-risk activities
    project.activities.forEach(activity => {
        const matchedActivity = ohsData.riskAssessmentActivities.find(act => act.text === activity);
        if (matchedActivity && ohsData.hazards[matchedActivity.value]?.some(h => h.risk.includes('fatality'))) {
            score += 20; // Higher weight for fatality risks
        } else {
            score += 10; // Standard weight
        }
    });
    
    if (['7', '8', '9'].includes(project.cidbGrade)) score += 10; // High CIDB grades
    return score;
}

// Document Generation (Updated with ohsData)
function generateDocuments(project, score) {
    const { jsPDF } = window.jspdf;
    const docs = [];

    // Health and Safety Specifications
    const specsDoc = new jsPDF();
    specsDoc.setFontSize(16);
    specsDoc.text(`Health and Safety Specification for ${project.name}`, 10, 10);
    specsDoc.setFontSize(12);
    specsDoc.text(`Location: ${project.location}`, 10, 30);
    specsDoc.text(`Scope: ${project.scopeDetails}`, 10, 40);
    specsDoc.text('Activities Involved:', 10, 50);
    project.activities.forEach((activity, index) => {
        specsDoc.text(`- ${activity}`, 10, 60 + index * 10);
    });
    let yPos = 60 + project.activities.length * 10 + 10;
    specsDoc.text('Legal Requirements:', 10, yPos);
    ohsData.legalRequirements.forEach((req, index) => {
        specsDoc.text(`- ${req.text}`, 10, yPos + 10 + index * 10);
    });
    yPos += ohsData.legalRequirements.length * 10 + 10;
    specsDoc.text('Contractor Responsibilities:', 10, yPos);
    ohsData.roles.forEach((role, index) => {
        specsDoc.text(`- ${role.text}: ${role.responsibilities}`, 10, yPos + 10 + index * 10);
    });
    docs.push({ name: 'H&S Specification', pdf: specsDoc, price: 0 });

    // Baseline Risk Assessment
    const raDoc = new jsPDF();
    raDoc.setFontSize(16);
    raDoc.text(`Baseline Risk Assessment for ${project.name}`, 10, 10);
    raDoc.setFontSize(12);
    raDoc.text('Identified Hazards and Controls:', 10, 20);
    let raYPos = 30;
    project.activities.forEach((activity, index) => {
        const matchedActivity = ohsData.riskAssessmentActivities.find(act => act.text === activity);
        if (matchedActivity && ohsData.hazards[matchedActivity.value]) {
            ohsData.hazards[matchedActivity.value].forEach((hazard, hIndex) => {
                raDoc.text(`- ${hazard.name}: Risk - ${hazard.risk}, Control - ${hazard.control}`, 10, raYPos + (index + hIndex) * 10);
            });
            raYPos += ohsData.hazards[matchedActivity.value].length * 10;
        } else {
            raDoc.text(`- ${activity}: Control - ${getControl(activity)}`, 10, raYPos + index * 10);
        }
    });

    docs.push({ name: 'Baseline Risk Assessment', pdf: raDoc, price: 0 });

    // Construction Work Permit Application (Updated with ohsData)
    if (score > 50) { // Keep threshold, enhanced with ohsData
        const permitDoc = new jsPDF();
        permitDoc.setFontSize(16);
        permitDoc.text(`Construction Work Permit Application`, 10, 10);
        permitDoc.setFontSize(12);
        permitDoc.text(`Project: ${project.name}`, 10, 20);
        permitDoc.text(`Location: ${project.location}`, 10, 30);
        permitDoc.text(`Cost: R${project.cost}`, 10, 40);
        permitDoc.text(`Duration: ${project.duration} days`, 10, 50);
        permitDoc.text(`CIDB Grade: ${project.cidbGrade}`, 10, 60);
        permitDoc.text('Submit to: Provincial Director, Department of Employment and Labour', 10, 70);
        permitDoc.text(`Note: Required under CR 3 due to high risk (Score: ${score})`, 10, 80);
        const highRiskActivities = project.activities.filter(act => {
            const matched = ohsData.riskAssessmentActivities.find(a => a.text === act);
            return matched && ohsData.hazards[matched.value]?.some(h => h.risk.includes('fatality'));
        });
        if (highRiskActivities.length > 0) {
            permitDoc.text('High-Risk Activities:', 10, 90);
            highRiskActivities.forEach((act, index) => {
                permitDoc.text(`- ${act}`, 10, 100 + index * 10);
            });
        }
        docs.push({ name: 'Construction Work Permit Application', pdf: permitDoc, price: 0 });
    }

    return docs;
}

// Hazard-Control Mapping (Fallback for unmapped activities)
function getControl(activity) {
    const controls = {
        'Scaffolding': 'Erect guardrails, ensure competent erection',
        'Multi-Storey Construction': 'Install fall protection, regular inspections',
        'Asbestos Removal': 'Use PPE, licensed removal specialists'
    };
    return controls[activity] || 'General safety measures';
}

// Cart Management
function addToCart(documents) {
    cart = documents;
}

function showCart() {
    const cartContainer = document.getElementById('cart-container');
    const cartItems = document.getElementById('cart-items');
    cartContainer.classList.remove('hidden');
    cartItems.innerHTML = '';
    cart.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${doc.name}</td><td>R${doc.price}</td>`;
        cartItems.appendChild(row);
    });
}

// Checkout
document.getElementById('checkout-btn').addEventListener('click', () => {
    const promoCode = document.getElementById('promo-code').value.trim();
    if (promoCode === 'SAFETYFREE2025') {
        cart.forEach(doc => {
            doc.pdf.save(`${doc.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
        });
        alert('Documents downloaded successfully!');
        cart = [];
        document.getElementById('cart-container').classList.add('hidden');
        document.getElementById('project-form-container').classList.add('hidden');
    } else {
        alert('Invalid promo code. Use SAFETYFREE2025 for free access until Dec 31, 2025.');
    }
});
