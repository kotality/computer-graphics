var camera;
var scene;
var renderer;
var spotlight; //--------------- Don't have yet
var cube, cubeSimple, cubeSimpleMotion, sphere;

function init()
{
    scene = new THREE.Scene();

    camera();      
    renderer();

    cube();
    cubeSimple();
    cubeSimpleMotion();
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

// Creates a loop that causes renderer to draw scene 60 times per second.
function animate()
{ 
    /* 
     - requestAnimationFrame(): Tells the browser that you wish to perform an 
       animation and requests that the browser call a specified function to 
       update an animation before the next repaint.
     - (animate): A parameter specifying a function to call when it's time to 
       update your animation for the next repaint. 
    */
    requestAnimationFrame(animate); //------------------------------------------

    /*
     - This will be run every frame (60 times per second), and give the cube a 
       nice rotation animation. Basically, anything you want to move or change 
       while the app is running has to go through the animate loop. 
     - You can of course call other functions from there, so that you don't end 
       up with a animate function that's hundreds of lines.
    */
    Rotation();

    renderer.render(scene, camera); //------------------------------------------
}

function cube() 
{
    var geometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.x = -4;
    cube.position.y = 2;
    scene.add(cube);
}

function cubeSimple()
{
    var geometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cubeSimple = new THREE.Mesh(geometry, material);
    cubeSimple.position.x = -4;
    cubeSimple.position.y = -2;
    scene.add(cubeSimple);
}

function cubeSimpleMotion()
{
    var geometry = new THREE.BoxGeometry(1, 1, 1); // width, height, depth
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cubeSimpleMotion = new THREE.Mesh(geometry, material);
    cubeSimpleMotion.position.x = 4;
    cubeSimpleMotion.position.y = -2;
    scene.add(cubeSimpleMotion);
}

function sphere() 
{
    var geometry = new THREE.SphereGeometry(1);//, 32, 32); // radius, widthSegments, heightSegments,
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 4;
    sphere.position.y = 2;
    scene.add(sphere);
}

function Rotation()
{
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;

    cubeSimple.rotation.x += 0.1;
    cubeSimple.rotation.y += 0.1;

    cubeSimpleMotion.rotation.x += 0.1;
    cubeSimpleMotion.rotation.y += 0.1;

    sphere.rotation.x += 0.1;
    sphere.rotation.y += 0.1;
}

// window.onload = init;
init();