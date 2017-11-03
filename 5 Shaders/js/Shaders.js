var camera, scene, renderer, spotlight; 
var mouse = {x:0, y:0};
var cube, cubeSimple, deca, sphere;

document.onmousemove = getMouseXY;

init();

function init()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe5e192);

    camera();      
    renderer();
    spotlight();

    // Objects
    cube();
    decaMotion();
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

var time = 0;
function animate()
{ 
    requestAnimationFrame(animate); 
    
    cube.rotation.x += 0.007;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.007;

    cubeSimple.rotation.x += 0.007;
    cubeSimple.rotation.y += 0.01;
    cubeSimple.rotation.z += 0.007;

    deca.rotation.y += 0.03;
    sphere.rotation.x += 0.02;

    time += 0.02;
    deca.material.uniforms.time.value = time;

    renderer.render(scene, camera);
}

// Simple shader with pattern
function cube() 
{
    var uniforms = {
        "color1": {
            type: "c",
            value: new THREE.Color(0xffffff)
        },
        "color2": {
            type: "c",
            value: new THREE.Color(0xf55e0c)
        },
        "size": {
            type: "f",
            value: 2.8,
        },
    }
    
    var geometry = new THREE.BoxBufferGeometry(1.4, 1.4, 1.4); // width, height, depth
    var material = new THREE.ShaderMaterial(
    {
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShaderCube').textContent,
        fragmentShader: document.getElementById('fragmentShaderCube').textContent
    });
    cube = new THREE.Mesh(geometry, material);

    cube.position.x = 0;
    cube.position.y = 2;
    scene.add(cube);
}

// Simple shader with pattern that has motion
function decaMotion() 
{
    var timeUniform = { time: { type: 'f', value: 0.0 } };

    var geometry = new THREE.DodecahedronBufferGeometry(1);//ConeGeometry(0.8, 1.5, 15);
    var material = new THREE.ShaderMaterial(
    {
        uniforms: timeUniform,
        vertexShader: document.getElementById('vertexShaderDeca').textContent,
        fragmentShader: document.getElementById('fragmentShaderDeca').textContent
    });
    deca = new THREE.Mesh(geometry, material);

    deca.position.x = 4;
    deca.position.y = -2;
    scene.add(deca);
}

// Shader for cube
function cubeSimple()
{
    var geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    var material = new THREE.ShaderMaterial(
    {
        vertexShader: document.getElementById('vertexShaderCubeSimple').textContent,
        fragmentShader: document.getElementById('fragmentShaderCubeSimple').textContent
    });
    cubeSimple = new THREE.Mesh(geometry, material);

    cubeSimple.position.x = 0;
    cubeSimple.position.y = -2;
    scene.add(cubeSimple);
}

// Shader for sphere
function sphere() 
{
    var uniforms = {
        color1: { type: "c", value: new THREE.Color(0x258187) },
        color2: { type: "c", value: new THREE.Color(0x552284) },
        lines: { type: "f", value: 21 },
        linewidth: { type: "f", value: 15.0 },
    }

    var geometry = new THREE.SphereGeometry(0.95, 30, 30);
    var material = new THREE.ShaderMaterial(
    {
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShaderSphere').textContent,
        fragmentShader: document.getElementById('fragmentShaderSphere').textContent
    });
    sphere = new THREE.Mesh(geometry, material);

    sphere.position.x = 4;
    sphere.position.y = 2;
    scene.add(sphere);
}