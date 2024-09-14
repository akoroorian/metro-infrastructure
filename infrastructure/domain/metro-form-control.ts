import { FormControl } from "@angular/forms";
import { ColumnProperty } from "./dto-properties";

export class MetroFormControl {
    control!: FormControl;
    column?: ColumnProperty;
    public constructor(init?: Partial<MetroFormControl>) {
        Object.assign(this, init);
    }
}