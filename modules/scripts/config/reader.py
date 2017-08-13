import os
from .configuration import Configuration

import yaml


class YAMLConfigurationReader(object):
    """Provides method to read yaml data from a file

    Parameters
    ----------
    file: str or file-like object
        Strings are considered to be a file name else it is assumed to be
        a file-like object.
    """
    def __init__(self, file):
        self._file = file

    def read(self):
        """Return a `Configuration` object read from the specified file"""
        if isinstance(self._file, str):
            try:
                with open(os.path.normpath(self._file), 'r') as file:
                    return Configuration(yaml.safe_load(file))
            except IOError:
                return Configuration()
        return Configuration(yaml.safe_load(self._file))
