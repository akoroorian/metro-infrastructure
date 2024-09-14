import { Injectable, inject } from "@angular/core";
import { UserIdentity } from "../domain/user-identity";
import { HandleError } from "../webapi/http-error-handler.service";
import { LocalStorageService } from "./local-storage.service"
import { HttpClient } from "@angular/common/http";
import { of, tap } from "rxjs";
import { ConfigService } from "./config.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public identity?: UserIdentity;
    private handleError!: HandleError;
    private readonly httpClient: HttpClient = inject(HttpClient);
    private apiUrl!: string;

    constructor(protected storage: LocalStorageService, private configService: ConfigService) {
    }

    getToken() {
        this.identity = this.identity ?? this.storage.get("UserIdentity");
        return this.identity?.token;
    }

    setToken(identity?: UserIdentity) {
        this.storage.set("UserIdentity", identity);
        this.identity = identity;
    }

    setTokenTest() {
        if (this.configService.environment.production === true)
            return;

        this.httpClient.get<UserIdentity>(this.apiUrl).subscribe(token => {
            this.setToken(token);
        });
    }

    refreshToken() {
        this.apiUrl = this.configService.environment.apiUrl.endsWith("/") ? this.configService.environment.apiUrl : this.configService.environment.apiUrl + "/";
        this.apiUrl += "Authentication";

        if (this.configService.environment.production === false) {
            this.setTokenTest();
            return of(true);
        }
        else
            return this.httpClient.post<any>(this.apiUrl, undefined)
                .pipe(
                    tap(result => {
                        this.setToken(result.result);
                        this.getToken();
                    })
                );
    }

    isLoggedIn() {
        return this.getToken() ? true : false;
    }
}