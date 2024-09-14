import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { AuthService } from "../service/auth.Service";
import { Observable, catchError, switchMap, throwError } from "rxjs";
import { ConfigService } from "../service/config.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private isRefreshing = false;

    constructor(private authService: AuthService, private configService: ConfigService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Add authentication token to the request headers
        if (this.configService.isLoading) {
            return next.handle(request);
        }

        const token = this.authService.getToken();
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        return next.handle(request)
            .pipe(
                catchError((error) => {
                    if (
                        error instanceof HttpErrorResponse &&
                        !request.url.includes('login') &&
                        error.status === 401
                    ) {
                        return this.handle401Error(request, next);
                    }
                    return throwError(() => error);
                })
            );
    }

    // inspired by: https://www.bezkoder.com/angular-17-refresh-token/
    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;

            if (this.configService.isLoading) {
                return next.handle(request);
            }

            return this.authService.refreshToken().pipe(
                switchMap(() => {
                    this.isRefreshing = false;

                    return next.handle(request);
                }),
                catchError((error) => {
                    this.isRefreshing = false;

                    return throwError(() => error);
                })
            );
        }

        return next.handle(request);
    }

}