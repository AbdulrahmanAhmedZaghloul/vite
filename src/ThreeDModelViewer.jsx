
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useRef, useEffect } from 'react';

const ThreeDModelViewer = () => {
  const containerRef = useRef(null);
  const modelRef = useRef(null); // مرجع لتخزين النموذج
  const isDragging = useRef(false); // تتبع حالة السحب
  const previousMousePosition = useRef({ x: 0, y: 0 }); // حفظ موقع الماوس السابق
  const mousePosition = useRef({ x: 0, y: 0 }); // حفظ موقع الماوس الحالي

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    camera.position.set(10, 10, 70); // وضع الكاميرا قريبًا

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 1, 0);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load(
      'https://abdulrahmanahmedzaghloul.github.io/ther/scene.gltf', 
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y += 0.5;
        model.scale.set(0.5, 0.5, 0.5);
        scene.add(model);
        controls.target.copy(center);
        controls.update();
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        alert('Error loading model: ' + error.message);
      }
    );

    const handleResize = () => {
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);

      if (modelRef.current && isDragging.current) {
        const deltaX = mousePosition.current.x - previousMousePosition.current.x;
        const deltaY = mousePosition.current.y - previousMousePosition.current.y;

        modelRef.current.rotation.y += deltaX * 0.01;
        modelRef.current.rotation.x += deltaY * 0.01;

        // الحد من الدوران على المحور X
        modelRef.current.rotation.x = Math.max(
          Math.min(modelRef.current.rotation.x, Math.PI / 2),
          -Math.PI / 2
        );

        previousMousePosition.current = { ...mousePosition.current };
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onMouseDown = (event) => {
      isDragging.current = true;
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
      mousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event) => {
      if (isDragging.current) {
        mousePosition.current = { x: event.clientX, y: event.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'lightgray',
      }}
    />
  );
};

export default ThreeDModelViewer;
