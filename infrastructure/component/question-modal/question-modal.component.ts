import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuestionChoiceType } from '../../domain/enum/question-choice-type';

@Component({
  selector: 'app-question-modal',
  standalone: true,
  imports: [],
  templateUrl: './question-modal.component.html',
  styleUrl: './question-modal.component.css'
})
export class QuestionModalComponent {
  @Input()
  question = { showQuestion: false, question: "", choices: [{ id: 0, choice: "", type: QuestionChoiceType.normal }] };
  @Output() onChoosed = new EventEmitter<number>();

  choosed(choiceId: number) {
    this.onChoosed.emit(choiceId);
  }

  getChoiceClass(choice: { id: number; choice: string; type: QuestionChoiceType; }) {
    switch (choice.type) {
      case QuestionChoiceType.error:
        return "px-2 py-1 text-red-500 border border-red-500 rounded-md hover:text-slate-50 hover:bg-red-500 transition-all";
      default: {
        return "px-2 py-1 text-green-500 border border-green-500 rounded-md hover:text-slate-50 hover:bg-green-500 transition-all";
      }
    }
  }

}
