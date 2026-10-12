import * as THREE from "three";

const container = document.getElementById("threeContainer");

if (!container) {
    throw new Error("threeContainer was not found.");
}

let scene;
let camera;
let renderer;

let globe;
let atmosphere;
let persia;

let rotationX = 0.15;
let rotationY = -0.7;
let zoom = 5.2;

let dragging = false;
let previousX = 0;
let previousY = 0;

let paused = false;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );

    camera.position.z = zoom;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Earth
    const globeGeometry = new THREE.SphereGeometry(
        2,
        96,
        96
    );

    const globeMaterial = new THREE.MeshStandardMaterial({
        color: 0x59665e,
        roughness: 1,
        metalness: 0
    });

    globe = new THREE.Mesh(
        globeGeometry,
        globeMaterial
    );

    scene.add(globe);

    // Atmosphere
    const atmosphereGeometry =
        new THREE.SphereGeometry(2.08, 64, 64);

    const atmosphereMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x4da6ff,
            transparent: true,
            opacity: 0.10,
            side: THREE.BackSide
        });

    atmosphere = new THREE.Mesh(
        atmosphereGeometry,
        atmosphereMaterial
    );

    scene.add(atmosphere);

    // Lighting
    const ambientLight =
        new THREE.AmbientLight(0xffffff, 1.5);

    scene.add(ambientLight);

    const sun =
        new THREE.DirectionalLight(0xffffff, 2);

    sun.position.set(5, 3, 5);

    scene.add(sun);

    // Persia marker
    createPersia();

    // Cities
    createCity("TEHRAN", 1.05, 0.20, 1.65);
    createCity("TABRIZ", 0.72, 0.43, 1.75);
    createCity("ISFAHAN", 0.80, -0.05, 1.82);
    createCity("SHIRAZ", 0.65, -0.40, 1.82);

    setupMouseControls();

    setupButtons();

    window.addEventListener(
        "resize",
        resize
    );
}

function createPersia() {

    const geometry =
        new THREE.SphereGeometry(2.015, 64, 64);

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xb08a52,
            transparent: true,
            opacity: 0.75
        });

    persia = new THREE.Mesh(
        geometry,
        material
    );

    /*
       Temporary geographic marker.

       This is NOT yet the exact historical
       Persian border. It is only a visible
       country highlight while we build the
       real historical map.
    */

    persia.scale.set(
        0.38,
        0.24,
        0.10
    );

    persia.position.set(
        0.85,
        0.10,
        1.82
    );

    globe.add(persia);

    const label =
        createTextSprite("PERSIA");

    label.position.set(
        0.85,
        0.35,
        1.95
    );

    globe.add(label);
}

function createCity(
    name,
    x,
    y,
    z
) {

    const geometry =
        new THREE.SphereGeometry(
            0.035,
            16,
            16
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

    const city =
        new THREE.Mesh(
            geometry,
            material
        );

    city.position.set(
        x,
        y,
        z
    );

    globe.add(city);

    const label =
        createTextSprite(name);

    label.scale.set(
        0.5,
        0.25,
        1
    );

    label.position.set(
        x,
        y + 0.10,
        z
    );

    globe.add(label);
}

function createTextSprite(text) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const context =
        canvas.getContext("2d");

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.font =
        "bold 42px Arial";

    context.fillStyle =
        "white";

    context.textAlign =
        "center";

    context.textBaseline =
        "middle";

    context.fillText(
        text,
        canvas.width / 2,
        canvas.height / 2
    );

    const texture =
        new THREE.CanvasTexture(canvas);

    const material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

    const sprite =
        new THREE.Sprite(material);

    sprite.scale.set(
        1.0,
        0.25,
        1
    );

    return sprite;
}

function setupMouseControls() {

    container.addEventListener(
        "pointerdown",
        function(event) {

            dragging = true;

            previousX = event.clientX;
            previousY = event.clientY;

            container.setPointerCapture(
                event.pointerId
            );
        }
    );

    container.addEventListener(
        "pointermove",
        function(event) {

            if (!dragging) {
                return;
            }

            const deltaX =
                event.clientX - previousX;

            const deltaY =
                event.clientY - previousY;

            rotationY += deltaX * 0.005;

            rotationX += deltaY * 0.005;

            rotationX =
                Math.max(
                    -1.3,
                    Math.min(1.3, rotationX)
                );

            previousX = event.clientX;
            previousY = event.clientY;
        }
    );

    container.addEventListener(
        "pointerup",
        function() {

            dragging = false;

        }
    );

    container.addEventListener(
        "pointercancel",
        function() {

            dragging = false;

        }
    );

    container.addEventListener(
        "wheel",
        function(event) {

            event.preventDefault();

            zoom += event.deltaY * 0.002;

            zoom =
                Math.max(
                    3.0,
                    Math.min(8.0, zoom)
                );

        },
        {
            passive: false
        }
    );
}

function setupButtons() {

    const pauseButton =
        document.getElementById("pauseBtn");

    if (pauseButton) {

        pauseButton.addEventListener(
            "click",
            function() {

                paused = !paused;

                pauseButton.textContent =
                    paused ? "PLAY" : "PAUSE";

            }
        );
    }

    const political =
        document.getElementById("politicalBtn");

    const terrain =
        document.getElementById("terrainBtn");

    const supply =
        document.getElementById("supplyBtn");

    if (political) {

        political.addEventListener(
            "click",
            function() {

                globe.material.color.set(
                    0x59665e
                );

            }
        );
    }

    if (terrain) {

        terrain.addEventListener(
            "click",
            function() {

                globe.material.color.set(
                    0x77705e
                );

            }
        );
    }

    if (supply) {

        supply.addEventListener(
            "click",
            function() {

                globe.material.color.set(
                    0x505d69
                );

            }
        );
    }
}

function resize() {

    if (!container || !camera || !renderer) {
        return;
    }

    camera.aspect =
        container.clientWidth /
        container.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );
}

function animate() {

    requestAnimationFrame(animate);

    if (!paused) {

        globe.rotation.y =
            rotationY;

        globe.rotation.x =
            rotationX;

        atmosphere.rotation.y =
            rotationY;

        atmosphere.rotation.x =
            rotationX;
    }

    camera.position.z =
        zoom;

    renderer.render(
        scene,
        camera
    );
}