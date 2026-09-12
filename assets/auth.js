// Supabase client + magic-link auth for The Polyglot Press.
const SUPABASE_URL = "https://voasuuxmmmcnzqucvocq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvYXN1dXhtbW1jbnpxdWN2b2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDE5MjksImV4cCI6MjEwNDcxNzkyOX0.s68RmRsgAnpND4_CxYYd8R4krXVBRNOOKyXdb0OgL_8";
const ADMIN_EMAILS = ["diyorilhomoff@gmail.com"];

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

async function signInWithEmail(email) {
  const cleanUrl = window.location.origin + window.location.pathname;
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: cleanUrl }
  });
  if (error) throw error;
}

async function signOut() {
  await supabaseClient.auth.signOut();
}

async function isAdmin() {
  const session = await getSession();
  return !!(session && ADMIN_EMAILS.includes(session.user.email));
}

function setupAuthUI() {
  const authBtn = document.getElementById("authBtn");
  const authModal = document.getElementById("authModal");
  const authModalClose = document.getElementById("authModalClose");
  const authSubmit = document.getElementById("authSubmit");
  const authEmailInput = document.getElementById("authEmailInput");
  const authSentMsg = document.getElementById("authSentMsg");

  async function refreshAuthUI() {
    const session = await getSession();
    if (!authBtn) return;
    if (session) {
      authBtn.textContent = session.user.email.split("@")[0] + " ▾";
      authBtn.onclick = async () => {
        if (confirm("Sign out of " + session.user.email + "?")) { await signOut(); refreshAuthUI(); }
      };
    } else {
      authBtn.textContent = "Sign in";
      authBtn.onclick = () => authModal.classList.add("show");
    }
  }
  refreshAuthUI();

  if (authModalClose) authModalClose.addEventListener("click", () => authModal.classList.remove("show"));
  if (authModal) authModal.addEventListener("click", (e) => { if (e.target.id === "authModal") authModal.classList.remove("show"); });
  if (authSubmit) {
    authSubmit.addEventListener("click", async () => {
      const email = authEmailInput.value.trim();
      if (!email || !email.includes("@")) { alert("Enter a valid email."); return; }
      authSubmit.disabled = true; authSubmit.textContent = "Sending...";
      try { await signInWithEmail(email); authSentMsg.style.display = "block"; }
      catch (e) { alert("Error: " + e.message); }
      finally { authSubmit.disabled = false; authSubmit.textContent = "Send magic link"; }
    });
  }
  supabaseClient.auth.onAuthStateChange(() => refreshAuthUI());
}

document.addEventListener("DOMContentLoaded", setupAuthUI);
