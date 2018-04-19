import { Directive } from '@angular/core';
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Directive({
  selector: 'validator'
})
export class ValidatorDirective {
  constructor(){}

  validateEmail(control: FormControl){
     return new Promise(resolve => {
        let emailPattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        if(!emailPattern.test(control.value))
        {
           resolve({ InvalidEmail : true });
        }
        resolve(null);
     });
  }


}
