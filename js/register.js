
function signUp() {
  let userPool = create_userPool();
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  let email = document.getElementById('email').value;
  let phoneNumber = document.getElementById('phonenumber').value;

  var attributeList = [
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'email',
      Value: email
    }),
    new AmazonCognitoIdentity.CognitoUserAttribute({
      Name: 'phone_number',
      Value: phoneNumber
    })
  ];

  userPool.signUp(username, password, attributeList, null, function(
      err, 
      result
  ) {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      } else {
        let cognitoUser = result.user;
        let username = cognitoUser.getUsername()
        alert(`${username} is registered!`);
        location.href="login.html";
      }
  });
};