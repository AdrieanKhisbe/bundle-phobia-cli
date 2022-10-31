#!/bin/bash
set -e

ts=$(date +"%s")

E2E_FOLDER="$(dirname "$(realpath "$0")")"
mkdir -p $E2E_FOLDER/tmp
sandbox="$E2E_FOLDER/tmp/package-$ts"
output_file="$E2E_FOLDER/tmp/output-$ts"
cp -r $E2E_FOLDER/package $sandbox


args="lodash@4.12 --warn"
cat > $E2E_FOLDER/tmp/expected_output <<EXPECTED_OUTPUT
ℹ Applying a size limit of 20KB from argv and overall size limit of 50KB from argv

- Fetching stats for package lodash@4.12
⚠ Proceed to installation of packages lodash@4.12 despite following warnings:
⚠ lodash@4.12: size over threshold (63.65KB > 20KB)
⚠ global constraint is not respected: overall size after install would be over threshold (0B installed + 63.65KB > 50KB)
EXPECTED_OUTPUT

set +e
(cd $sandbox && node ../../../../index-install $args > $output_file 2> $output_file.err)
status_code=$?
set -e
head -6 $output_file > $output_file.head

if [ $status_code -ne 0 ]; then
    echo "❌ Install failed, returned with $status_code exit code"
    exit $status_code
fi


echo "Program was successful, checking output"
if ! diff $output_file.head $E2E_FOLDER/tmp/expected_output; then
    echo "❌ Output was not exactly the one expected, see output:"
    cat $output_file
    echo "See also stderr:"
    cat $output_file.err
    exit_status=2
else
    echo "✅ Output head as expected"
fi
if ! grep lodash $sandbox/package.json > /dev/null; then
    echo "❌ lodash was not installed it seems"
    exit_status=3
else
    echo "✅ Lodash seems installed"
fi

node_major=$(node <<< "console.log(process.versions.node.split('.')[0])")
case $node_major in
    8|10|12|14) expected_add_message="added 1 package from 3 contributors and audited 2 packages in";;
    16|18) expected_add_message="added 1 package, and audited 3 packages";;
    *) expected_add_message="><"; echo "No expected message for this major version";;
esac

# output from npm diverges between node 14 and 16
if ! cat $output_file | grep -q "$expected_add_message"; then
    exit_status=1
    echo "❌ audit message missing or different than expected (for node $node_major)"
else
    echo "✅ audit message present"
fi

rm -r $sandbox
if [ ${exit_status:-0} -eq 0 ]; then
    echo "🟢 Safety net got the expected results"
else
    echo "🛑 Safety net had unexpected results"
    exit $exit_status
fi
