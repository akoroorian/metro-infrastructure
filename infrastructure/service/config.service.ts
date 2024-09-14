import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, Subscription, tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    environmentSubscription!: Subscription;
    initialize(): Observable<any> {
        return this.httpClient.get('assets/environment.json')
            .pipe(
                tap((env: any) => {
                    this.environment = env;
                    this.isLoading = false;
                })
            );
    }
    environment!: {
        production: boolean,
        apiUrl: string,
        reportUrl: string,
        getRetryCount: number,
        defaultPageSize: number
    };
    isLoading: boolean = true;
    constructor(protected httpClient: HttpClient) {

    }
}