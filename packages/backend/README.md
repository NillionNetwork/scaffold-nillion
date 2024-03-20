# backend

## fetch release
```shell
RELEASE=v2024-03-12-d2d0a82c8
aws s3 sync s3://nillion-releases/$RELEASE $RELEASE
```

## create service
sls deploy
