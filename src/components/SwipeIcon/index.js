import React, { Component } from 'react';
import { Image, View, Animated, Text, StyleSheet } from 'react-native';
import images from '../../assets/images';

const styles = StyleSheet.create({
	iconMines: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D1D5',
    borderRadius: 2
	}
});

export default class SwipeIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      icon: images.minus,
      showIcon: false
    };
  }
  componentDidMount() {
    this.props.hasRef && this.props.hasRef(this);
  }

  toggleShowHide(val) {
    this.setState({ showIcon: val });
  }

  render() {
    const { icon, showIcon } = this.state;
    return (
      <View style={{ alignItems: 'center', height: 10, marginBottom: 5 }}>
        <View style={styles.iconMines}></View>
      </View>
    );
  }
}
