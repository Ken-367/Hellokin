import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const passwordStyle = document.createElement("style");
passwordStyle.textContent = `
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

if (welcome) {
  const showWelcome = () => {
    welcome.hidden = false;
    appParts.forEach(el => el.hidden = true);
  };

  const showApp = () => {
    welcome.hidden = true;
    appParts.forEach(el => el.hidden = false);
    if (typeof window.showScreen === "function") window.showScreen("home");
  };

  function render(message = "") {
    welcome.innerHTML = `
      <div class="card" style="max-width:420px;margin:30px auto;padding:24px">
        <h1 style="text-align:center">Hellokin</h1>
        <p class="muted" style="text-align:center">Connect, share, and discover.</p>
        <h2 id="welcomeHeading">Welcome back</h2>
        <form id="welcomeForm">
          <label for="welcomeEmail">Email</label>
          <input id="welcomeEmail" type="email" autocomplete="email" required>
          <label for="welcomePassword">Password (at least 6 characters)</label>
          <div class="hk-password-row">
            <input id="welcomePassword" type="password" autocomplete="current-password" minlength="6" required style="flex:1;min-width:0">
            <button class="hk-password-toggle" id="welcomePasswordToggle" type="button" aria-label="Show password" title="Show password">👁</button>
          </div>
          <p id="welcomeMessage" class="muted" role="status"></p>
          <button type="submit" style="width:100%">Sign in</button>
        </form>
        <button id="welcomeCreate" type="button" style="width:100%;margin-top:10px">Create account</button>
        <button id="welcomeSignIn" type="button" style="width:100%;margin-top:10px">Already have an account? Sign in</button>
        <button id="welcomeGoogle" type="button" style="width:100%;margin-top:10px;background:#fff;color:#14213d;border:1px solid #dbe3ec">Continue with Google</button>
        <p class="muted" style="text-align:center;margin-top:16px">New accounts must verify their email before signing in.</p>
      </div>`;
    const form = document.getElementById("welcomeForm");
    const heading = document.getElementById("welcomeHeading");
    const msg = document.getElementById("welcomeMessage");
  document.getElementById("welcomePasswordToggle").addEventListener("click", () => {
    const password = document.getElementById("welcomePassword");
    const showing = password.type === "password";
    password.type = showing ? "text" : "password";
    const button = document.getElementById("welcomePasswordToggle");
    button.textContent = showing ? "🙈" : "👁";
    button.setAttribute("aria-label", showing ? "Hide password" : "Show password");
    button.title = showing ? "Hide password" : "Show password";
  });

    const create = document.getElementById("welcomeCreate");
    let mode = "in";

    document.getElementById("welcomeSignIn").addEventListener("click", () => {
      mode = "in";
      heading.textContent = "Welcome back";
      form.querySelector('button[type="submit"]').textContent = "Sign in";
      msg.textContent = "";
      document.getElementById("welcomePassword").autocomplete = "current-password";
    });

    create.addEventListener("click", () => {
      mode = "up";
      heading.textContent = "Create your account";
      form.querySelector('button[type="submit"]').textContent = "Create account";
      msg.textContent = "Use an email you can open to verify your account.";
      document.getElementById("welcomePassword").autocomplete = "new-password";
    });

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const email = document.getElementById("welcomeEmail").value.trim();
      const password = document.getElementById("welcomePassword").value;
      msg.textContent = "Please wait…";
      try {
        if (mode === "up") {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          await sendEmailVerification(credential.user);
          await signOut(auth);
          mode = "in";
          heading.textContent = "Check your email";
          msg.textContent = "Verification email sent to " + email + ". Verify it, then sign in.";
          form.querySelector('button[type="submit"]').textContent = "Sign in";
        } else {
          const credential = await signInWithEmailAndPassword(auth, email, password);
          if (!credential.user.emailVerified) {
            await signOut(auth);
            msg.textContent = "Please verify your email first, then sign in again.";
            return;
          }
        }
      } catch (error) {
        msg.textContent = error.message || "Authentication failed. Please try again.";
      }
    });

    document.getElementById("welcomeGoogle").addEventListener("click", async () => {
      msg.textContent = "Opening Google sign-in…";
      try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        if (result.user) showApp();
      } catch (error) {
        msg.textContent = error.message || "Google sign-in failed. Please try again.";
      }
    });
  }

  render();
  showWelcome();

  onAuthStateChanged(auth, user => {
    if (user && user.emailVerified) showApp();
    else showWelcome();
  });

  window.hkMainAuth = {
    async signOut() {
      await signOut(auth);
      showWelcome();
    }
  };
}
