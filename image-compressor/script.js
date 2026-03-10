document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalSizeEl = document.getElementById('originalSize');
    const compressedSizeEl = document.getElementById('compressedSize');
    const btnDownload = document.getElementById('btnDownload');
    const btnReset = document.getElementById('btnReset');
    const loader = document.getElementById('loader');
    const outputFormat = document.getElementById('outputFormat');
    const qualityRange = document.getElementById('qualityRange');
    const qualityValue = document.getElementById('qualityValue');

    let currentCompressedBlob = null;
    let originalFileName = '';
    let originalFileType = '';

    // Drag & Drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if(files.length > 0) handleFile(files[0]);
    });

    imageInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    qualityRange.addEventListener('input', () => {
        qualityValue.textContent = Math.round(qualityRange.value * 100) + '%';
    });

    // Formatting bytes
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFile = (file) => {
        if (!file.type.match('image/(jpeg|png|webp|svg\+xml)')) {
            if (window.showToast) window.showToast('Per favore carica un formato valido (JPG, PNG, WEBP o SVG)');
            return;
        }

        originalFileName = file.name;
        originalFileType = file.type;
        originalSizeEl.textContent = formatBytes(file.size);

        // Mostra loader e nascondi la zona di drop
        dropZone.style.display = 'none';
        loader.classList.add('active');

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const outputType = outputFormat.value === 'original' ? file.type : outputFormat.value;

            if (file.type === 'image/svg+xml' && outputType === 'image/svg+xml') {
                currentCompressedBlob = file;
                compressedSizeEl.textContent = formatBytes(file.size);
                compressedPreview.src = URL.createObjectURL(file);
                loader.classList.remove('active');
                previewContainer.style.display = 'flex';
                if (window.showToast) window.showToast('SVG pronto per il download.');
                return;
            }

            if (file.type === 'image/svg+xml' && outputType !== 'image/svg+xml') {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    compressImage(img, file.type);
                };
                return;
            }

            if (outputType === 'image/svg+xml') {
                // Non possiamo convertire immagine raster in SVG con il canvas.
                loader.classList.remove('active');
                dropZone.style.display = 'block';
                if (window.showToast) window.showToast('Conversione raster → SVG non supportata. Scegli un altro formato.');
                return;
            }

            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                compressImage(img, file.type);
            };
        };
    };

    const compressImage = (img, fileType) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Imposta dimensioni originali
        canvas.width = img.width;
        canvas.height = img.height;

        // Disegna l'immagine sul canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let outType = outputFormat.value === 'original' ? fileType : outputFormat.value;
        let quality = parseFloat(qualityRange.value);

        if (outType === 'original') outType = fileType;

        if (outType === 'image/png') {
            // conversione in png non usa quality in toBlob
            quality = 1;
        }

        if (outType === 'image/svg+xml') {
            // Non supportato con canvas (raster -> svg). fallback
            loader.classList.remove('active');
            dropZone.style.display = 'block';
            if (window.showToast) window.showToast('Impossibile convertire da raster a SVG. Scegli altro.');
            return;
        }

        if (outType === 'image/jpeg' || outType === 'image/webp') {
            // se richiesta qualità bassa applica.
            quality = Math.max(0.1, Math.min(1, quality));
        } else {
            quality = 1;
        }

        canvas.toBlob((blob) => {
            if (!blob) {
                loader.classList.remove('active');
                if (window.showToast) window.showToast('Errore durante la compressione.');
                return;
            }

            currentCompressedBlob = blob;
            compressedSizeEl.textContent = formatBytes(blob.size);

            // Imposta l'anteprima
            compressedPreview.src = URL.createObjectURL(blob);

            // Nascondi loader e mostra risultati con animazione
            loader.classList.remove('active');
            previewContainer.style.display = 'flex';

            if (window.showToast) window.showToast('Immagine compressa/convertita con successo!');

        }, outType, quality);
    };

    btnDownload.addEventListener('click', () => {
        if (!currentCompressedBlob) return;
        const url = URL.createObjectURL(currentCompressedBlob);
        const a = document.createElement('a');
        
        // Costruisci il nuovo nome file (es. image-compressed.webp)
        const nameParts = originalFileName.split('.');
        nameParts.pop(); // Rimuovi estensione originale
        const ext = currentCompressedBlob.type.replace('image/', '');
        const newFileName = `${nameParts.join('.')}-compressed.${ext}`;

        a.href = url;
        a.download = newFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    btnReset.addEventListener('click', () => {
        // Reset dell'interfaccia
        imageInput.value = '';
        currentCompressedBlob = null;
        previewContainer.style.display = 'none';
        dropZone.style.display = 'block';
    });
});
