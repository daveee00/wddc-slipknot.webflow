(function () {
  function hideLoadingOverlay() {
    const overlay = document.getElementById("loading-overlay");
    const loadingText = document.querySelector(".loading-text");
    if (loadingText) {
      loadingText.style.opacity = "0";
    }
    setTimeout(() => {
      if (overlay) {
        overlay.style.opacity = "0";
        document.body.classList.add("loaded");
        setTimeout(() => {
          overlay.style.display = "none";
        }, 800);
      }
    }, 300);
  }
  function initWebflowViewer() {
    let camera, scene, renderer;
    let container, clock;
    let lastScrollY = window.scrollY;
    let isScrollingEnabled = false;
    let modelsOriginalPositions = [];
    const loadedModels = [];
    const rotationSpeed = 0.5;
    let loadedModelCount = 0;
    // MODELS TO LOAD
    const modelsToLoad = [
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/clubDerVisionere.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/elsewhere.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/vena.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/forTheCause.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/goa.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/haudio.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/hor.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/lesEnfants.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/theLotRadio.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/radioPirate.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/teller.glb",
      "https://cdn.jsdelivr.net/gh/daveee00/export_blender/teknoBirrette.glb",
    ];
    // PAGE LINKS
    const pageLinks = [
      "/performances/club-der-visionaire",
      "/performances/elsewhere",
      "/performances/endovena-festival",
      "/performances/for-the-cause",
      "/performances/goa-last-dance",
      "/performances/haudio",
      "/performances/hor",
      "/performances/les-elephants",
      "/performances/lot-radio",
      "/performances/radio-pirate",
      "/performances/teller",
      "/performances/tekno-birrette",
    ];
    // Writing backgrounds array - matching the order of pageLinks
    const writingBackgrounds = [
      "/images/titles-homepage/clubDerVisionere_writing_background.png",
      "/images/titles-homepage/elsewhere_writing_background.png",
      "/images/titles-homepage/endovena_writing_background.png",
      "/images/titles-homepage/forTheCause_writing_background.png",
      "/images/titles-homepage/goa_writing_background.png",
      "/images/titles-homepage/haudio_writing_background.png",
      "/images/titles-homepage/hor_writing_background.png",
      "/images/titles-homepage/lesEnfants_writing_background.png",
      "/images/titles-homepage/lotradio_writing_background.png",
      "/images/titles-homepage/radioPirate_writing_background.png",
      "/images/titles-homepage/teknoBirrette_writing_background.png",
      "/images/titles-homepage/teller_writing_background.png",
    ];
    // Add raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredModel = null;
    let originalModelStates = [];
    let isModelClicked = false;
    function checkAllModelsLoaded() {
      loadedModelCount++;
      if (loadedModelCount === modelsToLoad.length) {
        const loadingText = document.querySelector(".loading-text");
        if (loadingText) {
          loadingText.textContent = "Loading complete!";
        }
        setTimeout(hideLoadingOverlay, 500);
      }
    }
    function loadModels(modelPaths) {
      const loader = new THREE.GLTFLoader();
      modelPaths.forEach((path, index) => {
        loader.load(
          path,
          (gltf) => {
            const model = gltf.scene;
            model.scale.set(10, 10, 10);
            const baseY = -index * 3;
            model.position.set(0, baseY, 0);
            model.userData.baseY = baseY;
            model.userData.offset = index * 0.3;
            model.userData.originalIndex = index;
            model.userData.modelName = `Model ${index + 1} (${path
              .split("/")
              .pop()})`;
            model.rotation.set(
              THREE.MathUtils.degToRad(0),
              THREE.MathUtils.degToRad(180),
              THREE.MathUtils.degToRad(0)
            );
            scene.add(model);
            loadedModels.push(model);
            checkAllModelsLoaded();
          },
          (xhr) => {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            const loadingText = document.querySelector(".loading-text");
            if (loadingText) {
              loadingText.textContent = `Loading... ${Math.round(
                percentComplete
              )}%`;
            }
          },
          (e) => {
            console.error(`Error loading ${path}`, e);
            checkAllModelsLoaded();
          }
        );
      });
    }
    function animate() {
      const time = clock.getElapsedTime();
      const dt = clock.getDelta();
      loadedModels.forEach((model) => {
        if (!isModelClicked) {
          const offset = model.userData.offset || 0;
          model.rotation.y =
            THREE.MathUtils.degToRad(180) +
            THREE.MathUtils.degToRad(15 * Math.sin(time * 1.4 - offset));
        }
      });
      renderer.render(scene, camera);
    }
    function onWindowResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      checkContainerPosition();
    }
    function checkContainerPosition() {
      const rect = container.getBoundingClientRect();
      const stickyWrapper = container.closest(".sticky-wrapper");
      const wrapperRect = stickyWrapper.getBoundingClientRect();
      const isWrapperInView =
        wrapperRect.top <= 0 && wrapperRect.bottom > window.innerHeight;
      const wasEnabled = isScrollingEnabled;
      isScrollingEnabled = isWrapperInView;
      if (!wasEnabled && isScrollingEnabled) {
        console.log("Container in position, scrolling enabled");
        lastScrollY = window.scrollY;
        if (modelsOriginalPositions.length === 0) {
          loadedModels.forEach((model) => {
            modelsOriginalPositions.push({
              model: model,
              y: model.position.y,
            });
          });
        }
      }
    }
    function handleScroll() {
      checkContainerPosition();
      if (isScrollingEnabled) {
        const currentScrollY = window.scrollY;
        const scrollDiff = (currentScrollY - lastScrollY) / 50;
        loadedModels.forEach((model) => {
          model.position.y += scrollDiff;
        });
        lastScrollY = currentScrollY;
      }
    }
    /*blocco di codice da controllare se funziona*/
    function createActivePage() {
      const stickyWrapper = document.querySelector(".sticky-wrapper");
      const pageActive = document.createElement("div");
      pageActive.id = "page-active";
      pageActive.style.position = "fixed";
      pageActive.style.top = "0";
      pageActive.style.left = "0";
      pageActive.style.width = "100vw";
      pageActive.style.height = "100vh";
      pageActive.style.zIndex = "3";
      pageActive.style.background = "none";
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "close";
      closeBtn.id = "close";
      closeBtn.style.position = "fixed";
      closeBtn.style.top = "0";
      closeBtn.style.left = "0";
      pageActive.appendChild(closeBtn);
      stickyWrapper.appendChild(pageActive);
      closeBtn.addEventListener("click", handleClose);
    }
    function storeModelStates() {
      originalModelStates = loadedModels.map((model) => ({
        model: model,
        position: model.position.clone(),
        rotation: model.rotation.clone(),
      }));
    }
    function createNavigationButton(originalIndex) {
      const button = document.createElement("a");
      button.id = "go_to_page_button";
      button.href = pageLinks[originalIndex];
      button.style.position = "fixed";
      button.style.width = "50%";
      button.style.aspectRatio = "1/1";
      button.style.zIndex = "6";
      button.style.left = "50%";
      button.style.top = "50%";
      button.style.transform = "translate(-50%, -50%)";
      button.style.cursor = "none";
      document.body.appendChild(button);
      const tooltip = document.createElement("div");
      tooltip.id = "button-tooltip";
      tooltip.textContent = "view more";
      tooltip.style.position = "fixed";
      tooltip.style.display = "none";
      tooltip.style.padding = "5px 10px";
      tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
      tooltip.style.color = "white";
      tooltip.style.borderRadius = "4px";
      tooltip.style.fontSize = "14px";
      tooltip.style.pointerEvents = "none";
      tooltip.style.zIndex = "7";
      document.body.appendChild(tooltip);
      button.addEventListener("mousemove", (e) => {
        tooltip.style.display = "block";
        tooltip.style.left = e.clientX + 10 + "px";
        tooltip.style.top = e.clientY + 10 + "px";
      });
      button.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
      button.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Button clicked");
        console.log("Target URL:", button.href);
        const activeModel = loadedModels.find(
          (model) =>
            model.position.x === 0 &&
            model.position.y === 0 &&
            model.position.z === 0
        );
        if (activeModel) {
          console.log("Active model found");
          gsap.to(camera.position, {
            z: 0.1,
            duration: 1.5,
            ease: "power2.in",
          });
          gsap.to(activeModel.scale, {
            x: 20,
            y: 20,
            z: 20,
            duration: 1.5,
            ease: "power2.in",
          });
          gsap.to(activeModel.rotation, {
            y: activeModel.rotation.y + THREE.MathUtils.degToRad(360),
            duration: 1.5,
            ease: "power2.in",
          });
          // Remove writing animation before navigation
          const writingContainer = document.getElementById("writing-container");
          if (writingContainer) {
            writingContainer.remove();
          }
          // Add a check to ensure the URL exists before navigating
          const targetUrl = button.href;
          console.log("Checking URL:", targetUrl);
          // Try to navigate directly first
          try {
            console.log("Attempting to navigate to:", targetUrl);
            window.location.href = targetUrl;
          } catch (error) {
            console.error("Navigation error:", error);
            alert(
              "Error navigating to page. Please check the console for details."
            );
          }
        } else {
          console.log("No active model found, attempting direct navigation");
          // Remove writing animation before navigation
          const writingContainer = document.getElementById("writing-container");
          if (writingContainer) {
            writingContainer.remove();
          }
          window.location.href = button.href;
        }
      });
    }
    function removeNavigationButton() {
      const button = document.getElementById("go_to_page_button");
      const tooltip = document.getElementById("button-tooltip");
      if (button) {
        button.remove();
      }
      if (tooltip) {
        tooltip.remove();
      }
    }
    function handleClose() {
      const pageActive = document.getElementById("page-active");
      if (pageActive) {
        pageActive.remove();
      }
      removeNavigationButton();
      isModelClicked = false;

      // Remove writing animation
      const writingContainer = document.getElementById("writing-container");
      if (writingContainer) {
        writingContainer.remove();
      }

      originalModelStates.forEach((state) => {
        gsap.to(state.model.position, {
          x: state.position.x,
          y: state.position.y,
          z: state.position.z,
          duration: 1,
          ease: "power2.out",
        });
        gsap.to(state.model.rotation, {
          x: state.rotation.x,
          y: state.rotation.y,
          z: state.rotation.z,
          duration: 1,
          ease: "power2.out",
        });
      });
    }
    function getRandomVideo() {
      const videos = [
        "/videos/pageActive/bda.mp4",
        "/videos/pageActive/swt.mp4",
        "/videos/pageActive/dw.mp4",
        "/videos/pageActive/pos.mp4",
        "/videos/pageActive/mye.mp4",
      ];
      return videos[Math.floor(Math.random() * videos.length)];
    }
    function changeVideoBackground() {
      const videoElement = document.getElementById("video_background");
      if (videoElement) {
        videoElement.src = getRandomVideo();
        videoElement.load();
      }
    }
    function restoreDefaultVideo() {
      const videoElement = document.getElementById("video_background");
      if (videoElement) {
        videoElement.src = "/videos/Liquid Abstract Neon Green 4K.mp4";
        videoElement.load();
      }
    }
    /*––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––*/
    function init() {
      if (!document.getElementById("threejs-container")) {
        container = document.createElement("div");
        container.id = "threejs-container";
        container.style.width = "100%";
        container.style.height = "100vh";
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.zIndex = "1";
        document.body.appendChild(container);
      } else {
        container = document.getElementById("threejs-container");
      }

      // Add scrolling writing background
      const writingContainer = document.createElement("div");
      writingContainer.id = "writing-container";
      writingContainer.style.position = "fixed";
      writingContainer.style.top = "0";
      writingContainer.style.left = "0";
      writingContainer.style.width = "100%";
      writingContainer.style.height = "100vh";
      writingContainer.style.zIndex = "0";
      writingContainer.style.overflow = "hidden";
      writingContainer.style.pointerEvents = "none";
      writingContainer.style.display = "none"; // Initially hidden

      // Create a wrapper for the images
      const imageWrapper = document.createElement("div");
      imageWrapper.style.position = "absolute";
      imageWrapper.style.top = "50%";
      imageWrapper.style.left = "50%";
      imageWrapper.style.transform = "translate(-50%, -50%)";
      imageWrapper.style.display = "flex";
      imageWrapper.style.animation = "scrollWriting 20s linear infinite";
      imageWrapper.style.whiteSpace = "nowrap";
      imageWrapper.style.width = "300%"; // Make it wider to ensure full coverage

      // Create two sets of images for seamless looping
      for (let set = 0; set < 2; set++) {
        for (let i = 0; i < 6; i++) {
          const writingImage = document.createElement("img");
          writingImage.src = "/images/teller_writing_background.png";
          writingImage.style.opacity = "0.3";
          writingImage.style.height = "auto";
          writingImage.style.width = "auto";
          writingImage.style.maxHeight = "80vh";
          writingImage.style.marginRight = "40px";
          writingImage.style.display = "inline-block";
          imageWrapper.appendChild(writingImage);
        }
      }

      writingContainer.appendChild(imageWrapper);
      document.body.appendChild(writingContainer);

      // Add the animation keyframes
      const style = document.createElement("style");
      style.textContent = `
        @keyframes scrollWriting {
          0% {
            transform: translate(-50%, -50%);
          }
          100% {
            transform: translate(-150%, -50%);
          }
        }
      `;
      document.head.appendChild(style);

      const width = container.clientWidth;
      const height = container.clientHeight;
      camera = new THREE.PerspectiveCamera(35, width / height, 0.25, 200);
      camera.position.set(0, 0, 45);
      camera.lookAt(0, 0, 0);
      scene = new THREE.Scene();
      clock = new THREE.Clock();
      /* const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6); // Reduced intensity
                hemiLight.position.set(10, 30, 10);
                scene.add(hemiLight);*/
      // Add ambient light for better overall illumination
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      loadModels(modelsToLoad);
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.8;
      renderer.setAnimationLoop(animate);
      container.appendChild(renderer.domElement);
      window.addEventListener("resize", onWindowResize);
      window.addEventListener("scroll", handleScroll);
      renderer.domElement.addEventListener("click", onModelClick);
      window.addEventListener("mousemove", onMouseMove);
      checkContainerPosition();
    }
    /*––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––*/
    function createWritingAnimation(backgroundImage) {
      // Remove any existing writing container first
      const existingContainer = document.getElementById("writing-container");
      if (existingContainer) {
        existingContainer.remove();
      }

      // Create writing animation container
      const writingContainer = document.createElement("div");
      writingContainer.id = "writing-container";
      writingContainer.style.position = "fixed";
      writingContainer.style.top = "0";
      writingContainer.style.left = "0";
      writingContainer.style.width = "100%";
      writingContainer.style.height = "100vh";
      writingContainer.style.zIndex = "0";
      writingContainer.style.overflow = "hidden";
      writingContainer.style.pointerEvents = "none";
      writingContainer.style.display = "flex";
      writingContainer.style.alignItems = "center";
      writingContainer.style.justifyContent = "center";

      // Create a wrapper for the images
      const imageWrapper = document.createElement("div");
      imageWrapper.style.position = "relative";
      imageWrapper.style.display = "flex";
      imageWrapper.style.animation = "scrollWriting 20s linear infinite";
      imageWrapper.style.whiteSpace = "nowrap";
      imageWrapper.style.width = "300%";

      // Create two sets of images for seamless looping
      for (let set = 0; set < 2; set++) {
        for (let i = 0; i < 6; i++) {
          const writingImage = document.createElement("img");
          writingImage.src = backgroundImage;
          writingImage.style.opacity = "0.3";
          writingImage.style.height = "auto";
          writingImage.style.width = "auto";
          writingImage.style.maxHeight = "80vh";
          writingImage.style.display = "inline-block";
          imageWrapper.appendChild(writingImage);
        }
      }

      writingContainer.appendChild(imageWrapper);
      document.body.appendChild(writingContainer);

      // Add the animation keyframes
      const style = document.createElement("style");
      style.textContent = `
        @keyframes scrollWriting {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-66.666%);
          }
        }
      `;
      document.head.appendChild(style);
    }
    function onModelClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(loadedModels, true);
      if (intersects.length > 0) {
        isModelClicked = true;
        changeVideoBackground();
        let clickedModel = intersects[0].object;
        while (clickedModel.parent && !loadedModels.includes(clickedModel)) {
          clickedModel = clickedModel.parent;
        }
        const clickedIndex = loadedModels.indexOf(clickedModel);

        // Create writing animation for the clicked model
        createWritingAnimation(
          writingBackgrounds[clickedModel.userData.originalIndex]
        );

        storeModelStates();
        createActivePage();
        createNavigationButton(clickedModel.userData.originalIndex);
        gsap.to(clickedModel.position, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1,
          ease: "power2.out",
        });
        gsap.to(clickedModel.rotation, {
          x: THREE.MathUtils.degToRad(0),
          y: THREE.MathUtils.degToRad(90),
          z: THREE.MathUtils.degToRad(90),
          duration: 1,
          ease: "power2.out",
        });
        loadedModels.forEach((model, index) => {
          if (index !== clickedIndex) {
            const yOffset = index < clickedIndex ? 100 : -100;
            gsap.to(model.position, {
              x: 0,
              y: yOffset,
              z: 0,
              duration: 1,
              ease: "power2.out",
            });
          }
        });
      }
    }
    function onMouseMove(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(loadedModels, true);
      if (intersects.length > 0) {
        const newHoveredModel = intersects[0].object.parent;
        if (hoveredModel !== newHoveredModel) {
          if (hoveredModel) {
            gsap.to(hoveredModel.scale, {
              x: 10,
              y: 10,
              z: 10,
              duration: 0.4,
              ease: "power2.out",
            });
          }
          hoveredModel = newHoveredModel;
          gsap.to(hoveredModel.scale, {
            x: 11,
            y: 11,
            z: 11,
            duration: 0.4,
            ease: "power2.out",
          });
        }
      } else if (hoveredModel) {
        gsap.to(hoveredModel.scale, {
          x: 10,
          y: 10,
          z: 10,
          duration: 0.4,
          ease: "power2.out",
        });
        hoveredModel = null;
      }
    }
    /*––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––*/
    // Initialize the viewer
    init();
  }
  // Start the viewer when the page loads
  window.addEventListener("load", initWebflowViewer);
})();
