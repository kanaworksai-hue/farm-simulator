// Farm Simulator - Three.js
// A cute farm with pigs and dogs

let scene, camera, renderer;
let pigs = [];
let dogs = [];
let food = [];
let animals = [];
let dayTime = 0;
let isDay = true;
let happiness = 100;
let raycaster, mouse;

// Camera control variables
let cameraAngle = 0;
let cameraHeight = 30;
let cameraDistance = 40;
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;

const FARM_SIZE = 60;

// Initialize
function init() {
    try {
        console.log('Initializing farm...');
        
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 40, 100);
        console.log('Scene created');

        // Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        updateCamera();
        console.log('Camera created');

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(renderer.domElement);
        console.log('Renderer created');

        // Touch/Mouse events for camera control
        setupControls();

        // Lighting
        setupLighting();
        console.log('Lighting created');

        // Create farm
        createFarm();
        console.log('Farm created');

        // Create initial animals
        for (let i = 0; i < 5; i++) addPig();
        for (let i = 0; i < 2; i++) addDog();
        console.log('Animals created');

        // Events
        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('click', onClick);
        renderer.domElement.addEventListener('touchstart', onTouch);

        console.log('Initialization complete!');
        
        // Hide loading screen
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => loading.style.display = 'none', 500);
            }
        }, 500);

        // Start animation
        animate();
        
    } catch (error) {
        console.error('Init error:', error);
        document.getElementById('loading').innerHTML = '<h1>⚠️ Init Error</h1><p>' + error.message + '</p>';
    }
}
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 40, 100);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    updateCamera();

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Touch/Mouse events for camera control
    setupControls();

    // Raycaster for interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lighting
    setupLighting();

    // Create farm
    createFarm();

    // Create initial animals
    for (let i = 0; i < 5; i++) addPig();
    for (let i = 0; i < 2; i++) addDog();

    // Events
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('touchstart', onTouch);

    // Hide loading
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);

    // Start animation
    animate();
}

function setupControls() {
    const canvas = renderer.domElement;

    // Touch events
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    // Mouse events for desktop
    let mouseDown = false;
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        touchStartX = e.clientX;
        touchStartY = e.clientY;
    });
    canvas.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.clientX - touchStartX;
            const deltaY = e.clientY - touchStartY;
            cameraAngle -= deltaX * 0.005;
            cameraHeight = Math.max(10, Math.min(60, cameraHeight - deltaY * 0.1));
            updateCamera();
            touchStartX = e.clientX;
            touchStartY = e.clientY;
        }
    });
    canvas.addEventListener('mouseup', () => mouseDown = false);
    canvas.addEventListener('mouseleave', () => mouseDown = false);

    // Zoom with wheel
    canvas.addEventListener('wheel', (e) => {
        cameraDistance = Math.max(20, Math.min(80, cameraDistance + e.deltaY * 0.05));
        updateCamera();
    });
}

function onTouchStart(e) {
    if (e.touches.length === 1) {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        // Pinch to zoom
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        cameraDistance = dist * 0.15;
        cameraDistance = Math.max(20, Math.min(80, cameraDistance));
        updateCamera();
    }
}

function onTouchMove(e) {
    if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        cameraAngle -= deltaX * 0.005;
        cameraHeight = Math.max(10, Math.min(60, cameraHeight - deltaY * 0.1));
        updateCamera();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}

function onTouchEnd(e) {
    isDragging = false;
}

function updateCamera() {
    camera.position.x = Math.sin(cameraAngle) * cameraDistance;
    camera.position.z = Math.cos(cameraAngle) * cameraDistance;
    camera.position.y = cameraHeight;
    camera.lookAt(0, 0, 0);
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(30, 50, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    // Hemisphere light for sky color
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8D6E63, 0.4);
    scene.add(hemiLight);
}

function createFarm() {
    // Ground (grass)
    const groundGeometry = new THREE.PlaneGeometry(FARM_SIZE * 2, FARM_SIZE * 2, 50, 50);
    
    // Add some vertex displacement for terrain
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        positions.setZ(i, Math.sin(x * 0.1) * Math.cos(y * 0.1) * 1.5);
    }
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x7CB342,
        roughness: 0.8,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Fence
    createFence();

    // Barn
    createBarn();

    // Trees
    for (let i = 0; i < 8; i++) {
        createTree(
            (Math.random() - 0.5) * FARM_SIZE * 1.5,
            (Math.random() - 0.5) * FARM_SIZE * 1.5
        );
    }

    // Pond
    createPond();

    // Flowers
    for (let i = 0; i < 20; i++) {
        createFlower(
            (Math.random() - 0.5) * FARM_SIZE * 1.3,
            (Math.random() - 0.5) * FARM_SIZE * 1.3
        );
    }
}

function createFence() {
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
    const postGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
    const railGeometry = new THREE.BoxGeometry(4, 0.2, 0.2);

    const perimeter = FARM_SIZE;
    const posts = 20;

    for (let i = 0; i < posts; i++) {
        const angle = (i / posts) * Math.PI * 2;
        const x = Math.cos(angle) * perimeter;
        const z = Math.sin(angle) * perimeter;

        // Post
        const post = new THREE.Mesh(postGeometry, fenceMaterial);
        post.position.set(x, 1.5, z);
        post.castShadow = true;
        scene.add(post);

        // Rail
        const rail = new THREE.Mesh(railGeometry, fenceMaterial);
        rail.position.set(x * 0.95, 2.5, z * 0.95);
        rail.rotation.y = -angle;
        rail.castShadow = true;
        scene.add(rail);
    }
}

function createBarn() {
    const barnGroup = new THREE.Group();

    // Barn body
    const bodyGeometry = new THREE.BoxGeometry(15, 8, 10);
    const barnMaterial = new THREE.MeshStandardMaterial({ color: 0xD32F2F });
    const body = new THREE.Mesh(bodyGeometry, barnMaterial);
    body.position.y = 4;
    body.castShadow = true;
    body.receiveShadow = true;
    barnGroup.add(body);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(11, 5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    barnGroup.add(roof);

    // Door
    const doorGeometry = new THREE.BoxGeometry(3, 5, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4E342E });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.5, 5.1);
    barnGroup.add(door);

    // Window
    const windowGeometry = new THREE.BoxGeometry(2, 2, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFEB3B,
        emissive: 0xFFEB3B,
        emissiveIntensity: 0.3
    });
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-4, 5, 5.1);
    barnGroup.add(window1);

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(4, 5, 5.1);
    barnGroup.add(window2);

    barnGroup.position.set(-20, 0, -15);
    scene.add(barnGroup);
}

function createTree(x, z) {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage (multiple spheres)
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
    const foliageGeometry = new THREE.SphereGeometry(3, 8, 8);

    const foliage1 = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage1.position.y = 5;
    foliage1.castShadow = true;
    treeGroup.add(foliage1);

    const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), foliageMaterial);
    foliage2.position.set(1.5, 4, 0);
    foliage2.castShadow = true;
    treeGroup.add(foliage2);

    const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 8, 8), foliageMaterial);
    foliage3.position.set(-1.5, 4.5, 1);
    foliage3.castShadow = true;
    treeGroup.add(foliage3);

    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
}

function createPond() {
    const pondGeometry = new THREE.CircleGeometry(6, 32);
    const pondMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x64B5F6,
        transparent: true,
        opacity: 0.8
    });
    const pond = new THREE.Mesh(pondGeometry, pondMaterial);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(15, 0.05, 10);
    scene.add(pond);
}

function createFlower(x, z) {
    const flowerGroup = new THREE.Group();

    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    flowerGroup.add(stem);

    // Petals
    const petalColors = [0xFFEB3B, 0xFF5722, 0xE91E63, 0x9C27B0, 0xFFFFFF];
    const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
    const petalGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const petalMaterial = new THREE.MeshStandardMaterial({ color: petalColor });

    for (let i = 0; i < 5; i++) {
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        const angle = (i / 5) * Math.PI * 2;
        petal.position.set(Math.cos(angle) * 0.12, 0.55, Math.sin(angle) * 0.12);
        flowerGroup.add(petal);
    }

    // Center
    const centerGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xFFC107 });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.55;
    flowerGroup.add(center);

    flowerGroup.position.set(x, 0, z);
    scene.add(flowerGroup);
}

// Pig class
class Pig {
    constructor(x, z) {
        this.group = new THREE.Group();
        this.happiness = 100;
        this.hunger = 0;
        this.target = null;
        this.state = 'wander'; // wander, eat, sleep
        this.speed = 0.03 + Math.random() * 0.02;

        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAB91 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1.2, 1, 1);
        body.castShadow = true;
        this.group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0.7, 0.2, 0);
        head.castShadow = true;
        this.group.add(head);

        // Snout
        const snoutGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0xFFCCBC });
        const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
        snout.position.set(1, 0.15, 0);
        snout.scale.set(1, 0.8, 0.8);
        this.group.add(snout);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.9, 0.35, 0.2);
        this.group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.9, 0.35, -0.2);
        this.group.add(rightEye);

        // Ears
        const earGeometry = new THREE.ConeGeometry(0.2, 0.4, 16);
        const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
        leftEar.position.set(0.5, 0.6, 0.3);
        leftEar.rotation.z = 0.5;
        this.group.add(leftEar);

        const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
        rightEar.position.set(0.5, 0.6, -0.3);
        rightEar.rotation.z = 0.5;
        this.group.add(rightEar);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.6, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0xFFAB91 });
        
        const positions = [[0.4, -0.4, 0.3], [0.4, -0.4, -0.3], [-0.4, -0.4, 0.3], [-0.4, -0.4, -0.3]];
        this.legs = [];
        
        positions.forEach((pos, i) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
            this.legs.push(leg);
        });

        // Tail (curly)
        const tailCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.8, 0, 0),
            new THREE.Vector3(-1.1, 0.2, 0.1),
            new THREE.Vector3(-1.2, 0.3, -0.1),
            new THREE.Vector3(-1.1, 0.4, 0)
        ]);
        const tailGeometry = new THREE.TubeGeometry(tailCurve, 8, 0.05, 8, false);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(-0.6, 0.2, 0);
        this.tail = tail;
        this.group.add(tail);

        this.group.position.set(x, 0.6, z);
        scene.add(this.group);

        this.wanderAngle = Math.random() * Math.PI * 2;
        this.changeDirectionTime = 0;
    }

    update(delta) {
        this.hunger += delta * 0.5;
        
        if (this.hunger > 80) {
            this.state = 'hungry';
        }

        // Look for food
        if (this.state === 'hungry' && food.length > 0) {
            let nearestFood = null;
            let nearestDist = Infinity;
            
            food.forEach((f, i) => {
                const dist = this.group.position.distanceTo(f.position);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestFood = f;
                }
            });

            if (nearestFood) {
                this.moveTowards(nearestFood.position, delta);
                if (nearestDist < 1) {
                    this.eat(nearestFood);
                }
                return;
            }
        }

        // Wander
        this.changeDirectionTime -= delta;
        if (this.changeDirectionTime <= 0) {
            this.wanderAngle += (Math.random() - 0.5) * 1.5;
            this.changeDirectionTime = 2 + Math.random() * 3;
        }

        const moveX = Math.cos(this.wanderAngle) * this.speed;
        const moveZ = Math.sin(this.wanderAngle) * this.speed;

        this.group.position.x += moveX;
        this.group.position.z += moveZ;

        // Keep in bounds
        const bound = FARM_SIZE * 0.9;
        if (Math.abs(this.group.position.x) > bound) {
            this.group.position.x = Math.sign(this.group.position.x) * bound;
            this.wanderAngle = Math.PI - this.wanderAngle;
        }
        if (Math.abs(this.group.position.z) > bound) {
            this.group.position.z = Math.sign(this.group.position.z) * bound;
            this.wanderAngle = -this.wanderAngle;
        }

        // Face direction
        this.group.rotation.y = -this.wanderAngle + Math.PI / 2;

        // Animate legs
        const time = Date.now() * 0.01;
        this.legs[0].position.y = Math.sin(time) * 0.1;
        this.legs[1].position.y = Math.cos(time) * 0.1;
        this.legs[2].position.y = Math.cos(time) * 0.1;
        this.legs[3].position.y = Math.sin(time) * 0.1;

        // Wag tail
        this.tail.rotation.y = Math.sin(time * 2) * 0.3;
    }

    moveTowards(target, delta) {
        const direction = new THREE.Vector3().subVectors(target, this.group.position);
        direction.y = 0;
        direction.normalize();
        
        this.group.position.x += direction.x * this.speed * 1.5;
        this.group.position.z += direction.z * this.speed * 1.5;

        this.wanderAngle = Math.atan2(direction.x, direction.z);
    }

    eat(foodItem) {
        const index = food.indexOf(foodItem);
        if (index > -1) {
            scene.remove(foodItem);
            food.splice(index, 1);
            this.hunger = 0;
            this.happiness = Math.min(100, this.happiness + 20);
            this.state = 'wander';
            showMessage('🐷 Yummy!');
            updateUI();
        }
    }

    pet() {
        this.happiness = Math.min(100, this.happiness + 10);
        showMessage('🐷 Oink! ❤️');
        updateUI();
        
        // Jump animation
        const jumpHeight = 0.5;
        const startY = this.group.position.y;
        const jumpTime = 500;
        const startTime = Date.now();
        
        const animateJump = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < jumpTime) {
                const progress = elapsed / jumpTime;
                this.group.position.y = startY + Math.sin(progress * Math.PI) * jumpHeight;
                requestAnimationFrame(animateJump);
            } else {
                this.group.position.y = startY;
            }
        };
        animateJump();
    }
}

// Dog class
class Dog {
    constructor(x, z) {
        this.group = new THREE.Group();
        this.speed = 0.04 + Math.random() * 0.02;
        this.target = null;

        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xA1887F });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        this.group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0.8, 0.5, 0);
        head.castShadow = true;
        this.group.add(head);

        // Snout
        const snoutGeometry = new THREE.CapsuleGeometry(0.15, 0.3, 8, 16);
        const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
        snout.position.set(1.1, 0.45, 0);
        snout.rotation.z = Math.PI / 2;
        this.group.add(snout);

        // Nose
        const noseGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(1.3, 0.48, 0);
        this.group.add(nose);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(0.95, 0.6, 0.2);
        this.group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.95, 0.6, -0.2);
        this.group.add(rightEye);

        // Ears
        const earGeometry = new THREE.ConeGeometry(0.2, 0.4, 16);
        const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
        leftEar.position.set(0.7, 0.9, 0.2);
        leftEar.rotation.z = 0.3;
        this.group.add(leftEar);

        const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
        rightEar.position.set(0.7, 0.9, -0.2);
        rightEar.rotation.z = 0.3;
        this.group.add(rightEar);

        // Tail
        const tailGeometry = new THREE.CylinderGeometry(0.05, 0.03, 0.5, 8);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(-0.7, 0.4, 0);
        tail.rotation.z = 0.5;
        this.tail = tail;
        this.group.add(tail);

        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.08, 0.5, 8, 16);
        const positions = [[0.5, -0.3, 0.2], [0.5, -0.3, -0.2], [-0.3, -0.3, 0.2], [-0.3, -0.3, -0.2]];
        this.legs = [];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, bodyMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.group.add(leg);
            this.legs.push(leg);
        });

        this.group.position.set(x, 0.5, z);
        scene.add(this.group);

        this.wanderAngle = Math.random() * Math.PI * 2;
        this.herding = false;
    }

    update(delta) {
        // Sometimes follow pigs or herd them
        if (Math.random() < 0.01) {
            this.herding = !this.herding;
        }

        if (this.herding && pigs.length > 0) {
            // Herd pigs towards center
            const targetPig = pigs[Math.floor(Math.random() * pigs.length)];
            const herdDirection = new THREE.Vector3()
                .subVectors(new THREE.Vector3(0, 0, 0), targetPig.group.position)
                .normalize();
            
            this.group.position.x += herdDirection.x * this.speed * 0.5;
            this.group.position.z += herdDirection.z * this.speed * 0.5;
        } else {
            // Wander
            this.wanderAngle += (Math.random() - 0.5) * 0.2;
            this.group.position.x += Math.cos(this.wanderAngle) * this.speed;
            this.group.position.z += Math.sin(this.wanderAngle) * this.speed;

            // Keep in bounds
            const bound = FARM_SIZE * 0.9;
            if (Math.abs(this.group.position.x) > bound) {
                this.group.position.x = Math.sign(this.group.position.x) * bound;
                this.wanderAngle = Math.PI - this.wanderAngle;
            }
            if (Math.abs(this.group.position.z) > bound) {
                this.group.position.z = Math.sign(this.group.position.z) * bound;
                this.wanderAngle = -this.wanderAngle;
            }
        }

        this.group.rotation.y = -this.wanderAngle + Math.PI / 2;

        // Animate legs
        const time = Date.now() * 0.012;
        this.legs[0].position.y = Math.sin(time) * 0.15;
        this.legs[1].position.y = Math.cos(time) * 0.15;
        this.legs[2].position.y = Math.cos(time) * 0.15;
        this.legs[3].position.y = Math.sin(time) * 0.15;

        // Wag tail
        this.tail.rotation.y = Math.sin(time * 3) * 0.5;
    }

    pet() {
        showMessage('🐕 Woof! ❤️');
        
        // Bark animation
        const originalScale = this.group.scale.clone();
        this.group.scale.multiplyScalar(1.1);
        setTimeout(() => {
            this.group.scale.copy(originalScale);
        }, 200);
    }
}

function addPig() {
    const x = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;
    const pig = new Pig(x, z);
    pigs.push(pig);
    animals.push(pig);
    updateUI();
    showMessage('🐷 New piggy!');
}

function addDog() {
    const x = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;
    const dog = new Dog(x, z);
    dogs.push(dog);
    animals.push(dog);
    updateUI();
    showMessage('🐕 New puppy!');
}

function dropFood() {
    const foodGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const foodMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD54F });
    const foodItem = new THREE.Mesh(foodGeometry, foodMaterial);
    
    const x = (Math.random() - 0.5) * 40;
    const z = (Math.random() - 0.5) * 40;
    foodItem.position.set(x, 0.5, z);
    foodItem.castShadow = true;
    
    scene.add(foodItem);
    food.push(foodItem);
    
    showMessage('🌾 Food dropped!');
    updateUI();
}

function toggleTime() {
    isDay = !isDay;
    if (isDay) {
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 40, 100);
        document.getElementById('time-display').textContent = '☀️ 12:00';
    } else {
        scene.background = new THREE.Color(0x1A237E);
        scene.fog = new THREE.Fog(0x1A237E, 30, 80);
        document.getElementById('time-display').textContent = '🌙 21:00';
    }
    showMessage(isDay ? '☀️ Morning!' : '🌙 Night time!');
}

function showMessage(text) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 1500);
}

function updateUI() {
    document.getElementById('pig-count').textContent = pigs.length;
    document.getElementById('dog-count').textContent = dogs.length;
    document.getElementById('food-count').textContent = food.length;
    
    const avgHappiness = animals.length > 0 
        ? Math.round(animals.reduce((sum, a) => sum + (a.happiness || 100), 0) / animals.length)
        : 100;
    document.getElementById('happiness').textContent = avgHappiness + '%';
}

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(animals.map(a => a.group), true);

    if (intersects.length > 0) {
        // Find which animal was clicked
        let clickedAnimal = null;
        for (const animal of animals) {
            if (animal.group.children.includes(intersects[0].object) || 
                animal.group === intersects[0].object.parent) {
                clickedAnimal = animal;
                break;
            }
        }
        if (clickedAnimal) {
            clickedAnimal.pet();
        }
    }
}

function onTouch(event) {
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(animals.map(a => a.group), true);

        if (intersects.length > 0) {
            let clickedAnimal = null;
            for (const animal of animals) {
                if (animal.group.children.includes(intersects[0].object)) {
                    clickedAnimal = animal;
                    break;
                }
            }
            if (clickedAnimal) {
                clickedAnimal.pet();
            }
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = 0.016;

    // Update animals
    pigs.forEach(pig => pig.update(delta));
    dogs.forEach(dog => dog.update(delta));

    // Render
    renderer.render(scene, camera);
}

// Start
init();
