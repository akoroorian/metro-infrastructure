import { ColumnProperty, DtoProperties } from "./dto-properties";
import { MetroBaseDto } from "./metro-base.dto";

export class SystemWorkFlowRecordDto extends MetroBaseDto {
    id?: number;
    fromWorkFlowStateId?: number;
    toWorkFlowStateId?: number;
    fromUserId?: number;
    toUserId?: number;
    description?: string;
    relatedKey?: number;
    resourceId?: number;
    createdDateTime?: string;
    toStateTitle?: string;
    fromPersName?: string;
    fromPersSurName?: string;
    toPersName?: string;
    toPersSurName?: string;
    static getProperties(): DtoProperties {
        return new DtoProperties({
            title: 'سابقه گردش کار',
            columns: [
                new ColumnProperty({ name: 'fromUser', title: 'اقدام کننده', type: 'string' , width: 240 }),
                new ColumnProperty({ name: 'toUser', title: 'گیرنده', type: 'string', width: 240 }),
                new ColumnProperty({ name: 'description', title: 'توضیحات', type: 'string' , width: 260}),
                new ColumnProperty({ name: 'createdDateTime', title: 'زمان', type: 'datetime', width: 160 }),
                new ColumnProperty({ name: 'toStateTitle', title: 'وضعیت', type: 'string' , width: 200}),
            ],
        });
    }
}
