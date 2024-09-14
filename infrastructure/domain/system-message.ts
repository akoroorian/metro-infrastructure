import { QuestionChoiceType } from "./enum/question-choice-type";

export class SystemMessage {
    type!: QuestionChoiceType;
    text!: string;
  }