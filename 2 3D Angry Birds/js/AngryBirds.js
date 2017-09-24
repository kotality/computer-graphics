var renderer;
var scene;
var camera;
var spotLight;
var smsh;

//<!-- add objects in the scope so all methods can access -->
var groundPlane;
var ball;

//<!-- 3. Add the following two lines. -->
Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

function init()
{
	//<!-- 4. Edit the scene creation -->
	scene = new Physijs.Scene();
	scene.setGravity(new THREE.Vector3( 0, 0, -30 ));
	
	setupCamera();
	setupRenderer();
	addSpotLight();
	
	//<!-- 5. Ground plane -->
	createGroundPlane();
	
	//<!-- 7. Create and add cannon -->
	createCannon();
	
	//<!-- 11. Create ball -->
	createBall();
	
	//<!-- 14. Create target -->
	createTarget();

	loadSounds();

	// Output to the stream
	document.body.appendChild( renderer.domElement );
	
	// Call render
	render();
}

function render()
{
	//<!-- 6. Physics simulation -->
	scene.simulate();
	
	//<!-- 9. Maintain cannon elevation controls -->
	maintainCannonElevationControls();
	
	//<!-- 10. Maintain cannon right/left -->
	maintainCannonRightLeft();

	//<!-- 12. Look for ball keypresses -->
	maintainBallKeypresses();
	
	//<!-- 15. Check for ball off the plane -->
	checkBallPosition();

	// Request animation frame
	requestAnimationFrame( render );
	
	// Call render()
	renderer.render( scene, camera );
}

//<!-- 5. Ground plane -->
function createGroundPlane()
{
	var texture = THREE.ImageUtils.loadTexture('images/space.jpg');
	
	var planeMaterial = new Physijs.createMaterial(new THREE.MeshLambertMaterial({map:texture}), .4, .8 );
	var planeGeometry = new THREE.PlaneGeometry( 200, 200, 6 );
	groundPlane = new Physijs.BoxMesh( planeGeometry, planeMaterial, 0 );
	groundPlane.name = "GroundPlane";
	
	scene.add( groundPlane );
}

//<!-- 7. Create cannon -->
function createCannon()
{
	var cylinderGeometry = new THREE.CylinderGeometry( 2, 2, 10 );
	var cylinderMaterial = new THREE.MeshLambertMaterial({color:'lightgray'});
	var can = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
	can.position.y = -5;
	//scene.add(can);

	//<!-- 8. Create Object3D wrapper that will allow use to correctly rotate -->
	cannon = new THREE.Object3D();
	cannon.add( can );
	
	cannon.rotation.z = Math.PI / 2;
	cannon.position.x -= 84;
	cannon.position.z += 20;
	cannon.name = "CannonBall";
	scene.add( cannon );
}

//<!-- 9. Maintain cannon elevation controls -->
function maintainCannonElevationControls()
{
	if( Key.isDown(Key.W))
	{
		cannon.rotation.y -= 0.01;
		if( cannon.rotation.y < -( Math.PI / 3 ) )
		{
			cannon.rotation.y = -( Math.PI / 3 );
		}
	}
	if( Key.isDown(Key.S))
	{
		cannon.rotation.y += 0.01;
		if( cannon.rotation.y > 0 )
		{
			cannon.rotation.y = 0;
		}
	}
}

//<!-- 10. Maintain cannon right/left -->
function maintainCannonRightLeft()
{
	if( Key.isDown(Key.A))
	{
		cannon.rotation.z += 0.01;
	}
	if( Key.isDown(Key.D))
	{
		cannon.rotation.z -= 0.01;
	}
}


//<!-- 12. Look for ball keypresses -->
var ballLaunched = false;
function maintainBallKeypresses()
{
	if( !ballLaunched && Key.isDown(Key.F) )
	{
		createBall();
		ballLaunched = true;
		scene.add( ball );
		ball.applyCentralImpulse( new THREE.Vector3( 8000, -( Math.PI / 2 - cannon.rotation.z ) * 4000, -cannon.rotation.y * 10000 ) );
	}
	if( ballLaunched && Key.isDown(Key.L) )
	{
		ballLaunched = false;
		scene.remove( ball );
	}
}

//<!-- 11. Create ball -->
function createBall()
{
	var ballGeometry = new THREE.SphereGeometry( 3 );
	var ballMaterial = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'white'}), .95, .95 );
	ball = new Physijs.SphereMesh( ballGeometry, ballMaterial );
	
	ball.position.x = cannon.position.x + Math.cos((Math.PI/2)-cannon.rotation.z) * 10;
	ball.position.y = cannon.position.y - Math.cos(cannon.rotation.z) * 10;
	ball.position.z = cannon.position.z - Math.sin(cannon.rotation.y) * 10;
	
	ball.name = 'CannonBall';
	
	ball.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
	{
		if( other_object.name != "GroundPlane" )
		{
		}
	});
}

//<!-- 14. Create target -->
var targetlist;
function createTarget()
{
	targetlist = [];
	
	// creates pillars ball is on
	for( var i=0; i<4; i++ )
	{
		var geo = new THREE.BoxGeometry( 4, 4, 12 );
		var mat = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'blue'}), .95, .95 );
		var msh = new Physijs.BoxMesh( geo, mat );
		switch( i )
		{// poition of blocks under ball starting
			case 0: msh.position.x = 80; break;
			case 1: msh.position.x = 85; msh.position.y = 5; break;
			case 2: msh.position.x = 90; break;
			case 3: msh.position.x = 85; msh.position.y = -5; break;
		}
		msh.position.z = 6;
		targetlist.push( msh );
		scene.add( msh );
	}
	
	// Creates target ball
	var sg = new THREE.SphereGeometry( 5 );
	var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
	smsh = new Physijs.SphereMesh( sg, sm );
	smsh.position.x = 85;
	smsh.position.y = 0;
	smsh.position.z = 16;
	smsh.name = "TargetBall";
	
	scene.add( smsh );
}

//<!-- 15. Check for ball off the plane -->
function checkBallPosition()
{
	if( smsh.position.y > 5 )
	{
		scene( smsh );
	}
}

// function instructions()
// {

// }

var cannon;
function loadSounds() 
{
	// Background music
	// var audio = new Audio("sounds/condition_omega.mp3");
	// audio.loop = true;
	// audio.play();

	// Foley
	cannon = new Audio("sounds/cannon1.wav");
}

function setupCamera()
{
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.x = 0;
	camera.position.y = -100;
	camera.position.z = 250;
	camera.lookAt( scene.position );
}

// function rotateCamera()
// {
// 	//var rotateSpeed = 0.2;

// 	if (Key.isDown(Key.A)) 
// 	{
// 		camera.rotation.x +=0.01;
// 		//cannon.rotation.z += 0.01;
// 	}
// 	if (Key.isDown(Key.D)) 
// 	{
// 		//cannon.rotation.z -= 0.01;
// 	}
// 	if (Key.isDown(Key.UPARROW))
// 	{

// 	}

// 	// var timer = Date.now() * 0.0001;

// 	// camera.position.x = Math.cos(timer) * 200;
// 	// camera.position.z = Math.sin(timer) * 200;
// 	// camera.lookAt(scene.position);

// 	// renderer.render(scene, camera);

// }

function setupRenderer()
{
	renderer = new THREE.WebGLRenderer();
	//						color     alpha
	renderer.setClearColor( 0x000000, 1.0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
}

function addSpotLight()
{
	spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 0, 0, 200 );
	spotLight.shadowCameraNear = 10;
	spotLight.shadowCameraFar = 100;
	spotLight.castShadow = true;
	spotLight.intensity = 3;
	scene.add(spotLight);
}

window.onload = init;
