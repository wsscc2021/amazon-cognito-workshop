
const AWS_REGION = 'us-east-1';
const USERPOOL_ID = "us-east-1_nQcxl44OP";
const CLIENT_ID = "68trdifrt2803vh285kb22rl0t";
const IDENTITY_POOL_ID = "us-east-1:cdab67dd-2571-4741-85ce-f4e64faae15d";
const BUCKET_NAME = "useast1-example-bucket";

function create_userPool() {
  let userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: USERPOOL_ID,
    ClientId: CLIENT_ID
  });
  return userPool;
};

function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

function upload() {
  let userPool = create_userPool();
  let cognitoUser = userPool.getCurrentUser();
  let googleToken = localStorage.getItem('google+');

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err,session) {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
      
      AWS.config.region = AWS_REGION;
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IDENTITY_POOL_ID, // your identity pool id here
        Logins: {
          // Change the key below according to the specific region your user pool is in.
          [`cognito-idp.${AWS_REGION}.amazonaws.com/${USERPOOL_ID}`]: session
              .getIdToken()
              .getJwtToken(),
        },
      });

      cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
        for (i=0; result.length>i; i++) {
          let key = result[i].getName();
          let value = result[i].getValue();
          switch (key) {
            case "sub":
              s3upload(AWS.config, value);
              break;
          }
        }
      });
    });
  } else if (googleToken != null) {
    AWS.config.region = AWS_REGION;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IDENTITY_POOL_ID, // your identity pool id here
      Logins: {
        // Change the key below according to the specific region your user pool is in.
        'accounts.google.com': googleToken,
      },
    });
    
    var attributes = parseJWT(googleToken);
    
    s3upload(AWS.config, attributes.sub);
  }
}

function s3upload(aws_config, sub) {
  AWS.config = aws_config
  let files = document.getElementById("file").files;
  let file = files[0];
  let objectKey = sub + "/" + file.name;
  let tags = [
    "sub=" + sub,
  ]

  // Use S3 ManagedUpload class as it supports multipart uploads
  var managedUpload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: file,
      Tagging: tags.join('&')
    }
  });

  var promise = managedUpload.promise();

  promise.then(
    function(data) {
      alert("Successfully uploaded.");
      location.href = "download.html"
    },
    function(err) {
      console.log(err);
      return alert("There was an error uploading your file: ", err.message);
    }
  );
}