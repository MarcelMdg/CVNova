/* ------ THEME GLOBAL (in.html) ------ */
function toggleTheme(){
  const html=document.documentElement;
  const next=html.getAttribute('data-theme')==='dark'?'light':'dark';
  html.setAttribute('data-theme',next);
  localStorage.setItem('theme',next);
}
(()=>document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'dark'))();

/* ------ REVEAL (in.html) ------ */
const io=new IntersectionObserver((e)=>e.forEach((el)=>{if(el.isIntersecting){el.target.classList.add('show');io.unobserve(el.target)}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach((el)=>io.observe(el));

/* ------ DRAWER MOBILE (in.html) ------ */
function toggleDrawer(){document.getElementById('drawer').classList.toggle('open')}
function closeDrawer(){document.getElementById('drawer').classList.remove('open')}

/* ---------- NAV CV (cvs.html) ---------- */
const toForm = document.getElementById('toForm');
const toPreview = document.getElementById('toPreview');
const formPage = document.getElementById('formPage');
const previewPage = document.getElementById('previewPage');
toForm.addEventListener('click', ()=>{ 
    formPage.style.display='block'; 
    previewPage.style.display='none'; 
    toForm.classList.remove('btn-cv-secondary');
    toForm.classList.add('btn-cv-primary');
    toPreview.classList.remove('btn-cv-primary');
    toPreview.classList.add('btn-cv-secondary');
});
toPreview.addEventListener('click', ()=>{ 
    fillCV(); // Appel de fillCV avant la prévisualisation
    if(validate()){
        formPage.style.display='none'; 
        previewPage.style.display='block'; 
        window.scrollTo(0,0); 
        toForm.classList.remove('btn-cv-primary');
        toForm.classList.add('btn-cv-secondary');
        toPreview.classList.remove('btn-cv-secondary');
        toPreview.classList.add('btn-cv-primary');
    }
});

/* ---------- THEME CV (cvs.html) ---------- */
const themeSelect = document.getElementById('themeSelect');
themeSelect.addEventListener('change', e=> document.body.dataset.cvTheme = e.target.value);

/* ---------- LOCAL-STORAGE (cvs.html) ---------- */
const FORM_KEYS = ['fullName','title','city','email','phone','profile','education','exp','skills','tools','langs','hobbies'];
function saveForm(){
  const data = {};
  FORM_KEYS.forEach(k=> data[k] = document.getElementById(k).value);
  data.cvTheme = document.body.dataset.cvTheme;
  localStorage.setItem('cvData', JSON.stringify(data));
}
function restoreForm(){
  const raw = localStorage.getItem('cvData');
  if(!raw) return;
  const data = JSON.parse(raw);
  FORM_KEYS.forEach(k=>{ if(data[k]) document.getElementById(k).value = data[k] });
  if(data.cvTheme){ 
      document.body.dataset.cvTheme = data.cvTheme; 
      themeSelect.value = data.cvTheme; 
  }
}
window.addEventListener('beforeunload', saveForm);
document.addEventListener('DOMContentLoaded', restoreForm);

/* ---------- PHOTO (cvs.html) ---------- */
const photoInput = document.getElementById('photoInput');
const cvPhoto = document.getElementById('cvPhoto');
let photoDataURL = '';
photoInput.addEventListener('change', e=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev=>{ 
    photoDataURL = ev.target.result; 
    cvPhoto.src = photoDataURL; 
    // Sauvegarde non nécessaire ici, elle est faite dans saveForm() avant unload
  };
  reader.readAsDataURL(f);
});

/* ---------- VALIDATION & FILL (cvs.html) ---------- */
function validate(){
  const ok = ['fullName','title','email'].every(id=> document.getElementById(id).value.trim()!=='');
  if(!ok){ alert('Veuillez remplir au minimum Nom, Titre et Email.'); return false; }
  return true;
}
function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); }


/* ----- FONCTIONS DE NETTOYAGE AMÉLIORÉES ----- */

/**
 * Normalise le texte brut pour le nettoyage (espaces, séparateurs multiples).
 * @param {string} str - La chaîne de caractères brute.
 * @returns {string} La chaîne nettoyée.
 */
function normalizeInput(str) {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, ' ') // Réduit les multiples espaces à un seul
    .replace(/[|,;]+/g, sep => sep.includes(';') ? ';' : ',') // Uniformise les séparateurs (ici, préfère la virgule si ambigu)
    .replace(/\|+/g, ','); // Remplace les barres verticales par des virgules
}

/**
 * Met en majuscule la première lettre de chaque mot (Title Case).
 * @param {string} str - La chaîne de caractères.
 * @returns {string} La chaîne formatée.
 */
function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(function(word) {
    if (word.length < 3) return word; 
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}


/* ===== RENDU LISTES (Version Améliorée) ===== */
function fillList(ul, raw, sep){
  const normalized = raw ? raw.trim() : '';
  const items = normalized.split(sep).map(s => s.trim()).filter(Boolean);
  clear(ul);

  if (items.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Aucune information renseignée.';
    li.style.fontStyle = 'italic';
    li.style.color = 'var(--muted)';
    ul.appendChild(li);
    return;
  }

  // Formation / Expérience
  if (ul.id === 'cvEducation' || ul.id === 'cvExperience') {
    items.forEach(item => {
      const li = document.createElement('li');
      // Séparateur spécifique : ' – '
      const parts = item.split(' – ');
      if (parts.length >= 2) {
        const title = parts[0];
        const detail = parts.slice(1).join(' – ');
        li.innerHTML = `<strong>${title}</strong><br><em>${detail}</em>`;
      } else {
        li.textContent = item;
      }
      ul.appendChild(li);
    });
    return;
  }

  // Compétences : tags (avec Title Case)
  if (ul.id === 'cvSkills') {
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.display = 'flex';
    ul.style.flexWrap = 'wrap';
    ul.style.gap = '6px';
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = toTitleCase(item); 
      // Les styles sont dans cv.css, on ne les met pas ici.
      ul.appendChild(li);
    });
    return;
  }

  // Autres listes : Contact, Outils, Langues, Hobbies
  ul.style.listStyle = 'none';
  ul.style.paddingLeft = '0';
  const li = document.createElement('li');
  li.style.marginBottom = '4px';
  li.style.fontSize = '12px';
  li.style.color = 'var(--cv-text-light)';
  
  const formattedItems = items.map(item => toTitleCase(item));
  
  if (ul.id === 'cvTools' || ul.id === 'cvHobbies') {
      li.innerHTML = formattedItems.join('<br>');
  } else if (ul.id === 'cvLangs') {
      li.textContent = formattedItems.join(' – ');
  } else {
      // Pour les contacts (city, email, phone) qui sont gérés séparément dans fillCV
      li.textContent = items.join(', ');
  }
  ul.appendChild(li);
}

function fillCV(){
  const get = id=> document.getElementById(id).value || '';
  document.getElementById('cvName').textContent = get('fullName');
  document.getElementById('cvTitle').textContent = get('title');
  document.getElementById('cvCity').textContent = get('city');
  document.getElementById('cvEmail').textContent = get('email');
  document.getElementById('cvPhone').textContent = get('phone') || 'Non renseigné';
  document.getElementById('cvProfile').textContent = get('profile');
  fillList(document.getElementById('cvEducation'), get('education'), '&#10;'); // Séparateur de retour à la ligne
  fillList(document.getElementById('cvExperience'), get('exp'), '&#10;'); // Séparateur de retour à la ligne
  fillList(document.getElementById('cvSkills'), get('skills'), ',');
  fillList(document.getElementById('cvTools'), get('tools'), ';');
  fillList(document.getElementById('cvLangs'), get('langs'), ' – '); 
  fillList(document.getElementById('cvHobbies'), get('hobbies'), ',');
  cvPhoto.src = photoDataURL || 'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="var(--cv-accent)" text-anchor="middle" dominant-baseline="middle">Photo</text></svg>');
}


/* ---------- NOTIFICATION EXEMPLE (cvs.html) ---------- */
const exampleNotification = document.getElementById('exampleNotification');
const exampleTitle = document.getElementById('exampleTitle');
const exampleContent = document.getElementById('exampleContent');
const useExampleBtn = document.getElementById('useExampleBtn');
let currentTargetId = null; 

/**
 * Affiche la notification d'exemple avec le contenu spécifique.
 * @param {string} title - Titre du champ (ex: "Profil").
 * @param {string} content - Le contenu de l'exemple.
 * @param {string} targetId - L'ID du champ à remplir si l'utilisateur utilise l'exemple.
 */
function showExampleNotification(title, content, targetId) {
    exampleTitle.textContent = `Exemple pour : ${title}`;
    // Remplacer les retours à la ligne par des <br> pour la prévisualisation dans la notification
    exampleContent.innerHTML = content.replace(/\n/g, '<br>').replace(/&#10;/g, '<br>');
    currentTargetId = targetId;
    exampleNotification.classList.add('show');
}

/**
 * Cache la notification d'exemple.
 */
function hideExampleNotification() {
    exampleNotification.classList.remove('show');
    currentTargetId = null;
}

// Lier la fonction de fermeture au bouton X et au clic en dehors (si implémenté)
// Ici, on utilise la méthode onclick dans le HTML pour plus de simplicité.

// Lier la fonction pour utiliser l'exemple au bouton principal
useExampleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentTargetId) {
        const targetElement = document.getElementById(currentTargetId);
        // On récupère la valeur originale avec les séparateurs exacts (&#10; pour textarea)
        const exampleValue = targetElement.getAttribute('data-example');
        
        if (targetElement && exampleValue !== null) { 
            // 1. Remplir le champ avec la valeur d'exemple
            // On remplace le &#10; de l'HTML par le vrai retour à la ligne (\n) pour les textareas
            targetElement.value = exampleValue.replace(/&#10;/g, '\n');
            
            // 2. Sauvegarder immédiatement
            saveForm(); 
            
            // 3. Fermer la notification
            hideExampleNotification();
            
            // 4. Mettre le focus
            targetElement.focus();
        }
    }
});


/* ---------- MISE À JOUR DES BOUTONS EXEMPLE CONTEXTUELS ---------- */

/**
 * Gère le clic sur les liens "Voir l'exemple" contextuels.
 * Affiche la notification d'exemple au lieu de remplir directement le champ.
 */
document.querySelectorAll('.btn-context-example').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const targetId = button.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const exampleValue = targetElement.getAttribute('data-example');
            
            // Récupérer le label pour le titre de la notification
            const labelElement = targetElement.previousElementSibling;
            const labelText = labelElement && labelElement.tagName === 'LABEL' ? labelElement.textContent.replace('*', '').trim() : targetId;

            if (exampleValue !== null) { 
                // Afficher l'exemple dans la notification
                showExampleNotification(labelText, exampleValue, targetId);
            }
        }
    });
});


/* ---------- BTNS (cvs.html) ---------- */
document.getElementById('generate').addEventListener('click', ()=>{ 
    fillCV(); 
    if(validate()){ 
        formPage.style.display='none'; 
        previewPage.style.display='block'; 
        window.scrollTo(0,0);
        toForm.classList.remove('btn-cv-primary');
        toForm.classList.add('btn-cv-secondary');
        toPreview.classList.remove('btn-cv-secondary');
        toPreview.classList.add('btn-cv-primary');
    }
});
document.getElementById('editBtn').addEventListener('click', ()=>{ 
    formPage.style.display='block'; 
    previewPage.style.display='none'; 
    window.scrollTo(0,0);
    toForm.classList.remove('btn-cv-secondary');
    toForm.classList.add('btn-cv-primary');
    toPreview.classList.remove('btn-cv-primary');
    toPreview.classList.add('btn-cv-secondary');
});

document.getElementById('printBtn').addEventListener('click', ()=> window.print());

/* ---------- INIT (cvs.html) ---------- */
formPage.style.display='block'; 
previewPage.style.display='none';
restoreForm();
