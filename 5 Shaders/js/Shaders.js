var camera, scene, renderer, spotlight; 
var mouse = {x:0, y:0};
var cube, cubeSimple, cone, sphere;

document.onmousemove = getMouseXY;

init();

function init()
{
    scene = new THREE.Scene();

    camera();      
    renderer();
    spotlight();

    // Objects
    cube();
    coneMotion();
    cubeSimple();
    sphere();
    
    animate();   
}

function camera()
{
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
}

function renderer()
{
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function spotlight()
{
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(10,20,20); // x, y, z

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 500; 
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;

    scene.add(spotLight);
}

function getMouseXY(e) 
{
    mouse.x = e.pageX;
    mouse.y = e.pageY;
}

function animate()
{ 
    requestAnimationFrame(animate); //------------------------------------------

    Rotation();

    renderer.render(scene, camera); //------------------------------------------
}

function Rotation() 
{
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.01;

    cubeSimple.rotation.x += 0.01;
    cubeSimple.rotation.y += 0.01;
    cubeSimple.rotation.z += 0.01;

    // cone.rotation.x += 0.01;
    cone.rotation.y += 0.01;
    // cone.rotation.z += 0.01;

    sphere.rotation.x += 0.01;
    // sphere.rotation.y += 0.01;
    // sphere.rotation.z += 0.01;
}

// Simple shader with pattern
function cube() 
{
    var geometry = new THREE.BoxBufferGeometry(1, 1, 1); // width, height, depth
    var material = new THREE.ShaderMaterial(
    {
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    });
    cube = new THREE.Mesh(geometry, material);

    cube.position.x = -4;
    cube.position.y = 2;
    scene.add(cube);
}

// Simple shader with pattern that has motion
function coneMotion() 
{
    var geometry = new THREE.ConeGeometry(0.8, 1.5);
    var material = new THREE.ShaderMaterial(
        {
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });
    cone = new THREE.Mesh(geometry, material);

    cone.position.x = 4;
    cone.position.y = -2;
    scene.add(cone);
}

// Shader for cube
function cubeSimple()
{
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.ShaderMaterial(
    {
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    });
    cubeSimple = new THREE.Mesh(geometry, material);

    cubeSimple.position.x = -4;
    cubeSimple.position.y = -2;
    scene.add(cubeSimple);
}

// Shader for sphere
function sphere() 
{
    var geometry = new THREE.SphereGeometry(1);
    var material = new THREE.ShaderMaterial(
    {
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent
    });
    sphere = new THREE.Mesh(geometry, material);

    sphere.position.x = 4;
    sphere.position.y = 2;
    scene.add(sphere);
}