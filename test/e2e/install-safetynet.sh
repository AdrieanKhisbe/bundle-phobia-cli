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

(cd $sandbox && node ../../../../index-install $args > $output_file 2> $output_file.err)

echo "Program was successful, checking output"
if ! diff $output_file $E2E_FOLDER/tmp/expected_output; then
    echo output was not exactly the one expected, see output:
    cat $output_file
    echo "See also stderr:"
    cat $output_file.err
    exit 2
fi
if ! grep lodash $sandbox/package.json > /dev/null; then
    echo lodash was not installed it seems
    exit 3
fi
echo "Safety net got the expected results"

rm -r $sandbox
