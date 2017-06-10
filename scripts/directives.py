"""This module contains implementations of some custom directives"""
import functools
from sphinx.directives import Include as BaseInclude
from docutils import io
from md2rst import md2rst
from linkfix import fix_relative_links


OriginalFileInput = io.FileInput # pylint: disable=invalid-name


def patch_fileinput(fileinput):
    """
    Return a decorator which replaces `docutils.io.FileInput` with `fileinput`
    """
    def decorator(function):
        # pylint: disable=missing-docstring
        @functools.wraps(function)
        def wrapper(*args, **kwargs):
            # pylint: disable=missing-docstring
            temp = io.FileInput
            io.FileInput = fileinput
            return_value = function(*args, **kwargs)
            io.FileInput = temp
            return return_value
        return wrapper
    return decorator


class FileInput(OriginalFileInput): # pylint: disable=too-few-public-methods
    """
    Input for single, simple file-like objects.
    """
    def read(self):
        """
        Read and decode a single file and return the data. Returns content
        with relative links modified as per `source_path`
        """
        content = OriginalFileInput.read(self)
        return fix_relative_links(content, self.source_path)


class MarkdownFileInput(FileInput): # pylint: disable=too-few-public-methods
    """
    Input for single, simple file-like objects with markdown content.
    """
    def read(self):
        """
        Read and decode a single markdown file and return equivalent
        reStructuredText using pandoc.
        """
        content = FileInput.read(self)
        return md2rst(content)


class Include(BaseInclude): # pylint: disable=too-few-public-methods
    """
    Include content read from a separate source file.

    Content may be parsed by the parser, or included as a literal
    block.  The encoding of the included file can be specified.  Only
    a part of the given file argument may be included by specifying
    start and end line or text to match before and/or after the text
    to be used.
    """
    @patch_fileinput(FileInput)
    def run(self):
        """Include a file as part of the content of this reST file."""
        return BaseInclude.run(self)


class MdInclude(BaseInclude): # pylint: disable=too-few-public-methods
    """
    Include markdown content read from a separate source file.

    Content may be parsed by the parser, or included as a literal
    block.  The encoding of the included file can be specified.  Only
    a part of the given file argument may be included by specifying
    start and end line or text to match before and/or after the text
    to be used.
    """
    @patch_fileinput(MarkdownFileInput)
    def run(self):
        """Include a markdown file as part of the content of this reST file."""
        return BaseInclude.run(self)
