import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  FreeCamera,
  Color4,
  Matrix,
  Quaternion,
  SceneLoader,
  StandardMaterial,
  Color3,
  PointLight,
  ShadowGenerator,
  HavokPlugin
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
import HavokPhysics from "@babylonjs/havok";

import { Environment } from "./environment";
import { Player } from "./characterController";
import { PlayerInput } from "./inputController";
import { Hud } from "./ui";
import { AmmoManager } from "./ammoManager";
import { ThrowSeedSystem } from "./throwSeedSystem";

async function loadPhy() {
  const havokInstance = await HavokPhysics();
  const hk = new HavokPlugin(true, havokInstance);
  return hk;
}

enum State {
  START = 0,
  GAME = 1,
  LOSE = 2,
}

class App {
  // General Entire Application
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;

  //Scene - related
  private _state: number = 0;
  private _gamescene: Scene;

  //Game State Related
  public assets;
  private _environment;
  private _player: Player;
  private _input: PlayerInput;
  private _ui: Hud;

  constructor() {
    this._canvas = this._createCanvas();

    // initialize babylon scene and engine
    this._engine = new Engine(this._canvas, true);
    this._scene = new Scene(this._engine);

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
        if (this._scene.debugLayer.isVisible()) {
          this._scene.debugLayer.hide();
        } else {
          this._scene.debugLayer.show();
        }
      }
    });
    loadPhy().then((hk) => {
      this._scene.enablePhysics(new Vector3(0, -9.8, 0), hk);
      console.log(hk);
      console.log("phy enabled");
    });

    // run the main render loop
    this._main();
  }

  private _createCanvas(): HTMLCanvasElement {
    //Commented out for development
    document.documentElement.style["overflow"] = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    //create the canvas html element and attach it to the webpage
    this._canvas = document.createElement("canvas");
    this._canvas.style.width = "100%";
    this._canvas.style.height = "100%";
    this._canvas.id = "gameCanvas";
    document.body.appendChild(this._canvas);

    return this._canvas;
  }

  private async _main(): Promise<void> {
    await this._goToStart();

    // Register a render loop to repeatedly render the scene
    this._engine.runRenderLoop(() => {
      switch (this._state) {
        case State.START:
          this._scene.render();
          break;
        case State.GAME:
          this._scene.render();
          break;
        case State.LOSE:
          this._scene.render();
          break;
        default:
          break;
      }
    });

    //resize if the screen is resized/rotated
    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }

  private async _goToStart() {
    this._engine.displayLoadingUI();

    this._scene.detachControl();
    let scene = new Scene(this._engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
    let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero());

    //create a fullscreen ui for all of our GUI elements
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    guiMenu.idealHeight = 720; //fit our fullscreen ui to this height

    //create a simple button
    const startBtn = Button.CreateSimpleButton("start", "PLAY");
    startBtn.width = 0.2;
    startBtn.height = "40px";
    startBtn.color = "white";
    startBtn.top = "-14px";
    startBtn.thickness = 0;
    startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    guiMenu.addControl(startBtn);

    //this handles interactions with the start button attached to the scene
    startBtn.onPointerDownObservable.add(() => {
      this._goToGame();
      scene.detachControl(); //observables disabled
    });

    //--SCENE FINISHED LOADING--
    await scene.whenReadyAsync();
    this._engine.hideLoadingUI();
    //lastly set the current state to the start state and set the scene to the start scene
    this._scene.dispose();
    this._scene = scene;
    this._state = State.START;

    var finishedLoading = false;
    await this._setUpGame().then((res) => {
      finishedLoading = true;
    });
  }

  private async _setUpGame() {
    let scene = new Scene(this._engine);
    this._gamescene = scene;

    //...load assets
    //--CREATE ENVIRONMENT--
    const environment = new Environment(scene);
    this._environment = environment; //class variable for App

    await this._environment.load(); //environment assets
    await this._loadCharacterAssets(scene); //character
  }

  private async _loadCharacterAssets(scene): Promise<any> {
    async function loadCharacter() {
      //collision mesh
      const outer = MeshBuilder.CreateBox(
        "outer",
        { width: 2, depth: 1, height: 3 },
        scene
      );
      outer.isVisible = false;
      outer.isPickable = false;
      outer.checkCollisions = true;

      //move origin of box collider to the bottom of the mesh (to match player mesh)
      outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0));
      //for collisions
      outer.ellipsoid = new Vector3(1, 1.5, 1);
      outer.ellipsoidOffset = new Vector3(0, 1.5, 0);
      return SceneLoader.ImportMeshAsync(
        null,
        "./models/",
        "character_treeman.glb",
        scene
      ).then((result) => {
        const root = result.meshes[0];
        //body is our actual player mesh
        const body = root;
        body.parent = outer;
        body.isPickable = false; //so our raycasts dont hit ourself
        body.getChildMeshes().forEach((m) => {
          m.isPickable = false;
        });

        return {
            mesh: outer as Mesh,
            animationGroups: result.animationGroups
        };
      });
    }
    return loadCharacter().then((assets) => {
      this.assets = assets;
    });
  }

  private async _goToGame() {
    //--SETUP SCENE--
    this._scene.detachControl();
    let scene = this._gamescene;

    //--INPUT--
    this._input = new PlayerInput(scene); //detect keyboard/mobile inputs
    //--GUI--
    const ui = new Hud(scene,this._input);
    this._ui = ui;
    //dont detect any inputs from this ui while the game is loading
    scene.detachControl();

    //create a simple button
    const loseBtn = Button.CreateSimpleButton("lose", "LOSE");
    loseBtn.width = 0.2;
    loseBtn.height = "40px";
    loseBtn.color = "white";
    loseBtn.top = "-14px";
    loseBtn.thickness = 0;
    loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
      // playerUI.addControl(loseBtn);

    //this handles interactions with the start button attached to the scene
    loseBtn.onPointerDownObservable.add(() => {
      this._goToLose();
      scene.detachControl(); //observables disabled
    });


    //primitive character and setting
    await this._initializeGameAsync(scene);

    //--WHEN SCENE FINISHED LOADING--
    await scene.whenReadyAsync();
    scene.getMeshByName("outer").position = new Vector3(0, 3, 0);

    scene.getMeshByName("outer").position = scene
      .getTransformNodeByName("startPosition")
      .getAbsolutePosition(); //move the player to the start position

    //get rid of start scene, switch to gamescene and change states
    this._scene.dispose();
    this._state = State.GAME;
    this._scene = scene;
    this._engine.hideLoadingUI();
    //the game is ready, attach control back
    this._scene.attachControl();
  }

  private async _goToLose(): Promise<void> {
    this._engine.displayLoadingUI();

    //--SCENE SETUP--
    this._scene.detachControl();
    let scene = new Scene(this._engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
    let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero());

    //--GUI--
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const mainBtn = Button.CreateSimpleButton("mainmenu", "MAIN MENU");
    mainBtn.width = 0.2;
    mainBtn.height = "40px";
    mainBtn.color = "white";
    guiMenu.addControl(mainBtn);
    //this handles interactions with the start button attached to the scene
    mainBtn.onPointerUpObservable.add(() => {
      this._goToStart();
    });

    //--SCENE FINISHED LOADING--
    await scene.whenReadyAsync();
    this._engine.hideLoadingUI(); //when the scene is ready, hide loading
    //lastly set the current state to the lose state and set the scene to the lose scene
    this._scene.dispose();
    this._scene = scene;
    this._state = State.LOSE;
  }

  private async _initializeGameAsync(scene): Promise<void> {

    const light = new PointLight("sparklight", new Vector3(-32, 30, 31), scene);
    light.diffuse = new Color3(
      0.08627450980392157,
      0.10980392156862745,
      0.15294117647058825
    );
    light.intensity = 10;
    light.radius = 1;

    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.darkness = 0.4;

    //Create the player
    let ammoManag: AmmoManager = new AmmoManager();
    ammoManag.give10();
    this._ui.setAmmoManager(ammoManag);
    this._player = new Player(this.assets, scene, shadowGenerator, ammoManag, this._input);
    let throwSys:ThrowSeedSystem = new ThrowSeedSystem(scene,this._player, this._input, ammoManag);
    const camera = this._player.activatePlayerCamera();
    // this._player = new Player(this.assets, scene, shadowGenerator); //dont have inputs yet so we dont need to pass it in
    scene.activeCamera = camera;
  }

}
new App();
