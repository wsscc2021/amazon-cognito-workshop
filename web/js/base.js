
const AWS_REGION = '<YOUR REGION>';
const USERPOOL_ID = "<YOUR USER POOL ID>";
const CLIENT_ID = "<YOUR USER POOL CLIENT ID>";
const IDENTITY_POOL_ID = "<YOUR IDENTITY POOL ID>";
const BUCKET_NAME = "<YOUR BUCKET FOR APP STORAGE>";

window.addEventListener('DOMContentLoaded', function() {
  currentSession();
});

function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

function epochToLocaleString(epoch) {
  var myDate = new Date(epoch*1000);
  console.log(myDate.toLocaleString());
};

function create_userPool() {
  let userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: USERPOOL_ID,
    ClientId: CLIENT_ID
  });
  return userPool;
};

function currentSession() {
  let userPool = create_userPool();
  let cognitoUser = userPool.getCurrentUser();
  let googleToken = localStorage.getItem('google+');

  function profileWrite(token) {
    var attributes = parseJWT(token);
    var exp = new Date(attributes.exp*1000).toLocaleString();
    var userProfileHTML = [
      `<p id="sub">sub: ${attributes.sub}</p>`,
      `<p id="iss">iss: ${attributes.iss}</p>`,
      `<p id="exp">exp: ${exp}</p>`,
      `<button onclick="signOut()">signOut</button>`,
    ]
    document.getElementById('user-profile').innerHTML = userProfileHTML.join('');
  };

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err,session) {
      if (err) return alert(err.message || JSON.stringify(err));
      cognitoToken = session.getIdToken().getJwtToken();
      profileWrite(cognitoToken);
    });
  } else if (googleToken != null) {
    profileWrite(googleToken);
  } else {
    document.getElementById('user-profile').innerHTML = "<p>Please login...</p>";
  }
};

function setCredential(idp,token) {
  // set region
  AWS.config.region = AWS_REGION;
  // set credential from sts
  switch (idp) {
    case "cognito":
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID, // your identity pool id here
        Logins: {
          [`cognito-idp.${AWS_REGION}.amazonaws.com/${USERPOOL_ID}`]: token,
        },
      });
      break;
    case "google+":
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID, // your identity pool id here
        Logins: {'accounts.google.com': token},
      });
      break;
    default:
      return null;
  }
};

function signOut() {
  let userPool = create_userPool();
  let cognitoUser = userPool.getCurrentUser();
  let googleToken = localStorage.getItem('google+');

  if (cognitoUser != null) {
    cognitoUser.signOut();
    location.reload();
  }
  if (googleToken != null) {
    localStorage.removeItem('google+');
    location.reload();
  }
};
