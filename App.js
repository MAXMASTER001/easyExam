import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Linking,
  Picker,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Platform,
  NativeModules,
  ScrollView,
} from 'react-native';


import Base64 from 'base-64';
import Swiper from 'react-native-swiper';
import axios from 'axios';

import DeviceInfo from 'react-native-device-info';

import ImagePickerIos from 'react-native-image-picker';

import ImagePickerAndroid from 'react-native-image-crop-picker';

import ImageResizer from 'react-native-image-resizer';

import Spinner from './src/components/Spinner';
//import EmailPassword from './src/components/EmailPassword';
import Button from './src/components/Button';
import Soru from './src/soru';
import liste from './src/dersler.json';
import SoruBox from './src/components/SoruBox';
import { bugun } from './src/yararli/yararli';

 const size = {
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width,
    };

const borderColor = '#e74c3c';

const { ReactNativeImageCropping } = NativeModules;

export default class sorugonder extends Component {
  constructor() {
    super();
    const deviceId = DeviceInfo.getUniqueID();
   

    this.state = {
      width: size.width,
      height: size.height,
      photosTaken: [],
      uploadProgress: 0,
      ders: 'ders seç',
      kksAdi: '',
      user_folder: deviceId,
      zoom: 100,
      okul: {
        ad: 'Deneme',
        tur: 'Anadolu Lisesi',
      },
      sinav: {
        donemNo: '1',
        yaziliNo: '1',
      },
      sendingQuestions: false,
    };
  }


  soruEkle(imageUri) {
    const resimler = this.state.photosTaken;
    resimler.push(new Soru(imageUri, 'X'));
    this.setState({
      photosTaken: resimler,
    });
  }

  kksOlustur() {
    return new Promise((resolve, reject) => {
      const data = new FormData();

      data.append('user_folder', this.state.user_folder);

      data.append('kksAdi', this.state.kksAdi);

      const kksKod = Base64.encode(
        this.state.user_folder + '|' + this.state.user_folder,
      );

      axios
        .post(
          'http://ortaksinav.net/hazine00/KKSOGRETMEN/react_kks_olustur.php',
          data,
        )
        .then(response => {
          console.log(response);
          resolve('sınavınız oluşturuldu');
          //this.swiper.scrollBy(1);
        })
        .catch(error => {
          console.log(error);
          reject('sınav oluşturulamadı. Internet bağlantınızı kontrol edin!');
        });
    });
  }

  gonderPromise() {
    return new Promise((resolve, reject) => {
      const config = {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round(
            progressEvent.loaded * 100 / progressEvent.total,
          );
          this.setState({ uploadProgress: percentCompleted });
        },
      };

      const data = new FormData();

      let i = 1;
      for (const resim of this.state.photosTaken) {
        data.append('files[]', {
          uri: resim.imageUri,
          name: i + '_image-' + resim.cevap + '.jpeg',
          type: 'image/jpeg',
        });
        i++;
      }

      // bu kksName aslında kkskodu oluyor.
      data.append('kksName', this.state.kksAdi);

      data.append('user_folder', this.state.user_folder);
      // sorular gönderilirken serverdaki soruların silinerek yüklenmesi için.
      data.append('sil', false);

      // bir defada gönderilecek soruların ait olduğu ders
      if (this.state.ders !== 'ders seç') {
        data.append('ders', this.state.ders);
      } else {
        alert('ders seçimi yapmalısınız');
        return;
      }

      axios
        .post(
          'http://ortaksinav.net/hazine00/KKSOGRETMEN/react_ogretmen_yukle.php',
          data,
          config,
        )
        .then(response => {
          console.log(response);
          resolve('succesfuly uploaded');
        })
        .catch(error => {
          console.log(error);
          reject('unsuccesful upload!');
        });
    });
  }

  pdfOlustur() {
    return new Promise((resolve, reject) => {
      const config = {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round(
            progressEvent.loaded * 100 / progressEvent.total,
          );
          this.setState({ uploadProgress: percentCompleted });
        },
      };

      const data = new FormData();
      const a = this.state.kksAdi;
      const inS = a.indexOf(' ', a.length / 2); // stringin ortasından itibaren ilk boşluk
      const b = a.substring(inS);
      const c = a.replace(b, '');
      const okulAdi = `${this.state.okul.ad}\n${this.state.okul
        .tur}\n${c}\n${b}`;
      data.append('okul_adi', okulAdi);
      data.append('dizilim', '41,51');
      data.append('tarih_istenen', bugun());
      //console.log('gönderilen ders sirasi ??? ' + this.state.ders);
      data.append('derssirasi', this.state.ders);
      data.append('user_folder', this.state.user_folder);
      data.append('kksAdi', this.state.kksAdi);
      axios
        .post(
          'http://ortaksinav.net/hazine00/KKSOGRETMEN/react_pdfbas.php',
          data,
          config,
        )
        .then(response => {
          console.log(response);

          //alert(this.state.kksAdi);
          resolve('pdf created');
        })
        .catch(error => {
          console.log(error);
          reject('pdf couldnt be created');
        });
    });
  }

  renderImages() {
    const resimler = this.state.photosTaken;
    const imgler = [];

    for (let i = 0, len = resimler.length; i < len; i++) {
      imgler.push(
        <SoruBox
          cevap={resimler[i].cevap}
          imageSource={{ uri: resimler[i].imageUri }}
          onChangeText={text => {
            this.state.photosTaken[i].cevap = text;
            this.setState({ });
          }}
        />,
      );
    }
    return imgler;
  }
  renderIcons() {
    if (Platform.OS === 'ios') {
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => this.soruSecIos()}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
              
            }}
          >
            <Image
              style={{ width: 100, resizeMode: 'contain' }}
              source={require('./src/images/cam.png')}
            />
          </TouchableOpacity>
        </View>
      );
    }

    if (Platform.OS === 'android') {
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => this.soruSecAndroid('camera')}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
            
            }}
          >
            <Image
              style={{ width: 100, resizeMode: 'contain' }}
              source={require('./src/images/cam.png')}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.soruSecAndroid('gallery')}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 100,
              height: 100,
             
            }}
          >
            <Image
              style={{ width: 100, resizeMode: 'contain' }}
              source={require('./src/images/gal.png')}
            />
          </TouchableOpacity>
        </View>
      );
    }
  }
  linkPdf() {
    Linking.openURL(
      'http://www.ortaksinav.net/hazine00/KKSOGRETMEN/KKS_FOLDER/' +
        this.state.user_folder +
        '/' +
        this.state.kksAdi +
        '/' +
        this.state.kksAdi +
        'A.pdf',
    );
  }
  
  onKksOlustur() {
    this.setState({ sendingQuestions: true });
    this.kksOlustur()
      .then(() =>
        this.gonderPromise()
          .then(() => {
            this.pdfOlustur()
              .then(this.linkPdf.bind(this))
              .catch(mesaj => alert('pdf oluşturulamadı'));
            this.setState({ sendingQuestions: false });
          })
          .catch(mesaj => alert(mesaj)),
      )
      .catch(mesaj => alert(mesaj));
  }
    kucult(response, shrink = true) {
    const uri = Platform.OS === 'ios' ? response.uri : response.path;
    if (shrink) {
      ImageResizer.createResizedImage(
        uri,
        400, //width
        300, //height
        'JPEG',
        80, //quality
      )
        .then(resizedImageUri => {
          // resizeImageUri is the URI of the new image that can now be displayed, uploaded...
          // console.log('bıdı bıdı');

          this.soruEkle(resizedImageUri);
        })
        .catch(err => {
          // Oops, something went wrong. Check that the filename is correct and
          // inspect err to get more details.

          console.log('hata oldu' + err);
        });
    } else {
      alert('küçültme yapılmadı');

      if (Platform.OS === 'ios') {
        this.soruEkle(response.uri);
      } else {
        this.soruEkle(response.path);
      }
    }
  }

soruSecIos() {
    const options = {
      title: 'Soru seç',

      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePickerIos.showImagePicker(options, response => {
      // console.log('Response = ', response);

      if (response.didCancel) {
      //  console.log('User cancelled image picker');
      } else if (response.error) {
      //  console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
       // console.log('User tapped custom button: ', response.customButton);
      } else {
        //console.log('response');
        
        ReactNativeImageCropping.cropImageWithUrl(response.uri).then(
          image => {
           //console.log(image);
            //Image is saved in NSTemporaryDirectory!
            //image = {uri, width, height}
            this.kucult(image);
          },
          err => console.log(err),
        );
      }
    });
  }

  soruSec() {
    if (Platform.OS === 'ios') {
      this.soruSecIos();
    } else {
      this.soruSecAndroid();
    }
  }
  soruSecAndroid(yontem) {
    if (yontem === 'camera') {
      ImagePickerAndroid.openCamera({
        width: 400,
        height: 300,
        cropping: true,
      }).then(image => {
        //console.log(image);
        this.kucult(image, true);
      });
    } else {
      ImagePickerAndroid.openPicker({
        width: 400,
        height: 300,
        cropping: true,
      }).then(image => {
        //console.log(image);
        this.kucult(image, true);
      });
    }
  }

  renderKksOlustur() {
    //if (this.state.okul)

    if (this.state.sendingQuestions) {
      return <Spinner />;
    } else {
      return (
        <Button onPress={this.onKksOlustur.bind(this)}>Sınav oluştur</Button>
      );
    }
  }

  render() {
    return (
      <View style={{flex:1}}>
      <Swiper
        ref={mySwiper => (this.swiper = mySwiper)}
        containerStyle={swiperStyles.wrapper}
        showsButtons={false}
        
      >
        <View style={swiperStyles.slide1}>
          <View
            style={{
              marginTop: 40,

              //borderWidth: 5,
            }}
          >
            <View>
              {this.renderIcons()}
            </View>
          </View>

          <View style={styles.swiperKonteyner}>
            {/* <GridView
              itemWidth={130}
              items={this.renderImages()}
              renderItem={item =>
                <View>
                  {item}
                </View>}
            /> */}
            <ScrollView>
              <View style={ {flex: 1, flexDirection:'row', flexWrap:'wrap'} }>
                  {this.renderImages()}
              </View>
             
            </ScrollView>
           

          </View>
        </View>

        <View style={swiperStyles.slide2}>
          <Text style={swiperStyles.text}>Ders seç</Text>
          <Picker
            style={{ width: 200 }}
            selectedValue={this.state.ders}
            onValueChange={(itemValue, itemIndex) => {
              if (itemValue === 'ders seç') {
                alert('Lütfen bir ders seçin');
                console.log('itemValue ' + itemValue);
                console.log('this.state.ders ' + this.state.ders);
              } else {
                this.setState({ ders: itemValue });
                //this.swiper.scrollBy(1);
              }
            }}
          >
            {liste.dersler.map((item, index) => {
              return (
                <Picker.Item label={item.name} value={item.name} key={index} />
              );
            })}
          </Picker>
        </View>

        <View style={swiperStyles.slide3}>
          <View style={{ height: 250, width: 300 }}>
            <TextInput
              style={styles.cevap}
              placeholder="Okul adı"
              onChangeText={text => {
                const okul = this.state.okul;
                okul.ad = text;
                this.setState({ okul });
              }}
            />

            <Picker
              selectedValue={this.state.okul.Tur}
              onValueChange={(itemValue, itemIndex) => {
                if (itemValue === 'Okul türü') {
                  alert('Lütfen okul türü seçin');
                  //console.log('itemValue ' + itemValue);
                  //console.log('this.state.ders ' + this.state.ders);
                } else {
                  const okul = this.state.okul;
                  okul.Tur = itemValue;
                  this.setState({ okul });
                  //this.swiper.scrollBy(1);
                }
              }}
            >
              <Picker.Item
                label="Okul türü"
                value="Okul türü"
                key="Okul türü"
              />
              <Picker.Item
                label="Anadolu Lisesi"
                value="Anadolu Lisesi"
                key="Anadolu Lisesi"
              />
              <Picker.Item
                label="Fen Lisesi"
                value="Fen Lisesi"
                key="Fen Lisesi"
              />
            </Picker>
          </View>
        </View>
        <View style={swiperStyles.slide3}>
          <Text style={swiperStyles.text}>Sınav adı belirle</Text>

          <View style={{ height: 45, width: 300, margin: 10 }}>
            <TextInput
              style={styles.cevap}
              placeholder="9. Sınıf 1. dönem 1. sınav"
              onChangeText={text => {
                this.setState({ kksAdi: text });
              }}
            />
          </View>

          <View style={{ height: 45, width: 300 }}>
            {this.renderKksOlustur()}
          </View>
        </View>
      </Swiper>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  swiperKonteyner: {
    flex: 7,
    width: size.width - 10,
    margin: 10,
    borderColor,
    borderWidth: 2,
  },
  cevap: {
    margin: 5,
    textAlign: 'center',
    //autoCapitalize: 'none',
    //autoCorrect: false,
    height: 70,
    
    //color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    //alignSelf: 'center',

    borderColor,
    borderWidth: 1,
    borderRadius: 5,
  },
  text: {
    textAlign: 'center',
    fontSize: 20,
  },
});

const swiperStyles = StyleSheet.create({
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    //backgroundColor: '#9DD6EB',
    // backgroundColor: '#97CAE5',
  },
  slide2: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    //backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    // backgroundColor: '#92BBD9',
  },
  slide4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    // backgroundColor: '#92BBD9',
  },
  slide5: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    //backgroundColor: '#92BBD9',
  },
  slide6: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    //backgroundColor: '#92BBD9',
  },
  text: {
    color: '#34495e',
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

AppRegistry.registerComponent('sorugonder', () => sorugonder);
