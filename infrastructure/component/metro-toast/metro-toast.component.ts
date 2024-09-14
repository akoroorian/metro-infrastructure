import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '../../service/message.service';
import { SystemMessage } from '../../domain/system-message';
import { Subscription } from 'rxjs';
import { QuestionChoiceType } from '../../domain/enum/question-choice-type';

@Component({
  selector: 'app-metro-toast',
  standalone: true,
  imports: [],
  templateUrl: './metro-toast.component.html',
  styleUrl: './metro-toast.component.css'
})
export class MetroToastComponent implements OnInit, OnDestroy {
  messageServiceSubscription!: Subscription;
  messages: SystemMessage[] = [];
  QuestionChoiceType = QuestionChoiceType;
  constructor(private messageService: MessageService) {
  }

  showToast(message?: SystemMessage) {
    if (message) {
      this.messages?.push(message);
      setTimeout(() => { this.close(message); }, 3000);
    }
    else
      this.messages = [];
  }

  close(message: SystemMessage) {
    let index = this.messages.indexOf(message);
    this.messages.splice(index, 1);
  }

  ngOnInit(): void {
    this.messageServiceSubscription = this.messageService.messages.subscribe((message) => this.showToast(message));
  }

  ngOnDestroy(): void {
    this.messageServiceSubscription.unsubscribe();
  }

}
