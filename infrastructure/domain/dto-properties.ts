import { ColumnAction } from "./column-action";
import { LookUpProperty } from "./lookup-property";

export class DtoProperties {
    title?: string;
    reportId?: number;
    columns?: ColumnProperty[];
    rowClassFunction?: (dto: any) => string;
    public constructor(init?: Partial<DtoProperties>) {
        Object.assign(this, init);
    }
}

export class ColumnProperty {
    isKey?: boolean = false;
    name!: string;
    title!: string;
    type!: 'string' | 'number' | 'datetime' | 'action' | 'bool' | 'file' | 'pic';
    enum?: Record<string, string | number>;
    lookup?: LookUpProperty;
    format?: string;
    width: number = 128;
    span: number = 4;
    visible: boolean = true;
    disabled: boolean = false;
    readonly: boolean = false;
    action?: ColumnAction[];
    listOptions?: Partial<ColumnOptions>;
    detailListOptions?: Partial<ColumnOptions>;
    editOptions?: Partial<ColumnOptions>;
    insertOptions?: Partial<ColumnOptions>;
    dir?: 'rtl' | 'ltr';
    public constructor(init?: Partial<ColumnProperty>) {
        Object.assign(this, init);
    }
}

export class ColumnOptions {
    title?: string;
    width?: number;
    span?: number;
    visible?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    action?: ColumnAction[];
}
