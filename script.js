// ============================================
// PREMIUM PORTFOLIO - ADVANCED ANIMATIONS
// ============================================

let scene, camera, renderer, composer, bloomPass;
let butterflies = [];
let particles = [];
let mouse = { x: 0, y: 0 };
const butterflyCount = 12;
const particleTrailCount = 200;
let time = 0;

// Runtime flags for performance
let useComposer = true;

function isMobileDevice() {
	try {
		return (window.matchMedia && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches)) || /Mobi|Android/i.test(navigator.userAgent);
	} catch (e) {
		return false;
	}
}

// Global error overlay to show runtime errors on the page (helps debugging blank page)
function showErrorOverlay(message, stack) {
	try {
		let overlay = document.getElementById('js-error-overlay');
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.id = 'js-error-overlay';
			overlay.style.position = 'fixed';
			overlay.style.left = '12px';
			overlay.style.right = '12px';
			overlay.style.bottom = '12px';
			overlay.style.top = '12px';
			overlay.style.background = 'rgba(10,10,10,0.95)';
			overlay.style.color = '#fff';
			overlay.style.zIndex = 99999;
			overlay.style.padding = '18px';
			overlay.style.borderRadius = '8px';
			overlay.style.overflow = 'auto';
			overlay.style.fontFamily = 'Segoe UI, Tahoma, sans-serif';
			overlay.style.boxShadow = '0 20px 80px rgba(0,0,0,0.8)';
			document.body.appendChild(overlay);
		}
		overlay.innerHTML = `<h2 style="margin:0 0 8px;color:#ffb4d9">JavaScript Error</h2><pre style="white-space:pre-wrap;color:#ffdede">${String(message)}</pre><details style="color:#ddd;margin-top:8px"><summary style="cursor:pointer;color:#fff">Stack</summary><pre style="white-space:pre-wrap;color:#ddd">${String(stack||'')}</pre></details>`;
	} catch (e) {
		console.error('Failed to show error overlay', e);
	}
}

window.addEventListener('error', function (ev) {
	console.error('Unhandled error', ev.error || ev.message);
	showErrorOverlay(ev.error ? ev.error.message : ev.message, ev.error ? ev.error.stack : null);
});

window.addEventListener('unhandledrejection', function (ev) {
	console.error('Unhandled promise rejection', ev.reason);
	showErrorOverlay(ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason), ev.reason && ev.reason.stack ? ev.reason.stack : null);
});

// ============================================
// INITIALIZATION
// ============================================

function init() {
	// Scene setup
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x0a0a1a);
	scene.fog = new THREE.Fog(0x0a0a1a, 200, 300);

	// Camera setup
	const width = window.innerWidth;
	const height = window.innerHeight;
	camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
	camera.position.z = 60;

	// Renderer setup
	const container = document.getElementById('canvas-container');
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

	// Mobile / reduced-motion detection: lower pixelRatio and disable heavy post-processing on small devices
	const isMobile = isMobileDevice();
	useComposer = !isMobile;
	renderer.setPixelRatio(isMobile ? 1 : window.devicePixelRatio);
	renderer.setSize(width, height);
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.3;
	renderer.outputEncoding = THREE.sRGBEncoding;
	container.appendChild(renderer.domElement);

	// Post-processing (Bloom effect) - may be disabled on mobile
	setupPostProcessing();

	// Create scene elements
	createAdvancedMoon();
	createAdvancedStars();
	createFloatingGeometricShapes();

	// Skip heavier visual objects on mobile/reduced-motion
	if (!isMobile) {
		createButterflies();
		createParticleTrail();
	}

	// Lighting
	addLighting();

	// Event listeners
	window.addEventListener('resize', onWindowResize);
	window.addEventListener('mousemove', onMouseMove);
	document.addEventListener('scroll', onScroll);

	// UI handlers
	setupUIHandlers();

	// Start animation
	animate();
}

// ============================================
// LIGHTING
// ============================================

function addLighting() {
	// Ambient light
	const ambientLight = new THREE.AmbientLight(0x8a2be2, 0.3);
	scene.add(ambientLight);

	// Point light near moon
	const pointLight = new THREE.PointLight(0x8a2be2, 0.8, 100);
	pointLight.position.set(-30, 25, 30);
	scene.add(pointLight);

	// Additional point light
	const pointLight2 = new THREE.PointLight(0x6a0dad, 0.5, 80);
	pointLight2.position.set(40, -20, 20);
	scene.add(pointLight2);
}

// ============================================
// POST-PROCESSING
// ============================================

function setupPostProcessing() {
	// If composer is disabled (mobile or reduced motion), skip heavy postprocessing
	if (!useComposer) {
		bloomPass = null;
		composer = null;
		return;
	}

	const renderPass = new THREE.RenderPass(scene, camera);
	bloomPass = new THREE.UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		1.8,
		0.5,
		0.85
	);

	composer = new THREE.EffectComposer(renderer);
	composer.addPass(renderPass);
	composer.addPass(bloomPass);
}

// ============================================
// CREATE ADVANCED MOON
// ============================================

function createAdvancedMoon() {
	const moonGeometry = new THREE.SphereGeometry(10, 128, 128);

	// Advanced moon texture
	const canvas = document.createElement('canvas');
	canvas.width = 1024;
	canvas.height = 1024;
	const ctx = canvas.getContext('2d');

	// Base gradient
	const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
	gradient.addColorStop(0, '#ffffff');
	gradient.addColorStop(0.2, '#f5f5f5');
	gradient.addColorStop(0.5, '#e8e8e8');
	gradient.addColorStop(1, '#a0a0a0');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 1024, 1024);

	// Craters with shadow
	ctx.fillStyle = '#888888';
	for (let i = 0; i < 50; i++) {
		const x = Math.random() * 1024;
		const y = Math.random() * 1024;
		const r = Math.random() * 40 + 8;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();

		// Crater shadow
		ctx.fillStyle = '#666666';
		ctx.beginPath();
		ctx.arc(x + r / 3, y + r / 3, r / 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#888888';
	}

	const moonTexture = new THREE.CanvasTexture(canvas);
	const moonMaterial = new THREE.MeshStandardMaterial({
		map: moonTexture,
		emissive: new THREE.Color(0x8B4789),
		emissiveIntensity: 0.6,
		roughness: 0.4,
		metalness: 0.2
	});

	const moon = new THREE.Mesh(moonGeometry, moonMaterial);
	moon.position.set(-35, 28, -120);
	scene.add(moon);

	// Multiple glow layers
	for (let i = 1; i <= 3; i++) {
		const glowGeometry = new THREE.SphereGeometry(10 + i * 0.5, 64, 64);
		const glowMaterial = new THREE.MeshBasicMaterial({
			color: 0x8B4789,
			transparent: true,
			opacity: 0.15 / i,
			side: THREE.BackSide
		});
		const moonGlow = new THREE.Mesh(glowGeometry, glowMaterial);
		moonGlow.position.copy(moon.position);
		scene.add(moonGlow);
	}
}

// ============================================
// CREATE ADVANCED STARS
// ============================================

function createAdvancedStars() {
	const starsGeometry = new THREE.BufferGeometry();
	const starCount = window.innerWidth <= 768 ? 120 : 300; // fewer stars on small screens
	const positions = new Float32Array(starCount * 3);
	const sizes = new Float32Array(starCount);

	for (let i = 0; i < starCount; i++) {
		positions[i * 3] = (Math.random() - 0.5) * 400;
		positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
		positions[i * 3 + 2] = Math.random() * -200 - 50;
		sizes[i] = Math.random() * 1.5 + 0.5;
	}

	starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

	const starsMaterial = new THREE.PointsMaterial({
		color: 0xffffff,
		size: 0.7,
		transparent: true,
		opacity: 0.8,
		sizeAttenuation: true
	});

	const stars = new THREE.Points(starsGeometry, starsMaterial);
	scene.add(stars);

	// Store for animation
	stars.userData.originalPositions = positions.slice();
	stars.userData.twinklePhase = new Float32Array(starCount);

	for (let i = 0; i < starCount; i++) {
		stars.userData.twinklePhase[i] = Math.random() * Math.PI * 2;
	}
}

// ============================================
// CREATE BUTTERFLIES
// ============================================

function createButterflies() {
	const localCount = window.innerWidth <= 768 ? 4 : butterflyCount;
	for (let i = 0; i < localCount; i++) {
		butterfly.position.set(
			(Math.random() - 0.5) * 100,
			(Math.random() - 0.5) * 100,
			Math.random() * 40 - 20
		);
		butterfly.userData = {
			time: Math.random() * Math.PI * 2,
			speed: Math.random() * 0.03 + 0.02,
			amplitude: Math.random() * 0.5 + 0.3,
			phase: Math.random() * Math.PI * 2,
			rotation: 0
		};
		butterflies.push(butterfly);
		scene.add(butterfly);
	}
}

function createButterfly() {
	const group = new THREE.Group();

	// Wing geometry dengan lebih detail
	const wingShape = new THREE.Shape();
	wingShape.moveTo(0, 0);
	wingShape.quadraticCurveTo(3, 4, 4, 2.5);
	wingShape.quadraticCurveTo(3.5, 1, 0, 0);

	const wingGeometry = new THREE.ShapeGeometry(wingShape);

	// Gradient-like material menggunakan vertex colors
	const wingMaterial = new THREE.MeshStandardMaterial({
		color: 0x6a0dad,
		emissive: 0x8a2be2,
		emissiveIntensity: 0.9,
		roughness: 0.3,
		metalness: 0.6,
		flatShading: false
	});

	// Left wing
	const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
	leftWing.position.set(-1.2, 0, 0);
	leftWing.userData.isWing = true;
	group.add(leftWing);

	// Right wing
	const rightWing = new THREE.Mesh(wingGeometry, wingMaterial.clone());
	rightWing.position.set(1.2, 0, 0);
	rightWing.scale.set(-1, 1, 1);
	rightWing.userData.isWing = true;
	group.add(rightWing);

	// Body
	const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.35, 2.5, 16);
	const bodyMaterial = new THREE.MeshStandardMaterial({
		color: 0x4a007d,
		emissive: 0x6a0dad,
		emissiveIntensity: 0.7,
		roughness: 0.2,
		metalness: 0.7
	});
	const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
	body.rotation.z = Math.PI / 2;
	group.add(body);

	// Advanced glow halo
	const haloGeometry = new THREE.SphereGeometry(3, 32, 32);
	const haloMaterial = new THREE.MeshBasicMaterial({
		color: 0x8a2be2,
		transparent: true,
		opacity: 0.25,
		side: THREE.BackSide
	});
	const halo = new THREE.Mesh(haloGeometry, haloMaterial);
	group.add(halo);

	// Additional subtle glow
	const halo2Geometry = new THREE.SphereGeometry(4, 32, 32);
	const halo2Material = new THREE.MeshBasicMaterial({
		color: 0xb88bff,
		transparent: true,
		opacity: 0.1,
		side: THREE.BackSide
	});
	const halo2 = new THREE.Mesh(halo2Geometry, halo2Material);
	group.add(halo2);

	group.scale.set(1, 1, 1);
	return group;
}

// ============================================
// PARTICLE TRAIL
// ============================================

function createParticleTrail() {
	const particleGeometry = new THREE.BufferGeometry();
	const count = window.innerWidth <= 768 ? 60 : particleTrailCount;
	const positions = new Float32Array(count * 3);

	for (let i = 0; i < count * 3; i += 3) {
		positions[i] = (Math.random() - 0.5) * 200;
		positions[i + 1] = (Math.random() - 0.5) * 200;
		positions[i + 2] = Math.random() * 60 - 30;
	}

	particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

	const particleMaterial = new THREE.PointsMaterial({
		color: 0xb88bff,
		size: 0.6,
		transparent: true,
		opacity: 0.5,
		sizeAttenuation: true
	});

	const particlePoints = new THREE.Points(particleGeometry, particleMaterial);
	scene.add(particlePoints);

	particles = {
		points: particlePoints,
		positions: positions,
		velocities: new Float32Array(count * 3),
		life: new Float32Array(count)
	};

	// Initialize life
	for (let i = 0; i < count; i++) {
		particles.life[i] = Math.random();
	}
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
	requestAnimationFrame(animate);
	time += 0.016;

	// Update geometric shapes (floating shapes animation)
	geometricShapes.forEach(shape => {
		// Smooth movement toward target
		shape.position.x += (shape.userData.targetX - shape.position.x) * shape.userData.moveSpeed;
		shape.position.y += (shape.userData.targetY - shape.position.y) * shape.userData.moveSpeed;
		shape.position.z += (shape.userData.targetZ - shape.position.z) * shape.userData.moveSpeed;
		
		// Rotation
		shape.rotation.x += shape.userData.rotationSpeed.x;
		shape.rotation.y += shape.userData.rotationSpeed.y;
		shape.rotation.z += shape.userData.rotationSpeed.z;
		
		// Randomly pick new target when reached
		if (Math.random() < 0.002) {
			shape.userData.targetX = (Math.random() - 0.5) * 120;
			shape.userData.targetY = (Math.random() - 0.5) * 120;
			shape.userData.targetZ = (Math.random() - 0.5) * 80;
		}
		
		// Subtle pulsing glow
		const pulse = Math.sin(time * 0.5 + shape.position.x) * 0.2 + 0.3;
		shape.material.emissiveIntensity = pulse;
	});

	// Update butterflies dengan advanced physics
	butterflies.forEach((butterfly, index) => {
		const userData = butterfly.userData;
		userData.time += userData.speed;

		// Sine wave movement dengan multiple frequencies
		butterfly.position.y += Math.sin(userData.time) * userData.amplitude * 0.02;
		butterfly.position.x += Math.cos(userData.time * 0.7) * userData.amplitude * 0.015;
		butterfly.position.z += Math.sin(userData.time * 0.4) * userData.amplitude * 0.01;

		// Smooth wing flapping
		const wingFlap = Math.sin(userData.time * 5) * 0.6;
		butterfly.children[0].rotation.z = wingFlap;
		butterfly.children[1].rotation.z = wingFlap;

		// Rotation menghadap arah gerakan
		const vx = Math.cos(userData.time * 0.7) * userData.amplitude;
		const vy = Math.sin(userData.time) * userData.amplitude;
		butterfly.rotation.y = Math.atan2(vx, vy) + Math.PI / 2;

		// Subtle scale breathing
		const scale = 1 + Math.sin(userData.time * 2) * 0.05;
		butterfly.scale.set(scale, scale, scale);

		// Wrap around
		if (Math.abs(butterfly.position.x) > 80) butterfly.position.x *= -0.9;
		if (Math.abs(butterfly.position.y) > 80) butterfly.position.y *= -0.9;
	});

	// Update particle trail (works with dynamic count)
	if (particles.points) {
		const posAttr = particles.points.geometry.attributes.position;
		for (let i = 0; i < particles.life.length; i++) {
			particles.life[i] -= 0.005;
			if (particles.life[i] <= 0) {
				particles.life[i] = 1;
				particles.positions[i * 3] = (Math.random() - 0.5) * 200;
				particles.positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
				particles.positions[i * 3 + 2] = Math.random() * 60 - 30;
			}

			// Gravity effect
			particles.positions[i * 3 + 1] -= 0.15;
		}
		posAttr.needsUpdate = true;
	}

	// Update stars twinkling
	const starsObjects = scene.children.filter(obj => obj.userData.originalPositions);
	starsObjects.forEach(stars => {
		const posAttr = stars.geometry.attributes.position;
		const sizeAttr = stars.geometry.attributes.size;
		const count = posAttr.count;

		for (let i = 0; i < count; i++) {
			stars.userData.twinklePhase[i] += 0.01 + Math.random() * 0.02;
			const twinkle = Math.sin(stars.userData.twinklePhase[i]) * 0.5 + 0.5;
			sizeAttr.array[i] = (Math.random() * 1.5 + 0.5) * (0.6 + twinkle * 0.4);
		}
		sizeAttr.needsUpdate = true;
	});

	// Animated bloom (only when bloomPass exists)
	if (bloomPass) {
		bloomPass.strength = 1.6 + Math.sin(time * 0.3) * 0.4;
		bloomPass.radius = 0.5 + Math.sin(time * 0.2) * 0.1;
	}

	// Render using composer when enabled, otherwise draw directly
	if (composer) {
		composer.render();
	} else {
		renderer.render(scene, camera);
	}
}

// ============================================
// EVENT HANDLERS
// ============================================

function onWindowResize() {
	const width = window.innerWidth;
	const height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
	if (composer) composer.setSize(width, height);
}

function onMouseMove(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onScroll() {
	const scrollY = window.scrollY;
	const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
	const scrollPercent = scrollY / maxScroll;

	// Adjust camera based on scroll
	camera.position.z = 60 + scrollPercent * 20;
	camera.rotation.x = scrollPercent * 0.2;

	// Update bloom based on scroll
	bloomPass.strength = 1.6 + Math.sin(time * 0.3) * 0.4 + scrollPercent * 0.3;
	
	// Update geometric shapes brightness based on scroll
	geometricShapes.forEach((shape, index) => {
		const intensity = 0.3 + Math.sin(time * 0.5 + scrollPercent * 5 + index) * 0.2;
		shape.material.emissiveIntensity = intensity;
	});
}

// ============================================
// UI HANDLERS
// ============================================

function setupUIHandlers() {
	// Smooth scroll for nav links
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const target = document.querySelector(link.getAttribute('href'));
			if (target) {
				target.scrollIntoView({ behavior: 'smooth' });
				document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
				link.classList.add('active');
			}
		});
	});

	// CV Modal handlers
	const modal = document.getElementById('cvModal');
	const viewCVBtn = document.getElementById('viewCVBtn');
	const closeModal = document.getElementById('closeModal');

	viewCVBtn.addEventListener('click', () => {
		modal.classList.add('active');
	});

	closeModal.addEventListener('click', () => {
		modal.classList.remove('active');
	});

	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			modal.classList.remove('active');
		}
	});

	// Download CV
	document.getElementById('downloadCVBtn').addEventListener('click', () => {
		alert('Fitur download CV akan segera tersedia.\nSilakan hubungi untuk informasi lebih lanjut.');
		// Uncomment untuk download file:
		// window.location.href = 'CV.pdf';
	});
}

// ============================================
// FLOATING GEOMETRIC SHAPES (Enhanced Background)
// ============================================

function createFloatingGeometricShapes() {
	const shapes = [];
	const shapeCount = 5; // Mobile-optimized count
	
	// Check if mobile - reduce count for performance
	const isMobile = window.innerWidth <= 768;
	const actualCount = isMobile ? 3 : shapeCount;
	
	for (let i = 0; i < actualCount; i++) {
		const shapeType = ['sphere', 'cube', 'torus'][i % 3];
		let geometry;
		
		if (shapeType === 'sphere') {
			geometry = new THREE.IcosahedronGeometry(Math.random() * 2 + 1, 4);
		} else if (shapeType === 'cube') {
			geometry = new THREE.BoxGeometry(
				Math.random() * 2 + 1,
				Math.random() * 2 + 1,
				Math.random() * 2 + 1
			);
		} else {
			geometry = new THREE.TorusGeometry(Math.random() * 1.5 + 0.5, 0.4, 8, 100);
		}
		
		const material = new THREE.MeshStandardMaterial({
			color: 0x8a2be2,
			emissive: 0x6a0dad,
			emissiveIntensity: 0.4,
			roughness: 0.5,
			metalness: 0.3,
			wireframe: Math.random() > 0.5
		});
		
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(
			(Math.random() - 0.5) * 120,
			(Math.random() - 0.5) * 120,
			(Math.random() - 0.5) * 80
		);
		
		mesh.userData = {
			targetX: mesh.position.x + (Math.random() - 0.5) * 40,
			targetY: mesh.position.y + (Math.random() - 0.5) * 40,
			targetZ: mesh.position.z + (Math.random() - 0.5) * 40,
			rotationSpeed: {
				x: (Math.random() - 0.5) * 0.002,
				y: (Math.random() - 0.5) * 0.002,
				z: (Math.random() - 0.5) * 0.002
			},
			moveSpeed: Math.random() * 0.003 + 0.001
		};
		
		scene.add(mesh);
		shapes.push(mesh);
	}
	
	geometricShapes = shapes;
	return shapes;
}

let geometricShapes = [];

// ============================================
// FLOATING BUTTERFLIES (DOM-based)
// ============================================

function createFloatingButterflies() {
	const butterflyCount = 8;
	const container = document.body;

	for (let i = 0; i < butterflyCount; i++) {
		const butterfly = document.createElement('div');
		butterfly.className = 'floating-butterfly';

		// Insert emoji so it renders across platforms
		butterfly.textContent = '🦋';

		// Random positioning (offset by half width/height to center)
		const startX = Math.random() * window.innerWidth;
		const startY = Math.random() * window.innerHeight;
		const duration = Math.random() * 15 + 20; // 20-35 seconds
		const delay = Math.random() * 5;

		// Center the emoji by offsetting half of element size (30px)
		butterfly.style.left = (startX - 15) + 'px';
		butterfly.style.top = (startY - 15) + 'px';
		butterfly.style.animationDuration = duration + 's';
		butterfly.style.animationDelay = delay + 's';
		// Fallback inline color (most emoji render in color on Windows; this helps text-shadow glow)
		butterfly.style.color = '#b88bff';
		butterfly.style.webkitTextStroke = '0px';
		container.appendChild(butterfly);
	}
}

// ============================================
// START
// ============================================

window.addEventListener('load', () => {
	init();
	if (!isMobileDevice()) createFloatingButterflies();
	initNavbarAnimations();
});

// ============================================
// NAVBAR ANIMATIONS
// ============================================

function initNavbarAnimations() {
	// Hamburger Menu
	const hamburger = document.getElementById('hamburger');
	const navLinksMenu = document.getElementById('navLinks');
	
	if (hamburger) {
		hamburger.addEventListener('click', () => {
			hamburger.classList.toggle('active');
			navLinksMenu.classList.toggle('active');
		});
		
		// Close menu when a link is clicked
		document.querySelectorAll('#navLinks a').forEach(link => {
			link.addEventListener('click', () => {
				hamburger.classList.remove('active');
				navLinksMenu.classList.remove('active');
			});
		});
		
		// Close menu when clicking outside
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.navbar')) {
				hamburger.classList.remove('active');
				navLinksMenu.classList.remove('active');
			}
		});
	}
	
	// Smooth scrolling and active link tracking
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'start'
				});
			}
		});
	});

	// Update active nav link on scroll
	const navLinkElements = document.querySelectorAll('.nav-link');
	const sections = document.querySelectorAll('section');

	window.addEventListener('scroll', () => {
		let current = '';
		
		sections.forEach(section => {
			const sectionTop = section.offsetTop;
			const sectionHeight = section.clientHeight;
			
			if (pageYOffset >= sectionTop - 100) {
				current = section.getAttribute('id');
			}
		});
		
		navLinkElements.forEach(link => {
			link.classList.remove('active');
			if (link.getAttribute('href') === `#${current}`) {
				link.classList.add('active');
			}
		});
	});

	// Navbar scroll effect - add shadow when scrolling
	const navbar = document.querySelector('.navbar');
	let lastScroll = 0;

	window.addEventListener('scroll', () => {
		const currentScroll = window.pageYOffset;
		
		if (currentScroll <= 0) {
			navbar.style.boxShadow = 'none';
			navbar.style.borderBottomColor = 'rgba(138, 43, 226, 0.2)';
		} else {
			navbar.style.boxShadow = '0 10px 30px rgba(138, 43, 226, 0.2)';
			navbar.style.borderBottomColor = 'rgba(138, 43, 226, 0.5)';
		}
		
		lastScroll = currentScroll;
	});

	// Logo dot hover animation
	const logoDot = document.querySelector('.logo-dot');
	if (logoDot) {
		logoDot.addEventListener('mouseenter', function() {
			this.style.animation = 'none';
			setTimeout(() => {
				this.style.animation = 'pulse 0.6s ease-in-out';
			}, 10);
		});
	}

	console.log('✨ Navbar animations initialized!');
}

