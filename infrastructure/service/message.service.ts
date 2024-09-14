import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { QuestionChoiceType } from '../domain/enum/question-choice-type';
import { SystemMessage } from '../domain/system-message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private subject = new Subject<SystemMessage | undefined>();
  public get messages() {
    return this.subject.asObservable();
  }

  send(message: SystemMessage) {
    this.subject.next(message);
  }

  clear() {
    this.subject.next(undefined);
  }

}

