var camera, scene, renderer, light, sun;
var planeOne, planeOne1, planeTwo, planeTwo2, planeReachEndFlag = false;
var mouse = { x: 0, y: 0 };
var ground, movingGround, player, movingPlayer, playerHelper, earthPivot;
var rollingSpeed = 0.008;
var worldRadius = 26, playerRadius = 0.2; // heroRadius
var pathAngleValues;
var playerBaseY = 1.8; // heroBaseY
var bounceValue = 0.1;
var clock, gravity = 0.4, jumping = false;

// var scoreText, score, hasCollided;

init();

function init() 
{
    initialize();
    scene();
    camera();
    renderer();
    spotlight();

    // var axisHelper = new THREE.AxisHelper(200);
    // scene.add(axisHelper);

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
    scene.fog = new THREE.FogExp2(0xffffff, 0.1);
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
    movingGround.rotateX(0.007);

    // earthPivot.rotateY(0.05); // earthPivot.rotateX(0.01);

    if (player.position.y <= playerBaseY) // <= 1.8
    {
        jumping = false;
        bounceValue = (Math.random() * 0.025) + 0.001;
    }
    player.position.y += bounceValue;
    player.position.x = THREE.Math.lerp(player.position.x, 0, 2 * clock.getDelta());//clock.getElapsedTime());
    bounceValue -= gravity;

    // Going right
    if (planeOne.position.x <= 25)
    {
        planeOne.position.x += 0.09;
    }   
    if (planeOne.position.x == 25)
    {
        planeReachEndFlag = true;
        scene.remove(planeOne);
        getNewPlaneOne();
    }

    // Goind left
    if (planeTwo.position.x >= -25)
    {
        planeTwo.position.x -= 0.09;
    }  
    if (planeTwo.position.x == -25)
    {
        planeReachEndFlag = true;
        scene.remove(planeTwo);
        getNewPlaneTwo();
    }

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
    var texture = new THREE.TextureLoader().load("images/mountain.png");
    var texture2 = new THREE.TextureLoader().load("images/grassTexture5.jpg");

    var tiers = 40, sides = 40;
    var current = 1, lerpValue = 0.5, height, maxHeight = 1;

    var geometry = new THREE.SphereGeometry(10, tiers, sides);
    var material2 = new THREE.MeshStandardMaterial({ map: texture2,  color: 0xfffafa, flatShading: true});

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

    movingGround = new THREE.Mesh(geometry, material2);
    movingGround.receiveShadow = true;
    movingGround.castShadow = false;

    scene.add(movingGround);

    movingGround.position.y = -7;
    movingGround.position.z = 2.5;

    //=========================================
    earthPivot = new THREE.Object3D();
    movingGround.add(earthPivot);

    var coneGeometry = new THREE.ConeGeometry(1, 3, 32, 32);
    var material = new THREE.MeshStandardMaterial({ map: texture, color: 0xfffafa, flatShading: true });
    var one = new THREE.Mesh(coneGeometry, material);
    var two = new THREE.Mesh(coneGeometry, material);
    var three = new THREE.Mesh(coneGeometry, material);
    var four = new THREE.Mesh(coneGeometry, material);
    var five = new THREE.Mesh(coneGeometry, material);

    var six = new THREE.Mesh(coneGeometry, material);
    var seven = new THREE.Mesh(coneGeometry, material);
    var eight = new THREE.Mesh(coneGeometry, material);
    var nine = new THREE.Mesh(coneGeometry, material);
    var ten = new THREE.Mesh(coneGeometry, material);

    var one1 = new THREE.Mesh(coneGeometry, material);
    var two1 = new THREE.Mesh(coneGeometry, material);
    var three1 = new THREE.Mesh(coneGeometry, material);
    var four1 = new THREE.Mesh(coneGeometry, material);
    var five1 = new THREE.Mesh(coneGeometry, material);

    var six1 = new THREE.Mesh(coneGeometry, material);
    var seven1 = new THREE.Mesh(coneGeometry, material);
    var eight1 = new THREE.Mesh(coneGeometry, material);
    var nine1 = new THREE.Mesh(coneGeometry, material);
    var ten1 = new THREE.Mesh(coneGeometry, material);

    var one2 = new THREE.Mesh(coneGeometry, material);
    var two2 = new THREE.Mesh(coneGeometry, material);
    var three2 = new THREE.Mesh(coneGeometry, material);
    var four2 = new THREE.Mesh(coneGeometry, material);
    var five2 = new THREE.Mesh(coneGeometry, material);

    var six2 = new THREE.Mesh(coneGeometry, material);
    var seven2 = new THREE.Mesh(coneGeometry, material);
    var eight2 = new THREE.Mesh(coneGeometry, material);
    var nine2 = new THREE.Mesh(coneGeometry, material);
    var ten2 = new THREE.Mesh(coneGeometry, material);
    
    // var m = 0.0, n = 0.0;

    one.position.set(2, 10, 0);
    two.position.set(-1.8, 10, 0);
    three.position.set(2.7, 10, 4);
    four.position.set(-1.9, 10, 4);
    five.position.set(1.6, 10, -4);
    six.position.set(-1.7, 10, -4);
    seven.position.set(-1.7, 9, 6);
    eight.position.set(-1.7, 9, 6);
    nine.position.set(-1.7, 9, -6);
    ten.position.set(-1.7, 9, -6);

    one1.position.set(2, 10, 0);
    two1.position.set(-1.8, 10, 0);
    three1.position.set(2.7, 10, 4);
    four1.position.set(-1.9, 10, 4);
    five1.position.set(1.6, 10, -4);
    six1.position.set(-1.7, 10, -4);
    seven1.position.set(-1.7, 10, 6);
    eight1.position.set(-1.7, 10, 6);
    nine1.position.set(-1.7, 10, -6);
    ten1.position.set(-1.7, 10, -6);

    one2.rotateY(-9);
    two2.rotateY(-9);
    three2.rotateY(-9);
    four2.rotateY(-9);
    five2.rotateY(-9);
    six2.rotateY(-9);
    seven2.rotateZ(-9);
    eight2.rotateZ(-9);
    nine2.rotateZ(-9);
    ten2.rotateZ(-9);
    one2.position.set(2, -9, 0);
    two2.position.set(-1.8, -9, 0);
    three2.position.set(2.7, -9, 4);
    four2.position.set(-1.9, -9, 4);
    five2.position.set(1.6, -9, -4);
    six2.position.set(-1.7, -9, -4);
    seven2.position.set(-1.7, -9, 6);
    eight2.position.set(-1.7, -9, 6);
    nine2.position.set(-1.7, -9, -6);
    ten2.position.set(-1.7, -9, -6);

    earthPivot.add(one);
    earthPivot.add(two);
    earthPivot.add(three);
    earthPivot.add(four);
    earthPivot.add(five);
    earthPivot.add(six);
    earthPivot.add(seven);
    earthPivot.add(eight);
    earthPivot.add(nine);
    earthPivot.add(ten);

    earthPivot.add(one1);
    earthPivot.add(two1);
    earthPivot.add(three1);
    earthPivot.add(four1);
    earthPivot.add(five1);
    earthPivot.add(six1);
    earthPivot.add(seven1);
    earthPivot.add(eight1);
    earthPivot.add(nine1);
    earthPivot.add(ten1);

    earthPivot.add(one2);
    earthPivot.add(two2);
    earthPivot.add(three2);
    earthPivot.add(four2);
    earthPivot.add(five2);
    earthPivot.add(six2);
    earthPivot.add(seven2);
    earthPivot.add(eight2);
    earthPivot.add(nine2);
    earthPivot.add(ten2);

    // var prev = 4, flag = 1;
    // for (var k = 0; k < tiers; k++)
    // {
    //     addMountains(material, earthPivot, prev);
 
    //     prev = randomIntFromInterval(0, 4);
    
    // }
    
}

function addMountains(material, earthPivot, prev)
{
    var coneGeometry = new THREE.ConeGeometry(1, 3.2, 32, 32);
    var one = new THREE.Mesh(coneGeometry, material);
    var two = new THREE.Mesh(coneGeometry, material);
    
    var val1 = randomIntFromInterval(2.5,4);
    // var val3 = randomIntFromInterval(1, 4);

    one.position.set(val1, 10, prev);
    two.position.set(-val1, 10, -prev);

    earthPivot.add(one);
    earthPivot.add(two);
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function planeOne() // Rightside
{
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("models/plane/toy-plane.json", function (myPlaneOne) {
        // player.castShadow = true;
        // player.receiveShadow = true;
        myPlaneOne.scale.set(.55,.55,.55);
        myPlaneOne.position.y = 4.3;
        myPlaneOne.position.x = -11.2;
        myPlaneOne.rotateY(4.5);
        planeOne = myPlaneOne;        
        scene.add(planeOne);   
        planeReachEndFlag = false;
    });   
}

function getNewPlaneOne() // Rightside
{
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("models/plane/toy-plane.json", function (myPlaneOne) {
        // player.castShadow = true;
        // player.receiveShadow = true;
        myPlaneOne.scale.set(.55, .55, .55);
        myPlaneOne.position.y = 4.3;
        myPlaneOne.position.x = -11.2;
        myPlaneOne.rotateY(4.5);
        planeOne1 = myPlaneOne;
        scene.add(planeOne1);
        planeReachEndFlag = false;
    });
}

function planeTwo() // Leftside
{
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("models/plane/toy-plane.json", function (myPlaneTwo) {
        // player.castShadow = true;
        // player.receiveShadow = true;
        myPlaneTwo.scale.set(.55,.55,.55);
        myPlaneTwo.position.y = 7.3;
        myPlaneTwo.position.x = 10.2;
        myPlaneTwo.rotateY(-4.5);
        planeTwo = myPlaneTwo;
        scene.add(planeTwo);
        planeReachEndFlag = false;
    });
}

function getNewPlaneTwo() // Leftside
{
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("models/plane/toy-plane.json", function (myPlaneTwo) {
        // player.castShadow = true;
        // player.receiveShadow = true;
        myPlaneTwo.scale.set(.55, .55, .55);
        myPlaneTwo.position.y = 7.3;
        myPlaneTwo.position.x = 10.2;
        myPlaneTwo.rotateY(-4.5);
        planeTwo2 = myPlaneTwo;
        scene.add(planeTwo2);
        planeReachEndFlag = false;
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