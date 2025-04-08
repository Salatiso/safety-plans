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
    document.getElementById('project-form').reset(); // Reset form
    document.getElementById('cart-container').classList.add('hidden'); // Hide cart
    cart = []; // Clear cart
}

// Form Submission
document.getElementById('project-form').addEventListener('submit', (e) => {
    e.preventDefault();
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
    const documents = generateDocuments(project, score);
    addToCart(documents);
    showCart();
});

// Risk Scoring
function calculateRiskScore(project) {
    let score = 0;
    if (project.cost > 13000000) score += 20; // R13M threshold
    if (project.duration > 365) score += 20; // 365 days threshold
    score += project.activities.length * 10; // 10 points per high-risk activity
    if (['7', '8', '9'].includes(project.cidbGrade)) score += 10; // High CIDB grades
    return score;
}

// Document Generation
function generateDocuments(project, score) {
    const { jsPDF } = window.jspdf;
    const docs = [];

    // Health and Safety Specifications
    const specsDoc = new jsPDF();
    specsDoc.text(`Health and Safety Specifications for ${project.name}`, 10, 10);
    specsDoc.text(`Location: ${project.location}`, 10, 20);
    specsDoc.text(`Scope: ${project.scopeDetails}`, 10, 30);
    specsDoc.text('Activities Involved:', 10, 40);
    project.activities.forEach((activity, index) => {
        specsDoc.text(`- ${activity}`, 10, 50 + index * 10);
    });
    docs.push({ name: 'H&S Specifications', pdf: specsDoc, price: 0 });

    // Baseline Risk Assessment
    const raDoc = new jsPDF();
    raDoc.text(`Baseline Risk Assessment for ${project.name}`, 10, 10);
    raDoc.text('Identified Hazards and Controls:', 10, 20);
    project.activities.forEach((activity, index) => {
        const control = getControl(activity);
        raDoc.text(`- Hazard: ${activity}, Control: ${control}`, 10, 30 + index * 10);
    });
    docs.push({ name: 'Baseline Risk Assessment', pdf: raDoc, price: 0 });

    // Construction Work Permit Application (if required)
    if (score > 50) { // Threshold for permit requirement
        const permitDoc = new jsPDF();
        permitDoc.text(`Construction Work Permit Application`, 10, 10);
        permitDoc.text(`Project: ${project.name}`, 10, 20);
        permitDoc.text(`Location: ${project.location}`, 10, 30);
        permitDoc.text(`Cost: R${project.cost}`, 10, 40);
        permitDoc.text(`Duration: ${project.duration} days`, 10, 50);
        permitDoc.text(`CIDB Grade: ${project.cidbGrade}`, 10, 60);
        permitDoc.text('Submit to: Provincial Director, Department of Employment and Labour', 10, 70);
        permitDoc.text('Note: Required under CR 3(3) due to high risk (Score: ' + score + ')', 10, 80);
        docs.push({ name: 'Construction Work Permit Application', pdf: permitDoc, price: 0 });
    }

    return docs;
}

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
