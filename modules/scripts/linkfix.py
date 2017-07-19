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
                  'html': {'format': '<{start}src="{link}"{end}>',
                           'regex': re.compile(r'<(?P<start>[^><]*?)src\s*=\s*"(?P<link>.*?)"(?P<end>[^<]*?)>'),
                          },
                  }


def is_relative(path):
    """whether `path` is relative"""
    return not bool(urlparse(path).netloc)


def get_html_path(path, filetype):
    """
    Returns path with extension html if original extension is md or rst or
    if filetype is markdown and path has no extension at all.
    """
    basepath, ext = os.path.splitext(path)
    if ext in ('.md', '.rst') or (filetype == 'md' and ext == ''):
        return basepath + '.html'
    return path


def fixlink(link, level, filetype=None):
    if is_relative(link):
        link = get_html_path(link, filetype)
        splitted = [value for value in link.split('/') if value]
        if len(splitted) > level:
            splitted = splitted[level:]
        else:
            splitted = [os.pardir] * level + splitted
        link = '/'.join(splitted)
    return link


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

        link = fixlink(link, level, filetype)
        fmt_str = LINK_TEMPLATES[filetype]['format']
        output = fmt_str.format(title=title, link=link)
        if len(output) < length:
            # To ensure that the initial string is replaced by a string of
            # same length to avoid any formatting issues such as in tables.
            title = title + ' ' * (length - len(output))
            output = fmt_str.format(title=title, link=link)
        return output

    def fix_html(match_object):
        start = match_object.group('start')
        link = match_object.group('link').replace(os.path.sep, '/')
        end = match_object.group('end')

        link = fixlink(link, level, filetype)
        fmt_str = LINK_TEMPLATES['html']['format']
        output = fmt_str.format(start=start, link=link, end=end)
        return output

    content = re.sub(LINK_TEMPLATES['html']['regex'], fix_html, content)

    if filetype not in ('md', 'rst'):
        return content

    return re.sub(LINK_TEMPLATES[filetype]['regex'], fix, content)
