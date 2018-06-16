# If the directory, `dist`, doesn't exist, create `dist`
stat dist || mkdir dist
# Archive artifacts
zip dist/$npm_package_name.zip -r dist package.json package-lock.json
