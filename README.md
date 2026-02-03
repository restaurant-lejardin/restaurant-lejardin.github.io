This real restaurant website has been done as a side project to work on HTML and CSS and has no commercial purposes. 


## Installation Prerequisites

### 1. Ruby & Bundler
**macOS (Homebrew):**
```bash
brew install ruby
```

**Ubuntu/Debian (Recommended - using rbenv, not apt):**
```bash
# Install rbenv to manage Ruby versions
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/main/bin/rbenv-installer | bash
echo 'eval "$(~/.rbenv/bin/rbenv init - bash)"' >> ~/.bashrc
source ~/.bashrc

# Install Ruby
rbenv install 3.1.0
rbenv global 3.1.0

# Verify Ruby installation
ruby --version  # Should show 3.1.0 or later
```

**Why not `apt install jekyll`?**
- System Jekyll may have conflicting gem versions
- The Gemfile specifies exact versions (jekyll ~> 4.3.2) that must match
- Bundler ensures consistent dependencies across environments

### 2. Node.js & npm
**Install nvm (Node Version Manager):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verify installation
node --version && npm --version
```

### 3. Install Project Dependencies

**Clone and navigate to project:**
```bash
git clone https://github.com/restaurant-lejardin/restaurant-lejardin.github.io.git
cd restaurant-lejardin.github.io
```

**Install Ruby gems (Jekyll and dependencies):**
```bash
bundle install
```

**Install npm packages:**
```bash
npm install
```

**Install Grunt CLI (if using Grunt):**
```bash
npm install -g grunt-cli
```

## Troubleshooting Installation

**Error: "Could not find jekyll-4.3.4" or similar gem errors**
```bash
# Clear Bundler cache and reinstall gems
cd /path/to/project
rm -rf vendor/ Gemfile.lock
bundle install
```

**Error: "http_parser.rb compilation error" or "native extension compilation failed"**
- This means build tools are missing. Install them:
```bash
# Ubuntu/Debian
sudo apt-get install build-essential ruby-dev

# macOS
brew install build-essential
```
Then retry: `bundle install`

**Error: "bundle: command not found"**
```bash
gem install bundler
```

**Error: Ruby version too old (< 2.7)**
```bash
# Update Ruby using rbenv
rbenv install 3.1.0
rbenv global 3.1.0
rbenv rehash
```

**Error: "System Jekyll version doesn't match Gemfile"**
- Don't use system Jekyll (`apt install jekyll`)
- Use Bundler with the Gemfile instead:
```bash
bundle exec jekyll serve  # NOT just "jekyll serve"
```

## Running the Site

**Preview locally:**
```bash
bundle exec jekyll serve
```
Site will be available at `http://localhost:4000`

**Build site:**
```bash
bundle exec jekyll build
```

**Run Grunt tasks (if needed):**
```bash
grunt build
```

## Deployment

### Automatic Deployment (Recommended)
Push to the main/master branch and GitHub Actions will automatically:
1. Build the site using Jekyll
2. Deploy to GitHub Pages via the `gh-pages` branch

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Manual Deployment (Legacy)
```bash
bash script.sh
git add .
git commit -m "Commit message"
git push
git subtree push --prefix dist origin gh-pages
```

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