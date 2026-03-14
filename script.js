
const SUPABASE_URL = "https://lzkdumueekzvbuzixslu.supabase.co";  
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6a2R1bXVlZWt6dmJ1eml4c2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTY3NDAsImV4cCI6MjA4NzYzMjc0MH0.uRUggmuJUl6pF-JARMV_fdeLoX75_heTCuABGoO5ipo";   

let supabaseClient;
try {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.error("Supabase initialization failed:", err);
}


// 2. Custom popup function (loading, success, error, no-internet)

function showPopup(message, type = 'info') {

  const existing = document.querySelector('.custom-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = `custom-popup ${type}`;

  let iconHTML = '';
  if (type === 'loading') {
    iconHTML = '<div class="spinner"></div>';
  } else if (type === 'success') {
    iconHTML = '<i class="fas fa-check-circle"></i>';
  } else if (type === 'error') {
    iconHTML = '<i class="fas fa-exclamation-circle"></i>';
  } else if (type === 'warning') {
    iconHTML = '<i class="fas fa-wifi-slash"></i>';
  }

  popup.innerHTML = `
    <div class="popup-content">
      ${iconHTML}
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(popup);

  // Auto-remove after delay (except loading popup)
  if (type !== 'loading') {
    setTimeout(() => {
      popup.classList.add('fade-out');
      setTimeout(() => popup.remove(), 500);
    }, 2800);
  }

  return popup; 
}


function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking any nav link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    });
  });

  // Close when clicking outside menu/hamburger
  document.addEventListener('click', e => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    }
  });
}


// 4. Contact form handler with popups

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check internet connection first
    if (!navigator.onLine) {
      showPopup("No internet connection. Please check your network.", "warning");
      return;
    }

    // Show loading popup
    const loadingPopup = showPopup("Sending message...", "loading");

    // Collect form data
    const data = {
      name: document.getElementById('name')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      phone_number: document.getElementById('phone')?.value.trim() || null,
      message: document.getElementById('message')?.value.trim() || '',
      read_status: false,
      sent_at: new Date().toISOString(),
    };

    try {
      if (!supabaseClient) {
        throw new Error("Supabase client is not available");
      }

      const { error } = await supabaseClient
        .from('messages')           
        .insert([data]);

      if (error) throw error;

      // Success
      loadingPopup.remove();
      showPopup("Message sent successfully!", "success");
      form.reset();

    } catch (err) {
      console.error("Form submission error:", err);
      loadingPopup.remove();
      showPopup("Failed to send message. Please try again.", "error");
    }
  });
}


// Initialize everything when page is ready

document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  initContactForm();
});