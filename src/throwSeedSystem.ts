import { Color3, PickingInfo, Ray, RayHelper, Scene, Vector3 } from "@babylonjs/core";
import { Player } from "./characterController";
import { PlayerInput } from "./inputController";
import { CoconutTreeSeed } from "./coconutTreeSeed";
import { JumpSeed } from "./jumpSeed";
import { VineSeed } from "./vineSeed";
import { WallSeed } from "./wallSeed";
import { WaterLilySeed } from "./waterlilySeed";
import { AmmoManager } from './ammoManager';

export class ThrowSeedSystem{
    private _input: PlayerInput;
    private _player: Player;
    private _scene: Scene;
    private _ammo_manager: AmmoManager;

    // osef qu'il n'est pas unique a
    //chaque graine vue qu'on est plus dans un mode construction qu'autre chose
    // ça n'aurait pas beaucoup de sens
    private readonly _throwCD: number = 0.5;

    // permet de savoir si on peut tirer ou non en fonction du cooldown
    private _time_stored: number = 0;
    // constructor need shadow
    constructor(scene: Scene, player: Player, input: PlayerInput, ammo_manag: AmmoManager) { 
        this._input = input;
        this._player = player;
        this._scene = scene;
        this._ammo_manager = ammo_manag;
        
        this._updateFireSystem();
    }
    
    // permet de planter la graine choisie a l'emplacement de la camera
    private _fireSeed(dir: Vector3, pos: Vector3): void {
        /*this._seed = this._seeds[this._selectedSeed];
        this._seed.fireSeed(this.mesh, this._camRoot);*/
        let amo = null;
        switch (this._input.chosen_seed) { 
        case 0:
            amo = new VineSeed(this._scene);
            break;
        case 1:
            amo = new CoconutTreeSeed(this._scene);
            break;
        case 2:
            amo = new WallSeed(this._scene);
            break;
        case 3:
            amo = new JumpSeed(this._scene);
            break;
        case 4:
            amo = new WaterLilySeed(this._scene);
            break;
        case 5:
            //amo = new CreeperSeed(this.scene);
            amo = new WallSeed(this._scene)
            break;
        case 6:
            //amo = new IvySeed(this.scene);
            amo = new WallSeed(this._scene)
            break;
        default:
            amo = new WallSeed(this._scene);
            break;
        }
        let hit: PickingInfo = amo.canHit(dir, pos);
        if (hit.hit && this._ammo_manager.fire(this._input.chosen_seed)) {
            amo.fire(hit);
            console.log("fire: " + amo.constructor.name);
        }
    }
    // update fire system
    private _updateFireSystem(): void { 
        this._scene.registerBeforeRender(() => {
            let now = Date.now();
            if (this._input.fireKeyDown && now - this._throwCD*1000 > this._time_stored) {
                this._time_stored = now;
                this._fireSeed(this._player.getCamRoot().forward.clone(), this._player.getCamRoot().position.clone());
            }
        });
    }

}