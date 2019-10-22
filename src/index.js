import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  TouchableOpacity
} from "react-native";

import SwipeIcon from "./components/SwipeIcon";
import images from "./assets/images";
import { zip } from "rxjs";

type Props = {
  hasRef?: () => void,
  swipeHeight?: number,
  itemMini?: object,
  itemFull: object,
  disablePressToShow?: boolean,
  style?: object,
  onShowMini?: () => void,
  onShowFull?: () => void,
  animation?: "linear" | "spring" | "easeInEaseOut" | "none",
  forceShowFullVersion?: boolean,
  marginTop?: number
};
export default class SwipeUpDown extends Component<Props> {

  static defautProps = {
    disablePressToShow: false
  };

  constructor(props) {
    super(props);
    const collapsed = this.props.forceShowFullVersion ? false : true;
    this.state = {
      collapsed
    };

    this.marginTop = this.props.marginTop | 50
    this.deviceHeight = Dimensions.get("window").height - this.marginTop;

    this.disablePressToShow = props.disablePressToShow;
    this.SWIPE_HEIGHT = props.swipeHeight || 60;
    this._panResponder = null;
    this.top = this.SWIPE_HEIGHT;
    this.height = this.SWIPE_HEIGHT;
    this.customStyle = {
      style: {
        bottom: 0,
        top: this.top,
        height: this.height
      }
    };
    this.checkCollapsed = true;
    this.showFull = this.showFull.bind(this);
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this)
    });
  }

  componentDidMount() {
    this.props.hasRef && this.props.hasRef(this);
  }

  onMoveShouldSetPanResponder = (event, gestureState) => {
    if (this.state.collapsed) {
      return true;
    }
    const { dx, dy } = gestureState;
    if (dy < -1) {
      this.props.onMoveUp && this.props.onMoveUp();
    }

    if (dy > 1) {
      this.props.onMoveDown && this.props.onMoveDown();
    }
    return dy > 50;
  };

  updateNativeProps() {
    switch (this.props.animation) {
      case "linear":
        LayoutAnimation.linear();
        break;
      case "spring":
        LayoutAnimation.spring();
        break;
      case "easeInEaseOut":
        LayoutAnimation.easeInEaseOut();
        break;
      case "none":
      default:
        break;
    }
    this.viewRef.setNativeProps(this.customStyle);
  }

  _onPanResponderMove(event, gestureState) {
    if (gestureState.dy > 0 && !this.checkCollapsed) {
      // SWIPE DOWN

      this.customStyle.style.top = this.top + gestureState.dy;
      this.customStyle.style.height = this.deviceHeight - gestureState.dy;
      this.swipeIconRef && this.swipeIconRef.setState({ icon: images.minus });
      !this.state.collapsed && this.setState({ collapsed: true });
      this.updateNativeProps();
    } else if (this.checkCollapsed && gestureState.dy < -60) {
      // SWIPE UP
      this.top = 0;
      this.customStyle.style.top = this.deviceHeight + gestureState.dy;
      this.customStyle.style.height = -gestureState.dy + this.SWIPE_HEIGHT;
      this.swipeIconRef &&
        this.swipeIconRef.setState({ icon: images.minus, showIcon: true });
      if (this.customStyle.style.top <= this.deviceHeight / 2) {
        this.swipeIconRef &&
          this.swipeIconRef.setState({
            icon: images.arrow_down,
            showIcon: true
          });
      }
      this.updateNativeProps();
      this.state.collapsed && this.setState({ collapsed: false });
    }
  }

  _onPanResponderRelease(event, gestureState) {
    if (gestureState.dy < -100 || gestureState.dy < 100) {
      this.showFull();
    } else {
      this.showMini();
    }
  }

  showFull() {
    const { onShowFull } = this.props;
    this.customStyle.style.top = 0;
    this.customStyle.style.height = this.deviceHeight;
    this.swipeIconRef &&
      this.swipeIconRef.setState({ icon: images.mines, showIcon: true });
    this.updateNativeProps();
    this.state.collapsed && this.setState({ collapsed: false });
    this.checkCollapsed = false;
    onShowFull && onShowFull();
  }

  showMini() {
    const { onShowMini, itemMini } = this.props;
    // this.SWIPE_HEIGHT = 150; //Avoid hiding when swiping down.
    this.customStyle.style.top = itemMini
      ? this.deviceHeight - this.SWIPE_HEIGHT
      : this.deviceHeight;
    this.customStyle.style.height = itemMini ? this.SWIPE_HEIGHT : 0;
    this.swipeIconRef && this.swipeIconRef.setState({ showIcon: false });
    this.updateNativeProps();
    !this.state.collapsed && this.setState({ collapsed: true });
    this.checkCollapsed = true;
    onShowMini && onShowMini();
  }

  render() {
    const { itemMini, itemFull, style } = this.props;
    const { collapsed } = this.state;
    return (
      <View
        ref={ref => (this.viewRef = ref)}
        {...this._panResponder.panHandlers}
        style={[
          styles.wrapSwipe,
          {
            height: this.SWIPE_HEIGHT,
            marginTop: this.marginTop
          },
          !itemMini && collapsed && { marginBottom: -200 },
          style
        ]}
      >
        <SwipeIcon
          onClose={() => this.showMini()}
          hasRef={ref => (this.swipeIconRef = ref)}
        />
        {collapsed ? (
          itemMini ? (
            <TouchableOpacity
              activeOpacity={this.disablePressToShow ? 1 : 0.6}
              style={{ height: this.SWIPE_HEIGHT }}
              onPress={() => !this.disablePressToShow && this.showFull()}
            >
              {itemMini}
            </TouchableOpacity>
          ) : null
        ) : ([
          itemFull,
          <TouchableOpacity style={styles.swipeElement} />
        ])}
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapSwipe: {
    padding: 8,
    backgroundColor: "#ccc",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
  },
  swipeElement: {
    position: 'absolute',
    top: 0,
    height: 100,
    width: '100%',
    opacity: .5
  }
});
