import { Seed } from "./seed";
import { Scene,Vector3,MeshBuilder, Ray, Mesh, StandardMaterial, Color3, RayHelper, PickingInfo } from '@babylonjs/core';

export class VineSeed extends Seed{
    constructor(scene: Scene) { 
        super(scene);
    }
    override predicate(mesh: Mesh): boolean {
        if (mesh.name == "outer" || mesh.name == "ray" || mesh.name == "body_primitive0") {
            return false;
        } else if (mesh.name == "ground") return true;
        else return false;
    }
    override bodyCollideCB(collision: PickingInfo) {
        // Generate material
        let materialVine = new StandardMaterial("vine", this._scene);
        materialVine.diffuseColor = Color3.Magenta().subtract(new Color3(.5,.5,.5));
        let materialGrape = new StandardMaterial("grape", this._scene);
        materialGrape.diffuseColor = Color3.Magenta().subtract(new Color3(.6, .6, .6));
        
        let grapBox = MeshBuilder.CreateSphere("grape", { diameter: .5 }, this._scene);
        grapBox.isVisible = false;
        grapBox.material = materialGrape;

        let vineBox = MeshBuilder.CreateBox("vine", { size: 2 }, this._scene);
        vineBox.position = collision.pickedPoint.add(new Vector3(0, 2, 0));
        //addShadows(boingbox);

        vineBox.material = materialVine;
        vineBox.checkCollisions = true;
        this.generateObjectAfterDelay(vineBox, 5000, grapBox, 10);
        this.deleteObjAfterDelay(vineBox, 5000);
        this.deleteObjAfterDelay(grapBox, 5000);
    }

}