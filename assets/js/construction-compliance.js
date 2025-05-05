// assets/js/construction-compliance.js

// Import necessary functions
import { showStep, addHeaderFooter } from './common.js';

// Check for jsPDF
const jsPDF = window.jspdf?.jsPDF;
if (!jsPDF) {
    console.error("jsPDF not loaded. Please check script inclusion.");
    alert("PDF generation library (jsPDF) not loaded. Please contact support.");
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
    }
];

// Simulated User Authentication (for demo purposes)
let currentUser = null; // { id: string, role: string, email: string, projects: string[] }
const loggedIn = () => !!currentUser;

// Temporary Data Storage for Non-Logged-In Users
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

// Debug: Confirm script loading and DOM elements on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("construction-compliance.js loaded");

    const projectFormContainer = document.getElementById("project-form-container");
    const complianceForm = document.getElementById("compliance-form");

    if (!projectFormContainer) console.error("Project Form Container not found.");
    if (!complianceForm) console.error("Compliance Form not found.");

    // Initialize Carousel
    const items = document.querySelectorAll(".carousel-item");
    if (items.length > 0) {
        let currentIndex = 0;
        items[currentIndex].classList.add("active");
        document.querySelector(".carousel-next")?.addEventListener("click", () => {
            items[currentIndex].classList.remove("active");
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].classList.add("active");
        });
        document.querySelector(".carousel-prev")?.addEventListener("click", () => {
            items[currentIndex].classList.remove("active");
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            items[currentIndex].classList.add("active");
        });
    } else {
        console.warn("No carousel items found.");
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
    } else {
        console.error("Login link not found.");
    }
});

// Role Selection
document.getElementById("client-btn")?.addEventListener("click", () => {
    console.log("Client selected, redirecting to Risk Assessment");
    document.getElementById("client-legal-note")?.classList.remove("hidden");
    document.getElementById("contractor-legal-note")?.classList.add("hidden");
    document.getElementById("hns-pro-legal-note")?.classList.add("hidden");
    window.location.href = "/safety-plans/pages/risk-assessment.html?type=baseline";
});

// Add more role-specific logic as needed...

// Validation for OHS Specification Form
document.getElementById("project-form")?.addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("OHS Specification form submitted");

    // Validation
    const emergencyContact = document.getElementById("emergency-contact")?.value || "";
    if (!emergencyContact.match(/^\+?[0-9\s\-()]{10,}$/)) {
        alert("Please enter a valid phone number for emergency contact (e.g., +27123456789).");
        return;
    }

    // More validation logic...

    alert("Form submitted successfully!");
});

// Generate OHS Specification PDF
function generateOHSSpecPDF(formData) {
    if (!jsPDF) {
        alert("PDF generation library (jsPDF) not loaded. Please contact support.");
        return;
    }

    try {
        const doc = new jsPDF();
        doc.text("OHS Specification", 10, 10);
        // Add more content...
        doc.save("OHS_Specification.pdf");
    } catch (error) {
        console.error("PDF generation error:", error);
        alert("Failed to generate PDF. Please try again.");
    }
}
