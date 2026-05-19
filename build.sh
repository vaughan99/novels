#!/usr/bin/bash

# Clear the book.
echo "" > book.md

for file in "title.md" "prologue.md" "chapter1.md" "chapter2.md" "chapter3.md" "chapter4.md" "chapter5.md" "chapter6.md" "chapter7.md" "chapter8.md" "chapter9.md" "epilogue.md" "afterword.md"
do
    echo "Processing $file"
    echo "" >> book.md
    echo "---" >> book.md
    echo "" >> book.md
    cat $file >> book.md
done

echo "Coping MD to TXT"
cp book.md book.txt

# Need PDF Latex Generator
# echo "Generating PDF"
# pandoc book.md -o book.pdf

echo "Generating HTML"
pandoc ./book.md -s -o ./book.html
