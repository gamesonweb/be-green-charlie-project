import { Seed } from "./seed";
import { Scene,Vector3,MeshBuilder, Ray, Mesh, StandardMaterial, Color3, RayHelper, PickingInfo } from '@babylonjs/core';

export class WallSeed extends Seed{
    constructor(scene: Scene) { 
        super(scene);
    }
    override predicate(mesh: Mesh): boolean {
        if (mesh.name == "outer" || mesh.name == "ray" || mesh.name == "body_primitive0" || mesh.name == "wall") {
            return false;
        } else return true;
    }
    override bodyCollideCB(collision: PickingInfo) {
        var platforme = MeshBuilder.CreateBox("wall", { size: 4 }, this._scene);
        platforme.position = collision.pickedPoint;
        platforme.material = new StandardMaterial("lightBox", this._scene);
        platforme.checkCollisions = true;
    }

}