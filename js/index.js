import { supabase } from './supabase.js';

// ==========================================
// 1. EFEITO 3D DE PARTÍCULAS (EXATAMENTE O SEU ORIGINAL + AJUSTE DE RAIO)
// ==========================================
const canvas = document.getElementById('esfera-3d');
if(canvas) {
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    
    // --- O GRANDE AJUSTE DA DENSIDADE ---
    // Voltei para 400 partículas para não ficar poluído e pesado.
    const numParticles = 400; 
    
    // --- O AJUSTE DE RAIO (FIM DA ESFERA QUADRADA) ---
    // Reduzi de 240 para 190. Isso faz a esfera ficar REDONDA dentro do canvas
    // e o robô flutua dentro de uma bolha confortável, sem cortar.
    const sphereRadius = 190; 
    
    let rotationX = 0;
    let rotationY = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    function resize() {
        const parent = canvas.parentElement;
        width = parent.clientWidth;
        height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    class Particle {
        constructor() {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            this.baseX = sphereRadius * Math.sin(phi) * Math.cos(theta);
            this.baseY = sphereRadius * Math.sin(phi) * Math.sin(theta);
            this.baseZ = sphereRadius * Math.cos(phi);
            this.x = this.baseX; this.y = this.baseY; this.z = this.baseZ;
            this.color = '#38BDF8';
        }

        update() {
            let cosY = Math.cos(rotationY); let sinY = Math.sin(rotationY);
            let x1 = this.baseX * cosY - this.baseZ * sinY;
            let z1 = this.baseZ * cosY + this.baseX * sinY;

            let cosX = Math.cos(rotationX); let sinX = Math.sin(rotationX);
            let y1 = this.baseY * cosX - z1 * sinX;
            let z2 = z1 * cosX + this.baseY * sinX;

            const scale = 300 / (300 + z2);
            const screenX = width / 2 + x1 * scale;
            const screenY = height / 2 + y1 * scale;

            const dx = mouseX - screenX;
            const dy = mouseY - screenY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 100; // Raio de influência do mouse

            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                // Repele as partículas quando o mouse passa (O efeito de ovo)
                this.x -= dx * force * 0.05;
                this.y -= dy * force * 0.05;
            } else {
                // Traz de volta pra posição original (efeito elástico original)
                this.x += (x1 - this.x) * 0.1;
                this.y += (y1 - this.y) * 0.1;
            }

            this.drawX = width / 2 + this.x * scale;
            this.drawY = height / 2 + this.y * scale;
            this.scale = scale;
        }

        draw() {
            if (this.scale < 0.8) return; 
            ctx.beginPath();
            ctx.arc(this.drawX, this.drawY, 2 * this.scale, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0; 
        }
    }

    for (let i = 0; i < numParticles; i++) { particles.push(new Particle()); }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        // Rotação suave constante
        rotationY += 0.002; rotationX += 0.001;
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

// ==========================================
// 2. EMBARALHAR NÚMEROS DAS ESTATÍSTICAS
// ==========================================
async function carregarEstatisticasHome() {
    try {
        const { data, error } = await supabase.from('configuracoes_home').select('*').eq('id', 1).single();
        if (error) throw error;

        if (data) {
            document.getElementById('stat-entregues').setAttribute('data-final', data.projetos_entregues);
            document.getElementById('stat-satisfacao').setAttribute('data-final', data.satisfacao);
            document.getElementById('stat-anos').setAttribute('data-final', data.anos_experiencia);
            iniciarEfeitoShuffleGlobal();
        }
    } catch (error) { 
        console.error("Erro ao carregar estatísticas do banco:", error); 
    }
}

function iniciarEfeitoShuffleGlobal() {
    const elementos = document.querySelectorAll('.shuffling-number');
    elementos.forEach(el => {
        const valorFinal = parseInt(el.getAttribute('data-final'));
        if(isNaN(valorFinal)) return;

        let passoAtual = 0;
        const totalPassos = 40; 

        const timer = setInterval(() => {
            passoAtual++;
            
            if (passoAtual < totalPassos) {
                const valorAleatorio = Math.floor(Math.random() * (valorFinal + 80));
                el.innerText = valorAleatorio;
            } else {
                clearInterval(timer);
                
                // --- AJUSTE DA SATISFAÇÃO ---
                if (el.id === 'stat-satisfacao') {
                    // Garante que o embaralhado pare em 99% mesmo que venha 100 do banco
                    const finalSatifacao = valorFinal > 99 ? 99 : valorFinal;
                    el.innerText = `${finalSatifacao}%`;
                } else {
                    el.innerText = `${valorFinal}+`;
                }
            }
        }, 50);
    });
}

carregarEstatisticasHome();