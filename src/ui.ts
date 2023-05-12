import {
  TextBlock,
  StackPanel,
  AdvancedDynamicTexture,
  Image,
  Button,
  Rectangle,
  Control,
  DisplayGrid,
} from "@babylonjs/gui";
import { Scene } from "@babylonjs/core";
import { PlayerInput } from "./inputController";
import { AmmoManager } from "./ammoManager";

export class Hud {
  private _scene: Scene;
  private _input: PlayerInput;
  private _pauseMenu: Rectangle;
  private _playerUI: any; //UI Elements
  private _ammo_manager: AmmoManager;

  gamePaused: boolean;
  pauseBtn: Button;

  constructor(scene: Scene, input: PlayerInput) {
    this._scene = scene;
    this._input = input;
    this._createPauseMenu();
    this._createSelectSeedMenu();

    const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this._playerUI = playerUI;
    this._playerUI.idealHeight = 720;

    const pauseBtn = Button.CreateImageOnlyButton(
      "pauseBtn",
      "./sprites/pauseBtn.png"
    );
    pauseBtn.width = "50px";
    pauseBtn.height = "50px";
    pauseBtn.thickness = 0;
    pauseBtn.verticalAlignment = 0;
    pauseBtn.horizontalAlignment = 1;
    pauseBtn.top = "8px";
    playerUI.addControl(pauseBtn);
    pauseBtn.zIndex = 10;

    this.pauseBtn = pauseBtn;
    //when the button is down, make pause menu visable and add control to it
    pauseBtn.onPointerDownObservable.add(() => {
      this._pauseMenu.isVisible = true;
      playerUI.addControl(this._pauseMenu);
      this.pauseBtn.isHitTestVisible = false;

      //when game is paused, make sure that the next start time is the time it was when paused
      this.gamePaused = true;
    });
    //this._playerUI.getControlByName("Button0").color = "red";
  }
  public setAmmoManager(ammo_manager: AmmoManager) {
    this._ammo_manager = ammo_manager;
  }

  //---- Pause Menu Popup ----
  private _createPauseMenu(): void {
    this.gamePaused = false;

    const pauseMenu = new Rectangle();
    pauseMenu.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    pauseMenu.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    pauseMenu.height = 0.8;
    pauseMenu.width = 0.5;
    pauseMenu.thickness = 0;
    pauseMenu.isVisible = false;

    //background image
    const image = new Image("pause", "sprites/pause.png");
    pauseMenu.addControl(image);

    //stack panel for the buttons
    const stackPanel = new StackPanel();
    stackPanel.width = 0.83;
    pauseMenu.addControl(stackPanel);

    const resumeBtn = Button.CreateSimpleButton(
      "resume",
      "Reprendre la partie"
    );
    resumeBtn.width = 1;
    resumeBtn.height = "44px";
    resumeBtn.color = "white";
    resumeBtn.fontFamily = "Kanit";
    resumeBtn.paddingBottom = "14px";
    resumeBtn.cornerRadius = 14;
    resumeBtn.fontSize = "18px";
    resumeBtn.textBlock.resizeToFit = true;
    resumeBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    stackPanel.addControl(resumeBtn);

    this._pauseMenu = pauseMenu;

    //when the button is down, make menu invisable and remove control of the menu
    resumeBtn.onPointerDownObservable.add(() => {
      this._pauseMenu.isVisible = false;
      this._playerUI.removeControl(pauseMenu);
      this.pauseBtn.isHitTestVisible = true;

      //game unpaused, our time is now reset
      this.gamePaused = false;
    });
  }

  private _changeColors(ui: AdvancedDynamicTexture, selected: number, maxindex: number): void {
    for(let i = 0; i < maxindex; i++) {
      if (i == selected) {
        (ui.getControlByName("text" + i) as TextBlock).color  = "red";
      }else (ui.getControlByName("text" + i) as TextBlock).color  = "white";
    }
    //(ui.getControlByName("numberAmmo" + 2) as TextBlock).text = "4";
  }
  private _updateAmmo(ui:AdvancedDynamicTexture, maxindex: number): void { 
    for(let i = 0; i < maxindex; i++) {
      (ui.getControlByName("numberAmmo" + i) as TextBlock).text = this._ammo_manager.getAmmo(i).toString();
    }
  }
  private _createSelectSeedMenu() {
    const seedUI = AdvancedDynamicTexture.CreateFullscreenUI("UI",true,this._scene);
    seedUI.parseFromSnippetAsync("#XBTG4T#11").finally(() => {
      this._scene.registerBeforeRender(() => {
        this._changeColors(seedUI, this._input.chosen_seed, 5);
        if(this._ammo_manager.isUpdate())
          this._updateAmmo(seedUI,5);
      });
    });
  }
}
