import { Seed } from "./seed";
import { Scene,Vector3,MeshBuilder, Ray, Mesh, StandardMaterial, Color3, RayHelper, PickingInfo } from '@babylonjs/core';

export class WaterLilySeed extends Seed{
    constructor(scene: Scene) { 
        super(scene);
    }
    override predicate(mesh: Mesh): boolean {
        if (mesh.name == "outer" || mesh.name == "ray" || mesh.name == "body_primitive0" || mesh.name == "waterlily") {
            return false;
        } else if (mesh.name == "underwater") return true;
        else return false;
    }
    override bodyCollideCB(collision: PickingInfo) {
        var boingbox = MeshBuilder.CreateBox("waterlily", { size: 2 }, this._scene);
        boingbox.position = collision.pickedPoint.add(new Vector3(0, 2, 0));
        //addShadows(boingbox);
        var material = new  StandardMaterial("Blue", this._scene);
        material.diffuseColor = Color3.Blue().subtract(new Color3(.5,.5,.5));
        boingbox.material = material;
        boingbox.checkCollisions = true;
    }

}