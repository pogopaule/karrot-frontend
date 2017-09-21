import router from '@/router'

export default store => {
  let isLoggedIn = () => store.getters['auth/isLoggedIn']
  let hasActiveGroup = () => !!store.getters['groups/activeGroup']
  let getUserGroupId = () => isLoggedIn() && store.getters['auth/user'].currentGroup
  let getBreadcrumbNames = () => store.getters['breadcrumbs/allNames']

  router.beforeEach((to, from, next) => {
    if (to.matched.some(m => m.meta.requireLoggedIn) && !isLoggedIn()) {
      let {name, params} = to
      store.dispatch('auth/setRedirectTo', {name, params})
      next({name: 'login'})
    }
    else {
      next()
    }
  })

  router.beforeEach((to, from, next) => {
    if (to.matched.some(m => m.meta.requireLoggedOut) && isLoggedIn()) {
      next({name: 'index'})
    }
    else {
      next()
    }

    let path = to.path
    // redirect homescreen correctly
    if (path === '/') {
      if (getUserGroupId()) {
        next({name: 'group', params: { groupId: getUserGroupId() }})
      }
      else {
        next({name: 'group', params: { groupId: 1 }})
      }
    }
    next()
  })

  router.afterEach((to, from) => {
    // save Breadcrumbs to store
    if (!(to.meta) || !(to.meta.breadcrumbs)) {
      store.dispatch('breadcrumbs/setAll', {breadcrumbs: [{name: 'not defined'}]})
    }
    store.dispatch('breadcrumbs/setAll', {breadcrumbs: to.meta.breadcrumbs || []})

    // save active group/store/user
    if (to.params.groupId) {
      store.dispatch('groups/selectGroup', {groupId: to.params.groupId})
    }
    if (to.params.groupInfoId) {
      // Why do we need to parse the ID here, but not in the others?
      store.dispatch('groups/selectGroupInfo', parseInt(to.params.groupInfoId, 10))
    }
    if (to.params.storeId) {
      store.dispatch('stores/selectStore', {storeId: to.params.storeId})
    }
    if (to.params.userId) {
      store.dispatch('users/selectUser', {userId: to.params.userId})
    }

    /* If:
        - the group is not mentioned in the URL
        - we do not have an active group
        - the user has a currentGroup
      Then:
        - set the users current group to be the active one
     */
    if (!to.params.groupId && !hasActiveGroup() && isLoggedIn()) {
      let groupId = getUserGroupId()
      if (groupId) store.dispatch('groups/selectGroup', { groupId })
    }
  })

  store.watch(getBreadcrumbNames, breadcrumbs => {
    let names = getBreadcrumbNames().slice().reverse()
    names.push('Karrot')
    document.title = names.join(' | ')
  })
}
