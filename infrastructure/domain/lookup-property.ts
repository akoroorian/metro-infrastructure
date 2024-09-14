import { Type } from "@angular/core";

export class LookUpProperty {
    type!: Type<any>;
    field!: string;
    related?: string[];
    public constructor(init?: Partial<LookUpProperty>) {
        Object.assign(this, init);
    }
}