import {
  Scene,
  TransformNode,
  Mesh,
  ShadowGenerator,
  Vector3,
  UniversalCamera,
  Quaternion,
  Ray,
  AnimationGroup,
  Tools,
  Engine,
  PickingInfo,
} from "@babylonjs/core";
import { PlayerInput } from "./inputController";
import { AmmoManager } from "./ammoManager";

export class Player extends TransformNode {
  public camera: UniversalCamera; // ajout de la propriété camera
  public scene: Scene;
  private _input: PlayerInput;

  public mesh: Mesh;

  //Camera
  private _camRoot: TransformNode;
  private _yTilt: TransformNode;
  private static readonly _cameraSpeed: number = 0.0075;

  //mouse
  private static readonly _mouseSensitivity: number = .1;
  private _mouseX = 0;
  private _mouseY = 0;
  private _mouseMin = -90;
  private _mouseMax = 45;
  private _canvas = null;;

  private _ammo_manager: AmmoManager;
  private _grounded: boolean;
  private _lastGroundPos: Vector3 = Vector3.Zero(); // keep track of the last grounded position
  private _gravity: Vector3 = new Vector3();
    private _jumpCount: number = 1;

    //animations stored
    private _jump: AnimationGroup;
    private _shoot: AnimationGroup;
    private _static: AnimationGroup;
    private _walk: AnimationGroup;

    //animations trackers
    private _currentAnim: AnimationGroup = null;
    private _prevAnim: AnimationGroup;
    private _isFalling: boolean = false;
    private _jumped: boolean = false;
    private _boinged: boolean = false;

  private static readonly ORIGINAL_TILT: Vector3 = new Vector3(
    0.5934119456780721,
    0,
    0
  );
  private static readonly PLAYER_SPEED: number = 0.2;
  private static readonly JUMP_FORCE: number = 0.2;
  private static readonly GRAVITY: number = -1;

  //player movement vars
  private _deltaTime: number = 0;
  private _h: number;
  private _v: number;

  private _moveDirection: Vector3 = new Vector3();
  private _inputAmt: number;

  constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, ammo_manag: AmmoManager, input?) {
    super("player", scene);
    this._canvas = scene.getEngine().getRenderingCanvas();
    this.scene = scene;
    this._ammo_manager = ammo_manag;
    this._setupPlayerCamera();
    this._setupPointerLock();

    this.mesh = assets.mesh;
    this.mesh.parent = this;
    this.scene.getLightByName("sparklight").parent =
    this.scene.getTransformNodeByName("Empty");

    shadowGenerator.addShadowCaster(assets.mesh);

      this._input = input;

      //animations created
      this._jump = assets.animationGroups[0];
      this._shoot = assets.animationGroups[1];
      this._static = assets.animationGroups[2];
      this._walk = assets.animationGroups[3];
  }
  public getCamRoot(): TransformNode{
    return this._camRoot;
  }

  private _setupPlayerCamera(): UniversalCamera {
    //root camera parent that handles positioning of the camera to follow the player
    this._camRoot = new TransformNode("root");
    this._camRoot.position = new Vector3(0, 0, 0); //initialized at (0,0,0)
    //to face the player from behind (180 degrees)
    this._camRoot.rotation = new Vector3(0, -Math.PI, 0);
    console.log(this._camRoot.rotation);
    //rotations along the x-axis (up/down tilting)
    let yTilt = new TransformNode("ytilt");
    //adjustments to camera view to point down at our player
    yTilt.rotation = Player.ORIGINAL_TILT;
    this._yTilt = yTilt;
    yTilt.parent = this._camRoot;

    //our actual camera that's pointing at our root's position
    this.camera = new UniversalCamera(
      "cam",
      new Vector3(0,0 , -10),
      this.scene
    );
    this.camera.lockedTarget = this._camRoot.position;
    this.camera.fov = 0.8; // 0.47350045992678597;
    this.camera.parent = yTilt;

    this.scene.activeCamera = this.camera;
    return this.camera;
  }

  private _mouseMove = (e) =>
  {
    //console.log(e);
    let movementX = e.movementX;
    let movementY = e.movementY;
    this._mouseX += movementX * Player._mouseSensitivity;
    this._mouseY += movementY * Player._mouseSensitivity;
    this._mouseY = this._clamp(this._mouseY, this._mouseMin, this._mouseMax);
    /*
    console.log(this._mouseX);
    console.log(this._mouseY);
    console.log("############################################");
    */
  }
    //tools
  private _clamp(value: number, min: number, max: number): number
  {
      return Math.max(Math.min(value, max), min);
  }

  private _lerp(start: number, end: number, speed: number)
  {
      return (start + ((end - start) * speed));
  }

  private _lerp3(p1: Vector3, p2: Vector3, t: number)
  {
          let x = this._lerp(p1.x, p2.x, t);
          let y = this._lerp(p1.y, p2.y, t);
          let z = this._lerp(p1.z, p2.z, t);

          return new Vector3(x, y, z);
  }
      //mouse lock
  // Configure all the pointer lock stuff
  private _setupPointerLock()
  {

    this._canvas.style.cursor = "none";
    // register the callback when a pointerlock event occurs
    //document.addEventListener('pointerlockchange', this._changeCallback, false);
    document.addEventListener('mousemove', this._mouseMove, false);
    // when element is clicked, we're going to request a
    // pointerlock
    this._canvas.onclick = () =>{
      //this._canvas.requestPointerLock();
      Engine._RequestPointerlock(this._canvas);
    };
  }
  
  // called when the pointer lock has changed. Here we check whether the
    // pointerlock was initiated on the element we want.
  private _changeCallback(e: Event): void {
    console.log("document.pointerLockElement" + document.pointerLockElement);
    console.log("document" + document);
    console.log("this._canvas" + this._canvas);
    if (
      document.pointerLockElement === this._canvas
    ) {
      // pointer lock is active, add a mouselistener
      document.addEventListener('_mouseMove', this._mouseMove, false);
      console.log("pointer lock active");
    } else {
      // pointer lock is no longer active, remove the callback
      document.removeEventListener('_mouseMove', this._mouseMove, false);
      console.log("pointer lock inactive");
    }
  }

  // GAME UPDATES
  private _beforeRenderUpdate(): void {
    this._updateFromControls();
    this._updateGroundDetection();
    //move our mesh
    this.mesh.moveWithCollisions(this._moveDirection);
    //animation
    this._animationsFromControls();
  }

  public activatePlayerCamera(): UniversalCamera {
    this.scene.registerBeforeRender(() => {
      this._beforeRenderUpdate();
      this._updateCamera();
    });
    return this.camera;
  }

  private _updateCamera = () =>
  {
    let centerPlayer = this.mesh.position.y + 2;
    this._camRoot.position = Vector3.Lerp(
      this._camRoot.position,
      new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z),
      0.4
      );

      //the camera is always behind the player
      let angle = Math.atan2(
          this._input.horizontalAxis,
          this._input.verticalAxis);
      //this._camRoot.rotation = new Vector3(0, angle, 0);
    //console.log(this._camRoot.rotation + " " + this._mouseY + " " + this._mouseX);
    /*this._camRoot.rotation = this._lerp3(
            this._camRoot.rotation, 
            new Vector3(
                Tools.ToRadians(this._mouseY),
                Tools.ToRadians(this._mouseX), 0
            ), Player._cameraSpeed*this._deltaTime
    );*/
    this._camRoot.rotation = new Vector3(
      Tools.ToRadians(this._mouseY),
      Tools.ToRadians(this._mouseX), 0
    );
      //console.log(this._camRoot.rotation + " " + this._mouseY + " " + this._mouseX);
      //the focalisation of the camera can change
      this.camera.position.y = this._input.zoom_y
      this.camera.position.z = this._input.zoom_z;
  }

  //--GROUND DETECTION--
  //Send raycast to the floor to detect if there are any hits with meshes below the character
  private _floorRaycast(
    offsetx: number,
    offsetz: number,
    raycastlen: number
  ): Vector3 {
    //position the raycast from bottom center of mesh
    let raycastFloorPos = new Vector3(
      this.mesh.position.x + offsetx,
      this.mesh.position.y + 0.5,
      this.mesh.position.z + offsetz
    );
    let ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastlen);

    //defined which type of meshes should be pickable
    let predicate = function (mesh) {
      return mesh.isPickable && mesh.isEnabled();
    };

    let pick = this.scene.pickWithRay(ray, predicate);

    if (pick.hit) {
      //grounded
      return pick.pickedPoint;
    } else {
      //not grounded
      return Vector3.Zero();
    }
  }

  //raycast from the center of the player to check for whether player is grounded
  private _isGrounded(): boolean {
    if (this._floorRaycast(0, 0, 0.6).equals(Vector3.Zero())) {
      return false;
    } else {
      return true;
    }
  }

  private _updateGroundDetection(): void {
    this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
    //if not grounded
    if (!this._isGrounded()) {
      //keep applying gravity
      this._gravity = this._gravity.addInPlace(
        Vector3.Up().scale(this._deltaTime * Player.GRAVITY)
      );
      this._grounded = false
    }
    //limit the speed of gravity to the negative of the jump power
    if (this._gravity.y < -Player.JUMP_FORCE) {
        this._gravity.y = -Player.JUMP_FORCE;
    }

    //cue falling animation once gravity starts pushing down
    if (this._gravity.y < 0 && this._jumped) { //todo: play a falling anim if not grounded BUT not on a slope
        this._isFalling = true;
    }

    //update our movement to account for jumping
    this.mesh.moveWithCollisions(this._moveDirection.addInPlace(this._gravity));
    if (this._isGrounded()) {
      this._gravity.y = 0;
      this._grounded = true;
      //keep track of last known ground position
      this._lastGroundPos.copyFrom(this.mesh.position);

      this._jumpCount = 1;


      //jump & falling animation flags
      this._jumped = false;
      this._isFalling = false;
    }

    //Jump detection
    if (this._input.jumpKeyDown && this._jumpCount > 0/* && this._isGrounded()*/) {
      this._gravity.y = Player.JUMP_FORCE;
      this._jumpCount--;

      //jumping and falling animation flags
      this._jumped = true;
      this._isFalling = false;
    }

    //boing
    let predicate = function (mesh) { 
      if (mesh.name == "outer" || mesh.name == "ray" || mesh.name == "body_primitive0") {
        return false;
      } else  return true;
    }
    let ray = new Ray(new Vector3(this._camRoot.position.x, this._camRoot.position.y + -2, this._camRoot.position.z), Vector3.Down(), 0.2);
    let hit = this.scene.pickWithRay(ray, predicate);
    //console.log(hit.pickedMesh);
    if (this._isGrounded() && hit.pickedMesh && hit.pickedMesh.name == "boing") {
      this._jumped = true;
      this._gravity.y = Player.JUMP_FORCE + Player.JUMP_FORCE;
    }


  }

  private _updateFromControls(): void {
    this._moveDirection = Vector3.Zero(); // vector that holds movement information
    this._h = this._input.horizontal; //x-axis
    this._v = this._input.vertical; //z-axis

    //check if there is movement to determine if rotation is needed
    let input = new Vector3(
      this._input.horizontalAxis,
      0,
      this._input.verticalAxis
    ); //along which axis is the direction
    if (input.length() == 0) {
      //if there's no input detected, prevent rotation and keep player in same rotation
      return;
    }

    //rotation based on input & the camera angle
    
    let angle = Math.atan2(
      this._input.horizontalAxis,
      this._input.verticalAxis
    );
    angle += this._camRoot.rotation.y;
    let targ = Quaternion.FromEulerAngles(0, angle/2, 0);

      this.mesh.rotationQuaternion = Quaternion.Slerp(
          targ,
          targ,
          10 * this._deltaTime
    );
    

    //--MOVEMENTS BASED ON CAMERA (as it rotates)--
    let fwd = this._camRoot.forward;
    let right = this._camRoot.right;
    let correctedVertical = fwd.scaleInPlace(this._v);
    let correctedHorizontal = right.scaleInPlace(this._h);

    //movement based off of camera's view
    let move = correctedHorizontal.addInPlace(correctedVertical);

    //clear y so that the character doesnt fly up, normalize for next step
    this._moveDirection = new Vector3(
      move.normalize().x,
      0,
      move.normalize().z
    );

    //_clamp the input value so that diagonal movement isn't twice as fast
    let inputMag = Math.abs(this._h) + Math.abs(this._v);
    if (inputMag < 0) {
      this._inputAmt = 0;
    } else if (inputMag > 1) {
      this._inputAmt = 1;
    } else {
      this._inputAmt = inputMag;
    }
    //final movement that takes into consideration the inputs
    this._moveDirection = this._moveDirection.scaleInPlace(
      this._inputAmt * Player.PLAYER_SPEED
    );
  }

  //to animate the player - CURRENTLY DOSEN'T WORK
    private _animationsFromControls(): void {

        this.scene.stopAllAnimations();
        this._walk.loopAnimation = true;
        this._static.loopAnimation = true;

        //initialize current and previous
        this._currentAnim = this._static;
        this._prevAnim = this._static;


        if (this._input.inputMap[" "]) {
            this._currentAnim = this._jump;
        }
        else if (this._input.inputMap["z"] && !this._isFalling && !this._jumped) {
            this._currentAnim = this._walk;
        }
        else if (this._jumped && !this._isFalling) {
            this._currentAnim = this._jump;
        }
        else if (!this._isFalling && this._grounded) {
            this._currentAnim = this._static;
        }

        //Animations
        if(this._currentAnim != null && this._prevAnim !== this._currentAnim){
            this._prevAnim.stop();
            this._currentAnim.play(this._currentAnim.loopAnimation);
            this._prevAnim = this._currentAnim;
        }
  }
}
