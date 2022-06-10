
window.addEventListener('DOMContentLoaded', function() {
  listObjects();
});

function listObjects() {
  let userPool = create_userPool();
  let cognitoUser = userPool.getCurrentUser();
  let googleToken = localStorage.getItem('google+');

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err,session) {
      if (err) return alert(err.message || JSON.stringify(err));
      let cognitoToken = session.getIdToken().getJwtToken();
      setCredential('cognito',cognitoToken);
      s3ListObjectsV2(cognitoToken);
    });
  } else if (googleToken != null) {
    setCredential('google+',googleToken);
    s3ListObjectsV2(googleToken);
  }
}

function download(objectKey) {
  let userPool = create_userPool();
  let cognitoUser = userPool.getCurrentUser();
  let googleToken = localStorage.getItem('google+');

  if (cognitoUser != null) {
    cognitoUser.getSession(function(err,session) {
      if (err) return alert(err.message || JSON.stringify(err));
      let cognitoToken = session.getIdToken().getJwtToken();
      setCredential('cognito',cognitoToken);
      s3GetObject(objectKey);
    });
  } else if (googleToken != null) {
    setCredential(googleToken);
    s3GetObject(objectKey);
  }
}

function s3ListObjectsV2(token) {
  let attributes = parseJWT(token);
  let prefix = attributes.sub + "/"

  const s3 = new AWS.S3({apiVersion: '2006-03-01'});
  let params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  };
  s3.listObjectsV2(params, function(err,data) {
    if (err) return alert("There was an error listing your files: ", err.message);

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

function s3GetObject(objectKey) {
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