import { Component } from '@angular/core';
import { DataProvider } from '../../providers/data/data';
import { IonicPage, NavController, NavParams, Events, ModalController } from 'ionic-angular';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { UploadImageProvider } from '../../providers/upload-image/upload-image';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  profile: any; //me
  ratings: any; 
  applied: boolean; 
  lastImage: string = null;
  uploads: string = '';
  url: string;
  constructor(public navCtrl: NavController, public dataProvider: DataProvider,
    public ionEvents: Events, public navParams: NavParams, public modalCtrl: ModalController,
    public uploadImageProvider: UploadImageProvider) {
      this.lastImage = uploadImageProvider.lastImage;
      this.uploads = this.dataProvider.getMediaLink();
  }

  ionViewDidLoad() { 
    this.profile = JSON.parse(localStorage.getItem('user'));
    this.ionEvents.subscribe('user:profileChanged', (profile ) => {
      console.log("User profile updated"); 
      this.profile = profile;
    });
  }
 

  editProfile(){
    let editProfile = this.modalCtrl.create(EditProfilePage, {user:this.profile});
    editProfile.onDidDismiss(data => {
      if(data){
        let res;
        let updatedData = {address: data.address, lat:data.lat, lng: data.lng, phone: data.phone, user_id: data.user_id};
        this.dataProvider.postData(updatedData, 'updateProfile').then(results => {
          res = results;
          console.log(res.data);
          if(res && res.data && res.data.length > 0){
            localStorage.setItem('user', JSON.stringify(res.data[0]));
            console.log(localStorage);
          }
          else{
            console.log(res.error);
          }
        }).catch(err => {
          console.log(err);
        })
      }
    });
    editProfile.present();
  } 
 
  presentUploadImageActionSheet() {
    this.uploadImageProvider.presentActionSheet();
  }
 
}
