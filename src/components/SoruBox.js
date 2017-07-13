import React from 'react';
import { View, Text, StyleSheet, Image, TextInput } from 'react-native';

const SoruBox = props => {
  return (
    <View style={styles.container}>
      <Image source={props.imageSource} style={styles.sorular} />

      <View style={{ flexDirection: 'row', width: 60, alignItems: 'center' }}>
        <Text>Cevap</Text>
        <TextInput
          style={styles.cevap}
          clearTextOnFocus={true} //sadece iosda çalışır.
          onChangeText={props.onChangeText}
          value={props.cevap}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'black',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    width: 150,
    height: 150,
  },
  cevap: {
    margin: 5,
    width: 20,
    textAlign: 'center',
    height: 20,
    fontWeight: '500',
    color: 'white',
    backgroundColor: 'black',
    fontSize: 20,
    borderWidth: 1,
  },
  sorular: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    margin: 5,
  },
});
export default SoruBox;
