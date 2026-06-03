
let partyTrack, ambientTrack, glitchSFX, staticSFX; 
let isMuted = false;

function initAudio() {
    if (!partyTrack) {
        partyTrack = new Audio('assets/audio/party_rabteu.mp3');
        partyTrack.loop = true;
        partyTrack.volume = 0; 

        staticSFX = new Audio('assets/audio/static_effect.mp3');
        staticSFX.loop = true;
        staticSFX.volume = 0;

        glitchSFX = new Audio('assets/audio/glitch_effect.mp3');

        document.getElementById('master-vol-slider').addEventListener('input', (e) => {
            const masterVol = e.target.value;
            if(!isMuted) {
                if(ambientTrack) ambientTrack.volume = masterVol * 0.2;
                if(staticSFX && !staticSFX.paused) {
                    const currentFreq = parseFloat(document.getElementById('freq-val').innerText);
                    updateTuningAudio(currentFreq);
                }
            }
        });
    }
}

function playGlitch() {
    if (glitchSFX && !isMuted) {
        glitchSFX.currentTime = 0;
        glitchSFX.volume = 0.3;
        glitchSFX.play();
    }
}

window.onload = () => {
    gsap.to("#main-logo-intro", { opacity: 1, duration: 2, onComplete: () => {
        setTimeout(() => {
            gsap.to("#main-logo-intro", { opacity: 0, duration: 1, onComplete: () => {
                document.getElementById('screen-intro').classList.remove('active');
                document.getElementById('screen-start').classList.add('active');
            }});
        }, 3000);
    }});
};

async function startNarration() {
    document.getElementById('screen-start').classList.remove('active');
    document.getElementById('screen-narration').classList.add('active');
    
    initAudio(); 
    
    ambientTrack = new Audio('assets/audio/ambient_loop.mp3');
    ambientTrack.loop = true;
    ambientTrack.volume = 0.3;
    ambientTrack.play().catch(() => {});

    const txtContainer = document.getElementById('narration-text');
    txtContainer.textContent = ""; 
    
    const frase1 = "Te has encontrado un dispositivo extraño en el suelo de una fiesta...";
    const frase2 = " tiene un botón con una luz que no deja de par配r, parece que de allí se enciende...";

    for(let char of frase1) {
        txtContainer.textContent += char;
        await new Promise(r => setTimeout(r, 55)); 
    }

    await new Promise(r => setTimeout(r, 1800));

    for(let char of frase2) {
        txtContainer.textContent += char;
        await new Promise(r => setTimeout(r, 55));
    }

    document.getElementById('narration-choices').style.display = 'block';
}

function triggerDeath() {
    const death = document.getElementById('death-screen');
    death.style.display = 'flex';
    playGlitch();
    gsap.to(death, {
        duration: 0.1, repeat: 10, opacity: 0.5, yoyo: true,
        onComplete: () => {
            death.innerText = "";
            death.style.background = "#000";
            death.style.opacity = 1;
        }
    });
}

function bootDevice() {
    document.getElementById('screen-narration').classList.remove('active');
    document.getElementById('screen-mobile').classList.add('active');
    
    if (ambientTrack) ambientTrack.volume = 0.1;
    initClock();
    
    let percent = 0;
    const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 12) + 3;
        if (percent >= 100) {
            percent = 100;
            clearInterval(interval);
            setTimeout(() => switchView('view-radar'), 1000);
        }
        document.getElementById('boot-percent').innerText = percent + "%";
    }, 200);
}

function searchFrequencies() {
    const container = document.getElementById('radar-container');
    if(staticSFX) {
        staticSFX.volume = 0;
        staticSFX.play().catch(() => {});
        gsap.to(staticSFX, { volume: 0.2, duration: 1.5 });
    }

    for(let i=0; i<8; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.style.cssText = `position:absolute; width:8px; height:8px; background:var(--cobalt); border-radius:50%; top:${Math.random()*85}%; left:${Math.random()*85}%;`;
            container.appendChild(p);
            gsap.to(p, { opacity: 0, scale: 3, duration: 0.6, onComplete: () => p.remove() });
        }, i * 400);
    }
    setTimeout(() => {
        playGlitch();
        document.getElementById('mobile-alert').style.display = 'block';
    }, 3500);
}

function goToTuning() {
    document.getElementById('mobile-alert').style.display = 'none';
    switchView('view-tuning');
    partyTrack.play().catch(() => {});

    const dial = document.getElementById('radial-dial');
    const knob = document.getElementById('dial-knob-indicator');
    const freqDisplay = document.getElementById('freq-val');

    let isDragging = false;

    function processRotation(e) {
        const rect = dial.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const pointerX = e.clientX - centerX;
        const pointerY = e.clientY - centerY;

        let angle = Math.atan2(pointerY, pointerX) * (180 / Math.PI);
        angle = angle + 90; 
        if (angle < 0) angle += 360;

        const calculatedFrequency = (angle / 360) * 100;

        knob.style.transform = `rotate(${angle}deg)`;
        freqDisplay.innerText = calculatedFrequency.toFixed(1) + " Hz";

        updateTuningAudio(calculatedFrequency);
    }

    dial.addEventListener('pointerdown', (e) => {
        isDragging = true;
        dial.setPointerCapture(e.pointerId);
        processRotation(e);
    });

    dial.addEventListener('pointermove', (e) => {
        if (isDragging) processRotation(e);
    });

    dial.addEventListener('pointerup', (e) => {
        if (isDragging) {
            isDragging = false;
            dial.releasePointerCapture(e.pointerId);
        }
    });
}

function updateTuningAudio(val) {
    if(!partyTrack) return;
    const masterVol = document.getElementById('master-vol-slider').value;
    const distance = Math.abs(val - 66.6);
    const tunedText = document.getElementById('tuned-text-display');
    const enterBtn = document.getElementById('tuned-enter-btn');

    if(!isMuted) {
        staticSFX.volume = Math.min(distance / 80, 0.25);
        partyTrack.volume = Math.max(0, (masterVol * 0.8) - (distance / 15));
    }

    if(val >= 66.0 && val <= 67.2) {
        tunedText.classList.add('active');
        enterBtn.classList.add('active');
        document.getElementById('track-status').innerText = "📡 SEÑAL IDENTIFICADA";
        document.getElementById('track-info').innerText = "PARTY - RABTEU, EPHESIS";
        document.getElementById('master-play-btn').style.display = "block";
    } else {
        tunedText.classList.remove('active');
        enterBtn.classList.remove('active');
        document.getElementById('track-status').innerText = "ESPERANDO SEÑAL...";
        document.getElementById('master-play-btn').style.display = "none";
    }
}

async function startChatSequence() {
    switchView('view-chat');
    const container = document.getElementById('chat-container-inner');
    container.innerHTML = "";
    
    const msgs = [
        "Conexión establecida...",
        "¿Me escuchas...?",
        "Soy el agente R-BTU...",
        "Si recibes esto, es porque tu mente aún es libre...",
        "La colonia ya está aquí. No vienen a destruir la ciudad...",
        "Soy el Agente R-BTU. He burlado el bloqueo...",
        "La invasión tendrá lugar el día Š̷̷̨̨̛̘̺̭ J̷̴̥̮ J͙̠n̟i̴̱..."
    ];

    for(let m of msgs) {
        let p = document.createElement('p');
        p.style.marginBottom = "8px";
        container.appendChild(p);
        playGlitch();
        
        for(let char of m) {
            p.textContent += char; 
            container.scrollTop = container.scrollHeight;
            await new Promise(r => setTimeout(r, 30));
        }
        await new Promise(r => setTimeout(r, 800));
    }
    setTimeout(() => { playGlitch(); document.getElementById('chat-warning-popup').classList.remove('hidden'); }, 1200);
}

function triggerVinculacionSequence() {
    document.getElementById('chat-warning-popup').classList.add('hidden');
    switchView('view-loading-vinculo');
    gsap.to("#progress-fill-vinculo", { 
        width: "100%", duration: 4, ease: "none",
        onComplete: () => { playGlitch(); switchView('view-command-panel'); }
    });
}

function validateCode() {
    const input = document.getElementById('code-input');
    const msg = document.getElementById('validation-msg');
    if (input.value === "666") {
        msg.style.color = "var(--cobalt)";
        msg.innerText = "CÓDIGO ACEPTADO";
        playGlitch();
        setTimeout(() => {
            switchView('view-chat');
            document.getElementById('chat-container-inner').classList.add('hidden');
            document.getElementById('chat-final-content').classList.remove('hidden');
        }, 2000);
    } else {
        msg.style.color = "var(--glitch-red)";
        msg.innerText = "ERROR DE ACCESO";
        playGlitch();
        gsap.to("#code-input", { x: 10, repeat: 5, yoyo: true, duration: 0.05 });
    }
}

function switchView(id) {
    document.querySelectorAll('.mobile-view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function toggleGlobalMute() {
    isMuted = !isMuted;
    [partyTrack, ambientTrack, staticSFX, glitchSFX].forEach(a => { if(a) a.muted = isMuted; });
    document.getElementById('global-mute-btn').innerText = isMuted ? "🔇 AUDIO: OFF" : "🔊 AUDIO: ON";
}

function togglePartyTrack() {
    const btn = document.getElementById('master-play-btn');
    if (partyTrack.paused) { partyTrack.play(); btn.innerText = "⏸"; } 
    else { partyTrack.pause(); btn.innerText = "⏵"; }
}

function initClock() {
    setInterval(() => {
        const d = new Date();
        document.getElementById('clock').innerText = d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0');
    }, 1000);
}
