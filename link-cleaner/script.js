document.addEventListener('DOMContentLoaded', () => {
    const linkInput = document.getElementById('linkInput');
    const linkSlug = document.getElementById('linkSlug');
    const btnClean = document.getElementById('btnClean');
    const btnShorten = document.getElementById('btnShorten');
    const resultContainer = document.getElementById('resultContainer');
    const cleanedLinkEl = document.getElementById('cleanedLink');
    const shortenedLinkEl = document.getElementById('shortenedLink');
    const shortSection = document.getElementById('shortSection');
    const btnCopyLink = document.getElementById('btnCopyLink');
    const btnCopyShort = document.getElementById('btnCopyShort');
    const btnGenerateQR = document.getElementById('btnGenerateQR');
    const qrSource = document.getElementById('qrSource');
    const qrContainer = document.getElementById('qrContainer');
    const qrCodeImage = document.getElementById('qrCodeImage');

    // Embed Short.io configuration in code (no manual settings panel)
    const shortIoApiKey = 'sk_wIB0hTNRL6XteAJi';
    const shortIoDomain = 'link.manuelzambelli.it';

    // Optional: se vuoi mantenere fallback, puoi inserire qui una logica per leggere da localStorage
    // e validare che la chiave sia impostata correttamente.


    // Lista di parametri di tracking noti da rimuovere
    const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'ref', 'fbclid', 'gclid', 'msclkid', 'igshid', 'ttclid', 'mc_cid', 'mc_eid'
    ];

    const cleanUrl = (urlStr) => {
        try {
            let processedStr = urlStr.trim();
            if (!/^https?:\/\//i.test(processedStr)) {
                processedStr = 'https://' + processedStr;
            }
            const url = new URL(processedStr);
            const params = new URLSearchParams(url.search);
            trackingParams.forEach(param => params.delete(param));
            url.search = params.toString();
            return url.toString();
        } catch (e) {
            return null;
        }
    };

    const showResult = (cleaned, shortened = null) => {
        cleanedLinkEl.textContent = cleaned;
        resultContainer.classList.add('active');
        resultContainer.style.opacity = '0';
        resultContainer.style.transform = 'translateY(10px)';
        
        if (shortened) {
            shortenedLinkEl.textContent = shortened;
            shortSection.style.display = 'block';
            btnCopyShort.style.display = 'inline-flex';
        } else {
            shortSection.style.display = 'none';
            btnCopyShort.style.display = 'none';
        }

        // Reset QR area quando cambia il link
        qrContainer.style.display = 'none';
        qrCodeImage.src = ''; 

        setTimeout(() => {
            resultContainer.style.transition = 'all 0.4s ease';
            resultContainer.style.opacity = '1';
            resultContainer.style.transform = 'translateY(0)';
        }, 50);
    };

    btnClean.addEventListener('click', () => {
        const urlStr = linkInput.value.trim();
        if (!urlStr) return;
        const cleaned = cleanUrl(urlStr);
        if (cleaned) {
            showResult(cleaned);
            if (window.showToast) window.showToast('Link pulito!');
        } else {
            if (window.showToast) window.showToast('Inserisci un URL valido!');
        }
    });

    btnShorten.addEventListener('click', async () => {
        const urlStr = linkInput.value.trim();
        const slug = linkSlug.value.trim();

        if (!urlStr) {
             if (window.showToast) window.showToast('Inserisci un URL!');
             return;
        }
        if (!shortIoApiKey || !shortIoDomain || shortIoApiKey === 'YOUR_SHORTIO_API_KEY' || shortIoDomain === 'YOUR_SHORTIO_DOMAIN') {
            if (window.showToast) window.showToast('Imposta le credenziali Short.io direttamente nel codice!');
            return;
        }

        const cleaned = cleanUrl(urlStr);
        if (!cleaned) {
            if (window.showToast) window.showToast('URL non valido!');
            return;
        }

        btnShorten.disabled = true;
        btnShorten.innerHTML = '<div class="loader active"></div> Attendi...';

        try {
            const response = await fetch('https://api.short.io/links', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'authorization': shortIoApiKey
                },
                body: JSON.stringify({
                    originalURL: cleaned,
                    domain: shortIoDomain,
                    path: slug || undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                showResult(cleaned, data.shortURL);
                if (window.showToast) window.showToast('Link accorciato con successo!');
            } else {
                console.error('Short.io Error:', data);
                if (window.showToast) window.showToast('Errore Short.io: ' + (data.error || 'Riprova'));
            }
        } catch (error) {
            console.error('Fetch error:', error);
            if (window.showToast) window.showToast('Errore di connessione API');
        } finally {
            btnShorten.disabled = false;
            btnShorten.textContent = 'Pulisci & Accorcia (Short.io)';
        }
    });

    btnGenerateQR.addEventListener('click', () => {
        const source = qrSource.value;
        const targetLink = (source === 'short' && shortenedLinkEl.textContent) ? shortenedLinkEl.textContent : cleanedLinkEl.textContent;

        if (!targetLink || targetLink.trim() === '') {
            if (window.showToast) window.showToast('Nessun link disponibile per QR. Pulisci/linka prima!');
            return;
        }

        const encoded = encodeURIComponent(targetLink);
        qrCodeImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encoded}`;
        qrContainer.style.display = 'block';
        if (window.showToast) window.showToast('QR Code generato!');
    });

    const copyToClipboard = async (text, msg) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            if (window.showToast) window.showToast(msg);
        } catch (err) {
            console.error('Errore durante la copia:', err);
        }
    };

    btnCopyLink.addEventListener('click', () => copyToClipboard(cleanedLinkEl.textContent, 'Link pulito copiato!'));
    btnCopyShort.addEventListener('click', () => copyToClipboard(shortenedLinkEl.textContent, 'Link corto copiato!'));
});
