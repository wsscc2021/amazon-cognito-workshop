
const AWS_REGION = 'us-east-1';
const USERPOOL_ID = "us-east-1_nQcxl44OP";
const CLIENT_ID = "68trdifrt2803vh285kb22rl0t";
const IDENTITY_POOL_ID = "us-east-1:cdab67dd-2571-4741-85ce-f4e64faae15d";
const BUCKET_NAME = "useast1-example-bucket";

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
}