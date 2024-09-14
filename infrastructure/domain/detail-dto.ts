import { DtoActionType } from "./enum/dto-action-type";
import { MetroBaseDto } from "./metro-base.dto";

export class DetailDto<D extends MetroBaseDto | undefined> {
    action: DtoActionType = DtoActionType.None;
    dtl!: D;
}