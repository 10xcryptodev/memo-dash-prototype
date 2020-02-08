import _ from 'lodash'

function proxy(type, def) {
  // Bypass proxy for now...
  return new Proxy({}, {
    get(target, name) {
      // Promises will always check to see if this prop exists
      if (name === 'then') {
        return undefined
      }

      if (_.has(def, name)) {
        return def[name]
      } else {
        console.error('NEED PROP', type + '.' + name)
      }

      return 'TEMPVAL'
    },
    set(target, name, value) {
      if (def.name === 'bob' && name === 'username') {
        debugger
      }

      def[name] = value
      return true
    }
  })
}

function NewUser(props) {
  // return proxy('user', new User(props))
  return new User(props)
}

function NewDAP(props) {
  // return proxy('dap', new DAP(props))
  return new DAP(props)
}

function NewSignup(props) {
  // return proxy('signup', new Signup(props))
  return new Signup(props)
}

function NewMemo(props) {
  // return proxy('memo', new Memo(props))
  return new Memo(props)
}

class DAP {
  constructor(schema) {
    _.extend(this, schema)
    this.id = this.$id
  }
}

class User {
  constructor(username) {
    this.id = _.uniqueId('user')
    this.username = username
    this.name = username
    this.signups = []
    this.following = []
    this.followers = []
    this.likes = []
    this.profile = proxy('profile', {
      username: username,
      bio: 'This mysterious user prefers to remain an enigma.',
      address: 'Their location is undisclosed',
      avatarUrl: undefined,
      followersCount: 0,
      followingCount: 0,
      likesCount: 0,
    })
  }
}

class Signup {
  constructor(data) {
    _.extend(this, data)
  }
}

class Memo {
  constructor(data) {
    _.extend(this, data)
    this.replies = []
  }
}

function filterDeleted(memo) {
  return !memo.deleted
}

function filterReplies(memo) {
  return !memo.parentTxi
}

export default class MemoDashClient {
  daps = []
  users = []
  memos = []
  currentUser = undefined
  currentDap = undefined


  constructor() {
    console.log('stub')
  }

  createBlockchainUser(username) {
    console.log('@createBlockchainUser', Array.from(arguments).slice(-2))
    // console.log('@createBlockchainUser', username)
    // console.log('create user', username)
    const user = NewUser(username)
    this.users.push(user)
    return Promise.resolve(username)
  }

  login(username) {
    console.log('@login', Array.from(arguments).slice(-2))
    if (typeof username !== 'string') {
      username = username.blockchainUsername
    }

    let user = _.find(this.users, {username})
    if (user === undefined) {
      console.error('user not found', username, this.users)
      return Promise.reject('user not found')
    }
    this.currentUser = user
    return Promise.resolve(user)
  }

  logout() {
    console.log('@logout', Array.from(arguments).slice(-2))
    if (this.currentUser === undefined) {
      console.error('Cannot logout - no current user')
      return Promise.reject()
    }
    delete this.currentUser
    return Promise.resolve()
  }

  searchDaps(title) {
    console.log('@searchDaps', Array.from(arguments).slice(-2))
    return Promise.resolve(_.filter(this.daps, {title}))
  }

  createDap(schema) {
    console.log('@createDap', Array.from(arguments).slice(-2))
    const dap = NewDAP(schema)
    this.daps.push(dap)
    return Promise.resolve(dap.id)
  }

  getDap(dapid) {
    console.log('@getDap', Array.from(arguments).slice(-2))
    return Promise.resolve(_.find(this.daps, {id: dapid}))
  }

  setDap(dap) {
    console.log('@setDap', Array.from(arguments).slice(-2))
    this.currentDap = dap
  }

  signup({text, avatarUrl, address, name}) {
    console.log('@signup', Array.from(arguments).slice(-2))
    // const user = _.find(this.users, {a: this.currentUser})
    // console.log('new signup', text, avatarUrl, address, name)
    // this.currentUser.signups.push({
    //   text,
    //   avatarUrl,
    //   address,
    //   name,
    // })

    this.currentUser.profile.bio = text
    this.currentUser.profile.avatarUrl = avatarUrl
    this.currentUser.profile.address = address
    this.currentUser.profile.name = name

    return Promise.resolve()
  }

  log() {
    console.log.apply(console, arguments)
  }

  searchUsers(username) {
    console.log('@searchusers', username)
    const user = _.find(this.users, {username})
    return Promise.resolve([user])
  }

  getAllProfiles() {
    // No args - current user?
    console.log('@getAllProfiles', Array.from(arguments).slice(-2))
    const allProfiles = this.users.map(u => u.profile)
    return Promise.resolve(allProfiles)
  }

  getUserProfile(username) {
    console.log('@getUserProfile', username)
    // const profile = proxy('userprofile', {})
    const user = _.find(this.users, {username})
    if (user === undefined) {
      debugger
      console.error('user not found')
      return Promise.reject()
    }
    console.log(user.profile.bio)
    return Promise.resolve(user.profile)
  }

  updateProfile({text}) {
    console.log('@updateProfile', Array.from(arguments).slice(-2))
    this.currentUser.profile.bio = text
    return Promise.resolve()
  }

  getUserId(username) {
    console.log('@getUserId', Array.from(arguments).slice(-2))
    const targetUser = _.find(this.users, {username})
    if (targetUser === undefined) {
      console.error('user not found')
      return Promise.reject('user not found')
    }
    return Promise.resolve(targetUser.id)
  }

  followUser(username) {
    console.log('@followUser', Array.from(arguments).slice(-2))
    // console.log(this.currentUser.username, 'is following user', username)

    const targetUser = _.find(this.users, {username})
    if (targetUser === undefined) {
      console.error('user not found')
      return Promise.reject('user not found')
    }

    this.currentUser.following.push(targetUser)
    this.currentUser.profile.followingCount++
    targetUser.followers.push(this.currentUser)
    targetUser.profile.followersCount++

    return Promise.resolve()
  }

  unFollowUser(username) {
    const targetUser = _.find(this.users, {username})
    if (targetUser === undefined) {
      console.error('user not found')
      return Promise.reject('user not found')
    }

    this.currentUser.following = _.without(this.currentUser.following, targetUser)
    this.currentUser.profile.followingCount--
    targetUser.followers = _.without(targetUser.followers, this.currentUser)
    targetUser.profile.followersCount--

    return Promise.resolve()
  }

  getUserFollowers(username) {
    console.log('@getUserFollowers', Array.from(arguments).slice(-2))
    const user = _.find(this.users, {username})
    if (user === undefined) {
      console.error('user not found')
      return Promise.reject()
    }
    return Promise.resolve(user.followers)
  }

  getUserFollowing(username) {
    console.log('@getUserFollowing', Array.from(arguments).slice(-2))
    const user = _.find(this.users, {username})
    if (user === undefined) {
      console.error('user not found')
      return Promise.reject()
    }
    return Promise.resolve(user.following)
  }

  getUserLikes(username) {
    console.log('@getUserLikes', Array.from(arguments).slice(-2))

    const user = _.find(this.users, {username})
    if (user === undefined) {
      console.error('User not found')
      return Promise.reject('User not found')
    }

    return Promise.resolve(user.likes)
  }

  getUsername(userId) {
    console.log('@getUsername', Array.from(arguments).slice(-2))
    const user = _.find(this.users, {id: userId})
    return Promise.resolve(user.username)
  }

  getMemo(username, memoId) {
    console.log('@getMemo', Array.from(arguments).slice(-2))

    const memo = _.find(this.memos, {username, idx: memoId})
    if (memo === undefined) {
      console.error('Memo not found')
      return Promise.reject('Memo not found')
    }

    return Promise.resolve(memo)
  }

  getMemosByUsername(username) {
    const memos = this.memos.filter(m => m.username === username).filter(filterDeleted).filter(filterReplies)
    console.log('@getMemosByUsername', Array.from(arguments).slice(-2), memos)
    return Promise.resolve(memos)
  }

  getMemos() {
    const memos = this.memos.filter(filterDeleted).filter(filterReplies)
    console.log('@getMemos', Array.from(arguments).slice(-2), memos)
    return Promise.resolve(memos)
  }

  postMemo(memoText) {
    console.log('@postMemo', Array.from(arguments).slice(-2))

    const memo = NewMemo({
      username: this.currentUser.username,
      idx: _.uniqueId('memo'),
      memoRepliesCount: 0,
      memoLikesCount: 0,
      memoTipTotal: 0,
      memoDatetime: new Date(),
      memoText,
    })

    this.memos.push(memo)
    return Promise.resolve()
  }

  deleteMemo(memoId) {
    console.log('@deleteMemo', Array.from(arguments).slice(-2))

    const memo = _.find(this.memos, {idx:memoId})
    // this.memos = _.without(this.memos, memo)
    memo.deleted = true

    if (memo.parentIdx) {
      const parentMemo = _.find(this.memos, {idx: memo.parentIdx})
      parentMemo.memoRepliesCount--
    }

    return Promise.resolve()
  }

  likeMemo(username, memoId) {
    console.log('@likeMemo', Array.from(arguments).slice(-2))

    const memo = _.find(this.memos, {username, idx: memoId})
    if (memo === undefined) {
      console.error('memo not found')
      return Promise.reject('memo not found')
    }

    const user = _.find(this.users, {username})
    if (user === undefined) {
      console.error('user not found')
      return Promise.reject('user not found')
    }

    user.profile.likesCount++
    memo.memoLikesCount++

    this.currentUser.likes.push(proxy('like', {
      username: this.currentUser.username,
      userId: this.currentUser.username,
      idx: _.uniqueId('like'),
      relation: proxy('relation', {
        userId: user.id,
        index: memo.idx
      }),
    }))

    return Promise.resolve(memo)
  }

  removeLike(likeId) {
    console.log('@removeLike', Array.from(arguments).slice(-2))

    const like = _.find(this.currentUser.likes, {idx: likeId})
    if (like === undefined) {
      console.error('like not found')
      return Promise.reject('like not found')
    }

    const user = _.find(this.users, {id: like.relation.userId})
    if (user === undefined) {
      console.error('user not found')
      return Promise.reject('user not found')
    }

    const memo = _.find(this.memos, {idx: like.relation.index})
    if (memo === undefined) {
      console.error('memo not found')
      return Promise.reject('memo not found')
    }

    user.profile.likesCount--
    memo.memoLikesCount--

    this.currentUser.likes = _.without(this.currentUser.likes, like)

    return Promise.resolve()
  }

  editMemo(memoId, text) {
    console.log('@editMemo', Array.from(arguments).slice(-2))

    const memo = _.find(this.memos, {idx: memoId})
    if (memo === undefined) {
      console.error('Memo not found')
      return Promise.reject('Memo not found')
    }

    memo.memoText = text

    return Promise.resolve()
  }

  replyToMemo(username, memoId, memoText) {
    console.log('@replyToMemo', Array.from(arguments).slice(-2))

    const user = _.find(this.users, {username})
    if (user === undefined) {
      console.error('User not found')
      return Promise.reject('User not found')
    }

    const memo = _.find(this.memos, {idx: memoId})
    if (memo === undefined) {
      console.error('Memo not found')
      return Promise.reject('Memo not found')
    }

    const reply = NewMemo({
      username: this.currentUser.username,
      idx: _.uniqueId('memo'),
      memoRepliesCount: 0,
      memoLikesCount: 0,
      memoTipTotal: 0,
      memoDatetime: new Date(),
      memoText,
      parentIdx: memo.idx // made up by me, do they use something like this?
    })

    this.memos.push(reply)
    memo.memoRepliesCount++
    memo.replies.push({username, idx: reply.idx})

    return Promise.resolve()
  }

  getMemoReplies(username, memoId) {
    console.log('@getMemoReplies', Array.from(arguments).slice(-2))

    const memo = _.find(this.memos, {idx: memoId})
    if (memo === undefined) {
      console.error('memo not found')
      return Promise.reject('memo not found')
    }
    const replies = memo.replies.map(ref => _.find(this.memos, {idx: ref.idx})).filter(filterDeleted)
    console.log('REPLIES', replies)

    return Promise.resolve(replies)
  }
}