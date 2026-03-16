import os
import sys

def list_files(startpath):
    for root, dirs, files in os.walk(startpath):
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        print('{}{}/'.format(indent, os.path.basename(root)))
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print('{}{}'.format(subindent, f))

if __name__ == "__main__":
    path = os.path.join(os.getcwd(), "public", "products")
    if os.path.exists(path):
        print(f"Listing files in {path}:")
        list_files(path)
    else:
        print(f"Directory {path} does not exist.")
