import React, {PureComponent} from 'react'
import {
  Text,
  View,
  StyleSheet,
  Animated,
  Easing
} from 'react-native'

import styles from '../styles/Styles'
import colors from '../styles/Colors'

export default class WaveformBar extends PureComponent {
  
  state = {
    opacity : new Animated.Value(0),
    scaleY  : new Animated.Value(0)
  }

  componentDidMount() {
    let DELAY = this.getRandomArbitrary(50, 701)

    Animated.parallel([
      Animated.timing(this.state.opacity, {
        toValue  : 1,
        delay    : DELAY,
        useNativeDriver: true,
        duration : 200,
        easing   : Easing.inOut(Easing.ease)
      }),
      Animated.timing(this.state.scaleY, {
        toValue  : 1,
        delay    : DELAY,
        useNativeDriver: true,
        duration : 700,
        easing   : Easing.inOut(Easing.ease)
      })
    ]).start()
  }

  getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
  }

  render() {
    return (
      <Animated.View style={[waveformBarStyles.waveformBar, this.props.style, { 
          width: this.props.width,
          height: this.props.height,
          opacity: this.state.opacity,
          transform: [
            { scaleY: this.state.scaleY }
          ] 
        }]} />
    )
  }

}

const waveformBarStyles = StyleSheet.create({
  waveformBar: {
    borderRadius: 1,
    backgroundColor: colors.TRANSPARENTWHITISH
  }
})