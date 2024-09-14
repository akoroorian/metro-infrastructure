import { Injectable, inject } from "@angular/core";
import { UserIdentity } from "../domain/user-identity";
import { HandleError } from "../webapi/http-error-handler.service";
import { HttpClient } from "@angular/common/http";
import { ConfigService } from "./config.service";
import { ServiceResult } from "../domain/service-result";

@Injectable({
    providedIn: 'root'
})
export class FileService {
    // private handleError!: HandleError;
    private readonly httpClient: HttpClient = inject(HttpClient);
    // private apiUrl!: string;

    constructor(private configService: ConfigService) {
    }

    post(file: File, title: string | undefined = undefined, remark: string | undefined = undefined) {
        const formData = new FormData();
        formData.append("file", file);
        return this.httpClient.post<ServiceResult<any>>(this.configService.environment.apiUrl + `file?title=${title ?? "test"}&remark=${remark ?? "test"}`, formData);
    }
}