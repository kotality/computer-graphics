var renderer;
var scene;
var camera;
var raycaster;
var projector = new THREE.Projector();
var mouse = new THREE.Vector2(), INTERSECTED;
var selectedobject = null;

var targetList = [];
var red, black;

var red1, red2, red3, red4, 
	red5, red6, red7, red8,
	red9, red10, red11, red12;
var black1, black2, black3, black4,
	black5, black6, black7, black8,
	black9, black10, black11, black12;

var tileType = {
	EMPTY: 0,
	RED: 1,
	BLACK: 2,
	REDKING: 3,
	BLACKKING: 4,
};

var baseBoard = [
	[2, 0, 2, 0, 2, 0, 2, 0],
	[0, 2, 0, 2, 0, 2, 0, 2],
	[2, 0, 2, 0, 2, 0, 2, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 1, 0, 1, 0, 1],
	[1, 0, 1, 0, 1, 0, 1, 0],
	[0, 1, 0, 1, 0, 1, 0, 1]
];

Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

function init()
{
	scene = new THREE.Scene();
	
	setupCamera();
	setupRenderer();
	addSpotLight();
	
	// Output to the stream
	document.body.appendChild( renderer.domElement );

	board();
	populateBoard();
	loadSounds();	

	raycaster = new THREE.Raycaster();
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mousedown', onDocumentMouseDown, false);

	// Call render
	render();
}

function render()
{	

	// if (Key.isDown(Key.Z))
	// {
	// 	camera.rotation.x += 0.03;
	// }
	// if (Key.isDown(Key.C))
	// {
	// 	camera.rotation.x -= 0.03;
	// }

	// if (Key.isDown(Key.I)) {
	// 	camera.rotation.z += 0.03;
	// }
	// if (Key.isDown(Key.P)) {
	// 	camera.rotation.z -= 0.03;
	// }

	var number = Math.floor(Math.random() * 13) + 1;;
	// Rotate camera left and right
	if (Key.isDown(Key.A)) 
	{
		scene.remove(red9);
		red9 = playerPiecesRed(-35, -5, 0);
		// camera.rotation.y += 0.03;
	}
	if (Key.isDown(Key.D)) 
	{
		scene.remove(black9);
		black9 = playerPiecesBlack(-25, 5, 0);
		// camera.rotation.y -= 0.03;
	}

	// Move into and out of the screen
	if (Key.isDown(Key.W)) 
	{
		scene.remove(red12);
		red12 = playerPiecesRed(25, -5, 0);
		// var deltaX = Math.sin(camera.rotation.y) * .2;
		// var deltaZ = Math.cos(camera.rotation.y) * .2;
		// camera.position.x -= deltaX;
		// camera.position.z -= deltaZ;
	}
	if (Key.isDown(Key.S)) 
	{
		scene.remove(black11);
		black11 = playerPiecesBlack(15, 5, 0);
		// var deltaX = Math.sin(camera.rotation.y) * .2;
		// var deltaZ = Math.cos(camera.rotation.y) * .2;
		// camera.position.x += deltaX;
		// camera.position.z += deltaZ;
	}

	// Request animation frame
	requestAnimationFrame(render);
	
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
	camera.position.z = 75;
	camera.position.x = 0;
	// camera.position.y = -70; 
	camera.lookAt(scene.position);
	camera.updateMatrixWorld();
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
	// Checkers pattern
	var planeGeometry = new THREE.BoxGeometry(80, 80, 5); // width, height, depth
	var planeMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/checkers2.jpg') });
	var ground = new THREE.Mesh(planeGeometry, planeMaterial);
	scene.add(ground);	

	// Outer boarder
	var wallVertGeo = new THREE.BoxGeometry(6, 82, 10);
	var wallHorizGeo = new THREE.BoxGeometry(94, 6, 13);
	var wallMat = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('images/redBrownWood.jpg')});
	
	var wallR = new THREE.Mesh(wallVertGeo, wallMat);
	var wallL = new THREE.Mesh(wallVertGeo, wallMat);
	var wallT = new THREE.Mesh(wallHorizGeo, wallMat);
	var wallB = new THREE.Mesh(wallHorizGeo, wallMat);

	wallR.position.x = 44;
	wallL.position.x = -44;
	wallT.position.y = 44;
	wallB.position.y = -44;

	scene.add(wallR);
	scene.add(wallL);
	scene.add(wallT);
	scene.add(wallB);

	// Background
	var backGeometry = new THREE.BoxGeometry(450, 200, 5); // width, height, depth
	var backMaterial = new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('images/grass.jpg') });
	var back = new THREE.Mesh(backGeometry, backMaterial);
	back.position.z = -50;
	scene.add(back);	

}

function populateBoard() 
{	
	/*--------------- RED --------------*/
	// Bottom row (starting from bottom left)	
	red1 = playerPiecesRed(-25, -35, 0); 
	red2 = playerPiecesRed(-5, -35, 0);
	red3 = playerPiecesRed(15, -35, 0);
	red4 = playerPiecesRed(35, -35, 0);
	// Middle row
	red5 = playerPiecesRed(-35, -25, 0);
	red6 = playerPiecesRed(-15, -25, 0);
	red7 = playerPiecesRed(5, -25, 0);
	red8 = playerPiecesRed(25, -25, 0);
	// Top row
	red9 = playerPiecesRed(-25, -15, 0);
	red10 = playerPiecesRed(-5, -15, 0);
	red11 = playerPiecesRed(15, -15, 0);
	red12 = playerPiecesRed(35, -15, 0);
	
	// /*--------------- BLACK --------------*/
	// Top row (starting from top left)
	black1 = playerPiecesBlack(-35, 35, 0);
	black2 = playerPiecesBlack(-15, 35, 0);
	black3 = playerPiecesBlack(5, 35, 0);
	black4 = playerPiecesBlack(25, 35, 0);
	// Middle row
	black5 = playerPiecesBlack(-25, 25, 0);
	black6 = playerPiecesBlack(-5, 25, 0);
	black7 = playerPiecesBlack(15, 25, 0);
	black8 = playerPiecesBlack(35, 25, 0);
	// Bottom row
	black9 = playerPiecesBlack(-35, 15, 0);
	black10 = playerPiecesBlack(-15, 15, 0);
	black11 = playerPiecesBlack(5, 15, 0);
	black12 = playerPiecesBlack(25, 15, 0);

	targetList.push(red1);
	targetList.push(red2);
	targetList.push(red3);
	targetList.push(red4);
	targetList.push(red5);
	targetList.push(red6);
	targetList.push(red7);
	targetList.push(red8);
	targetList.push(red9);
	targetList.push(red10);
	targetList.push(red11);
	targetList.push(red12);

	targetList.push(black1);
	targetList.push(black2);
	targetList.push(black3);
	targetList.push(black4);
	targetList.push(black5);
	targetList.push(black6);
	targetList.push(black7);
	targetList.push(black8);
	targetList.push(black9);
	targetList.push(black10);
	targetList.push(black11);
	targetList.push(black12);
}

function playerPiecesRed(X, Y, kingFlag) 
{
	var texture = THREE.ImageUtils.loadTexture('images/redTile.jpg');
	var kingtexture = THREE.ImageUtils.loadTexture('images/redTileKing.jpg');

	var geometry = new THREE.CylinderGeometry(4.5, 4.5, 1, 32); // radiusTop, radiusBottom, height, radiusSegments

	if (kingFlag == 1)
		material = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: kingtexture }), .95, .95);
	else 
		material = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: texture }), .95, .95);

	red = new THREE.Mesh(geometry, material);

	red.position.x = X;
	red.position.y = Y;
	red.position.z = 4;

	red.rotation.x = 30; 
	scene.add(red);

	return red;
}

function playerPiecesBlack(X, Y, kingFlag) 
{
	var texture = THREE.ImageUtils.loadTexture('images/blackTile.jpg');
	var kingtexture = THREE.ImageUtils.loadTexture('images/blackTileKing.jpg');

	var geometry = new THREE.CylinderGeometry(4.5, 4.5, 1, 32); // radiusTop, radiusBottom, height, radiusSegments

	if (kingFlag == 1)
		material = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: kingtexture }), .95, .95);
	else
		material = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: texture }), .95, .95);

	var black = new THREE.Mesh(geometry, material);

	black.position.x = X;
	black.position.y = Y;
	black.position.z = 4;

	black.rotation.x = 30;
	scene.add(black);

	return black;
}

function kingMeBlack(tile)
{
	if (tile.position == baseBoard[7][1] || tile.position == baseBoard[7][3] ||
		tile.position == baseBoard[7][5] || tile.position == baseBoard[7][7]) 
	{
		tile.type = tileType.BLACKKING;
		playerPiecesBlack(tile.position.x, tile.position.y, 1);		
	}
}

function kingMeRed(tile)
{
	if (tile.position == baseBoard[0][0] || tile.position == baseBoard[0][2] ||
		tile.position == baseBoard[0][4] || tile.position == baseBoard[0][6]) 
	{
		tile.type = tileType.REDKING;
		playerPiecesRed(tile.position.x, tile.position.y, 1);
	}
}

function onDocumentMouseMove(event) 
{
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	if (selectedobject != null) 
	{
		var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
		vector.unproject(camera);

		raycaster.set(camera.position, vector.sub(camera.position).normalize());

		var intersects = raycaster.intersectObject(plane);
		selectedobject.position.copy(intersects[0].point);
	}

	// raycaster.setFromCamera(mouse, camera);
	// var intersects = raycaster.intersectObjects(scene.children);
	// if (intersects.length > 0) 
	// {
	// 	if (INTERSECTED != intersects[0].object) 
	// 	{
	// 		if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
	// 		INTERSECTED = intersects[0].object;
	// 		INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
	// 		INTERSECTED.material.emissive.setHex(0xff0000);
	// 	}
	// } 
	// else 
	// {
	// 	if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
	// 	INTERSECTED = null;
	// }
}

function onDocumentMouseDown(event) 
{
	// update the mouse variable
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

	// find intersections
	var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
	projector.unprojectVector(vector, camera);
	var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects(targetList);

	// if there is one (or more) intersections
	if (intersects.length > 0) 
	{
		// change the color of the closest face.
		intersects[0].face.color.setRGB(0.8 * Math.random() + 0.2, 0, 0);
		intersects[0].object.geometry.colorsNeedUpdate = true;
	}

}

var checkerPlace, eatPiece;
function loadSounds() 
{
	// Background music
	var audio = new Audio("sounds/3-31.mp3");
	audio.loop = true;
	audio.play();

	// Foley
	// checkerPlace = new Audio("sounds/pacman_chomp.wav");
	// // ghostFish = new Audio("sounds/");
	// eatPiece = new Audio("sounds/pacman_death.wav");
}

init();
// window.onload = init;