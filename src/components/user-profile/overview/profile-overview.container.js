import {connect} from 'react-redux'
import {push} from 'connected-react-router'

import ProfileOverviewComponent from './profile-overview.component'
import {getUserFollowers, getUserFollowing} from "../../../store/selectors";

const mapStateToProps = (state, ownProps) => {
  return {
    followers: getUserFollowers(ownProps.userProfile.username)(state),
    following: getUserFollowing(ownProps.userProfile.username)(state),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onGoToProfileClicked: username => {
      dispatch(push(`/profile/${username}`))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileOverviewComponent)
