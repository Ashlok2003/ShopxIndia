#!/bin/sh

APP_CONFIG=$1
export APP_CONFIG=$1

echo ==--------CheckDependencies---------==
aws --version
npm --version
jq --version

ACCOUNT=$(cat $APP_CONFIG | jq -r '.Project.Account')
REGION=$(cat $APP_CONFIG | jq -r '.Project.Region')
PROFILE_NAME=$(cat $APP_CONFIG | jq -r '.Project.Profile')

echo ==--------ConfigInfo---------==
echo $APP_CONFIG
echo $ACCOUNT
echo $REGION
echo $PROFILE_NAME
echo .
echo .

echo ==--------SetAwsProfileEnv---------==
if [ -z "$PROFILE_NAME" ]; then
    echo "Project.Profile is empty, default AWS Profile is used"
else
    if [ -z "$ON_PIPELINE" ]; then
        echo "$PROFILE_NAME AWS Profile is used"
        export AWS_PROFILE=$PROFILE_NAME
    else
        echo "Now on CodePipeline, default AWS Profile is used"
    fi
fi
echo .
echo .

echo ==--------InstallCDKDependencies---------==
npm install
echo .
echo .

echo ==--------CDKVersionCheck---------==
alias cdk-local="./node_modules/.bin/cdk"
cdk --version
cdk-local --version
echo .
echo .

echo ==--------BootstrapCDKEnvironment---------==
cdk-local bootstrap aws://$ACCOUNT/$REGION
echo .
echo .