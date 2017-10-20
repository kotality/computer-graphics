	var renderer;
	var scene;
	var camera;

	function init()
	{
		scene = new THREE.Scene();
		
		setupCamera();
		setupRenderer();
		addSpotLight();
		
		// Output to the stream
		document.body.appendChild( renderer.domElement );
		
		// Call render
		render();
	}
	
	function render()
	{
		
		// Request animation frame
		requestAnimationFrame( render );
		
		// Call render()
		renderer.render( scene, camera );
	}
	
	function addSpotLight()
	{
        spotLight = new THREE.SpotLight( 0xffffff, 1 );
        spotLight.position.set( 0, 300, 0 );
        spotLight.shadowCameraNear = 1;
        spotLight.shadowCameraFar = 50;
        spotLight.castShadow = true;
        scene.add(spotLight);
	}
	
	window.onload = init;
	
	function setupCamera()
	{
		camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);
		camera.position.x = 0;
		camera.position.y = 200;
		camera.position.z = -250;
		camera.lookAt(new THREE.Vector3(0,0,0));
	}
	
	function setupRenderer()
	{
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.shadowMapEnabled = true;
	}
	

	