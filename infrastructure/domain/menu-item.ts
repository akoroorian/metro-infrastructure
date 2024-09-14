export class MenuItem {
    id!: number;
    title!: string;
    href?: string;
    subMenu?: MenuItem[];
    isOpen?: boolean = false;
    resource?: string;
    public constructor(init?: Partial<MenuItem>) {
        Object.assign(this, init);
    }
}