import { Component, Inject, InjectionToken, OnDestroy, OnInit, inject } from '@angular/core';
import { MetroBaseDto } from '../domain/metro-base.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { IMetroBaseService } from '../service/metro-base-service.interface';
import { QuestionChoiceType } from '../domain/enum/question-choice-type';
import { Observable, bindCallback, map, of, tap } from 'rxjs';
import { UnsavedChangesGuard } from '../guard/unsaved-changes.guard';

const serviceInjector = new InjectionToken<IMetroBaseService<MetroBaseDto>>('serviceInjector');

@Component({
    selector: 'app-detail-base-page',
    standalone: true,
    imports: [],
    template: ''
})
export abstract class BasePageComponent<TDto extends MetroBaseDto> implements OnInit, OnDestroy {
    protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    protected router: Router = inject(Router);
    route: ActivatedRoute = inject(ActivatedRoute);    
    protected question = { showQuestion: false, question: "", choices: [{ id: 0, choice: "", type: QuestionChoiceType.normal }], callBack: (choiceId: number) => { } };
    private guard = (component: any) => inject(UnsavedChangesGuard).canDeactivate(component);
    confirmedToLeave: boolean = false;
    constructor(@Inject(serviceInjector) protected service: IMetroBaseService<TDto>) {
        if (this.activatedRoute.routeConfig) {
            if (!this.activatedRoute.routeConfig.canDeactivate)
                this.activatedRoute.routeConfig.canDeactivate = [];
            this.activatedRoute.routeConfig.canDeactivate!.push(this.guard);
        }
    }

    protected hasUnsavedChanges(): boolean {
        throw new Error('Method not implemented.');
    }

    private confirmToLeave(): Observable<boolean> {
        if (this.confirmedToLeave)
            return of(true);
        return this.askQuestionObservable("آیا از خروج بدون ذخیره تغییرات اطمینان دارید؟", [{ id: 1, choice: "بله", type: QuestionChoiceType.normal }, { id: 2, choice: "خیر", type: QuestionChoiceType.error }])
            .pipe(
                map(choiceId => choiceId === 1),
                tap(confirmed => { this.confirmedToLeave = confirmed; })
            );
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        if (this.activatedRoute.routeConfig?.canDeactivate) {
            this.activatedRoute.routeConfig.canDeactivate = [
                ...this.activatedRoute.routeConfig.canDeactivate?.filter(guard => guard !== this.guard)
            ];
        }
    }

    back() {
        if (this.hasUnsavedChanges()) {
            this.confirmToLeave()
                .subscribe((choice) => {
                    if (choice === true) {
                        this.navigateBack();
                    }
                });
        }
        else
            this.navigateBack();
    }

    private navigateBack() {
        let path = this.route.routeConfig && this.route.routeConfig.data ? this.route.routeConfig.path : '';
        const lastRoutePart = path?.split('/').pop();
        let isDynamicRoute = lastRoutePart?.startsWith(':');
        let backRoute = `${isDynamicRoute ? '../' : ''}../`;
        this.router.navigate([backRoute], { relativeTo: this.activatedRoute })
    }

    private askQuestion = (question: string, choices: { id: number, choice: string, type: QuestionChoiceType }[], callBack: (choiceId: number) => void) => {
        this.question = { showQuestion: true, question: question, choices: choices, callBack: callBack };
    }

    protected askQuestionObservable(question: string, choices: { id: number, choice: string, type: QuestionChoiceType }[]): Observable<number> {
        const boundCallbackFunction = bindCallback(this.askQuestion);
        return boundCallbackFunction(question, choices);
    }

    protected onChoosed(choiceId: number) {
        this.question.showQuestion = false;
        this.question.callBack(choiceId);
    }
}
