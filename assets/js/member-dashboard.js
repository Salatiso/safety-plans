document.addEventListener("DOMContentLoaded", () => {
    // Load user data (placeholder for actual user authentication)
    const user = { name: "User Name" }; // Replace with actual user data
    document.querySelector(".dashboard p").innerText = `Welcome, ${user.name}! Manage your OHS compliance, RMPs, supplier reviews, and community reports here.`;

    // Load company profile
    const savedProfile = JSON.parse(localStorage.getItem("companyProfile")) || {};
    document.getElementById("company-name").value = savedProfile.companyName || "";
    document.getElementById("industry").value = savedProfile.industry || "";
    document.getElementById("location").value = savedProfile.location || "";
    document.getElementById("supervisor-name").value = savedProfile.supervisorName || "";
    document.getElementById("supervisor-contact").value = savedProfile.supervisorContact || "";
    document.getElementById("safety-rep-name").value = savedProfile.safetyRepName || "";
    document.getElementById("safety-rep-contact").value = savedProfile.safetyRepContact || "";

    // Load RMPs (placeholder for actual RMP data)
    const rmps = JSON.parse(localStorage.getItem("rmps")) || [];
    const rmpsTable = document.getElementById("rmps-table");
    rmps.forEach(rmp => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${rmp.date}</td>
            <td>${rmp.title}</td>
            <td>
                <button onclick="viewRMP(${rmp.id})">View</button>
                <button onclick="downloadRMP(${rmp.id})">Download</button>
            </td>
        `;
        rmpsTable.appendChild(row);
    });

    // Load supplier reviews
    const suppliers = JSON.parse(localStorage.getItem("suppliers")) || { suppliers: [] };
    const supplierReviewsTable = document.getElementById("supplier-reviews-table");
    suppliers.suppliers.forEach(supplier => {
        supplier.user_reviews.forEach(review => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${supplier.name}</td>
                <td>${review.rating}/5</td>
                <td>${review.comment}</td>
                <td><button onclick="editReview('${supplier.name}', ${review.rating}, '${review.comment}')">Edit</button></td>
            `;
            supplierReviewsTable.appendChild(row);
        });
    });

    // Load incident reports
    const incidentReports = JSON.parse(localStorage.getItem("incidentReports")) || [];
    const incidentReportsTable = document.getElementById("incident-reports-table");
    incidentReports.forEach(report => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${report.timestamp}</td>
            <td>${report.description}</td>
            <td><a href="https://www.google.com/maps?q=${report.location.lat},${report.location.lng}" target="_blank">View on Map</a></td>
            <td>
                <button onclick="viewIncident(${report.id})">View</button>
                <button onclick="downloadIncident(${report.id})">Download</button>
            </td>
        `;
        incidentReportsTable.appendChild(row);
    });

    // Handle company profile form submission
    document.getElementById("company-profile-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const profile = {
            companyName: document.getElementById("company-name").value,
            industry: document.getElementById("industry").value,
            location: document.getElementById("location").value,
            supervisorName: document.getElementById("supervisor-name").value,
            supervisorContact: document.getElementById("supervisor-contact").value,
            safetyRepName: document.getElementById("safety-rep-name").value,
            safetyRepContact: document.getElementById("safety-rep-contact").value
        };
        localStorage.setItem("companyProfile", JSON.stringify(profile));
        alert("Profile saved successfully!");
    });
});

function viewRMP(id) {
    // Placeholder: Redirect to RMP details or display in modal
    alert(`Viewing RMP with ID: ${id}`);
}

function downloadRMP(id) {
    // Placeholder: Download RMP (would typically fetch from storage or backend)
    alert(`Downloading RMP with ID: ${id}`);
}

function editReview(supplierName, rating, comment) {
    // Placeholder: Open a form to edit the review
    alert(`Editing review for ${supplierName}: ${rating}/5 - ${comment}`);
}

function viewIncident(id) {
    // Placeholder: Display incident details in a modal
    const report = JSON.parse(localStorage.getItem("incidentReports")).find(r => r.id === id);
    alert(`Incident Details:\nTimestamp: ${report.timestamp}\nDescription: ${report.description}\nLocation: https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`);
}

function downloadIncident(id) {
    // Placeholder: Download incident report as PDF
    const report = JSON.parse(localStorage.getItem("incidentReports")).find(r => r.id === id);
    const reportText = `Incident Report\nTimestamp: ${report.timestamp}\nLocation: https://www.google.com/maps?q=${report.location.lat},${report.location.lng}\nwhat3words: ///${report.w3wAddress}\nWeather: ${report.weather}\nDescription: ${report.description}\nReported by: ${report.userName || "Anonymous"}\nService Provider: ${report.providerName}\n`;
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Incident_Report_${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}
