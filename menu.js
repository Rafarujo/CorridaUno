// Variáveis globais para o menu
let menuScene, menuCamera, menuRenderer, menuCar;
let selectedColor = 0xFFFFFF; // Cor branca padrão

// Inicializar o menu quando a página carregar
document.addEventListener('DOMContentLoaded', initMenu);

function initMenu() {
    // Ocultar o loading inicial
    document.getElementById('loading').style.display = 'none';
    
    // Configurar a cena do menu
    setupMenuScene();
    
    // Carregar o modelo do carro
    loadMenuCarModel();
    
    // Configurar os eventos de clique nas opções de cores
    setupColorOptions();
    
    // Configurar o botão de início
    document.getElementById('startButton').addEventListener('click', startGame);
    
    // Iniciar a animação do menu
    animateMenu();
}

function setupMenuScene() {
    // Criar a cena
    menuScene = new THREE.Scene();
    menuScene.background = new THREE.Color(0x111111);
    
    // Criar a câmera
    menuCamera = new THREE.PerspectiveCamera(
        40, // Reduzido para um campo de visão mais amplo
        600 / 400,
        0.1, 
        1000
    );
    menuCamera.position.set(0, 1.5, 7); // Ajustado para melhor visualização
    menuCamera.lookAt(0, 0, 0);
    
    // Criar o renderer
    menuRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    menuRenderer.setSize(600, 400);
    menuRenderer.shadowMap.enabled = true;
    
    // Adicionar o renderer ao container
    const container = document.getElementById('carModelContainer');
    container.appendChild(menuRenderer.domElement);
    
    // Ajustar o estilo do container para acomodar o tamanho maior
    container.style.width = '600px';
    container.style.height = '400px';
    container.style.margin = '0 auto 20px auto'; // Centralizar horizontalmente
    
    // Adicionar luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Aumentado para compensar a remoção da plataforma
    menuScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    menuScene.add(directionalLight);
    
    // Adicionar luz de destaque para o carro
    const spotLight = new THREE.SpotLight(0xffffff, 1.2); // Aumentado para compensar a remoção da plataforma
    spotLight.position.set(0, 5, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.distance = 200;
    spotLight.castShadow = true;
    menuScene.add(spotLight);
    
    // Adicionar luz de preenchimento de baixo para melhorar a visualização
    const bottomLight = new THREE.PointLight(0x3366ff, 0.6);
    bottomLight.position.set(0, -3, 0);
    menuScene.add(bottomLight);
}

function loadMenuCarModel() {
    // Mostrar mensagem de carregamento
    const container = document.getElementById('carModelContainer');
    const loadingText = document.createElement('div');
    loadingText.style.position = 'absolute';
    loadingText.style.top = '50%';
    loadingText.style.left = '50%';
    loadingText.style.transform = 'translate(-50%, -50%)';
    loadingText.style.color = '#00ff00';
    loadingText.style.fontFamily = "'Orbitron', sans-serif";
    loadingText.style.fontSize = '16px';
    loadingText.style.textShadow = '0 0 5px #00ff00';
    loadingText.textContent = 'Carregando modelo...';
    container.appendChild(loadingText);
    
    // Carregar o modelo do carro
    const loader = new THREE.GLTFLoader();
    
    // Configurar DRACO loader se disponível
    if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);
    }
    
    loader.load(
        'fiat_uno.gltf',
        function(gltf) {
            menuCar = gltf.scene;
            
            // Ajustar escala e posição
            menuCar.scale.set(0.75, 0.75, 0.75); // Ajustado para caber melhor na visualização
            menuCar.position.set(0, 0, 0); // Centralizado na cena
            
            // Aplicar sombras e ajustar materiais
            menuCar.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    
                    // Imprimir nomes dos meshes para depuração
                    console.log("Mesh encontrado:", node.name);
                    
                    // Ajustar propriedades do material para todos os meshes
                    if (node.material) {
                        // Forçar todos os materiais a não serem transparentes por padrão
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        
                        // Reduzir o aspecto metálico
                        node.material.metalness = 0.3;
                        node.material.roughness = 0.7;
                        
                        // Ajustar outras propriedades para melhorar a aparência
                        node.material.envMapIntensity = 0.5;
                    }
                    
                    // Identificar e armazenar a lataria para mudar a cor
                    if (node.name.includes('lataria')) {
                        // Configurar material específico para a lataria
                        node.material.metalness = 0.2; // Reduzir ainda mais o aspecto metálico para a lataria
                        node.material.roughness = 0.8; // Aumentar a rugosidade para reduzir o brilho
                        node.material.color.setHex(selectedColor);
                        node.userData.isCarBody = true;
                        
                        // Adicionar propriedades para melhorar a aparência da pintura
                        if (selectedColor === 0xFFFFFF) {
                            // Ajustes específicos para cor branca
                            node.material.emissive = new THREE.Color(0x222222);
                            node.material.emissiveIntensity = 0.1;
                        }
                    }
                    
                    // Ajustar vidros - remover transparência conforme solicitado
                    if (node.name.includes('vidro') || node.name.includes('parabrisa')) {
                        node.material.transparent = false; // Remover transparência
                        node.material.opacity = 1.0; // Opacidade total
                        node.material.color.setHex(0x111111);
                        node.material.metalness = 0.9;
                        node.material.roughness = 0.1;
                    }
                    
                    // Ajustar paralamas - garantir que não tenha transparência
                    if (node.name.includes('paralama')) {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        node.material.metalness = 0.2;
                        node.material.roughness = 0.8;
                    }
                    
                    // Ajustar rodas - garantir que não tenha transparência
                    if (node.name.includes('roda') || node.name.includes('pneu')) {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        
                        // Se for pneu, ajustar para aparência de borracha
                        if (node.name.includes('pneu')) {
                            node.material.metalness = 0.0;
                            node.material.roughness = 0.9;
                            node.material.color.setHex(0x111111);
                        } 
                        // Se for roda (parte metálica), ajustar para aparência metálica
                        else {
                            node.material.metalness = 0.7;
                            node.material.roughness = 0.3;
                        }
                    }
                    
                    // Ajustar aros - garantir que não tenham transparência
                    if (node.name.includes('aro') || node.name.includes('rim') || node.name.includes('wheel')) {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        node.material.metalness = 0.9;
                        node.material.roughness = 0.1;
                        node.material.color.setHex(0xCCCCCC); // Cor metálica prateada para aros
                        console.log("Ajustando aro:", node.name);
                    }
                    
                    // Ajustar calotas - garantir que não tenham transparência
                    if (node.name.includes('calota') || node.name.includes('hubcap')) {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                        node.material.metalness = 0.8;
                        node.material.roughness = 0.2;
                        node.material.color.setHex(0xCCCCCC); // Cor metálica prateada para calotas
                    }
                    
                    // Garantir que nenhuma parte do carro tenha transparência indesejada
                    if (node.material && node.material.transparent === true && 
                        !node.name.includes('vidro') && !node.name.includes('parabrisa')) {
                        console.log("Removendo transparência de:", node.name);
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                    }
                }
            });
            
            menuScene.add(menuCar);
            
            // Remover mensagem de carregamento
            container.removeChild(loadingText);
        },
        function(xhr) {
            // Atualizar progresso
            const percent = Math.floor((xhr.loaded / xhr.total) * 100);
            loadingText.textContent = `Carregando modelo... ${percent}%`;
        },
        function(error) {
            console.error('Erro ao carregar o modelo:', error);
            loadingText.textContent = 'Erro ao carregar o modelo';
            loadingText.style.color = '#ff0000';
        }
    );
}

function setupColorOptions() {
    const colorOptions = document.querySelectorAll('.colorOption');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover seleção anterior
            document.querySelector('.colorOption.selected').classList.remove('selected');
            
            // Adicionar seleção à opção clicada
            this.classList.add('selected');
            
            // Obter a cor selecionada
            selectedColor = parseInt(this.getAttribute('data-color'));
            
            // Aplicar a cor ao modelo do carro
            if (menuCar) {
                menuCar.traverse((node) => {
                    if (node.isMesh && node.userData.isCarBody) {
                        node.material.color.setHex(selectedColor);
                    }
                });
            }
        });
    });
}

function animateMenu() {
    requestAnimationFrame(animateMenu);
    
    // Girar o carro com uma rotação mais completa
    if (menuCar) {
        menuCar.rotation.y += 0.01;
        
        // Adicionar uma leve oscilação vertical para melhorar a visualização
        const time = Date.now() * 0.001;
        menuCar.position.y = Math.sin(time) * 0.05;
    }
    
    // Renderizar a cena
    menuRenderer.render(menuScene, menuCamera);
}

function startGame() {
    // Ocultar o menu
    document.getElementById('mainMenu').style.display = 'none';
    
    // Mostrar o container do jogo
    document.getElementById('gameContainer').style.display = 'block';
    
    // Armazenar a cor selecionada para uso no jogo
    window.selectedCarColor = selectedColor;
    
    // Iniciar o jogo
    if (typeof initGame === 'function') {
        initGame();
    } else {
        // Fallback para a função init original
        init();
    }
} 