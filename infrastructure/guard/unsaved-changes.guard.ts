import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UnsavedChangesGuard {
    canDeactivate(component: any): Observable<boolean> | boolean {
        if (component.hasUnsavedChanges && component.confirmToLeave && component.hasUnsavedChanges()) {
            // Prompt the user to confirm leaving the page or perform other checks
            return component.confirmToLeave();
        }
        return true;
    }
}