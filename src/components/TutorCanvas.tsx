import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GestureType } from "../types";

interface TutorCanvasProps {
  currentGesture: GestureType;
  isSpeaking: boolean;
  isListening: boolean;
  viseme: { openness: number; pucker: number; smile: number };
  boardNotes?: string[];
  activeWord?: string;
  activePhonetic?: string;
}

export const TutorCanvas: React.FC<TutorCanvasProps> = ({
  currentGesture,
  isSpeaking,
  isListening,
  viseme,
  boardNotes = ["Welcome to class!", "Listen, speak, and practice."],
  activeWord,
  activePhonetic,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<"focus" | "wide" | "face">("focus");
  const [isOrbiting, setIsOrbiting] = useState(false);

  // References to animated 3D parts
  const animRefs = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    headGroup?: THREE.Group;
    jawMesh?: THREE.Mesh;
    upperLipMesh?: THREE.Mesh;
    lowerLipMesh?: THREE.Mesh;
    mouthCavity?: THREE.Mesh;
    leftEyelid?: THREE.Mesh;
    rightEyelid?: THREE.Mesh;
    leftEyeIris?: THREE.Mesh;
    rightEyeIris?: THREE.Mesh;
    leftEyebrow?: THREE.Mesh;
    rightEyebrow?: THREE.Mesh;
    torsoGroup?: THREE.Group;
    leftShoulder?: THREE.Group;
    rightShoulder?: THREE.Group;
    leftElbow?: THREE.Group;
    rightElbow?: THREE.Group;
    leftWrist?: THREE.Group;
    rightWrist?: THREE.Group;
    leftFingers?: THREE.Group[];
    rightFingers?: THREE.Group[];
    rightIndexFinger?: THREE.Mesh;
    rightThumb?: THREE.Mesh;
    rightHandFingers?: THREE.Group[];
    leftHandFingers?: THREE.Group[];
    boardTexture?: THREE.CanvasTexture;
    boardCanvas?: HTMLCanvasElement;
    pointerTarget?: THREE.Vector2;
  }>({});

  // Dynamic props ref for smooth 60fps render loop
  const propsRef = useRef({
    currentGesture,
    isSpeaking,
    isListening,
    viseme,
    boardNotes,
    activeWord,
    activePhonetic,
  });

  useEffect(() => {
    propsRef.current = {
      currentGesture,
      isSpeaking,
      isListening,
      viseme,
      boardNotes,
      activeWord,
      activePhonetic,
    };
    updateBoardTexture();
  }, [currentGesture, isSpeaking, isListening, viseme, boardNotes, activeWord, activePhonetic]);

  // Redraw the 3D Classroom Smartboard Canvas Texture
  const updateBoardTexture = () => {
    const { boardCanvas, boardTexture } = animRefs.current;
    if (!boardCanvas || !boardTexture) return;

    const ctx = boardCanvas.getContext("2d");
    if (!ctx) return;

    // Dark sleek chalkboard/smartboard
    ctx.fillStyle = "#16202c";
    ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

    // Subtle grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < boardCanvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, boardCanvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < boardCanvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(boardCanvas.width, y);
      ctx.stroke();
    }

    // Header bar
    ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
    ctx.fillRect(20, 20, boardCanvas.width - 40, 50);
    ctx.fillStyle = "#60a5fa";
    ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("SMART TUTOR BOARD", 40, 52);

    // Active Word Spotlight (if any)
    if (propsRef.current.activeWord) {
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 32px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(propsRef.current.activeWord, 40, 120);

      if (propsRef.current.activePhonetic) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "20px 'JetBrains Mono', monospace";
        ctx.fillText(propsRef.current.activePhonetic, 40, 155);
      }
    }

    // Notes bullets
    const startY = propsRef.current.activeWord ? 195 : 110;
    const notes = propsRef.current.boardNotes.slice(0, 5);

    notes.forEach((note, i) => {
      const y = startY + i * 42;
      // Bullet dot
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(45, y - 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "500 20px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(note, 65, y);
    });

    boardTexture.needsUpdate = true;
  };

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0c121e");
    scene.fog = new THREE.FogExp2("#0c121e", 0.08);
    animRefs.current.scene = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 2.7);
    camera.lookAt(0, 1.35, 0);
    animRefs.current.camera = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.replaceChildren(renderer.domElement);
    animRefs.current.renderer = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight("#dce8ff", 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight("#ffffff", 1.8);
    keyLight.position.set(2.5, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const warmFill = new THREE.DirectionalLight("#fef08a", 0.7);
    warmFill.position.set(-2.5, 2.5, 2);
    scene.add(warmFill);

    const rimLight = new THREE.SpotLight("#38bdf8", 3.0, 10, Math.PI / 4, 0.5);
    rimLight.position.set(0, 3.5, -2);
    rimLight.lookAt(0, 1.3, 0);
    scene.add(rimLight);

    // 5. Classroom Environment Elements
    // Floor
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: "#182232",
      roughness: 0.6,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Smartboard backdrop
    const boardCanvas = document.createElement("canvas");
    boardCanvas.width = 1024;
    boardCanvas.height = 576;
    const boardTexture = new THREE.CanvasTexture(boardCanvas);
    animRefs.current.boardCanvas = boardCanvas;
    animRefs.current.boardTexture = boardTexture;

    const boardFrameGeo = new THREE.BoxGeometry(2.3, 1.35, 0.06);
    const boardFrameMat = new THREE.MeshStandardMaterial({
      color: "#78350f",
      roughness: 0.7,
    });
    const boardFrame = new THREE.Mesh(boardFrameGeo, boardFrameMat);
    boardFrame.position.set(1.15, 1.5, -0.6);
    boardFrame.castShadow = true;
    boardFrame.receiveShadow = true;
    scene.add(boardFrame);

    const boardScreenGeo = new THREE.PlaneGeometry(2.2, 1.25);
    const boardScreenMat = new THREE.MeshBasicMaterial({ map: boardTexture });
    const boardScreen = new THREE.Mesh(boardScreenGeo, boardScreenMat);
    boardScreen.position.set(1.15, 1.5, -0.56);
    scene.add(boardScreen);

    // Soft classroom ambient elements (bookshelf accent)
    const shelfGeo = new THREE.BoxGeometry(0.8, 1.8, 0.25);
    const shelfMat = new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.8 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(-1.8, 1.0, -0.8);
    shelf.receiveShadow = true;
    scene.add(shelf);

    // Colorful books on shelf
    const bookColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
    bookColors.forEach((color, i) => {
      const bookGeo = new THREE.BoxGeometry(0.08, 0.35 + (i % 3) * 0.05, 0.2);
      const bookMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      const book = new THREE.Mesh(bookGeo, bookMat);
      book.position.set(-1.95 + i * 0.1, 1.2, -0.78);
      scene.add(book);
    });

    // 6. BUILD THE 3D HUMANOID TUTOR (HIGH FIDELITY RIGGED MODEL)
    const tutorRoot = new THREE.Group();
    tutorRoot.position.set(-0.25, 0, 0); // Positioned slightly left so the smartboard is clearly visible
    scene.add(tutorRoot);

    // Premium tailored materials
    const suitNavyMat = new THREE.MeshStandardMaterial({
      color: "#1e293b",
      roughness: 0.65,
      metalness: 0.15,
    });
    const suitLapelMat = new THREE.MeshStandardMaterial({
      color: "#0f172a",
      roughness: 0.5,
      metalness: 0.2,
    });
    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: "#f59e0b",
      metalness: 0.85,
      roughness: 0.25,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: "#f8d7c4",
      roughness: 0.45,
      metalness: 0.04,
    });
    const skinBlushMat = new THREE.MeshStandardMaterial({
      color: "#e8998d",
      roughness: 0.5,
      metalness: 0.02,
    });

    // Base Pelvis & Lower Torso
    const hipsGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.25, 24);
    const hips = new THREE.Mesh(hipsGeo, suitNavyMat);
    hips.position.y = 0.85;
    hips.castShadow = true;
    tutorRoot.add(hips);

    // Belt & Buckle
    const beltMat = new THREE.MeshStandardMaterial({ color: "#171717", roughness: 0.4 });
    const beltGeo = new THREE.CylinderGeometry(0.245, 0.245, 0.04, 24);
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 0.96;
    tutorRoot.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.045, 0.038, 0.02);
    const buckle = new THREE.Mesh(buckleGeo, goldAccentMat);
    buckle.position.set(0, 0.96, 0.24);
    tutorRoot.add(buckle);

    // Legs (standing tutor with stylish dress shoes)
    const legGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.8, 18);
    const leftLeg = new THREE.Mesh(legGeo, suitNavyMat);
    leftLeg.position.set(-0.13, 0.42, 0);
    leftLeg.castShadow = true;
    tutorRoot.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, suitNavyMat);
    rightLeg.position.set(0.13, 0.42, 0);
    rightLeg.castShadow = true;
    tutorRoot.add(rightLeg);

    // Dress shoes
    const shoeMat = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.25 });
    const shoeGeo = new THREE.BoxGeometry(0.1, 0.07, 0.2);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.13, 0.035, 0.04);
    leftShoe.castShadow = true;
    tutorRoot.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.13, 0.035, 0.04);
    rightShoe.castShadow = true;
    tutorRoot.add(rightShoe);

    // Upper Torso / Chest
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 1.0, 0);
    tutorRoot.add(torsoGroup);
    animRefs.current.torsoGroup = torsoGroup;

    // Sculpted Suit Jacket Chest
    const chestGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.44, 24);
    chestGeo.scale(1.06, 1.0, 0.85); // Natural human chest proportion (wider than deep)
    const chest = new THREE.Mesh(chestGeo, suitNavyMat);
    chest.position.y = 0.21;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Suit Lapels (V-neck tailored jacket)
    const lapelGeo = new THREE.BoxGeometry(0.05, 0.32, 0.03);
    const leftLapel = new THREE.Mesh(lapelGeo, suitLapelMat);
    leftLapel.position.set(-0.085, 0.22, 0.22);
    leftLapel.rotation.z = -0.32;
    leftLapel.rotation.x = -0.15;
    torsoGroup.add(leftLapel);

    const rightLapel = new THREE.Mesh(lapelGeo, suitLapelMat);
    rightLapel.position.set(0.085, 0.22, 0.22);
    rightLapel.rotation.z = 0.32;
    rightLapel.rotation.x = -0.15;
    torsoGroup.add(rightLapel);

    // Inner Crisp Oxford Shirt
    const shirtGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.43, 16);
    const shirtMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.5 });
    const shirt = new THREE.Mesh(shirtGeo, shirtMat);
    shirt.position.set(0, 0.22, 0.14);
    torsoGroup.add(shirt);

    // Tie / Collar
    const tieGeo = new THREE.ConeGeometry(0.045, 0.28, 4);
    const tieMat = new THREE.MeshStandardMaterial({ color: "#991b1b", roughness: 0.35 });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.rotation.z = Math.PI;
    tie.position.set(0, 0.23, 0.24);
    torsoGroup.add(tie);

    // Gold Tie Bar / Clip
    const tieClipGeo = new THREE.BoxGeometry(0.04, 0.008, 0.015);
    const tieClip = new THREE.Mesh(tieClipGeo, goldAccentMat);
    tieClip.position.set(0.005, 0.24, 0.25);
    torsoGroup.add(tieClip);

    // Shirt Collar
    const collarMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4 });
    const collarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), collarMat);
    collarLeft.position.set(-0.05, 0.37, 0.16);
    collarLeft.rotation.z = -0.5;
    torsoGroup.add(collarLeft);

    const collarRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), collarMat);
    collarRight.position.set(0.05, 0.37, 0.16);
    collarRight.rotation.z = 0.5;
    torsoGroup.add(collarRight);

    // Neck with anatomical Adam's apple & sternocleidomastoid taper
    const neckGeo = new THREE.CylinderGeometry(0.088, 0.098, 0.17, 20);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.46, 0);
    neck.castShadow = true;
    torsoGroup.add(neck);

    // HEAD GROUP (Pivots for looking around and nodding)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.62, 0.02);
    torsoGroup.add(headGroup);
    animRefs.current.headGroup = headGroup;

    // Sculpted Cranium / Jaw / Cheeks (Natural Human Head Shape)
    const headGeo = new THREE.SphereGeometry(0.185, 32, 28);
    headGeo.scale(1.0, 1.18, 1.08);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Sculpted Jawline & Chin
    const chinGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.1, 16);
    chinGeo.scale(1.2, 1.0, 1.1);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.13, 0.06);
    chin.rotation.x = -0.3;
    headGroup.add(chin);

    // Cheekbones (subtle natural contouring)
    const cheekGeo = new THREE.SphereGeometry(0.055, 16, 16);
    cheekGeo.scale(1.0, 0.7, 0.8);
    const leftCheek = new THREE.Mesh(cheekGeo, skinBlushMat);
    leftCheek.position.set(-0.11, -0.01, 0.13);
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, skinBlushMat);
    rightCheek.position.set(0.11, -0.01, 0.13);
    headGroup.add(rightCheek);

    // Natural Ears
    const earGeo = new THREE.CylinderGeometry(0.028, 0.022, 0.065, 12);
    earGeo.scale(0.5, 1.0, 1.0);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.185, 0.02, 0.01);
    leftEar.rotation.z = -0.2;
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.185, 0.02, 0.01);
    rightEar.rotation.z = 0.2;
    headGroup.add(rightEar);

    // Sculpted Hair Style (Textured waves + side parts)
    const hairMat = new THREE.MeshStandardMaterial({
      color: "#26201e",
      roughness: 0.8,
      metalness: 0.1,
    });
    const hairBaseGeo = new THREE.SphereGeometry(0.20, 28, 24);
    hairBaseGeo.scale(1.03, 1.12, 1.06);
    const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
    hairBase.position.set(0, 0.05, -0.02);
    headGroup.add(hairBase);

    // Layered Hair Fringe / Volume
    const fringeGeo1 = new THREE.CylinderGeometry(0.18, 0.17, 0.09, 20);
    const fringe1 = new THREE.Mesh(fringeGeo1, hairMat);
    fringe1.rotation.x = 0.45;
    fringe1.rotation.z = -0.15;
    fringe1.position.set(-0.02, 0.17, 0.12);
    headGroup.add(fringe1);

    const fringeGeo2 = new THREE.SphereGeometry(0.09, 16, 16);
    fringeGeo2.scale(1.5, 0.7, 1.0);
    const fringe2 = new THREE.Mesh(fringeGeo2, hairMat);
    fringe2.position.set(0.06, 0.19, 0.11);
    fringe2.rotation.z = 0.2;
    headGroup.add(fringe2);

    // EYES SYSTEM (High-fidelity expressive gaze)
    const eyeScleraMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.15 });
    const irisMat = new THREE.MeshStandardMaterial({ color: "#2563eb", roughness: 0.2, metalness: 0.1 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: "#000000" });
    const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });

    // Left Eye
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.064, 0.035, 0.172);
    headGroup.add(leftEyeGroup);

    const leftEyeSclera = new THREE.Mesh(new THREE.SphereGeometry(0.034, 20, 20), eyeScleraMat);
    leftEyeGroup.add(leftEyeSclera);

    const leftEyeIris = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 20), irisMat);
    leftEyeIris.rotation.x = Math.PI / 2;
    leftEyeIris.position.z = 0.029;
    leftEyeGroup.add(leftEyeIris);
    animRefs.current.leftEyeIris = leftEyeIris;

    const leftPupil = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.012, 16), pupilMat);
    leftPupil.rotation.x = Math.PI / 2;
    leftPupil.position.z = 0.031;
    leftEyeGroup.add(leftPupil);

    // Specular catchlight (gives lifelike gleam to eyes)
    const leftGleam = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), eyeHighlightMat);
    leftGleam.position.set(0.007, 0.008, 0.034);
    leftEyeGroup.add(leftGleam);

    // Left Eyelid (Blinking)
    const leftEyelid = new THREE.Mesh(new THREE.SphereGeometry(0.036, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), skinMat);
    leftEyelid.rotation.x = -0.3;
    leftEyeGroup.add(leftEyelid);
    animRefs.current.leftEyelid = leftEyelid;

    // Right Eye
    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.064, 0.035, 0.172);
    headGroup.add(rightEyeGroup);

    const rightEyeSclera = new THREE.Mesh(new THREE.SphereGeometry(0.034, 20, 20), eyeScleraMat);
    rightEyeGroup.add(rightEyeSclera);

    const rightEyeIris = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 20), irisMat);
    rightEyeIris.rotation.x = Math.PI / 2;
    rightEyeIris.position.z = 0.029;
    rightEyeGroup.add(rightEyeIris);
    animRefs.current.rightEyeIris = rightEyeIris;

    const rightPupil = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.012, 16), pupilMat);
    rightPupil.rotation.x = Math.PI / 2;
    rightPupil.position.z = 0.031;
    rightEyeGroup.add(rightPupil);

    const rightGleam = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 8), eyeHighlightMat);
    rightGleam.position.set(0.007, 0.008, 0.034);
    rightEyeGroup.add(rightGleam);

    // Right Eyelid
    const rightEyelid = new THREE.Mesh(new THREE.SphereGeometry(0.036, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), skinMat);
    rightEyelid.rotation.x = -0.3;
    rightEyeGroup.add(rightEyelid);
    animRefs.current.rightEyelid = rightEyelid;

    // Eyebrows (Sculpted with arch)
    const browGeo = new THREE.BoxGeometry(0.068, 0.014, 0.018);
    const leftEyebrow = new THREE.Mesh(browGeo, hairMat);
    leftEyebrow.position.set(-0.065, 0.088, 0.185);
    leftEyebrow.rotation.z = 0.08;
    headGroup.add(leftEyebrow);
    animRefs.current.leftEyebrow = leftEyebrow;

    const rightEyebrow = new THREE.Mesh(browGeo, hairMat);
    rightEyebrow.position.set(0.065, 0.088, 0.185);
    rightEyebrow.rotation.z = -0.08;
    headGroup.add(rightEyebrow);
    animRefs.current.rightEyebrow = rightEyebrow;

    // Sculpted Nose (Bridge, Tip, Nostrils)
    const noseGroup = new THREE.Group();
    noseGroup.position.set(0, 0.01, 0.19);
    headGroup.add(noseGroup);

    const noseBridgeGeo = new THREE.ConeGeometry(0.024, 0.07, 6);
    const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
    noseBridge.rotation.x = -0.22;
    noseBridge.position.set(0, 0, 0.02);
    noseGroup.add(noseBridge);

    const noseTipGeo = new THREE.SphereGeometry(0.016, 12, 12);
    const noseTip = new THREE.Mesh(noseTipGeo, skinMat);
    noseTip.position.set(0, -0.03, 0.036);
    noseGroup.add(noseTip);

    // Academic Designer Glasses (Tortoiseshell / Titanium Finish)
    const glassFrameMat = new THREE.MeshStandardMaterial({
      color: "#0f172a",
      roughness: 0.25,
      metalness: 0.85,
    });
    const leftRing = new THREE.Mesh(new THREE.TorusGeometry(0.040, 0.0042, 14, 28), glassFrameMat);
    leftRing.position.set(-0.065, 0.035, 0.21);
    headGroup.add(leftRing);

    const rightRing = new THREE.Mesh(new THREE.TorusGeometry(0.040, 0.0042, 14, 28), glassFrameMat);
    rightRing.position.set(0.065, 0.035, 0.21);
    headGroup.add(rightRing);

    const glassBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.052, 8), glassFrameMat);
    glassBridge.rotation.z = Math.PI / 2;
    glassBridge.position.set(0, 0.038, 0.215);
    headGroup.add(glassBridge);

    // Glasses Temples (Arms extending back to ears)
    const templeGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.19, 8);
    const leftTemple = new THREE.Mesh(templeGeo, glassFrameMat);
    leftTemple.rotation.x = Math.PI / 2;
    leftTemple.position.set(-0.11, 0.035, 0.11);
    headGroup.add(leftTemple);

    const rightTemple = new THREE.Mesh(templeGeo, glassFrameMat);
    rightTemple.rotation.x = Math.PI / 2;
    rightTemple.position.set(0.11, 0.035, 0.11);
    headGroup.add(rightTemple);

    // MOUTH & LIPS SYSTEM (Advanced Viseme Morphing Anatomy)
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.078, 0.178);
    headGroup.add(mouthGroup);

    // Inner mouth cavity (dark realistic interior)
    const mouthCavityMat = new THREE.MeshBasicMaterial({ color: "#220808" });
    const mouthCavity = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.015, 18), mouthCavityMat);
    mouthCavity.rotation.x = Math.PI / 2;
    mouthCavity.position.set(0, 0, 0.006);
    mouthGroup.add(mouthCavity);
    animRefs.current.mouthCavity = mouthCavity;

    // Teeth (Upper & Lower dental arches)
    const teethMat = new THREE.MeshBasicMaterial({ color: "#f8fafc" });
    const upperTeeth = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.012, 0.012), teethMat);
    upperTeeth.position.set(0, 0.014, 0.014);
    mouthGroup.add(upperTeeth);

    const lowerTeeth = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.010, 0.012), teethMat);
    lowerTeeth.position.set(0, -0.014, 0.014);
    mouthGroup.add(lowerTeeth);

    // Anatomical Curvature Lips (Cupid's bow upper lip & plump lower lip)
    const lipMat = new THREE.MeshStandardMaterial({
      color: "#d46b74",
      roughness: 0.35,
    });

    const upperLipGeo = new THREE.BoxGeometry(0.065, 0.014, 0.018);
    const upperLipMesh = new THREE.Mesh(upperLipGeo, lipMat);
    upperLipMesh.position.set(0, 0.020, 0.020);
    mouthGroup.add(upperLipMesh);
    animRefs.current.upperLipMesh = upperLipMesh;

    const lowerLipGeo = new THREE.BoxGeometry(0.060, 0.016, 0.020);
    const lowerLipMesh = new THREE.Mesh(lowerLipGeo, lipMat);
    lowerLipMesh.position.set(0, -0.020, 0.020);
    mouthGroup.add(lowerLipMesh);
    animRefs.current.lowerLipMesh = lowerLipMesh;

    // Jaw pivot anchor
    const jawPivot = new THREE.Mesh(new THREE.SphereGeometry(0.01), skinMat);
    jawPivot.position.set(0, -0.02, 0);
    mouthGroup.add(jawPivot);
    animRefs.current.jawMesh = jawPivot;

    // 7. ARTICULATED ARMS AND ANATOMICAL HANDS FOR TUTOR GESTURES
    const armMat = suitNavyMat;

    // Helper to construct a realistic 5-finger hand with knuckle articulation
    const createRealisticHand = (isRight: boolean) => {
      const handRoot = new THREE.Group();

      // Palm (sculpted curved human palm)
      const palmGeo = new THREE.BoxGeometry(0.065, 0.075, 0.028);
      const palmMesh = new THREE.Mesh(palmGeo, skinMat);
      palmMesh.position.set(0, -0.038, 0);
      palmMesh.castShadow = true;
      handRoot.add(palmMesh);

      // Thumb
      const thumbRoot = new THREE.Group();
      thumbRoot.position.set(isRight ? -0.034 : 0.034, -0.025, 0.01);
      thumbRoot.rotation.z = isRight ? 0.45 : -0.45;
      handRoot.add(thumbRoot);

      const thumbProximal = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.008, 0.028, 10), skinMat);
      thumbProximal.position.y = -0.014;
      thumbRoot.add(thumbProximal);

      const thumbTip = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.008, 0.022, 10), skinMat);
      thumbTip.position.y = -0.036;
      thumbTip.rotation.x = 0.2;
      thumbRoot.add(thumbTip);

      // 4 Articulated Fingers (Index, Middle, Ring, Pinky)
      const fingerGroups: THREE.Group[] = [];
      const fingerConfigs = [
        { x: isRight ? 0.024 : -0.024, len: 0.052, r: 0.0075, isIndex: true },
        { x: isRight ? 0.008 : -0.008, len: 0.056, r: 0.008, isIndex: false },
        { x: isRight ? -0.008 : 0.008, len: 0.050, r: 0.0075, isIndex: false },
        { x: isRight ? -0.024 : 0.024, len: 0.042, r: 0.0068, isIndex: false },
      ];

      fingerConfigs.forEach((cfg) => {
        const fingerRoot = new THREE.Group();
        fingerRoot.position.set(cfg.x, -0.074, 0);
        handRoot.add(fingerRoot);

        // Proximal phalanx
        const f1 = new THREE.Mesh(new THREE.CylinderGeometry(cfg.r, cfg.r * 0.9, cfg.len * 0.55, 10), skinMat);
        f1.position.y = -cfg.len * 0.275;
        f1.castShadow = true;
        fingerRoot.add(f1);

        // Distal phalanx
        const f2 = new THREE.Mesh(new THREE.CylinderGeometry(cfg.r * 0.85, cfg.r * 0.7, cfg.len * 0.45, 10), skinMat);
        f2.position.y = -cfg.len * 0.72;
        f2.castShadow = true;
        fingerRoot.add(f2);

        fingerGroups.push(fingerRoot);
      });

      return {
        handRoot,
        thumbMesh: thumbRoot as unknown as THREE.Mesh,
        indexMesh: fingerGroups[0] as unknown as THREE.Mesh,
        fingerGroups,
      };
    };

    // Left Arm (Student's Right)
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.32, 0.35, 0);
    torsoGroup.add(leftShoulder);
    animRefs.current.leftShoulder = leftShoulder;

    // Shoulder Pad / Jacket Sleeve Cap
    const leftPadGeo = new THREE.SphereGeometry(0.08, 16, 16);
    leftPadGeo.scale(1.1, 0.8, 1.0);
    const leftPad = new THREE.Mesh(leftPadGeo, suitNavyMat);
    leftShoulder.add(leftPad);

    const leftUpperArmGeo = new THREE.CylinderGeometry(0.068, 0.056, 0.28, 18);
    leftUpperArmGeo.translate(0, -0.14, 0);
    const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, armMat);
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.28, 0);
    leftShoulder.add(leftElbow);
    animRefs.current.leftElbow = leftElbow;

    const leftForearmGeo = new THREE.CylinderGeometry(0.056, 0.046, 0.26, 18);
    leftForearmGeo.translate(0, -0.13, 0);
    const leftForearm = new THREE.Mesh(leftForearmGeo, armMat);
    leftElbow.add(leftForearm);

    // Left Wrist & Suit Cuff
    const leftWrist = new THREE.Group();
    leftWrist.position.set(0, -0.26, 0);
    leftElbow.add(leftWrist);
    animRefs.current.leftWrist = leftWrist;

    const leftCuffGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.02, 16);
    const leftCuff = new THREE.Mesh(leftCuffGeo, collarMat);
    leftCuff.position.set(0, -0.01, 0);
    leftWrist.add(leftCuff);

    // Left Hand
    const leftHandObj = createRealisticHand(false);
    leftWrist.add(leftHandObj.handRoot);
    animRefs.current.leftHandFingers = leftHandObj.fingerGroups;

    // Right Arm (Pointing / Gesturing towards Smartboard)
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.32, 0.35, 0);
    torsoGroup.add(rightShoulder);
    animRefs.current.rightShoulder = rightShoulder;

    const rightPad = new THREE.Mesh(leftPadGeo, suitNavyMat);
    rightShoulder.add(rightPad);

    const rightUpperArmGeo = new THREE.CylinderGeometry(0.068, 0.056, 0.28, 18);
    rightUpperArmGeo.translate(0, -0.14, 0);
    const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, armMat);
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.28, 0);
    rightShoulder.add(rightElbow);
    animRefs.current.rightElbow = rightElbow;

    const rightForearmGeo = new THREE.CylinderGeometry(0.056, 0.046, 0.26, 18);
    rightForearmGeo.translate(0, -0.13, 0);
    const rightForearm = new THREE.Mesh(rightForearmGeo, armMat);
    rightElbow.add(rightForearm);

    const rightWrist = new THREE.Group();
    rightWrist.position.set(0, -0.26, 0);
    rightElbow.add(rightWrist);
    animRefs.current.rightWrist = rightWrist;

    const rightCuff = new THREE.Mesh(leftCuffGeo, collarMat);
    rightCuff.position.set(0, -0.01, 0);
    rightWrist.add(rightCuff);

    // Right Hand
    const rightHandObj = createRealisticHand(true);
    rightWrist.add(rightHandObj.handRoot);
    animRefs.current.rightIndexFinger = rightHandObj.indexMesh;
    animRefs.current.rightThumb = rightHandObj.thumbMesh;
    animRefs.current.rightHandFingers = rightHandObj.fingerGroups;

    // Update board once
    updateBoardTexture();

    // 8. ANIMATION RENDER LOOP (60 FPS)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;
    let mousePos = new THREE.Vector2(0, 0);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.set(x, y);
    };

    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const {
        currentGesture,
        isSpeaking,
        isListening,
        viseme,
      } = propsRef.current;

      // Natural breathing motion
      if (animRefs.current.torsoGroup) {
        animRefs.current.torsoGroup.position.y = 1.0 + Math.sin(time * 1.8) * 0.012;
      }

      // Blinking mechanics
      blinkTimer += delta;
      if (blinkTimer > 3.5 + Math.random() * 2.0) {
        isBlinking = true;
        blinkTimer = 0;
      }
      const blinkProgress = blinkTimer * 10;
      if (isBlinking) {
        const blinkRot = Math.sin(Math.min(blinkProgress, Math.PI)) * 0.85;
        if (animRefs.current.leftEyelid) animRefs.current.leftEyelid.rotation.x = -0.3 + blinkRot;
        if (animRefs.current.rightEyelid) animRefs.current.rightEyelid.rotation.x = -0.3 + blinkRot;
        if (blinkProgress >= Math.PI) isBlinking = false;
      }

      // Head tracking towards cursor or smartboard
      if (animRefs.current.headGroup) {
        let targetRotY = mousePos.x * 0.35;
        let targetRotX = -mousePos.y * 0.25;

        // If pointing at the board, look towards the board
        if (currentGesture === "pointing") {
          targetRotY = 0.45;
          targetRotX = -0.05;
        } else if (currentGesture === "thinking") {
          targetRotY = -0.25;
          targetRotX = -0.25; // look up thoughtfully
        } else if (isListening) {
          targetRotY += Math.sin(time * 3) * 0.04; // subtle nodding when listening
          targetRotX += 0.08 + Math.cos(time * 3) * 0.05;
        } else if (isSpeaking) {
          targetRotX += Math.sin(time * 4) * 0.03; // natural speech head emphasis
        }

        // Smooth interpolation
        animRefs.current.headGroup.rotation.y = THREE.MathUtils.lerp(
          animRefs.current.headGroup.rotation.y,
          targetRotY,
          0.08
        );
        animRefs.current.headGroup.rotation.x = THREE.MathUtils.lerp(
          animRefs.current.headGroup.rotation.x,
          targetRotX,
          0.08
        );
      }

      // REAL-TIME LIP SYNC MORPHING
      if (animRefs.current.lowerLipMesh && animRefs.current.upperLipMesh && animRefs.current.mouthCavity) {
        let targetOpenness = viseme.openness;
        let targetSmile = viseme.smile;
        let targetPucker = viseme.pucker;

        if (isSpeaking) {
          // Dynamic rhythm overlay when speech synthesis is talking
          targetOpenness = Math.max(targetOpenness, 0.2 + (Math.sin(time * 12) + 1) * 0.25);
        } else if (isListening) {
          targetOpenness = 0.05;
          targetSmile = 0.3; // attentive friendly smile
        } else {
          targetOpenness = 0.02;
          targetSmile = 0.2;
        }

        // Jaw / Lower lip dropdown
        animRefs.current.lowerLipMesh.position.y = THREE.MathUtils.lerp(
          animRefs.current.lowerLipMesh.position.y,
          -0.018 - targetOpenness * 0.035,
          0.25
        );
        // Mouth cavity height scale
        animRefs.current.mouthCavity.scale.y = THREE.MathUtils.lerp(
          animRefs.current.mouthCavity.scale.y,
          1 + targetOpenness * 2.8,
          0.25
        );
        // Smile width scale
        animRefs.current.upperLipMesh.scale.x = THREE.MathUtils.lerp(
          animRefs.current.upperLipMesh.scale.x,
          1 + targetSmile * 0.3 - targetPucker * 0.25,
          0.2
        );
        animRefs.current.lowerLipMesh.scale.x = animRefs.current.upperLipMesh.scale.x;
      }

      // TEACHING HAND GESTURES ENGINE
      const {
        leftShoulder,
        rightShoulder,
        leftElbow,
        rightElbow,
        leftWrist,
        rightWrist,
        rightIndexFinger,
        rightThumb,
      } = animRefs.current;

      if (leftShoulder && rightShoulder && leftElbow && rightElbow && leftWrist && rightWrist) {
        // Target angles for each gesture pose
        let lShoulderX = 0.2, lShoulderY = 0, lShoulderZ = -0.2;
        let rShoulderX = 0.2, rShoulderY = 0, rShoulderZ = 0.2;
        let lElbowX = -0.4, lElbowY = 0, lElbowZ = 0;
        let rElbowX = -0.4, rElbowY = 0, rElbowZ = 0;
        let rWristX = 0, rWristY = 0, rWristZ = 0;

        switch (currentGesture) {
          case "pointing":
            // Right arm extends up and right towards the Smartboard
            rShoulderX = -0.9;
            rShoulderY = -0.6;
            rShoulderZ = 0.75;
            rElbowX = -0.25;
            rElbowY = -0.2;
            rWristX = -0.3;
            rWristY = -0.4;
            // Left arm held politely near waist
            lShoulderX = -0.4;
            lShoulderZ = -0.2;
            lElbowX = -0.9;
            break;

          case "explaining":
            // Both hands up to chest height, undulating with speech
            const talkWave = Math.sin(time * 3) * 0.12;
            lShoulderX = -0.7 + talkWave;
            lShoulderZ = -0.4;
            lElbowX = -1.1 + talkWave * 0.5;

            rShoulderX = -0.7 - talkWave;
            rShoulderZ = 0.4;
            rElbowX = -1.1 - talkWave * 0.5;
            break;

          case "welcoming":
            // Open arms wide, palms forward
            lShoulderX = -0.6;
            lShoulderZ = -0.7;
            lElbowX = -0.5;

            rShoulderX = -0.6;
            rShoulderZ = 0.7;
            rElbowX = -0.5;
            break;

          case "praising":
            // Right hand gives thumbs up, left hand celebratory
            rShoulderX = -1.1;
            rShoulderY = -0.2;
            rShoulderZ = 0.3;
            rElbowX = -1.4;
            rWristX = 0.4;

            lShoulderX = -0.8;
            lShoulderZ = -0.3;
            lElbowX = -1.0;
            break;

          case "thinking":
            // Right hand touching chin, head tilted
            rShoulderX = -1.3;
            rShoulderY = -0.4;
            rShoulderZ = 0.5;
            rElbowX = -1.8;
            rWristX = -0.4;

            lShoulderX = -0.3;
            lShoulderZ = -0.2;
            lElbowX = -0.6;
            break;

          case "listening":
            // Attentive stance, hands loosely clasped or resting
            lShoulderX = -0.5;
            lShoulderZ = -0.2;
            lElbowX = -1.0;

            rShoulderX = -0.5;
            rShoulderZ = 0.2;
            rElbowX = -1.0;
            break;

          case "encouraging":
            // Warm open beckoning gestures
            const beckon = Math.sin(time * 4) * 0.15;
            lShoulderX = -0.8 + beckon;
            lShoulderZ = -0.3;
            lElbowX = -0.9;

            rShoulderX = -0.8 + beckon;
            rShoulderZ = 0.3;
            rElbowX = -0.9;
            break;

          case "idle":
          default:
            // Natural resting posture with slight idle breathing sway
            lShoulderX = 0.2 + Math.sin(time * 1.5) * 0.04;
            rShoulderX = 0.2 + Math.cos(time * 1.5) * 0.04;
            lElbowX = -0.3;
            rElbowX = -0.3;
            break;
        }

        // Apply smooth slerp/lerp to bones
        const s = 0.1;
        leftShoulder.rotation.x = THREE.MathUtils.lerp(leftShoulder.rotation.x, lShoulderX, s);
        leftShoulder.rotation.y = THREE.MathUtils.lerp(leftShoulder.rotation.y, lShoulderY, s);
        leftShoulder.rotation.z = THREE.MathUtils.lerp(leftShoulder.rotation.z, lShoulderZ, s);

        rightShoulder.rotation.x = THREE.MathUtils.lerp(rightShoulder.rotation.x, rShoulderX, s);
        rightShoulder.rotation.y = THREE.MathUtils.lerp(rightShoulder.rotation.y, rShoulderY, s);
        rightShoulder.rotation.z = THREE.MathUtils.lerp(rightShoulder.rotation.z, rShoulderZ, s);

        leftElbow.rotation.x = THREE.MathUtils.lerp(leftElbow.rotation.x, lElbowX, s);
        rightElbow.rotation.x = THREE.MathUtils.lerp(rightElbow.rotation.x, rElbowX, s);

        rightWrist.rotation.x = THREE.MathUtils.lerp(rightWrist.rotation.x, rWristX, s);

        // Adjust index finger and thumb for pointing vs praising
        if (rightIndexFinger) {
          const indexScale = currentGesture === "pointing" ? 1.4 : 1.0;
          rightIndexFinger.scale.set(indexScale, indexScale, indexScale);
        }
        if (rightThumb) {
          const thumbRot = currentGesture === "praising" ? 1.2 : 0.4;
          rightThumb.rotation.z = THREE.MathUtils.lerp(rightThumb.rotation.z, thumbRot, s);
        }

        // Articulated natural hand finger movements
        const rf = animRefs.current.rightHandFingers;
        if (rf && rf.length >= 4) {
          if (currentGesture === "pointing") {
            // Index finger (rf[0]) extended straight; middle, ring, pinky curled into palm
            rf[0].rotation.x = THREE.MathUtils.lerp(rf[0].rotation.x, 0.05, s);
            rf[1].rotation.x = THREE.MathUtils.lerp(rf[1].rotation.x, 1.4, s);
            rf[2].rotation.x = THREE.MathUtils.lerp(rf[2].rotation.x, 1.5, s);
            rf[3].rotation.x = THREE.MathUtils.lerp(rf[3].rotation.x, 1.55, s);
          } else if (currentGesture === "explaining" || currentGesture === "welcoming") {
            // Open expressive conversational palm with subtle oscillation
            const wave = Math.sin(time * 3) * 0.12;
            rf[0].rotation.x = THREE.MathUtils.lerp(rf[0].rotation.x, 0.15 + wave, s);
            rf[1].rotation.x = THREE.MathUtils.lerp(rf[1].rotation.x, 0.22 + wave, s);
            rf[2].rotation.x = THREE.MathUtils.lerp(rf[2].rotation.x, 0.28 + wave, s);
            rf[3].rotation.x = THREE.MathUtils.lerp(rf[3].rotation.x, 0.35 + wave, s);
          } else if (currentGesture === "praising") {
            // Thumbs up celebration - curled fingers
            rf[0].rotation.x = THREE.MathUtils.lerp(rf[0].rotation.x, 1.3, s);
            rf[1].rotation.x = THREE.MathUtils.lerp(rf[1].rotation.x, 1.35, s);
            rf[2].rotation.x = THREE.MathUtils.lerp(rf[2].rotation.x, 1.4, s);
            rf[3].rotation.x = THREE.MathUtils.lerp(rf[3].rotation.x, 1.45, s);
          } else {
            // Natural resting hand curvature
            rf[0].rotation.x = THREE.MathUtils.lerp(rf[0].rotation.x, 0.2, s);
            rf[1].rotation.x = THREE.MathUtils.lerp(rf[1].rotation.x, 0.28, s);
            rf[2].rotation.x = THREE.MathUtils.lerp(rf[2].rotation.x, 0.34, s);
            rf[3].rotation.x = THREE.MathUtils.lerp(rf[3].rotation.x, 0.4, s);
          }
        }

        const lf = animRefs.current.leftHandFingers;
        if (lf && lf.length >= 4) {
          if (currentGesture === "welcoming") {
            const wave = Math.sin(time * 3) * 0.1;
            lf[0].rotation.x = THREE.MathUtils.lerp(lf[0].rotation.x, 0.15 + wave, s);
            lf[1].rotation.x = THREE.MathUtils.lerp(lf[1].rotation.x, 0.22 + wave, s);
            lf[2].rotation.x = THREE.MathUtils.lerp(lf[2].rotation.x, 0.28 + wave, s);
            lf[3].rotation.x = THREE.MathUtils.lerp(lf[3].rotation.x, 0.35 + wave, s);
          } else {
            lf[0].rotation.x = THREE.MathUtils.lerp(lf[0].rotation.x, 0.2, s);
            lf[1].rotation.x = THREE.MathUtils.lerp(lf[1].rotation.x, 0.28, s);
            lf[2].rotation.x = THREE.MathUtils.lerp(lf[2].rotation.x, 0.34, s);
            lf[3].rotation.x = THREE.MathUtils.lerp(lf[3].rotation.x, 0.4, s);
          }
        }
      }

      // Camera view transition
      if (animRefs.current.camera) {
        let camTargetY = 1.45;
        let camTargetZ = 2.7;
        let camTargetX = 0.0;

        if (cameraMode === "wide") {
          camTargetY = 1.5;
          camTargetZ = 3.6;
          camTargetX = 0.3;
        } else if (cameraMode === "face") {
          camTargetY = 1.62;
          camTargetZ = 1.35;
          camTargetX = -0.22;
        }

        animRefs.current.camera.position.x = THREE.MathUtils.lerp(animRefs.current.camera.position.x, camTargetX, 0.05);
        animRefs.current.camera.position.y = THREE.MathUtils.lerp(animRefs.current.camera.position.y, camTargetY, 0.05);
        animRefs.current.camera.position.z = THREE.MathUtils.lerp(animRefs.current.camera.position.z, camTargetZ, 0.05);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && animRefs.current.camera && animRefs.current.renderer) {
          animRefs.current.camera.aspect = w / h;
          animRefs.current.camera.updateProjectionMatrix();
          animRefs.current.renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Camera View Controls & Avatar Status Overlay */}
      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl text-xs font-medium text-slate-200 shadow-lg">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? "bg-emerald-400 animate-pulse"
                : isListening
                ? "bg-amber-400 animate-ping"
                : "bg-blue-400"
            }`}
          />
          <span className="capitalize">{currentGesture} Mode</span>
          {isSpeaking && <span className="text-emerald-400 font-semibold">• Speaking</span>}
          {isListening && <span className="text-amber-300 font-semibold">• Listening</span>}
        </div>
      </div>

      {/* Camera Angle Switcher */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 shadow-lg pointer-events-auto">
        <button
          id="cam-btn-focus"
          onClick={() => setCameraMode("focus")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
            cameraMode === "focus"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
          title="Tutor & Smartboard View"
        >
          Tutor View
        </button>
        <button
          id="cam-btn-face"
          onClick={() => setCameraMode("face")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
            cameraMode === "face"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
          title="Close-up Portrait & Lip Sync"
        >
          Lip-Sync Focus
        </button>
        <button
          id="cam-btn-wide"
          onClick={() => setCameraMode("wide")}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
            cameraMode === "wide"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
          title="Classroom Wide View"
        >
          Classroom Wide
        </button>
      </div>

      {/* Gesture Direct Trigger Pills (Student can test or guide the tutor's actions!) */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 bg-slate-900/70 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800/80 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <span className="text-blue-400">3D Rig:</span> Maestro
          </span>
          <span className="hidden sm:inline text-slate-400">
            • Interactive Head Tracking • Real-time Visemes • Skeletal Gestures
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <span>Active Gesture:</span>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-medium">
            {currentGesture}
          </span>
        </div>
      </div>
    </div>
  );
};
