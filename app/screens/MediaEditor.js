import React, {Component} from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  Image,
  Easing,
  Platform,
  ScrollView,
  InteractionManager,
  ActivityIndicator,
  PanResponder,
} from 'react-native'

import styles from '../styles/Styles'
import colors from '../styles/Colors'

import Waveform from '../components/Waveform'

import Video from 'react-native-video'
import Icon from 'react-native-vector-icons/MaterialIcons'
import MultiSlider from '@ptomasroos/react-native-multi-slider'

const WIDTH = Dimensions.get('window').width - 70

export default class MediaEditor extends Component {  
  
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <Text style={styles.headerTitle}>Media Editor Demo</Text>,
      headerRight: <TouchableOpacity onPress={()=>{ navigation.setParams({ save: true }) }}><Text style={styles.headerButton}>Save</Text></TouchableOpacity>,
      headerTintColor: colors.WHITE,
      headerStyle: { backgroundColor: colors.HEADER }
    }
  }

  constructor(props) {
    super(props)

    this.snapLeft = this.snapLeft.bind(this)
    this.snapRight = this.snapRight.bind(this)
  }

  state = {
    track: {
      waveform: [22065,624,32767,32573,32349,32763,32425,32506,32767,32275,32037,32252,32517,32199,32377,32767,32364,32758,32767,32668,32588,31990,32767,32767,32767,32767,32767,32767,32750,32767,32767,32767,32424,32767,32767,32767,32767,32767,32689,31444,32543,32767,32194,32740,32357,32056,32758,32442,32574,32767,32767,32475,32767,32759,32767,32767,32586,32767,32767,32767,32767,32544,32767,32754,32646,32767,32767,32767,32767,32663,32051,32105,31695,31998,31570,31700,29637,31650,32598,32104,31569,30855,26958,30757,31807,31273,30552,30966,31856,31909,30341,26247,13905,8091,3469,8475,3524,660,280,13],
      duration: 198,
      title: "Kill Pill",
      kind: "track"
    },
    videoPaused: true,
    audioPaused: true,
    videoVolume: 0.0,
    audioVolume: 1.0,
    videoDuration: 0,
    audioDuration: 0,
    range: [],
    width: new Animated.Value(WIDTH),
    translateX: new Animated.Value(0),
    progress : new Animated.Value(0),
    currentTime: 0,
    scrollX : 0,
    scrollOffset : 0,
    sliderOne: 0,
    sliderTwo: 0,
    totalWidth: 0,
    widthPerSecond: 0,
    pan: new Animated.ValueXY(),
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => this.state.videoPaused,
      onMoveShouldSetPanResponderCapture: () => this.state.videoPaused,
      onPanResponderTerminationRequest: () => true,

      // Set the initial value to the current state
      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value})
        this.state.pan.setValue({x: 0, y: 0})
      },

      // When we drag/pan the object, set the delegate to the states pan position
      onPanResponderMove: Animated.event([
        null, { dx: this.state.pan.x, dy: 0 },
      ]),

      onPanResponderRelease: (e, gestureState) => {
        // Flatten the offset to avoid erratic behavior
        this.state.pan.flattenOffset()

        let SNAP_RIGHT = -(this.state.totalWidth - this.state.widthPerSecond*(this.state.sliderTwo-this.state.sliderOne))

        if (this.state.pan.x._value > 0) {
          this.snapLeft()
        }
        else if (this.state.pan.x._value < SNAP_RIGHT) {
          this.snapRight()
        }
      }
    })
  }

  componentDidUpdate(oldProps, oldState) {
    if (this.props.navigation.state.params && this.props.navigation.state.params.save) {
      this.props.navigation.setParams({ save: false })
      alert('success')      
    }
  }

  render() {
    const {params} = this.props.navigation.state,
          dim = Dimensions.get('window')

    let playIcon = this.state.videoPaused ? 'play-arrow' : 'pause'

    let slider,
        progress

    if (this.state.videoDuration > 0) {
      slider = <MultiSlider
                  values={[this.state.sliderOne, this.state.sliderTwo]}
                  min={0}
                  max={this.state.videoDuration}
                  step={1}
                  selectedStyle={{
                    backgroundColor: colors.ACCENT,
                  }}
                  unselectedStyle={{
                    backgroundColor: colors.TRANSPARENTBORDER,
                  }}
                  enabledOne={this.state.videoPaused}
                  enabledTwo={this.state.videoPaused}
                  sliderLength={WIDTH}
                  onValuesChange={this.sliderValuesChange.bind(this)}
                  onValuesChangeFinish={this.sliderValuesChangeFinish.bind(this)}
                />

      progress = <MultiSlider
                    values={[this.state.currentTime]}
                    min={0}
                    max={this.state.videoDuration}
                    step={1}
                    selectedStyle={{
                      backgroundColor: colors.ACCENT,
                    }}
                    unselectedStyle={{
                      backgroundColor: colors.TRANSPARENTWHITE,
                    }}
                    enabledOne={this.state.videoPaused}
                    onValuesChange={this.videoProgressChange.bind(this)}
                    sliderLength={WIDTH}
                  />
    }

    let handlers = this._panResponder.panHandlers,
        pan = this.state.pan
    
    let [translateX, translateY] = [pan.x, pan.y]

    let panStyle = {
      transform: [{translateX}, {translateY}]
    }

    let waveform
    if (this.state.totalWidth) {
      waveform = <Animated.View 
                style={[
                  editorStyles.waveformOuter, 
                  { 
                    width:this.state.width, 
                    transform:[
                      {
                        translateX: this.state.translateX.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [-1, 1],
                        })
                      }
                    ]
                  },
                ]}>
                <Image source={require('../images/gradient-audio.png')} style={editorStyles.waveformBackground} />
                <Animated.View style={panStyle} {...handlers}>
                  <Waveform 
                    data={ this.state.track.waveform }
                    width={ this.state.totalWidth }
                    style={editorStyles.waveform} />
                </Animated.View>
              </Animated.View>
    }

    return (
      <View style={styles.container}>
        
        <View style={[editorStyles.videoWrap, { height: dim.width, width: dim.width }]}>
          
          <Video
            ref={(video)=> this._video = video }
            volume={this.state.videoVolume}
            source={require('../videos/drone.mp4')}
            style={{ height: dim.width, width: dim.width }}
            paused={this.state.videoPaused}
            onLoad={this.videoLoad.bind(this)}
            onEnd={this.videoEnd.bind(this)}
            ignoreSilentSwitch={"ignore"}
            onProgress={this.progressAnimation.bind(this)} />

          <View style={[editorStyles.videoControls]} >
            <TouchableOpacity style={editorStyles.icon} activeOpacity={0.7} onPress={this.play.bind(this)}>
              <Icon name={playIcon} size={64} color={colors.WHITE} />
            </TouchableOpacity>

            <View style={[editorStyles.videoProgressWrap]}>
              { progress }
            </View>
          </View>
          

        </View>

        <View style={editorStyles.navControls}>
          <TouchableOpacity style={editorStyles.controlsIcon} activeOpacity={0.7} onPress={this.edit.bind(this)}>
            <Icon name='crop' size={25} color={colors.WHITE} />
            <Text style={editorStyles.controlsLabel}>Editor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={editorStyles.controlsIcon} activeOpacity={0.7} onPress={this.volume.bind(this)}>
            <Icon name='equalizer' size={25} color={colors.WHITE} />
            <Text style={editorStyles.controlsLabel}>Volume</Text>
          </TouchableOpacity>
        </View> 

        <ScrollView
          scrollEnabled={false}
          horizontal={true}
          pagingEnabled={true}
          ref={(ref)=>this._nav = ref} >

          <View style={editorStyles.page}>
            <View style={editorStyles.controlsWrap}>

              <View style={editorStyles.overlay}>
                <Image source={require('../images/filmstrip.png')} style={editorStyles.videoBackground} />
              </View>

              <View style={editorStyles.progressWrap}>
                <Animated.View style={[editorStyles.progress, { transform: [{ translateX: this.state.progress }] }]} />
              </View>

              { waveform }

              <View style={editorStyles.numbers}>
                { 
                  this.state.range.map((time, idx)=> {
                    return <Text key={idx} style={editorStyles.number}>{ time }</Text>
                  })
                }
              </View>

              <View style={{ }}>
                { slider }
              </View>
            </View>
          </View>

          <View style={[editorStyles.page]}>
            <Text style={editorStyles.label}>Video Volume</Text>
            <View style={{ height: 20, marginBottom: 15, }}>
              <MultiSlider
                values={[this.state.videoVolume]}
                min={0}
                max={1}
                step={0.1}
                selectedStyle={{
                  backgroundColor: colors.PRIMARY,
                }}
                unselectedStyle={{
                  backgroundColor: colors.TRANSPARENTWHITE,
                }}
                onValuesChange={this.videoVolumeChange.bind(this)}
                sliderLength={WIDTH}
              />
            </View>
            <Text style={editorStyles.label}>Audio Volume</Text>
            <View style={{ height: 20 }}>
              <MultiSlider
                values={[this.state.audioVolume]}
                min={0}
                max={1}
                step={0.1}
                selectedStyle={{
                  backgroundColor: colors.PRIMARY,
                }}
                unselectedStyle={{
                  backgroundColor: colors.TRANSPARENTWHITE,
                }}
                onValuesChange={this.audioVolumeChange.bind(this)}
                sliderLength={WIDTH}
              />
            </View>
          </View>
        </ScrollView>

        <Video
          ref={(audio)=> this._audio = audio }
          volume={this.state.audioVolume}
          source={require('../tracks/KillPill.mp3')}
          style={{ height: 0, width: 0 }}
          paused={this.state.audioPaused}
          onLoad={this.audioLoad.bind(this)}
          ignoreSilentSwitch={"ignore"}
          repeat={false} />

      </View>
    )
  }

  videoLoad(data) {
    let duration = Math.ceil(data.duration)
    
    this.setState({
      range: this.getRange(duration),
      videoDuration: duration,
      sliderTwo:duration,
      widthPerSecond: WIDTH/duration,
      videoLoaded: true
    }, this.ready)
  }

  audioLoad(data) {
    this.setState({
      audioLoaded: true
    }, this.ready)
  }

  ready() {
    // this has to get called by audioLoad and videoLoad for it to be 'ready'
    if (!this.state.audioLoaded && !this.state.videoLoaded) {
      return
    }

    // we're ready
    this.setState({
      ready: true,
      totalWidth: this.state.track.duration * this.state.widthPerSecond
    })
  }

  // formats an integer into MM:SS
  toMinutes(time) {
    function pad(num, size) {
      var s = "000000000" + num
      return s.substr(s.length-size)
    }

    let secs    = parseInt(time),
        minutes = Math.floor(secs / 60),
        seconds = Math.ceil(secs - minutes * 60)
        
    return pad(minutes, 2) + ":" + pad(seconds,2)
  }

  // neatly divides the duration into 6 equal labels
  getRange(total) {
    let range = []
    for (let i=0; i<5; i++) {
      range.push(this.toMinutes((total/5)*i))
    }
    range.push(this.toMinutes(total))
    return range
  }

  videoProgressChange(values) {
    if (this.state.videoPaused) {
      this.setState({ currentTime: values[0] })

      // maybe debounce?
      // the video seek is slow
      // we could do this when they stop moving the slider
      // but we wouldn't get to preview the video frames as we slide
      // it's actually not bad on real device tho...
      this._video.seek(values[0])
    }
  }

  audioVolumeChange(values) {
    this.setState({ audioVolume: values[0] })
  }

  videoVolumeChange(values) {
    this.setState({ videoVolume: values[0] }) 
  }

  // as the left slider value changes we translate the waveform so that it stays in place
  // the translation is smoother that changing the scroll position
  // once it has stopped, we convert the translation to scroll position
  // before we start again, we convert scroll position to translation

  // if we adjust the right slider, we don't need to do anything
  sliderValuesChange(values) {
    
    // if we slide the left slider, it should keep the waveform in place on the left
    if (values[0] != this.state.sliderOne) {

      const x = Math.ceil(this.state.widthPerSecond*values[0])

      Animated.parallel([
        Animated.timing(
          this.state.translateX,
          {
            toValue: x,
            duration : 0,
          }
        ),
        Animated.timing(
          this.state.width,
          {
            toValue: Math.ceil(this.state.widthPerSecond*(values[1]-values[0])),
            duration : 0,
          }
        )
      ]).start()
    }
    else {
      Animated.timing(
        this.state.width,
        {
          toValue: Math.ceil(this.state.widthPerSecond*(values[1]-values[0])),
          duration : 0,
        }
      ).start()
    }
  }

  sliderValuesChangeFinish(values) {
    // just worry about this if its sliderOne
    if (values[1] != this.state.sliderTwo) {
      this.setState({ sliderTwo: values[1] })
    }
    else {
      this.setState({ sliderOne: values[0] })
    }
  }

  progressAnimation(data) {
    let currentTime = Math.ceil(data.currentTime),
        progress = Math.ceil((WIDTH/this.state.videoDuration) * currentTime)

    if (data.currentTime > this.state.sliderTwo && !this.state.audioPaused) {
      this.setState({ audioPaused: true })
    }

    // should start audio now
    else if (currentTime >= this.state.sliderOne && currentTime < this.state.sliderTwo && !this.state.videoPaused && this.state.audioPaused) {
      console.log('unpause the audio')
      this.setState({ audioPaused: false })
    }
    
    Animated.timing(this.state.progress, {
      useNativeDriver: true,
      toValue: progress,
      duration: 0,
    }).start()

    this.setState({ currentTime: currentTime })
  }

  // play/pause the track
  play() {

    // don't play til everything is set
    if (!this.state.ready) {
      return
    }

    // start watching/listening
    if (this.state.videoPaused) {

      let audioTime = -this.state.pan.x._value/this.state.widthPerSecond
      if (this.state.currentTime > this.state.sliderOne) {
        audioTime += (this.state.currentTime-this.state.sliderOne)
      }

      if (audioTime < 0) {
        this._audio.seek(0)
      }
      else {
        this._audio.seek(audioTime)
      }

      this.setState({ videoPaused: false })
    }
    else {
      this.setState({ videoPaused: true, audioPaused: true })
    }
    
  }

  // view editor controls
  edit() {
    this._nav.scrollTo({ x: 0, y: 0, animated: true })
  }

  // view volume controls
  volume() {
    this._nav.scrollTo({ x: Dimensions.get('window').width, y: 0, animated: true })
  }

  // snap the waveform to the left
  snapLeft() {
    Animated.timing(
      this.state.pan,
      {
        toValue: {x: 0, y: 0},
        easing: Easing.elastic(1.2),
        duration : 350,
      }
    ).start()
  }

  // snap the waveform to the right
  snapRight() {
    Animated.timing(
      this.state.pan,
      {
        toValue: {x: -(this.state.totalWidth - this.state.widthPerSecond*(this.state.sliderTwo-this.state.sliderOne)), y: 0},
        duration : 350,
        easing: Easing.elastic(1.2)
      }
    ).start()
  }

  // go back to the beginning
  videoEnd() {
    this.setState({ videoPaused: true, audioPaused: true }, ()=> {
      this._video.seek(0)
    })
  }

}

var editorStyles = StyleSheet.create({
  videoWrap: {
    position: 'relative',
  },
  videoControls: {
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    backgroundColor: 'transparent'
  },
  waveformOuter: {
    height: 138,
    width: WIDTH,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  videoBackground: {
    height: 138,
    width: WIDTH,
    opacity: 0.5,
  },
  waveformBackground: {
    height: 138,
    width: WIDTH,
    position: 'absolute',
    opacity: 0.65,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  waveform: {
    marginVertical: 20,
  },
  page: {
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsWrap: {
    width: WIDTH,
    height: 185,
    marginHorizontal: 35,
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  overlay: {
    flex: 1,
    width: WIDTH
  },
  numbers: {
    borderTopWidth: 2,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  number: {
    textAlign: 'center',
    fontSize: 10,
    paddingTop: 3,
    fontFamily: 'Heebo-Regular',
    color: colors.TRANSPARENTWHITE,
    marginHorizontal: -12,
    backgroundColor: 'transparent'
  },
  progressWrap: {
    height: 135,
    position: 'absolute',
    top: 2,
    left: 0,
    width: WIDTH,
    overflow: 'hidden'
  },
  progress: {
    height: 135,
    borderRightWidth: 1,
    borderRightColor: colors.ACCENT,
    backgroundColor: colors.ACCENTOVERLAY,
    position: 'absolute',
    top: 0,
    left: -WIDTH,
    width: WIDTH
  },
  videoProgressWrap: {
    position: 'absolute',
    bottom: -20,
    left: 35,
    width: WIDTH,
  },
  navControls: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsIcon: {
    height: 44,
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  controlsLabel: {
    fontSize: 10,
    color: colors.WHITE,
    marginLeft: 5,
  },
  label: {
    fontSize: 12,
    color: colors.WHITE,
    textAlign: 'left',
    width: WIDTH,
    marginBottom: 20,
  }
})