var renderer;
var scene;
var camera;
var controls;
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
	// controls();
	setupRenderer();
	addSpotLight();
	
	//<!-- 5. Ground plane -->
	createGroundPlane();
	
	//<!-- 7. Create and add cannon -->
	createCannon();
	
	//<!-- 11. Create ball -->
	createBall();
	
	//<!-- 14. Create targets -->
	createTarget();
	extraTarget2();
	extraTarget3();
	extraTarget4();

	gameName();

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
	var cylinderGeometry = new THREE.CylinderGeometry( 5, 2, 10 );
	var cylinderMaterial = new THREE.MeshLambertMaterial({color:'gold'});
	var can = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
	can.position.y = -5;

	//<!-- 8. Create Object3D wrapper that will allow use to correctly rotate -->
	cannon = new THREE.Object3D();
	cannon.add( can );
	
	cannon.rotation.z = Math.PI / 2;
	cannon.position.x -= 84;
	cannon.position.z += 20;
	cannon.name = "CannonBall";
	scene.add( cannon );


	// Right leg cannon
	var wheelsGeometry = new THREE.CylinderGeometry(5, 5, 5);
	var wheelsMaterial = new THREE.MeshLambertMaterial({ color: 'gold' });
	var can2 = new THREE.Mesh(wheelsGeometry, wheelsMaterial);
	can2.position.y = 5;
	can2.position.x = -90;

	cannon2 = new THREE.Object3D();
	cannon2.add(can2);
	scene.add(cannon2);

	// Left leg cannon
	var wheelsGeometry2 = new THREE.CylinderGeometry(5, 5, 5);
	var wheelsMaterial2 = new THREE.MeshLambertMaterial({ color: 'gold' });
	var can3 = new THREE.Mesh(wheelsGeometry2, wheelsMaterial2);
	can3.position.y = 15;
	can3.position.x = -90;

	cannon3 = new THREE.Object3D();
	cannon3.add(can3);
	scene.add(cannon3);

	// Back of cannon
	var backGeometry = new THREE.BoxGeometry(5, 15, 5);
	var backMaterial = new THREE.MeshBasicMaterial({ color: 'gold' });
	//var backMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 'red' }), .95, .95);
	var backMesh = new THREE.Mesh(backGeometry, backMaterial);
	backMesh.position.y = 15;
	backMesh.position.x = -100;
	scene.add(backMesh);
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
		moveCannon.play();
	}
	if( Key.isDown(Key.S))
	{
		cannon.rotation.y += 0.01;
		if( cannon.rotation.y > 0 )
		{
			cannon.rotation.y = 0;
		}
		moveCannon.play();
	}
}

//<!-- 10. Maintain cannon right/left -->
function maintainCannonRightLeft()
{
	if( Key.isDown(Key.A))
	{
		cannon.rotation.z += 0.01;
		moveCannon.play();
	}
	if( Key.isDown(Key.D))
	{
		cannon.rotation.z -= 0.01;
		moveCannon.play();
	}
}

//<!-- 12. Look for ball keypresses -->
var ballLaunched = false;
function maintainBallKeypresses()
{
	if( !ballLaunched && Key.isDown(Key.J) )
	{
		createBall();
		ballLaunched = true;
		scene.add( ball );
		cannonShot.play();
		ball.applyCentralImpulse( new THREE.Vector3( 8000, -( Math.PI / 2 - cannon.rotation.z ) * 4000, -cannon.rotation.y * 10000 ) );
	}
	if( ballLaunched && Key.isDown(Key.R) )
	{
		ballLaunched = false;
		reload.play();
		scene.remove( ball );
	}
}

//<!-- 11. Create ball -->
function createBall()
{
	var texture = THREE.ImageUtils.loadTexture('images/metal4.jpg');

	var ballGeometry = new THREE.SphereGeometry( 3 );
	//var ballMaterial = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'white'}), .95, .95 );
	var ballMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: texture }), .95, .95);
	ball = new Physijs.SphereMesh( ballGeometry, ballMaterial );
	
	ball.position.x = cannon.position.x + Math.cos((Math.PI/2)-cannon.rotation.z) * 10;
	ball.position.y = cannon.position.y - Math.cos(cannon.rotation.z) * 10;
	ball.position.z = cannon.position.z - Math.sin(cannon.rotation.y) * 10;
	
	ball.name = 'CannonBall';
	
	ball.collisions = 0;
	ball.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity )
	{
		// if (other_object.name == 'groundPlane' && Math.abs(linear_velocity.x) >= 2.5) 
		// {
		// 	ball.removeEventListener('collision', false);
		// 	crash.play();
		// }
		if( other_object.name != "GroundPlane" )
		{
			// crash.play();
		}		
	});
}

//<!-- 14. Create target -->
var targetlist;
function createTarget()
{
	targetlist = [];
	
	for (var i=0; i<4; i++)
	{
		var geo = new THREE.BoxGeometry( 4, 4, 12 );
		var mat = Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
		var msh = new Physijs.BoxMesh( geo, mat );
		switch( i )
		{
			case 0: msh.position.x = 80; break;
			case 1: msh.position.x = 85; msh.position.y = 5; break;
			case 2: msh.position.x = 90; break;
			case 3: msh.position.x = 85; msh.position.y = -5; break;
		}
		msh.position.z = 6;
		targetlist.push( msh );
		scene.add( msh );
	}
	
	var texture = THREE.ImageUtils.loadTexture('images/mars2.jpg');

	var sg = new THREE.SphereGeometry( 5 );
	//var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
	var sm = new Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: texture }), .95, .95);
	smsh = new Physijs.SphereMesh( sg, sm );
	smsh.position.x = 85;
	smsh.position.y = 0;
	smsh.position.z = 16;
	smsh.name = "TargetBall";
	
	scene.add( smsh );
}

function extraTarget2()
{
	targetlist = [];

	for (var i = 0; i < 4; i++) {
		var geo = new THREE.BoxGeometry(4, 4, 12);
		var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: '#FF4500' }), .95, .95);
		var msh = new Physijs.BoxMesh(geo, mat);
		switch (i) {
			case 0: msh.position.x = 60; msh.position.y = -40; break;
			case 1: msh.position.x = 65; msh.position.y = -45; break;
			case 2: msh.position.x = 70; msh.position.y = -40; break;
			case 3: msh.position.x = 65; msh.position.y = -35; break;
		}
		msh.position.z = 6;
		targetlist.push(msh);
		scene.add(msh);
	}

	var texture = THREE.ImageUtils.loadTexture('images/venus2.jpg');

	var sg = new THREE.SphereGeometry( 5 );
	//var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
	var sm = new Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: texture }), .95, .95);
	smsh = new Physijs.SphereMesh( sg, sm );
	smsh.position.x = 65;
	smsh.position.y = -40;
	smsh.position.z = 16;
	smsh.name = "TargetBall";
	
	scene.add( smsh );
}

function extraTarget3() 
{
	targetlist = [];

	for (var i = 0; i < 4; i++) {
		var geo = new THREE.BoxGeometry(4, 4, 12);
		var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: '#b37400' }), .95, .95);
		var msh = new Physijs.BoxMesh(geo, mat);
		switch (i) {
			case 0: msh.position.x = 35; msh.position.y = 25; break;
			case 1: msh.position.x = 40; msh.position.y = 30; break;
			case 2: msh.position.x = 45; msh.position.y = 25; break;
			case 3: msh.position.x = 40; msh.position.y = 20; break;
		}
		msh.position.z = 6;
		targetlist.push(msh);
		scene.add(msh);
	}

	var texture = THREE.ImageUtils.loadTexture('images/jupiter2.jpg');

	var sg = new THREE.SphereGeometry(5);
	//var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
	var sm = new Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: texture }), .95, .95);
	smsh = new Physijs.SphereMesh(sg, sm);
	smsh.position.x = 40;
	smsh.position.y = 25;
	smsh.position.z = 16;
	smsh.name = "TargetBall";

	scene.add(smsh);
}

function extraTarget4() 
{
	targetlist = [];

	for (var i = 0; i < 4; i++) {
		var geo = new THREE.BoxGeometry(4, 4, 12);
		var mat = Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: 'blue' }), .95, .95);
		var msh = new Physijs.BoxMesh(geo, mat);
		switch (i) {
			case 0: msh.position.x = 30; msh.position.y = -20; break;
			case 1: msh.position.x = 35; msh.position.y = -25; break;
			case 2: msh.position.x = 40; msh.position.y = -20; break;
			case 3: msh.position.x = 35; msh.position.y = -15; break;
		}
		msh.position.z = 6;
		targetlist.push(msh);
		scene.add(msh);
	}

	var texture = THREE.ImageUtils.loadTexture('images/earth2.jpg');

	var sg = new THREE.SphereGeometry(5);
	//var sm = new Physijs.createMaterial( new THREE.MeshLambertMaterial({color:'red'}), .95, .95 );
	var sm = new Physijs.createMaterial(new THREE.MeshLambertMaterial({ map: texture }), .95, .95);
	smsh = new Physijs.SphereMesh(sg, sm);
	smsh.position.x = 35;
	smsh.position.y = -20;
	smsh.position.z = 16;
	smsh.name = "TargetBall";

	scene.add(smsh);
}

//<!-- 15. Check for ball off the plane -->
function checkBallPosition()
{
	if( smsh.position.y > 5 )
	{
		scene( smsh );
	}
}

function setupCamera()
{
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.x = 1;
	camera.position.y = -100;
	camera.position.z = 150;
	camera.lookAt( scene.position );
}

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

function gameName() 
{
	var scoreColor = new THREE.MeshLambertMaterial({ color: "white" });

	var textGeometry2 = new THREE.TextGeometry("Cannon Planets",
		{
			size: 20,
			height: 6,
			curveSegments: 12,
			bevelEnabled: false,
			bevelThickness: 10,
			bevelSize: 8,
			bevelSegments: 5
		}
	);

	playerScoreShow = new THREE.Mesh(textGeometry2, scoreColor);
	playerScoreShow.position.x = -100;
	playerScoreShow.position.y = 60;
	playerScoreShow.position.z = 1.8;
	scene.add(playerScoreShow);
}

var playerScoreMain;
function scoreUpdate() {
	var scoreColor = new THREE.MeshBasicMaterial({ color: 0xb02179 });

	// Update player's score count
	var textGeometry2 = new THREE.TextGeometry(playerScore,
		{
			size: 5,
			height: 0.2,
			curveSegments: 10,
			bevelEnabled: false
		}
	);

	playerScoreMain = new THREE.Mesh(textGeometry2, scoreColor);
	playerScoreMain.position.x = 40;
	playerScoreMain.position.y = 1;
	playerScoreMain.position.z = 1.8;
	scene.add(playerScoreMain);
}

var cannonShot, moveCannon, reload, hitTarget;
function loadSounds() {
	// Background music
	// var audio = new Audio("sounds/condition_omega.mp3");
	// audio.loop = true;
	// audio.play();

	// Foley
	cannonShot = new Audio("sounds/cannon1.wav");
	moveCannon = new Audio("sounds/cannonMove.wav");
	reload = new Audio("sounds/reload.wav");
	hitTarget = new Audio("sounds/crash.wav");
}

window.onload = init;
