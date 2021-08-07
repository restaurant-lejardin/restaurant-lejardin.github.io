This real restaurant website has been done as a side project to work on HTML and CSS and has no commercial purposes. 


## Useful commands

###
Publish to website subtree
```
bash script.sh
git subtree push --prefix dist origin gh-pages
```

Preview online
Go to **src** during dev or **dist** before deploying folder, then
```
browser-sync start --server --files "css/*.css"
```

## Author

Original Theme:
[Marios Sofokleous](https://www.msof.me/) (PictureElement)

## Useful links
- to deploy https://gist.github.com/cobyism/4730490
- grunt https://semaphoreci.com/community/tutorials/getting-started-with-grunt-js
https://stackoverflow.com/questions/13925916/what-is-causing-this-error-fatal-error-unable-to-find-local-grunt

## Tips
In case of broken pages when previewing, check if the html pages use the correct css files => check if perl commands worked