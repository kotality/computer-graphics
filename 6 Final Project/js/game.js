var camera, scene, renderer, light;
var dom, mouse = { x: 0, y: 0 };
var ground, movingGround, player, movingPlayer, playerHelper;
// movingGround = rollingGroundSphere
// player = hero
// movingPlayer = heroRollingSphere
// playerHelper = sphericalHelper
var rollingSpeed = 0.008;
var worldRadius = 26, playerRadius = 0.2; // heroRadius
var pathAngleValues;
// var playerBaseY = 1.8; // heroBaseY
var bounceValue = 0.1;
var gravity = 0.005;
var leftLane = -1, rightLane = 1, middleLane = 0, currentLane;
var clock;
var jumping;
var treeReleaseInterval = 0.5, lastTreeReleaseTime = 0;
var treesInPath, treesPool, maxTrees = 10;
var particles, particleGeometry, pMaterial, particleCount = 20;
var explosionPower = 1.06;
//var stats;
var scoreText, score, hasCollided;
// var orbitControl;

init();

function init() 
{
    initialize();
    scene();
    camera();
    renderer();
    spotlight();

    // Objects
    player();
    // treesPool();
    world();
    // scorePosition();
    explosion();
    // ground();
    
    loadSounds();

    animate();
}

function initialize()
{
    hasCollided = false;
    score = 0;
    treesInPath = [];

    clock = new THREE.Clock();
    clock.start();

    movingPlayer = (rollingSpeed * worldRadius / playerRadius) / 5;
    playerHelper = new THREE.Spherical();
    pathAngleValues = [1.52, 1.57, 1.62];
}

function scene() 
{    
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf0fff0, 0.14);
    // scene.background = new THREE.Color(0x003300);
}

function camera() 
{
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10.5;
    camera.position.y = 2.5;
    // camera.lookAt(scene.position);
    // camera.position.set(0,45,0);
}

function renderer() 
{
    renderer = new THREE.WebGLRenderer({alpha:true});

    renderer.setClearColor('lightblue', 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    renderer.shadowMap.enbled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);

    // dom = document.getElementById('TutContainer');
    // dom.appendChild(renderer.domElement);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    // document.onkeydown = handleKeyDown;
}

function spotlight() 
{
    // light = new THREE.HemisphereLight(0xfffafa, 0x000000, .9)
    // scene.add(hemisphereLight);
    // sun = new THREE.DirectionalLight(0xcdc1c5, 0.9);
    // sun.position.set(12, 6, -7);
    // sun.castShadow = true;
    // scene.add(sun);

    // scene.add(new THREE.AmbientLight(0x505050));

    light = new THREE.SpotLight(0xffffff, 1.3, 187, 0.85, 0.135, 1.7);
    light.position.set(0, 15, 2);

    light.castShadow = true;

    light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 200, 10000));
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    light.shadow.camera.near = 500;
    light.shadow.camera.far = 900;
    light.shadow.camera.fov = 30;

    // var helper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(helper);

    var spotLightHelper = new THREE.SpotLightHelper(light);
    scene.add(spotLightHelper);

    scene.add(light);

    // sun = new THREE.DirectionalLight(0xffffff, 0.8);
    // sun.position.set(0, 4, 1);
    // sun.castShadow = true;
    // scene.add(sun);

    // //Set up shadow properties for the sun light
    // sun.shadow.mapSize.width = 256;
    // sun.shadow.mapSize.height = 256;
    // sun.shadow.camera.near = 0.5;
    // sun.shadow.camera.far = 50;

    //Create a helper for the shadow camera (optional)
    
    // var helper = new THREE.CameraHelper(spotLight.shadow.camera);
    // scene.add(helper);
}

function animate() 
{
    requestAnimationFrame(animate);

    player.rotation.x += 0.007;
    player.rotation.y += 0.01;
    player.rotation.z += 0.007;
    // cameraControl();
    controls();
        
    renderer.render(scene, camera);
}

// ========================================================================== // 
//                                  Controls                                  //
// ========================================================================== //
function controls()
{
    // Up and down
    if (Key.isDown(Key.W)) 
    {
        camera.position.y -= 0.2;
    }
    if (Key.isDown(Key.S)) 
    {
        camera.position.y += 0.2;
    }

    // Left and right
    if (Key.isDown(Key.A)) 
    {
        camera.position.x -= 0.2;
    }
    if (Key.isDown(Key.D)) 
    {
        camera.position.x += 0.2;
    }

    // Into and out of
    if (Key.isDown(Key.O))
    {
        camera.position.z += 0.2;
    }
    if (Key.isDown(Key.P))
    {
        camera.position.z -= 0.2;
    }

    // Orbit controls
    orbitControl = new THREE.OrbitControls(camera, renderer.domElement);//helper to rotate around in scene
    // orbitControl.addEventListener('change', render);
    //orbitControl.enableDamping = true;
    //orbitControl.dampingFactor = 0.8;
    orbitControl.enableZoom = false;
}

function cameraControl() 
{
    document.addEventListener('mousemove', function (event) {
        mouse.x = (event.clientX / window.innerWidth) - 0.5;
        mouse.y = (event.clientY / window.innerHeight) - 0.5;
    }, false)
    onRenderFcts.push(function (delta, now) {
        camera.position.x += (mouse.x * 5 - camera.position.x) * (delta * 3);
        camera.position.y += (mouse.y * 5 - camera.position.y) * (delta * 3);
        camera.lookAt(scene.position);
    })
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
    var material = new THREE.MeshStandardMaterial({ shading: THREE.FlatShading, map: texture});
    
    jumping = false;
    
    player = new THREE.Mesh(geometry, material);

    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);

    player.position.y = 1.8;
    player.position.z = 8.8;   

    currentLane = middleLane;
    player.position.x = currentLane;
}

function ground()
{
    var geometry = new THREE.PlaneBufferGeometry(5, 5, 4, 4);
    var material = new THREE.MeshStandardMaterial({ color: 0x00ff00});//{map: THREE.TextureLoader('images/grassTexture.jpg')});//color: 0x00ff00 });//map: THREE.ImageUtils.loadTexture('images/grassTexture.jpg') });
    ground = new THREE.Mesh(geometry, material);

    ground.receiveShadow = true;
    ground.castShadow = false;
    ground.rotateX(-Math.PI/2);

    scene.add(ground);
}

function world()
{
    var tiers = 40, sides = 40;
    var current = 1, lerpValue = 0.5, height, maxHeight = 0.7;

    var geometry = new THREE.SphereGeometry(worldRadius, 40, 40);
    var material = new THREE.MeshStandardMaterial({ color: 0xfffafa, shading: THREE.FlatShading});

    var vertexIndex;
    var vVector = new THREE.Vector3();
    var nextVVector = new THREE.Vector3();
    var firstVVector = new THREE.Vector3();
    var offset = new THREE.Vector3();

    for (var i = 0; i < tiers - 2; i++)
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
    movingGround.rotateZ(-Math.PI/2);
    scene.add(movingGround);

    movingGround.position.y = -24;
    movingGround.position.z = 2;

    // worldTrees();
}

function scorePosition()
{
    // Displays score -->>> REDO?
    scoreText = document.createElement('div');
    scoreText.style.position = 'absoulte';

    scoreText.style.width = 100;
    scoreText.style.height = 100;

    scoreText.innerHTML = "0";
    scoreText.style.top = 50 + 'px';
    scoreText.style.left = 10 + 'px';
    document.body.appendChild(scoreText);

    // ---------------------------------------------
    // Creates instructions ---> DONT NEED
    //  var infoText = document.createElement('div');

    // infoText.style.position = 'absolute';
    // infoText.style.width = 100;
    // infoText.style.height = 100;
    // infoText.style.backgroundColor = "yellow";
    // infoText.innerHTML = "UP - Jump, Left/Right - Move";
    // infoText.style.top = 10 + 'px';
    // infoText.style.left = 10 + 'px';

    // document.body.appendChild(infoText);
}

function explosion()
{
    particleGeometry = new THREE.Geometry();
    for (var i = 0; i < particleCount; i++)
    {
        var vertex = new THREE.Vector3();
        particleGeometry.vertices.push(vertex);
    }

    pMaterial = new THREE.ParticleBasicMaterial({
        color: 0xfffafa,
        size: 0.2
    });

    particles = new THREE.Points(particleGeometry, pMaterial);
    particles.visible = false;
    scene.add(particles);
}

function treesPool()
{
    var newTree;

    for (var i = 0; i < maxTrees; i++)
    {
        newTree = createTree();//!!!!!!!!!!!!!!!!!
        treesPool.push(newTree);
    }
}

function handleKeyDown(keyEvent)
{
    if (jumping) return;
    var validMove = true;
    if (keyEvent.keyCode === 37) 
    {   //left
        if (currentLane == middleLane) 
        {
            currentLane = leftLane;
        } else if (currentLane == rightLane) 
        {
            currentLane = middleLane;
        } 
        else 
        {
            validMove = false;
        }
    } 
    else if (keyEvent.keyCode === 39) 
    {   //right
        if (currentLane == middleLane)
        {
            currentLane = rightLane;
        } 
        else if (currentLane == leftLane) 
        {
            currentLane = middleLane;
        } 
        else 
        {
            validMove = false;
        }
    } 
    else 
    {
        if (keyEvent.keyCode === 38) 
        {//up, jump
            bounceValue = 0.1;
            jumping = true;
        }
        validMove = false;
    }
    //heroSphere.position.x=currentLane;
    if (validMove) 
    {
        jumping = true;
        bounceValue = 0.06;
    }
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
    // step = new Audio("");
    // pickUpItem = new Audio("");
    // dropItem = new Audio("");

    // bird1 = new Audio("");
    // bird2 = new Audio("");
    // bird3 = new Audio("");
    // bigBird = new Audio("");

    // bossRoar = new Audio("");

    // one = new Audio("");
    // two = new Audio("");
    // three = new Audio("");
}