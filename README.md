This real restaurant website has been done as a side project to work on HTML and CSS and has no commercial purposes. 


## Useful commands

## Deployment

### Automatic Deployment (Recommended)
Push to the main/master branch and GitHub Actions will automatically:
1. Build the site using Jekyll and Grunt
2. Deploy to GitHub Pages via the `gh-pages` branch

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Manual Deployment (Legacy)
```
bash script.sh
git add .
git commit -m "Commit message"
git push
git subtree push --prefix dist origin gh-pages
```

Preview online
```
jekyll serve
```

## Installation prerequisites
- Install nvm : `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`
- Install npm : `nvm install --lts`
<!-- - Install grunt packages: `npm install` -->
- Install grunt : `npm install -g grunt-cli && npm install grunt`

## Author

Original Theme:
[Marios Sofokleous](https://www.msof.me/) (PictureElement)

## Useful links
- to deploy https://gist.github.com/cobyism/4730490
- grunt https://semaphoreci.com/community/tutorials/getting-started-with-grunt-js
https://stackoverflow.com/questions/13925916/what-is-causing-this-error-fatal-error-unable-to-find-local-grunt

## Tips / Issues I got and how I solved them
- In case of broken pages when previewing, check if the html pages use the correct css files => check if perl commands worked : issue is often \n not recognized
- Remove node_modules
- If can't push to gh-pages, https://stackoverflow.com/questions/37937984/git-refusing-to-merge-unrelated-histories-on-rebase then https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site or https://stackoverflow.com/questions/52087783/git-push-to-gh-pages-updates-were-rejected

# Todo
Multi-language website