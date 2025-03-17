#!/bin/bash

rm -r dist
mkdir dist

cp -r src/media dist/

grunt purifycss

grunt cssmin

grunt uglify

grunt copy

grunt htmlmin

perl -0pi -e 's/<link rel="stylesheet" href="css\/bootstrap.css"><link rel="stylesheet" href="css\/animate.css"><link rel="stylesheet" href="css\/main.css">/<link rel="stylesheet" href="css\/purestyles.css">/' dist/*.html