var renderer, rendererHUD;
var scene;
var camera, cameraHUD;

var player;
var groundPlane;

var collidable = [];

var rw = 200, rh = 150;
var ca = 100, ar = 2;

Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

function init()
{
	scene = new Physijs.Scene();

	setupRenderers();
	setupCameras();
	
	setupSpotlight(100,100,0xff0000,1);
	setupSpotlight(100,-100,0x00ff00,2);
	setupSpotlight(-100,-100,0x0000ff,3);
	setupSpotlight(-100,100,0xffff00,4);
	
	setupPlayer();
	
	// addObjectsToScene();
	groundPlane();
	addWalls();
	nameGame();

	ghost1();
	ghost2();
	ghost3();
	ghost4();
	pebbles();

	nameGame();

	loadSounds();
	
	// Output to the stream
	var container = document.getElementById("MainView");
	container.appendChild( renderer.domElement );

	// HUD
	var containerHUD = document.getElementById("HUDView");
	containerHUD.appendChild( rendererHUD.domElement );
	
	// Call render
	render();
}

// Ball; Pacman
function setupPlayer()
{
	var texture = THREE.ImageUtils.loadTexture('images/goldfish.jpg');

	var ballGeometry = new THREE.SphereGeometry( 2.5 ); // radius of sphere = 3
	// var ballMaterial = new THREE.MeshLambertMaterial({color:'white'});
	var ballMaterial = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: texture }), .95, .95);	
	player = new Physijs.SphereMesh( ballGeometry, ballMaterial );
	scene.add( player );
}

function setupRenderers()
{
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x000000, 0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;

	// HUD
	rendererHUD = new THREE.WebGLRenderer();
	rendererHUD.setClearColor( 0x000000, 0 );
	rendererHUD.setSize( rw, rh );
	rendererHUD.shadowMapEnabled = true;
}

function setupCameras()
{
	camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
	camera.lookAt( scene.position);
	// camera.position.z = 0;
	// camera.position.y = 110;
	// camera.rotation.x = 4.7;
	camera.position.x = 36;
	camera.position.z = 34;

	// HUD
	cameraHUD = new THREE.PerspectiveCamera(ca,ar,0.1,4000);
	cameraHUD.position.y = 40;
	cameraHUD.lookAt( new THREE.Vector3(0,0,0) );
}

// Pacman and camera movements, collision
function render()
{
	var deltaX, deltaZ;

	// Player rotate camera left and right
	if( Key.isDown( Key.A ) )
	{
		camera.rotation.y += 0.03;
	}
	if( Key.isDown( Key.D ) )
	{
		camera.rotation.y -= 0.03;
	}

	// Player move forward and back
	if( Key.isDown( Key.W ) )
	{
		deltaX = Math.sin(camera.rotation.y)*.2;
		deltaZ = Math.cos(camera.rotation.y)*.2;
		camera.position.x -= deltaX;
		camera.position.z -= deltaZ;
		pacmanChomp.play();
	}
	if( Key.isDown( Key.S ) )
	{
		var deltaX = Math.sin(camera.rotation.y)*.2;
		var deltaZ = Math.cos(camera.rotation.y)*.2;
		camera.position.x += deltaX;
		camera.position.z += deltaZ;
		pacmanChomp.play();
	}
	
	player.position.x = camera.position.x;
	player.position.y = camera.position.y;
	player.position.z = camera.position.z;
	
	// player.position = camera.position; Does not work

	// Rotate camerea up and down
	// if (Key.isDown(Key.Q)) 
	// {
	// 	camera.rotation.x -= 0.01;
	// }
	// if (Key.isDown(Key.E)) 
	// {
	// 	camera.rotation.x += 0.01;
	// }

	// Move from ground level to overhead
	if( Key.isDown(Key._1))
	{
		camera.position.y = 0;
	}
	if( Key.isDown(Key._2))
	{
		camera.position.y = .5;
	}
	if( Key.isDown(Key._3))
	{
		camera.position.y = 1;
	}
	if( Key.isDown(Key._4))
	{
		camera.position.y = 1.5;
	}
	if( Key.isDown(Key._5))
	{
		camera.position.y = 2;
	}
	if( Key.isDown(Key._6))
	{
		camera.position.y = 2.5;
	}
	
	// Adjust Brightness
	if( Key.isDown(Key._7))
	{
		setBrightness(12);
	}
	if( Key.isDown(Key._8))
	{
		setBrightness(10);
	}
	if( Key.isDown(Key._9))
	{
		setBrightness(8);
	}
	if( Key.isDown(Key._0))
	{
		setBrightness(6);
	}
	
	// Rotate MiniMap up and down from central pivot
	if( Key.isDown(Key.U))
	{
		cameraHUD.rotation.x -= 0.1;
	}
	if( Key.isDown(Key.I))
	{
		cameraHUD.rotation.x += 0.1;
	}

	//??????????
	if( Key.isDown(Key.O))
	{
		cameraHUD.fov -= 1;
		camera.updateProjectionMatrix();
	}
	if( Key.isDown(Key.P))
	{
		cameraHUD.fov += 1;
		camera.updateProjectionMatrix();
	}
	if( Key.isDown(Key.K))
	{
		cameraHUD.aspect += .1;
		camera.updateProjectionMatrix();
	}
	if( Key.isDown(Key.L))
	{
		cameraHUD.aspect -= .1;
		camera.updateProjectionMatrix();
	}

	// Zoom MiniMap
	if( Key.isDown(Key.M))
	{
		cameraHUD.position.y -= 1;
		camera.updateProjectionMatrix();
	}
	if( Key.isDown(Key.N))
	{
		cameraHUD.position.y += 1;
		camera.updateProjectionMatrix();
	}

	// Scroll MiniMap up and down
	if( Key.isDown(Key.V))
	{
		cameraHUD.position.z -= 1;
		camera.updateProjectionMatrix();
	}
	if( Key.isDown(Key.B))
	{
		cameraHUD.position.z += 1;
		camera.updateProjectionMatrix();
	}

	var originPoint = player.position.clone();

	for (var vertexIndex = 0; vertexIndex < player.geometry.vertices.length; vertexIndex++) 
	{
		var localVertex = player.geometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4(player.matrix);
		var directionVector = globalVertex.sub(player.position);

		var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
		var collisionResults = ray.intersectObjects(collidable);
		if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length())
		{	
			player.position.x = deltaX;
			player.position.z = deltaZ;
			// player.position.y -= 0;
			// camera.rotation.x = 0;
			// camera.rotation.z = 0;
			// appendText(" Hit ");

			// _vector.set(0, 0, 0);
			// selected_block.setAngularFactor(_vector);
			// selected_block.setAngularVelocity(_vector);
			// selected_block.setLinearFactor(_vector);
			// selected_block.setLinearVelocity(_vector);
		}
	}

	// Request animation frame
	requestAnimationFrame(render);

	renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);

	rendererHUD.setScissorTest(true);
	rendererHUD.setViewport(0, 0, rw, rh);
	rendererHUD.render(scene, cameraHUD);
}

function setBrightness( value )
{
	var i;
	for( i=1; i<=4; i++ )
	{
		var name = "SpotLight"+i;
		var light = scene.getObjectByName( name );
		light.intensity = value;
	}
}

// Draw the ground plane
function groundPlane()
{
	var texture = THREE.ImageUtils.loadTexture('images/sandDark.jpg');
	var planeMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: texture }), .4, .8);
	var planeGeometry = new THREE.BoxGeometry(80, 5, 80); // width, height, depth
	groundPlane = new Physijs.BoxMesh(planeGeometry, planeMaterial);

	groundPlane.position.y = -5;

	scene.add(groundPlane);
}

var outWall, outWall2, outWall3, outWall4;
var one, two, twoB, three, four, five, sixA, sixB, sevenA, eightA, eightB, nine, ten, eleven;
var twelve, thirteen, fifteenB, sixteenB;
var nineteenA, nineteenB, twentyA, twentyB, twentyoneB, TwentyTwoA;
var twentyfourA, twentyfourB, twentyfourC, twentyfourD, twentyfourE;
function addWalls()
{
	/*-------------------------OUTER WALLS------------------------------------*/
	var wallTexture = THREE.ImageUtils.loadTexture('images/fishSwimming2.jpg');
	var outWallMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: wallTexture }), .95, .95);// .4, .8);
	var outWallGeometry = new THREE.BoxGeometry(3, 5, 80); // width, height, depth
	var outWallGeometry2 = new THREE.BoxGeometry(77, 5, 3);
	
	// Right
	outWall = new Physijs.BoxMesh(outWallGeometry, outWallMaterial, 0);
	outWall.position.x = 40;
	scene.add(outWall);
	collidable.push(outWall);
	var outWall = new Physijs.BoxMesh(outWallGeometry, outWallMaterial, 0);
	outWall.position.x = 40;
	scene.add(outWall);

	// Left
	outWall2 = new Physijs.BoxMesh(outWallGeometry, outWallMaterial, 0);
	outWall2.position.x = -40;
	scene.add(outWall2);
	collidable.push(outWall2);
	var outWall2 = new Physijs.BoxMesh(outWallGeometry, outWallMaterial, 0);
	outWall2.position.x = -40;
	scene.add(outWall2);

	//Top
	outWall3 = new Physijs.BoxMesh(outWallGeometry2, outWallMaterial, 0);
	outWall3.position.z = 38.5;
	scene.add(outWall3);
	collidable.push(outWall3);
	var outWall3 = new Physijs.BoxMesh(outWallGeometry2, outWallMaterial, 0);
	outWall3.position.z = 38.5;
	scene.add(outWall3);

	//Bottom
	outWall4 = new Physijs.BoxMesh(outWallGeometry2, outWallMaterial, 0);
	outWall4.position.z = -38.5;
	scene.add(outWall4);
	collidable.push(outWall4);
	var outWall4 = new Physijs.BoxMesh(outWallGeometry2, outWallMaterial, 0);
	outWall4.position.z = -38.5;
	scene.add(outWall4);

	/*-------------------------INNER WALLS 1----------------------------------*/
	// One
	var innerGeometry = new THREE.BoxGeometry(8, 5, 3); // width, height, depth
	one = new Physijs.BoxMesh(innerGeometry, outWallMaterial, 0);
	one.position.x = -30;
	one.position.z = -30;
	scene.add(one);

	// Two
	var innerGeometry2 = new THREE.BoxGeometry(15, 5, 3); // width, height, depth
	two = new Physijs.BoxMesh(innerGeometry2, outWallMaterial, 0);
	two.position.x = -14;
	two.position.z = -30;
	scene.add(two);

	// TwoB
	var innerGeometry3 = new THREE.BoxGeometry(3, 5, 15); // width, height, depth
	twoB = new Physijs.BoxMesh(innerGeometry3, outWallMaterial, 0);
	twoB.position.x = 0;
	twoB.position.z = -30;
	scene.add(twoB);

	// Three
	three = new Physijs.BoxMesh(innerGeometry2, outWallMaterial, 0);
	three.position.x = 14;
	three.position.z = -30;
	scene.add(three);

	// Four
	four = new Physijs.BoxMesh(innerGeometry, outWallMaterial, 0);
	four.position.x = 30;
	four.position.z = -30;
	scene.add(four);

	/*-------------------------INNER WALLS 2----------------------------------*/
	// Five
	var innerGeometry5 = new THREE.BoxGeometry(12, 5, 3); // width, height, depth
	five = new Physijs.BoxMesh(innerGeometry5, outWallMaterial, 0);
	five.position.x = -28;
	five.position.z = -21;
	scene.add(five);

	// SixA
	var innerGeometry6 = new THREE.BoxGeometry(3, 5, 15); // width, height, depth
	sixA = new Physijs.BoxMesh(innerGeometry6, outWallMaterial, 0);
	sixA.position.x = -15;
	sixA.position.z = -15;
	scene.add(sixA);

	// SixB
	var innerGeometry6B = new THREE.BoxGeometry(11, 5, 3); // width, height, depth
	sixB = new Physijs.BoxMesh(innerGeometry6B, outWallMaterial, 0);
	sixB.position.x = -8;
	sixB.position.z = -16;
	scene.add(sixB);

	// SevenA
	var innerGeometry7A = new THREE.BoxGeometry(19, 5, 3); // width, height, depth
	sevenA = new Physijs.BoxMesh(innerGeometry7A, outWallMaterial, 0);
	sevenA.position.x = 4;
	sevenA.position.z = -9;
	scene.add(sevenA);

	// SevenB

	// EightA
	eightA = new Physijs.BoxMesh(innerGeometry6, outWallMaterial, 0);
	eightA.position.x = 15;
	eightA.position.z = -15;
	scene.add(eightA);

	// EightB
	eightB = new Physijs.BoxMesh(innerGeometry6B, outWallMaterial, 0);
	eightB.position.x = 8;
	eightB.position.z = -16;
	scene.add(eightB);

	// Nine
	nine = new Physijs.BoxMesh(innerGeometry5, outWallMaterial, 0);
	nine.position.x = 28;
	nine.position.z = -21;
	scene.add(nine);

	// Ten
	var innerGeometry10 = new THREE.BoxGeometry(17, 5, 8); // width, height, depth
	ten = new Physijs.BoxMesh(innerGeometry10, outWallMaterial, 0);
	ten.position.x = -31;
	ten.position.z = -10;
	scene.add(ten);

	// Eleven
	eleven = new Physijs.BoxMesh(innerGeometry10, outWallMaterial, 0);
	eleven.position.x = 31;
	eleven.position.z = -10;
	scene.add(eleven);

	/*-------------------------INNER WALLS 3----------------------------------*/
	// Twelve
	var innerGeometry12 = new THREE.BoxGeometry(15, 5, 5); // width, height, depth
	twelve = new Physijs.BoxMesh(innerGeometry12, outWallMaterial, 0);
	twelve.position.x = -33;
	twelve.position.z = 1.5;
	scene.add(twelve);

	// Thirteen
	thirteen = new Physijs.BoxMesh(innerGeometry12, outWallMaterial, 0);
	thirteen.position.x = 33;
	thirteen.position.z = 1.5;
	scene.add(thirteen);

	// Fourteen
	// FifteenA
	
	// FifteenB
	var innerGeometry15 = new THREE.BoxGeometry(3, 5, 15); // width, height, depth
	fifteenB = new Physijs.BoxMesh(innerGeometry15, outWallMaterial, 0);
	fifteenB.position.x = -24;
	fifteenB.position.z = 6.5;
	scene.add(fifteenB);

	// SixteenA

	// SixteenB
	sixteenB = new Physijs.BoxMesh(innerGeometry15, outWallMaterial, 0);
	sixteenB.position.x = 24;
	sixteenB.position.z = 6.5;
	scene.add(sixteenB);

	// Seventeen
	// EighteenA
	// EighteenB
	// EighteenC

	/*-------------------------INNER WALLS 4----------------------------------*/
	// NineteenA
	var innerGeometry19 = new THREE.BoxGeometry(3, 5, 15); // width, height, depth
	nineteenA = new Physijs.BoxMesh(innerGeometry19, outWallMaterial, 0);
	nineteenA.position.x = -24;
	nineteenA.position.z = 26;
	scene.add(nineteenA);

	// NineteenB
	var innerGeometry19B = new THREE.BoxGeometry(9, 5, 4); // width, height, depth
	nineteenB = new Physijs.BoxMesh(innerGeometry19B, outWallMaterial, 0);
	nineteenB.position.x = -30;
	nineteenB.position.z = 25;
	scene.add(nineteenB);
	
	// TwentyA
	var innerGeometry20A = new THREE.BoxGeometry(34, 5, 3); // width, height, depth
	twentyA = new Physijs.BoxMesh(innerGeometry20A, outWallMaterial, 0);
	twentyA.position.x = 0;
	twentyA.position.z = 20;
	scene.add(twentyA);

	// TwentyB
	twentyB = new Physijs.BoxMesh(innerGeometry20A, outWallMaterial, 0);
	twentyB.position.x = 0;
	twentyB.position.z = 31;
	scene.add(twentyB);

	// TwentyOneA

	// TwentyOneB
	twentyoneB = new Physijs.BoxMesh(innerGeometry19B, outWallMaterial, 0);
	twentyoneB.position.x = 30;
	twentyoneB.position.z = 25;
	scene.add(twentyoneB);

	// TwentyTwoA
	TwentyTwoA = new Physijs.BoxMesh(innerGeometry19, outWallMaterial, 0);
	TwentyTwoA.position.x = 24;
	TwentyTwoA.position.z = 26;
	scene.add(TwentyTwoA);

	// TwentyTwoB
	// TwentyThreeA
	// TwentyThreeB

	/*--------------------------GHOST FISH------------------------------------*/
	// TwentyFourA
	var innerGeometry24A = new THREE.BoxGeometry(32, 5, 3); // width, height, depth
	twentyfourA = new Physijs.BoxMesh(innerGeometry24A, outWallMaterial, 0);
	twentyfourA.position.x = 0;
	twentyfourA.position.z = 12;
	scene.add(twentyfourA);

	// TwentyFourB
	var innerGeometry24B = new THREE.BoxGeometry(3, 5, 11.5); // width, height, depth
	twentyfourB = new Physijs.BoxMesh(innerGeometry24B, outWallMaterial, 0);
	twentyfourB.position.x = -14.5;
	twentyfourB.position.z = 4.75;
	scene.add(twentyfourB);

	// TwentyFourC
	twentyfourC = new Physijs.BoxMesh(innerGeometry24B, outWallMaterial, 0);
	twentyfourC.position.x = 14.5;
	twentyfourC.position.z = 4.75;
	scene.add(twentyfourC);

	// TwentyFourD
	var innerGeometry24D = new THREE.BoxGeometry(9, 5, 3); // width, height, depth
	twentyfourD = new Physijs.BoxMesh(innerGeometry24D, outWallMaterial, 0);
	twentyfourD.position.x = -8.5;
	twentyfourD.position.z = 0.5;
	scene.add(twentyfourD);

	// TwentyFourE
	twentyfourE = new Physijs.BoxMesh(innerGeometry24D, outWallMaterial, 0);
	twentyfourE.position.x = 8.5;
	twentyfourE.position.z = 0.5;
	scene.add(twentyfourE);
}

// Pinky
function ghost1()
{
	var geo = new THREE.SphereGeometry(2.5); //width, height, depth,
	var mat = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: '#ea82e5' }), .95, .95);
	var msh = new Physijs.BoxMesh(geo, mat);

	// var geo = new THREE.BoxGeometry(4, 3, 2); //width, height, depth,
	// var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: '#FF4500' }), .95, .95);
	// var msh = new Physijs.BoxMesh(geo, mat);

	msh.position.x = 3; msh.position.y = -1;
	msh.position.z = 6;
	scene.add(msh);
}

// Inky Blue
function ghost2()
{
	var geo = new THREE.SphereGeometry(2.5); //width, height, depth,
	var mat = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: '#46bfee' }), .95, .95);
	var msh = new Physijs.BoxMesh(geo, mat);

	msh.position.x = 9; msh.position.y = -1;
	msh.position.z = 6;
	scene.add(msh);
}

// Blinky Red
function ghost3() 
{
	var geo = new THREE.SphereGeometry(2.5); //width, height, depth,
	var mat = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: '#d03e19' }), .95, .95);
	var msh = new Physijs.BoxMesh(geo, mat);

	msh.position.x = -3; msh.position.y = -1;
	msh.position.z = 6;
	scene.add(msh);
}

// Clyde Orange
function ghost4() 
{
	var geo = new THREE.SphereGeometry(2.5); //width, height, depth,
	var mat = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: '#db851c' }), .95, .95);
	var msh = new Physijs.BoxMesh(geo, mat);

	msh.position.x = -9; msh.position.y = -1;
	msh.position.z = 6;
	scene.add(msh);
}

function pebblesHelp()
{
	for (var i = 0; i < 20; i++)
	{
		pebbles();
	}
}

// Pellets pacman picks up through maze
function pebbles()
{
	var j = 0;

	for (var i = 0; i < 9; i++) {
		var geo = new THREE.SphereGeometry(0.5); //width, height, depth,
		var mat = new Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 'ffffff' }), .95, .95);
		var msh = new Physijs.BoxMesh(geo, mat);
		var msh2 = new Physijs.BoxMesh(geo, mat);

		msh.position.x = i * 5; msh.position.y = -1; msh.position.z += j; 
		msh2.position.x = -i * 5; msh2.position.y = -1; msh2.position.z += -j;

		scene.add(msh);
		scene.add(msh2);

		j++;
	}
}

// Adds game name to the top of screen
function nameGame()
{
	var color = new THREE.MeshBasicMaterial({ color: "yellow" });

	// var textGeometry2 = new THREE.TextGeometry('Underwater PacMan',
	// 	{
	// 		size: 20,
	// 		height: 6,
	// 		curveSegments: 12,
	// 		bevelEnabled: true,
	// 		bevelThickness: 10,
	// 		bevelSize: 8,
	// 		bevelSegments: 5
	// 	}
	// );

	// var show = new THREE.Mesh(textGeometry2, color);
	// show.position.x = 0;
	// show.position.y = 5;
	// show.position.z = -15;
	// scene.add(show);
}

function addObjectsToScene()
{
	var x, z;
	var texture = THREE.ImageUtils.loadTexture('images/water.jpg');

	for( z=-35; z<=35; z+=5 )
	{
		for( x=-35; x<=35; x+= 5)
		{
			if( x == 0 && z == 0 )
			{
				continue;
			}
			// var r = Math.floor( Math.random() * 255 );
			// var g = Math.floor( Math.random() * 255 );
			// var b = Math.floor( Math.random() * 255 );
			// var col = r * 65536 + g * 256 + b; // BoxGeometry(width, height, depth)
			// var cube = new Physijs.BoxMesh(new THREE.BoxGeometry(2,5,3),new THREE.MeshLambertMaterial({color:col}));
			var cubeMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: texture }), .4, .8 );
			var cubeGeometry = new THREE.BoxGeometry(2,5,3); // width, height, depth
			var cube = new Physijs.BoxMesh(cubeGeometry, cubeMaterial, 0);
			cube.name = "WallCubes";
			cube.position.x = x;
			cube.position.z = z;
			scene.add( cube );
		}
	}
}

function setupSpotlight(x,z,color,number)
{
	// SpotLight( color, intensity, distance, angle, penumbra, decay )
	spotLight = new THREE.SpotLight( color, 12, 300, 1, 0, 0 );
	spotLight.position.set( x, 100, z );
	spotLight.target.position.set( x,0,z);
	spotLight.name = "SpotLight"+number;
	scene.add(spotLight);
}

// Add sounds to game
var pacmanChomp, death;//, ghostFish;
function loadSounds() {
	// Background music
	var audio = new Audio("sounds/PacmanRemix.mp3");
	audio.loop = true;
	audio.play();

	// Foley
	pacmanChomp = new Audio("sounds/pacman_chomp.wav");
	// ghostFish = new Audio("sounds/");
	death = new Audio("sounds/pacman_death.wav");
}

window.onload = init;

