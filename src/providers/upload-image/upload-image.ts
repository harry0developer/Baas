import { Injectable } from '@angular/core';
import { Events, Platform, Loading, ActionSheetController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { DataProvider } from '../data/data';

declare var cordova: any;

@Injectable()
export class UploadImageProvider {
  uploads: string = '';
  url: any;
  imgError: boolean = false;
  lastImage: string = null;
  loading: Loading;
  base64: any;

  constructor(public actionSheetCtrl: ActionSheetController, private camera: Camera,
    private transfer: Transfer, private file: File, private filePath: FilePath, 
    public platform: Platform, public dataProvider: DataProvider, public ionicEvents: Events) {
      this.url = this.dataProvider.getDBLink();
      this.uploads = this.dataProvider.getMediaLink();
  }



  public presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select image source',
      buttons: [
        {
          text: 'Load from Library',
          icon: 'folder',
          cssClass: 'icon-folder',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          icon: 'camera',
          cssClass: 'icon-camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  public takePicture(sourceType) {
    var options = {
      quality: 75,
      allowEdit: true,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      targetHeight: 300,
      targetWidth: 300
    };
   
    this.camera.getPicture(options).then((imagePath) => {
      this.base64 = imagePath;
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.dataProvider.presentToast('Error while selecting image.');
    });
  }  


  private createFileName() {
    var d = new Date(),
    n = d.getTime(),
    newFileName =  n + ".jpg";
    return newFileName;
  }
  
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
      this.uploadImage();
    }, error => {
      this.dataProvider.presentToast('Error while storing file.');
    });
  }
  
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }

  public uploadImage() {
    const profile = JSON.parse(localStorage.getItem("user"));
    let obj = {"email": profile.email, "url": ""};
    var url = this.url+'uploadProfilePicture';
    var targetPath = this.pathForImage(this.lastImage);
    var filename = this.lastImage;
    var options = {
      fileKey: "file",
      fileName: filename,
      chunkedMode: false,
      mimeType: "multipart/form-data",
      params : {'fileName': filename}
    };
    const fileTransfer: TransferObject = this.transfer.create();
  
    this.dataProvider.presentLoading('Uploading to server...');

    fileTransfer.upload(targetPath, url, options).then(data => {
      this.dataProvider.dismissLoading();
      obj.url = data.response;
      this.updatePictureUrl(obj);
    }, err => {
      this.dataProvider.dismissLoading();
      this.dataProvider.presentToast('Error while uploading file.');
    });
  }


  updatePictureUrl(obj){
    let profile = this.dataProvider.getMyProfile();
    this.dataProvider.presentLoading('Please wait, updating profile...');
    let res;
    this.dataProvider.postData(obj,'updatePictureUrl').then((result) => {
      res = result;
      if(res && res.error){
        this.dataProvider.dismissLoading();
        this.dataProvider.presentToast("Error occured, profile not changed, try again later");
      }else{
        this.dataProvider.dismissLoading();
        profile.picture = obj.url;
        localStorage.setItem('loginData', JSON.stringify(profile));
        this.ionicEvents.publish("user:profileChanged", profile);
        this.lastImage = null;
        this.dataProvider.presentToast("Profile changed succefully");
      }
    }, (err) => { 
      console.log(err);
      this.dataProvider.dismissLoading();
    });
  }
  
}
