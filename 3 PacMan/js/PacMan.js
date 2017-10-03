var renderer, rendererHUD;
var scene;
var camera, cameraHUD;

var player;

var rw = 200, rh = 150;
var ca = 100, ar = 2;

Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

/*
#####################################
#				  ##			    #
#  ###  ########  ##  ########  ##  #
#  ###  ########  ##  ########  ##  #
#									#
#  #####  ##  #########  ##  #####  #
#  #####  ##  #########  ##  #####  #
#         ##      ##     ##         #
######  ########  ##  #####  ########
######  ########      #####  ########
#		                            #
######  ###  ####   ####  ###  ###  #
######  ###  ##       ##  ###  ###  #
##      ###  ###########  ###  ###  #
##  ##      				   ######
#   ##  ###  ###########  ###
###########

####################################
*/

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
	addWalls();
	
	// Main code here.
	
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
	var texture = THREE.ImageUtils.loadTexture('images/metal3.jpg');

	var ballGeometry = new THREE.SphereGeometry( 1 ); // radius of sphere = 3
	// var ballMaterial = new THREE.MeshLambertMaterial({color:'white'});
	var ballMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: texture }), .95, .95);	
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
	// camera.lookAt( scene.position);
	camera.position.z = 0;
	camera.position.y = 110;
	camera.rotation.x = 4.7;

	// HUD
	cameraHUD = new THREE.PerspectiveCamera(ca,ar,0.1,4000);
	cameraHUD.position.y = 51;
	cameraHUD.lookAt( new THREE.Vector3(0,0,0) );
}

function render()
{
	// Player rotate camera left and right
	if( Key.isDown( Key.A ) )
	{
		camera.rotation.y += 0.01;
	}
	if( Key.isDown( Key.D ) )
	{
		camera.rotation.y -= 0.01;
	}

	// Player move forward and back
	if( Key.isDown( Key.W ) )
	{
		var deltaX = Math.sin(camera.rotation.y)*.2;
		var deltaZ = Math.cos(camera.rotation.y)*.2;
		camera.position.x -= deltaX;
		camera.position.z -= deltaZ;
	}
	if( Key.isDown( Key.S ) )
	{
		var deltaX = Math.sin(camera.rotation.y)*.2;
		var deltaZ = Math.cos(camera.rotation.y)*.2;
		camera.position.x += deltaX;
		camera.position.z += deltaZ;
	}
	
	player.position.x = camera.position.x;
	player.position.y = camera.position.y;
	player.position.z = camera.position.z;
	
	// player.position = camera.position; Does not work
	

	// Rotate camerea up and down
	if (Key.isDown(Key.Q)) 
	{
		camera.rotation.x -= 0.01;
	}
	if (Key.isDown(Key.E)) 
	{
		camera.rotation.x += 0.01;
	}

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
	
	// Request animation frame
	requestAnimationFrame( render );
	
	renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
	renderer.render( scene, camera );
	
	rendererHUD.setScissorTest(true);
	rendererHUD.setViewport( 0, 0, rw, rh );
	rendererHUD.render( scene, cameraHUD );
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

function addWalls()
{
	/*-------------------------OUTER WALLS------------------------------------*/
	var wallTexture = THREE.ImageUtils.loadTexture('images/water.jpg');
	var outWallMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({ map: wallTexture }), .95, .95);// .4, .8);
	var outWallGeometry = new THREE.BoxGeometry(3, 5, 80); // width, height, depth
	var outWallGeometry2 = new THREE.BoxGeometry(76, 5, 3);
	
	// Right
	var outWall = new Physijs.BoxMesh(outWallGeometry, outWallMaterial, 0);
	outWall.position.x = 40;
	scene.add(outWall);
	// Left
	var outWall2 = new Physijs.BoxMesh(outWallGeometry, outWallMaterial, 0);
	outWall2.position.x = -40;
	scene.add(outWall2);
	//Top
	var outWall3 = new Physijs.BoxMesh(outWallGeometry2, outWallMaterial, 0);
	outWall3.position.z = 38.5;
	scene.add(outWall3);
	//Bottom
	var outWall4 = new Physijs.BoxMesh(outWallGeometry2, outWallMaterial, 0);
	outWall4.position.z = -38.5;
	scene.add(outWall4);

	/*-------------------------INNER WALLS------------------------------------*/
	var innerGeometry = new THREE.BoxGeometry(10, 5, 3); // width, height, depth
	var one = new Physijs.BoxMesh(innerGeometry, outWallMaterial, 0);
	one.position.x = 28;
	scene.add(one);
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

window.onload = init;

