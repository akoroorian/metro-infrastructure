import { Component, EventEmitter, InjectionToken, Input, OnInit, Output, inject } from '@angular/core';
import { MetroDataGridComponent } from '../../metro-data-grid/metro-data-grid.component';
import { MetroBaseDto } from '../../../domain/metro-base.dto';
import { Observable } from 'rxjs';
import { ServiceResult } from '../../../domain/service-result';
import { ColumnProperty, DtoProperties } from '../../../domain/dto-properties';
import { RequestFiltering, RequestPaging, RequestParams } from '../../../domain/request-params';
import { ReactiveFormsModule } from '@angular/forms';
import { IMetroBaseService } from '../../../service/metro-base-service.interface';
import { ConfigService } from '../../../service/config.service';

const serviceInjector = new InjectionToken<IMetroBaseService<MetroBaseDto>>('serviceInjector');

@Component({
    selector: 'MetroModalListComponent',
    standalone: true,
    imports: [MetroDataGridComponent, ReactiveFormsModule, ReactiveFormsModule],
    templateUrl: './metro-modal-list.component.html',
    styleUrl: './metro-lookup.component.css'
})
export class MetroModalListComponent implements OnInit {
    private configService = inject(ConfigService);
    public static readonly searchableTypes = ['string', 'number', 'datetime', 'bool', 'enum'];
    serviceResult$?: Observable<ServiceResult<any[]>>;
    requestParamPart: Partial<RequestParams> = { paging: new RequestPaging({ pageNumber: 1, pageSize: this.configService.environment.defaultPageSize }) };
    @Input() title?: string;
    @Input() defaultRequestFiltering?: Partial<RequestFiltering>;
    @Input() properties!: DtoProperties;
    @Input() selectedRow?: any;
    @Input() getList?: (requestParamPart?: Partial<RequestParams>) => Observable<ServiceResult<MetroBaseDto[]>>;
    @Output() modalListSelected = new EventEmitter<any>();
    @Output() modalListCanceled = new EventEmitter();

    ngOnInit(): void {
        let cols = this.properties.columns?.filter(col => MetroModalListComponent.searchableTypes.includes(col.type));
        this.properties.columns = [];
        cols?.forEach(column => {
            let newColumn: ColumnProperty = new ColumnProperty();
            Object.assign(newColumn, column);
            Object.assign(newColumn, column.listOptions);
            this.properties.columns?.push(newColumn);
        });

        this.fetch(this.requestParamPart);
    }

    fetch(requestParamPart: Partial<RequestParams>) {
        this.requestParamPart = requestParamPart;
        const requestParams = new RequestParams(this.requestParamPart);

        if (this.defaultRequestFiltering?.conditions) {
            if (!requestParams.filtering)
                requestParams.filtering = new RequestFiltering(this.defaultRequestFiltering);
            else
                requestParams.filtering.conditions.push(...this.defaultRequestFiltering.conditions);
        }

        if (this.getList)
            this.serviceResult$ = this.getList(requestParams);
    }

    itemSelected() {
        this.modalListSelected.emit(this.selectedRow);
    }

    canceledSelection() {
        this.selectedRow = undefined;
        this.modalListCanceled.emit();
    }

    getValue(item: any | undefined, propName: string | undefined) {
        return (item as any) && (propName) ? (item as any)[propName] : undefined;
    }
}