// Variáveis para controles mobile
let touchControls = {
    steeringWheel: null,
    accelerator: null,
    brake: null,
    isAccelerating: false,
    isBraking: false,
    isTurningLeft: false,
    isTurningRight: false,
    currentAngle: 0
};

// Função para atualizar o estado do carro
function updateCarState() {
    if (window.gameInstance && window.gameInstance.car) {
        // Aceleração e frenagem
        if (touchControls.isAccelerating) {
            window.targetSpeed = window.maxSpeed;
            // Iniciar o timer quando o jogador começa a se mover
            if (!window.timerStarted && !window.timerEnded) {
                window.startTimer();
            }
        }
        if (touchControls.isBraking) {
            window.targetSpeed = -window.maxSpeed * 0.5;
            window.isBraking = true;
            // Iniciar o timer quando o jogador começa a se mover
            if (!window.timerStarted && !window.timerEnded) {
                window.startTimer();
            }
        }
        
        // Direção
        if (touchControls.currentAngle < -5) {
            window.steeringAngle = window.maxSteeringAngle;
            // Iniciar o timer quando o jogador começa a se mover
            if (!window.timerStarted && !window.timerEnded) {
                window.startTimer();
            }
        } else if (touchControls.currentAngle > 5) {
            window.steeringAngle = -window.maxSteeringAngle;
            // Iniciar o timer quando o jogador começa a se mover
            if (!window.timerStarted && !window.timerEnded) {
                window.startTimer();
            }
        } else {
            window.steeringAngle = 0;
        }
    }
}

function initMobileControls() {
    // Criar container para controles mobile
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'mobileControls';
    controlsContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 200px;
        display: none;
        touch-action: none;
        z-index: 1000;
    `;

    // Criar botão de desenvolvimento
    const devButton = document.createElement('button');
    devButton.id = 'devModeButton';
    devButton.innerHTML = '🎮 Controles Mobile';
    devButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 16px;
        background: rgba(0, 255, 0, 0.2);
        border: 2px solid #00ff00;
        color: #00ff00;
        font-family: 'Orbitron', sans-serif;
        cursor: pointer;
        z-index: 1001;
        border-radius: 5px;
        text-shadow: 0 0 5px #00ff00;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
    `;
    devButton.addEventListener('click', () => {
        controlsContainer.style.display = 
            controlsContainer.style.display === 'none' ? 'block' : 'none';
    });
    document.body.appendChild(devButton);

    // Criar volante
    touchControls.steeringWheel = document.createElement('div');
    touchControls.steeringWheel.id = 'steeringWheel';
    touchControls.steeringWheel.style.cssText = `
        position: absolute;
        left: 20px;
        bottom: 20px;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.2);
        border: 3px solid #00ff00;
        border-radius: 50%;
        box-shadow: 0 0 10px #00ff00;
        transition: box-shadow 0.2s;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
    `;

    // Criar indicador do volante
    const wheelIndicator = document.createElement('div');
    wheelIndicator.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        width: 6px;
        height: 45%;
        background: #00ff00;
        transform-origin: bottom center;
        border-radius: 3px;
        box-shadow: 0 0 5px #00ff00;
    `;
    touchControls.steeringWheel.appendChild(wheelIndicator);

    // Criar botão de acelerador
    touchControls.accelerator = document.createElement('div');
    touchControls.accelerator.id = 'accelerator';
    touchControls.accelerator.style.cssText = `
        position: absolute;
        right: 120px;
        bottom: 20px;
        width: 100px;
        height: 100px;
        background: rgba(0, 255, 0, 0.2);
        border: 3px solid #00ff00;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Orbitron', sans-serif;
        color: #00ff00;
        text-shadow: 0 0 5px #00ff00;
        font-size: 24px;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
    `;
    touchControls.accelerator.innerHTML = '▲';

    // Criar botão de ré
    touchControls.brake = document.createElement('div');
    touchControls.brake.id = 'brake';
    touchControls.brake.style.cssText = `
        position: absolute;
        right: 20px;
        bottom: 20px;
        width: 100px;
        height: 100px;
        background: rgba(255, 0, 0, 0.2);
        border: 3px solid #ff0000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Orbitron', sans-serif;
        color: #ff0000;
        text-shadow: 0 0 5px #ff0000;
        font-size: 24px;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: none;
    `;
    touchControls.brake.innerHTML = '▼';

    // Adicionar elementos ao container
    controlsContainer.appendChild(touchControls.steeringWheel);
    controlsContainer.appendChild(touchControls.accelerator);
    controlsContainer.appendChild(touchControls.brake);
    document.body.appendChild(controlsContainer);

    // Mostrar controles apenas em dispositivos móveis
    if (isMobileDevice()) {
        controlsContainer.style.display = 'block';
    }

    // Configurar eventos touch
    setupTouchEvents();

    // Iniciar loop de atualização
    setInterval(updateCarState, 1000 / 60); // 60 FPS
}

function setupTouchEvents() {
    let wheelTouchId = null;
    let lastX = 0;

    // Eventos do volante
    touchControls.steeringWheel.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        wheelTouchId = touch.identifier;
        lastX = touch.clientX;
        touchControls.currentAngle = 0;
    }, { passive: false });

    touchControls.steeringWheel.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = Array.from(e.touches).find(t => t.identifier === wheelTouchId);
        if (!touch) return;

        const deltaX = touch.clientX - lastX;
        touchControls.currentAngle = Math.max(-45, Math.min(45, touchControls.currentAngle + deltaX * 0.5));
        
        // Atualizar visual do volante
        touchControls.steeringWheel.querySelector('div').style.transform = 
            `rotate(${touchControls.currentAngle}deg)`;
        
        // Efeito visual
        const intensity = Math.abs(touchControls.currentAngle) / 45;
        touchControls.steeringWheel.style.boxShadow = 
            `0 0 ${10 + intensity * 20}px #00ff00`;

        lastX = touch.clientX;
    }, { passive: false });

    touchControls.steeringWheel.addEventListener('touchend', (e) => {
        if (!e.touches.length) {
            wheelTouchId = null;
            touchControls.currentAngle = 0;
            touchControls.steeringWheel.querySelector('div').style.transform = 'rotate(0deg)';
            touchControls.steeringWheel.style.boxShadow = '0 0 10px #00ff00';
        }
    });

    // Eventos do acelerador
    touchControls.accelerator.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.isAccelerating = true;
        touchControls.accelerator.style.background = 'rgba(0, 255, 0, 0.4)';
    }, { passive: false });

    touchControls.accelerator.addEventListener('touchend', () => {
        touchControls.isAccelerating = false;
        touchControls.accelerator.style.background = 'rgba(0, 255, 0, 0.2)';
        window.targetSpeed = 0;
        // Ativar estado de frenagem quando solta o acelerador em alta velocidade
        if (Math.abs(window.currentSpeed) > window.maxSpeed * 0.5) {
            window.isBraking = true;
        }
    });

    // Eventos do freio
    touchControls.brake.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchControls.isBraking = true;
        touchControls.brake.style.background = 'rgba(255, 0, 0, 0.4)';
    }, { passive: false });

    touchControls.brake.addEventListener('touchend', () => {
        touchControls.isBraking = false;
        touchControls.brake.style.background = 'rgba(255, 0, 0, 0.2)';
        window.targetSpeed = 0;
        window.isBraking = false;
    });
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.matchMedia('(pointer: coarse)').matches ||
           window.matchMedia('(any-pointer: coarse)').matches ||
           navigator.maxTouchPoints > 0;
}

// Inicializar controles quando a página carregar
document.addEventListener('DOMContentLoaded', initMobileControls);

// Adicionar atalho de teclado para alternar controles (para desenvolvimento)
document.addEventListener('keydown', (e) => {
    if (e.key === 'M' && e.ctrlKey) {
        const controlsContainer = document.getElementById('mobileControls');
        if (controlsContainer) {
            controlsContainer.style.display = 
                controlsContainer.style.display === 'none' ? 'block' : 'none';
        }
    }
}); 