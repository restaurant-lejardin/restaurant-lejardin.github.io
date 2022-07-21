#!/bin/bash

rm -r dist
mkdir dist

cp -r src/media dist/

grunt purifycss

grunt cssmin

grunt uglify

grunt copy

# perl -0pi -e 's/    <!-- Bootstrap -->\r\n    <link rel="stylesheet" href="..\/css\/bootstrap.css">\r\n    <!-- Animate.css -->\r\n    <link rel="stylesheet" href="..\/css\/animate.css">\r\n    <!-- Default stylesheet -->\r\n    <link rel="stylesheet" href="..\/css\/main.css">/    <link rel="stylesheet" href="..\/css\/purestyles.css">/' dist/*.html  
perl -0pi -e 's/    <!-- Bootstrap -->\r\n    <link rel="stylesheet" href="css\/bootstrap.css">\r\n    <!-- Animate.css -->\r\n    <link rel="stylesheet" href="css\/animate.css">\r\n    <!-- Default stylesheet -->\r\n    <link rel="stylesheet" href="css\/main.css">/    <link rel="stylesheet" href="css\/purestyles.css">/' dist/*.html
 
grunt critical

grunt htmlmin
