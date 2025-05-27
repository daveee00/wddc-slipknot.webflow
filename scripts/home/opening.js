
(function () {
  // Ensure Three.js is loaded
  if (!window.THREE) return;
  let camera, scene, renderer, model;
  let container = document.getElementById("sopra");
  let clock = new THREE.Clock();
  // Set up renderer
  const width = container.clientWidth;
  const height = container.clientHeight || 400; // fallback height
  camera = new THREE.PerspectiveCamera(
    35,
    width / height,
    0.25,
    200
  );
  camera.position.set(-63, -10, 20);
  camera.lookAt(0, 0, 0);
  scene = new THREE.Scene();
  // Lights
  const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    0xffffff,
    0.1
  );
  hemiLight.position.set(10, 30, 10);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(-10, 1, 10);
  scene.add(dirLight);
  // Model loader
  const loader = new THREE.GLTFLoader();
  loader.load(
    "https://cdn.jsdelivr.net/gh/Silviapanciera/models@main/bda.glb", // <-- update this path if needed
    function (gltf) {
      model = gltf.scene;
      model.scale.set(10, 10, 10);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, Math.PI / 2); // 90deg in radians
      scene.add(model);
    },
    undefined,
    function (e) {
      console.error(e);
    }
  );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  // Responsive
  window.addEventListener("resize", function () {
    const w = container.clientWidth;
    const h = container.clientHeight || 400;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  // Animation loop: rotate model
  function animate() {
    requestAnimationFrame(animate);
    if (model) {
      model.rotation.z += 0.01; // Rotates the model
    }
    renderer.render(scene, camera);
  }
  animate();
})();
