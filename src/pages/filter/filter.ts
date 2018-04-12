import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { DataProvider } from '../../providers/data/data';
 

@IonicPage()
@Component({
  selector: 'page-filter',
  templateUrl: 'filter.html',
})
export class FilterPage {
  type: any;
  filter: any;
  page: string;
  categories: any;

  settings: any = {distance: 0, type: '' };
  salary: any = {lower: 500, upper: 4000};
  constructor(public navCtrl: NavController, public dataProvider: DataProvider,public navParams: NavParams, public viewCtrl: ViewController) {
  }

  ionViewDidLoad(){
    this.filter = this.navParams.get('filter');
    if(!this.filter){
      this.filter = JSON.parse(localStorage.getItem('filter'));
    }

    if(this.filter != null && this.filter.salary){
      this.settings.distance = this.filter.distance;
      this.settings.type = this.filter.type;
      this.salary.lower = this.filter.salary.lower;
      this.salary.upper = this.filter.salary.upper;
    }else{
      this.settings.distance = 0;
      this.salary = {lower: 0, upper: 4000};
    }
  }

  cancel(){
    this.viewCtrl.dismiss(this.filter);
  } 

  selectCategory(cat){
    this.viewCtrl.dismiss(cat.name);
  }

  applyFilter(){
    const data = {
      distance: this.settings.distance,
      type: this.settings.type,
      salary: this.salary,
    }
    this.viewCtrl.dismiss(data);
  }

  clearFilter(){
    this.viewCtrl.dismiss(null);
  }

}
