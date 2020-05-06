import { Subject } from 'rxjs';

export enum MessageType {
    Insert, 
    Update,
    Delete,
    Error,
    Info,
    Warning
}
export interface UserMessageData {

    element?: any;
    message?: string;
    errorMessage?: string;
    error?: any;
    messageType?: MessageType;
}

//@Injectable({providedIn:"root"})
export class UserMessageService {
    
    private messageSubj = new Subject<any>();

    get onMessage() {
        return this.messageSubj.asObservable();
    }

    message(messageData: UserMessageData) {
        this.messageSubj.next(messageData);
    }
}