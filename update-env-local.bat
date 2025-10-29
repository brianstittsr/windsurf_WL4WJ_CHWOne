
@echo off
REM This script will update your .env.local file to remove AWS settings

REM Create backup of current .env.local
copy .env.local .env.local.aws-backup

REM Create a temporary file
type .env.local | findstr /v "^AWS_ ^NEXT_PUBLIC_AWS_ ^NEXT_PUBLIC_AUTH_PROVIDER= ^COGNITO_ ^NEXT_PUBLIC_COGNITO_" > .env.local.temp

REM Replace the original file
move /y .env.local.temp .env.local

echo Updated .env.local to remove AWS settings
