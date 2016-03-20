import React, {
  Component,
  PropTypes,
  DrawerLayoutAndroid,
  NavigationExperimental,
  BackAndroid,
  View
} from 'react-native'
import _ from 'lodash'
import {init} from '../modules/app'
import {connect} from 'react-redux'
import * as Navigation from '../modules/navigation'
import {selectRoom} from '../modules/rooms'

const {
	AnimatedView: NavigationAnimatedView,
	Card: NavigationCard
} = NavigationExperimental

import LaunchScreen from './LaunchScreen'
import LoginScreen from './LoginScreen'
import LoginByTokenScreen from './LoginByTokenScreen'
import NoInternetScreen from './NoInternetScreen'
import HomeScreen from './HomeScreen'
import RoomScreen from './RoomScreen'
import SearchScreen from './SearchScreen'
import UserScreen from './UserScreen'
import Drawer from './Drawer'

// this need for passing navigator instance to navigation module
export let nav

class App extends Component {
  constructor(props) {
    super(props)

    this.renderDrawer = this.renderDrawer.bind(this)
    this.navigateTo = this.navigateTo.bind(this)
    this.navigateToFromDrawer = this.navigateToFromDrawer.bind(this)
    this.onMenuTap = this.onMenuTap.bind(this)
    this.renderScene = this.renderScene.bind(this)
    this.handleNavigate = this.handleNavigate.bind(this)

    this.state = {
      isDrawerOpen: false
    }
  }

  componentDidMount() {
    const {dispatch} = this.props
    // init application
    dispatch(init())
    BackAndroid.addEventListener('hardwareBackPress', () => {
      const {navigation} = this.props
      if (this.state.isDrawerOpen === true) {
        this.refs.drawer.closeDrawer()
        return true
      }

      if (navigation.index === 0) {
        return false
      }

      if (
        (navigation.index > 0) &&
        (navigation.children[navigation.index - 1].key !== 'room')
      ) {
        dispatch(selectRoom(''))
      }

      dispatch(Navigation.goBack())
      return true
    })
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress')
  }

  onMenuTap() {
    this.refs.drawer.openDrawer()
  }

  handleNavigate(action) {
    const {dispatch, navigation} = this.props

    if (action.type === Navigation.NAVIGATE_BACK) {
      if (this.state.isDrawerOpen === true) {
        this.refs.drawer.closeDrawer()
        return
      }

      if (
        (navigation.index > 0) &&
        (navigation.children[navigation.index - 1].key !== 'room')
      ) {
        dispatch(selectRoom(''))
      }

      dispatch(Navigation.goBack())
    }
  }

  navigateTo(route) {
    const {dispatch, navigation} = this.props
    if (_.isEqual(route, navigation.children[navigation.index])) {
      return false
    }
    dispatch(Navigation.goTo(route))
  }

  navigateToFromDrawer(route) {
    const {dispatch, navigation} = this.props
    const current = navigation.children[navigation.index]

    if (_.isEqual(route, current)) {
      return false
    }

    this.refs.drawer.closeDrawer()
    // delay is needed for smoothly drawer closing
    setTimeout(() => {
      if (current.key === 'room' && route.key === 'room') {
        dispatch(Navigation.goAndReplace('room', route))
      } else {
        dispatch(Navigation.goTo(route))
      }
    }, 300)
  }


  // configureScene(route) {
  //   if (route.name === 'search') {
  //     return Navigator.SceneConfigs.FloatFromBottomAndroid
  //   } else if (!!route.sceneConfig && route.name !== 'search') {
  //     return Navigator.SceneConfigs[route.sceneConfig]
  //   } else {
  //     return Navigator.SceneConfigs.FadeAndroid
  //   }
  // }

  renderScene({scene}) {
    // map routes by key
    switch (scene.navigationState.key) {
    case 'launch':
      return (
        <LaunchScreen />
      )
    case 'noInternet':
      return (
        <NoInternetScreen />
      )
    case 'login':
      return (
        <LoginScreen />
      )
    case 'loginByToken':
      return (
        <LoginByTokenScreen />
      )
    case 'home':
      return (
        <HomeScreen
          navigateTo={this.navigateTo}
          onMenuTap={this.onMenuTap.bind(this)} />
      )
    case 'room':
      return (
        <RoomScreen
          route={scene.navigationState}
          navigateTo={this.navigateTo}
          onMenuTap={this.onMenuTap.bind(this)} />
      )
    case 'user':
      return (
        <UserScreen
          route={scene.navigationState} />
      )

    case 'search':
      return (
        <SearchScreen />
      )
    default:
      return null
    }
  }


  renderDrawer() {
    return (
      <Drawer
        navigateTo={this.navigateToFromDrawer.bind(this)} />
    )
  }

  render() {
    const {navigation} = this.props
    // const initialRoute = {name: 'launch'}
    // const initialRoute = {name: 'room', roomId: '56a41e0fe610378809bde160'}
    const drawerLockMode = ['launch', 'login', 'loginByToken', 'user'].indexOf(
      navigation.children[navigation.index].key) === -1
      ? 'unlocked'
      : 'locked-closed'
    return (
      <DrawerLayoutAndroid
        ref="drawer"
        drawerLockMode={drawerLockMode}
        style={{backgroundColor: 'white'}}
        drawerWidth={300}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={this.renderDrawer.bind(this)}
        onDrawerOpen={() => this.setState({isDrawerOpen: true})}
        onDrawerClose={() => this.setState({isDrawerOpen: false})}
        keyboardDismissMode="on-drag">
        <NavigationAnimatedView
          navigationState={navigation}
          onNavigate={this.handleNavigate}
          style={{flex: 1}}
          renderScene={props => (
            <View style={{flex: 1, top: 0, bottom: 0, right: 0, left: 0, position: 'absolute'}}>
              {this.renderScene(props)}
            </View>
          )} />
      </DrawerLayoutAndroid>
    )
  }
}

App.propTypes = {
  dispatch: PropTypes.func,
  navigation: PropTypes.object
}

function mapStateToProps(state) {
  return {
    navigation: state.navigation
  }
}

export default connect(mapStateToProps)(App)
