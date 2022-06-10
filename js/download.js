
const AWS_REGION = 'us-east-1';
const USERPOOL_ID = "us-east-1_nQcxl44OP";
const CLIENT_ID = "68trdifrt2803vh285kb22rl0t";
const IDENTITY_POOL_ID = "us-east-1:cdab67dd-2571-4741-85ce-f4e64faae15d";
const BUCKET_NAME = "useast1-example-bucket";

window.addEventListener('DOMContentLoaded', function() {
  listObjects();
});

function parseJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

function create_userPool() {
  let userPool = new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: USERPOOL_ID,
    ClientId: CLIENT_ID
  });
  return userPool;
};

function listObjects() {
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
              s3ListObjectsV2(AWS.config, value);
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

    console.log(attributes);

    s3ListObjectsV2(AWS.config, attributes.sub);
  }
}

function download(objectKey) {
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

      s3GetObject(AWS.config, objectKey);
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
    s3GetObject(AWS.config, objectKey);
  }
}

function s3ListObjectsV2(aws_config, sub) {
  AWS.config = aws_config;
  var prefix = sub + "/"

  // Use S3 listObjectsV2
  var s3 = new AWS.S3({apiVersion: '2006-03-01'});
  var params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  };
  s3.listObjectsV2(params, function(err,data) {
    if (err) {
      alert("There was an error listing your files: ", err.message);
      console.log(err);
      return;
    }
    var objectsHTML = data.Contents.map(function(content,idx,source) {
      return `<li>${content.Key}<button onclick="download('${content.Key}')">download</button></li>`;
    });
    var templateHTML = [
      "<ul>",
      objectsHTML.join(''),
      "</ul>",
    ];
    document.getElementById('content').innerHTML = templateHTML.join('');
  });
}

function s3GetObject(aws_config, objectKey) {
  AWS.config = aws_config;

  var s3 = new AWS.S3({apiVersion: '2006-03-01', signatureVersion: 'v4'});
  var params = {
    Bucket: BUCKET_NAME,
    Key: objectKey,
    Expires: 60
  };
  s3.getSignedUrl('getObject', params, function(err,url) {
    if(err) {
      alert("There was an error listing your files: ", err.message);
      return;
    }
    window.open(url, '_blank');
  });
}