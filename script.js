/**
 * ApexFit - Interactive Application Logic
 * Features: Mobile Nav, Scroll Effects, Dual Unit BMI & Calorie Calculator,
 * Schedule Filtering, Modal Dialog Manager, Lead Capture & Toast System.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCalculator();
  initSchedule();
  initModal();
  initLeadCapture();
});

/* ==========================================================================
   1. Navbar & Mobile Menu
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky navbar on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  // Active navigation link highlighting on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (targetLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetLink.classList.add('active');
        } else {
          targetLink.classList.remove('active');
        }
      }
    });
  });
}

/* ==========================================================================
   2. Interactive BMI & Calorie Calculator
   ========================================================================== */
function initCalculator() {
  const metricBtn = document.getElementById('unit-metric');
  const imperialBtn = document.getElementById('unit-imperial');
  const metricInputs = document.querySelectorAll('.unit-metric-field');
  const imperialInputs = document.querySelectorAll('.unit-imperial-field');
  const calcForm = document.getElementById('calc-form');

  let currentUnit = 'metric'; // 'metric' or 'imperial'

  // Unit Toggle
  metricBtn.addEventListener('click', () => {
    if (currentUnit === 'metric') return;
    currentUnit = 'metric';
    metricBtn.classList.add('active');
    imperialBtn.classList.remove('active');
    metricInputs.forEach(el => el.style.display = 'block');
    imperialInputs.forEach(el => el.style.display = 'none');
    calculate();
  });

  imperialBtn.addEventListener('click', () => {
    if (currentUnit === 'imperial') return;
    currentUnit = 'imperial';
    imperialBtn.classList.add('active');
    metricBtn.classList.remove('active');
    metricInputs.forEach(el => el.style.display = 'none');
    imperialInputs.forEach(el => el.style.display = 'block');
    calculate();
  });

  // Calculate Handler
  calcForm.addEventListener('input', calculate);
  calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  function calculate() {
    const gender = document.getElementById('calc-gender').value;
    const age = parseFloat(document.getElementById('calc-age').value) || 25;
    const activity = parseFloat(document.getElementById('calc-activity').value) || 1.55;

    let heightCm = 0;
    let weightKg = 0;

    if (currentUnit === 'metric') {
      heightCm = parseFloat(document.getElementById('calc-height-cm').value);
      weightKg = parseFloat(document.getElementById('calc-weight-kg').value);
    } else {
      const feet = parseFloat(document.getElementById('calc-height-ft').value) || 0;
      const inches = parseFloat(document.getElementById('calc-height-in').value) || 0;
      const weightLbs = parseFloat(document.getElementById('calc-weight-lbs').value) || 0;

      const totalInches = (feet * 12) + inches;
      heightCm = totalInches * 2.54;
      weightKg = weightLbs * 0.453592;
    }

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return;

    // BMI Calculation
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const roundedBmi = bmi.toFixed(1);

    // BMR Calculation (Mifflin-St Jeor)
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // TDEE & Goal Calories
    const tdee = Math.round(bmr * activity);
    const fatLossCal = Math.max(1200, Math.round(tdee - 500));
    const maintenanceCal = tdee;
    const muscleGainCal = Math.round(tdee + 400);

    // Determine BMI Category & Color
    let category = 'Normal Weight';
    let color = '#CCFF00'; // neon lime

    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#38bdf8'; // light blue
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Optimal Fitness';
      color = '#CCFF00'; // neon lime
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight';
      color = '#fbbf24'; // amber
    } else {
      category = 'High Risk';
      color = '#ff5722'; // vibrant orange
    }

    // Update DOM
    const gaugeValue = document.getElementById('bmi-value');
    const gaugeBadge = document.getElementById('bmi-category');
    const gaugeProgress = document.getElementById('gauge-progress-bar');
    const calFatLoss = document.getElementById('cal-fat-loss');
    const calMaintain = document.getElementById('cal-maintain');
    const calMuscle = document.getElementById('cal-muscle');

    gaugeValue.textContent = roundedBmi;
    gaugeValue.style.color = color;
    gaugeBadge.textContent = category;
    gaugeBadge.style.color = color;
    gaugeBadge.style.borderColor = color;
    gaugeBadge.style.backgroundColor = `${color}20`;

    calFatLoss.textContent = `${fatLossCal} kcal`;
    calMaintain.textContent = `${maintenanceCal} kcal`;
    calMuscle.textContent = `${muscleGainCal} kcal`;

    // Update SVG meter
    const percentage = Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100));
    const maxOffset = 283;
    const currentOffset = maxOffset - ((percentage / 100) * (maxOffset / 2));
    gaugeProgress.style.stroke = color;
    gaugeProgress.style.strokeDashoffset = currentOffset;
  }

  // Initial calculation
  calculate();
}

/* ==========================================================================
   3. Filterable Schedule & Timetable
   ========================================================================== */
function initSchedule() {
  const dayPills = document.querySelectorAll('.day-pill');
  const typePills = document.querySelectorAll('.type-pill');
  const scheduleCards = document.querySelectorAll('.schedule-card');

  let activeDay = 'all';
  let activeType = 'all';

  function filterSchedule() {
    scheduleCards.forEach(card => {
      const cardDays = card.getAttribute('data-days').split(' ');
      const cardType = card.getAttribute('data-type');

      const matchesDay = activeDay === 'all' || cardDays.includes(activeDay);
      const matchesType = activeType === 'all' || cardType === activeType;

      if (matchesDay && matchesType) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        setTimeout(() => {
          card.style.opacity = '1';
        }, 50);
      } else {
        card.style.display = 'none';
      }
    });
  }

  dayPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dayPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeDay = pill.getAttribute('data-day');
      filterSchedule();
    });
  });

  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeType = pill.getAttribute('data-type');
      filterSchedule();
    });
  });

  // Book Spot button handlers
  const bookBtns = document.querySelectorAll('.btn-book-class');
  bookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const className = btn.getAttribute('data-class');
      openTrialModal(`Book Session: ${className}`);
    });
  });
}

/* ==========================================================================
   4. Modal Dialog Manager
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('trial-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const planSelect = document.getElementById('modal-plan-select');
  const modalForm = document.getElementById('modal-trial-form');

  // Trigger buttons across page
  const trialTriggers = document.querySelectorAll('.open-trial-modal');
  trialTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || '7-Day Free Pass';
      openTrialModal(`Start Your Free Trial`, plan);
    });
  });

  window.openTrialModal = function(title, plan = 'pro') {
    if (modal) {
      if (modalTitle) modalTitle.textContent = title;
      if (planSelect && plan) {
        planSelect.value = plan;
      }
      modal.showModal();
    }
  };

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.close());

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      const dialogDimensions = modal.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        modal.close();
      }
    });
  }

  // Modal Form Submission
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modal-name').value;
      modal.close();
      modalForm.reset();
      showToast(`Welcome ${name}! Your 7-day VIP pass has been sent to your email. 🔥`);
    });
  }
}

/* ==========================================================================
   5. Lead Capture & Toast Notification System
   ========================================================================== */
function initLeadCapture() {
  const guideForm = document.getElementById('guide-download-form');
  if (guideForm) {
    guideForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = guideForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        showToast(`Success! Your 7-Day Workout & Nutrition Protocol has been dispatched to ${emailInput.value}! 🚀`);
        guideForm.reset();
      }
    });
  }
}

function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}