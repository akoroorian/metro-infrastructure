import { DetailDto } from "./detail-dto";
import { MetroBaseDto } from "./metro-base.dto";

export class MasterDetailDto<M extends MetroBaseDto, D extends MetroBaseDto, D2 extends MetroBaseDto | undefined, D3 extends MetroBaseDto | undefined>{
    master!: M;
    details?: DetailDto<D>[]
    details2?: DetailDto<D2>[]
    details3?: DetailDto<D3>[]
}