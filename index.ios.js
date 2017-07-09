import React, { Component } from 'react';

import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
//import ImagePicker from 'react-native-image-crop-picker';
//import ImagePicker from 'react-native-customized-image-picker';
import Card from './src/components/Card';
import CardSection from './src/components/CardSection';
import Button from './src/components/Button';

import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import Base64 from 'base-64';
import Swiper from 'react-native-swiper';
//import EmailPassword from './src/components/EmailPassword';
import ScrollViewExample from './src/components/ScrollView';
import Soru from './src/soru';

import { NativeModules } from 'react-native';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Linking,
  ScrollView,
  Picker,
  ProgressViewIOS,
  TextInput,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const liste = {
  dersler: [
    { name: 'Ders seç', id: 0 },
    { name: 'MATEMATİK', id: 1 },
    { name: 'GEOMETRİ', id: 2 },
    { name: 'FİZİK', id: 3 },
    { name: 'KİMYA', id: 4 },
    { name: 'BİYOLOJİ', id: 5 },
    { name: 'DİL VE ANLATIM', id: 6 },
    { name: 'TARİH', id: 7 },
    { name: 'COĞRAFYA', id: 8 },
    { name: 'FELSEFE', id: 9 },
    { name: 'İNGİLİZCE', id: 10 },
  ],
};

export default class sorugonder extends Component {
  constructor() {
    super();
    const deviceId = DeviceInfo.getUniqueID();
    const size = {
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width,
    };

    this.state = {
      width: size.width,
      height: size.height,
      avatarSource: '',
      //yeniCevap: '',
      //resizedImageUri: [],
      photosTaken: [],
      uploadProgress: 0,
      ders: 'ders seç',
      kksAdi: '',
      user_folder: deviceId,
    };
  }

  soruSec() {
    var options = {
      title: 'Select Avatar',
      customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    /**
 * The first arg is the options object for customization (it can also be null or omitted for default options),
 * The second arg is the callback which sends object: response (more info below in README)
 */
    ImagePicker.showImagePicker(options, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        let source = { uri: response.uri };
        this.setState({
          avatarSource: source,
        });

        console.log('soru seçimi response objesi:' + response);
        // const originalImage = require('./camera.png');
        const { ReactNativeImageCropping } = NativeModules;

        ReactNativeImageCropping.cropImageWithUrl(response.uri).then(
          image => {
            //Image is saved in NSTemporaryDirectory!
            //image = {uri, width, height}
            // this.soruEkle(image.uri);

            this.kucult(response);
          },
          err => console.log(b),
        );
      }
    });
  }

  kucult(response) {
    ImageResizer.createResizedImage(
      response.uri,
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
  }

  soruEkle(imageUri) {
    const resimler = this.state.photosTaken;
    resimler.push(new Soru(imageUri, 'X'));
    this.setState({ photosTaken: resimler });
  }

  kksOlustur() {
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
        //alert('sınavınız oluşturuldu');
        //this.swiper.scrollBy(1);
      })
      .catch(error => {
        console.log(error);
        alert('sınav oluşturulamadı. Internet bağlantınızı kontrol edin!');
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
      for (resim of this.state.photosTaken) {
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
      if (this.state.ders != 'ders seç') {
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
    const config = {
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round(
          progressEvent.loaded * 100 / progressEvent.total,
        );
        this.setState({ uploadProgress: percentCompleted });
      },
    };

    const data = new FormData();

    data.append(
      'okul_adi',
      'DENEME\nAnadolu Lisesi\nMATEMATİK\n1. Dönem 1. Yazılı\nSoruları',
    );
    data.append('dizilim', '41,51');
    data.append('tarih_istenen', '20.12.2017');
    console.log('gönderilen ders sirasi ??? ' + this.state.ders);
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
        console.log('ALOOO');
        //alert(this.state.kksAdi);
        Linking.openURL(
          'http://www.ortaksinav.net/hazine00/KKSOGRETMEN/KKS_FOLDER/' +
            this.state.user_folder +
            '/' +
            this.state.kksAdi +
            '/' +
            this.state.kksAdi +
            'A.pdf',
        );
      })
      .catch(error => console.log(error));
  }

  renderImages() {
    const resimler = this.state.photosTaken;
    const imgler = [];

    for (let i = 0, len = resimler.length; i < len; i++) {
      imgler.push(
        <View
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: 'black',
            padding: 15,
            justifyContent: 'center',
            alignItems: 'center',
            margin: 3,
            width: 150,
            height: 150,
          }}
        >
          <Image
            source={{ uri: resimler[i].imageUri }}
            style={styles.sorular}
          />
          <View
            style={{ flexDirection: 'row', width: 60, alignItems: 'center' }}
          >
            <Text>Cevap</Text>
            <TextInput
              style={{
                margin: 5,
                width: 20,
                textAlign: 'center',
                height: 20,
                fontWeight: '500',
                color: 'white',
                backgroundColor: 'black',
                fontSize: 20,
                borderWidth: 1,
              }}
              clearTextOnFocus={true} //sadece iosda çalışır.
              onChangeText={text => {
                // alert(text)
                let cop = this.state.photosTaken.slice(0);
                cop[i].cevap = text;

                this.setState({ photosTaken: cop });
                //this.setState({ yeniCevap: text });

                //console.log(this.state.photosTaken[i].cevap);
                //console.log(cop[i].cevap);
                //this.forceUpdate()
                //alert(cop[i].cevap)
              }}
              value={this.state.photosTaken[i].cevap}
            />
          </View>
          {/*<Text>{this.state.photosTaken[i].cevap} </Text>*/}
        </View>,
      );
    }
    return imgler;
  }

  render() {
    return (
      <Swiper
        ref={mySwiper => (this.swiper = mySwiper)}
        style={swiperStyles.wrapper}
        showsButtons={false}
      >
        <View style={swiperStyles.slide1}>
          <View
            style={{
              marginTop: 40,

              //borderWidth: 5,
            }}
          >
            <TouchableOpacity
              onPress={() => this.soruSec()}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                borderWidth: 3,
              }}
            >
              <Image source={require('./src/images/camera.png')} />
              {/*<Text style={{ fontSize: 25 }}>Çek</Text>*/}
            </TouchableOpacity>

            {/*<Button onPress={() => this.soruSec()}>
              Sorularını çekmeye başla
            </Button>*/}
          </View>

          <View
            style={{
              flex: 7,
              width: this.state.width - 40,

              margin: 40,
              borderColor: 'black',
              borderWidth: 2,
            }}
          >
            <ScrollView horizontal={true}>
              {this.renderImages()}
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
          <View style={{ height: 140 }}>
            <Text style={swiperStyles.text}>Sınav adı belirle</Text>
          </View>
          <View style={{ height: 45, width: 300, margin: 10 }}>
            <TextInput
              style={{
                margin: 5,
                textAlign: 'center',
                //autoCapitalize: 'none',
                //autoCorrect: false,
                height: 45,
                //color: '#fff',
                fontSize: 30,
                fontWeight: 'bold',
                //alignSelf: 'center',

                borderColor: '#007aff',
                borderWidth: 1,
                borderRadius: 5,
              }}
              placeholder="9. Sınıf 1. dönem 1. sınav"
              onChangeText={text => {
                this.setState({ kksAdi: text });
              }}
            />
          </View>

          <View style={{ height: 45, width: 300 }}>
            <Button
              onPress={() => {
                //alert(this.state.kksAdi);
                this.kksOlustur();
                this.gonderPromise()
                  .then(mesaj => this.pdfOlustur())
                  .catch(mesaj => alert(mesaj));
              }}
            >
              Sınav oluştur
            </Button>
          </View>
          {/* Soruları gönder butonuna sanırım gerek yok.*/}
          {/*<View style={{ height: 45, width: 300 }}>
            <Button onPress={() => this.gonder()}>
              Soruları gönder
            </Button>
          </View>
*/}
        </View>
      </Swiper>
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
  sorular: {
    width: 110,
    height: 110,
    margin: 5,
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
    color: '#111',
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

AppRegistry.registerComponent('sorugonder', () => sorugonder);
