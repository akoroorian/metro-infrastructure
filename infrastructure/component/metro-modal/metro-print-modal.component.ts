import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ConfigService } from '../../service/config.service';
import { SafePipe } from '../../pipe/safe.Pipe';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-metro-print-modal',
  standalone: true,
  imports: [SafePipe, LoadingSpinnerComponent],
  templateUrl: './metro-print-modal.component.html',
  styleUrl: './metro-print-modal.component.css'
})
export class MetroPrintModalComponent {

  loading: boolean = true;
  @Input()
  public get repUrl(): string | undefined {
    if (this.configService.environment?.reportUrl && this.repRequestId)
      return this.configService.environment.reportUrl + `?id=${this.repRequestId}`;
    else return undefined;
  }
  @Input() repRequestId?: string;
  @Input() title?: string;
  @Output() printModalClosed = new EventEmitter();
  protected configService = inject(ConfigService);

  constructor() {
  }

  canceledSelection() {
    this.printModalClosed.emit();
  }

  onload() {
    this.loading = false;
  }

}
