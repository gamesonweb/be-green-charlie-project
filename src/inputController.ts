import {
  Scene,
  ActionManager,
  ExecuteCodeAction,
  Observer,
  Scalar,
  Vector3,
} from "@babylonjs/core";

export class PlayerInput {
  public inputMap: any;
  private _scene: Scene;

  //simple movement
  public horizontal: number = 0;
  public vertical: number = 0;
  //tracks whether or not there is movement in that axis
  public horizontalAxis: number = 0;
  public verticalAxis: number = 0;
  //jumping
  public jumpKeyDown: boolean = false;
  //firing
  public fireKeyDown: boolean = false;
  //rotation
  public angle: number = -Math.PI / 2;
  //camera
  public zoom_y: number = 10;
  public zoom_z: number = -20;
  public chosen_seed: number = 0;

  constructor(scene: Scene) {
    scene.actionManager = new ActionManager(scene);

    this.inputMap = {};
    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      })
    );
    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
      })
    );

    scene.onBeforeRenderObservable.add(() => {
      this._updateFromKeyboard();
    });
  }

  private _updateFromKeyboard(): void {

    //Rotation checks (Q, D and S)
    if (this.inputMap["a"]) {
        this.angle += Math.PI/100;
        this.verticalAxis = Math.sin(this.angle);
        this.horizontalAxis = Math.cos(this.angle);
    } else if (this.inputMap["e"]) {
        this.angle -= Math.PI / 100;
        this.verticalAxis = Math.sin(this.angle);
        this.horizontalAxis = Math.cos(this.angle);
    } else {
    }

    //Go forward or backward Checks (Z and S)
    if (this.inputMap["z"]) {
        this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
    } else if (this.inputMap["s"]) {
        this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
    } else {
        this.vertical = 0;
    }

    //Jump Checks (SPACE)
    if (this.inputMap[" "]) {
        this.jumpKeyDown = true;
    } else {
      this.jumpKeyDown = false;
    }

    //Fire Checks (F)
    if (this.inputMap["f"]) {
      this.fireKeyDown = true;
    } else {
      this.fireKeyDown = false;
    }

    //Lateral movements Cheks (q and d)
    if (this.inputMap["q"]) {
        this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
    } else if (this.inputMap["d"]) {
        this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
    } else {
        this.horizontal = 0;
    }
    

    //Zoom and unZoom camera
    if (this.inputMap["ArrowDown"]) { //Zoom
        if (this.zoom_y < 30) {
            this.zoom_y += 0.5;
        }
        if (this.zoom_z > -40) {
            this.zoom_z -= 0.5;
        }
    } else if (this.inputMap["ArrowUp"]) { //unZoom
        if (this.zoom_y > 0) {
            this.zoom_y -= 0.5;
        }
        if (this.zoom_z < -10) {
            this.zoom_z += 0.5;
        }
    } else if (this.inputMap["ArrowLeft"]) { //reset
        this.zoom_y = 10;
        this.zoom_z = -20;
    }
    else {
        this.zoom_y += 0;
        this.zoom_z += 0;
    }

    let tabChooseSeed:string[];
    tabChooseSeed = ["&", "é", "1", "2", "(", "-", "è", "_"];
    let count: number = 0;
    let newseed: number = null;
    for (let i: number = 0; i < tabChooseSeed.length; i++) {
      if (this.inputMap[tabChooseSeed[i]]) {
        count++;
        newseed = i;
      }
    }
    if (count == 1) {
      this.chosen_seed = newseed;
    }
  }
}
