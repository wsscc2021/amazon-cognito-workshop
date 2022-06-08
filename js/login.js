
function create_userPool() {
  let userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: "us-east-1_nQcxl44OP",
    ClientId: "68trdifrt2803vh285kb22rl0t"
  });
  return userPool;
};

function signIn() {
  let userPool = create_userPool();
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;

  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: username,
    Password: password,
  });

  var cognitoUser = new AmazonCognitoIdentity.CognitoUser({
    Username: username,
    Pool: userPool,
  });

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      // var accessToken = result.getAccessToken().getJwtToken();
      // var idToken = result.getIdToken().getJwtToken();
      alert(`${username} login successfully`)
      location.href="index.html";
    },

    onFailure: function(err) {
      alert(err.message || JSON.stringify(err));
    },
  });
};