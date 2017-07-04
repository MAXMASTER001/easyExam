import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const Button = props => {
  const { buttonstyle, textStyle } = styles;
  return (
    <TouchableOpacity style={buttonstyle} onPress={props.onPress}>

      <Text style={textStyle}>
        {props.children}
      </Text>

    </TouchableOpacity>
  );
};

export default Button;

const styles = {
  textStyle: {
    alignSelf: 'center',
    color: '#007aff',
    fontSize: 16,
    fontWeight: '600',
    padding: 10,
  },
  buttonstyle: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderColor: '#007aff',
    marginLeft: 5,
    marginRight: 5,
  },
};
