var camera, scene, renderer, spotlight;
var cube;
var onRenderFcts = [];

init();

function init() 
{
    scene();
    camera();
    renderer();
    spotlight();

    // Objects
    cube();

    animate();
}

function scene() 
{
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xe5e192);
}

function camera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
}

function renderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor('lightblue', 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function spotlight() {
    // spotLight = new THREE.SpotLight(0xffffff);
    // spotLight.position.set(10, 20, 20);

    // spotLight.castShadow = true;

    // spotLight.shadow.mapSize.width = 1024;
    // spotLight.shadow.mapSize.height = 1024;

    // spotLight.shadow.camera.near = 500;
    // spotLight.shadow.camera.far = 4000;
    // spotLight.shadow.camera.fov = 30;

    // scene.add(spotLight);
    var light = new THREE.AmbientLight(0x020202);
    scene.add(light);
    // add a light in front
    var light = new THREE.DirectionalLight('white', 1);
    light.position.set(0.5, 0.5, 2);
    scene.add(light);
    // add a light behind
    var light = new THREE.DirectionalLight('white', 0.75);
    light.position.set(-0.5, -0.5, -2);
    scene.add(light);
}

var lastTimeMsec = null;
function animate() {
    // requestAnimationFrame(animate);
    // requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        
        // measure time
    //     lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
    //     var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    //     lastTimeMsec = nowMsec;
    //     // call each update function
    //     onRenderFcts.forEach(function (onRenderFct) {
    //         onRenderFct(deltaMsec / 1000, nowMsec / 1000);
    //     })
    // })

    cube.rotation.x += 0.007;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.007;

    // createGrass();
    cameraControl();
    // onRenderFcts.forEach(function (onRenderFct) {
    //     onRenderFct(deltaMsec / 1000, nowMsec / 1000);
    // })
    // onRenderFcts.push(function () {
    //     renderer.render(scene, camera);
    // })
    renderer.render(scene, camera);
}

function cameraControl()
{
    var mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', function (event) 
    {
        mouse.x = (event.clientX / window.innerWidth) - 0.5
        mouse.y = (event.clientY / window.innerHeight) - 0.5
    }, false)
    onRenderFcts.push(function (delta, now) 
    {
        camera.position.x += (mouse.x * 5 - camera.position.x) * (delta * 3)
        camera.position.y += (mouse.y * 5 - camera.position.y) * (delta * 3)
        camera.lookAt(scene.position)
    })
}

// Simple shader with pattern
function cube() 
{
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    
    scene.add(cube);
}

function createGrass()
{
    // var nTufts = 5000;
    // var positions = new Array(nTufts);
    // for (var i = 0; i < nTufts; i++) 
    // {
    //     var position = new THREE.Vector3();
    //     position.x = (Math.random() - 0.5) * 20;
    //     position.z = (Math.random() - 0.5) * 20;
    //     positions[i] = position;
    // }
    // var mesh = THREEx.createGrassTufts(positions);
    // scene.add(mesh);
    // // load the texture
    // var textureUrl = THREEx.createGrassTufts.baseUrl + 'images/grass01.png';
    // var material = mesh.material;
    // material.map = THREE.ImageUtils.loadTexture(textureUrl);
    // material.alphaTest = 0.7;

    var positions = [];
    positions.push(new THREE.Vector3(-1, 0, 0));
    positions.push(new THREE.Vector3(+1, 0, 0));
    var mesh = new THREEx.createGrassTufts(positions);
    scene.add(mesh);
}