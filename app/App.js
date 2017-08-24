import React, {Component} from 'react'
import {
  View,
  StatusBar
} from 'react-native'

import { StackNavigator } from 'react-navigation'

/** ROUTES **/
import MediaEditor from '../app/screens/MediaEditor'

/** HELPERS **/
import colors from './styles/Colors'
import styles from './styles/Styles'


const AppNavigator = StackNavigator({
  MediaEditor: { screen: MediaEditor },
}, {
  cardStyle: { backgroundColor: colors.BACKGROUND }
})

export default class AppView extends Component {
  
  render() {
    return (<View style={styles.container}>
              <StatusBar barStyle="light-content" backgroundColor={colors.HEADER} />
              <AppNavigator ref={(nav) => this.nav = nav } />
            </View>
          )
  }

}