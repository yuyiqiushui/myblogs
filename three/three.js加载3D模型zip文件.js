import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import JSZip from 'jszip'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment'

class LoadModel {
  constructor(params) {
    this.url=params.url
    this.arrayBuffers=[] //二进制数据
    this.fileMap={} //储存原始路径和对应blob
    this.modelUrl='' //gltf文件路径
    //指定容器
    if(params.container){
      this.container=params.container
      this.width=params.width||this.container.clientWidth
    }else {
      this.container=document.body
      this.width=params.width|| window.innerWidth
    }
    this.height=params.height|| window.innerHeight
    // console.log(this.container,this.width,this.height)
    this.init()
  }
  async init(){
    this.loadTHREE()
    await this.loadZipFile()
    await this.fileToBlob()
    this.findFile()
    this.runLoader()
  }
  loadTHREE(){
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 20, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    this.scene.background = new THREE.Color( 0x8a8c8e );
    this.scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;
    const light = new THREE.AmbientLight( 0xffffff );
    this.scene.add(light)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.update();
  }
  loadZipFile(){
    return new Promise(resolve => {
      const fileLoader = new THREE.FileLoader();
      fileLoader
        .setResponseType("arraybuffer")
        .load(
          this.url,
          data => {
            // console.log(data,'file')
            this.arrayBuffers=data
            resolve()
          },
        )
    })
  }
  async fileToBlob(){
    //zip.js加载文件流生成对应文件:
    const zip = new JSZip();
    const promise = JSZip.external.Promise;
    const baseUrl = 'blob:' + THREE.LoaderUtils.extractUrlBase(this.url);
    const pendings = [];
    await zip.loadAsync(this.arrayBuffers);
    //转成blob文件，用URL.createObjectURL创建文件的url
    for (let file in zip.files) {
      const entry = zip.file(file);
      if (entry === null) continue;
      pendings.push(entry.async('blob').then(((file, blob) => {
        this.fileMap[baseUrl + file] = URL.createObjectURL(blob);
      }).bind(this, file)))
    }
    //监听所有请求结束
    await promise.all(pendings);
  }
  findFile(){
    //模型文件url
    this.modelUrl = Object.keys(this.fileMap).find(item => /\.(gltf)$/.test(item));
  }
  runLoader(){
    const manager = new THREE.LoadingManager();
    //转换处理，传入的是后台返回的路径，需找到对应blob
    manager.setURLModifier(url => {
      return this.fileMap[url] ? this.fileMap[url] : url;
    });

    const loader = new GLTFLoader(manager)
    loader.load(this.modelUrl, gltf=> {
      // console.log(gltf)
      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          //模型自发光
          child.material.emissive = child.material.color;
          child.material.emissiveMap = child.material.map;
        }
      });
      this.setScaleToFitSize(gltf.scene)
      this.scene.add(gltf.scene);
      animate()
    })
    const that=this
    function animate() {
      requestAnimationFrame(animate);
      that.controls.update();
      that.renderer.render(that.scene, that.camera);
    }
  }
  //适合模型观察的缩放比例
  setScaleToFitSize(obj) {
    const boxHelper = new THREE.BoxHelper(obj);
    boxHelper.geometry.computeBoundingBox();
    const box = boxHelper.geometry.boundingBox;
    const maxDiameter = Math.max((box.max.x - box.min.x), (box.max.y - box.min.y), (box.max.z - box.min.z));
    const scaleValue = this.camera.position.z / maxDiameter;
    obj.scale.set(scaleValue, scaleValue, scaleValue);
  }
}

export default LoadModel