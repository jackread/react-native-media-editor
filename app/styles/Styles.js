'use strict';

import { StyleSheet } from 'react-native';
import colors from './Colors'

module.exports = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
  	color: '#FFF',
  	fontFamily: 'Heebo-Regular',
  	fontSize: 18
  },
  headerButton: {
    color: colors.ACCENT,
    paddingHorizontal: 15
  }
})