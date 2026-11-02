import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  linkWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const passwordStyle = document.createElement("style");
passwordStyle.textContent = `
  body.hk-auth-screen > :not(#hkWelcome) {
    display: none !important;
  }
  #hkWelcome {
    position: fixed;
    inset: 0;
    z-index: 100000;
    overflow-y: auto;
  }
  .hk-google-g {
    font-size: 23px;
    font-weight: 800;
    background: conic-gradient(#4285F4, #34A853, #FBBC05, #EA4335, #4285F4);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  #hkWelcome .hk-password-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  #hkWelcome .hk-password-row input {
    flex: 1;
    min-width: 0;
  }
  #hkWelcome .hk-password-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 42px;
    border: 1px solid #dbe3ec;
    border-radius: 10px;
    background: white;
    color: #14213d;
  }
`;
document.head.append(passwordStyle);

const auth = getAuth(app);
const welcome = document.getElementById("hkWelcome");
const appParts = [...document.querySelectorAll("body > header, body > main, body > nav, body > #settings, body > #chatDlg, body > footer, body > #hkSplash")];

window.hkMainAuth = {
  async setPassword(password) {
    const user = auth.currentUser;
    if (!user) throw new Error("Please sign in first.");
    if (!user.email) throw new Error("This account has no email address.");

    if (user.providerData.some(provider => provider.providerId === "password")) {
      throw new Error("This account already has a Hellokin password. Use password sign-in or password recovery.");
    }

    if (password.length < 6) {
      throw new Error("Your password must contain at least 6 characters.");
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await linkWithCredential(user, credential);
    return true;
  },

  async signOut() {
    await signOut(auth);
    if (welcome) {
      welcome.hidden = false;
      appParts.forEach(el => el.hidden = true);
    }
  }
};


if (welcome) {
  const showWelcome = () => {
    document.body.classList.add("hk-auth-screen");
    welcome.hidden = false;
    appParts.forEach(el => el.hidden = true);
  };

  const showApp = () => {
    document.body.classList.remove("hk-auth-screen");
    welcome.hidden = true;
    appParts.forEach(el => el.hidden = false);
    if (typeof window.showScreen === "function") window.showScreen("home");
  };

  function render(message = "") {
    welcome.innerHTML = `
      <div style="min-height:100vh;display:grid;place-items:center;padding:20px;box-sizing:border-box">

        <section id="welcomeLogin" class="card" style="width:100%;max-width:420px;padding:24px;box-sizing:border-box">
          <h1 style="text-align:center">Hellokin</h1>
          <p class="muted" style="text-align:center">Connect, share, and discover.</p>
          <h2>Welcome back</h2>

          <form id="welcomeLoginForm">
            <label for="welcomeLoginEmail">Email</label>
            <input id="welcomeLoginEmail" type="email" autocomplete="email" required style="width:100%;box-sizing:border-box">

            <label for="welcomeLoginPassword">Password</label>
            <div class="hk-password-row">
              <input id="welcomeLoginPassword" type="password" autocomplete="current-password" required style="flex:1;min-width:0">
              <button class="hk-password-toggle" id="welcomeLoginToggle" type="button" aria-label="Show password">👁</button>
            </div>

            <p id="welcomeLoginMessage" class="muted" role="status"></p>
            <button type="submit" style="width:100%">Sign in</button>
          </form>

          <button id="welcomeOpenCreate" type="button" style="width:100%;margin-top:10px">Create account</button>
          <button id="welcomeGoogle" type="button" style="width:100%;margin-top:10px;background:#fff;color:#14213d;border:1px solid #dbe3ec;display:flex;align-items:center;justify-content:center;gap:10px"><span class="hk-google-g">G</span>Continue with Google</button>
        </section>

        <section id="welcomeRegister" class="card" hidden style="width:100%;max-width:420px;padding:24px;box-sizing:border-box">
          <h1 style="text-align:center">Hellokin</h1>
          <p class="muted" style="text-align:center">Join the community.</p>
          <h2>Create your account</h2>

          <form id="welcomeRegisterForm" autocomplete="off">
            <label for="welcomeRegisterEmail">Email</label>
            <input id="welcomeRegisterEmail" name="hellokin-new-email" type="email" autocomplete="section-hk-register email" required style="width:100%;box-sizing:border-box">

            <label for="welcomeRegisterPassword">Create password (at least 6 characters)</label>
            <div class="hk-password-row">
              <input id="welcomeRegisterPassword" name="hellokin-new-password" type="password" autocomplete="section-hk-register new-password" minlength="6" required style="flex:1;min-width:0">
              <button class="hk-password-toggle" id="welcomeRegisterToggle" type="button" aria-label="Show password">👁</button>
            </div>

            <p id="welcomeRegisterMessage" class="muted" role="status">Use an email you can open to verify your account.</p>
            <button type="submit" style="width:100%">Create account</button>
          </form>

          <button id="welcomeBackToLogin" type="button" style="width:100%;margin-top:12px">Back to Sign in</button>
        </section>

      </div>`;

    const loginScreen = document.getElementById("welcomeLogin");
    const registerScreen = document.getElementById("welcomeRegister");
    const loginForm = document.getElementById("welcomeLoginForm");
    const registerForm = document.getElementById("welcomeRegisterForm");
    const loginMessage = document.getElementById("welcomeLoginMessage");
    const registerMessage = document.getElementById("welcomeRegisterMessage");

    function openLogin(message = "") {
      loginScreen.hidden = false;
      registerScreen.hidden = true;
      loginMessage.textContent = message;
    }

    function openRegister() {
      loginScreen.hidden = true;
      registerScreen.hidden = false;
      registerMessage.textContent = "Use an email you can open to verify your account.";
    }

    function setupPasswordToggle(inputId, buttonId) {
      const input = document.getElementById(inputId);
      const button = document.getElementById(buttonId);

      button.addEventListener("click", () => {
        const showing = input.type === "text";
        input.type = showing ? "password" : "text";
        button.textContent = showing ? "👁" : "🙈";
        button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      });
    }

    setupPasswordToggle("welcomeLoginPassword", "welcomeLoginToggle");
    setupPasswordToggle("welcomeRegisterPassword", "welcomeRegisterToggle");

    document.getElementById("welcomeOpenCreate").addEventListener("click", openRegister);
    document.getElementById("welcomeBackToLogin").addEventListener("click", () => openLogin());

    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      const email = document.getElementById("welcomeLoginEmail").value.trim();
      const password = document.getElementById("welcomeLoginPassword").value;

      loginMessage.textContent = "Please wait…";

      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);

        if (!credential.user.emailVerified) {
          await signOut(auth);
          loginMessage.textContent = "Please verify your email first, then sign in again.";
        }
      } catch (error) {
        loginMessage.textContent = error.message || "Sign-in failed. Please try again.";
      }
    });

    registerForm.addEventListener("submit", async e => {
      e.preventDefault();
      const email = document.getElementById("welcomeRegisterEmail").value.trim();
      const password = document.getElementById("welcomeRegisterPassword").value;

      registerMessage.textContent = "Creating your account…";

      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(credential.user);
        await signOut(auth);
        registerForm.reset();
        openLogin("Verification email sent to " + email + ". Verify it, then sign in.");
      } catch (error) {
        registerMessage.textContent = error.message || "Account creation failed. Please try again.";
      }
    });

    document.getElementById("welcomeGoogle").addEventListener("click", async () => {
      loginMessage.textContent = "Opening Google sign-in…";

      try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        if (result.user) showApp();
      } catch (error) {
        loginMessage.textContent = (error.code || "Google error") + ": " + (error.message || "Please try again.");
      }
    });
  }

  render();
  showWelcome();

  onAuthStateChanged(auth, user => {
    if (user && user.emailVerified) showApp();
    else showWelcome();
  });

}
