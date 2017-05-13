const functions = require('firebase-functions')
const admin = require('firebase-admin')
const secureCompare = require('secure-compare')
const rp = require('request-promise')
admin.initializeApp(functions.config().firebase)

const DB = admin.database()
const config = functions.config()
const auth = admin.auth()

/**
 * USERS CLEANUP ON AUTH DELETE
 */

exports.cleanupUserData = functions.auth.user().onDelete(event => {
  const uid = event.data.uid;
  return DB.ref(`/users/${uid}`).remove()
})

/**
 * DB CRON CLEANUP
 * Nightly http request from https://cron-job.org at 22.00 to trigger vote cleanup
 */

exports.dbcleanup = functions.https.onRequest((req, res) => {
  const key = req.query.key

  // Exit if the keys don't match
  if (!secureCompare(key, functions.config().cron.key)) {
    console.log('The key provided in the request does not match the key set in the environment. Check that', key,
      'matches the cron.key attribute in `firebase env:get`')
    res.status(403).send('Security key does not match. Make sure your "key" URL query parameter matches the ' +
      'cron.key environment variable.')
    return;
  }

  const restaurants = DB.ref('/restaurants/')
  const history = DB.ref('/history/')

  restaurants.once('value').then(snapshot => {
    const data = snapshot.val()
    //batch removal of current votes, moving them to previous votes
    return Object.keys(data).reduce((updates, key) => {
      const current = data[key]
      if (current.currentVotes) {
        updates[`${current.id}/currentVotes`] = null
        Object.keys(current.currentVotes).forEach(key => {
          updates[`${current.id}/previousVotes/${key}-${current.currentVotes[key]}`] = current.currentVotes[key]
        })
      }
      return updates
    }, {})

  }).then(updates => {
    if (Object.keys(updates).length > 0) {
      return restaurants.update(updates)
        .then(() => {
          console.log("These votes for today have been cleaned up: ", updates)
          res.send('Vote cleanup successful')
        })
        .catch(() => {
          console.log("An error occurred cleaning up today's votes: ", updates)
          res.error('Vote cleanup failed')
        })
    }
    console.log('No votes to cleanup')
    return res.send('No votes to cleanup')
  })
})

/**
 *  SLACK NOTIFICATIONS
 *  on new vote, send slack notification with user name and restaurant
 */

exports.slackVoteNotification = functions.database.ref('/restaurants/{restaurantId}/currentVotes/{userId}')
  .onWrite(event => {

    const userId = event.params.userId
    const restaurantId = event.params.restaurantId
    const getAuthor = auth.getUser(userId)

    const getRestaurant = DB.ref(`restaurants/${restaurantId}`)
      .once('value')
      .then(snapshot => snapshot.val())

    return Promise.all([getAuthor, getRestaurant])
      .then(([author, restaurant]) => {
        //we will only send a message if it was a new, not deletion of the old
        const wasDeletion = !restaurant.currentVotes || !restaurant.currentVotes[userId]

        const payload = {
          notification: {
            title: `${author.displayName} on valinnut uuden junan!`,
            body: restaurant.name.toUpperCase(),
            icon: author.photoURL
          }
        }

        if (!wasDeletion) {
          postToSlack(author, restaurant).then(res => {
            res.end()
          }).catch(console.error)
        }
      })
  })


function postToSlack(author, restaurant) {

  const lounasUrl = 'https://www.lounaat.info/'

  return rp({
    method: 'POST',
    uri: config.webhooks.slack,
    body: {
      text: `${author.displayName} on valinnut: ${restaurant.name}\n<${lounasUrl}|Millä lounasjunalla sinä menet?>`
    },
    json: true
  });
}

