import os
import sys
import argparse


def _is_samepath(path1, path2):
    return os.path.normpath(path1) == os.path.normpath(path2)


def get_include(dirpath, filename):
    ext = os.path.splitext(filename)[1]
    if ext == '.md':
        directive = 'mdinclude'
    else:
        directive = 'include'
    template = '.. {directive}:: {document}'
    path = os.path.relpath(os.path.join(dirpath, filename))
    document = path.replace(os.path.sep, '/')
    return template.format(directive=directive, document=document)


def get_toctree(dirpath, filenames):
    toctree = ['.. toctree::', '   :maxdepth: 1']
    caption_template = '   :caption: {caption}'
    content_template = '   {document}'

    caption = os.path.basename(dirpath).replace('_', ' ').title()
    if caption == os.curdir:
        caption = 'Contents'
    toctree.append(caption_template.format(caption=caption))
    # Inserting a blank line
    toctree.append('')

    valid = False
    for filename in filenames:
        path, ext = os.path.splitext(os.path.join(dirpath, filename))
        if ext not in ('.md', '.rst'):
            continue
        document = path.replace(os.path.sep, '/')
        document = document.lstrip('./').rstrip('/')
        toctree.append(content_template.format(document=document))
        valid = True

    if valid:
        return '\n'.join(toctree)
    else:
        return ''


def get_index(root):
    index = []

    # Include README from root
    root_files = next(os.walk(root))[2]
    if 'README.rst' in root_files:
        index.append(get_include(root, 'README.rst'))
    elif 'README.md' in root_files:
        index.append(get_include(root, 'README.md'))

    # Add toctrees as per the directory structure
    for (dirpath, dirnames, filenames) in os.walk(os.curdir):
        if 'source' in dirnames and _is_samepath(dirpath, os.curdir):
            dirnames.remove('source')
        if filenames:
            toctree = get_toctree(dirpath, filenames)
            if toctree:
                index.append(toctree)

    return '\n\n'.join(index) + '\n'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('root', help='Path to the root of the Repository')
    args = parser.parse_args()
    content = get_index(args.root)
    with open('index.rst', 'w') as file:
        file.write(content)

if __name__ == '__main__':
    main()
