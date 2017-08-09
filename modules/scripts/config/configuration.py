import sys
from .serializer import serialize


class Configuration(object):
    """Wrap a dictionary and provide certain helper methods.
    Adds ability to access nested values using dotted keys.

    Parameters
    ----------
    conf_dict: dict
        A dictionary which should be wrapped. If not provided, an empty
        configuration object is created.

    Examples
    --------
    >>> my_dict = {'key1': {'nestedkey1: 'value1'}, 'key2': 'value2'}
    >>> conf = Configuration(my_dict)
    >>> print(conf['key1.nestedkey1'])
    value1
    >>> print(conf['key2'])
    value2
    """
    def __init__(self, conf_dict=None):
        self._conf = conf_dict if conf_dict is not None else dict()
        self._connections = {}

    def __getitem__(self, key_string):
        data = self._conf
        for key in key_string.split('.'):
            if not isinstance(data, dict):
                raise KeyError("Error: Invalid key '{key}' in"
                               "key-string '{key_string}'".format(key=key,
                                                                  key_string=key_string))
            data = data[key]
        return data

    def __setitem__(self, key, value):
        self._conf[key] = value

    def __contains__(self, key_string):
        data = self._conf
        for key in key_string.split('.'):
            try:
                data = data[key]
            except KeyError:
                return False
        return True

    def as_dict(self):
        """Return a new copy of the internal dictionary"""
        return dict(self._conf)

    def connect(self, env_var, key_string, **kwargs):
        """Connect environment variables with dictionary keys.

        You can append an @ at the end of key_string to denote that the given
        field can take multiple values. Anything after the @ will be assumed
        to be an attribute which should be extracted from the list of those
        multiple values.

        Parameters
        ----------
        env_var: str
            The name of the environment variable.

        key_string: str
            Similar to the dotted key but also provides an extension
            where you can extract attributes from a list of dicts using @.

        contains: bool
            If true, will set whether the given key_string exists. `callback`,
            `default` will be ignored.

        default: object
            This will only be used with @ when the provided attribute is not
            present in a member of a list.

        callback: callable
            If present, the extracted value using the key_string will be
            passed to the callback. The callback's return value would be
            used as the new value
        """
        contains = kwargs.get('contains', False)
        default = kwargs.get('default', None)
        callback = kwargs.get('callback', None)
        validate = kwargs.get('validate', lambda x: True)
        try:
            ks_split = key_string.split('@')
            attr = ks_split[1]
            key_string = ks_split[0]
            multi_field = True
        except IndexError:
            multi_field = False

        if contains:
            data = key_string in self
        else:
            try:
                data = self[key_string]
            except KeyError:
                sys.stderr.write("Fatal: Missing key '{key}'\n".format(key=key_string))
                return
            if multi_field:
                if not isinstance(data, list):
                    data = [data]
                if attr:
                    data_ = []
                    for i, element in enumerate(data):
                        if not validate(element):
                            sys.stderr.write("Warning: '{element}' may not be a valid "
                                             "value for key '{key}.{attr}'\n".format(element=element.get(attr, None),
                                                                                     key=key_string,
                                                                                     attr=attr))
                            continue
                        try:
                            data_.append(element[attr])
                        except KeyError:
                            if default is None:
                                sys.stderr.write("Fatal: Missing attribute "
                                                 "'{attr}' in entry {eno} "
                                                 "for key '{key}'\n".format(attr=attr,
                                                                            eno=i,
                                                                            key=key_string))
                                return
                            else:
                                data_.append(default)
                    data = data_
                else:
                    if not validate(data):
                        sys.stderr.write("Warning: '{data}' is not a valid "
                                         "value for key '{key}'\n".format(data=data,
                                                                          key=key_string))
                        return
            else:
                if not validate(data):
                    sys.stderr.write("Warning: '{data}' is not a valid "
                                     "value for key '{key}'\n".format(data=data,
                                                                      key=key_string))
                    return
            if callback:
                try:
                    data = callback(data)
                except (KeyError, IndexError):
                    sys.stderr.write("Fatal: Error while parsing section '{section}'\n".format(section=data))
                    return
        self._connections[env_var] = data

    def getenv(self, seperator=','):
        """Return a dict with the connected environment variables as keys
        and the extracted values as values"""

        dict_ = {}
        for envvar, value in self._connections.items():
            dict_[envvar] = serialize(value)
        return dict_

    def get(self, key_string, default=None):
        """Similar to the dict's get method"""
        try:
            return self[key_string]
        except KeyError:
            return default
