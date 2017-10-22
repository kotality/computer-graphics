var renderer;
var scene;
var camera;
var geometry;
var circleGeometry, circleGeometry2;
var lineHorizontalGeometry, lineVerticalGeometry;

// How you can move on the board
var col = [];
var row = [];

Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

function init()
{
	scene = new THREE.Scene();
	
	setupCamera();
	setupRenderer();
	// addSpotLight();
	
	// Output to the stream
	document.body.appendChild( renderer.domElement );

	// window.addEventListener('mousemove', function (event) 
	// {
	// 	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	// 	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	// });

	board();	
	playerPieces();

	// Call render
	render();
}

function render()
{	
	if (Key.isDown(Key.Z))
	{
		camera.rotation.x += 0.03;
	}
	if (Key.isDown(Key.C))
	{
		camera.rotation.x -= 0.03;
	}

	if (Key.isDown(Key.I)) {
		camera.rotation.z += 0.03;
	}
	if (Key.isDown(Key.P)) {
		camera.rotation.z -= 0.03;
	}

	// Rotate camera left and right
	if (Key.isDown(Key.A)) 
	{
		camera.rotation.y += 0.03;
	}
	if (Key.isDown(Key.D)) 
	{
		camera.rotation.y -= 0.03;
	}

	// Move into and out of the screen
	if (Key.isDown(Key.W)) 
	{
		var deltaX = Math.sin(camera.rotation.y) * .2;
		var deltaZ = Math.cos(camera.rotation.y) * .2;
		camera.position.x -= deltaX;
		camera.position.z -= deltaZ;
	}
	if (Key.isDown(Key.S)) 
	{
		var deltaX = Math.sin(camera.rotation.y) * .2;
		var deltaZ = Math.cos(camera.rotation.y) * .2;
		camera.position.x += deltaX;
		camera.position.z += deltaZ;
	}

	// Request animation frame
	requestAnimationFrame( render );
	
	// Call render()
	renderer.render( scene, camera );
}

function addSpotLight()
{
	spotLight = new THREE.SpotLight(0xffffff);
	spotLight.position.set(10, 20, 20);
	spotLight.shadowCameraNear = 20;
	spotLight.shadowCameraFar = 50;
	spotLight.castShadow = true;
	scene.add(spotLight);
}

function setupCamera()
{
	camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
	camera.position.z = 80;
	camera.position.x = 0;
	camera.position.y = 0; 
	// camera.lookAt(scene.position)
	// camera.lookAt(new THREE.Vector3(0,0,0));
}

function setupRenderer()
{
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x000000, 1.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
}

function board() 
{
	var planeGeometry = new THREE.BoxGeometry(99, 99, 5); // width, height, depth
	// var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xf9ebd1 });
	var planeMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/checkersBoard.gif') });
	var ground = new THREE.Mesh(planeGeometry, planeMaterial);
	scene.add(ground);	
}

function playerPieces() 
{
	// objectLoader.onLoadComplete = function (obj) { scene.add(obj) } 
}

init();
// window.onload = init;