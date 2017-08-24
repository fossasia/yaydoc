import os
import argparse
from config.serializer import deserialize


def _title(value):
    return value.replace('_', ' ').title()


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


def get_toctree(dirpath, filenames, level, caption=''):
    content_template = '   {document}'
    if not caption:
        caption = _title(os.path.basename(dirpath))
        if caption == os.curdir:
            caption = os.environ.get('AUTOINDEX_TOC_HEADING', 'Contents')

    toctree = [get_heading(caption, level)]
    toctree.append('')
    toctree.append('.. toctree::')
    toctree.append('   :maxdepth: 1')
    # Inserting a blank line
    toctree.append('')

    valid = False
    for filename in filenames:
        path, ext = os.path.splitext(os.path.join(dirpath, filename))
        if ext not in ('.md', '.rst'):
            continue
        document = path.replace(os.path.sep, '/').rstrip('/')
        if document.startswith('./'):
            document = document[2:]
        toctree.append(content_template.format(document=document))
        valid = True

    if valid:
        return '\n'.join(toctree)
    else:
        return ''


# Any files ignored will not be included in a toctree
def _ignore_files(dirpath, filenames, ignored_filenames, path=None):
    if path is None or os.path.samefile(dirpath, path):
        for filename in ignored_filenames:
            if filename in filenames:
                filenames.remove(filename)



# Any directories ignored will not be walked through to find source files
def _ignore_dirs(dirpath, dirnames, ignored_dirnames, path=None):
    if path is None or os.path.samefile(dirpath, path):
        for dirname in ignored_dirnames:
            if dirname in dirnames:
                dirnames.remove(dirname)


def get_heading(text, level=1):
    headings = {1: "=",
                2: "-",
                3: "~",
                4: "^",
                5: "'"
    }
    return "{text}\n{underline}".format(text=text, underline=headings.get(level, "") * len(text))


def get_javadoc():
    return "* `Javadoc <./javadoc>`_"


def get_index(root, subprojects, sub_docpaths, javadoc):
    index = []

    subproject_dirs = [subproject.split(os.path.sep)[0]
                       for subproject in subprojects]

    included_files = []
    # Include files from the root
    root_files = next(os.walk(root))[2]
    for filename in deserialize(os.environ.get('AUTOINDEX_INCLUDE_FILES', '[]')):
        if filename in root_files:
            included_files.append(filename)
            index.append(get_include(root, filename))

    if deserialize(os.environ.get('AUTOINDEX_INCLUDE_TOC', 'true')):
        # Add toctrees as per the directory structure
        for (dirpath, dirnames, filenames) in os.walk(os.curdir):
            _ignore_files(dirpath, filenames, included_files, root)
            _ignore_files(dirpath, filenames, filter(lambda x: x.startswith('.'), filenames))
            _ignore_dirs(dirpath, dirnames, filter(lambda x: x.startswith('.'), dirnames))
            _ignore_dirs(dirpath, dirnames, ['yaydoctemp', 'yaydocclone'])
            _ignore_dirs(dirpath, dirnames, ['source'] + subproject_dirs, os.curdir)

            if filenames:
                toctree = get_toctree(dirpath, filenames, 1)
                if toctree:
                    index.append(toctree)

    if deserialize(os.environ.get('AUTOINDEX_INCLUDE_SUBPROJECT', 'true')):
        # Add title sub project
        if subprojects:
            index.append(get_heading(os.environ.get('AUTOINDEX_SUBPROJECT_HEADING',
                                                    'Sub Projects'), 1))

        # Add links to sub projects
        for subproject, sub_docpath in zip(subprojects, sub_docpaths):
            sub_index_path = os.path.normpath(os.path.join(subproject, sub_docpath,
                                                           'index.rst'))
            toctree = get_toctree(os.curdir, [sub_index_path], 2,
                                  _title(subproject.split(os.path.sep)[0]))
            index.append(toctree)

    if deserialize(os.environ.get('AUTOINDEX_INCLUDE_APIDOC', 'true')):
        include_javadoc = deserialize(os.environ.get('AUTOINDEX_INCLUDE_JAVADOC', 'true'))

        if (javadoc and include_javadoc):
            index.append(get_heading(os.environ.get('AUTOINDEX_APIDOC_HEADING', 'API Documentation'), 1))

        # Add javadoc if javadoc exist
        if javadoc and include_javadoc:
            index.append(get_javadoc())

    return '\n\n'.join(index) + '\n'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('root', help='Path to the root of the Repository')
    parser.add_argument('-s', '--subprojects', default='',
                        help='Comma seperated subprojects')
    parser.add_argument('-j', '--javadoc', default='',
                        help='Path of java source files for Javadoc')
    parser.add_argument('-d', '--sub-docpaths', default='',
                        help='Comma seperated docpaths for subprojects')
    args = parser.parse_args()
    subprojects, sub_docpaths = [], []
    javadoc = args.javadoc
    if args.subprojects:
        subprojects = [name.strip().replace('/', os.path.sep)
                       for name in deserialize(args.subprojects)]
    if args.sub_docpaths:
        sub_docpaths = [name.strip().replace('/', os.path.sep)
                        for name in deserialize(args.sub_docpaths)]
    if len(subprojects) != len(sub_docpaths):
        raise ValueError("Invalid arguments")
    content = get_index(args.root, subprojects, sub_docpaths, javadoc)
    with open('index.rst', 'w') as file:
        file.write(content)


if __name__ == '__main__':
    main()
