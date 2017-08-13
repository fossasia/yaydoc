import re
import mimetypes


def validate_markdown_flavour(value):
    return value in ('markdown', 'markdown_strict', 'markdown_phpextra',
                     'markdown_github', 'markdown_mmd', 'commonmark')


def validate_mimetype_image(value):
    # Empty string is also valid
    if not value:
        return True
    mimetype = mimetypes.guess_type(value)[0]
    if mimetype is None:
        return False
    else:
        return mimetype.startswith('image')


def validate_subproject(value):
    regex = '(http|https)://(www.|)github.com/([\w\d\.]+)/([\w\d\.]+)(.git|)'
    return re.match(regex, value['url']) != None
