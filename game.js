let scene, camera, renderer, car, controls;
let speed = 0;
let acceleration = 0;
let maxSpeed = 15;
let turnSpeed = 0.03;
let cameraOffset = new THREE.Vector3(0, 4, -8);
let cameraLerpFactor = 0.08;

// Variáveis para efeito de scanlines
let composer;
let scanlinesEffect;
let scanlinesIntensity = 0.2; // Reduzido de 0.5 para 0.2 (como se tivesse pressionado "q" 6 vezes)
let scanlinesCount = 800;
let scanlinesOpacity = 0.6; // Mantido em 0.6

// Variáveis para áudio do motor
let engineSound;
let audioListener;
let engineVolume = 0.5;
let minPitch = 0.5;
let maxPitch = 2.0;
let engineSoundLoaded = false;
let lastSpeed = 0; // Para calcular a aceleração
let accelerationSound = 0; // Valor de aceleração para o som

// Variáveis para som de freio
let brakeSound;
let brakeSoundLoaded = false;
let isBraking = false;
let lastBrakeState = false;

// Variáveis para música de fundo
let backgroundMusic;
let musicLoaded = false;
let musicVolume = 0.3; // Volume inicial da música
let musicEnabled = true; // Música ativada por padrão

// Variáveis para o sistema de tempo
let gameTimer;
let timeRemaining = 60; // 60 segundos (1 minuto)
let timerStarted = false;
let timerEnded = false;
let timerFlashing = false;
let flashInterval;

// Variáveis para sistema de partículas (fumaça)
let smokeParticles = [];
let smokeSystem;
let smokeEmitter;
let lastSmokeTime = 0;
let smokeInterval = 100; // ms entre emissões
let smokeAmount = 0; // quantidade de fumaça (baseada na aceleração)
let maxSmokeParticles = 100;
let smokeColor = new THREE.Color(0x888888); // cor cinza para a fumaça
let smokeTexture;

// Novas variáveis para física mais realista
let currentSpeed = 0;
let targetSpeed = 0;
let accelerationRate = 0.15;
let decelerationRate = 0.3;
let friction = 0.92; // Aumentar fricção para parar mais rápido (era 0.98)
let steeringAngle = 0;
let maxSteeringAngle = 0.6;
let steeringSpeed = 0.08;
let wheelRotation = 0;
let wheelRotationSpeed = 0.1;
let gravity = 9.81;
let groundHeight = 1.0;
let maxSlopeAngle = 0.5;
let collisionDistance = 3;
let bounceForce = 0.3;
let stopThreshold = 0.05; // Novo: limiar para considerar o carro completamente parado

// Variáveis para sistema de rodas
let wheelRaycasters = [];
let wheelPositions = [];
let wheelMeshes = [];
let wheelBaseHeight = 0.3; // Altura base das rodas em relação ao centro do carro
let wheelRayLength = 1.5; // Comprimento do raio para detecção do solo
let suspensionStrength = 0.1; // Força da suspensão (0-1)
let suspensionDamping = 0.3; // Amortecimento da suspensão
let carTiltAmount = 0.8; // Quantidade de inclinação do carro (0-1)
let wheelOffsets = [
    new THREE.Vector3(0.7, -0.5, 1.0),   // Frente direita
    new THREE.Vector3(-0.7, -0.5, 1.0),  // Frente esquerda
    new THREE.Vector3(0.7, -0.5, -1.0),  // Traseira direita
    new THREE.Vector3(-0.7, -0.5, -1.0)  // Traseira esquerda
];

let billboards = []; // Array global para armazenar os billboards

// Adicionar variáveis para controle de níveis
let currentLevel = 0; // 0 = solo, 1 = nível intermediário, 2 = nível superior
let levelHeights = [0.07, 342.92, 448.07]; // Alturas dos diferentes níveis
let isJumping = false;
let jumpForce = 0;
let maxJumpForce = 2;
let jumpCooldown = false;

// Ajustar variáveis de direção
let steeringLerpFactor = 0.2;
let currentSteeringAngle = 0;

// Adicionar variáveis para controle da câmera inicial
let cameraInitialAnimation = true;
let cameraAnimationDuration = 4.0; // Aumentar duração da animação
let cameraAnimationTimer = 0;
let cameraInitialHeight = 300; // Aumentar altura inicial da câmera
let cameraInitialDistance = 50; // Distância inicial da câmera

// Adicionar variáveis para a seta indicadora
let coinArrow;
let arrowHeight = 4.5; // Aumentar altura da seta acima do carro
let arrowScale = 1.2; // Aumentar escala da seta
let arrowColor = 0xFF4500; // Cor laranja para a seta
let arrowPulseSpeed = 0.005; // Velocidade da pulsação da seta
let arrowMinOpacity = 0.4; // Opacidade mínima durante a pulsação
let arrowMaxOpacity = 0.8; // Opacidade máxima durante a pulsação
let arrowEmissiveIntensity = 1.5; // Aumentar intensidade do brilho

// Adicionar variáveis para o sistema de pontos
let score = 0;
let coins = [];
let coinRotationSpeed = 0.05; // Aumentado de 0.02 para 0.05 para uma rotação mais rápida
let coinPositions = [
    // Aqui serão adicionadas as coordenadas das moedas
    // Formato: {x: -131.91, y: 156.70, z: 156.18}
    {x: -131.91, y: 156.70, z: 156.18}, // Moeda 1
    {x: -4.35, y: 156.70, z: -70.58},   // Moeda 2
    {x: -73.33, y: 145.25, z: 24.56},   // Moeda 3
    {x: -413.80, y: 145.25, z: -42.79}, // Moeda 4
    {x: 103.77, y: 166.45, z: -247.21}, // Moeda 5
    {x: 217.29, y: 156.70, z: -109.59}  // Moeda 6
];

// Adicionar variáveis para o boost de velocidade
let speedBoostActive = false;
let speedBoostEndTime = 0;
let originalMaxSpeed = 15; // Guardar a velocidade máxima original
let boostMaxSpeed = 25; // Velocidade máxima durante o boost
let boostDuration = 4000; // Duração do boost em milissegundos

// Variáveis para fonte neon
let neonFontLoaded = false;
let neonColor = '#00ff00'; // Verde neon
let neonShadowColor = '#00aa00'; // Sombra verde mais escura
let neonGlowIntensity = 8; // Intensidade do brilho
let neonPulseSpeed = 0.003; // Velocidade da pulsação do neon

// Renomear a função init para initGame
function initGame() {
    // Mover o renderer para o container do jogo
    const gameContainer = document.getElementById('gameContainer');
    
    // Remover qualquer elemento de carregamento existente
    const existingLoading = document.getElementById('loading');
    if (existingLoading) {
        existingLoading.remove();
    }
    
    // Criar cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Céu azul

    // Carregar fonte neon
    loadNeonFont();

    // Criar câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    // Posicionar câmera inicialmente bem acima do ponto de spawn
    camera.position.set(-127.99, cameraInitialHeight, 254.35);
    camera.lookAt(new THREE.Vector3(-127.99, 155.90, 254.35)); // Olhar para a posição do carro

    // Configurar áudio
    setupAudio();

    // Criar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    gameContainer.appendChild(renderer.domElement);
    
    // Criar textura de fumaça diretamente
    smokeTexture = createFallbackSmokeTexture();
    
    // Configurar efeito de scanlines - ativado
    setupPostProcessing();

    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    scene.add(directionalLight);

    // Adicionar luz de preenchimento
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    // Mostrar tela de carregamento
    const loadingElement = document.createElement('div');
    loadingElement.id = 'gameLoading'; // Usar um ID diferente para evitar conflitos
    loadingElement.className = 'neon-text';
    loadingElement.style.display = 'block';
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    loadingElement.style.color = '#00ff00';
    loadingElement.style.padding = '20px';
    loadingElement.style.borderRadius = '10px';
    loadingElement.style.fontFamily = "'Orbitron', sans-serif";
    loadingElement.style.fontSize = '24px';
    loadingElement.style.textAlign = 'center';
    loadingElement.style.zIndex = '1000';
    loadingElement.style.textShadow = '0 0 5px #00ff00, 0 0 10px #00ff00';
    loadingElement.textContent = 'Carregando...';
    gameContainer.appendChild(loadingElement);

    // Manter apenas HUD para pontuação
    const scoreContainer = document.createElement('div');
    scoreContainer.style.position = 'fixed';
    scoreContainer.style.top = '10px';
    scoreContainer.style.right = '10px';
    scoreContainer.style.padding = '10px';
    scoreContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    scoreContainer.style.color = 'white';
    scoreContainer.style.fontFamily = "'Orbitron', sans-serif";
    scoreContainer.style.fontSize = '18px';
    scoreContainer.style.borderRadius = '5px';
    scoreContainer.id = 'scoreHUD';
    scoreContainer.innerHTML = '<span class="neon-text">Pontos: 0</span>';
    gameContainer.appendChild(scoreContainer);

    // Manter HUD para timer
    const timerContainer = document.createElement('div');
    timerContainer.style.position = 'fixed';
    timerContainer.style.top = '10px';
    timerContainer.style.left = '50%';
    timerContainer.style.transform = 'translateX(-50%)';
    timerContainer.style.padding = '10px';
    timerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    timerContainer.style.color = 'white';
    timerContainer.style.fontFamily = "'Orbitron', sans-serif";
    timerContainer.style.fontSize = '24px';
    timerContainer.style.borderRadius = '5px';
    timerContainer.id = 'timerHUD';
    timerContainer.innerHTML = '<span class="neon-text">Tempo: 01:00</span>';
    gameContainer.appendChild(timerContainer);
    
    // Criar sistema de partículas para fumaça
    createSmokeSystem();

    // Carregar o mapa
    const loader = new THREE.GLTFLoader();
    
    // Configurar DRACO loader se disponível
    if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);
    }

    // Carregar o mapa
    loader.load(
        'mapa/scene.gltf',
        function (gltf) {
            const mapa = gltf.scene;
            
            // Ajustar escala do mapa se necessário
            mapa.scale.set(1, 1, 1);
            
            // Ajustar posição do mapa
            mapa.position.set(0, 0, 0);
            
            // Habilitar sombras
            mapa.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            scene.add(mapa);
            
            // Após carregar o mapa, criar moedas e carregar o carro
            createCoins();
            carregarCarro();
        },
        function (xhr) {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(2);
            document.getElementById('gameLoading').textContent = `Carregando mapa... ${percent}%`;
        },
        function (error) {
            console.error('Erro ao carregar o mapa:', error);
            document.getElementById('gameLoading').textContent = 'Erro ao carregar o mapa. Recarregue a página.';
        }
    );

    // Adicionar controles
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onWindowResize);
}

function createCrossPlanes(x, z, isTree) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(isTree ? 'tree.png' : 'bush.png');
    
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide
    });

    // Árvores são maiores que arbustos
    const size = isTree ? { width: 15, height: 25 } : { width: 10, height: 5 };
    
    // Criar grupo para conter os planos
    const group = new THREE.Group();
    group.position.set(x, isTree ? size.height/2 : size.height/2, z);

    // Criar dois planos cruzados
    const geometry = new THREE.PlaneGeometry(size.width, size.height);
    
    // Primeiro plano
    const plane1 = new THREE.Mesh(geometry, material);
    group.add(plane1);

    // Segundo plano rotacionado 90 graus
    const plane2 = new THREE.Mesh(geometry, material);
    plane2.rotation.y = Math.PI / 2;
    group.add(plane2);

    return group;
}

function createTrack() {
    // Criar pista reta de 1km (1000 unidades)
    const trackGeometry = new THREE.PlaneGeometry(20, 1000);
    const trackMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2,
        envMapIntensity: 0.5
    });
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.z = -500;
    track.receiveShadow = true;
    scene.add(track);

    // Adicionar grama ao redor da pista
    const textureLoader = new THREE.TextureLoader();
    const grassTexture = textureLoader.load('grass.png');
    
    // Configurar repetição da textura
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(50, 50); // Ajuste esses valores para controlar o tamanho do padrão
    
    const grassGeometry = new THREE.PlaneGeometry(2000, 2000);
    const grassMaterial = new THREE.MeshStandardMaterial({ 
        map: grassTexture,
        roughness: 0.8,
        metalness: 0.1,
        envMapIntensity: 0.5
    });
    
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.1;
    grass.receiveShadow = true;
    scene.add(grass);

    // Adicionar linhas da pista
    const lineGeometry = new THREE.PlaneGeometry(0.5, 1000);
    const lineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.5,
        metalness: 0.1
    });
    
    // Linha central
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.01, -500);
    centerLine.receiveShadow = true;
    scene.add(centerLine);

    // Linhas laterais
    const leftLine = centerLine.clone();
    leftLine.position.set(-10, 0.01, -500);
    scene.add(leftLine);

    const rightLine = centerLine.clone();
    rightLine.position.set(10, 0.01, -500);
    scene.add(rightLine);

    // Adicionar árvores e arbustos
    const numVegetation = 150; // Aumentado de 50 para 150
    const minDistance = 20; // Reduzido de 30 para 20
    const maxDistance = 80; // Reduzido de 100 para 80 para concentrar mais a vegetação

    for (let i = 0; i < numVegetation; i++) {
        // Lado esquerdo
        const x = -(minDistance + Math.random() * (maxDistance - minDistance));
        const z = Math.random() * 1000 - 1000;
        const isTree = Math.random() > 0.4; // Aumentado chance de árvores (60% ao invés de 70%)
        const vegetation = createCrossPlanes(x, z, isTree);
        scene.add(vegetation);

        // Lado direito
        const x2 = (minDistance + Math.random() * (maxDistance - minDistance));
        const z2 = Math.random() * 1000 - 1000;
        const isTree2 = Math.random() > 0.4;
        const vegetation2 = createCrossPlanes(x2, z2, isTree2);
        scene.add(vegetation2);

        // Adicionar vegetação mais próxima à pista
        if (Math.random() > 0.7) { // 30% de chance de adicionar vegetação extra
            const xClose = -(12 + Math.random() * 8); // Entre 12 e 20 unidades da pista
            const zClose = Math.random() * 1000 - 1000;
            const isBush = true; // Sempre arbustos próximos à pista
            const vegetationClose = createCrossPlanes(xClose, zClose, !isBush);
            scene.add(vegetationClose);

            // Lado direito próximo
            const x2Close = (12 + Math.random() * 8);
            const z2Close = Math.random() * 1000 - 1000;
            const vegetation2Close = createCrossPlanes(x2Close, z2Close, !isBush);
            scene.add(vegetation2Close);
        }
    }
}

function onKeyDown(event) {
    // Não processar teclas se o timer acabou
    if (timerEnded && event.key !== 'r') {
        return;
    }

    switch(event.key) {
        case 'ArrowUp':
            targetSpeed = maxSpeed;
            // Iniciar o timer quando o jogador começa a se mover
            if (!timerStarted && !timerEnded) {
                startTimer();
            }
            break;
        case 'ArrowDown':
            targetSpeed = -maxSpeed * 0.5;
            // Ativar estado de frenagem quando a seta para baixo é pressionada
            isBraking = true;
            // Iniciar o timer quando o jogador começa a se mover
            if (!timerStarted && !timerEnded) {
                startTimer();
            }
            break;
        case 'ArrowLeft':
            steeringAngle = maxSteeringAngle;
            // Iniciar o timer quando o jogador começa a se mover
            if (!timerStarted && !timerEnded) {
                startTimer();
            }
            break;
        case 'ArrowRight':
            steeringAngle = -maxSteeringAngle;
            // Iniciar o timer quando o jogador começa a se mover
            if (!timerStarted && !timerEnded) {
                startTimer();
            }
            break;
        case ' ': // Tecla de espaço para pular
            if (!isJumping && !jumpCooldown) {
                isJumping = true;
                jumpForce = maxJumpForce;
                // Iniciar o timer quando o jogador começa a se mover
                if (!timerStarted && !timerEnded) {
                    startTimer();
                }
            }
            break;
        case 'q': // Diminuir intensidade das scanlines
            if (scanlinesEffect) {
                scanlinesIntensity = Math.max(0, scanlinesIntensity - 0.05);
                scanlinesEffect.uniforms.intensity.value = scanlinesIntensity;
                updateScanlinesHUD();
                console.log('Intensidade do efeito CRT: ' + scanlinesIntensity.toFixed(2));
            }
            break;
        case 'e': // Aumentar intensidade das scanlines
            if (scanlinesEffect) {
                scanlinesIntensity = Math.min(1, scanlinesIntensity + 0.05);
                scanlinesEffect.uniforms.intensity.value = scanlinesIntensity;
                updateScanlinesHUD();
                console.log('Intensidade do efeito CRT: ' + scanlinesIntensity.toFixed(2));
            }
            break;
        case 'z': // Diminuir opacidade das scanlines
            if (scanlinesEffect) {
                scanlinesOpacity = Math.max(0, scanlinesOpacity - 0.05);
                scanlinesEffect.uniforms.opacity.value = scanlinesOpacity;
                updateScanlinesHUD();
            }
            break;
        case 'c': // Aumentar opacidade das scanlines
            if (scanlinesEffect) {
                scanlinesOpacity = Math.min(1, scanlinesOpacity + 0.05);
                scanlinesEffect.uniforms.opacity.value = scanlinesOpacity;
                updateScanlinesHUD();
            }
            break;
        case 'r': // Tecla para reiniciar o jogo
            if (timerEnded) {
                resetGame();
            } else {
                // Comportamento original da tecla R (alternar visibilidade da fumaça)
                if (smokeSystem) {
                    smokeSystem.visible = !smokeSystem.visible;
                }
            }
            break;
        case 'm': // Tecla para ativar/desativar som do motor
            if (engineSound) {
                if (engineSound.isPlaying) {
                    engineSound.stop();
                } else if (engineSoundLoaded) {
                    engineSound.play();
                }
            }
            break;
        case 'p': // Tecla para ativar/desativar música
            toggleMusic();
            break;
        case '[': // Diminuir volume da música
            adjustMusicVolume(-0.05);
            break;
        case ']': // Aumentar volume da música
            adjustMusicVolume(0.05);
            break;
    }
}

function onKeyUp(event) {
    switch(event.key) {
        case 'ArrowUp':
            targetSpeed = 0;
            // Ativar estado de frenagem quando solta o acelerador em alta velocidade
            if (Math.abs(currentSpeed) > maxSpeed * 0.5) {
                isBraking = true;
            }
            break;
        case 'ArrowDown':
            targetSpeed = 0;
            isBraking = false;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            steeringAngle = 0;
            break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Atualizar também o composer se existir
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
    }
}

function updateCamera() {
    if (!car || !camera) return;

    // Animação inicial da câmera
    if (cameraInitialAnimation) {
        cameraAnimationTimer += 1/60; // Assumindo 60fps
        
        if (cameraAnimationTimer >= cameraAnimationDuration) {
            cameraInitialAnimation = false;
        } else {
            // Calcular progresso da animação (0 a 1) com easing
            const progress = Math.pow(cameraAnimationTimer / cameraAnimationDuration, 2); // Easing quadrático
            
            // Posição inicial (acima do carro)
            const startPos = new THREE.Vector3(-127.99, cameraInitialHeight, 254.35);
            
            // Calcular posição ideal da câmera (atrás do carro)
            const idealOffset = new THREE.Vector3();
            idealOffset.copy(car.position);
            const rotatedOffset = cameraOffset.clone().applyQuaternion(car.quaternion);
            idealOffset.add(rotatedOffset);
            
            // Interpolar entre posição inicial e posição final
            camera.position.lerpVectors(startPos, idealOffset, progress);
            
            // Ajustar ponto de mira
            const targetPosition = new THREE.Vector3();
            targetPosition.copy(car.position);
            targetPosition.y += 1.0;
            camera.lookAt(targetPosition);
            
            return; // Sair da função para não executar o código normal da câmera
        }
    }

    // Comportamento normal da câmera após a animação
    const idealOffset = new THREE.Vector3();
    idealOffset.copy(car.position);
    
    // Ajustar altura da câmera baseado no nível atual
    const heightOffset = isJumping ? 5 : 4; // Reduzir altura da câmera
    cameraOffset.y = heightOffset;
    
    // Adicionar offset com base na rotação do carro
    const rotatedOffset = cameraOffset.clone().applyQuaternion(car.quaternion);
    idealOffset.add(rotatedOffset);

    // Verificar colisão da câmera com objetos do cenário
    const cameraDirection = new THREE.Vector3();
    cameraDirection.subVectors(idealOffset, car.position).normalize();
    
    // Distância ideal entre o carro e a câmera
    const idealDistance = cameraOffset.length();
    
    // Criar raycaster do carro para a posição ideal da câmera
    const raycaster = new THREE.Raycaster();
    raycaster.set(car.position, cameraDirection);
    
    // Verificar colisões com objetos do cenário (excluindo o próprio carro e objetos transparentes)
    const intersects = raycaster.intersectObjects(scene.children, true).filter(hit => {
        // Filtrar para ignorar o próprio carro e objetos que não devem bloquear a câmera
        if (!hit.object.isMesh) return false;
        if (car.getObjectById(hit.object.id)) return false;
        if (hit.object.userData.isCoin) return false;
        if (coinArrow && coinArrow.getObjectById(hit.object.id)) return false;
        if (smokeSystem && smokeSystem.getObjectById(hit.object.id)) return false;
        
        // Verificar se o material é transparente
        const material = hit.object.material;
        if (material && material.transparent && material.opacity < 0.5) return false;
        
        return true;
    });
    
    // Ajustar posição da câmera se houver colisão
    if (intersects.length > 0 && intersects[0].distance < idealDistance) {
        // Encontrar a colisão mais próxima
        const closestHit = intersects[0];
        
        // Calcular nova distância (um pouco antes do ponto de colisão)
        const adjustedDistance = Math.max(2, closestHit.distance * 0.8);
        
        // Ajustar posição da câmera
        const adjustedPosition = new THREE.Vector3();
        adjustedPosition.copy(car.position).addScaledVector(cameraDirection, adjustedDistance);
        
        // Aplicar a posição ajustada com suavização
        camera.position.lerp(adjustedPosition, cameraLerpFactor * 1.5); // Aumentar fator de suavização para resposta mais rápida
    } else {
        // Sem colisão, usar posição ideal com suavização normal
        camera.position.lerp(idealOffset, cameraLerpFactor);
    }

    // Ajustar ponto de mira baseado no nível
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(car.position);
    targetPosition.y += isJumping ? 1.5 : 0.8; // Olhar mais baixo para melhor visibilidade
    camera.lookAt(targetPosition);
}

function updateHUD() {
    if (!car) return;
    
    // Não fazer nada, já que não temos mais o HUD de coordenadas
}

function updateCoins() {
    if (!car) return;
    
    // Obter o tempo atual para animações baseadas em tempo
    const time = Date.now() * 0.001; // Converter para segundos
    
    coins.forEach(coin => {
        if (coin.userData.collected) return;
        
        // Rotacionar moeda no eixo Y (horizontal)
        coin.rotation.y += coinRotationSpeed;
        
        // Adicionar rotação no eixo Z para um efeito mais dinâmico
        coin.rotation.z = Math.sin(time * 2) * 0.2;
        
        // Fazer a moeda flutuar para cima e para baixo
        const floatOffset = Math.sin(time * 3 + coin.position.x * 0.1) * 0.3;
        coin.position.y = coin.userData.originalY || coin.position.y;
        coin.position.y += floatOffset;
        
        // Armazenar a posição Y original se ainda não estiver armazenada
        if (!coin.userData.originalY) {
            coin.userData.originalY = coin.position.y;
        }
        
        // Adicionar efeito de brilho pulsante
        if (coin.material) {
            // Pulsar a intensidade do brilho
            const pulseIntensity = 0.7 + Math.sin(time * 5) * 0.3;
            coin.material.emissiveIntensity = pulseIntensity;
            
            // Pulsar levemente a escala da moeda
            const pulseScale = 1 + Math.sin(time * 4) * 0.05;
            coin.scale.set(pulseScale, pulseScale, pulseScale);
        }
        
        // Método 1: Verificar colisão por distância (método original)
        const distance = car.position.distanceTo(coin.position);
        const collisionRadius = 5.0; // Aumentado para 5.0 para melhorar a detecção
        
        // Método 2: Usar raycaster para detecção mais precisa
        // Criar um raio do centro do carro em todas as direções
        const directions = [
            new THREE.Vector3(1, 0, 0),   // Direita
            new THREE.Vector3(-1, 0, 0),  // Esquerda
            new THREE.Vector3(0, 0, 1),   // Frente
            new THREE.Vector3(0, 0, -1),  // Trás
            new THREE.Vector3(1, 0, 1).normalize(),   // Diagonal frente-direita
            new THREE.Vector3(-1, 0, 1).normalize(),  // Diagonal frente-esquerda
            new THREE.Vector3(1, 0, -1).normalize(),  // Diagonal trás-direita
            new THREE.Vector3(-1, 0, -1).normalize()  // Diagonal trás-esquerda
        ];
        
        let raycastHit = false;
        
        // Verificar colisão com raycaster apenas se estiver próximo o suficiente
        if (distance < collisionRadius * 2) {
            // Verificar colisão em várias direções
            for (const dir of directions) {
                const raycaster = new THREE.Raycaster(car.position, dir, 0, collisionRadius);
                const intersects = raycaster.intersectObject(coin);
                
                if (intersects.length > 0) {
                    raycastHit = true;
                    break;
                }
            }
            
            // Adicionar verificação de colisão baseada em caixa delimitadora
            // Isso ajuda a evitar problemas com a geometria complexa da moeda
            if (!raycastHit) {
                // Criar caixas delimitadoras temporárias
                const carBox = new THREE.Box3().setFromObject(car);
                const coinBox = new THREE.Box3().setFromObject(coin);
                
                // Expandir a caixa da moeda para facilitar a colisão
                coinBox.expandByScalar(0.5);
                
                // Verificar interseção
                if (carBox.intersectsBox(coinBox)) {
                    raycastHit = true;
                }
            }
        }
        
        // Coletar a moeda se qualquer um dos métodos de detecção indicar colisão
        if (distance < collisionRadius || raycastHit) {
            // Usar setTimeout para evitar que a coleta da moeda interrompa a física do carro
            // Isso separa a coleta da moeda do ciclo de atualização da física
            setTimeout(() => {
                if (!coin.userData.collected) {
                    collectCoin(coin);
                    console.log(`Moeda coletada! Distância: ${distance.toFixed(2)}, Raycaster: ${raycastHit}`);
                }
            }, 0);
        }
    });
}

function collectCoin(coin) {
    if (coin.userData.collected) return;
    
    // Guardar a velocidade atual antes da coleta
    const speedBeforeCollection = currentSpeed;
    const targetSpeedBeforeCollection = targetSpeed;
    
    coin.userData.collected = true;
    coin.visible = false;
    
    // Aumentar pontuação
    score += 10;
    updateScoreHUD();
    
    // Adicionar 10 segundos ao tempo
    timeRemaining += 10;
    updateTimerHUD();
    
    // Ativar boost de velocidade por 4 segundos
    activateSpeedBoost();
    
    // Garantir que o carro não perca velocidade ao coletar uma moeda
    // Aplicar um impulso mais forte na direção atual
    if (Math.abs(speedBeforeCollection) > 0.1) {
        // Aumentar significativamente a velocidade atual para dar sensação de impulso
        currentSpeed = speedBeforeCollection * 1.2;
        
        // Garantir que o targetSpeed também seja mantido ou aumentado
        if (targetSpeedBeforeCollection > 0) {
            targetSpeed = Math.max(targetSpeed, maxSpeed);
        } else if (targetSpeedBeforeCollection < 0) {
            targetSpeed = Math.min(targetSpeed, -maxSpeed * 0.5);
        }
        
        // Desativar temporariamente a detecção de colisão frontal para evitar que o carro pare
        temporarilyDisableFrontalCollision();
    } else if (Math.abs(speedBeforeCollection) <= 0.1 && targetSpeedBeforeCollection === 0) {
        // Se o carro estava parado, dar um pequeno impulso para frente
        currentSpeed = 5; // Impulso inicial
        targetSpeed = maxSpeed * 0.5; // Metade da velocidade máxima
    }
    
    // Efeito visual (opcional)
    createCoinCollectEffect(coin.position);
    
    // Verificar se todas as moedas foram coletadas
    checkAllCoinsCollected();
}

// Nova função para desativar temporariamente a colisão frontal
function temporarilyDisableFrontalCollision() {
    // Guardar o valor original da variável de colisão
    const originalCollisionDistance = collisionDistance;
    
    // Desativar colisão frontal temporariamente
    collisionDistance = 0.1;
    
    // Restaurar após um curto período (250ms)
    setTimeout(() => {
        collisionDistance = originalCollisionDistance;
    }, 250);
}

function createCoinCollectEffect(position) {
    // Criar flash de luz na posição da moeda
    const light = new THREE.PointLight(0xFFD700, 2, 10);
    light.position.copy(position);
    scene.add(light);
    
    // Remover luz após 300ms
    setTimeout(() => {
        scene.remove(light);
    }, 300);
    
    // Adicionar efeito de rastro de velocidade atrás do carro
    if (car) {
        // Criar partículas de rastro de velocidade
        const numParticles = 15;
        const boostColor = new THREE.Color(0xFFD700); // Dourado
        
        // Direção oposta ao movimento do carro (para trás)
        const backDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion);
        
        for (let i = 0; i < numParticles; i++) {
            // Criar geometria para a partícula
            const size = 0.3 + Math.random() * 0.5;
            const geometry = new THREE.PlaneGeometry(size, size * 3); // Formato alongado
            
            // Criar material com transparência
            const material = new THREE.MeshBasicMaterial({
                map: smokeTexture,
                transparent: true,
                opacity: 0.7,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                color: boostColor
            });
            
            // Criar mesh
            const particle = new THREE.Mesh(geometry, material);
            
            // Posicionar partícula atrás do carro
            const offset = backDirection.clone().multiplyScalar(1 + i * 0.2);
            particle.position.copy(car.position).add(offset);
            particle.position.y += 0.5; // Levantar um pouco do chão
            
            // Adicionar variação aleatória na posição
            particle.position.x += (Math.random() - 0.5) * 0.5;
            particle.position.y += (Math.random() - 0.5) * 0.3;
            
            // Rotacionar para ficar alinhado com a direção do movimento
            particle.lookAt(car.position);
            
            // Adicionar à cena
            scene.add(particle);
            
            // Animar e remover após um tempo
            const duration = 300 + Math.random() * 200;
            const startTime = Date.now();
            
            // Função para animar a partícula
            function animateBoostParticle() {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / duration;
                
                if (progress >= 1) {
                    // Remover partícula quando a animação terminar
                    scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                    return;
                }
                
                // Reduzir opacidade gradualmente
                particle.material.opacity = 0.7 * (1 - progress);
                
                // Aumentar escala para dar efeito de expansão
                const scale = 1 + progress * 2;
                particle.scale.set(scale, scale, scale);
                
                // Mover partícula para trás do carro
                particle.position.add(backDirection.clone().multiplyScalar(0.1));
                
                // Continuar animação
                requestAnimationFrame(animateBoostParticle);
            }
            
            // Iniciar animação
            animateBoostParticle();
        }
        
        // Adicionar efeito de distorção de velocidade na câmera (opcional)
        if (composer && scanlinesEffect) {
            // Guardar valores originais
            const originalIntensity = scanlinesEffect.uniforms.intensity.value;
            const originalOpacity = scanlinesEffect.uniforms.opacity.value;
            
            // Aumentar efeito temporariamente
            scanlinesEffect.uniforms.intensity.value = Math.min(1, originalIntensity * 1.5);
            scanlinesEffect.uniforms.opacity.value = Math.min(1, originalOpacity * 1.5);
            
            // Restaurar valores originais após um tempo
            setTimeout(() => {
                scanlinesEffect.uniforms.intensity.value = originalIntensity;
                scanlinesEffect.uniforms.opacity.value = originalOpacity;
            }, 500);
        }
    }
}

function updateScoreHUD() {
    const scoreHUD = document.getElementById('scoreHUD');
    if (scoreHUD) {
        scoreHUD.innerHTML = `<span class="neon-text">Pontos: ${score}</span>`;
    }
}

function checkAllCoinsCollected() {
    const allCollected = coins.every(coin => coin.userData.collected);
    
    if (allCollected) {
        // Jogador venceu!
        endGame(true);
    }
}

function startTimer() {
    timerStarted = true;
    
    // Atualizar o timer a cada segundo
    gameTimer = setInterval(() => {
        timeRemaining--;
        updateTimerHUD();
        
        // Verificar se o tempo acabou
        if (timeRemaining <= 0) {
            endGame(false);
        }
        
        // Começar a piscar quando faltar 10 segundos
        if (timeRemaining <= 10 && !timerFlashing) {
            startTimerFlashing();
        }
    }, 1000);
}

function updateTimerHUD() {
    const timerHUD = document.getElementById('timerHUD');
    if (timerHUD) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        
        // Formatar como MM:SS
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Adicionar classe de pulsação se estiver acabando o tempo
        if (timeRemaining <= 10) {
            timerHUD.classList.add('neon-pulse');
            timerHUD.style.color = '#ff0000'; // Vermelho para tempo acabando
            timerHUD.style.textShadow = '0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #aa0000, 0 0 30px #aa0000, 0 0 40px #aa0000';
        } else {
            timerHUD.classList.remove('neon-pulse');
            timerHUD.style.color = neonColor;
            timerHUD.style.textShadow = `0 0 5px ${neonColor}, 0 0 10px ${neonColor}, 0 0 20px ${neonShadowColor}, 0 0 30px ${neonShadowColor}, 0 0 40px ${neonShadowColor}`;
        }
        
        timerHUD.innerHTML = `Tempo: ${formattedTime}`;
    }
}

function startTimerFlashing() {
    timerFlashing = true;
    
    // Não precisamos mais do intervalo de flash, pois usamos animação CSS
    // Apenas garantir que a classe neon-pulse esteja aplicada
    const timerHUD = document.getElementById('timerHUD');
    if (timerHUD) {
        timerHUD.classList.add('neon-pulse');
        timerHUD.style.color = '#ff0000'; // Vermelho para tempo acabando
        timerHUD.style.textShadow = '0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #aa0000, 0 0 30px #aa0000, 0 0 40px #aa0000';
    }
}

function endGame(isVictory) {
    // Parar o timer
    clearInterval(gameTimer);
    if (timerFlashing) {
        clearInterval(flashInterval);
    }
    
    timerEnded = true;
    
    // Criar tela de fim de jogo com estilo neon
    const gameOverScreen = document.createElement('div');
    gameOverScreen.style.position = 'fixed';
    gameOverScreen.style.top = '50%';
    gameOverScreen.style.left = '50%';
    gameOverScreen.style.transform = 'translate(-50%, -50%)';
    gameOverScreen.style.padding = '30px';
    gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    gameOverScreen.style.borderRadius = '15px';
    gameOverScreen.style.textAlign = 'center';
    gameOverScreen.style.zIndex = '1000';
    gameOverScreen.style.boxShadow = `0 0 20px ${neonColor}, 0 0 30px ${neonShadowColor}`;
    gameOverScreen.style.border = `2px solid ${neonColor}`;
    gameOverScreen.style.fontFamily = "'Orbitron', sans-serif";
    gameOverScreen.id = 'gameOverScreen';
    
    if (isVictory) {
        const victoryColor = '#ffff00'; // Amarelo neon para vitória
        gameOverScreen.innerHTML = `
            <h1 class="neon-text" style="color: ${victoryColor}; text-shadow: 0 0 5px ${victoryColor}, 0 0 10px ${victoryColor}, 0 0 20px #aaaa00, 0 0 30px #aaaa00, 0 0 40px #aaaa00; font-size: 48px; margin-bottom: 20px;">VITÓRIA!</h1>
            <p class="neon-text" style="font-size: 24px; margin: 15px 0;">Você coletou todas as moedas em ${60 - timeRemaining} segundos!</p>
            <p class="neon-text" style="font-size: 28px; margin: 15px 0;">Pontuação: ${score}</p>
            <p class="neon-text neon-pulse" style="font-size: 20px; margin-top: 30px;">Pressione R para jogar novamente</p>
            <button id="menuButton" class="neon-text" style="background-color: transparent; border: 2px solid ${victoryColor}; color: ${victoryColor}; padding: 10px 20px; margin-top: 20px; cursor: pointer; border-radius: 5px; font-size: 18px;">Voltar ao Menu</button>
        `;
    } else {
        const defeatColor = '#ff0000'; // Vermelho neon para derrota
        gameOverScreen.innerHTML = `
            <h1 class="neon-text" style="color: ${defeatColor}; text-shadow: 0 0 5px ${defeatColor}, 0 0 10px ${defeatColor}, 0 0 20px #aa0000, 0 0 30px #aa0000, 0 0 40px #aa0000; font-size: 48px; margin-bottom: 20px;">TEMPO ESGOTADO!</h1>
            <p class="neon-text" style="font-size: 24px; margin: 15px 0;">Você coletou ${score / 10} de ${coins.length} moedas</p>
            <p class="neon-text" style="font-size: 28px; margin: 15px 0;">Pontuação: ${score}</p>
            <p class="neon-text neon-pulse" style="font-size: 20px; margin-top: 30px;">Pressione R para tentar novamente</p>
            <button id="menuButton" class="neon-text" style="background-color: transparent; border: 2px solid ${defeatColor}; color: ${defeatColor}; padding: 10px 20px; margin-top: 20px; cursor: pointer; border-radius: 5px; font-size: 18px;">Voltar ao Menu</button>
        `;
    }
    
    document.body.appendChild(gameOverScreen);
    
    // Adicionar evento ao botão de menu
    setTimeout(() => {
        document.getElementById('menuButton').addEventListener('click', function() {
            // Remover tela de fim de jogo
            document.body.removeChild(gameOverScreen);
            
            // Ocultar o container do jogo
            document.getElementById('gameContainer').style.display = 'none';
            
            // Mostrar o menu principal
            document.getElementById('mainMenu').style.display = 'flex';
            
            // Resetar o jogo
            resetGame();
        });
    }, 100);
    
    // Parar o carro
    targetSpeed = 0;
    currentSpeed = 0;
}

function resetGame() {
    // Remover tela de fim de jogo
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) {
        document.body.removeChild(gameOverScreen);
    }
    
    // Resetar timer
    timeRemaining = 60;
    timerStarted = false;
    timerEnded = false;
    timerFlashing = false;
    clearInterval(gameTimer);
    clearInterval(flashInterval);
    
    // Resetar HUD do timer
    const timerHUD = document.getElementById('timerHUD');
    if (timerHUD) {
        timerHUD.innerHTML = '<span class="neon-text">Tempo: 01:00</span>';
        timerHUD.style.color = 'white';
    }
    
    // Resetar pontuação
    score = 0;
    updateScoreHUD();
    
    // Resetar posição do carro
    if (car) {
        car.position.set(-127.99, 155.90, 254.35);
        car.rotation.y = Math.PI;
    }
    
    // Resetar velocidade
    currentSpeed = 0;
    targetSpeed = 0;
    
    // Resetar moedas
    coins.forEach(coin => {
        coin.userData.collected = false;
        coin.visible = true;
    });
    
    // Opção para voltar ao menu principal
    const backToMenuButton = document.createElement('button');
    backToMenuButton.textContent = 'Voltar ao Menu';
    backToMenuButton.style.position = 'fixed';
    backToMenuButton.style.bottom = '20px';
    backToMenuButton.style.left = '50%';
    backToMenuButton.style.transform = 'translateX(-50%)';
    backToMenuButton.style.padding = '10px 20px';
    backToMenuButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    backToMenuButton.style.color = '#00ff00';
    backToMenuButton.style.border = '2px solid #00ff00';
    backToMenuButton.style.borderRadius = '5px';
    backToMenuButton.style.fontFamily = "'Orbitron', sans-serif";
    backToMenuButton.style.fontSize = '16px';
    backToMenuButton.style.cursor = 'pointer';
    backToMenuButton.style.zIndex = '1000';
    backToMenuButton.style.textShadow = '0 0 5px #00ff00';
    
    backToMenuButton.addEventListener('click', function() {
        // Ocultar o container do jogo
        document.getElementById('gameContainer').style.display = 'none';
        
        // Mostrar o menu principal
        document.getElementById('mainMenu').style.display = 'flex';
        
        // Remover o botão
        document.body.removeChild(backToMenuButton);
    });
    
    document.body.appendChild(backToMenuButton);
}

function update() {
    // Verificar se os objetos necessários existem
    if (!scene || !camera) {
        return; // Sair da função se algum objeto necessário não estiver definido
    }
    
    // Calcular delta time para animações suaves
    const deltaTime = 1/60; // Assumindo 60fps
    
    // Verificar se o boost de velocidade deve terminar
    if (speedBoostActive && Date.now() > speedBoostEndTime) {
        speedBoostActive = false;
        maxSpeed = originalMaxSpeed;
    }
    
    // Não atualizar a física do carro se o timer acabou
    if (!timerEnded && car) {
        // Verificar se está freando (velocidade diminuindo significativamente)
        const isDecelerating = currentSpeed > 0 && targetSpeed < currentSpeed - 0.5;
        
        // Atualizar estado de frenagem
        if (isDecelerating && Math.abs(currentSpeed) > 3) {
            isBraking = true;
        } else if (Math.abs(currentSpeed) < 1) {
            isBraking = false;
        }
        
        // Atualizar velocidade com aceleração gradual
        if (currentSpeed < targetSpeed) {
            currentSpeed += accelerationRate;
            isBraking = false; // Não está freando se está acelerando
        } else if (currentSpeed > targetSpeed) {
            currentSpeed -= decelerationRate;
        }

        // Aplicar fricção quando não há aceleração
        if (Math.abs(targetSpeed) < 0.1) {
            currentSpeed *= friction;
            
            // Parar completamente quando a velocidade for muito baixa
            if (Math.abs(currentSpeed) < stopThreshold) {
                currentSpeed = 0;
            }
        }

        // Limitar velocidade máxima
        currentSpeed = Math.max(-maxSpeed * 0.5, Math.min(currentSpeed, maxSpeed));

        // Atualizar rotação das rodas
        wheelRotation += currentSpeed * wheelRotationSpeed;
        car.traverse((node) => {
            if (node.name.includes('roda') || node.name.includes('wheel')) {
                node.rotation.x = wheelRotation;
            }
        });

        // Atualizar direção apenas quando o carro estiver em movimento
        if (Math.abs(currentSpeed) > 0.1) {
            const speedFactor = Math.abs(currentSpeed) / maxSpeed;
            // Ajustar ângulo de direção com base na velocidade
            // Permitir curvas mais fechadas em baixa velocidade
            const steeringPower = 1 - (speedFactor * 0.5); // Mais controle em baixa velocidade
            const directionMultiplier = currentSpeed > 0 ? 1 : -1;
            const targetSteeringAngle = steeringAngle * steeringSpeed * steeringPower * directionMultiplier;
            
            // Suavizar a mudança do ângulo de direção
            currentSteeringAngle = THREE.MathUtils.lerp(
                currentSteeringAngle,
                targetSteeringAngle,
                steeringLerpFactor + (1 - speedFactor) * 0.2 // Direção mais responsiva em baixa velocidade
            );
            
            // Aplicar rotação suavizada
            car.rotation.y += currentSteeringAngle;
        } else {
            // Resetar ângulo de direção quando parado
            currentSteeringAngle = 0;
        }

        // Calcular direção do movimento
        const direction = new THREE.Vector3(0, 0, currentSpeed * 0.05);
        direction.applyQuaternion(car.quaternion);

        // Raycasts para detecção de colisão
        const rayDirections = [
            new THREE.Vector3(0, -1, 0), // Para baixo
            direction.clone().normalize(), // Frente
        ];

        let isColliding = false;
        let groundPoint = null;

        // Verificar colisões
        rayDirections.forEach((rayDir, index) => {
            const raycaster = new THREE.Raycaster(car.position, rayDir);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const hit = intersects[0];

                // Colisão com o chão
                if (index === 0 && hit.distance < collisionDistance * 2) {
                    groundPoint = hit.point;
                }
                // Colisões frontais
                else if (index === 1 && hit.distance < collisionDistance) {
                    isColliding = true;
                    currentSpeed *= 0.5;
                }
            }
        });

        // Ajustar altura do carro
        if (groundPoint) {
            const targetHeight = groundPoint.y + groundHeight;
            car.position.y = THREE.MathUtils.lerp(car.position.y, targetHeight, 0.1);
        } else {
            car.position.y -= gravity * 0.01;
        }

        // Aplicar movimento se não houver colisão
        if (!isColliding) {
            car.position.add(direction);
        }

        // Atualizar HUD
        updateHUD();
    }

    // Atualizar som do motor
    updateEngineSound();
    
    // Atualizar som de freio
    updateBrakeSound();

    // Atualizar moedas
    updateCoins();
    
    // Atualizar a seta indicadora
    updateCoinArrow();
    
    // Atualizar partículas de fumaça
    updateSmokeParticles(deltaTime);
    
    // Atualizar câmera
    updateCamera();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Verificar se os objetos necessários existem antes de atualizar e renderizar
    if (!renderer || !scene || !camera) {
        return; // Sair da função se algum objeto necessário não estiver definido
    }
    
    update();
    
    // Usar composer para renderizar se disponível, caso contrário usar renderer normal
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

// Nova função para carregar o carro separadamente
function carregarCarro() {
    if (typeof THREE.GLTFLoader !== 'undefined') {
        const loader = new THREE.GLTFLoader();
        
        if (typeof THREE.DRACOLoader !== 'undefined') {
            const dracoLoader = new THREE.DRACOLoader();
            dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
            loader.setDRACOLoader(dracoLoader);
        }

        loader.load(
            'fiat_uno.gltf',
            function (gltf) {
                car = gltf.scene;
                
                // Ajustar escala e posição do carro
                car.scale.set(0.8, 0.8, 0.8);
                car.position.set(-127.99, 155.90, 254.35); // Posição inicial correta
                car.rotation.y = Math.PI; 
                
                car.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        
                        if (node.material) {
                            node.material.roughness = 0.7;
                            node.material.metalness = 0.3;
                            node.material.envMapIntensity = 1;
                            
                            if (node.name.includes('vidro') || node.name.includes('parabrisa')) {
                                node.material.transparent = false;
                                node.material.opacity = 1.0;
                                node.material.color.setHex(0x000000);
                                node.material.roughness = 0.1;
                                node.material.metalness = 0.8;
                                node.material.clearcoat = 1.0;
                                node.material.clearcoatRoughness = 0.1;
                            } else if (node.name.includes('lataria')) {
                                // Aplicar a cor selecionada no menu
                                const carColor = window.selectedCarColor || 0xFFFFFF;
                                node.material.color.setHex(carColor);
                                node.material.roughness = 0.8; // Aumentar rugosidade
                                node.material.metalness = 0.2; // Reduzir metalicidade
                                node.material.clearcoat = 0.5; // Reduzir clearcoat
                                node.material.clearcoatRoughness = 0.5;
                                
                                // Ajustes específicos para cor branca
                                if (carColor === 0xFFFFFF) {
                                    node.material.emissive = new THREE.Color(0x222222);
                                    node.material.emissiveIntensity = 0.1;
                                }
                            }
                        }
                        
                        // Identificar e armazenar as rodas
                        if (node.name.includes('roda') || node.name.includes('wheel')) {
                            wheelMeshes.push(node);
                        }
                    }
                });
                
                scene.add(car);
                
                // Configurar sistema de rodas após carregar o carro
                setupWheelSystem();
                
                // Esconder tela de carregamento
                const loadingElement = document.getElementById('gameLoading');
                if (loadingElement) {
                    loadingElement.remove();
                }
            },
            function (xhr) {
                const percent = (xhr.loaded / xhr.total * 100).toFixed(2);
                const loadingElement = document.getElementById('gameLoading');
                if (loadingElement) {
                    loadingElement.textContent = `Carregando carro... ${percent}%`;
                }
            },
            function (error) {
                console.error('Erro ao carregar o carro:', error);
                const loadingElement = document.getElementById('gameLoading');
                if (loadingElement) {
                    loadingElement.textContent = 'Erro ao carregar o carro. Recarregue a página.';
                    
                    // Remover a mensagem de erro após 3 segundos
                    setTimeout(() => {
                        if (loadingElement.parentNode) {
                            loadingElement.remove();
                        }
                    }, 3000);
                }
            }
        );
    } else {
        console.error('GLTFLoader não está disponível');
        const loadingElement = document.getElementById('gameLoading');
        if (loadingElement) {
            loadingElement.textContent = 'Erro: GLTFLoader não está disponível';
            
            // Remover a mensagem de erro após 3 segundos
            setTimeout(() => {
                if (loadingElement.parentNode) {
                    loadingElement.remove();
                }
            }, 3000);
        }
    }
}

// Nova função para configurar o sistema de rodas
function setupWheelSystem() {
    // Limpar arrays existentes
    wheelRaycasters = [];
    wheelPositions = [];
    
    // Criar raycasters para cada roda
    for (let i = 0; i < wheelOffsets.length; i++) {
        const offset = wheelOffsets[i].clone();
        
        // Aplicar rotação do carro ao offset
        const rotatedOffset = offset.clone().applyQuaternion(car.quaternion);
        
        // Posição da roda em relação ao carro
        const wheelPos = car.position.clone().add(rotatedOffset);
        wheelPositions.push(wheelPos.clone());
        
        // Criar raycaster apontando para baixo
        const raycaster = new THREE.Raycaster(
            wheelPos,
            new THREE.Vector3(0, -1, 0),
            0,
            wheelRayLength
        );
        wheelRaycasters.push(raycaster);
        
        // Visualizar raycasters (opcional, para debug)
        /*
        const rayHelper = new THREE.ArrowHelper(
            raycaster.ray.direction,
            raycaster.ray.origin,
            wheelRayLength,
            0xff0000
        );
        rayHelper.name = `wheelRayHelper_${i}`;
        scene.add(rayHelper);
        */
    }
}

// Função para atualizar o sistema de rodas
function updateWheelSystem() {
    if (!car) return;
    
    // Pontos de contato das rodas com o solo
    const groundPoints = [];
    
    // Atualizar posição dos raycasters
    for (let i = 0; i < wheelOffsets.length; i++) {
        const offset = wheelOffsets[i].clone();
        
        // Aplicar rotação do carro ao offset
        const rotatedOffset = offset.clone().applyQuaternion(car.quaternion);
        
        // Posição da roda em relação ao carro
        const wheelPos = car.position.clone().add(rotatedOffset);
        wheelPositions[i] = wheelPos.clone();
        
        // Atualizar origem do raycaster
        wheelRaycasters[i].set(
            wheelPos,
            new THREE.Vector3(0, -1, 0)
        );
        
        // Verificar colisão com o solo
        const intersects = wheelRaycasters[i].intersectObjects(scene.children, true).filter(hit => {
            // Filtrar para ignorar o próprio carro e objetos que não devem ser considerados como solo
            if (!hit.object.isMesh) return false;
            if (car.getObjectById(hit.object.id)) return false;
            if (hit.object.userData.isCoin) return false;
            if (coinArrow && coinArrow.getObjectById(hit.object.id)) return false;
            if (smokeSystem && smokeSystem.getObjectById(hit.object.id)) return false;
            
            return true;
        });
        
        if (intersects.length > 0) {
            // Ponto de contato com o solo
            groundPoints.push(intersects[0].point);
            
            // Atualizar posição vertical da roda (se tivermos meshes de rodas)
            if (wheelMeshes[i]) {
                const targetY = intersects[0].point.y + wheelBaseHeight;
                const currentY = wheelMeshes[i].position.y;
                
                // Aplicar suspensão com amortecimento
                wheelMeshes[i].position.y = THREE.MathUtils.lerp(
                    currentY,
                    targetY,
                    suspensionStrength
                );
            }
        } else {
            // Se não houver colisão, usar um ponto padrão abaixo da roda
            const defaultGroundPoint = wheelPos.clone();
            defaultGroundPoint.y -= wheelRayLength;
            groundPoints.push(defaultGroundPoint);
        }
        
        // Atualizar helpers de visualização (opcional, para debug)
        /*
        const helper = scene.getObjectByName(`wheelRayHelper_${i}`);
        if (helper) {
            helper.position.copy(wheelPos);
        }
        */
    }
    
    // Calcular a normal do plano formado pelas rodas
    if (groundPoints.length === 4) {
        // Calcular vetores do plano
        const frontVector = new THREE.Vector3().subVectors(
            groundPoints[0], // Frente direita
            groundPoints[1]  // Frente esquerda
        ).normalize();
        
        const rightVector = new THREE.Vector3().subVectors(
            groundPoints[0], // Frente direita
            groundPoints[2]  // Traseira direita
        ).normalize();
        
        // Calcular normal do plano (perpendicular aos dois vetores)
        const normalVector = new THREE.Vector3().crossVectors(
            rightVector,
            frontVector
        ).normalize();
        
        // Calcular quaternion para alinhar o carro com a normal
        const targetQuaternion = new THREE.Quaternion();
        
        // Manter a direção do carro (rotação Y) e apenas ajustar a inclinação (X e Z)
        const currentRotation = new THREE.Euler().setFromQuaternion(car.quaternion);
        const yRotation = currentRotation.y;
        
        // Calcular ângulos de inclinação baseados na normal
        const xTilt = Math.atan2(normalVector.z, normalVector.y) * carTiltAmount;
        const zTilt = -Math.atan2(normalVector.x, normalVector.y) * carTiltAmount;
        
        // Criar quaternion com a rotação desejada
        const euler = new THREE.Euler(xTilt, yRotation, zTilt);
        targetQuaternion.setFromEuler(euler);
        
        // Aplicar rotação com suavização
        car.quaternion.slerp(targetQuaternion, suspensionDamping);
    }
    
    // Calcular altura média do solo
    if (groundPoints.length > 0) {
        let avgHeight = 0;
        for (const point of groundPoints) {
            avgHeight += point.y;
        }
        avgHeight /= groundPoints.length;
        
        // Ajustar altura do carro para ficar acima do solo
        const targetHeight = avgHeight + groundHeight;
        car.position.y = THREE.MathUtils.lerp(car.position.y, targetHeight, suspensionStrength);
    }
}

// Função para configurar o áudio do motor
function setupAudio() {
    // Criar listener de áudio e anexar à câmera
    audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    
    // Criar fonte de áudio para o som do motor
    engineSound = new THREE.Audio(audioListener);
    
    // Carregar o som do motor
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
        'motor.mp3',
        function(buffer) {
            engineSound.setBuffer(buffer);
            engineSound.setLoop(true);
            engineSound.setVolume(engineVolume);
            engineSoundLoaded = true;
            console.log('Som do motor carregado com sucesso');
        },
        function(xhr) {
            console.log('Carregando som do motor: ' + (xhr.loaded / xhr.total * 100) + '%');
        },
        function(error) {
            console.error('Erro ao carregar som do motor:', error);
        }
    );
    
    // Criar fonte de áudio para o som de freio
    brakeSound = new THREE.Audio(audioListener);
    
    // Carregar o som de freio
    audioLoader.load(
        'frear.mp3',
        function(buffer) {
            brakeSound.setBuffer(buffer);
            brakeSound.setLoop(false);
            brakeSound.setVolume(0.7);
            brakeSoundLoaded = true;
            console.log('Som de freio carregado com sucesso');
        },
        function(xhr) {
            console.log('Carregando som de freio: ' + (xhr.loaded / xhr.total * 100) + '%');
        },
        function(error) {
            console.error('Erro ao carregar som de freio:', error);
        }
    );
    
    // Criar fonte de áudio para a música de fundo
    backgroundMusic = new THREE.Audio(audioListener);
    
    // Carregar a música de fundo
    audioLoader.load(
        'musica.mp3',
        function(buffer) {
            backgroundMusic.setBuffer(buffer);
            backgroundMusic.setLoop(true);
            backgroundMusic.setVolume(musicVolume);
            musicLoaded = true;
            console.log('Música de fundo carregada com sucesso');
            
            // Iniciar a música automaticamente se estiver habilitada
            if (musicEnabled) {
                backgroundMusic.play();
            }
        },
        function(xhr) {
            console.log('Carregando música de fundo: ' + (xhr.loaded / xhr.total * 100) + '%');
        },
        function(error) {
            console.error('Erro ao carregar música de fundo:', error);
        }
    );
}

// Função para atualizar o som do motor com base na velocidade
function updateEngineSound() {
    if (!engineSoundLoaded || !engineSound) return;
    
    // Calcular aceleração real (diferença de velocidade)
    const acceleration = Math.abs(currentSpeed - lastSpeed) * 60; // Multiplicar por 60 para normalizar com base no framerate
    lastSpeed = currentSpeed;
    
    // Suavizar a aceleração para o som (evitar mudanças bruscas)
    accelerationSound = THREE.MathUtils.lerp(accelerationSound, acceleration, 0.2);
    
    // Iniciar o som se ainda não estiver tocando e o carro estiver em movimento ou acelerando
    if (!engineSound.isPlaying && (Math.abs(currentSpeed) > stopThreshold || Math.abs(targetSpeed) > 0.1)) {
        engineSound.play();
    }
    
    // Calcular o pitch com base na velocidade atual e aceleração
    const speedFactor = Math.abs(currentSpeed) / maxSpeed;
    const accelBoost = Math.min(0.5, accelerationSound); // Limitar o boost de aceleração
    
    // Pitch base pela velocidade + boost pela aceleração
    const targetPitch = minPitch + speedFactor * (maxPitch - minPitch) + accelBoost;
    
    // Aplicar o pitch ao som (com suavização)
    if (engineSound.isPlaying) {
        // Ajustar o pitch gradualmente para evitar mudanças bruscas
        const currentPitch = engineSound.playbackRate;
        engineSound.playbackRate = THREE.MathUtils.lerp(currentPitch, targetPitch, 0.1);
        
        // Ajustar volume com base na velocidade e aceleração
        // Volume maior durante aceleração
        const accelVolumeBoost = Math.min(0.3, accelerationSound * 0.6);
        const targetVolume = engineVolume * (0.7 + speedFactor * 0.3 + accelVolumeBoost);
        engineSound.setVolume(THREE.MathUtils.lerp(engineSound.getVolume(), targetVolume, 0.1));
        
        // Adicionar informações de debug ao HUD
        updateEngineHUD();
    }
    
    // Parar o som se o carro estiver parado e não estiver acelerando
    if (engineSound.isPlaying && Math.abs(currentSpeed) < stopThreshold && Math.abs(targetSpeed) < 0.1) {
        // Reduzir volume gradualmente antes de parar
        const currentVolume = engineSound.getVolume();
        if (currentVolume > 0.05) {
            engineSound.setVolume(currentVolume * 0.95);
        } else {
            engineSound.stop();
        }
    }
}

// Função para atualizar o som de freio
function updateBrakeSound() {
    if (!brakeSoundLoaded || !brakeSound) return;
    
    // Tocar som de freio quando começa a frear
    if (isBraking && !lastBrakeState && Math.abs(currentSpeed) > 3) {
        if (!brakeSound.isPlaying) {
            brakeSound.play();
            
            // Ajustar volume com base na velocidade
            const speedFactor = Math.min(1.0, Math.abs(currentSpeed) / maxSpeed);
            brakeSound.setVolume(0.5 + speedFactor * 0.5);
            
            // Ajustar pitch com base na velocidade
            brakeSound.setPlaybackRate(0.8 + speedFactor * 0.4);
        }
    }
    
    // Atualizar estado anterior
    lastBrakeState = isBraking;
}

// Função para atualizar o HUD com informações do motor
function updateEngineHUD() {
    // Função vazia, já que não temos mais o HUD de coordenadas
}

// Função para ativar/desativar música
function toggleMusic() {
    if (!musicLoaded || !backgroundMusic) return;
    
    musicEnabled = !musicEnabled;
    
    if (musicEnabled) {
        if (!backgroundMusic.isPlaying) {
            backgroundMusic.play();
        }
    } else {
        if (backgroundMusic.isPlaying) {
            backgroundMusic.pause();
        }
    }
    
    updateMusicHUD();
}

// Função para ajustar o volume da música
function adjustMusicVolume(amount) {
    if (!musicLoaded || !backgroundMusic) return;
    
    musicVolume = Math.max(0, Math.min(1, musicVolume + amount));
    backgroundMusic.setVolume(musicVolume);
    
    updateMusicHUD();
}

// Função para atualizar o HUD da música
function updateMusicHUD() {
    // Função vazia, já que não temos mais o HUD de música
}

// Função para criar moedas
function createCoins() {
    // Aumentar o tamanho das moedas (raio de 1.2 ao invés de 0.5, espessura de 0.2 ao invés de 0.1)
    const coinGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 32);
    const coinMaterial = new THREE.MeshStandardMaterial({
        color: 0x00FF00, // Verde
        metalness: 0.8, // Reduzido para não ficar muito metálico com a cor verde
        roughness: 0.2,
        emissive: 0x00AA00, // Brilho verde
        emissiveIntensity: 0.7 // Aumentado para destacar mais
    });

    coinPositions.forEach(position => {
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.position.set(position.x, position.y, position.z);
        coin.rotation.x = Math.PI / 2; // Rotacionar para ficar na horizontal
        coin.castShadow = true;
        coin.receiveShadow = true;
        coin.userData = { isCoin: true, collected: false };
        scene.add(coin);
        coins.push(coin);
    });
    
    // Criar a seta indicadora após criar as moedas
    createCoinArrow();
}

// Nova função para criar a seta indicadora
function createCoinArrow() {
    // Criar geometria da seta
    const arrowHeadHeight = 1.5; // Aumentar tamanho da ponta
    const arrowHeadRadius = 0.7; // Aumentar raio da ponta
    const arrowBodyHeight = 3.0; // Aumentar comprimento do corpo
    const arrowBodyRadius = 0.25; // Ajustar raio do corpo
    
    // Corpo da seta (cilindro)
    const bodyGeometry = new THREE.CylinderGeometry(arrowBodyRadius, arrowBodyRadius, arrowBodyHeight, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: arrowColor,
        emissive: arrowColor,
        emissiveIntensity: arrowEmissiveIntensity,
        metalness: 0.7, // Aumentar metalicidade para mais brilho
        roughness: 0.2, // Reduzir rugosidade para mais brilho
        transparent: true,
        opacity: arrowMaxOpacity
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Ponta da seta (cone)
    const headGeometry = new THREE.ConeGeometry(arrowHeadRadius, arrowHeadHeight, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: arrowColor,
        emissive: arrowColor,
        emissiveIntensity: arrowEmissiveIntensity,
        metalness: 0.7, // Aumentar metalicidade para mais brilho
        roughness: 0.2, // Reduzir rugosidade para mais brilho
        transparent: true,
        opacity: arrowMaxOpacity
    });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    
    // Criar um grupo para a seta completa
    coinArrow = new THREE.Group();
    
    // Ajustar posições e rotações
    bodyMesh.rotation.x = Math.PI / 2;
    bodyMesh.position.z = arrowBodyHeight / 2;
    
    headMesh.rotation.x = Math.PI / 2;
    headMesh.position.z = arrowBodyHeight + arrowHeadHeight / 2;
    
    // Adicionar partes ao grupo
    coinArrow.add(bodyMesh);
    coinArrow.add(headMesh);
    
    // Rotacionar todo o grupo para que a ponta aponte para frente (direção Z negativa)
    coinArrow.rotation.y = Math.PI;
    
    // Ajustar escala da seta
    coinArrow.scale.set(arrowScale, arrowScale, arrowScale);
    
    // Adicionar à cena
    scene.add(coinArrow);
    
    // Adicionar referência aos materiais para animação
    coinArrow.userData.bodyMaterial = bodyMaterial;
    coinArrow.userData.headMaterial = headMaterial;
}

// Função para atualizar a posição e rotação da seta
function updateCoinArrow() {
    if (!car || !coinArrow) return;
    
    // Encontrar a moeda não coletada mais próxima
    let closestCoin = null;
    let closestDistance = Infinity;
    
    // Verificar moedas em ordem sequencial
    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        if (!coin.userData.collected) {
            closestCoin = coin;
            break;
        }
    }
    
    // Se todas as moedas foram coletadas, esconder a seta
    if (!closestCoin) {
        coinArrow.visible = false;
        return;
    }
    
    // Posicionar a seta acima do carro
    coinArrow.position.copy(car.position);
    coinArrow.position.y += arrowHeight;
    
    // Calcular direção para a moeda mais próxima
    const direction = new THREE.Vector3();
    direction.subVectors(closestCoin.position, car.position);
    direction.y = 0; // Ignorar diferença de altura
    
    // Rotacionar a seta para apontar para a moeda
    if (direction.length() > 0.1) {
        // Calcular o ângulo no plano XZ (horizontal)
        const angle = Math.atan2(direction.x, direction.z);
        coinArrow.rotation.y = angle;
    }
    
    // Fazer a seta flutuar suavemente
    const floatOffset = Math.sin(Date.now() * 0.003) * 0.3; // Aumentar amplitude da flutuação
    coinArrow.position.y += floatOffset;
    
    // Efeito de pulsação (opacidade e brilho)
    const pulseValue = (Math.sin(Date.now() * arrowPulseSpeed) + 1) / 2; // Valor entre 0 e 1
    const opacity = arrowMinOpacity + pulseValue * (arrowMaxOpacity - arrowMinOpacity);
    const emissiveIntensity = arrowEmissiveIntensity * (0.7 + pulseValue * 0.6); // Variação de intensidade
    
    // Aplicar pulsação aos materiais
    if (coinArrow.userData.bodyMaterial) {
        coinArrow.userData.bodyMaterial.opacity = opacity;
        coinArrow.userData.bodyMaterial.emissiveIntensity = emissiveIntensity;
    }
    
    if (coinArrow.userData.headMaterial) {
        coinArrow.userData.headMaterial.opacity = opacity;
        coinArrow.userData.headMaterial.emissiveIntensity = emissiveIntensity;
    }
    
    // Garantir que a seta esteja visível
    coinArrow.visible = true;
}

// Nova função para configurar pós-processamento
function setupPostProcessing() {
    // Verificar se já temos o EffectComposer disponível
    if (typeof THREE.EffectComposer === 'undefined') {
        console.warn('EffectComposer não está disponível. Usando renderização padrão.');
        return; // Sair da função e usar renderização padrão
    }
    
    // Criar composer
    composer = new THREE.EffectComposer(renderer);
    
    // Adicionar render pass
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Verificar se ShaderPass está disponível
    if (typeof THREE.ShaderPass === 'undefined') {
        console.warn('ShaderPass não está disponível. Usando renderização padrão.');
        return;
    }
    
    // Shader personalizado para scanlines
    const scanlinesShader = {
        uniforms: {
            "tDiffuse": { value: null },
            "opacity": { value: scanlinesOpacity },
            "intensity": { value: scanlinesIntensity }, // Intensidade reduzida para 0.2
            "count": { value: scanlinesCount }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float opacity;
            uniform float intensity;
            uniform float count;
            varying vec2 vUv;
            
            void main() {
                // Obter a cor original
                vec4 texel = texture2D(tDiffuse, vUv);
                
                // Calcular o efeito de scanline
                float scanline = sin(vUv.y * count) * 0.08; // Mantido em 0.08
                
                // Aplicar o efeito com base na intensidade
                vec3 scanColor = texel.rgb - scanline * intensity;
                
                // Adicionar um leve efeito de vinheta
                vec2 center = vec2(0.5, 0.5);
                float dist = distance(vUv, center);
                float vignette = 1.0 - dist * 0.7; // Mantido em 0.7
                
                // Aplicar um leve efeito de aberração cromática
                float aberration = 0.005 * intensity; // Mantido em 0.005
                vec2 uvR = vUv + vec2(aberration, 0.0);
                vec2 uvB = vUv - vec2(aberration, 0.0);
                float r = texture2D(tDiffuse, uvR).r;
                float b = texture2D(tDiffuse, uvB).b;
                
                // Combinar os efeitos
                vec3 finalColor = vec3(r, scanColor.g, b) * vignette;
                
                // Saída final com opacidade
                gl_FragColor = vec4(finalColor, texel.a);
            }
        `
    };
    
    // Criar shader pass para scanlines
    const scanlinesPass = new THREE.ShaderPass(scanlinesShader);
    scanlinesPass.renderToScreen = true;
    composer.addPass(scanlinesPass);
    
    // Guardar referência para ajustes
    scanlinesEffect = scanlinesPass;
    
    // Atualizar o HUD para refletir os novos valores
    updateScanlinesHUD();
    
    console.log('Efeito CRT configurado com intensidade reduzida: ' + scanlinesIntensity);
}

// Função auxiliar para carregar scripts
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Função para criar uma textura de fumaça de fallback
function createFallbackSmokeTexture() {
    // Criar um canvas
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Desenhar um gradiente radial para simular fumaça
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    // Criar textura a partir do canvas
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Função para atualizar o HUD das scanlines
function updateScanlinesHUD() {
    // Função vazia, já que não temos mais o HUD de scanlines
}

// Nova função para criar o sistema de partículas de fumaça
function createSmokeSystem() {
    // Criar grupo para conter todas as partículas
    smokeSystem = new THREE.Group();
    scene.add(smokeSystem);
    
    // Posicionar o emissor na posição do escapamento (será ajustado quando o carro for carregado)
    smokeEmitter = new THREE.Object3D();
    smokeSystem.add(smokeEmitter);
}

// Função para atualizar a posição do emissor de fumaça
function updateSmokeEmitterPosition() {
    if (!car || !smokeEmitter) return;
    
    // Posição do escapamento (ajustar conforme o modelo do carro)
    // Para o Fiat Uno, o escapamento fica na parte traseira esquerda (quando visto de trás)
    const offset = new THREE.Vector3(0.5, 0.1, -1.8); // Ajustado para a posição correta do escapamento
    
    // Aplicar rotação do carro ao offset
    const rotatedOffset = offset.clone().applyQuaternion(car.quaternion);
    
    // Posicionar o emissor
    smokeEmitter.position.copy(car.position).add(rotatedOffset);
    
    // Visualizar a posição do emissor (opcional, para debug)
    // Se já existe um marcador, remover
    const existingMarker = scene.getObjectByName("emitterMarker");
    if (existingMarker) {
        scene.remove(existingMarker);
    }
    
    // Criar um pequeno marcador para visualizar a posição do emissor (apenas para debug)
    /*
    const markerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(smokeEmitter.position);
    marker.name = "emitterMarker";
    scene.add(marker);
    */
}

// Função para criar uma partícula de fumaça
function createSmokeParticle() {
    // Criar geometria para a partícula
    const size = 0.2 + Math.random() * 0.3;
    const geometry = new THREE.PlaneGeometry(size, size);
    
    // Verificar se a textura está disponível
    if (!smokeTexture) {
        smokeTexture = createFallbackSmokeTexture();
    }
    
    // Ajustar cor da fumaça com base na aceleração
    // Mais escura quando acelera muito, mais clara quando acelera pouco
    const colorIntensity = 0.5 + (1 - smokeAmount) * 0.5;
    const particleColor = new THREE.Color(
        smokeColor.r * colorIntensity,
        smokeColor.g * colorIntensity,
        smokeColor.b * colorIntensity
    );
    
    // Criar material com transparência
    const material = new THREE.MeshBasicMaterial({
        map: smokeTexture,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.2 + smokeAmount * 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: particleColor
    });
    
    // Criar mesh
    const particle = new THREE.Mesh(geometry, material);
    
    // Posicionar partícula no emissor
    particle.position.copy(smokeEmitter.position);
    
    // Adicionar pequena variação na posição para criar volume
    particle.position.x += (Math.random() - 0.5) * 0.05;
    particle.position.y += (Math.random() - 0.5) * 0.05;
    particle.position.z += (Math.random() - 0.5) * 0.05;
    
    // Rotacionar aleatoriamente para ficar sempre de frente para a câmera
    particle.rotation.z = Math.random() * Math.PI * 2;
    
    // Velocidade baseada na velocidade do carro
    const speedFactor = Math.abs(currentSpeed) / maxSpeed;
    
    // Direção da velocidade - sempre para trás do carro
    const backDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(car.quaternion);
    
    // Definir propriedades para animação
    particle.userData = {
        velocity: new THREE.Vector3(
            backDirection.x * 0.02 + (Math.random() - 0.5) * 0.01,
            0.01 + Math.random() * 0.02 + smokeAmount * 0.01,
            backDirection.z * 0.02 + (Math.random() - 0.5) * 0.01
        ),
        rotation: Math.random() * 0.02 - 0.01,
        age: 0,
        lifetime: 0.8 + Math.random() * 1.2 + smokeAmount, // segundos
        size: size,
        initialOpacity: material.opacity,
        color: particleColor
    };
    
    // Adicionar à cena
    smokeSystem.add(particle);
    smokeParticles.push(particle);
    
    // Limitar número de partículas
    if (smokeParticles.length > maxSmokeParticles) {
        const oldestParticle = smokeParticles.shift();
        smokeSystem.remove(oldestParticle);
        oldestParticle.geometry.dispose();
        oldestParticle.material.dispose();
    }
}

// Função para atualizar partículas de fumaça
function updateSmokeParticles(deltaTime) {
    if (!car || !smokeEmitter) return;
    
    // Atualizar posição do emissor para acompanhar o escapamento do carro
    updateSmokeEmitterPosition();
    
    // Calcular quantidade de fumaça baseada na aceleração e velocidade
    const accelerating = Math.abs(currentSpeed - targetSpeed) > 0.5;
    const highRPM = Math.abs(currentSpeed) > maxSpeed * 0.7;
    
    if (accelerating) {
        // Mais fumaça quando acelera
        smokeAmount = Math.min(1.0, smokeAmount + 0.05);
    } else if (highRPM) {
        // Fumaça moderada em alta velocidade
        smokeAmount = Math.min(0.7, Math.max(0.3, smokeAmount));
    } else {
        // Pouca fumaça em marcha lenta
        smokeAmount = Math.max(0.1, smokeAmount - 0.02);
    }
    
    // Ajustar intervalo de emissão com base na velocidade
    smokeInterval = 200 - Math.abs(currentSpeed) * 5 - smokeAmount * 50;
    smokeInterval = Math.max(50, smokeInterval); // Mínimo de 50ms
    
    // Emitir novas partículas
    const now = Date.now();
    if (now - lastSmokeTime > smokeInterval) {
        // Número de partículas baseado na quantidade de fumaça
        const particlesToEmit = Math.floor(1 + smokeAmount * 2);
        
        for (let i = 0; i < particlesToEmit; i++) {
            createSmokeParticle();
        }
        lastSmokeTime = now;
    }
    
    // Atualizar partículas existentes
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const particle = smokeParticles[i];
        const data = particle.userData;
        
        // Atualizar idade
        data.age += deltaTime;
        
        // Remover partículas antigas
        if (data.age >= data.lifetime) {
            smokeSystem.remove(particle);
            smokeParticles.splice(i, 1);
            particle.geometry.dispose();
            particle.material.dispose();
            continue;
        }
        
        // Calcular fator de envelhecimento (0 a 1)
        const ageFactor = data.age / data.lifetime;
        
        // Atualizar posição com base na velocidade do carro
        const speedFactor = Math.abs(currentSpeed) / maxSpeed;
        data.velocity.z -= speedFactor * 0.0005; // Partículas são puxadas para trás em alta velocidade
        particle.position.add(data.velocity);
        
        // Aumentar tamanho gradualmente
        const scale = 1 + ageFactor * 2.5;
        particle.scale.set(scale, scale, scale);
        
        // Diminuir opacidade com o tempo
        particle.material.opacity = data.initialOpacity * (1 - ageFactor * 0.8);
        
        // Rotacionar suavemente
        particle.rotation.z += data.rotation;
        
        // Fazer a partícula olhar para a câmera (billboard)
        particle.quaternion.copy(camera.quaternion);
    }
}

// Nova função para ativar o boost de velocidade
function activateSpeedBoost() {
    // Guardar a velocidade atual e alvo antes de ativar o boost
    const currentTargetSpeed = targetSpeed;
    const currentCarSpeed = currentSpeed;
    
    // Ativar boost
    speedBoostActive = true;
    
    // Definir quando o boost termina
    speedBoostEndTime = Date.now() + boostDuration;
    
    // Aumentar velocidade máxima
    maxSpeed = boostMaxSpeed;
    
    // Manter a velocidade atual do carro se estiver em movimento
    // Isso evita que o carro pare ao coletar uma moeda
    if (Math.abs(currentCarSpeed) > 0.1) {
        // Se o carro estava acelerando, manter a aceleração e aumentar a velocidade atual
        if (currentTargetSpeed > 0) {
            targetSpeed = maxSpeed;
            // Dar um impulso adicional para evitar a sensação de parada
            currentSpeed = Math.max(currentCarSpeed, currentCarSpeed * 1.1);
        }
        // Se o carro estava freando, manter a frenagem
        else if (currentTargetSpeed < 0) {
            targetSpeed = -maxSpeed * 0.5;
        }
        // Se o carro estava em movimento mas sem aceleração (deslizando)
        else {
            // Manter a direção do movimento, mas aplicar um impulso
            if (currentCarSpeed > 0) {
                targetSpeed = maxSpeed * 0.5;
                currentSpeed = Math.max(currentCarSpeed, currentCarSpeed * 1.1);
            } else {
                targetSpeed = -maxSpeed * 0.3;
                currentSpeed = Math.min(currentCarSpeed, currentCarSpeed * 1.1);
            }
        }
    } else {
        // Se o carro estava parado, dar um pequeno impulso para frente
        currentSpeed = 3;
        targetSpeed = maxSpeed * 0.3;
    }
    
    // Criar efeito visual para indicar o boost
    createSpeedBoostEffect();
}

// Nova função para criar efeito visual do boost
function createSpeedBoostEffect() {
    // Criar texto temporário na tela com efeito neon
    const boostText = document.createElement('div');
    boostText.style.position = 'fixed';
    boostText.style.top = '50%';
    boostText.style.left = '50%';
    boostText.style.transform = 'translate(-50%, -50%)';
    boostText.style.padding = '20px';
    boostText.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    boostText.style.fontFamily = "'Orbitron', sans-serif";
    boostText.style.fontSize = '32px';
    boostText.style.borderRadius = '15px';
    boostText.style.textAlign = 'center';
    boostText.style.zIndex = '999';
    boostText.style.animation = 'neonPulse 0.5s infinite, fadeOut 1s ease-in-out 1.5s forwards';
    boostText.style.color = '#ff9900'; // Laranja neon
    boostText.style.textShadow = '0 0 5px #ff9900, 0 0 10px #ff9900, 0 0 20px #aa6600, 0 0 30px #aa6600, 0 0 40px #aa6600';
    boostText.style.border = '2px solid #ff9900';
    boostText.style.boxShadow = '0 0 15px #ff9900';
    boostText.id = 'boostText';
    boostText.innerHTML = 'TURBO BOOST!';
    
    // Adicionar estilo de animação
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Adicionar ao corpo do documento
    document.body.appendChild(boostText);
    
    // Remover após 2.5 segundos
    setTimeout(() => {
        if (boostText.parentNode) {
            document.body.removeChild(boostText);
        }
    }, 2500);
}

// Nova função para carregar e aplicar a fonte neon
function loadNeonFont() {
    // Criar elemento de estilo para a fonte neon
    const neonStyle = document.createElement('style');
    neonStyle.textContent = `
        @font-face {
            font-family: 'NeonFont';
            src: url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');
            font-weight: normal;
            font-style: normal;
        }
        
        .neon-text {
            font-family: 'Orbitron', sans-serif;
            color: ${neonColor};
            text-shadow: 
                0 0 5px ${neonColor},
                0 0 10px ${neonColor},
                0 0 20px ${neonShadowColor},
                0 0 30px ${neonShadowColor},
                0 0 40px ${neonShadowColor};
            letter-spacing: 2px;
        }
        
        @keyframes neonPulse {
            0% { opacity: 0.8; text-shadow: 0 0 5px ${neonColor}, 0 0 10px ${neonColor}, 0 0 20px ${neonShadowColor}, 0 0 30px ${neonShadowColor}, 0 0 40px ${neonShadowColor}; }
            50% { opacity: 1; text-shadow: 0 0 10px ${neonColor}, 0 0 20px ${neonColor}, 0 0 30px ${neonShadowColor}, 0 0 40px ${neonShadowColor}, 0 0 50px ${neonShadowColor}, 0 0 60px ${neonShadowColor}; }
            100% { opacity: 0.8; text-shadow: 0 0 5px ${neonColor}, 0 0 10px ${neonColor}, 0 0 20px ${neonShadowColor}, 0 0 30px ${neonShadowColor}, 0 0 40px ${neonShadowColor}; }
        }
        
        .neon-pulse {
            animation: neonPulse 2s infinite;
        }
    `;
    document.head.appendChild(neonStyle);
    
    // Carregar a fonte Orbitron do Google Fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap';
    document.head.appendChild(fontLink);
    
    fontLink.onload = function() {
        neonFontLoaded = true;
        console.log('Fonte neon carregada com sucesso');
        
        // Aplicar a fonte neon aos elementos existentes
        applyNeonToHUD();
    };
}

// Função para aplicar o estilo neon aos elementos do HUD
function applyNeonToHUD() {
    // Aplicar ao HUD de pontuação
    const scoreHUD = document.getElementById('scoreHUD');
    if (scoreHUD) {
        scoreHUD.classList.add('neon-text');
        scoreHUD.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        scoreHUD.style.borderRadius = '10px';
        scoreHUD.style.padding = '10px 15px';
        scoreHUD.style.fontSize = '20px';
    }
    
    // Aplicar ao HUD de timer
    const timerHUD = document.getElementById('timerHUD');
    if (timerHUD) {
        timerHUD.classList.add('neon-text');
        timerHUD.classList.add('neon-pulse');
        timerHUD.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        timerHUD.style.borderRadius = '10px';
        timerHUD.style.padding = '10px 15px';
        timerHUD.style.fontSize = '26px';
    }
}

// Remover a chamada automática de initGame
// initGame();
// Manter apenas a animação
animate(); 