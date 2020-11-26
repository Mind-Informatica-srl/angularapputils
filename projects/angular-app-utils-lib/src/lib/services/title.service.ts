import { BehaviorSubject, Observable } from 'rxjs';

//@Injectable({providedIn: 'root'})
export class TitleService {
    private titleSub = new BehaviorSubject<string>('');
    title: Observable<string>;

    constructor() {
        this.title = this.titleSub.asObservable();
    }

    /**
     * @param value nuovo titolo da aggiornare
     */
    updateTitle(value: string) {
        this.titleSub.next(value);
    }
    
}