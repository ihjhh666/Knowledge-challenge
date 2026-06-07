const fs = require('fs');

let code = fs.readFileSync('src/pages/ChickenRoom.tsx', 'utf-8');

// 1. In CHICKEN_SYNC handler
code = code.replace(
    /localP\.score = mp\.score; localP\.carryingChicken = mp\.carryingChicken;\s*localP\.dir = mp\.dir; localP\.wobble = mp\.wobble;\s*localP\.barn\.glow = mp\.barnGlow; localP\.speedMultiplier = mp\.speedMultiplier;\s*localP\.vx = mp\.vx; localP\.vy = mp\.vy;/g,
    `localP.score = mp.score; localP.carryingChicken = mp.carryingChicken;
                        localP.dir = mp.dir; localP.wobble = mp.wobble;
                        localP.barn.glow = mp.barnGlow; localP.speedMultiplier = mp.speedMultiplier;
                        
                        if (localP.id !== playerId) {
                            localP.targetX = mp.x; localP.targetY = mp.y;
                            localP.targetVx = mp.vx; localP.targetVy = mp.vy;
                        } else {
                            // Client Side Prediction Correction
                            // Only correct if server is wildly different
                            if (Math.hypot(localP.x - mp.x, localP.y - mp.y) > 80) {
                                localP.x = mp.x; localP.y = mp.y;
                            }
                        }`
);

// 2. In update CLIENT LOGIC
code = code.replace(
    /\/\/ CLIENT LOGIC: Just extrapolate positions[\s\S]*?if \(c\.state === 'wandering'\) \{/m,
    `// CLIENT LOGIC: Client Side Prediction + LERP
        for (const p of players) {
            if (p.id === playerId) {
                // Local player: Immediate responsiveness
                const speed = 320 * p.speedMultiplier;
                let dx = inputRef.current.dx;
                let dy = inputRef.current.dy;
                const len = Math.hypot(dx, dy);
                if (len > 0) {
                   const limit = 40; const normalizedFactor = Math.min(len / limit, 1.0);
                   p.vx = (dx / len) * speed * normalizedFactor;
                   p.vy = (dy / len) * speed * normalizedFactor;
                } else {
                   p.vx *= 0.1; p.vy *= 0.1; // quick stop like host
                }
                
                p.x += p.vx * dt; p.y += p.vy * dt;
                p.x = Math.max(25, Math.min(WORLD_W - 25, p.x));
                p.y = Math.max(25, Math.min(WORLD_H - 25, p.y));
                if (Math.hypot(p.vx, p.vy) > 10) p.wobble += dt * 25; else p.wobble += dt * 5;
                if (p.barn.glow) p.barn.glow = Math.max(0, p.barn.glow - dt * 2);

            } else {
                // Remote players: Smooth LERP
                if (p.targetX !== undefined && p.targetY !== undefined) {
                    const dist = Math.hypot(p.targetX - p.x, p.targetY - p.y);
                    if (dist > 120) {
                        p.x = p.targetX; p.y = p.targetY;
                    } else if (dist > 1) {
                        p.x += (p.targetX - p.x) * dt * 12;
                        p.y += (p.targetY - p.y) * dt * 12;
                    }
                    p.vx = p.targetVx || 0;
                    p.vy = p.targetVy || 0;
                }
                if (Math.hypot(p.vx, p.vy) > 10) p.wobble += dt * 25; else p.wobble += dt * 5;
                if (p.barn.glow) p.barn.glow = Math.max(0, p.barn.glow - dt * 2);
            }
        }
        for (const c of chickens) {
            if (c.targetX !== undefined && c.targetY !== undefined) {
                 const dist = Math.hypot(c.targetX - c.x, c.targetY - c.y);
                 if (dist > 100) { c.x = c.targetX; c.y = c.targetY; }
                 else { c.x += (c.targetX - c.x) * dt * 10; c.y += (c.targetY - c.y) * dt * 10; }
            }
            if (c.state === 'wandering') {`
);

// We need to also sync chickens positions properly on client (they also need targetX/Y from sync)
code = code.replace(
    /if \(msg\.chickens\) chickensRef\.current = msg\.chickens;/,
    `if (msg.chickens) {
                // don't overwrite blindly, update target positions
                if (chickensRef.current.length !== msg.chickens.length || chickensRef.current.length === 0) {
                    chickensRef.current = msg.chickens;
                } else {
                    msg.chickens.forEach((mc: any, i: number) => {
                        if (chickensRef.current[i]) {
                           chickensRef.current[i].state = mc.state;
                           chickensRef.current[i].carrierId = mc.carrierId;
                           chickensRef.current[i].wobble = mc.wobble;
                           chickensRef.current[i].type = mc.type;
                           chickensRef.current[i].targetX = mc.x;
                           chickensRef.current[i].targetY = mc.y;
                        }
                    });
                }
            }`
);

fs.writeFileSync('src/pages/ChickenRoom.tsx', code);
