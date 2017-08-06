import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';

const width = Dimensions.get('window').width;
class SoruBox extends Component {
  constructor() {
    super();
    this.state = { cevapText: 'X' };
  }
 render () {
   return (
    <View style={styles.container}>
      <Image source={this.props.imageSource} style={styles.soruResimleri} />

      <View
        style={{
          backgroundColor: '#e74c3c',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{color:'white',fontWeight:'bold'}}>Cevap</Text>
        <TextInput
          //underlineColorAndroid="transparent" //sadece android
          maxLength={1}
          style={styles.cevap}
          //clearTextOnFocus={true} //sadece iosda çalışır.
          onChangeText={text => {
            this.setState({ cevapText: text });
            this.props.onChangeText(text);
          }}
          value={this.state.cevapText}
          onFocus={() => {
           
            this.setState({ cevapText: '' });
          }}
          
        />
      </View>
    </View>
  );
 } 
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#e74c3c',
    padding: 15,
    justifyContent: 'center',
    margin: 3,
    width: (width - 26) / 2,
    aspectRatio: 1,
  },
  cevap: {
    width: 20,
    height: 33,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  soruResimleri: {
    flex: 1,

    resizeMode: 'contain',
  },
});
export default SoruBox;
