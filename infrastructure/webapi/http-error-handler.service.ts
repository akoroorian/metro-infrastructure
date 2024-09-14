import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from '../service/message.service';
import { QuestionChoiceType } from '../domain/enum/question-choice-type';

/** Type of the handleError function returned by HttpErrorHandler.createHandleError */
export type HandleError =
  <T> (operation?: string, result?: T) => (error: HttpErrorResponse) => Observable<T>;

/** Handles HttpClient errors */
@Injectable({ providedIn: 'root' })
export class HttpErrorHandler {
  constructor(private messageService: MessageService, private router: Router) { }

  /** Create curried handleError function that already knows the service name */
  createHandleError = (serviceName = '') => {
    return <T>(operation = 'operation', result = {} as T) =>
      this.handleError(serviceName, operation, result);
  }

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(serviceName = '', operation = 'operation', result = {} as T) {

    return (error: HttpErrorResponse): Observable<T> => {
      if ((error.status == 400 || error.status == 500) && error.url?.endsWith("Authentication"))
        window.location.href = `https://sso.metro.com?returnurl=${window.location}`;

      if (error.status == 401)
        this.router.navigate(["/unauthorized"]);

      let message: string | undefined;
      message = error.error?.message;

      if (error.status == 403)
        message = `دسترسی انجام این کار را ندارید.`;

      if (!message) {
        message = `بروز خطا: ${error.status}: ${serviceName}: ${operation}: ${error.error}`;
      }

      this.messageService.send({ text: message, type: QuestionChoiceType.error });
      // console.error(`failed: ${message}`);

      result = (error.error as T) ?? result;

      return of(result);
    };

  }
}
