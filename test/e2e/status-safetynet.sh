#!/bin/bash
set -e

diff <(node main.js lodash@4.12 | sed 's/[0-9.]*KB/XXXKB/g' | sed 's/\x1b\[[0-9;]*m//g') \
     <(echo "- Fetching stats for package lodash@4.12
ℹ lodash (4.12.0) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)")

for pattern in lodash react bluebird; do
    [[ $(node main.js lodash bluebird react | grep lodash | wc -l) -eq 2 ]]
    # one occurence for report, one other for  progress
done
[[ $(node main.js lodash bluebird react | grep total | wc -l) -eq 1 ]]
[[ $(node main.js lodash bluebird react | grep weight | wc -l) -eq 4 ]]
