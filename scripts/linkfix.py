"""This module contains methods to modify links in markup documents"""
import re
import os
try:
    # Python 2
    from urlparse import urlparse
except ImportError:
    # Python 3
    from urllib.parse import urlparse


LINK_TEMPLATES = {'rst': {'format': '`{title}<{link}>`',
                          'regex': re.compile(r'`(?P<title>[^`]*?)<(?P<link>[^`\n]*?)>`'),
                         },
                  'md': {'format': '[{title}]({link})',
                         'regex': re.compile(r'\[(?P<title>[^\[\]]*?)\]\((?P<link>[^)(]*?)\)'),
                        },
                 }

def is_relative(path):
    """whether `path` is relative"""
    return not bool(urlparse(path).netloc)

def get_html_path(path):
    """
    Returns path with extension html if original extension is md or rst or
    no extension at all. This method is meant to only be called for modifying
    markdown links.
    """
    basepath, ext = os.path.splitext(path)
    if ext in ('', '.md', '.rst'):
        return basepath + '.html'
    return path

def fix_relative_links(content, path):
    """
    Modifies any relative links according to the `path`

    Parameters
    ----------
    content: str
        string where modifications should be performed

    path: str
        path of the source file from which content was read
    """
    path_list = [value for value in path.replace(os.path.sep, '/').split('/')
                 if value]
    filetype = os.path.splitext(path)[1].lstrip('.')
    level = path_list.count(os.pardir)

    def fix(match_object):
        """Callback meant to be passed to re.sub"""
        length = len(match_object.group(0))
        title = match_object.group('title')
        link = match_object.group('link').replace(os.path.sep, '/')

        if is_relative(link):
            if filetype == 'md':
                link = get_html_path(link)
            # Split path into tokens ignoring starting and trailing slash
            splitted = [value for value in link.split('/') if value]
            if len(splitted) > level:
                splitted = splitted[level:]
            else:
                splitted = [os.pardir] * level + splitted

            link = '/'.join(splitted)

        fmt_str = LINK_TEMPLATES[filetype]['format']
        output = fmt_str.format(title=title, link=link)
        if len(output) < length:
            # To ensure that the initial string is replaced by a string of
            # same length to avoid any formatting issues such as in tables.
            title = title + ' ' * (length - len(output))
            output = fmt_str.format(title=title, link=link)
        return output

    try:
        regex = LINK_TEMPLATES[filetype]['regex']
    except KeyError:
        # filetype not in LINK_TEMPLATES. return content as it is
        return content

    return re.sub(regex, fix, content)
