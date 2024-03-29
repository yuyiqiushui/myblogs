<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>hangge.com</title>
    <script type="text/javascript" src="../libs/three.js"></script>
    <script type="text/javascript" src="../libs/dat.gui.js"></script>
    <style>
        body {
            margin: 0;
            overflow: hidden;
        }
    </style>
</head>
<body>
 
<!-- 作为Three.js渲染器输出元素 -->
<div id="WebGL-output">
</div>
 
<!-- 第一个 Three.js 样例代码 -->
<script type="text/javascript">
 
    //网页加载完毕后会被调用
    function init() {
 
        //创建一个场景（场景是一个容器，用于保存、跟踪所要渲染的物体和使用的光源）
        var scene = new THREE.Scene();
 
        //创建一个摄像机对象（摄像机决定了能够在场景里看到什么）
        var camera = new THREE.PerspectiveCamera(45,
          window.innerWidth / window.innerHeight, 0.1, 1000);
 
        //设置摄像机的位置，并让其指向场景的中心（0,0,0）
        camera.position.x = -30;
        camera.position.y = 40;
        camera.position.z = 30;
        camera.lookAt(scene.position);
 
        //创建一个WebGL渲染器并设置其大小
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(0xEEEEEE));
        renderer.setSize(window.innerWidth, window.innerHeight);
 
        //创建一个立方体
        var cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
        //将线框（wireframe）属性设置为true，这样物体就不会被渲染为实物物体
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;
 
        //设置立方体的位置
        cube.position.x = -4;
        cube.position.y = 3;
        cube.position.z = 0;
 
        //将立方体添加到场景中
        scene.add(cube);
 
        //创建点光源
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-40, 60, -10);
        spotLight.castShadow = true;
        scene.add(spotLight);
 
        //将渲染的结果输出到指定页面元素中
        document.getElementById("WebGL-output").appendChild(renderer.domElement);
 
        //存放有所有需要改变的属性的对象
        var controls = new function () {
            this.rotationSpeed = 0.02;
        };
 
        //创建dat.GUI，传递并设置属性
        var gui = new dat.GUI();
        gui.add(controls, 'rotationSpeed', 0, 0.5);
 
        //渲染场景
        render();
 
        //渲染场景
        function render() {
            //选装立方体
            cube.rotation.x += controls.rotationSpeed;
            cube.rotation.y += controls.rotationSpeed;
            cube.rotation.z += controls.rotationSpeed;
 
            //通过requestAnimationFrame方法在特定时间间隔重新渲染场景
            requestAnimationFrame(render);
            //渲染场景
            renderer.render(scene, camera);
        }
    }
 
    //确保init方法在网页加载完毕后被调用
    window.onload = init;
</script>
</body>
</html>