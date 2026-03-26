import { supabase } from './supabase.js';

// ==========================================
// 1. EFEITO 3D DE PARTÍCULAS (Canvas)
// ==========================================
const canvas = document.getElementById('esfera-3d');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const numParticles = 600; // Quantidade de pontinhos
const sphereRadius = 180; // Tamanho da esfera
let rotationX = 0;
let rotationY = 0;

// Mouse tracking
let mouseX = -1000;
let mouseY = -1000;

function resize() {
    // Pega o tamanho da div pai
    const parent = canvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

// Atualiza a posição do mouse em relação ao canvas
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
        // Distribuição matemática para criar uma esfera perfeita
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        // Posição original em 3D
        this.baseX = sphereRadius * Math.sin(phi) * Math.cos(theta);
        this.baseY = sphereRadius * Math.sin(phi) * Math.sin(theta);
        this.baseZ = sphereRadius * Math.cos(phi);
        
        // Posição atual (para a animação de repulsão)
        this.x = this.baseX;
        this.y = this.baseY;
        this.z = this.baseZ;
        
        this.color = '#1D4ED8'; // Azul da sua paleta
    }

    update() {
        // Rotação natural da esfera
        let cosY = Math.cos(rotationY);
        let sinY = Math.sin(rotationY);
        let x1 = this.baseX * cosY - this.baseZ * sinY;
        let z1 = this.baseZ * cosY + this.baseX * sinY;

        let cosX = Math.cos(rotationX);
        let sinX = Math.sin(rotationX);
        let y1 = this.baseY * cosX - z1 * sinX;
        let z2 = z1 * cosX + this.baseY * sinX;

        // Projeta 3D para 2D (centro da tela)
        const scale = 300 / (300 + z2);
        const screenX = width / 2 + x1 * scale;
        const screenY = height / 2 + y1 * scale;

        // EFEITO DE HOVER (Repulsão do mouse)
        const dx = mouseX - screenX;
        const dy = mouseY - screenY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100; // Raio de interação do mouse

        // Se o mouse chegar perto, empurra a partícula
        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            this.x -= dx * force * 0.05;
            this.y -= dy * force * 0.05;
        } else {
            // Se afastar, volta lentamente pra posição original
            this.x += (x1 - this.x) * 0.1;
            this.y += (y1 - this.y) * 0.1;
        }

        this.drawX = width / 2 + this.x * scale;
        this.drawY = height / 2 + this.y * scale;
        this.scale = scale;
    }

    draw() {
        // Esconde as partículas que estão na "parte de trás" da esfera
        if (this.scale < 0.8) return; 

        ctx.beginPath();
        // O tamanho muda dependendo da profundidade (z)
        ctx.arc(this.drawX, this.drawY, 2 * this.scale, 0, Math.PI * 2);
        
        // Faz um glowzinho azul
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reseta a sombra pras outras partículas
    }
}

// Cria as partículas
for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
}

// Loop de animação
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    rotationY += 0.002; // Velocidade de giro horizontal
    rotationX += 0.001; // Velocidade de giro vertical

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}
animate();

// ==========================================
// 2. BUSCAR DADOS DO SUPABASE
// ==========================================
async function carregarEstatisticas() {
    try {
        // Busca a linha de id 1 na tabela configuracoes_home
        const { data, error } = await supabase
            .from('configuracoes_home')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        // Se achou os dados, injeta no HTML
        if (data) {
            document.getElementById('stat-projetos').innerText = data.projetos_entregues + '+';
            document.getElementById('stat-satisfacao').innerText = data.satisfacao + '%';
            document.getElementById('stat-anos').innerText = data.anos_experiencia + '+';
        }
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error.message);
    }
}

// Chama a função assim que a página carregar
carregarEstatisticas();