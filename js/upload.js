
function upload() {
  let userPool = create_userPool();
  let cognitoUser = userPool.getCurrentUser();
  let googleToken = localStorage.getItem('google+');

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err,session) {
      if (err) return alert(err.message || JSON.stringify(err));
      var cognitoToken = session.getIdToken().getJwtToken();
      setCredential('cognito', cognitoToken);
      s3upload(cognitoToken);
    });
  } else if (googleToken != null) {
    setCredential('google+',googleToken);
    s3upload(googleToken);
  }
}

function s3upload(token) {
  var attributes = parseJWT(token)
  let files = document.getElementById("file").files;
  let file = files[0];
  let objectKey = attributes.sub + "/" + file.name;
  let tags = [
    "sub=" + attributes.sub,
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