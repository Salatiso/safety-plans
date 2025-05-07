<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Member Dashboard | Salatiso Safety Plans</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/member-dashboard.css">
</head>
<body>
    <!-- Header -->
    <header>
        <div class="header-container">
            <div class="logo">
                <img src="../assets/images/logo.png" alt="Salatiso Safety Plans Logo">
                <h1 data-i18n="header.title">Salatiso OHS Tools</h1>
            </div>
            <nav>
                <ul>
                    <li><a href="../index.html" data-i18n="header.nav.home">Home</a></li>
                    <li><a href="#" data-i18n="header.nav.resources">Resources</a></li>
                    <li><a href="#" data-i18n="header.nav.services">Services</a></li>
                    <li><a href="#" data-i18n="header.nav.community">Community</a></li>
                    <li><a href="#" data-i18n="header.nav.about">About</a></li>
                    <li><a href="#" data-i18n="header.nav.contact">Contact</a></li>
                    <li><a href="../login.html" data-i18n="header.nav.login">Login</a></li>
                    <li><a href="#" data-i18n="header.nav.logout" style="display: none;">Logout</a></li>
                </ul>
            </nav>
            <div class="search-bar">
                <input type="text" placeholder="Search Dashboard..." data-i18n="[placeholder]header.search.placeholder">
                <button data-i18n="header.search.button">Search</button>
            </div>
        </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar">
        <h2 data-i18n="sidebar.ohs_tools">OHS Tools</h2>
        <ul>
            <li><a href="construction-compliance.html" data-i18n="sidebar.construction_safety">Construction Safety</a></li>
            <li><a href="emergency-response-plan.html" data-i18n="sidebar.emergency_planning">Emergency Planning</a></li>
            <li><a href="risk-assessment.html" data-i18n="sidebar.risk_assessment">Risk Assessment</a></li>
            <li><a href="legal-appointments.html" data-i18n="sidebar.legal_appointments">Legal Appointments</a></li>
            <li><a href="incident-management.html" data-i18n="sidebar.incident_management">Incident Management</a></li>
            <li><a href="training.html" data-i18n="sidebar.training">Training</a></li>
            <li><a href="inspections-audits.html" data-i18n="sidebar.inspections_audits">Inspections & Audits</a></li>
            <li><a href="suppliers.html" data-i18n="sidebar.suppliers">Suppliers</a></li>
            <li><a href="legislation.html" data-i18n="sidebar.legislation">Legislation</a></li>
            <li><a href="community-tools.html" data-i18n="sidebar.community_tools">Community Tools</a></li>
            <li><a href="member-dashboard.html" class="active" data-i18n="sidebar.member_dashboard">Member Dashboard</a></li>
        </ul>
        <div class="step-info">
            <h3 data-i18n="sidebar.step_0.title">📜 Member Dashboard</h3>
            <p data-i18n="sidebar.step_0.description">Manage your company profile, OHS compliance, supplier reviews, and incident reports.</p>
            <p class="fun-fact" data-i18n="sidebar.step_0.fun_fact">⚡ Did you know maintaining a detailed safety profile can help ensure consistent compliance across your organization?</p>
        </div>
    </aside>

    <!-- Main Content -->
    <main>
        <section class="dashboard">
            <h2 data-i18n="dashboard.title">Member Dashboard</h2>
            <p data-i18n="dashboard.welcome">Welcome, [User Name]! Manage your OHS compliance, RMPs, supplier reviews, and community reports here.</p>

            <div class="dashboard-section">
                <h3 data-i18n="dashboard.profile.title">Company Profile</h3>
                <form id="company-profile-form">
                    <label data-i18n="dashboard.profile.company_name_label">Company Name:</label>
                    <input type="text" id="company-name" required>
                    <label data-i18n="dashboard.profile.industry_label">Industry:</label>
                    <select id="industry" required>
                        <option value="" data-i18n="dashboard.profile.option_select">Select Industry</option>
                        <option value="construction" data-i18n="dashboard.profile.option_construction">Construction</option>
                        <option value="manufacturing" data-i18n="dashboard.profile.option_manufacturing">Manufacturing</option>
                        <option value="education" data-i18n="dashboard.profile.option_education">Education</option>
                        <option value="healthcare" data-i18n="dashboard.profile.option_healthcare">Healthcare</option>
                        <option value="retail" data-i18n="dashboard.profile.option_retail">Retail</option>
                    </select>
                    <label data-i18n="dashboard.profile.location_label">Location (Province):</label>
                    <select id="location" required>
                        <option value="" data-i18n="dashboard.profile.option_select_location">Select Province</option>
                        <option value="Gauteng" data-i18n="dashboard.profile.option_gauteng">Gauteng</option>
                        <option value="KZN" data-i18n="dashboard.profile.option_kzn">KwaZulu-Natal</option>
                        <option value="WC" data-i18n="dashboard.profile.option_wc">Western Cape</option>
                        <option value="EC" data-i18n="dashboard.profile.option_ec">Eastern Cape</option>
                        <option value="FS" data-i18n="dashboard.profile.option_fs">Free State</option>
                    </select>
                    <label data-i18n="dashboard.profile.supervisor_name_label">Supervisor Name (For Incident Routing):</label>
                    <input type="text" id="supervisor-name">
                    <label data-i18n="dashboard.profile.supervisor_contact_label">Supervisor Contact Details:</label>
                    <input type="text" id="supervisor-contact" data-i18n="[placeholder]dashboard.profile.supervisor_contact_placeholder">Enter phone or email...
                    <label data-i18n="dashboard.profile.safety_rep_name_label">Health and Safety Representative Name:</label>
                    <input type="text" id="safety-rep-name">
                    <label data-i18n="dashboard.profile.safety_rep_contact_label">Health and Safety Representative Contact Details:</label>
                    <input type="text" id="safety-rep-contact" data-i18n="[placeholder]dashboard.profile.safety_rep_contact_placeholder">Enter phone or email...
                    <button type="submit" data-i18n="dashboard.profile.save">Save Profile</button>
                </form>
            </div>

            <div class="dashboard-section">
                <h3 data-i18n="dashboard.rmps.title">Saved RMPs</h3>
                <table>
                    <thead>
                        <tr>
                            <th data-i18n="dashboard.rmps.date">Date</th>
                            <th data-i18n="dashboard.rmps.title_col">Title</th>
                            <th data-i18n="dashboard.rmps.actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="rmps-table">
                        <!-- Populated dynamically -->
                    </tbody>
                </table>
            </div>

            <div class="dashboard-section">
                <h3 data-i18n="dashboard.supplier_reviews.title">Supplier Reviews</h3>
                <table>
                    <thead>
                        <tr>
                            <th data-i18n="dashboard.supplier_reviews.supplier">Supplier</th>
                            <th data-i18n="dashboard.supplier_reviews.rating">Rating</th>
                            <th data-i18n="dashboard.supplier_reviews.comment">Review</th>
                            <th data-i18n="dashboard.supplier_reviews.actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="supplier-reviews-table">
                        <!-- Populated dynamically -->
                    </tbody>
                </table>
            </div>

            <div class="dashboard-section">
                <h3 data-i18n="dashboard.incident_reports.title">Incident Reports</h3>
                <table>
                    <thead>
                        <tr>
                            <th data-i18n="dashboard.incident_reports.date">Date</th>
                            <th data-i18n="dashboard.incident_reports.description">Description</th>
                            <th data-i18n="dashboard.incident_reports.location">Location</th>
                            <th data-i18n="dashboard.incident_reports.actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="incident-reports-table">
                        <!-- Populated dynamically -->
                    </tbody>
                </table>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer>
        <p data-i18n="footer.copyright">© 2025 Salatiso OHS Tools. All Rights Reserved.</p>
        <div class="footer-links">
            <a href="#" data-i18n="footer.links.privacy">Privacy Policy</a>
            <a href="#" data-i18n="footer.links.terms">Terms of Service</a>
            <a href="#" data-i18n="footer.links.contact">Contact Us</a>
        </div>
        <div class="newsletter">
            <h3 data-i18n="footer.newsletter.title">Stay Updated</h3>
            <input type="email" placeholder="Enter your email" data-i18n="[placeholder]footer.newsletter.placeholder">
            <button data-i18n="footer.newsletter.button">Subscribe</button>
        </div>
    </footer>

    <!-- Chatbot -->
    <div class="chatbot">
        <button data-i18n="chatbot.button">Ask Me</button>
        <div class="chatbot-content" style="display: none;">
            <input type="text" placeholder="Ask about OHS..." data-i18n="[placeholder]chatbot.input_placeholder">
            <button data-i18n="chatbot.send">Send</button>
            <p data-i18n="chatbot.response">I'm here to help! For personalized OHS advice, please contact a professional.</p>
        </div>
    </div>

    <script src="../assets/js/scripts.js"></script>
    <script src="../assets/js/member-dashboard.js"></script>
</body>
</html>
