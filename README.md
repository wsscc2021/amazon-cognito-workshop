
## Amazon Cognito Workshop

Cognito 서비스를 데모 어플리케이션과 함께 배포하여 인증 및 인가를 테스트합니다.

데모를 통해 다음과 같은 내용을 확인할 수 있습니다.

1. Cognito User Pool의 사용자를 생성하고 프로필을 관리할 수 있습니다.

2. Cognito User Pool 로그인을 통해 JWT형태의 Cognito ID Token을 얻을 수 있습니다.

3. Google+ 로그인을 통해 JWT형태의 Google ID Token을 얻을 수 있습니다.

4. Cognito ID Token 또는 Google ID Token을 사용하여 Cognito Identity Pool에서 Temproray Credential을 얻을 수 있습니다.

5. 획득한 Temporary Credential을 통해 AWS Service(s3)에 접근할 수 있습니다.

6. Cognito User 및 Google User의 Attribute를 Princiapl Tag로 매핑하여 ABAC(Attribute Based Access Control) 모델의 IAM Policy를 작성할 수 있습니다.

(*데모 어플리케이션은 Cognito 동작을 확인해보기 위해서 개발하였으며 UI가 다소 불편할 수 있습니다.)

### Demo

1. Create Google API

    - Access `Google Cloud Platform` console
    - `APIs & Services` -> `Credentials` -> `CREATE CREDENTIAL` -> `OAuth client ID`
        - Application type: `Web application`
        - Name: `Web client`
        - Authorized Javascript origins: empty(TBD)
        - Authorized redirect URIs: empty(TBD)
        - `CREATE`
        - COPY ClientID

2. Create cloudformation stack from template file.

    - Parameters -> GoogleClientID = OAuth Client ID that created from GCP.

3. Attribute mappings on Cognito identity pool

    - AWS Console -> Cognito Identity Pool (that created from cloudformation)

    - Edit Identity pool -> Authentication providers -> Cognito

    - Attributes for access control -> Use custom mappings -> Add principal tag

        - Tag key for principal: `sub`
        
        - Attribute name: `sub`

    - Same configure to google+ provider

4. modify `js/base.js`

    ```
    const AWS_REGION = '<YOUR REGION>';
    const USERPOOL_ID = "<YOUR USER POOL ID>";
    const CLIENT_ID = "<YOUR USER POOL CLIENT ID>";
    const IDENTITY_POOL_ID = "<YOUR IDENTITY POOL ID>";
    const BUCKET_NAME = "<YOUR BUCKET FOR APP STORAGE>";
    ```

5. modify `login.html` and google client

    ```
    <div id="g_id_onload"
        data-client_id="<YOUR GOOGLE CLIENT ID>"
        data-callback="handleCredentialResponse">
    ```

    - Add Authorized javascript origins: `cloudfront domain name`

      ex. `https://d168n0ypmkhbbr.cloudfront.net`


6. Upload static web contents to s3 bucket for hosting.

    ```
    aws s3 cp --recursive web/ s3://<YOUR BUCKET FOR WEB STATIC CONTENTS>/
    ```

7. Go testing.