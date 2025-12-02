import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { MoonPosition, MoonIllumination } from '../types/lunar';

interface Scene3DProps {
  moonPosition: MoonPosition | null;
  moonIllumination: MoonIllumination | null;
}

export default function Scene3D({ moonPosition, moonIllumination }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    moon: THREE.Mesh;
    moonGlow: THREE.Mesh;
    altitudeLine: THREE.Line;
    horizonRing: THREE.Line;
    cardinalLabels: THREE.Sprite[];
  } | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 3, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 1.5;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x222233, 0.5);
    scene.add(ambientLight);

    // Sun light (for moon illumination)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(10, 10, 10);
    scene.add(sunLight);

    // Create dome (sky hemisphere)
    const domeGeometry = new THREE.SphereGeometry(10, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a0a1a,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8,
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    scene.add(dome);

    // Stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starsPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI / 2;
      const r = 9.5;
      starsPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starsPositions[i * 3 + 1] = r * Math.cos(phi);
      starsPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Horizon ring
    const horizonGeometry = new THREE.RingGeometry(4.9, 5, 64);
    const horizonMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const horizonRingMesh = new THREE.Mesh(horizonGeometry, horizonMaterial);
    horizonRingMesh.rotation.x = -Math.PI / 2;
    scene.add(horizonRingMesh);

    // Horizon circle line
    const horizonLineGeometry = new THREE.BufferGeometry();
    const horizonPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      horizonPoints.push(new THREE.Vector3(5 * Math.cos(angle), 0, 5 * Math.sin(angle)));
    }
    horizonLineGeometry.setFromPoints(horizonPoints);
    const horizonLineMaterial = new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 });
    const horizonRing = new THREE.Line(horizonLineGeometry, horizonLineMaterial);
    scene.add(horizonRing);

    // Ground plane
    const groundGeometry = new THREE.CircleGeometry(5, 64);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x12121a,
      transparent: true,
      opacity: 0.9,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // Observer marker
    const observerGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16);
    const observerMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const observer = new THREE.Mesh(observerGeometry, observerMaterial);
    observer.position.y = 0.25;
    scene.add(observer);

    // Moon
    const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb800,
      emissive: 0xffb800,
      emissiveIntensity: 0.3,
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    // Moon glow
    const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffb800,
      transparent: true,
      opacity: 0.15,
    });
    const moonGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(moonGlow);

    // Altitude line (from observer to moon)
    const altitudeGeometry = new THREE.BufferGeometry();
    const altitudeLineMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.5,
    });
    const altitudeLine = new THREE.Line(altitudeGeometry, altitudeLineMaterial);
    scene.add(altitudeLine);

    // Cardinal labels
    const cardinalLabels: THREE.Sprite[] = [];
    const cardinals = [
      { label: 'N', angle: 0 },
      { label: 'E', angle: Math.PI / 2 },
      { label: 'S', angle: Math.PI },
      { label: 'O', angle: -Math.PI / 2 },
    ];

    cardinals.forEach(({ label, angle }) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 32, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(5.5 * Math.sin(angle), 0.3, 5.5 * Math.cos(angle));
      sprite.scale.set(0.8, 0.8, 1);
      scene.add(sprite);
      cardinalLabels.push(sprite);
    });

    // Zenith label
    const zenitCanvas = document.createElement('canvas');
    zenitCanvas.width = 128;
    zenitCanvas.height = 64;
    const zenitCtx = zenitCanvas.getContext('2d');
    if (zenitCtx) {
      zenitCtx.fillStyle = '#71717a';
      zenitCtx.font = '24px Inter, sans-serif';
      zenitCtx.textAlign = 'center';
      zenitCtx.textBaseline = 'middle';
      zenitCtx.fillText('Cenit', 64, 32);
    }
    const zenitTexture = new THREE.CanvasTexture(zenitCanvas);
    const zenitMaterial = new THREE.SpriteMaterial({ map: zenitTexture, transparent: true });
    const zenitSprite = new THREE.Sprite(zenitMaterial);
    zenitSprite.position.set(0, 5.5, 0);
    zenitSprite.scale.set(1.2, 0.6, 1);
    scene.add(zenitSprite);

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      moon,
      moonGlow,
      altitudeLine,
      horizonRing,
      cardinalLabels,
    };

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const { camera, renderer } = sceneRef.current;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update moon position
  useEffect(() => {
    if (!sceneRef.current || !moonPosition) return;

    const { moon, moonGlow, altitudeLine } = sceneRef.current;
    const radius = 4;

    // Convert altitude (degrees) and azimuth (degrees from north) to 3D position
    const altRad = (moonPosition.altitude * Math.PI) / 180;
    const azRad = (moonPosition.azimuth * Math.PI) / 180;

    // Calculate 3D position
    // Azimuth: 0 = North (positive Z), 90 = East (positive X)
    const x = radius * Math.cos(altRad) * Math.sin(azRad);
    const y = radius * Math.sin(altRad);
    const z = radius * Math.cos(altRad) * Math.cos(azRad);

    // Animate moon position
    const targetPosition = new THREE.Vector3(x, Math.max(0.5, y), z);
    moon.position.lerp(targetPosition, 0.1);
    moonGlow.position.copy(moon.position);

    // Update altitude line
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setFromPoints([
      new THREE.Vector3(0, 0.5, 0),
      moon.position.clone(),
    ]);
    altitudeLine.geometry.dispose();
    altitudeLine.geometry = lineGeometry;

  }, [moonPosition]);

  // Update moon appearance based on illumination
  useEffect(() => {
    if (!sceneRef.current || !moonIllumination) return;

    const { moon } = sceneRef.current;
    const material = moon.material as THREE.MeshStandardMaterial;
    
    // Adjust emissive intensity based on illumination
    material.emissiveIntensity = 0.2 + moonIllumination.fraction * 0.5;
    
  }, [moonIllumination]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden border border-border-default bg-bg-base"
      />
      
      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-bg-overlay backdrop-blur-sm rounded-lg p-3 border border-border-subtle">
        <p className="text-body-sm text-text-secondary mb-1">Vista 3D del cielo</p>
        <p className="text-body-sm text-text-tertiary">Arrastra para rotar</p>
      </div>

      {moonPosition && (
        <div className="absolute bottom-4 right-4 bg-bg-overlay backdrop-blur-sm rounded-lg p-3 border border-border-subtle">
          <div className="flex items-center gap-2 text-body-sm">
            <div className="w-3 h-3 rounded-full bg-accent-secondary animate-pulse" />
            <span className="text-text-secondary">
              {moonPosition.altitude > 0 ? 'Luna visible' : 'Luna bajo horizonte'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
