document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    const btnRemoveSpaces = document.getElementById('btnRemoveSpaces');
    const btnRemoveLines = document.getElementById('btnRemoveLines');
    const btnLowercase = document.getElementById('btnLowercase');
    const btnUppercase = document.getElementById('btnUppercase');
    const btnCopy = document.getElementById('btnCopy');
    const btnClear = document.getElementById('btnClear');

    // Stats Update
    const updateStats = () => {
        const text = textInput.value;
        charCount.textContent = text.length;
        
        // Count words properly ignoring empty spaces
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        wordCount.textContent = words;
    };

    textInput.addEventListener('input', updateStats);

    // Actions
    btnRemoveSpaces.addEventListener('click', () => {
        if (!textInput.value) return;
        textInput.value = textInput.value.replace(/ +/g, ' ');
        updateStats();
        if (window.showToast) window.showToast('Spazi doppi rimossi!');
    });

    btnRemoveLines.addEventListener('click', () => {
        if (!textInput.value) return;
        textInput.value = textInput.value.replace(/^\s*[\r\n]/gm, '');
        updateStats();
        if (window.showToast) window.showToast('Linee vuote rimosse!');
    });

    btnLowercase.addEventListener('click', () => {
        if (!textInput.value) return;
        textInput.value = textInput.value.toLowerCase();
        if (window.showToast) window.showToast('Testo in minuscolo!');
    });

    btnUppercase.addEventListener('click', () => {
        if (!textInput.value) return;
        textInput.value = textInput.value.toUpperCase();
        if (window.showToast) window.showToast('Testo in maiuscolo!');
    });

    btnCopy.addEventListener('click', async () => {
        if (!textInput.value) return;
        try {
            await navigator.clipboard.writeText(textInput.value);
            if (window.showToast) window.showToast('Testo copiato negli appunti!');
        } catch (err) {
            console.error('Errore durante la copia:', err);
        }
    });

    btnClear.addEventListener('click', () => {
        textInput.value = '';
        updateStats();
        if (window.showToast) window.showToast('Testo svuotato');
    });
});
