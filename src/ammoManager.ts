
export class AmmoManager{
    private _seed_vine_quantity: number;
    private _seed_coconut_quantity: number;
    private _seed_wall_quantity: number;
    private _seed_jump_quantity: number;
    private _seed_waterlily_quantity: number;
    private _seed_creeper_quantity: number;
    private _seed_ivy_quantity: number;

    private ui_need_update: boolean;

    // constructor need shadow
    constructor() {
        this._seed_vine_quantity = 0;
        this._seed_coconut_quantity = 0;
        this._seed_wall_quantity = 0;
        this._seed_jump_quantity = 0;
        this._seed_waterlily_quantity = 0;
        this._seed_creeper_quantity = 0;
        this._seed_ivy_quantity = 0;
    }
    // pour mettre a jour l'interface
    public isUpdate(): boolean { 
        if (this.ui_need_update) {
            this.ui_need_update = false;
            return true;
        }
        return false;
    }
    
    // pour debug
    public give10() {
        this._seed_vine_quantity = 10;
        this._seed_coconut_quantity = 10;
        this._seed_wall_quantity = 10;
        this._seed_jump_quantity = 10;
        this._seed_waterlily_quantity = 10;
        this._seed_creeper_quantity = 10;
        this._seed_ivy_quantity = 10;
        this.ui_need_update = true;
    }
    // throw seed
    public fire(index: number): boolean{
        if (index < 0 || index > 6) return false;
        let rv = true;
        switch (index) {
            case 0:
                if (this._seed_vine_quantity > 0) {
                    this._seed_vine_quantity -= 1;
                }else rv = false;
                break;
            case 1:
                if (this._seed_coconut_quantity > 0) {
                    this._seed_coconut_quantity -= 1;
                }else rv = false;
                break;
            case 2:
                if (this._seed_wall_quantity > 0) {
                    this._seed_wall_quantity -= 1;
                }else rv = false;
                break;
            case 3:
                if (this._seed_jump_quantity > 0) {
                    this._seed_jump_quantity -= 1;
                }else rv = false;
                break;
            case 4:
                if (this._seed_waterlily_quantity > 0) {
                    this._seed_waterlily_quantity -= 1;
                }else rv = false;
                break;
            case 5:
                if (this._seed_creeper_quantity > 0) {
                    this._seed_creeper_quantity -= 1;
                }else rv = false;
                break;
            case 6:
                if (this._seed_ivy_quantity > 0) {
                    this._seed_ivy_quantity -= 1;
                }else rv = false;
                break;
            default:
                rv = false; 
                break;
        }
        if(rv)
            this.ui_need_update = true;
        return rv;
    }
    public collect(index: number, quantity: number): boolean {
        if (quantity <= 0) return false;
        if (index < 0 || index > 6) return false;
        switch (index) {
            case 0:
                this._seed_vine_quantity += quantity;
                break;
            case 1:
                this._seed_coconut_quantity += quantity;
                break;
            case 2:
                this._seed_wall_quantity += quantity;
                break;
            case 3:
                this._seed_jump_quantity += quantity;
                break;
            case 4:
                this._seed_waterlily_quantity += quantity;
                break;
            case 5:
                this._seed_creeper_quantity += quantity;
                break;
            case 6:
                this._seed_ivy_quantity += quantity;
                break;
            default:
                break;
        }
        this.ui_need_update = true;
        return true;
    }
    // get ammo number by index
    public getAmmo(index: number): number {
        if (index < 0 || index > 6) return 0;
        switch (index) {
            case 0:
                return this._seed_vine_quantity;
            case 1:
                return this._seed_coconut_quantity;
            case 2:
                return this._seed_wall_quantity;
            case 3:
                return this._seed_jump_quantity;
            case 4:
                return this._seed_waterlily_quantity;
            case 5:
                return this._seed_creeper_quantity;
            case 6:
                return this._seed_ivy_quantity;
            default:
                return 0;
        }
    }
}