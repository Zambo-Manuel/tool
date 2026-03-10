// Utilities condivise per tutto il sito

/**
 * Mostra una notifica toast
 * @param {string} message Il messaggio da mostrare
 */
window.showToast = function(message) {
    let toast = document.getElementById('toast');
    
    // Se non esiste il toast nella pagina (potrebbe non essere stato inserito)
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    // Rimuove il toast dopo 2.5 secondi
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

/**
 * Aggiunge un effetto feedback sul click ai bottoni per migliorare la UI
 * e gestisce il login obbligatorio.
 */

/**
 * Hash SHA-256 in esadecimale
 * @param {string} message
 * @returns {Promise<string>}
 */
async function computeSha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const expectedUser = 'Manuel Zambelli';
const expectedPasswordHash = '32768262cec3c4099acf2a346b8c22909d819b17223fe42347c8f2bbd3e849ba';

function createLoginOverlay() {
    const existing = document.getElementById('login-overlay');
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.className = 'login-overlay';

    const panel = document.createElement('div');
    panel.className = 'login-panel glass-panel';
    panel.innerHTML = `
        <h2>Accesso obbligatorio</h2>
        <p>Inserisci le credenziali per accedere agli strumenti.</p>
        <form id="login-form">
            <label for="login-username">Utente</label>
            <input id="login-username" type="text" placeholder="Manuel Zambelli" required>

            <label for="login-password">Password</label>
            <input id="login-password" type="password" placeholder="********" required>

            <button type="submit" class="btn btn-primary">Entra</button>
            <p id="login-error" class="login-error" aria-live="polite"></p>
        </form>
        <small>Utente: Manuel Zambelli | Password: (hash SHA-256 verificata)</small>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    return overlay;
}

function lockApp() {
    Array.from(document.body.children).forEach(child => {
        if (child.id !== 'login-overlay' && child.id !== 'toast') {
            child.classList.add('hidden');
        }
    });
}

function unlockApp() {
    sessionStorage.setItem('isLoggedIn', 'true');

    Array.from(document.body.children).forEach(child => {
        if (child.id !== 'login-overlay' && child.id !== 'toast') {
            child.classList.remove('hidden');
        }
    });

    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function initLogin() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const overlay = createLoginOverlay();

    if (isLoggedIn) {
        const appSection = document.getElementById('app-content');
        if (appSection) appSection.classList.remove('hidden');
        overlay.classList.add('hidden');
        return;
    }

    lockApp();

    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', async event => {
        event.preventDefault();

        const enteredUser = usernameInput.value.trim();
        const enteredPass = passwordInput.value;
        const enteredHash = await computeSha256(enteredPass);

        if (enteredUser === expectedUser && enteredHash === expectedPasswordHash) {
            loginError.textContent = '';
            showToast('Accesso consentito. Benvenuto, Manuel!');
            unlockApp();
        } else {
            loginError.textContent = 'Credenziali non valide. Riprova.';
            showToast('Accesso negato. Controlla utente/password');
            passwordInput.value = '';
        }
    });
}

/**
 * Aggiunge un effetto feedback sul click ai bottoni per migliorare la UI
 */
document.addEventListener('DOMContentLoaded', () => {
    initLogin();

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
});
