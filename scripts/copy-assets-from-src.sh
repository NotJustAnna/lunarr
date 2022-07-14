#!/usr/bin/env bash

find src -type f ! -name '*.ts' | while IFS= read -r l; do
  t=dist/${l#*/}
  mkdir -p "${t%/*}" && cp -r "$l" "$t"
done

