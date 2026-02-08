for dir in backend frontend; do
  echo "==============================="
  echo "DIRECTORY: $dir"
  echo "==============================="
  find "$dir" -type f | while read file; do
    echo "--- $file ---"
    cat "$file"
    echo -e "\n"
  done
done
