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

import WaveformBar from '../components/WaveformBar'

const HEIGHT = 100

export default class Waveform extends PureComponent {
  
  constructor(props) {
    super(props)

    let MAX_HEIGHT = 0
    for (var int of this.props.data) {
      if (int > MAX_HEIGHT) MAX_HEIGHT = int
    }

    this.state = {
      opacity : new Animated.Value(0),
      max_height : MAX_HEIGHT
    }  
  }
  

  componentDidMount() {
    Animated.timing(this.state.opacity, {
      toValue  : 1,
      useNativeDriver: true,
      duration : 500,
      easing   : Easing.inOut(Easing.ease)
    }).start()
  }

  render() {
    let width = { width: 600 },
        bars  = (600/100) -2
    
    if (this.props.width) {
      width = { width: this.props.width }
      bars  = (this.props.width/100)-2
    }

    return (
      <Animated.View style={[waveformStyles.waveform, this.props.style, width]}>
        {
          this.props.data.map((int, idx)=> {
            return <WaveformBar key={idx} width={ bars } height={(HEIGHT/this.state.max_height) * int} />
          })
        }  
      </Animated.View>
    )
  }

}

const waveformStyles = StyleSheet.create({
  waveform: {
    height: HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})