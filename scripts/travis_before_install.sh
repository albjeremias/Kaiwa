set -e

# Thanks to http://stackoverflow.com/a/24067243/2684760 for version_gt.
function version_gt() {
    test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1";
}

NPM_VERSION=$(npm --version)
if ! version_gt $NPM_VERSION 3 ; then
    npm install -g npm@^3
fi
