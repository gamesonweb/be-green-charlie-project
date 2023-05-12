import { Seed } from "./seed";
import { Scene,Vector3,MeshBuilder, Ray, Mesh, StandardMaterial, Color3, RayHelper, PickingInfo } from '@babylonjs/core';

export class CoconutTreeSeed extends Seed{
    constructor(scene: Scene) { 
        super(scene);
    }
    override predicate(mesh: Mesh): boolean {
        if (mesh.name == "outer" || mesh.name == "ray" || mesh.name == "body_primitive0"|| mesh.name == "coconuttree") {
            return false;
        } else if (mesh.name == "ground") return true;
        else return false;
    }
    override bodyCollideCB(collision: PickingInfo) {
        // Generate material
        let materialCoconutTree = new StandardMaterial("CoconutTree", this._scene);
        materialCoconutTree.diffuseColor = Color3.Teal().subtract(new Color3(.5,.5,.5));
        let materialCoconut = new StandardMaterial("Coconut", this._scene);
        materialCoconut.diffuseColor = Color3.Teal().subtract(new Color3(.6, .6, .6));
        
        let coconutTreeBox = MeshBuilder.CreateBox("coconuttree", { size: 2 }, this._scene);
        coconutTreeBox.position = collision.pickedPoint.add(new Vector3(0, 2, 0));

        let coconutBox = MeshBuilder.CreateSphere("coconut", { diameter: 1 }, this._scene);
        coconutBox.isVisible = false;
        coconutBox.material = materialCoconut;

        //addShadows(boingbox);

        coconutTreeBox.material = materialCoconutTree;
        coconutTreeBox.checkCollisions = true;
        this.generateObjectAfterDelay(coconutTreeBox, 10000, coconutBox, 3);
        this.deleteObjAfterDelay(coconutTreeBox, 10000);
        this.deleteObjAfterDelay(coconutBox, 10000);
    }

}