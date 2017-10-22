var renderer;
var scene;
var camera;
var red, black;

// var baseBoard = [
// 	[0, 1, 0, 1, 0, 1, 0, 1],
// 	[1, 0, 1, 0, 1, 0, 1, 0],
// 	[0, 1, 0, 1, 0, 1, 0, 1],
// 	[0, 0, 0, 0, 0, 0, 0, 0],
// 	[0, 0, 0, 0, 0, 0, 0, 0],
// 	[2, 0, 2, 0, 2, 0, 2, 0],
// 	[0, 2, 0, 2, 0, 2, 0, 2],
// 	[2, 0, 2, 0, 2, 0, 2, 0]
// ];

// var tiles = [];
// var pieces = [];

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
	populateBoard();	
	// playerPiecesRed();
	// playerPiecesBlack();

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
	camera.position.z = 60;
	camera.position.x = 0;
	// camera.position.y = -70; 
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
	var planeGeometry = new THREE.BoxGeometry(80, 80, 5); // width, height, depth
	// var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xf9ebd1 });
	var planeMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/checkersBoard.gif') });
	var ground = new THREE.Mesh(planeGeometry, planeMaterial);
	scene.add(ground);	
}

function populateBoard() 
{
	/*--------------- RED --------------*/
	// Bottom row
	playerPiecesRed(-35, -35);	
	playerPiecesRed(-15, -35);
	playerPiecesRed(5, -35);
	playerPiecesRed(25, -35);
	// Middle row
	playerPiecesRed(-25, -25);
	playerPiecesRed(-5, -25);
	playerPiecesRed(15, -25);
	playerPiecesRed(35, -25);
	// Top row
	playerPiecesRed(-35, -15);
	playerPiecesRed(-15, -15);
	playerPiecesRed(5, -15);
	playerPiecesRed(25, -15);
	
	/*--------------- BLACK --------------*/
	// Top row
	playerPiecesBlack(-25, 35);
	playerPiecesBlack(-5, 35);
	playerPiecesBlack(15, 35);
	playerPiecesBlack(35, 35);
	// Middle row
	playerPiecesBlack(-35, 25);
	playerPiecesBlack(-15, 25);
	playerPiecesBlack(5, 25);
	playerPiecesBlack(25, 25);
	// Bottom row
	playerPiecesBlack(-25, 15);
	playerPiecesBlack(-5, 15);
	playerPiecesBlack(15, 15);
	playerPiecesBlack(35, 15);
	
}
function playerPiecesRed(X, Y) 
{
	var texture = THREE.ImageUtils.loadTexture('images/redTile.jpg');

	var geometry = new THREE.CylinderGeometry(4.5, 4.5, 2.5, 32); // radiusTop, radiusBottom, height, radiusSegments
	var material = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: texture }), .95, .95);
	red = new THREE.Mesh(geometry, material);

	red.position.x = X;
	red.position.y = Y;
	red.position.z = 4;

	red.rotation.x = 30; 
	scene.add(red);

	// objectLoader.onLoadComplete = function (obj) { scene.add(obj) } 
}

function playerPiecesBlack(X, Y) 
{
	var texture = THREE.ImageUtils.loadTexture('images/blackTile.jpg');

	var geometry = new THREE.CylinderGeometry(4.5, 4.5, 2.5, 32); // radiusTop, radiusBottom, height, radiusSegments
	var material = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: texture }), .95, .95);
	black = new THREE.Mesh(geometry, material);

	black.position.x = X;
	black.position.y = Y;
	black.position.z = 4;

	black.rotation.x = 30;
	scene.add(black);
}

init();
// window.onload = init;