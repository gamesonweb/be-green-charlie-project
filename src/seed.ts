import {
    Color3,
    Mesh,
  MeshBuilder,
  PickingInfo,
  Ray,
  RayHelper,
  Scene, StandardMaterial, Vector3,
} from "@babylonjs/core";
export abstract class Seed{
    protected _scene: Scene;
    // constructor need shadow
    constructor(scene: Scene) { 
        this._scene = scene;
    }
    
    public canHit(dir: Vector3, pos: Vector3): PickingInfo {
        let ray = new Ray(pos, dir, 10000);
        let hit = this._scene.pickWithRay(ray, this.predicate);
        //RayHelper.CreateAndShow(ray, this._scene, Color3.Black()).dispose();
        return hit;
    }

    // throw seed
    public fire(hitinfo: PickingInfo): void{
        if(hitinfo.hit)
            this.bodyCollideCB(hitinfo);
    }
    // delete obj after delay for grapes & coconut
    protected deleteObjAfterDelay(obj: Mesh, delay: number):void { 
        setTimeout(function () {
            obj.dispose();
        }, delay);    
    }
    protected generateObjectAfterDelay(obj: Mesh, delay: number, objtogenerate: Mesh, numberOfMesh: number):void { 
        setTimeout(function () {
            for (let i = 0; i < numberOfMesh; i++){
                let c = objtogenerate.clone("copy of " + objtogenerate.name);
                c.position = obj.position.add(new Vector3(numberOfMesh / 2 - i, 1, numberOfMesh / 2 - i));
                c.checkCollisions = true;
                c.isVisible = true;
            }
            
        }, delay);    
    }

    // permet de filter les objets sur lesquels on peut tirer
    protected abstract predicate(mesh: Mesh): boolean;

    // callback quand on touche un objet
    protected abstract bodyCollideCB(collision: PickingInfo): void;

}