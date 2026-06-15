// BNI Lakshya Banner Studio SPA Application Controller
  const app = {
    // Application State
    
    state: {
      isAuthenticated: false,
      currentUser: null,
      activeCategory: null,
      activeAspectRatio: 'square',
      activeTemplateStyle: 'premium',
      selectedHistoryBanner: null,
      brandSettings: null,
      generatedCopy: null,
      currentCaptions: {
          whatsapp: '',
          linkedin: ''
      },
      history: []
  },

  
    // Initialize Application
    init: async function() {

        console.log("Initializing BNI Lakshya Banner Studio...");
        this.checkPasswordResetLink(); 

        await this.loadSettings();

        window.onAuthStateChanged(window.firebaseAuth, async (user) => {

            if(user){

                try{

                    const uid = user.uid;

                    const response = await fetch(`/api/user/${uid}`);
                    const userData = await response.json();

                    localStorage.setItem("bni_auth_token", uid);
                    localStorage.setItem("userName", userData.name);
                    localStorage.setItem("userRole", userData.role);
                    localStorage.setItem("userEmail", userData.email);

                    this.state.currentUser = userData;
                    this.state.isAuthenticated = true;

                    document.getElementById("nav-username").textContent = userData.name;

                    document.getElementById("main-nav").classList.remove("hidden");

                    this.setupRoleUI();

                    // if(userData.role === "admin"){
                    //     this.showScreen("screen-history");
                    // }else{
                    //     this.showScreen("screen-select-type");
                    // }

                    if(userData.role === "admin" || userData.role === "superadmin"){
                        this.showScreen("screen-history");
                    }else{
                        this.showScreen("screen-select-type");
                    }

                } catch(error){

                    console.error(error);
                    this.showScreen("screen-login");
                }

            } else {

                this.showScreen("screen-login");
            }
        });
    },

    // Load Admin/Brand Settings
    loadSettings: async function() {
      try {
        this.state.brandSettings = await api.getSettings();
        // Initialize admin settings form if admin script is available
        if (typeof admin !== 'undefined') {
          admin.initFormValues(this.state.brandSettings);
        }
      } catch (err) {
        console.warn('Could not load settings from server. Loading local defaults.');
        this.state.brandSettings = {
          chapterName: 'BNI Lakshya',
          primaryColor: '#CF2030',
          secondaryColor: '#C8C8C8',
          fontPrimary: 'Montserrat',
          fontSecondary: 'Inter',
          footerText: 'BNI Lakshya Pune Chapter • Together Everyone Achieves More',
          defaultVenue: 'Conrad Pune, Mangaldas Rd',
          defaultTime: 'Thursday, 7:15 AM',
          defaultCta: 'DM us to attend as a visitor'
        };
      }
    },


    // handleLogin: async function(event) {

    //     event.preventDefault();
    //     const email = document.getElementById( "email" ).value.trim();
    //     const password = document.getElementById( "password").value;
        
    //     try {
    //         // const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    //         const userCredential = await window.signInWithEmailAndPassword(window.firebaseAuth, email, password);

    //         const uid = userCredential.user.uid;
    //         const response = await fetch(`/api/user/${uid}`);

            


    //         if (response.status === 403) {
    //             utils.showToast("Your account is pending admin approval.");
    //             await window.signOut(firebaseAuth); // also sign them out of Firebase
    //             return;
    //         }

    //         if (!response.ok) {
    //             utils.showToast("Login failed. Please try again.");
    //             await window.signOut(firebaseAuth);
    //             return;
    //         }

    //         const userData = await response.json();

    //         document.getElementById("nav-username").textContent = userData.name;

    //         console.log("Logged User:", userData);
    //         console.log("Role:", userData.role);

    //         // localStorage.setItem("bni_auth_token", user.uid);
    //         localStorage.setItem("bni_auth_token", uid);
    //         localStorage.setItem("userName", userData.name);
    //         localStorage.setItem("userRole", userData.role);
    //         localStorage.setItem("userEmail", userData.email);

    //         this.state.currentUser = userData;

    //         this.setupRoleUI();
    //         document.getElementById("main-nav").classList.remove("hidden");

    //         utils.showToast(`Welcome ${userData.name}`);

    //         if (userData.role === "admin") {
    //             this.showScreen("screen-history");
    //         } else {
    //             this.showScreen("screen-select-type");
    //         }

    //     } catch(error) {

    //         console.error(error);

    //         utils.showToast("Invalid Email or Password" );
    //     }
    // },
    handleLogin: async function(event) {
        event.preventDefault();
        const email    = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            // ✅ STEP 1: Check pending status BEFORE attempting Firebase login
            const checkRes  = await fetch("/api/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const checkData = await checkRes.json();

            if (checkData.isPending) {
                utils.showToast("Your registration is pending admin approval.");
                return;
            }

            // ✅ STEP 2: Only now attempt Firebase login (approved users only)
            const userCredential = await window.signInWithEmailAndPassword(window.firebaseAuth, email, password);
            const uid = userCredential.user.uid;

            const response = await fetch(`/api/user/${uid}`);
            if (!response.ok) {
                utils.showToast("Login failed. Please try again.");
                await window.signOut(window.firebaseAuth);
                return;
            }

            const userData = await response.json();

            document.getElementById("nav-username").textContent = userData.name;
            localStorage.setItem("bni_auth_token", uid);
            localStorage.setItem("userName", userData.name);
            localStorage.setItem("userRole", userData.role);
            localStorage.setItem("userEmail", userData.email);

            this.state.currentUser = userData;
            this.setupRoleUI();
            document.getElementById("main-nav").classList.remove("hidden");
            utils.showToast(`Welcome ${userData.name}`);

            // if (userData.role === "admin") {
            //     this.showScreen("screen-history");
            // } else {
            //     this.showScreen("screen-select-type");
            // }
            if (userData.role === "admin" || userData.role === "superadmin") {
                this.showScreen("screen-history");
            } else {
                this.showScreen("screen-select-type");
            }

        } catch(error) {
            console.error(error);
            utils.showToast("Invalid Email or Password");
        }
    },

    handleRegister: async function(event) {

    event.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const roleSelect = document.getElementById("register-role");
    const role = roleSelect ? roleSelect.value : "member"; // "member" or "admin" — superadmin can't self-register

try {
    const response = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, role })
      });

    const result = await response.json();

    if (result.success) {
        utils.showToast("Registration submitted! Awaiting admin approval.");
        document.getElementById("register-form").reset();
        setTimeout(() => {
            app.showScreen("screen-login");
        }, 1500);
    } else {
        utils.showToast(result.message || "Registration Failed");

        if (result.message && result.message.includes("already pending")) {
            utils.showToast("Your request is already pending. Please wait for admin approval.");
        }
        if (result.message && result.message.includes("already exists")) {
            utils.showToast("Account already exists. Please login.");
            setTimeout(() => app.showScreen("screen-login"), 1500);
        }
    }

  } catch (error) {
      console.error(error);
      utils.showToast(error.message);
    }
},
  

    showForgotPassword: function() {
        app.showScreen("screen-forgot-password");

        document.getElementById("forgot-email").value = "";
        document.getElementById("forgot-new-password").value = "";
        document.getElementById("forgot-confirm-password").value = "";

        // Lock password fields again
        const np = document.getElementById("forgot-new-password");
        const cp = document.getElementById("forgot-confirm-password");
        np.disabled = true; np.style.opacity = "0.4"; np.style.cursor = "not-allowed";
        cp.disabled = true; cp.style.opacity = "0.4"; cp.style.cursor = "not-allowed";

        document.getElementById("forgot-error").classList.add("hidden");
        document.getElementById("forgot-error").textContent = "";
        document.getElementById("forgot-success").classList.add("hidden");
        document.getElementById("forgot-screen-title").textContent = "Reset Password";
        document.getElementById("forgot-screen-subtitle").textContent =
            "Enter your registered email. Password fields will unlock after verification.";

        const btn = document.getElementById("forgot-submit-btn");
        btn.textContent = "Verify Email";
        btn.disabled = false;
        btn.onclick = () => app.handleForgotPassword();
    },

    // FORGOT PASSWORD — Go back to login screen
    hideForgotPassword: function() {
        app.showScreen("screen-login");
    },

    // FORGOT PASSWORD — Clear error when user starts retyping
    // clearForgotError: function() {
    //     const errEl = document.getElementById("forgot-error");
    //     if (errEl) {
    //         errEl.classList.add("hidden");
    //         errEl.textContent = "";
    //     }
    // },
    clearForgotError: function() {
        const errEl = document.getElementById("forgot-error");
        if (errEl) { errEl.classList.add("hidden"); errEl.textContent = ""; }
    },


    handleForgotPassword: async function() {
        const emailInput = document.getElementById("forgot-email");
        const errorEl    = document.getElementById("forgot-error");
        const btn        = document.getElementById("forgot-submit-btn");
        const email      = emailInput.value.trim();

        const showError = (msg) => {
            errorEl.textContent = msg;
            errorEl.classList.remove("hidden");
        };
        const hideError = () => {
            errorEl.classList.add("hidden");
            errorEl.textContent = "";
        };

        if (!email) { showError("Please enter your email address."); return; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { showError("Please enter a valid email address."); return; }

        btn.disabled = true;
        btn.textContent = "Verifying...";
        hideError();

        try {
            const checkRes    = await fetch("/api/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const checkResult = await checkRes.json();

            if (!checkResult.exists) {
                // Email not found → redirect to register
                utils.showToast("No account found. Please register first.");
                setTimeout(() => app.showScreen("screen-register"), 1500);
                btn.disabled = false;
                btn.textContent = "Verify Email";
                return;
            }

            // ✅ Email exists — unlock password fields
            this.state.resetEmail = email;

            const np = document.getElementById("forgot-new-password");
            const cp = document.getElementById("forgot-confirm-password");
            np.disabled = false; np.style.opacity = "1"; np.style.cursor = "text"; np.focus();
            cp.disabled = false; cp.style.opacity = "1"; cp.style.cursor = "text";

            emailInput.disabled = true; // lock email field now
            document.getElementById("forgot-screen-title").textContent = "Set New Password";
            document.getElementById("forgot-screen-subtitle").textContent =
                `Setting new password for: ${email}`;

            btn.textContent = "Update Password";
            btn.disabled = false;
            btn.onclick = () => app.handleConfirmReset(); // switch button action

        } catch (error) {
            btn.disabled = false;
            btn.textContent = "Verify Email";
            console.error("Forgot password error:", error);
            showError("Network error. Please check your connection and try again.");
        }
    },

    // Check URL for oobCode on page load (for password reset flow)
    checkPasswordResetLink: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode      = urlParams.get("mode");
        const oobCode   = urlParams.get("oobCode");

        if (mode === "resetPassword" && oobCode) {
            // Store oobCode for use when user submits new password
            this.state.oobCode = oobCode;
            this.verifyResetCode(oobCode);
        }
    },


    // RESET PASSWORD — Verify the oobCode is valid/not expired
    verifyResetCode: async function(oobCode) {
        // Show the set-password screen immediately
        document.getElementById("main-nav").classList.add("hidden");
        this.showScreen("screen-set-password");

        try {
            // verifyPasswordResetCode returns the email if code is valid
            const email = await window.verifyPasswordResetCode(
                window.firebaseAuth, oobCode
            );
            // Show which email is being reset
            document.getElementById("reset-email-display").textContent =
                `Setting new password for: ${email}`;

        } catch (error) {
            console.error("Invalid reset code:", error);
            // Hide the form, show invalid link message
            document.getElementById("reset-password-form").classList.add("hidden");
            document.getElementById("reset-link-invalid").classList.remove("hidden");
        }
    },


    // RESET PASSWORD — Confirm and save the new password to Firebase Auth

    handleConfirmReset: async function() {
        const newPassword     = document.getElementById("forgot-new-password").value;
        const confirmPassword = document.getElementById("forgot-confirm-password").value;
        const errorEl         = document.getElementById("forgot-error");
        const successEl       = document.getElementById("forgot-success");
        const btn             = document.getElementById("forgot-submit-btn");
        const email           = this.state.resetEmail;

        const showError = (msg) => {
            errorEl.textContent = msg;
            errorEl.classList.remove("hidden");
            successEl.classList.add("hidden");
        };

        if (!newPassword) {
            showError("Please enter a new password.");
            return;
        }
        
        if (newPassword.length < 6) {
            showError("Password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) { 
            showError("Passwords do not match.");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Updating...";

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword })
            });
            const result = await response.json();

            if (result.success) {
                errorEl.classList.add("hidden");
                successEl.classList.remove("hidden");
                // Redirect to login after 2.5s
                setTimeout(() => {
                    this.state.resetEmail = null;
                    this.showForgotPassword(); // resets form
                    app.showScreen("screen-login");
                }, 2500);
            } else {
                showError(result.message || "Failed to update password.");
                btn.disabled = false;
                btn.textContent = "Update Password";
            }

        } catch (error) {
            console.error("Confirm reset error:", error);
            showError("Network error. Please try again.");
            btn.disabled = false;
            btn.textContent = "Update Password";
        }
    },

    clearResetError: function() {
        const el = document.getElementById("reset-error");
        if (el) { el.classList.add("hidden"); el.textContent = ""; }
    },



    // ADMIN — Load all pending member registration requests
    // loadPendingUsers: async function() {
    //     const loadingEl = document.getElementById("users-loading");
    //     loadingEl.classList.remove("hidden");

    //     try {
    //         const response = await fetch("/api/all-users");
    //         const result   = await response.json();
    //         loadingEl.classList.add("hidden");

    //         const pending  = result.users.filter(u => u.status === "pending");
    //         const approved = result.users.filter(u => u.status === "approved");
    //         const rejected = result.users.filter(u => u.status === "rejected");

    //         const fmt = (dateStr) => dateStr
    //             ? new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    //             : "—";

    //         // --- PENDING ---
    //         const pendingTbody = document.getElementById("pending-table-body");
    //         pendingTbody.innerHTML = "";
    //         if (pending.length === 0) {
    //             document.getElementById("pending-empty").classList.remove("hidden");
    //             document.getElementById("pending-table-wrapper").classList.add("hidden");
    //         } else {
    //             document.getElementById("pending-empty").classList.add("hidden");
    //             document.getElementById("pending-table-wrapper").classList.remove("hidden");
    //             pending.forEach(user => {
    //                 const tr = document.createElement("tr");
    //                 tr.innerHTML = `
    //                     <td>${user.name}</td>
    //                     <td>${user.email}</td>
    //                     <td><span class="role-badge">${user.role}</span></td>
    //                     <td>${fmt(user.createdAt)}</td>
    //                     <td class="action-btns">
    //                         <button class="btn-approve" onclick="app.approveUser('${user.id}','${user.name}',this)">✓ Approve</button>
    //                         <button class="btn-reject"  onclick="app.rejectUser('${user.id}','${user.name}',this)">✕ Reject</button>
    //                     </td>
    //                 `;
    //                 pendingTbody.appendChild(tr);
    //             });
    //         }

    //         // --- APPROVED ---
    //         const approvedTbody = document.getElementById("approved-table-body");
    //         approvedTbody.innerHTML = "";
    //         if (approved.length === 0) {
    //             document.getElementById("approved-empty").classList.remove("hidden");
    //             document.getElementById("approved-table-wrapper").classList.add("hidden");
    //         } else {
    //             document.getElementById("approved-empty").classList.add("hidden");
    //             document.getElementById("approved-table-wrapper").classList.remove("hidden");
    //             approved.forEach(user => {
    //                 const tr = document.createElement("tr");
    //                 tr.innerHTML = `
    //                     <td>${user.name}</td>
    //                     <td>${user.email}</td>
    //                     <td><span class="role-badge">${user.role}</span></td>
    //                     <td>${fmt(user.approvedAt || user.createdAt)}</td>
    //                 `;
    //                 approvedTbody.appendChild(tr);
    //             });
    //         }

    //         // --- REJECTED ---
    //         const rejectedTbody = document.getElementById("rejected-table-body");
    //         rejectedTbody.innerHTML = "";
    //         if (rejected.length === 0) {
    //             document.getElementById("rejected-empty").classList.remove("hidden");
    //             document.getElementById("rejected-table-wrapper").classList.add("hidden");
    //         } else {
    //             document.getElementById("rejected-empty").classList.add("hidden");
    //             document.getElementById("rejected-table-wrapper").classList.remove("hidden");
    //             rejected.forEach(user => {
    //                 const tr = document.createElement("tr");
    //                 tr.innerHTML = `
    //                     <td>${user.name}</td>
    //                     <td>${user.email}</td>
    //                     <td><span class="role-badge">${user.role}</span></td>
    //                     <td>${fmt(user.rejectedAt || user.createdAt)}</td>
    //                 `;
    //                 rejectedTbody.appendChild(tr);
    //             });
    //         }

    //     } catch (error) {
    //         console.error("Load users error:", error);
    //         loadingEl.classList.add("hidden");
    //         utils.showToast("Failed to load users.");
    //     }
    // },

// ADMIN — Load all pending member registration requests
loadPendingUsers: async function() {
    const loadingEl = document.getElementById("users-loading");
    loadingEl.classList.remove("hidden");

    try {
        const requesterUid = localStorage.getItem("bni_auth_token") || "";
        const response = await fetch(`/api/all-users?requesterUid=${encodeURIComponent(requesterUid)}`);
        const result   = await response.json();
        loadingEl.classList.add("hidden");

        // Set header text based on role
        const userRole = localStorage.getItem("userRole");
        const titleEl = document.getElementById("approvals-title");
        const subtitleEl = document.getElementById("approvals-subtitle");
        if (userRole === "superadmin") {
            if (titleEl) titleEl.textContent = "Approvals (Members & Admins)";
            if (subtitleEl) subtitleEl.textContent = "Review and manage member and admin registration requests.";
        } else {
            if (titleEl) titleEl.textContent = "Member Approvals";
            if (subtitleEl) subtitleEl.textContent = "Review and manage member registration requests.";
        }

        const pending  = result.users.filter(u => u.status === "pending");
        const approved = result.users.filter(u => u.status === "approved");
        const rejected = result.users.filter(u => u.status === "rejected");

        const fmt = (dateStr) => dateStr
            ? new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "—";

        // --- PENDING ---
        const pendingTbody = document.getElementById("pending-table-body");
        pendingTbody.innerHTML = "";
        if (pending.length === 0) {
            document.getElementById("pending-empty").classList.remove("hidden");
            document.getElementById("pending-table-wrapper").classList.add("hidden");
        } else {
            document.getElementById("pending-empty").classList.add("hidden");
            document.getElementById("pending-table-wrapper").classList.remove("hidden");
            pending.forEach(user => {
                const tr = document.createElement("tr");
                const roleBadge = user.role === "admin"
                    ? `<span class="role-badge role-badge-admin">⚡ Admin Request</span>`
                    : `<span class="role-badge">Member</span>`;
                tr.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${roleBadge}</td>
                    <td>${fmt(user.createdAt)}</td>
                    <td class="action-btns">
                        <button class="btn-approve" onclick="app.approveUser('${user.id}','${user.name}',this)">✓ Approve</button>
                        <button class="btn-reject"  onclick="app.rejectUser('${user.id}','${user.name}',this)">✕ Reject</button>
                    </td>
                `;
                pendingTbody.appendChild(tr);
            });
        }

        // --- APPROVED ---
        const approvedTbody = document.getElementById("approved-table-body");
        approvedTbody.innerHTML = "";
        if (approved.length === 0) {
            document.getElementById("approved-empty").classList.remove("hidden");
            document.getElementById("approved-table-wrapper").classList.add("hidden");
        } else {
            document.getElementById("approved-empty").classList.add("hidden");
            document.getElementById("approved-table-wrapper").classList.remove("hidden");
            approved.forEach(user => {
                const tr = document.createElement("tr");
                const roleBadge = user.role === "admin"
                    ? `<span class="role-badge role-badge-admin">⚡ Admin</span>`
                    : `<span class="role-badge">Member</span>`;
                tr.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${roleBadge}</td>
                    <td>${fmt(user.approvedAt || user.createdAt)}</td>
                `;
                approvedTbody.appendChild(tr);
            });
        }

        // --- REJECTED ---
        const rejectedTbody = document.getElementById("rejected-table-body");
        rejectedTbody.innerHTML = "";
        if (rejected.length === 0) {
            document.getElementById("rejected-empty").classList.remove("hidden");
            document.getElementById("rejected-table-wrapper").classList.add("hidden");
        } else {
            document.getElementById("rejected-empty").classList.add("hidden");
            document.getElementById("rejected-table-wrapper").classList.remove("hidden");
            rejected.forEach(user => {
                const tr = document.createElement("tr");
                const roleBadge = user.role === "admin"
                    ? `<span class="role-badge role-badge-admin">⚡ Admin Request</span>`
                    : `<span class="role-badge">Member</span>`;
                tr.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${roleBadge}</td>
                    <td>${fmt(user.rejectedAt || user.createdAt)}</td>
                `;
                rejectedTbody.appendChild(tr);
            });
        }

    } catch (error) {
        console.error("Load users error:", error);
        loadingEl.classList.add("hidden");
        utils.showToast("Failed to load users.");
    }
},

    // ADMIN — Approve a pending member    
    // approveUser: async function(pendingId, name, btnEl) {
    //     if (!confirm(`Approve ${name}?`)) return;
    //     btnEl.disabled = true;
    //     btnEl.textContent = "Approving...";
    //     try {
    //         const res    = await fetch(`/api/approve-user/${pendingId}`, { method: "POST" });
    //         const result = await res.json();
    //         if (result.success) {
    //             utils.showToast(`✅ ${name} approved.`);
    //             this.loadPendingUsers(); // ✅ full reload — moves to Approved section
    //         } else {
    //             utils.showToast(result.message || "Approval failed.");
    //             btnEl.disabled = false; btnEl.textContent = "✓ Approve";
    //         }
    //     } catch (e) {
    //         utils.showToast("Network error."); btnEl.disabled = false; btnEl.textContent = "✓ Approve";
    //     }
    // },

    // ADMIN — Approve a pending member    
approveUser: async function(pendingId, name, btnEl) {
    if (!confirm(`Approve ${name}?`)) return;
    btnEl.disabled = true;
    btnEl.textContent = "Approving...";
    try {
        const requesterUid = localStorage.getItem("bni_auth_token") || "";
        const res    = await fetch(`/api/approve-user/${pendingId}?requesterUid=${encodeURIComponent(requesterUid)}`, { method: "POST" });
        const result = await res.json();
        if (result.success) {
            utils.showToast(`✅ ${name} approved.`);
            this.loadPendingUsers();
        } else {
            utils.showToast(result.message || "Approval failed.");
            btnEl.disabled = false; btnEl.textContent = "✓ Approve";
        }
    } catch (e) {
        utils.showToast("Network error."); btnEl.disabled = false; btnEl.textContent = "✓ Approve";
    }
},

   
    // ADMIN — Reject a pending member
    // rejectUser: async function(pendingId, name, btnEl) {
    //     if (!confirm(`Reject ${name}'s registration?`)) return;
    //     btnEl.disabled = true;
    //     btnEl.textContent = "Rejecting...";
    //     try {
    //         const res    = await fetch(`/api/reject-user/${pendingId}`, { method: "DELETE" });
    //         const result = await res.json();
    //         if (result.success) {
    //             utils.showToast(`❌ ${name} rejected.`);
    //             this.loadPendingUsers(); // ✅ full reload — moves to Rejected section
    //         } else {
    //             utils.showToast(result.message || "Rejection failed.");
    //             btnEl.disabled = false; btnEl.textContent = "✕ Reject";
    //         }
    //     } catch (e) {
    //         utils.showToast("Network error."); btnEl.disabled = false; btnEl.textContent = "✕ Reject";
    //     }
    // },

    // ADMIN — Reject a pending member
rejectUser: async function(pendingId, name, btnEl) {
    if (!confirm(`Reject ${name}'s registration?`)) return;
    btnEl.disabled = true;
    btnEl.textContent = "Rejecting...";
    try {
        const requesterUid = localStorage.getItem("bni_auth_token") || "";
        const res    = await fetch(`/api/reject-user/${pendingId}?requesterUid=${encodeURIComponent(requesterUid)}`, { method: "DELETE" });
        const result = await res.json();
        if (result.success) {
            utils.showToast(`❌ ${name} rejected.`);
            this.loadPendingUsers();
        } else {
            utils.showToast(result.message || "Rejection failed.");
            btnEl.disabled = false; btnEl.textContent = "✕ Reject";
        }
    } catch (e) {
        utils.showToast("Network error."); btnEl.disabled = false; btnEl.textContent = "✕ Reject";
    }
},
    

    setupRoleUI: function() {
        const role = localStorage.getItem("userRole");

        console.log("Current Role:", role);

        const createBtn = document.getElementById("nav-btn-create");
        const historyBtn = document.getElementById("nav-btn-history");
        const adminBtn = document.getElementById("nav-btn-admin");
        const usersBtn = document.getElementById("nav-btn-users");

        console.log({
            createBtn,
            historyBtn,
            adminBtn,
            usersBtn
        });

        if (role === "superadmin") {
            // Superadmin: full access to everything including Admin Settings
            createBtn?.classList.add("hidden");
            adminBtn?.classList.remove("hidden");
            if (adminBtn) { adminBtn.style.opacity = "1"; adminBtn.title = ""; }
            usersBtn?.classList.remove("hidden");
            historyBtn?.classList.remove("hidden");
        } else if (role === "admin") {
            // Subadmin: can see Admin Settings button but clicking shows permission modal
            createBtn?.classList.add("hidden");
            adminBtn?.classList.remove("hidden");
            if (adminBtn) { adminBtn.style.opacity = "0.6"; adminBtn.title = "Contact your Super Admin for access"; }
            usersBtn?.classList.remove("hidden");
            historyBtn?.classList.remove("hidden");
        } else {
            createBtn?.classList.remove("hidden");
            historyBtn?.classList.remove("hidden");
            adminBtn?.classList.add("hidden");
            usersBtn?.classList.add("hidden");
        }
    },

    // Admin Settings — only superadmin can enter
    showAdminSettings: function() {
        const role = localStorage.getItem("userRole");
        if (role === "superadmin") {
            this.showScreen("screen-admin");
        } else {
            const modal = document.getElementById("modal-permission-denied");
            if (modal) modal.style.display = "flex";
        }
    },

    closePermissionModal: function() {
        const modal = document.getElementById("modal-permission-denied");
        if (modal) modal.style.display = "none";
    },
      
      logout: async function() {

          await window.signOut(window.firebaseAuth);

          localStorage.clear();

          this.state.isAuthenticated = false;
          this.state.currentUser = null;

          document.getElementById("main-nav").classList.add("hidden");
          this.showScreen("screen-login");
          utils.showToast("Logged out successfully");
      },


    // Screen router logic
    showScreen: function(screenId) {
        // const role = localStorage.getItem( "userRole" );

        // if (screenId === "screen-admin" && role !== "admin") {
        //     utils.showToast( "Admin Access Only" );
        //     return;
        // }

        // // if (screenId === "screen-users" && role !== "admin") {
        // //     utils.showToast("Admin Access Only");
        // //     return;
        // // }
        // if (screenId === "screen-admin" && role !== "admin" && role !== "superadmin") {
        //     utils.showToast( "Admin Access Only" );
        //     return;
        // }

        // if (screenId === "screen-users" && role !== "admin" && role !== "superadmin") {
        //     utils.showToast("Admin Access Only");
        //     return;
        // }

        // const screens =document.querySelectorAll(".screen");

        const role = localStorage.getItem( "userRole" );

    if (screenId === "screen-admin" && role !== "superadmin") {
        if (role === "admin") {
            const modal = document.getElementById("modal-permission-denied");
            if (modal) modal.style.display = "flex";
        } else {
            utils.showToast("Admin Access Only");
        }
        return;
    }

    if (screenId === "screen-users" && role !== "admin" && role !== "superadmin") {
        utils.showToast("Admin Access Only");
        return;
    }

    const screens = document.querySelectorAll(".screen");
        
        screens.forEach(s => s.classList.add("hidden"));

        const target = document.getElementById(screenId);

        if(target){
            target.classList.remove("hidden");
            window.scrollTo( 0,0);
        }

        const navBtnMap = {
            "screen-select-type": "nav-btn-create",
            "screen-wizard-form": "nav-btn-create",
            "screen-copy-review": "nav-btn-create",
            "screen-preview-export": "nav-btn-create",
            "screen-history": "nav-btn-history",
            "screen-admin": "nav-btn-admin",
            "screen-users": "nav-btn-users"
          };

        const activeBtnId = navBtnMap[screenId];

        document.querySelectorAll(".nav-link").forEach(btn => {
                btn.classList.remove("active");

                if(btn.id === activeBtnId){
                    btn.classList.add("active");
                }
            });

        //   if(screenId === "screen-history") {
        //       this.loadHistoryList();
        //   }
        if (screenId === "screen-history") {
            this.loadHistoryList();
        }
        if (screenId === "screen-users") {
            this.loadPendingUsers();
        }
        if (screenId === "screen-select-type") {
            const userNameVal = localStorage.getItem("userName") || "User";
            const welcomeUser = document.getElementById("welcome-username");
            if (welcomeUser) welcomeUser.textContent = userNameVal;
        }
    },


    // Start Form Wizard setup
    startWizard: function(category) {
      this.state.activeCategory = category;
      const dynamicContainer = document.getElementById('dynamic-fields');
      const titleEl = document.getElementById('wizard-title');
      const descEl = document.getElementById('wizard-desc');
      const settings = this.state.brandSettings;

      if (!dynamicContainer || !settings) return;

      // Reset validations
      document.getElementById('form-validation-error').classList.add('hidden');

      let html = '';

      if (category === 'visitor_invite') {
        titleEl.textContent = 'Create Visitor Invite Banner';
        descEl.textContent = 'Invite specific business professionals (e.g. Architects, Marketers) to explore connection points.';
        html = `
          <div class="form-group">
            <label for="input-visitor-category">Business Category to Invite *</label>
            <input type="text" id="input-visitor-category" placeholder="e.g. Makeup Artist, Interior Designer, HR Consultant" required>
          </div>
          <div class="form-group">
            <label for="input-opportunities">Opportunities / Target Connectors *</label>
            <textarea id="input-opportunities" rows="3" placeholder="Who can they connect with? e.g. wedding planners, professional photographers, event managers, corporate clients" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label for="input-date">Meeting Date</label>
              <input type="text" id="input-date" value="16th June 2026">
            </div>
            <div class="form-group col">
              <label for="input-time">Meeting Time</label>
              <input type="text" id="input-time" value="${settings.defaultTime || ''}">
            </div>
          </div>
          <div class="form-group">
            <label for="input-venue">Meeting Venue</label>
            <input type="text" id="input-venue" placeholder = "Pune">
          </div>
          <div class="form-group">
            <label for="input-price">Visitor Pass Price (₹)</label>
            <div class="price-input-wrapper">
                <input type="number" id="input-price" placeholder="599" min="599">
            </div>
          </div>
          <div class="form-group">
            <label for="input-cta">What should the button say?</label>
            <input type="text" id="input-cta" value="${settings.defaultCta || ''}">
          </div>
        `;
      } else if (category === 'weekly_meeting') {
        titleEl.textContent = 'Weekly Meeting Invite';
        descEl.textContent = 'Announce and promote the general weekly meeting of BNI Lakshya.';
        html = `
          <div class="form-group">
            <label for="input-visitor-category">Featured Category Focus (Optional)</label>
            <input type="text" id="input-visitor-category" placeholder="e.g. Realtors, Chartered Accountants (Leave blank for generic meeting post)">
          </div>
          <div class="form-group">
            <label for="input-reason">Key Reason to Attend</label>
            <textarea id="input-reason" rows="3" placeholder="e.g. Pitch your business to 50+ Pune business owners, explore structured referrals, and grow direct channels" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label for="input-date">Meeting Date</label>
              <input type="text" id="input-date" value="16th June 2026">
            </div>
            <div class="form-group col">
              <label for="input-time">Meeting Time</label>
              <input type="text" id="input-time" value="${settings.defaultTime || ''}">
            </div>
          </div>
          <div class="form-group">
            <label for="input-venue">Meeting Venue</label>
            <input type="text" id="input-venue" placeholder = "Pune">
          </div>
          <div class="form-group">
            <label for="input-price">Visitor Pass Price (₹)</label>
            <div class="price-input-wrapper">
                <input type="number" id="input-price" placeholder="599" min="599">
            </div>
          </div>

          <div class="form-group">
            <label for="input-cta">CTA Button Text</label>
            <input type="text" id="input-cta" value="${settings.defaultCta || ''}">
          </div>
        `;
      } else if (category === 'feature_presentation') {
        titleEl.textContent = 'Feature Presentation Announcement';
        descEl.textContent = 'Celebrate and announce a member\'s upcoming 10-minute presentation slot.';
        html = `
          <div class="form-row">
            <div class="form-group col">
              <label for="input-speaker-name">Speaker Name *</label>
              <input type="text" id="input-speaker-name" placeholder="e.g. Rohit Sharma" required>
            </div>
            <div class="form-group col">
              <label for="input-company-name">Company Name *</label>
              <input type="text" id="input-company-name" placeholder="e.g. Sharma Architects" required>
            </div>
          </div>
          <div class="form-group">
            <label for="input-visitor-category">Business Category *</label>
            <input type="text" id="input-visitor-category" placeholder="e.g. Landscape Architect, Digital Marketer" required>
          </div>
          <div class="form-group">
            <label for="input-topic">Presentation Topic *</label>
            <input type="text" id="input-topic" placeholder="e.g. Design secrets of high-yield commercial spaces" required>
          </div>
          <div class="form-row">
            <div class="form-group col">
              <label for="input-date">Presentation Date</label>
              <input type="text" id="input-date" value="16th June 2026">
            </div>
            <div class="form-group col">
              <label for="input-time">Meeting Time</label>
              <input type="text" id="input-time" value="${settings.defaultTime || ''}">
            </div>
          </div>
          <div class="form-group">
            <label for="input-venue">Meeting Venue</label>
            <input type="text" id="input-venue" placeholder = "Pune"">
          </div>
          <div class="form-group">
            <label for="input-price">Visitor Pass Price (₹)</label>
            <div class="price-input-wrapper">
                <input type="number" id="input-price" placeholder="599" min="599">
            </div>
          </div>

          <div class="form-group">
            <label for="input-cta">CTA Button Text</label>
            <input type="text" id="input-cta" value="${settings.defaultCta || ''}">
          </div>
        `;
      }

      dynamicContainer.innerHTML = html;
      this.showScreen('screen-wizard-form');
      
      // Focus first input field
      const firstInput = dynamicContainer.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    },

    // Submit wizard form and call backend
    handleFormSubmit: async function(event) {

        event.preventDefault();
        const settings = this.state.brandSettings;
        if (!settings) return;

        const validationFields = [];
        if (this.state.activeCategory === 'visitor_invite') {
            validationFields.push('input-visitor-category', 'input-opportunities');
        } else if (this.state.activeCategory === 'weekly_meeting') {
            validationFields.push('input-reason');
        } else if (this.state.activeCategory === 'feature_presentation') {
            validationFields.push('input-speaker-name', 'input-company-name', 'input-visitor-category', 'input-topic');
        }

        // Client-side validation
        const isValid = utils.validateFormInputs(validationFields);
        const validationError = document.getElementById('form-validation-error');
        
        if (!isValid) {
            validationError.classList.remove('hidden');
            utils.showToast('Please fill in all required fields.');
            return;
        }
        validationError.classList.add('hidden');

        // Collect inputs
        const selectedRatio = document.querySelector('input[name="aspectRatio"]:checked').value;
        this.state.activeAspectRatio = selectedRatio;

        const payload = {
            category: this.state.activeCategory,

            visitorCategory: document.getElementById('input-visitor-category') ? document.getElementById('input-visitor-category').value.trim() : '',

            opportunities: document.getElementById('input-opportunities') ? document.getElementById('input-opportunities').value.trim() : '',

            date: document.getElementById('input-date') ? document.getElementById('input-date').value.trim() : 'Upcoming Thursday',

            time: document.getElementById('input-time') ? document.getElementById('input-time').value.trim() : settings.defaultTime,

            venue: document.getElementById('input-venue') ? document.getElementById('input-venue').value.trim() : settings.defaultVenue,
            visitorPrice: document.getElementById('input-price') ? document.getElementById('input-price').value.trim() : '',

            cta: document.getElementById('input-cta') ? document.getElementById('input-cta').value.trim() : settings.defaultCta,

            // Feature Presentation
            speakerName: document.getElementById('input-speaker-name') ? document.getElementById('input-speaker-name').value.trim() : '',

            companyName: document.getElementById('input-company-name') ? document.getElementById('input-company-name').value.trim() : '',

            topic: document.getElementById('input-topic') ? document.getElementById('input-topic').value.trim() : '',

            // Weekly Meeting
            reason: document.getElementById('input-reason') ? document.getElementById('input-reason').value.trim() : '',

            // USER DETAILS
            userId: localStorage.getItem('bni_auth_token'),
            userName: localStorage.getItem('userName'),
            userEmail: localStorage.getItem('userEmail'),
            userRole: localStorage.getItem('userRole')
            };

            console.log("Payload Sent To API:", payload);

            // Show loading skeleton
            this.showScreen('screen-loading');
            
            // Animate loader text messages dynamically
            this.animateLoaderText();

            try {
                this.state.selectedHistoryBanner = null;
                const result = await api.generateCopy(payload);
                console.log("AI RESULT:", result);
                console.log("AI BULLETS:", result.copy?.bulletPoints);
                console.log("AI HEADLINE:", result.copy?.headline);
                console.log("AI SUBHEADLINE:", result.copy?.subheadline);
                
                if (result.success) {
                    const copy = result.copy;

                    copy.category = this.state.activeCategory;

                    copy.visitorCategory = payload.visitorCategory;
                    copy.opportunities = payload.opportunities;
                    copy.reason = payload.reason;

                    copy.speakerName = payload.speakerName;
                    copy.companyName = payload.companyName;
                    copy.topic = payload.topic;

                    copy.date = payload.date;
                    copy.time = payload.time;
                    copy.venue = payload.venue;
                    copy.cta = payload.cta;
                    copy.visitorPrice = payload.visitorPrice;
                        // Save original form inputs
                    copy.category = this.state.activeCategory;

                    copy.visitorCategory = payload.visitorCategory;
                    copy.opportunities = payload.opportunities;
                    copy.reason = payload.reason;

                    copy.speakerName = payload.speakerName;
                    copy.companyName = payload.companyName;
                    copy.topic = payload.topic;

                    copy.date = payload.date;
                    copy.time = payload.time;
                    copy.venue = payload.venue;
                    copy.cta = payload.cta;
                    this.state.pendingBannerId = result.bannerId || null;
                    this.state.generatedCopy = copy;

                    // Ensure bulletPoints is an array
                if (!Array.isArray(copy.bulletPoints)) {
                    copy.bulletPoints = [
                        'Opportunity 1',
                        'Opportunity 2',
                        'Opportunity 3'
                    ];
                }

                this.state.generatedCopy = copy;

                // Save AI captions
                this.state.currentCaptions.whatsapp =
                    copy.whatsappCaption || "";

                this.state.currentCaptions.linkedin =
                    copy.linkedinCaption || "";

                // Update engine badge
                document.getElementById('ai-engine-used').textContent =
                    result.engine || 'Gemini AI';

                // Show copy review editor
                this.populateCopyReview();
                this.showScreen('screen-copy-review');
            }
        } 
        catch (err) {
                    console.error(err);
                    utils.showToast(err.message || 'API request failed. Try again.');
                    this.showScreen('screen-wizard-form');
                }
    },


    // Animate loading subtitles
    animateLoaderText: function() {
      const subtitles = [
        "Analyzing business networking patterns...",
        "Structuring growth opportunities...",
        "Refining high-impact BNI copywriting guidelines...",
        "Gemini is generating caption variants for WhatsApp and LinkedIn..."
      ];
      let idx = 0;
      const loaderSub = document.getElementById('loader-sub');
      
      if (this.loaderInterval) clearInterval(this.loaderInterval);
      
      this.loaderInterval = setInterval(() => {
        if (!document.getElementById('screen-loading').classList.contains('hidden')) {
          loaderSub.textContent = subtitles[idx];
          idx = (idx + 1) % subtitles.length;
        } else {
          clearInterval(this.loaderInterval);
        }
      }, 1500);
    },

    // Render a bullet point edit row
    // isPlaceholder=true: show text as placeholder (new banner mode)
    // isPlaceholder=false (default): show text as value (edit mode)
    renderPointInputRow: function(text, index, isPlaceholder = true) {
      const pointsList = document.getElementById('edit-points-list');
      const row = document.createElement('div');
      row.className = 'point-input-row';
      row.dataset.index = index;

      const valueAttr = isPlaceholder ? '' : text;
      const placeholderAttr = isPlaceholder ? text : '';

      row.innerHTML = `
          <input type="text" class="point-input" value="${valueAttr}" placeholder="${placeholderAttr}" required>
          <button type="button" class="btn-remove-point" onclick="app.removePointInput(${index})"> ✕</button>
        `;
      pointsList.appendChild(row);
    },

    populateCopyReview: function() {
        const copy = this.state.generatedCopy;
        if (!copy) return;

        document.getElementById('edit-headline').value = copy.headline || '';
        document.getElementById('edit-subheadline').value = copy.subheadline || '';
        document.getElementById('edit-cta').value = copy.cta || '';
        const ctaLinkEl = document.getElementById('edit-cta-link');
        if (ctaLinkEl) {
            ctaLinkEl.value = copy.ctaLink || '';
        }

        const pointsList = document.getElementById('edit-points-list');
        pointsList.innerHTML = '';
        
        copy.bulletPoints.forEach((pt, idx) => {
            this.renderPointInputRow(pt, idx);
        });
    },

    
    // Add new blank row in points editor
    addNewPointInput: function() {
      const pointsList = document.getElementById('edit-points-list');
      const newIdx = pointsList.children.length;
      
      if (newIdx >= 6) {
        utils.showToast('Maximum 6 bullet points allowed for visual sizing.');
        return;
      }
      
      this.renderPointInputRow('', newIdx, false);
    },

    // Remove point input row
    removePointInput: function(index) {
      const row = document.querySelector(`.point-input-row[data-index="${index}"]`);
      if (row) {
        row.remove();
        // Re-index remaining elements
        const rows = document.querySelectorAll('.point-input-row');
        rows.forEach((r, idx) => {
          r.dataset.index = idx;
          const removeBtn = r.querySelector('.btn-remove-point');
          removeBtn.setAttribute('onclick', `app.removePointInput(${idx})`);
        });
      }
    },

    // Proceed from Editor to Visual Canvas Selection
    proceedToTemplateSelection: async function() {
        const copy = this.state.generatedCopy;
        if (!copy) return;

        const headlineEl = document.getElementById('edit-headline');
        const subheadlineEl = document.getElementById('edit-subheadline');
        const ctaEl = document.getElementById('edit-cta');
        const ctaLinkEl = document.getElementById('edit-cta-link');

        copy.headline = headlineEl.value.trim() || headlineEl.placeholder.trim() || copy.headline;
        copy.subheadline = subheadlineEl.value.trim() || subheadlineEl.placeholder.trim() || copy.subheadline;
        copy.cta = ctaEl.value.trim() || ctaEl.placeholder.trim() || copy.cta;
        copy.ctaLink = ctaLinkEl ? ctaLinkEl.value.trim() : '';
        
        const bulletPoints = [];
        document.querySelectorAll('.point-input').forEach(input => {
            // ✅ value hoy to use karo, nahi to placeholder use karo
            const val = input.value.trim() || input.placeholder.trim();
            if (val !== '') bulletPoints.push(val);
        });

        copy.bulletPoints = bulletPoints;
        bannerRenderer.currentCopy = copy;

        this.showScreen('screen-preview-export');
        
        const ratioInfo = {
            'square': '1080 x 1080 px (Square)',
            'portrait': '1080 x 1920 px (Portrait Status)',
            'landscape': '1920 x 1080 px (Landscape 16:9)'
        };
        document.getElementById('preview-dimensions-info').textContent = ratioInfo[this.state.activeAspectRatio];

        bannerRenderer.render(
            this.state.generatedCopy, 
            this.state.brandSettings, 
            this.state.activeTemplateStyle, 
            this.state.activeAspectRatio
        );

        this.updateCaptionsText();
        
        if (this.state.selectedHistoryBanner) {
            await this.saveEditedBanner();
        } else {
            
            setTimeout(async () => {
                const freshBullets = [];
                document.querySelectorAll('.point-input').forEach(input => {
                    const val = input.value.trim() || input.placeholder.trim();
                    if (val) freshBullets.push(val);
                });
                
                const headlineEl = document.getElementById('edit-headline');
                const subheadlineEl = document.getElementById('edit-subheadline');
                const ctaEl = document.getElementById('edit-cta');
                const ctaLinkEl = document.getElementById('edit-cta-link');
                
                app.state.generatedCopy.bulletPoints = freshBullets;
                app.state.generatedCopy.headline = headlineEl?.value.trim() || headlineEl?.placeholder.trim() || app.state.generatedCopy.headline;
                app.state.generatedCopy.subheadline = subheadlineEl?.value.trim() || subheadlineEl?.placeholder.trim() || app.state.generatedCopy.subheadline;
                app.state.generatedCopy.cta = ctaEl?.value.trim() || ctaEl?.placeholder.trim() || app.state.generatedCopy.cta;
                app.state.generatedCopy.ctaLink = ctaLinkEl ? ctaLinkEl.value.trim() : '';
                
                await app.saveNewBanner();
            }, 1500);
        }
    },


    modifyInputs: function () {
            const data = this.state.selectedHistoryBanner?.formData || this.state.selectedHistoryBanner || {};
            const isEditMode = !!this.state.selectedHistoryBanner;


            this.startWizard(this.state.activeCategory);

            setTimeout(() => {

                const fields = {
                    "input-visitor-category": data.visitorCategory || "",
                    "input-opportunities": data.opportunities || "",
                    "input-date": data.date || "",
                    "input-time": data.time || "",
                    "input-venue": data.venue || "",
                    "input-cta": data.cta || "",
                    "input-price": data.visitorPrice || "",
                    "input-speaker-name": data.speakerName || "",
                    "input-company-name": data.companyName || "",
                    "input-topic": data.topic || "",
                    "input-reason": data.reason || ""
                };

                Object.entries(fields).forEach(([id, value]) => {
                    const element = document.getElementById(id);

                        if (element) {
                            element.value = value;
                        } else {
                            console.warn(`Element not found: ${id}`);
                        }
                    });

                const pointsList = document.getElementById("edit-points-list");

                if(pointsList && data.bulletPoints){

                    pointsList.innerHTML = "";

                    data.bulletPoints.forEach((point,index)=>{

                        this.renderPointInputRow( point, index);
                });
            }
        }, 300); // increased from 100ms
    },

    updateCaptionsText: function() {
        const copy = this.state.generatedCopy;
        if (!copy) return;

        const whatsappText =
            copy.whatsappCaption ||
            this.state.currentCaptions.whatsapp ||
            "";

        const linkedinText =
            copy.linkedinCaption ||
            this.state.currentCaptions.linkedin ||
            "";

        document.getElementById("whatsapp-caption-text").value =
            whatsappText;

        document.getElementById("linkedin-caption-text").value =
            linkedinText;

        this.state.currentCaptions.whatsapp = whatsappText;
        this.state.currentCaptions.linkedin = linkedinText;
    },

    // Toggle template styles in sidebar
    changeTemplateStyle: function(styleId) {
      this.state.activeTemplateStyle = styleId;
      
      // Toggle button active state
      document.querySelectorAll('.btn-style').forEach(btn => {
        if (btn.getAttribute('onclick').includes(styleId)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Re-render
      bannerRenderer.render(
        this.state.generatedCopy,
        this.state.brandSettings,
        styleId,
        this.state.activeAspectRatio
      );
    },

    
    exportBannerPng: async function () {
      // const copy = this.state.generatedCopy;
      // ✅ Always sync before export
        bannerRenderer.currentCopy = this.state.generatedCopy;

            console.log("EXPORT STARTED");

            console.log( "STATE BULLETS:", this.state.generatedCopy.bulletPoints);
            console.log("Bullets to save:", this.state.generatedCopy.bulletPoints);
            alert("Bullets: " + JSON.stringify(this.state.generatedCopy.bulletPoints));

            console.log("RENDER BULLETS:", bannerRenderer.currentCopy?.bulletPoints );
            try {
                // Generate banner image
                
                const result = await bannerRenderer.exportPng();

                if (!result?.dataUrl) {
                    throw new Error("Failed to generate banner image");
                }

                // Upload image (Try Local Server First, fall back to Firebase Storage, then direct base64)
                let imageUrl = "";
                try {
                    const uploadRes = await api.uploadImage(result.dataUrl);
                    if (uploadRes && uploadRes.success) {
                        imageUrl = uploadRes.imageUrl;
                    } else {
                        throw new Error("Local server upload failed");
                    }
                } catch (localErr) {
                    console.warn("Local upload failed, trying Firebase Storage:", localErr);
                    try {
                        const fileRef = window.firebaseStorageRef(
                            window.firebaseStorage,
                            `banners/${localStorage.getItem("bni_auth_token")}/${Date.now()}.png`
                        );
                        await window.firebaseUploadString(fileRef, result.dataUrl, "data_url");
                        imageUrl = await window.firebaseGetDownloadURL(fileRef);
                    } catch (storageErr) {
                        console.warn("Storage upload failed, using base64:", storageErr);
                        imageUrl = result.dataUrl; // fallback
                    }
                }

                console.log("Firebase Storage URL:", imageUrl);

                const latestBullets = [];
                document.querySelectorAll(".point-input").forEach(input => {
                    const val = input.value.trim();
                        if(val){
                            latestBullets.push(val);
                        }
                });

            this.state.generatedCopy.bulletPoints = latestBullets;

            const copy = this.state.generatedCopy;
                
            // Create banner history record
            console.log("COPY OBJECT");
            console.log(copy);
            const historyItem = {
                    id: `banner_${Date.now()}`,
                    category: this.state.activeCategory,
                    aspectRatio: this.state.activeAspectRatio,
                    style: this.state.activeTemplateStyle,
                    visitorCategory:
                        this.state.generatedCopy?.visitorCategory || "Invite",
                    timestamp: new Date().toISOString(),
                    bulletPoints: copy.bulletPoints,
                    imageUrl,

                copy: {
                headline: copy.headline || "",
                subheadline: copy.subheadline || "",
                bulletPoints: copy.bulletPoints || [],
                cta: copy.cta || "",
                ctaLink: copy.ctaLink || "",
                visitorPrice: copy.visitorPrice || "",

                visitorCategory: copy.visitorCategory || "",
                opportunities: copy.opportunities || "",
                reason: copy.reason || "",
                speakerName: copy.speakerName || "",
                companyName: copy.companyName || "",
                topic: copy.topic || "",
                date: copy.date || "",
                time: copy.time || "",
                venue: copy.venue || ""
            },
                formData: {
                visitorCategory:
                    document.getElementById("input-visitor-category")?.value || "",

                opportunities:
                    document.getElementById("input-opportunities")?.value || "",
                visitorPrice:
                    document.getElementById("input-price")?.value || "",

                reason:
                    document.getElementById("input-reason")?.value || "",

                speakerName:
                    document.getElementById("input-speaker-name")?.value || "",

                companyName:
                    document.getElementById("input-company-name")?.value || "",

                topic:
                    document.getElementById("input-topic")?.value || "",

                date:
                    document.getElementById("input-date")?.value || "",

                time:
                    document.getElementById("input-time")?.value || "",

                venue:
                    document.getElementById("input-venue")?.value || "",

                cta:
                    document.getElementById("input-cta")?.value || "",
                ctaLink:
                    document.getElementById("edit-cta-link")?.value || copy.ctaLink || ""
            }

        };

        console.log( "Saving Bullets:", bannerRenderer.currentCopy.bulletPoints );
        console.log("HISTORY ITEM");
        console.log(historyItem);
       
        // Save metadata to Firestore

        console.log("FINAL SAVE DATA");
        console.log({
            ...historyItem,
            userId: localStorage.getItem("bni_auth_token"),
            userName: localStorage.getItem("userName"),
            userEmail: localStorage.getItem("userEmail"),
            userRole: localStorage.getItem("userRole")
        });

        await api.saveBanner({
            ...historyItem,
            userId: localStorage.getItem("bni_auth_token"),
            userName: localStorage.getItem("userName"),
            userEmail: localStorage.getItem("userEmail"),
            userRole: localStorage.getItem("userRole")
        });

        utils.showToast("Banner saved successfully!");

        } catch (error) {
            console.error("Banner Export Error:", error);
            utils.showToast("Failed to save banner");
        }
    },


    // Switch tabs on Social Captions
    switchCaptionTab: function(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabId)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (tabId === 'whatsapp') {
        document.getElementById('caption-whatsapp').classList.remove('hidden');
        document.getElementById('caption-linkedin').classList.add('hidden');
      } else {
        document.getElementById('caption-whatsapp').classList.add('hidden');
        document.getElementById('caption-linkedin').classList.remove('hidden');
      }
    },

    // Copy caption text to clipboard
    copyCaption: function(tabId) {
      const textarea = document.getElementById(`${tabId}-caption-text`);
      if (!textarea) return;

      textarea.select();
      textarea.setSelectionRange(0, 99999); // Mobile
      
      navigator.clipboard.writeText(textarea.value)
        .then(() => {
          utils.showToast(`${tabId === 'whatsapp' ? 'WhatsApp' : 'LinkedIn'} caption copied to clipboard!`);
        })
        .catch(() => {
          utils.showToast('Failed to copy. Double-click text to copy manually.');
        });
    },

    // Draw History Items

    loadHistoryList: async function() {
        const uid = localStorage.getItem("bni_auth_token");
        const role = localStorage.getItem("userRole");

        let history = [];

        try {
            // if (role === "admin") {
            //     history = await api.getAllBanners();
            // } else {
            //     history = await api.getUserBanners(uid);
            // }
            // fetch logic
            if (role === "admin" || role === "superadmin") {
                history = await api.getAllBanners();
            } else {
                history = await api.getUserBanners(uid);
            }

            this.state.history = history;

            // Reset input values on load
            const searchInput = document.getElementById("history-search");
            const categorySelect = document.getElementById("history-filter-category");
            const sortSelect = document.getElementById("history-sort-order");
            
            if (searchInput) searchInput.value = "";
            if (categorySelect) categorySelect.value = "all";
            if (sortSelect) sortSelect.value = "desc";

            this.filterHistory();

        } catch (error) {
            console.error("History Load Error:", error);
            utils.showToast("Failed to load banner history");
        }
    },

    filterHistory: function() {
        const searchQuery = document.getElementById("history-search")?.value.toLowerCase().trim() || "";
        const categoryFilter = document.getElementById("history-filter-category")?.value || "all";
        const sortOrder = document.getElementById("history-sort-order")?.value || "desc";

        let filtered = [...(this.state.history || [])];

        // 1. Filter by category
        if (categoryFilter !== "all") {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }

        // 2. Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(item => {
                const visitorCat = (item.visitorCategory || "").toLowerCase();
                const businessCat = (item.businessCategory || "").toLowerCase();
                const headline = (item.copy?.headline || item.headline || "").toLowerCase();
                const subheadline = (item.copy?.subheadline || item.subheadline || "").toLowerCase();
                const speakerName = (item.copy?.speakerName || item.speakerName || "").toLowerCase();
                const topic = (item.copy?.topic || item.topic || "").toLowerCase();
                
                return visitorCat.includes(searchQuery) ||
                       businessCat.includes(searchQuery) ||
                       headline.includes(searchQuery) ||
                       subheadline.includes(searchQuery) ||
                       speakerName.includes(searchQuery) ||
                       topic.includes(searchQuery);
            });
        }

        // 3. Sort by creation date
        filtered.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt._seconds ? a.createdAt._seconds * 1000 : a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt._seconds ? b.createdAt._seconds * 1000 : b.createdAt) : new Date(0);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

        // 4. Render the filtered grid items
        this.renderHistoryGrid(filtered);
    },

    renderHistoryGrid: function(filteredList) {
        const grid = document.getElementById("history-grid");
        const emptyState = document.getElementById("history-empty-state");
        const role = localStorage.getItem("userRole");

        if (!grid || !emptyState) return;

        if (!filteredList || filteredList.length === 0) {
            grid.innerHTML = "";
            grid.classList.add("hidden");
            
            const hasActiveFilters = (document.getElementById("history-search")?.value || "") !== "" ||
                                     (document.getElementById("history-filter-category")?.value || "all") !== "all";
            
            const emptyP = emptyState.querySelector("p");
            const emptyBtn = emptyState.querySelector("button");
            
            if (hasActiveFilters) {
                if (emptyP) emptyP.textContent = "No banners match your active filters.";
                if (emptyBtn) emptyBtn.classList.add("hidden");
            } else {
                if (emptyP) emptyP.textContent = "No banners generated yet. Start creating by clicking the button below.";
                if (emptyBtn) emptyBtn.classList.remove("hidden");
            }
            emptyState.classList.remove("hidden");
            return;
        }

        emptyState.classList.add("hidden");
        grid.classList.remove("hidden");

        // Group history items by creation date
        const groups = {};
        filteredList.forEach(item => {
            let dateObj = null;
            if (item.createdAt) {
                if (item.createdAt._seconds) {
                    dateObj = new Date(item.createdAt._seconds * 1000);
                } else {
                    dateObj = new Date(item.createdAt);
                }
            }
            const dateString = dateObj && !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                : "Draft Banners";
                
            if (!groups[dateString]) {
                groups[dateString] = [];
            }
            groups[dateString].push(item);
        });

        // Render groups with section dividers
        grid.innerHTML = Object.entries(groups).map(([dateLabel, items]) => {
            const groupHeaderHtml = `
                <div class="history-date-group" style="grid-column: 1 / -1; width: 100%; margin-top: 1.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
                    <h3 style="font-family: var(--font-title); color: var(--bni-crimson); font-size: 1.2rem; border-bottom: 2px solid var(--dark-border); padding-bottom: 6px; margin: 0; display: flex; align-items: center; gap: 8px; flex: 1;">
                        <span>📅</span> ${dateLabel}
                        <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 20px; margin-left: 8px;">${items.length} banner${items.length > 1 ? 's' : ''}</span>
                    </h3>
                </div>
            `;

            const cardsHtml = items.map(item => {
                const typeLabel = getHeaderLabel(item.category);
                const categoryTag = item.category || "visitor_invite";
                let cleanDate = "N/A";
                if (item.createdAt) {
                    const d = item.createdAt._seconds ? new Date(item.createdAt._seconds * 1000) : new Date(item.createdAt);
                    if (!isNaN(d.getTime())) {
                        cleanDate = d.toLocaleDateString();
                    }
                }

                // const actions = role === "admin"
                //     ? `
                //         <button class="btn-primary btn-sm" onclick="app.redownloadHistory('${item.id}')"> Download </button>
                //         <button class="btn-text btn-sm" style="color: var(--error);" onclick="app.deleteHistory('${item.id}')"> Delete </button>
                //     `
                //     : `
                //         <button class="btn-primary btn-sm" onclick="app.redownloadHistory('${item.id}')"> Download </button>
                //         <button class="btn-secondary btn-sm" onclick="app.loadHistoryToWorkspace('${item.id}')"> Edit </button>
                //         <button class="btn-text btn-sm" style="color: var(--error);" onclick="app.deleteHistory('${item.id}')"> Delete </button>
                //     `;
                // action buttons
            const actions = (role === "admin" || role === "superadmin")
                ? `
                    <button class="btn-primary btn-sm" onclick="app.redownloadHistory('${item.id}')"> Download </button>
                    <button class="btn-text btn-sm" style="color: var(--error);" onclick="app.deleteHistory('${item.id}')"> Delete </button>
                `
                : `
                    <button class="btn-primary btn-sm" onclick="app.redownloadHistory('${item.id}')"> Download </button>
                    <button class="btn-secondary btn-sm" onclick="app.loadHistoryToWorkspace('${item.id}')"> Edit </button>
                    <button class="btn-text btn-sm" style="color: var(--error);" onclick="app.deleteHistory('${item.id}')"> Delete </button>
                `;

                const thumbnailHtml = item.imageUrl
                    ? `<img src="${item.imageUrl}" class="history-thumb-img" alt="Banner Thumbnail" >`
                    : `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background: linear-gradient(135deg, var(--bni-crimson), var(--bni-granite)); color: white; padding: 20px; text-align: center;">
                            <span style="font-size: 2.2rem; margin-bottom: 6px;">🖼️</span>
                            <span style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-title); line-height: 1.2;">${typeLabel}</span>
                            <span style="font-size: 0.7rem; opacity: 0.8; margin-top: 4px; line-height: 1.2;">Download to view banner</span>
                        </div>
                    `;

                return `
                    <div class="history-card" id="history-card-${item.id}">
                        <div class="history-thumbnail-wrapper">
                            ${thumbnailHtml}
                        </div>
                        <div class="history-card-body">
                            <span class="history-meta-tag ${categoryTag}">
                                ${typeLabel}
                            </span>
                            <h4>
                                ${item.visitorCategory || item.businessCategory || "BNI Banner"}
                            </h4>
                            ${
                                role === "admin"
                                ? `
                                <div class="history-user">
                                    <strong> ${item.userName || "Unknown User"} </strong>
                                    <br>
                                    ${item.userEmail || ""}
                                </div>
                                `
                                : ""
                            }
                            <div class="history-date">
                                Generated: ${cleanDate}
                            </div>
                            <div class="history-card-actions">
                                ${actions}
                            </div>
                        </div>
                    </div>
                `;
            }).join("");

            return `
                ${groupHeaderHtml}
                ${cardsHtml}
            `;
        }).join("");
    },

    updateBentoStats: async function() {
        // No-op - stats removed in simple layout
    },

    populateHistoryData: function(data){

        if(!data) return;

        document.getElementById("input-visitor-category") && (document.getElementById("input-visitor-category").value = data.visitorCategory || "");
        document.getElementById("input-opportunities") && (document.getElementById("input-opportunities").value = data.opportunities || "");
        document.getElementById("input-date") && (document.getElementById("input-date").value = data.date || "");
        document.getElementById("input-time") && (document.getElementById("input-time").value = data.time || "");
        document.getElementById("input-venue") && (document.getElementById("input-venue").value = data.venue || "");
        document.getElementById("input-cta") && (document.getElementById("input-cta").value = data.cta || "");
        document.getElementById("input-speaker-name") && (document.getElementById("input-speaker-name").value = data.speakerName || "");
        document.getElementById("input-company-name") && (document.getElementById("input-company-name").value = data.companyName || "");
        document.getElementById("input-topic") && (document.getElementById("input-topic").value = data.topic || "");
        document.getElementById("input-reason") && (document.getElementById("input-reason").value = data.reason || "");
    },


    // Direct trigger download of history item image
    redownloadHistory: function(id) {
        const item = this.state.history.find(i => i.id === id);
        if (!item) return;


        console.log("History Item:", item);
        console.log("Image URL:", item.imageUrl);
        const link = document.createElement('a');
        // link.download = `BNI_Lakshya_${item.aspectRatio}_${item.visitorCategory.replace(/[^a-zA-Z0-9]/g, '_')}_Redownload.png`;
        const category = item.visitorCategory || item.businessCategory || item.companyName || item.topic || "Banner";
        const ratio = item.aspectRatio || "Square";

        link.download = `BNI_Lakshya_${ratio}_${category.replace(/[^a-zA-Z0-9]/g,'_')}_Redownload.png`;

        // link.download = `BNI_Lakshya_${item.aspectRatio}_${category.replace(/[^a-zA-Z0-9]/g, '_')}_Redownload.png`;
        
        if (!item.imageUrl) {
            utils.showToast("No image saved for this banner");
            return;
        }

        link.href = item.imageUrl;
        link.click();
        utils.showToast('Re-downloaded history banner!');
    },

// saveNewBanner: async function() {
//     const copy = this.state.generatedCopy;

//     try {
//         utils.showToast("Saving banner...");

//         // Upload canvas image to Firebase Storage
//         const result = await bannerRenderer.exportPng();

//         if (!result?.dataUrl) {
//             throw new Error("Failed to generate banner image");
//         }

//         const fileRef = window.firebaseStorageRef(
//             window.firebaseStorage,
//             `banners/${localStorage.getItem("bni_auth_token")}/${Date.now()}.png`
//         );

//         await window.firebaseUploadString(fileRef, result.dataUrl, "data_url");
//         const imageUrl = await window.firebaseGetDownloadURL(fileRef);

//         const historyItem = {
//             id: `banner_${Date.now()}`,
//             category: this.state.activeCategory,
//             aspectRatio: this.state.activeAspectRatio,
//             style: this.state.activeTemplateStyle,
//             visitorCategory: copy.visitorCategory || "Invite",
//             timestamp: new Date().toISOString(),
//             imageUrl,
//             copy: {
//                 headline: copy.headline || "",
//                 subheadline: copy.subheadline || "",
//                 bulletPoints: copy.bulletPoints || [],
//                 cta: copy.cta || ""
//             },
//             formData: {
//                 visitorCategory: copy.visitorCategory || "",
//                 opportunities: copy.opportunities || "",
//                 date: copy.date || "",
//                 time: copy.time || "",
//                 venue: copy.venue || "",
//                 cta: copy.cta || "",
//                 speakerName: copy.speakerName || "",
//                 companyName: copy.companyName || "",
//                 topic: copy.topic || "",
//                 reason: copy.reason || "",
//                 bulletPoints: copy.bulletPoints || []
//             }
//         };

//         await api.saveBanner({
//             ...historyItem,
//             userId: localStorage.getItem("bni_auth_token"),
//             userName: localStorage.getItem("userName"),
//             userEmail: localStorage.getItem("userEmail"),
//             userRole: localStorage.getItem("userRole")
//         });

//         utils.showToast("Banner saved successfully!");

//     } catch (error) {
//         console.error("Save Error:", error);
//         utils.showToast("Failed to save banner");
//     }
// },

    saveNewBanner: async function() {
        console.log("SAVE NEW BANNER CALLED");
        console.log(this.state.generatedCopy);
        const copy = this.state.generatedCopy;

        try {
            utils.showToast("Saving banner...");

            const result = await bannerRenderer.exportPng(false);
            if (!result?.dataUrl) throw new Error("Failed to generate banner image");

            // Upload image (Try Local Server First, fall back to Firebase Storage, then direct base64)
            let imageUrl = "";
            try {
                const uploadRes = await api.uploadImage(result.dataUrl);
                if (uploadRes && uploadRes.success) {
                    imageUrl = uploadRes.imageUrl;
                } else {
                    throw new Error("Local server upload failed");
                }
            } catch (localErr) {
                console.warn("Local upload failed, trying Firebase Storage:", localErr);
                try {
                    const fileRef = window.firebaseStorageRef(
                        window.firebaseStorage,
                        `banners/${localStorage.getItem("bni_auth_token")}/${Date.now()}.png`
                    );
                    await window.firebaseUploadString(fileRef, result.dataUrl, "data_url");
                    imageUrl = await window.firebaseGetDownloadURL(fileRef);
                } catch (storageErr) {
                    console.warn("Storage upload failed, using base64:", storageErr);
                    imageUrl = result.dataUrl; // fallback
                }
            }

            // ✅ Existing record UPDATE karo - navo record nahi banavo
            if (this.state.pendingBannerId) {
                await api.updateBanner(this.state.pendingBannerId, {
                    headline: copy.headline || "",
                    subheadline: copy.subheadline || "",
                    bulletPoints: copy.bulletPoints || [],
                    cta: copy.cta || "",
                    ctaLink: copy.ctaLink || "",
                    imageUrl: imageUrl,
                    formData: {
                        visitorCategory: copy.visitorCategory || "",
                        opportunities: copy.opportunities || "",
                        date: copy.date || "",
                        time: copy.time || "",
                        venue: copy.venue || "",
                        visitorPrice: copy.visitorPrice || "",
                        cta: copy.cta || "",
                        ctaLink: copy.ctaLink || "",
                        speakerName: copy.speakerName || "",
                        companyName: copy.companyName || "",
                        topic: copy.topic || "",
                        reason: copy.reason || "",
                        bulletPoints: copy.bulletPoints || []
                    }
                });
                this.state.pendingBannerId = null;
            }

            utils.showToast("Banner saved successfully!");

        } catch (error) {
            console.error("Save Error:", error);
            utils.showToast("Failed to save banner");
        }
    },




    saveEditedBanner: async function() {

        const copy = this.state.generatedCopy;

        copy.headline = document.getElementById("edit-headline").value;

        copy.subheadline = document.getElementById("edit-subheadline").value;

        copy.cta = document.getElementById("edit-cta").value;
        const ctaLinkEl = document.getElementById("edit-cta-link");
        copy.ctaLink = ctaLinkEl ? ctaLinkEl.value.trim() : '';

        const bulletPoints = [];

        document.querySelectorAll(".point-input")
            .forEach(input => {

                if(input.value.trim()){
                    bulletPoints.push(input.value.trim());
                }
            });

        copy.bulletPoints = bulletPoints;

        await api.updateBanner(
            this.state.selectedHistoryBanner.id,
            {
                headline: copy.headline,
                subheadline: copy.subheadline,
                cta: copy.cta,
                ctaLink: copy.ctaLink,
                visitorPrice: copy.visitorPrice || "",
                bulletPoints: copy.bulletPoints
            }
        );

        utils.showToast("Banner Updated Successfully");
    },

    loadHistoryToWorkspace: function(id) {

        const item = this.state.history.find(i => i.id === id);
        if (!item) return;

        console.log("FULL ITEM =", item);
        console.log("FORM DATA =", item.formData);
        console.log("COPY =", item.copy);


        this.state.activeCategory = item.category;
        this.state.activeAspectRatio = item.aspectRatio;
        this.state.activeTemplateStyle = item.style;

        this.state.selectedHistoryBanner = item;

        // const savedCopy = item.copy || {};
        // const savedFormData = item.formData || {};
        const savedCopy = item.copy || item;
        const savedFormData = item.formData || item;

        this.state.generatedCopy = {
            ...savedCopy,

            visitorCategory: savedFormData.visitorCategory || savedCopy.visitorCategory || "",
            opportunities: savedFormData.opportunities || savedCopy.opportunities || "",
            reason: savedFormData.reason || savedCopy.reason || "",
            speakerName: savedFormData.speakerName || savedCopy.speakerName || "",
            companyName: savedFormData.companyName || savedCopy.companyName || "",
            topic: savedFormData.topic || savedCopy.topic || "",
            date: savedFormData.date || savedCopy.date || "",
            time: savedFormData.time || savedCopy.time || "",
            venue: savedFormData.venue || savedCopy.venue || "",
            visitorPrice: savedFormData.visitorPrice || savedCopy.visitorPrice || "",
            cta: savedFormData.cta || savedCopy.cta || "",
            ctaLink: savedFormData.ctaLink || savedCopy.ctaLink || "",
            bulletPoints: savedFormData.bulletPoints || savedCopy.bulletPoints || []
        };

        console.log("EDIT COPY:", this.state.generatedCopy);
        console.log("VISITOR PRICE:", this.state.generatedCopy.visitorPrice);
        
        this.showScreen("screen-copy-review");

        setTimeout(() => {
            this.populateCopyReview();
        }, 100);

        utils.showToast("Loaded previous banner for editing.");
    },

    populateHistoryForm: function(item){

        const data = item.formData || {};

        const setValue = (id,value) => {

            const el = document.getElementById(id);

            if(el){
                el.value = value || "";
            }
        };

        setValue("input-visitor-category", data.visitorCategory);
        setValue("input-opportunities", data.opportunities);
        setValue("input-date", data.date);
        setValue("input-time", data.time);
        setValue("input-venue", data.venue);
        setValue("input-cta", data.cta);
        setValue("input-speaker-name", data.speakerName);
        setValue("input-company-name", data.companyName);
        setValue("input-topic", data.topic);
        setValue("input-reason", data.reason);
        utils.showToast("Previous banner data loaded");
    },

    // Delete history item
        deleteHistory: async function(id) {

        if(confirm("Are you sure you want to delete this banner?")) {

            await api.deleteBanner(id);

            this.state.history =
                this.state.history.filter(item => item.id !== id);

            this.loadHistoryList();

            utils.showToast("Banner deleted successfully");
        }
    }
};


    // Make app globally accessible for HTML onclick/onsubmit
    window.app = app;


  // Start application when DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    app.init();
  });