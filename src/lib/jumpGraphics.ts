export const PLATFORM_RADIUS = 350;
export const ARM_HEIGHT = 40;
export const ARM_WIDTH = 25;
export const PLAYER_RADIUS = 25;
export const GRAVITY = 1500;
export const JUMP_FORCE = 600;

export function drawFuturisticArena(ctx: CanvasRenderingContext2D, time: number) {
    ctx.save();
    
    // Base glow
    ctx.shadowColor = '#c026d3';
    ctx.shadowBlur = 50;

    // Layer 1 (Bottom deep layer)
    ctx.fillStyle = '#1e1b4b'; // deep indigo
    ctx.beginPath(); ctx.arc(0, 40, PLATFORM_RADIUS + 20, 0, Math.PI * 2); ctx.fill();

    // Layer 2 (Middle structural layer)
    ctx.fillStyle = '#4a044e';
    ctx.beginPath(); ctx.arc(0, 20, PLATFORM_RADIUS + 10, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    
    // Layer 3 (Top Surface)
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, PLATFORM_RADIUS);
    grad.addColorStop(0, '#701a75');
    grad.addColorStop(1, '#2e1065');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(0, 0, PLATFORM_RADIUS, 0, Math.PI * 2); ctx.fill();

    // Tech Lines
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)'; // cyan lines
    ctx.lineWidth = 2;
    for(let r = 50; r <= PLATFORM_RADIUS; r += 50) {
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    }
    for(let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(angle)*PLATFORM_RADIUS, Math.sin(angle)*PLATFORM_RADIUS);
        ctx.stroke();
    }
    
    // Rotating energy ring at the edge
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#22d3ee';
    ctx.setLineDash([40, 20]);
    ctx.lineDashOffset = -time * 50;
    ctx.beginPath(); ctx.arc(0, 0, PLATFORM_RADIUS, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    ctx.restore();
}

export function drawArm(ctx: CanvasRenderingContext2D, angle: number, time: number) {
    const ax = Math.cos(angle) * PLATFORM_RADIUS;
    const ay = Math.sin(angle) * PLATFORM_RADIUS;

    ctx.save();
    
    // Draw shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = ARM_WIDTH + 10;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(ax, ay + 20); ctx.stroke();

    // Draw Arm Base
    ctx.strokeStyle = '#c026d3';
    ctx.lineWidth = ARM_WIDTH + 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ax, ay); ctx.stroke();

    // Draw Arm Core Energy
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = ARM_WIDTH - 10;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f5d0fe';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ax, ay); ctx.stroke();
    ctx.shadowBlur = 0;

    // Energy waves along the arm
    ctx.fillStyle = '#ffffff';
    const numWaves = 6;
    for(let i=1; i<numWaves; i++) {
        const dist = (i / numWaves) * PLATFORM_RADIUS;
        const waveOffset = Math.sin(time * 15 + i) * 6;
        const wx = Math.cos(angle) * dist + Math.sin(angle) * waveOffset;
        const wy = Math.sin(angle) * dist - Math.cos(angle) * waveOffset;
        ctx.beginPath();
        ctx.arc(wx, wy, 4, 0, Math.PI*2);
        ctx.fill();
    }

    // Center Pillar
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
    
    // Pillar glowing core
    ctx.fillStyle = '#22d3ee';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#22d3ee';
    ctx.beginPath(); ctx.arc(0, -20, 30, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    
    // Core details
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, -20, 10, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
}

export function drawFuturisticPlayer(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, z: number,
    vx: number, vy: number,
    isJumping: boolean, dead: boolean,
    colorBody: string, time: number, isWinner: boolean, name?: string,
    characterType: string = 'blue'
) {
    ctx.save();
    
    // Draw shadow first (on the ground)
    if (!dead) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        const shadowRadius = Math.max(8, PLAYER_RADIUS - z * 0.1);
        ctx.arc(x, y, shadowRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.translate(x, y - z);
    ctx.scale(1.8, 1.8);
    
    const speed = Math.sqrt(vx*vx + vy*vy);
    const isRunning = speed > 10;
    
    let bounce = 0;
    let legAngle = 0;
    let armAngle = 0;
    let turnAngle = 0;
    
    if (isRunning && !isJumping && !dead) {
        bounce = Math.abs(Math.sin(time * 15)) * 4;
        legAngle = Math.sin(time * 15) * 0.5;
        armAngle = Math.cos(time * 15) * 0.5;
        turnAngle = (vx / 350) * 0.15; // Lean
    } else if (isJumping) {
        legAngle = -0.3;
        armAngle = -0.8;
    }

    if (dead) {
        ctx.rotate((time * 5) % (Math.PI * 2));
        ctx.scale(Math.max(0.1, 1 - ((time % 2) * 0.5)), Math.max(0.1, 1 - ((time % 2) * 0.5)));
    }
    
    if (isWinner) {
        bounce = Math.abs(Math.sin(time * 8)) * 12;
        armAngle = Math.PI; // Flippers up!
    }

    ctx.translate(0, -bounce);
    ctx.rotate(turnAngle);
    
    // Directional indicator
    if (isRunning && !dead && !isWinner) {
        ctx.save();
        ctx.rotate(Math.atan2(vy, vx) - turnAngle); // Point in movement direction
        
        ctx.shadowColor = '#22d3ee';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(25, 0);
        ctx.lineTo(40, 0);
        ctx.lineTo(35, -4);
        ctx.moveTo(40, 0);
        ctx.lineTo(35, 4);
        ctx.stroke();
        
        ctx.restore();
    }

    // Jetpack trail / icy slide effect if moving fast
    if ((isJumping || isRunning) && !dead) {
        ctx.fillStyle = characterType === 'neon' ? '#22d3ee' : 'rgba(255, 255, 255, 0.5)';
        ctx.globalAlpha = 0.6 + Math.sin(time * 30) * 0.4;
        ctx.beginPath();
        ctx.arc(0, 15, 6 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Base colors based on type
    let primaryColor = colorBody;
    let bellyColor = '#ffffff';
    let beakColor = '#f59e0b'; // orange
    let footColor = '#f59e0b';
    let eyeColor = '#000000';
    let eyeGlow = 'transparent';

    switch (characterType) {
        case 'gold':
            primaryColor = '#fbbf24'; // yellow-500
            bellyColor = '#fef3c7'; // yellow-100
            beakColor = '#f97316';
            footColor = '#f97316';
            break;
        case 'snow':
            primaryColor = '#e2e8f0'; // slate-200
            bellyColor = '#ffffff';
            beakColor = '#38bdf8'; // light blue beak
            footColor = '#38bdf8';
            break;
        case 'robot':
            primaryColor = '#64748b'; // slate-500
            bellyColor = '#94a3b8'; // slate-400
            beakColor = '#f87171'; // red beak
            footColor = '#475569';
            eyeColor = '#ef4444';
            eyeGlow = '#ef4444';
            break;
        case 'neon':
            primaryColor = '#0f172a'; // slate-900
            bellyColor = '#1e293b';
            beakColor = '#22d3ee';
            footColor = '#22d3ee';
            eyeColor = '#22d3ee';
            eyeGlow = '#22d3ee';
            break;
        case 'red': primaryColor = '#ef4444'; break;
        case 'green': primaryColor = '#10b981'; break;
        case 'purple': primaryColor = '#8b5cf6'; break;
        case 'blue':
        default:
            primaryColor = '#3b82f6';
            break;
    }

    // Glow effect for rare/neon
    if (characterType === 'gold' || characterType === 'neon') {
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 15;
    }

    // Feet
    ctx.fillStyle = footColor;
    
    // Left foot
    ctx.save();
    ctx.translate(-6, 12);
    ctx.rotate(legAngle);
    ctx.beginPath(); ctx.ellipse(0, 4, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Right foot
    ctx.save();
    ctx.translate(6, 12);
    ctx.rotate(-legAngle);
    ctx.beginPath(); ctx.ellipse(0, 4, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Body (Penguin shape)
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, -5, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0; // reset shadow for inner details

    // Belly
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(0, -2, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flippers
    ctx.fillStyle = primaryColor;
    
    // Left flipper
    ctx.save();
    ctx.translate(-11, -8);
    ctx.rotate(armAngle + 0.5);
    ctx.beginPath(); ctx.ellipse(-2, 5, 3, 7, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    
    // Right flipper
    ctx.save();
    ctx.translate(11, -8);
    ctx.rotate(-armAngle - 0.5);
    ctx.beginPath(); ctx.ellipse(2, 5, 3, 7, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Eyes
    if (dead) {
        ctx.fillStyle = eyeColor;
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('x', -4, -10);
        ctx.fillText('x', 4, -10);
    } else {
        ctx.fillStyle = eyeColor;
        if (eyeGlow !== 'transparent') {
            ctx.shadowColor = eyeGlow;
            ctx.shadowBlur = 8;
        }
        ctx.beginPath(); ctx.arc(-4, -12, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, -12, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        
        // Eye shine for normal types
        if (eyeColor === '#000000') {
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(-4.5, -12.5, 0.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(3.5, -12.5, 0.5, 0, Math.PI*2); ctx.fill();
        }
    }

    // Beak
    ctx.fillStyle = beakColor;
    ctx.beginPath();
    ctx.moveTo(-3, -8);
    ctx.lineTo(3, -8);
    ctx.lineTo(0, -4);
    ctx.fill();

    // Shine effect (Glossy)
    if (characterType !== 'robot' && characterType !== 'neon') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(-4, -14, 4, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Accessories (simple)
    if (characterType === 'gold') {
        // Crown
        ctx.fillStyle = '#f59e0b'; // darker gold
        ctx.beginPath();
        ctx.moveTo(-4, -20);
        ctx.lineTo(-6, -26);
        ctx.lineTo(-2, -23);
        ctx.lineTo(0, -28);
        ctx.lineTo(2, -23);
        ctx.lineTo(6, -26);
        ctx.lineTo(4, -20);
        ctx.fill();
    } else if (characterType === 'robot') {
        // Antenna
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -21); ctx.lineTo(0, -26); ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(0, -26, 1.5, 0, Math.PI*2); ctx.fill();
    } else if (characterType === 'snow') {
        // Winter scarf
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(4, -6); ctx.lineTo(4, 0); ctx.stroke();
    }

    // Name tag
    if (name) {
        ctx.save();
        ctx.translate(0, -35);
        ctx.scale(1 / 1.8, 2 / 1.8);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.strokeText(name, 0, 0);
        ctx.fillText(name, 0, 0);
        ctx.restore();
    }

    ctx.restore();
}
