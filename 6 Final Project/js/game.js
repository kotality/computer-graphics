var camera, scene, renderer, light, sun;
var planeOne, planeTwo;
var mouse = { x: 0, y: 0 };
var ground, movingGround, player, movingPlayer, playerHelper, earthPivot;
// movingGround = rollingGroundSphere | player = hero | movingPlayer = heroRollingSphere
// playerHelper = sphericalHelper
var rollingSpeed = 0.008;
var worldRadius = 26, playerRadius = 0.2; // heroRadius
var pathAngleValues;
var playerBaseY = 1.8; // heroBaseY
var bounceValue = 0.1;
var clock, gravity = 0.4, jumping = false;

var scoreText, score, hasCollided;
// var orbitControl;

// Physijs.scripts.worker = 'libs/physijs_worker.js';
// Physijs.scripts.ammo = 'libs/ammo.js';

init();

function init() 
{
    initialize();
    scene();
    camera();
    renderer();
    spotlight();

    var axisHelper = new THREE.AxisHelper(200);
    scene.add(axisHelper);

    // Objects
    backgroundImage();
    world();
    player();
    planeOne();
    planeTwo();
    // scorePosition();
    
    loadSounds();

    animate();
}

function initialize()
{
    hasCollided = false;
    score = 0;

    clock = new THREE.Clock();
    clock.start();

    movingPlayer = (rollingSpeed * worldRadius / playerRadius) / 5;
    playerHelper = new THREE.Spherical();
    pathAngleValues = [1.52, 1.57, 1.62];
}

function scene() 
{
    scene = new THREE.Scene();
    // scene = new Physijs.Scene;
    scene.fog = new THREE.FogExp2(0xffffff, 0.09);
    scene.background = new THREE.Color('black');
}

function camera() 
{
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 11;
    camera.position.y = 2.5;
}

function renderer() 
{
    renderer = new THREE.WebGLRenderer({alpha:true});

    // renderer.setClearColor('lightblue', 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    renderer.shadowMap.enbled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
    // document.onkeydown = handleKeyDown;
}

function spotlight() 
{
    light = new THREE.HemisphereLight(0xfffafa, 0x000000, .9)
    scene.add(light);

    sun = new THREE.DirectionalLight(0xffffff, 0.9);
    sun.position.set(5, 10, 20);
    sun.castShadow = true;
    scene.add(sun);

    // sun.shadow.mapSize.width = 1024;
    // sun.shadow.mapSize.height = 1024;

    // sun.shadow.camera.near = 50;
    // sun.shadow.camera.far = 100;
    // sun.shadow.camera.fov = 300;

    // var helper = new THREE.CameraHelper(sun.shadow.camera);
    // scene.add(helper);

    // var spotLightHelper = new THREE.SpotLightHelper(sun);
    // scene.add(spotLightHelper);

    // var helper = new THREE.DirectionalLightHelper(sun, 50);
    // scene.add(helper);
}

function animate() 
{
    requestAnimationFrame(animate);

    player.rotateX(-movingPlayer);
    // player.rotation.y += 0.01; // player.rotation.z += 0.007;
    movingGround.rotateX(0.005);
    // earthPivot.rotateY(0.05); // earthPivot.rotateX(0.01);

    if (player.position.y <= playerBaseY) // <= 1.8
    {
        jumping = false;
        bounceValue = (Math.random() * 0.025) + 0.001;
    }
    player.position.y += bounceValue;
    player.position.x = THREE.Math.lerp(player.position.x, 0, 2 * clock.getDelta());//clock.getElapsedTime());
    bounceValue -= gravity;

    // while (planeTwo.position.x <= 25)
    // {        
    //     if (planeTwo.position.x == -25)
    //         planeOne.position.x -= 0.5;
    //     else
    //         planeTwo.position.x -= 0.5;
    // }
    
    
    // playerMovement();

    controls();
        
    renderer.render(scene, camera);
}

// ========================================================================== // 
//                                  Controls                                  //
// ========================================================================== //
function controls()
{
    // Look up and down
    if (Key.isDown(Key.W)) 
    {
        camera.position.y += 0.2;
    }
    if (Key.isDown(Key.S)) 
    {
        camera.position.y -= 0.2;
    }

    // Look left and right
    if (Key.isDown(Key.A)) 
    {
        camera.position.x -= 0.2;
    }
    if (Key.isDown(Key.D)) 
    {
        camera.position.x += 0.2;
    }

    // Move left and right
    if (Key.isDown(Key.LEFTARROW)) 
    {
        if (player.position.x >= -1.5)
        { player.position.x -= 0.06; }        
    }
    if (Key.isDown(Key.RIGHTARROW)) 
    {
        if (player.position.x <= 1.5) 
        { player.position.x += 0.06; }   
    }

    // Look into and out of
    if (Key.isDown(Key.O))
    {
        camera.position.z += 0.2;
    }
    if (Key.isDown(Key.P))
    {
        camera.position.z -= 0.2;
    }

    // Jump
    if (!jumping && Key.isDown(Key.SPACE))
    {
        player.velocity += 0.02;
        player.position.y += 0.62;         
        jumping = true;
    }
    if (jumping && !Key.isDown(Key.SPACE))
    {
        player.position.y -= 0.62;
        player.velocity -= 0.02;
        jumping = false;
    }

    // Orbit controls
    // orbitControl = new THREE.OrbitControls(camera, renderer.domElement);//helper to rotate around in scene
    // orbitControl.addEventListener('change', render);
    //orbitControl.enableDamping = true;
    //orbitControl.dampingFactor = 0.8;
    // orbitControl.enableZoom = false;
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========================================================================== // 
//                                  Objects                                   //
// ========================================================================== //
function player() 
{
    var texture = new THREE.TextureLoader().load("images/feathers.jpg");
    
    var geometry = new THREE.DodecahedronGeometry(playerRadius, 1);
    var material = new THREE.MeshStandardMaterial({ flatShading: true, map: texture });	
    player = new THREE.Mesh(geometry, material);
 
    player.position.y = 1.5;
    player.position.z = 8.5; 
    player.velocity = 0;

    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);
}

function backgroundImage()
{
    var texture = new THREE.TextureLoader().load("images/sky.png");

    var geometry = new THREE.PlaneBufferGeometry(50, 22, 4, 4); // width, height, widthSegments, heightSegments
    var material = new THREE.MeshStandardMaterial({ map: texture });
    
    background = new THREE.Mesh(geometry, material);

    background.position.y = 2;
    background.rotateX(-.4);

    scene.add(background);
}

function world()
{
    var texture = new THREE.TextureLoader().load("images/grassTexture5.jpg");

    var tiers = 40, sides = 40;
    var current = 1, lerpValue = 0.5, height, maxHeight = 0.6;

    var geometry = new THREE.SphereGeometry(10, tiers, sides);
    var material = new THREE.MeshStandardMaterial({ map: texture,  color: 0xfffafa, flatShading: true});

    var vertexIndex;
    var vVector = new THREE.Vector3();
    var nextVVector = new THREE.Vector3();
    var firstVVector = new THREE.Vector3();
    var offset = new THREE.Vector3();

    for (var i = 2; i < tiers - 2; i++)
    {
        current = i;

        for (var j = 0; j < sides; j++)
        {
            vertexIndex = (current * sides) + 1;
            vVector = geometry.vertices[j + vertexIndex].clone();

            if (i % 2 != 0)
            {
                if (j == 0)
                {
                    firstVVector = vVector.clone();
                }
                nextVVector = geometry.vertices[j + vertexIndex + 1].clone();

                if (j == sides - 1)
                {
                    nextVVector = firstVVector;
                }

                lerpValue = (Math.random() * (0.50)) + 0.25;
                vVector.lerp(nextVVector, lerpValue);
            }

            height = (Math.random() * maxHeight) - (maxHeight/2);
            offset = vVector.clone().normalize().multiplyScalar(height);
            geometry.vertices[j + vertexIndex] = vVector.add(offset);
        }
    }

    movingGround = new THREE.Mesh(geometry, material);
    movingGround.receiveShadow = true;
    movingGround.castShadow = false;

    scene.add(movingGround);

    movingGround.position.y = -7;
    movingGround.position.z = 2.5;

    // earthPivot = new THREE.Object3D();
    // movingGround.add(earthPivot);

    // var one = new THREE.Mesh(geometry, material);
    // one.scale.set(0.06, 0.06, 0.06);
    // one.position.x = 10;
    // earthPivot.add(one);

    // var two = new THREE.Mesh(geometry, material);
    // two.scale.set(0.04, 0.04, 0.04);
    // two.position.x = -10;
    // earthPivot.add(two);

    // var three = new THREE.Mesh(geometry, material);
    // three.scale.set(0.04, 0.04, 0.04);
    // three.position.y = 10;
    // earthPivot.add(three);

    // var four = new THREE.Mesh(geometry, material);
    // four.scale.set(0.04, 0.04, 0.04);
    // four.position.y = -10;
    // earthPivot.add(four);

    // var five = new THREE.Mesh(geometry, material);
    // five.scale.set(0.04, 0.04, 0.04);
    // five.position.z = 10;
    // earthPivot.add(five);

    // var six = new THREE.Mesh(geometry, material);
    // six.scale.set(0.04, 0.04, 0.04);
    // six.position.z = 10;
    // earthPivot.add(six);

}

function planeOne() // Rightside
{
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("models/plane/toy-plane.json", function (planeOne) {
        // player.castShadow = true;
        // player.receiveShadow = true;
        planeOne.scale.set(.55,.55,.55);
        planeOne.position.y = 4.3;
        planeOne.position.x = -11.2;
        // planeOne.rotateZ(3);
        planeOne.rotateY(4.5);        
        scene.add(planeOne);

        // while (planeOne.position.x >= -26 && planeOne.position.x <=26)
        // {        
        //     if (planeOne.position.x == 25)
        //         planeOne.position.x -= 0.5;
        //     else
        //         planeOne.position.x += 0.5;
        // }
    });
}

function planeTwo() // Leftside
{
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("models/plane/toy-plane.json", function (planeTwo) {
        // player.castShadow = true;
        // player.receiveShadow = true;
        planeTwo.scale.set(.55,.55,.55);
        planeTwo.position.y = 7.3;
        planeTwo.position.x = 10.2;
        planeTwo.rotateY(-4.5);
        scene.add(planeTwo);
    });
}

// ========================================================================== // 
//                                  Sounds                                    //
// ========================================================================== //
var steps, pickUpItem, dropItem, bird1, bird2, bird3, bigBird, bossRoar, one, two, three;
function loadSounds() {
    // Background music
    var audio = new Audio("sounds/NaruEmbracingTheLight.mp3");
    audio.loop = true;
    audio.play();

    // Foley

    // bird1 = new Audio("");
    // bird2 = new Audio("");
    // bird3 = new Audio("");
    // bigBird = new Audio("");
    // jump = new Audio("");

    // one = new Audio("");
    // two = new Audio("");
    // three = new Audio("");
}