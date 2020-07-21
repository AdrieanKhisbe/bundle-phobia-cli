#!/bin/bash
set -e

diff <(node index.js lodash@4.12) \
     <(echo "- Fetching stats for package lodash@4.12
ℹ lodash (4.12.0) has 0 dependencies for a weight of 63.65KB (22.11KB gzipped)")

for pattern in lodash react bluebird; do
    [[ $(node index.js lodash bluebird react | grep lodash | wc -l) -eq 2 ]]
    # one occurence for report, one other for  progress
done
[[ $(node index.js lodash bluebird react | grep total | wc -l) -eq 1 ]]
[[ $(node index.js lodash bluebird react | grep weight | wc -l) -eq 4 ]]
