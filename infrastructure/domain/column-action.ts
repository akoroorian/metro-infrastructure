import { DetailDto } from "./detail-dto";
import { MetroBaseDto } from "./metro-base.dto";

export class ColumnAction {
    func!: (item: any) => void;
    name!: string;
}
