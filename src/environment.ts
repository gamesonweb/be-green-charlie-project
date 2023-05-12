import { Scene, Vector3, MeshBuilder, SceneLoader, StandardMaterial, Color3, VideoTexture, AbstractMesh, VertexBuffer, FloatArray } from "@babylonjs/core";

export class Environment {
  private _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  public async load() {
    //Create materials for the environment
    this._envTest();

    const assets = await this._loadAsset();
    const seed_assets = await this._loadSeedAsset();
    const grass_asseet = await this._loadGrassAsset();
    let wallmaterial = new StandardMaterial("material", this._scene);
    wallmaterial.diffuseColor = Color3.Red();
    let groundmaterial = new StandardMaterial("material", this._scene);
    groundmaterial.diffuseColor = Color3.Green();
    //Loop through all environment meshes that were imported
    assets.allMeshes.forEach((m) => {
      console.log(m.name);
      if (m.name.includes("ground")) {
        m.material = groundmaterial;
        /*
        let positions:FloatArray = m.getVerticesData(VertexBuffer.PositionKind);
        console.log(positions);
        positions.forEach((p, i) => {
          let grass: AbstractMesh = grass_asseet.allMeshes[0];
          let grasscopy = grass.clone("grass", m, true);
          
          grasscopy.position = new Vector3(p, positions[i+1], positions[i+2]);
          grasscopy.receiveShadows = true;
          grasscopy.checkCollisions = false;
        });*/
      }else
      if (m.name.includes("scene")) {
        m.material = wallmaterial;
        m.name = "wall";
      }else
      if (m.name.includes("mush")) { 
        if (m.name.includes("primitive0")) { 
          m.material = wallmaterial;
        } else
        if (m.name.includes("primitive1")) { 
          m.material = groundmaterial;  
        }
        
      }else
      if (m.name.includes("Stone1")) {
        m.material = wallmaterial;
      }else
      if (m.name.includes("Stone2")) {
        m.material = wallmaterial;
      }else
      if (m.name.includes("Stone0")) {
        m.material = wallmaterial;
      }

      m.receiveShadows = true;
      m.checkCollisions = true;
    });
    seed_assets.allMeshes.forEach((m) => {
      m.receiveShadows = true;
      m.checkCollisions = false;
    });
  }

  //private load
  private _envTest() {
    //Create materials for the environment
    const boingMaterial = new StandardMaterial("boing", this._scene);
    boingMaterial.diffuseColor = Color3.Purple();
    const groundMaterial = new StandardMaterial("ground", this._scene);
    groundMaterial.diffuseColor = Color3.Green();
    const wallMaterial = new StandardMaterial("wall", this._scene);
    wallMaterial.diffuseColor = Color3.Red();
    const underWaterMaterial = new StandardMaterial("underwater", this._scene);
    underWaterMaterial.diffuseColor = Color3.Blue();
    //Create meshes for the environment
    var boing = MeshBuilder.CreateBox("boing", { size: 4 }, this._scene);
    boing.checkCollisions = true;
    boing.scaling = new Vector3(1, 1, 1);
    boing.position.y = 4;
    boing.position.x = -8;
    boing.material = boingMaterial;
    var ground = MeshBuilder.CreateBox("ground", { size: 4 }, this._scene);
    ground.checkCollisions = true;
    ground.scaling = new Vector3(1, 1, 1);
    ground.position.y = 4;
    ground.position.x = 0;
    ground.material = groundMaterial;
    var wall = MeshBuilder.CreateBox("wall", { size: 4 }, this._scene);
    wall.checkCollisions = true;
    wall.scaling = new Vector3(1, 1, 1);
    wall.position.y = 4;
    wall.position.x = 4;
    wall.material = wallMaterial;
    var underwater = MeshBuilder.CreateBox("underwater", { size: 4 }, this._scene);
    underwater.checkCollisions = true;
    underwater.scaling = new Vector3(1, 1, 1);
    underwater.position.y = 4;
    underwater.position.x = -4;
    underwater.material = underWaterMaterial;
  }

  private async _loadGrassAsset() {
    const result = await SceneLoader.ImportMeshAsync(
      null,
      "./models/model_textured_ready/",
      "grass.glb",
      this._scene
    );
    let env = result.meshes[0];
    let allMeshes = env.getChildMeshes();

    return {
      env: env, //reference to our entire imported glb (meshes and transform nodes)
      allMeshes: allMeshes, // all of the meshes that are in the environment
    };

  }
  private async _loadSeedAsset() {
    let tab = ["pumpkin.glb", "jumping_plant.glb", "waterlily.glb"];
    let env: AbstractMesh[] = [];
    let allMeshes: AbstractMesh[] = [];
    for (let i = 0; i < tab.length; i++) {
      const result = await SceneLoader.ImportMeshAsync(
        null,
        "./models/model_textured_ready/seed/",
        tab[i],
        this._scene
      );
      env.push(result.meshes[0]);
      result.meshes[0].getChildMeshes().forEach((m) => {
        allMeshes.push(m);
      });
    }
    

    return {
      env: env, //reference to our entire imported glb (meshes and transform nodes)
      allMeshes: allMeshes, // all of the meshes that are in the environment
    };
  }

  //Load all necessary meshes for the environment
  private async _loadAsset() {
    const result = await SceneLoader.ImportMeshAsync(
      null,
      "./models/",
      "stage_1_1_filled_sorted.glb",
      this._scene
    );

    let env = result.meshes[0];
    let allMeshes = env.getChildMeshes();

    return {
      env: env, //reference to our entire imported glb (meshes and transform nodes)
      allMeshes: allMeshes, // all of the meshes that are in the environment
    };
  }
}
