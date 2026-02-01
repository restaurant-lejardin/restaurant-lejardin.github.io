#!/bin/bash

# Step 1: Build the Jekyll site for production
echo "Building Jekyll site for production..."
JEKYLL_ENV=${JEKYLL_ENV:-production} jekyll build --source src

# Step 2: Clean and prepare the dist directory
echo "Cleaning and preparing dist directory..."
rm -r dist
mkdir dist

# Step 3: Run Grunt tasks (copying from _site instead of src)
echo "Running Grunt tasks..."
grunt purifycss
grunt cssmin
grunt uglify
grunt copy
grunt htmlmin

grunt serve-dist
# http://localhost:8080