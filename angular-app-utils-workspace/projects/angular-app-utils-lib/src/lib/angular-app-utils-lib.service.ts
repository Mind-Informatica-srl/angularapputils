import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AngularAppUtilsLibService {

  helloString: string = "Ciao libreria!";
  
  constructor() { }
}
